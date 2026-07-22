import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const rules = readFileSync(new URL("../database.rules.json", import.meta.url), "utf8");
function pick(name) {
  const markers = [`async function ${name}(`, `function ${name}(`];
  const start = markers.map(marker => app.indexOf(marker)).find(index => index >= 0);
  assert.notEqual(start, undefined, `${name} must exist`);
  const bodyStart = app.indexOf("{", start);
  let depth = 0;
  for (let index = bodyStart; index < app.length; index++) {
    if (app[index] === "{") depth++;
    else if (app[index] === "}" && --depth === 0) return app.slice(start, index + 1);
  }
  throw new Error(`could not extract ${name}`);
}
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const snapshot = records => ({ forEach(callback) { for (const [key, value] of Object.entries(records)) callback({ key, val: () => value }); } });
const safeId = value => typeof value === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(value);
const publicImage = drawing => !!drawing?.imageData || drawing?.imageReady === true;
const helperNames = ["galleryDisplayTime", "sortGalleryDrawings", "finalizedDrawingFreshness", "currentRecentFinalizedDrawing", "applyCachedLikeToDrawing", "mergeRecentFinalizedDrawings", "cacheRecentFinalizedDrawing", "removeRecentFinalizedDrawing", "invalidateGalleryListsByStatus"];
const helperSource = helperNames.map(pick).join("\n");
const nowRef = { value: 2_000 };
const solvedX = { id: "drawing-x", status: "solved", imageReady: true, drawerId: "artist-a", drawerNickname: "작가A", solverId: "solver-a", solvedAt: 1_900, updatedAt: 1_900, likeCount: 0 };
const makeState = () => ({
  user: { id: "solver-a", nickname: "풀이자" }, cacheOwnerUid: "solver-a", cacheGeneration: 7,
  gallerySort: "new", galleryMetadata: {}, galleryMetadataPromises: {}, galleryLists: {},
  likeCache: new Map([["drawing-x", { count: 4, liked: true }]]), recentFinalizedDrawings: new Map()
});
function overlayApi(state, db = null) {
  return Function(
    "state", "db", "serverNow", "isSafeRecordId", "hasPublicDrawingImage", "RECENT_FINALIZED_DRAWING_TTL_MS", "RECENT_FINALIZED_DRAWING_MARKER", "performance", "console",
    `"use strict"; ${helperSource}\n${pick("loadGalleryMetadata")}\n${pick("loadGalleryDrawings")}; return { currentRecentFinalizedDrawing, mergeRecentFinalizedDrawings, cacheRecentFinalizedDrawing, removeRecentFinalizedDrawing, invalidateGalleryListsByStatus, loadGalleryMetadata, loadGalleryDrawings, sortGalleryDrawings };`
  )(state, db, () => nowRef.value, safeId, publicImage, 600_000, Symbol("recent-finalized-drawing"), { now: () => 0 }, { info() {} });
}
function queryDb(queries) {
  let index = 0;
  return { ref: () => ({ orderByChild: () => ({ equalTo: () => ({ once: () => queries[index++].promise }) }) }) };
}

// Stale empty solved query: the committed drawing remains authoritative and likeCache wins.
{
  const gate = deferred(); const state = makeState(); const api = overlayApi(state, queryDb([gate]));
  assert.equal(api.cacheRecentFinalizedDrawing("drawing-x", solvedX), true);
  api.invalidateGalleryListsByStatus("solved");
  const pending = api.loadGalleryMetadata("solved"); gate.resolve(snapshot({}));
  const list = await pending;
  assert.deepEqual(list.map(d => d.id), ["drawing-x"]);
  assert.deepEqual([list[0].likeCount, list[0].isLiked], [4, true]);
}

