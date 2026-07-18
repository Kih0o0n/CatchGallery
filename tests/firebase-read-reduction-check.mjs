import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const rules = JSON.parse(fs.readFileSync(new URL("../database.rules.json", import.meta.url), "utf8"));

function pick(name) {
  const markers = [`function ${name}(`, `async function ${name}(`];
  const asyncStart = source.indexOf(markers[1]);
  const start = asyncStart >= 0 ? asyncStart : source.indexOf(markers[0]);
  assert.notEqual(start, -1, `${name} must exist`);
  const parametersStart = source.indexOf("(", start);
  let parameterDepth = 0, bodyStart = -1;
  for (let i = parametersStart; i < source.length; i++) {
    if (source[i] === "(") parameterDepth++;
    else if (source[i] === ")" && --parameterDepth === 0) { bodyStart = source.indexOf("{", i); break; }
  }
  let depth = 0;
  for (let i = bodyStart; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`could not extract ${name}`);
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
function makeSnapshot(records = {}, transaction = null) {
  return {
    val: () => records,
    forEach(callback) {
      for (const [key, value] of Object.entries(records)) {
        callback({
          key,
          val: () => value,
          ref: { transaction: (...args) => transaction ? transaction(key, value, ...args) : Promise.resolve({ committed: false, snapshot: { val: () => value } }) }
        });
      }
    }
  };
}
function expiryHarness() {
  let now = 10_000, reads = 0, invalidations = 0;
  const warnings = [];
  let nextRead = Promise.resolve(makeSnapshot());
  const state = { expirySweepPromise: null, expirySweepCompletedAt: 0, cacheGeneration: 1 };
  const query = { equalTo: value => { assert.equal(value, "open"); return query; }, once: () => { reads++; return nextRead; } };
  const db = { ref: path => { assert.equal(path, "drawings"); return { orderByChild: key => { assert.equal(key, "status"); return query; } }; } };
  const api = Function(
    "state", "db", "serverNow", "invalidateGalleryListsByStatus", "EXPIRY_SWEEP_INTERVAL_MS", "console",
    `"use strict"; ${pick("expireOldDrawings")}; ${pick("loadOpenDrawings")}; return { expireOldDrawings, loadOpenDrawings };`
  )(state, db, () => now, () => { invalidations++; }, 60_000, { warn: (...args) => warnings.push(args) });
  return {
    state, warnings, ...api,
    setNow: value => { now = value; },
    setRead: promise => { nextRead = promise; },
    get reads() { return reads; },
    get invalidations() { return invalidations; }
  };
}

{
  const h = expiryHarness();
  const gate = deferred(); h.setRead(gate.promise);
  const first = h.expireOldDrawings();
  const second = h.expireOldDrawings();
  assert.equal(first, second, "concurrent expiry calls must share the same promise");
  assert.equal(h.reads, 1);
  gate.resolve(makeSnapshot());
  await first;
  assert.equal(h.state.expirySweepPromise, null);
  assert.equal(h.state.expirySweepCompletedAt, 10_000);

  await h.expireOldDrawings();
  assert.equal(h.reads, 1, "successful sweeps are throttled for 60 seconds");
  h.setNow(70_001); h.setRead(Promise.resolve(makeSnapshot()));
  await h.expireOldDrawings();
  assert.equal(h.reads, 2);
}

{
  const h = expiryHarness();
  h.setRead(Promise.reject(new Error("open query failed")));
  await assert.rejects(h.expireOldDrawings(), /open query failed/);
  assert.equal(h.state.expirySweepCompletedAt, 0);
  assert.equal(h.state.expirySweepPromise, null);
  assert.equal(h.invalidations, 0);
  h.setRead(Promise.resolve(makeSnapshot()));
  await h.expireOldDrawings();
  assert.equal(h.reads, 2, "a failed sweep must be retryable");
}

function transactionSnapshot(outcomes) {
  const records = Object.fromEntries(Object.keys(outcomes).map((key, index) => [key, { status: "open", solverId: null, expiresAt: 1_000 + index }]));
  return makeSnapshot(records, async (key, value, update) => {
    const outcome = outcomes[key];
    if (outcome === "reject") throw new Error(`transaction failed: ${key}`);
    const updated = update(value);
    if (outcome === "uncommitted") return { committed: false, snapshot: { val: () => value } };
    return { committed: true, snapshot: { val: () => updated } };
  });
}

{
  const h = expiryHarness();
  const snapshot = transactionSnapshot({ drawingA: "success", drawingB: "reject" });
  h.setRead(Promise.resolve(snapshot));
  const result = await h.expireOldDrawings();
  assert.equal(h.reads, 1);
  assert.equal(result.snapshot, snapshot, "partial transaction failure must preserve the open snapshot");
  assert.equal(result.changed, true); assert.equal(result.failedTransactions, 1);
  assert.equal(h.invalidations, 1, "a successful expiry must invalidate caches despite another rejection");
  assert.equal(h.state.expirySweepCompletedAt, 0);
  assert.equal(h.state.expirySweepPromise, null);
  assert.ok(h.warnings.some(args => args.includes("drawingB")), "rejected transactions must be logged with their drawing ID");
  h.setRead(Promise.resolve(makeSnapshot()));
  await h.expireOldDrawings();
  assert.equal(h.reads, 2, "partial failure must retry without waiting 60 seconds");
  assert.equal(h.state.expirySweepCompletedAt, 10_000);
}

{
  const h = expiryHarness();
  h.setRead(Promise.resolve(transactionSnapshot({ drawingA: "success", drawingB: "uncommitted" })));
  const result = await h.expireOldDrawings();
  assert.equal(result.changed, true); assert.equal(result.failedTransactions, 0);
  assert.equal(h.invalidations, 1);
  assert.equal(h.state.expirySweepCompletedAt, 10_000, "uncommitted work does not make an otherwise completed sweep fail");
  assert.equal(h.state.expirySweepPromise, null);
}

{
  const h = expiryHarness();
  h.setRead(Promise.resolve(transactionSnapshot({ drawingA: "reject", drawingB: "reject" })));
  const list = await h.loadOpenDrawings("new");
  assert.deepEqual(list, [], "solve can still filter the returned open snapshot after all transactions reject");
  assert.equal(h.invalidations, 0); assert.equal(h.state.expirySweepCompletedAt, 0);
  assert.equal(h.state.expirySweepPromise, null);
  assert.equal(h.warnings.filter(args => args[0].includes("transaction")).length, 2);
  h.setRead(Promise.resolve(makeSnapshot()));
  await h.expireOldDrawings();
  assert.equal(h.reads, 2, "all rejected transactions must be immediately retryable");
}

function solveHarness(sort) {
  let reads = 0;
  const now = 5_000;
  const records = {
    newer: { status: "open", createdAt: 4, expiresAt: 8_000, imageReady: true },
    older: { status: "open", createdAt: 2, expiresAt: 9_000, imageData: "legacy" },
    expired: { status: "open", createdAt: 3, expiresAt: 1_000 },
    incomplete: { status: "open", createdAt: 1, expiresAt: 9_000, imageReady: false }
  };
  const snapshot = makeSnapshot(records, async (_key, value, update) => {
    const updated = update(value);
    return { committed: updated !== undefined, snapshot: { val: () => updated || value } };
  });
  const state = { expirySweepPromise: null, expirySweepCompletedAt: 0, cacheGeneration: 1, galleryLists: {}, galleryMetadata: {}, galleryMetadataPromises: {} };
  const query = { equalTo: () => query, once: async () => { reads++; return snapshot; } };
  const db = { ref: () => ({ orderByChild: () => query }) };
  const api = Function(
    "state", "db", "serverNow", "invalidateGalleryListsByStatus", "EXPIRY_SWEEP_INTERVAL_MS", "console",
    `"use strict"; ${pick("expireOldDrawings")}; ${pick("loadOpenDrawings")}; return { expireOldDrawings, loadOpenDrawings };`
  )(state, db, () => now, () => {}, 60_000, { warn() {} });
  return { api, get reads() { return reads; }, sort };
}

for (const [sort, expected] of [["new", ["newer", "older"]], ["old", ["older", "newer"]]]) {
  const h = solveHarness(sort);
  const list = await h.api.loadOpenDrawings(sort);
  assert.equal(h.reads, 1, "solve must reuse the fresh expiry snapshot");
  assert.deepEqual(list.map(item => item.id), expected);
}

function galleryHarness() {
  const reads = { solved: 0, expired: 0 };
  const records = {
    solved: {
      a: { status: "solved", solvedAt: 20, imageReady: true, likeCount: 1 },
      b: { status: "solved", solvedAt: 10, imageReady: true, likeCount: 3 }
    },
    expired: { c: { status: "expired", expiredAt: 15, imageReady: true, likeCount: 0 } }
  };
  const state = { galleryMetadata: {}, galleryMetadataPromises: {}, galleryLists: {}, likeCache: new Map() };
  const db = { ref: () => ({ orderByChild: key => ({ equalTo: status => ({ once: async () => { assert.equal(key, "status"); reads[status]++; return makeSnapshot(records[status]); } }) }) }) };
  const ensureLikeState = async id => id === "a" ? { count: 5, liked: true } : { count: 3, liked: false };
  const api = Function(
    "state", "db", "expireOldDrawings", "ensureLikeState", "performance", "console",
    `"use strict"; ${pick("loadGalleryMetadata")}; ${pick("loadGalleryDrawings")}; return { loadGalleryMetadata, loadGalleryDrawings };`
  )(state, db, async () => ({}), ensureLikeState, { now: () => 0 }, { info() {} });
  return { state, reads, api };
}

{
  const h = galleryHarness();
  const newest = await h.api.loadGalleryDrawings("solved", "new");
  const oldest = await h.api.loadGalleryDrawings("solved", "old");
  const popular = await h.api.loadGalleryDrawings("solved", "popular");
  await h.api.loadGalleryDrawings("expired", "new");
  assert.equal(h.reads.solved, 1); assert.equal(h.reads.expired, 1);
  assert.deepEqual(newest.map(item => item.id), ["a", "b"]);
  assert.deepEqual(oldest.map(item => item.id), ["b", "a"]);
  assert.deepEqual(popular.map(item => item.id), ["a", "b"]);
  assert.deepEqual(h.state.galleryMetadata.solved.map(item => item.id), ["a", "b"], "sorting must not mutate canonical order");
}

{
  const state = {
    user: { id: "u" }, cacheOwnerUid: "u", cacheGeneration: 1,
    galleryLists: { "solved:new": [{ id: "a", likeCount: 1, isLiked: false }], "solved:old": [{ id: "a", likeCount: 1, isLiked: false }] },
    galleryMetadata: { solved: [{ id: "a", likeCount: 1, isLiked: false }] }, likeCache: new Map()
  };
  const db = { ref: () => ({ once: async () => ({ val: () => ({ u: true, other: true }) }) }) };
  const safeObject = value => value && typeof value === "object" ? value : {};
  const ensureLikeState = Function("state", "db", "safeObject", "isCacheSessionCurrent", `"use strict"; ${pick("ensureLikeState")}; return ensureLikeState;`)(state, db, safeObject, () => true);
  await ensureLikeState("a");
  assert.deepEqual(state.galleryLists["solved:new"][0], { id: "a", likeCount: 2, isLiked: true });
  assert.deepEqual(state.galleryLists["solved:old"][0], { id: "a", likeCount: 2, isLiked: true });
  assert.deepEqual(state.galleryMetadata.solved[0], { id: "a", likeCount: 2, isLiked: true });
}

{
  const state = {
    user: { id: "u" }, cacheOwnerUid: "u", cacheGeneration: 1,
    galleryLists: { "solved:new": [{ id: "a", likeCount: 1, isLiked: false }], "solved:old": [{ id: "a", likeCount: 1, isLiked: false }] },
    galleryMetadata: { solved: [{ id: "a", likeCount: 1, isLiked: false }] }, likeCache: new Map([["a", { count: 1, liked: false }]])
  };
  const db = { ref: () => ({ transaction: async update => { assert.equal(update(false), true); return { committed: true }; } }) };
  const toggleLike = Function(
    "state", "db", "performance", "isCacheSessionCurrent", "showToast", "console",
    `"use strict"; ${pick("toggleLike")}; return toggleLike;`
  )(state, db, { now: () => 0 }, () => true, () => {}, { info() {} });
  await toggleLike("a", { id: "a", status: "solved", drawerId: "other", imageReady: true });
  assert.deepEqual(state.galleryLists["solved:new"][0], { id: "a", likeCount: 2, isLiked: true });
  assert.deepEqual(state.galleryLists["solved:old"][0], { id: "a", likeCount: 2, isLiked: true });
  assert.deepEqual(state.galleryMetadata.solved[0], { id: "a", likeCount: 2, isLiked: true });
}

{
  const state = {
    galleryTab: "solved", gallerySort: "new", galleryIndex: 0, galleryView: "thumb", galleryScroll: {},
    galleryLists: { "solved:new": [{ id: "old" }], "solved:old": [{ id: "old" }], "expired:new": [{ id: "expired" }] },
    galleryMetadata: { solved: [{ id: "old" }], expired: [{ id: "expired" }] }, galleryMetadataPromises: {}
  };
  const invalidate = Function("state", `"use strict"; ${pick("invalidateGalleryListsByStatus")}; return invalidateGalleryListsByStatus;`)(state);
  let loads = 0;
  const renderGallery = Function(
    "state", "beginScreenRequest", "isConfigured", "isScreenRequestCurrent", "appEl", "invalidateGalleryListsByStatus", "loading", "loadGalleryDrawings", "renderGalleryContent", "bindGalleryShell", "performance", "requestAnimationFrame", "scrollTo", "emptyHtml",
    `"use strict"; ${pick("galleryListKey")}; ${pick("renderGallery")}; return renderGallery;`
  )(
    state, () => ({ routeName: "gallery", requestId: 1, transitionId: 1 }), () => true, () => true, { innerHTML: "" }, invalidate,
    () => {}, async () => { loads++; return [{ id: "fresh" }]; }, () => {}, () => {}, { now: () => 0 }, callback => callback(), () => {}, () => ""
  );
  await renderGallery(true);
  assert.equal(loads, 1);
  assert.deepEqual(state.galleryLists["solved:new"], [{ id: "fresh" }]);
  assert.equal(state.galleryLists["solved:old"], undefined);
  assert.equal(state.galleryMetadata.solved, undefined);
  assert.deepEqual(state.galleryLists["expired:new"], [{ id: "expired" }]);
  assert.deepEqual(state.galleryMetadata.expired, [{ id: "expired" }]);
}

{
  let refPath = "", orderKey = "", equalValue = "", onceCalls = 0;
  const state = { user: { id: "owner" } };
  const snapshot = makeSnapshot({
    ready: { drawerId: "owner", createdAt: 3, imageReady: true },
    legacy: { drawerId: "owner", createdAt: 2, imageData: "data:image/png;base64,legacy" },
    incomplete: { drawerId: "owner", createdAt: 4, imageReady: false },
    other: { drawerId: "other", createdAt: 5, imageReady: true }
  });
  const query = { equalTo: value => { equalValue = value; return query; }, once: async () => { onceCalls++; return snapshot; } };
  const db = { ref: path => { refPath = path; return { orderByChild: key => { orderKey = key; return query; } }; } };
  const loadManageDrawings = Function("state", "db", "expireOldDrawings", `"use strict"; ${pick("loadManageDrawings")}; return loadManageDrawings;`)(state, db, async () => ({}));
  const list = await loadManageDrawings();
  assert.equal(refPath, "drawings"); assert.equal(orderKey, "drawerId"); assert.equal(equalValue, "owner"); assert.equal(onceCalls, 1);
  assert.deepEqual(list.map(item => item.id), ["ready", "legacy"]);
}

assert.ok(rules.rules.drawings[".indexOn"].includes("status"));
assert.ok(rules.rules.drawings[".indexOn"].includes("drawerId"));

function rankingHarness(claims, drawings = {}) {
  const reads = { users: 0, scoreClaims: 0, drawings: 0 };
  const users = {
    u1: { nickname: "One", createdAt: 2, rankingDeleted: false },
    u2: { nickname: "Two", createdAt: 1, rankingDeleted: false }
  };
  const snapshots = { users: makeSnapshot(users), scoreClaims: { val: () => claims }, drawings: { val: () => drawings } };
  const db = { ref: path => ({ once: async () => { reads[path]++; return snapshots[path]; } }) };
  const state = { user: { id: "u1" }, cacheOwnerUid: "u1", cacheGeneration: 1, route: "ranking", rankingType: "total", rankingSnapshot: null, rankingSnapshotPromise: null };
  const api = Function(
    "state", "db", "safeObject", "claimType", "claimScore", "isCacheSessionCurrent",
    `"use strict"; ${pick("hasLegacyRankingClaims")}; ${pick("buildRankingSnapshot")}; ${pick("rankingListFromSnapshot")}; ${pick("loadRankingSnapshot")}; ${pick("loadRanking")}; return { loadRankingSnapshot, loadRanking, rankingListFromSnapshot };`
  )(
    state, db, value => value && typeof value === "object" ? value : {},
    (claim, drawing, userId) => claim && typeof claim === "object" && ["drawer", "solver"].includes(claim.type) ? claim.type : drawing?.solverId === userId ? "solver" : drawing?.drawerId === userId ? "drawer" : null,
    claim => typeof claim === "number" ? claim : Number(claim?.score) || 0,
    (uid, generation) => state.user?.id === uid && state.cacheOwnerUid === uid && state.cacheGeneration === generation
  );
  return { state, reads, api };
}

{
  const h = rankingHarness({
    u1: { a: { score: 10, type: "drawer", createdAt: 1 }, b: { score: 5, type: "solver", createdAt: 2 } },
    u2: { c: { score: 15, type: "drawer", createdAt: 1 } }
  });
  const total = await h.api.loadRanking("total");
  const drawer = await h.api.loadRanking("drawer");
  const solver = await h.api.loadRanking("solver");
  assert.deepEqual(h.reads, { users: 1, scoreClaims: 1, drawings: 0 });
  assert.deepEqual(total.map(user => [user.id, user.score]), [["u2", 15], ["u1", 15]]);
  assert.deepEqual(drawer.map(user => [user.id, user.score]), [["u2", 15], ["u1", 10]]);
  assert.deepEqual(solver.map(user => [user.id, user.score]), [["u1", 5], ["u2", 0]]);
  h.state.rankingSnapshot = null;
  await h.api.loadRanking("total");
  assert.deepEqual(h.reads, { users: 2, scoreClaims: 2, drawings: 0 }, "re-entering ranking after cleanup must refresh the snapshot");
}

{
  const rankingListFromSnapshot = Function("state", `"use strict"; ${pick("rankingListFromSnapshot")}; return rankingListFromSnapshot;`)({ rankingType: "total" });
  const snapshot = Array.from({ length: 31 }, (_, index) => ({ id: `u${index}`, createdAt: index, scores: { total: 10, drawer: 0, solver: 0 } }));
  const list = rankingListFromSnapshot(snapshot, "total");
  assert.equal(list.length, 30);
  assert.equal(list[0].id, "u0"); assert.equal(list[29].id, "u29", "ties retain createdAt ordering before the top-30 limit");
}

{
  const h = rankingHarness({ u1: { legacy: 7 }, u2: { modern: { score: 4, type: "solver", createdAt: 1 } } }, { legacy: { drawerId: "u1" } });
  await h.api.loadRanking("drawer");
  await h.api.loadRanking("solver");
  assert.deepEqual(h.reads, { users: 1, scoreClaims: 1, drawings: 1 });
}

{
  const usersGate = deferred(), claimsGate = deferred();
  const state = { user: { id: "u1" }, cacheOwnerUid: "u1", cacheGeneration: 1, route: "ranking", rankingSnapshot: null, rankingSnapshotPromise: null };
  const db = { ref: path => ({ once: () => path === "users" ? usersGate.promise : claimsGate.promise }) };
  const loadRankingSnapshot = Function(
    "state", "db", "safeObject", "claimType", "claimScore", "isCacheSessionCurrent",
    `"use strict"; ${pick("hasLegacyRankingClaims")}; ${pick("buildRankingSnapshot")}; ${pick("loadRankingSnapshot")}; return loadRankingSnapshot;`
  )(state, db, value => value && typeof value === "object" ? value : {}, () => null, claim => Number(claim?.score) || 0, () => true);
  const pending = loadRankingSnapshot();
  state.route = "home";
  state.rankingSnapshotPromise = null;
  usersGate.resolve(makeSnapshot({ u1: { nickname: "One", createdAt: 1 } }));
  claimsGate.resolve({ val: () => ({}) });
  await pending;
  assert.equal(state.rankingSnapshot, null, "a stale ranking response cannot repopulate a departed route");
}

{
  const state = { route: "ranking", rankingSnapshot: [{}], rankingSnapshotPromise: Promise.resolve([]), seenWordKeys: new Set(), editDrawing: null };
  const transitionRoute = Function(
    "state", "cleanupScreenResources", "history", "renderRoute", "setDrawViewportMode",
    `"use strict"; let routeTransitionId = 0; ${pick("transitionRoute")}; return transitionRoute;`
  )(state, () => {}, { pushState() {}, replaceState() {} }, () => {}, () => {});
  transitionRoute("home");
  assert.equal(state.rankingSnapshot, null); assert.equal(state.rankingSnapshotPromise, null);
}

console.log("Firebase list read reduction checks passed.");