// In-flight query A cannot erase X after invalidation; query B is safe in A→B and B→A completion orders.
for (const order of ["A-B", "B-A"]) {
  const a = deferred(), b = deferred(); const state = makeState(); const api = overlayApi(state, queryDb([a, b]));
  const pendingA = api.loadGalleryMetadata("solved");
  api.invalidateGalleryListsByStatus("solved"); api.cacheRecentFinalizedDrawing("drawing-x", solvedX); api.invalidateGalleryListsByStatus("solved");
  const pendingB = api.loadGalleryMetadata("solved");
  if (order === "A-B") { a.resolve(snapshot({})); await pendingA; b.resolve(snapshot({})); }
  else { b.resolve(snapshot({})); await pendingB; a.resolve(snapshot({})); }
  const [listA, listB] = await Promise.all([pendingA, pendingB]);
  assert.equal(listA.some(d => d.id === "drawing-x"), true, `${order}: stale A must merge X`);
  assert.equal(listB.some(d => d.id === "drawing-x"), true, `${order}: stale B must merge X`);
  assert.equal(state.galleryMetadata.solved.filter(d => d.id === "drawing-x").length, 1, `${order}: current metadata must keep one X`);
}

// Normal server data reconciles the overlay without duplication.
{
  const gate = deferred(); const state = makeState(); const api = overlayApi(state, queryDb([gate]));
  api.cacheRecentFinalizedDrawing("drawing-x", solvedX); api.invalidateGalleryListsByStatus("solved");
  const pending = api.loadGalleryMetadata("solved"); gate.resolve(snapshot({ "drawing-x": { ...solvedX, id: undefined } }));
  const list = await pending;
  assert.equal(list.filter(d => d.id === "drawing-x").length, 1);
  assert.equal(state.recentFinalizedDrawings.size, 0, "confirmed server result reconciles the overlay");
}

// Cached full lists are upserted once and all sort modes are reapplied.
{
  const state = makeState(); const api = overlayApi(state);
  const older = { id: "older", status: "solved", imageReady: true, solverId: "other", solvedAt: 100, updatedAt: 100, likeCount: 2 };
  state.galleryMetadata.solved = [older];
  state.galleryLists = { "solved:new": [older], "solved:old": [older], "solved:popular": [older], "artist:anchor:new": [older] };
  api.cacheRecentFinalizedDrawing("drawing-x", solvedX);
  assert.deepEqual(state.galleryLists["solved:new"].map(d => d.id), ["drawing-x", "older"]);
  assert.deepEqual(state.galleryLists["solved:old"].map(d => d.id), ["older", "drawing-x"]);
  assert.deepEqual(state.galleryLists["solved:popular"].map(d => d.id), ["drawing-x", "older"]);
  assert.equal(state.galleryLists["artist:anchor:new"], undefined, "artist lists reload from merged metadata");
  assert.equal(state.galleryMetadata.solved.filter(d => d.id === "drawing-x").length, 1);
}

// Stale open query excludes only the same safe finalized ID.
{
  const state = makeState(); const api = overlayApi(state);
  api.cacheRecentFinalizedDrawing("drawing-x", solvedX);
  const openSnapshot = snapshot({ "drawing-x": { status: "open", imageReady: true, expiresAt: 9_000, createdAt: 2 }, "drawing-y": { status: "open", imageReady: true, expiresAt: 9_000, createdAt: 1 } });
  const loadOpenDrawings = Function(
    "state", "serverNow", "expireOldDrawings", "currentRecentFinalizedDrawing", "console",
    `"use strict"; ${pick("loadOpenDrawings")}; return loadOpenDrawings;`
  )(state, () => nowRef.value, async () => ({ snapshot: openSnapshot }), api.currentRecentFinalizedDrawing, { warn() {} });
  assert.deepEqual((await loadOpenDrawings("new")).map(d => d.id), ["drawing-y"]);
}

// Artist matching remains production UID-first with legacy nickname fallback.
{
  const artistFns = Function("drawerName", "isSafeRecordId", `"use strict"; ${pick("drawingOwnerId")}; ${pick("normalizedArtistName")}; ${pick("hasViewableArtist")}; ${pick("galleryArtistIdentity")}; ${pick("isDrawingByArtist")}; return { galleryArtistIdentity, isDrawingByArtist };`)(drawing => drawing.drawerNickname || "알 수 없음", safeId);
  const artist = artistFns.galleryArtistIdentity(solvedX);
  assert.equal(artistFns.isDrawingByArtist(solvedX, artist), true);
  assert.equal(artistFns.isDrawingByArtist({ ...solvedX, id: "other", drawerId: "artist-b" }, artist), false);
  assert.equal(artistFns.isDrawingByArtist({ ...solvedX, id: "legacy", drawerId: null }, artist), true);
}

// submitAnswer records only authoritative solved outcomes, including idempotent settled results.
async function submitScenario(current, { answer = "answer", committedOverride } = {}) {
  const state = { user: { id: "solver-a", nickname: "풀이자" } }; const recorded = [];
  const drawingRef = {
    once: async () => ({ val: () => current }),
    transaction: async update => { const next = update(current); const committed = committedOverride ?? next !== undefined; return { committed, snapshot: { val: () => committed ? next : current } }; }
  };
  const db = { ref: path => path === "drawings/drawing-x" ? drawingRef : { once: async () => ({ exists: () => true }) } };
  const submit = Function(
    "state", "db", "resolveDrawingId", "serverNow", "loadRecentSolverSuccessCount", "solverRewardFor", "safeObject", "normalizeAnswer", "isOwnDrawing", "drawerName", "invalidateGalleryListsByStatus", "cacheRecentFinalizedDrawing", "claimAnswerRewards",
    `"use strict"; ${pick("submitAnswer")}; return submitAnswer;`
  )(state, db, async () => "drawing-x", () => nowRef.value, async () => 0, () => 10, value => value || {}, value => String(value).trim().toLowerCase(), d => d.drawerId === state.user.id, d => d.drawerNickname || "작가", () => {}, (id, drawing) => { recorded.push([id, drawing]); return true; }, async () => {});
  return { result: await submit("drawing-x", answer, false), recorded };
}
const open = { status: "open", imageReady: true, drawerId: "artist-a", drawerNickname: "작가A", word: "answer", answers: ["answer"], expiresAt: 9_000 };
assert.equal((await submitScenario(open)).recorded[0][1].status, "solved");
assert.equal((await submitScenario({ ...open, status: "solved", solverId: "solver-a", solvedAt: 1_900, solverReward: 10, drawerReward: 30 })).recorded.length, 1);
assert.equal((await submitScenario(open, { answer: "wrong" })).recorded.length, 0);
assert.equal((await submitScenario(open, { committedOverride: false })).recorded.length, 0);
assert.equal((await submitScenario({ ...open, expiresAt: 1_000 })).recorded.length, 0);

// Overlay ownership, TTL, reset and admin removal protections are wired.
{
  const state = makeState(); const api = overlayApi(state); api.cacheRecentFinalizedDrawing("drawing-x", solvedX);
  state.cacheGeneration++; assert.equal(api.currentRecentFinalizedDrawing("drawing-x"), null);
  state.cacheGeneration--; api.cacheRecentFinalizedDrawing("drawing-x", solvedX); nowRef.value += 600_001; assert.equal(api.currentRecentFinalizedDrawing("drawing-x"), null);
  nowRef.value = 2_000; api.cacheRecentFinalizedDrawing("drawing-x", solvedX); api.removeRecentFinalizedDrawing("drawing-x"); assert.equal(state.recentFinalizedDrawings.size, 0);
}

assert.match(pick("resetUserSessionCaches"), /recentFinalizedDrawings\?\.clear\(\)/);
assert.match(pick("invalidateDrawingCachesAfterAdminDelete"), /removeRecentFinalizedDrawing\(drawingId\)/);
assert.doesNotMatch(app, /recentFinalizedDrawings[\s\S]{0,100}(localStorage|sessionStorage)/);
assert.doesNotMatch(app, /db\.ref\([^\n]+recentFinalized|recentFinalized[^\n]+db\.ref/);
assert.equal(createHash("sha256").update(rules).digest("hex"), "4451bba25c1447aa12deaddcdb3dfb1472430d1742daf42430a89f544e875493");
assert.match(app, /home-version[^\n]+v1\.5\.0/);

console.log("Solved gallery session refresh production checks passed: authoritative transaction state, stale metadata/open defense, races, sorting, likes, artist identity, reconciliation, and cleanup.");
