import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const invalidateSource = app.match(/function invalidateGalleryListsByStatus[\s\S]*?(?=function resetUserSessionCaches)/)?.[0];
const submitSource = app.match(/async function submitAnswer[\s\S]*?(?=async function toggleLike)/)?.[0];
const gallerySource = app.match(/function galleryListKey[\s\S]*?(?=async function adminDeleteDrawing)/)?.[0];
const expireSource = app.match(/function expireOldDrawings[\s\S]*?(?=async function loadOpenDrawings)/)?.[0];
assert.ok(invalidateSource && submitSource && gallerySource && expireSource, "v1.1.3 sources must be readable");

function cacheState() {
  return {
    galleryLists: {
      "solved:new": ["old-new"],
      "solved:old": ["old-old"],
      "solved:popular": ["old-popular"],
      "expired:new": ["expired-new"],
      "expired:old": ["expired-old"],
      "expired:popular": ["expired-popular"],
      "open:new": ["open"]
    },
    galleryMetadata: { solved: ["solved-metadata"], expired: ["expired-metadata"] },
    galleryMetadataPromises: {},
    expirySweepPromise: null,
    expirySweepCompletedAt: 0,
    cacheGeneration: 0,
    thumbnailCache: new Map([["drawing", "thumbnail"]]),
    detailImageCache: new Map([["drawing", "detail"]]),
    likeCache: new Map([["drawing", { count: 1, liked: true }]])
  };
}

function invalidator(state) {
  return Function("state", `"use strict"; ${invalidateSource}; return invalidateGalleryListsByStatus;`)(state);
}

{
  const state = cacheState();
  invalidator(state)("solved");
  assert.equal(state.galleryLists["solved:new"], undefined);
  assert.equal(state.galleryLists["solved:old"], undefined);
  assert.equal(state.galleryLists["solved:popular"], undefined);
  assert.deepEqual(state.galleryLists["expired:new"], ["expired-new"]);
  assert.deepEqual(state.galleryLists["expired:old"], ["expired-old"]);
  assert.deepEqual(state.galleryLists["expired:popular"], ["expired-popular"]);
  assert.deepEqual(state.galleryLists["open:new"], ["open"]);
  assert.equal(state.galleryMetadata.solved, undefined);
  assert.deepEqual(state.galleryMetadata.expired, ["expired-metadata"]);
  assert.equal(state.thumbnailCache.get("drawing"), "thumbnail");
  assert.equal(state.detailImageCache.get("drawing"), "detail");
  assert.deepEqual(state.likeCache.get("drawing"), { count: 1, liked: true });
  assert.doesNotThrow(() => invalidator({ galleryLists: {} })("solved"));
}

function submitHarness({ drawing, answer = "정답", transactionMode = "normal", claimError = null }) {
  const state = { ...cacheState(), user: { id: "solver", nickname: "풀이자" } };
  const invalidations = [];
  const claims = [];
  const invalidateGalleryListsByStatus = status => {
    invalidations.push(status);
    invalidator(state)(status);
  };
  const drawingRef = {
    once: async () => ({ val: () => drawing }),
    transaction: async update => {
      if (transactionMode === "error") throw new Error("transaction failed");
      const next = update(drawing);
      if (transactionMode === "uncommitted" || next === undefined) {
        return { committed: false, snapshot: { val: () => drawing } };
      }
      return { committed: true, snapshot: { val: () => next } };
    }
  };
  const dependencies = {
    resolveDrawingId: async id => id,
    db: { ref: () => drawingRef },
    serverNow: () => 2_000,
    loadRecentSolverSuccessCount: async () => 0,
    solverRewardFor: () => 10,
    state,
    drawerName: value => value.drawerNickname || "그린이",
    isOwnDrawing: value => value.drawerId === state.user.id,
    safeObject: value => value && typeof value === "object" ? value : {},
    normalizeAnswer: value => String(value || "").trim().normalize("NFC").replace(/\s+/g, "").toLowerCase(),
    claimAnswerRewards: async (id, value) => {
      claims.push([id, value]);
      if (claimError) throw claimError;
    },
    invalidateGalleryListsByStatus
  };
  const names = Object.keys(dependencies);
  const submitAnswer = Function(...names, `"use strict"; ${submitSource}; return submitAnswer;`)(...names.map(name => dependencies[name]));
  return { state, invalidations, claims, run: () => submitAnswer("drawing", answer, false) };
}

const openDrawing = {
  status: "open", drawerId: "drawer", drawerNickname: "그린이", solverId: null,
  word: "정답", answers: ["정답", "허용 정답"], expiresAt: 3_000, revisionCount: 0, likeCount: 0
};

{
  const harness = submitHarness({ drawing: openDrawing });
  const result = await harness.run();
  assert.equal(result.correct, true);
  assert.deepEqual(harness.invalidations, ["solved"]);
  assert.equal(harness.state.galleryLists["solved:new"], undefined);
  assert.equal(harness.claims.length, 1);
}

{
  const solved = { ...openDrawing, status: "solved", solverId: "solver", solverReward: 10, drawerReward: 30 };
  const harness = submitHarness({ drawing: solved });
  const result = await harness.run();
  assert.equal(result.correct, true);
  assert.deepEqual(harness.invalidations, ["solved"]);
  assert.equal(harness.claims.length, 1);
}

for (const scenario of [
  { name: "wrong answer", drawing: openDrawing, answer: "오답" },
  { name: "own drawing", drawing: { ...openDrawing, drawerId: "solver" } },
  { name: "other solver", drawing: { ...openDrawing, status: "solved", solverId: "other" } },
  { name: "missing drawing", drawing: null },
  { name: "uncommitted race", drawing: openDrawing, transactionMode: "uncommitted" }
]) {
  const harness = submitHarness(scenario);
  const result = await harness.run();
  assert.equal(result.correct, false, scenario.name);
  assert.deepEqual(harness.invalidations, [], `${scenario.name} must preserve solved caches`);
  assert.ok(harness.state.galleryLists["solved:new"], scenario.name);
}

{
  const harness = submitHarness({ drawing: openDrawing, transactionMode: "error" });
  await assert.rejects(harness.run(), /transaction failed/);
  assert.deepEqual(harness.invalidations, []);
}

{
  const harness = submitHarness({ drawing: openDrawing, claimError: new Error("claim failed") });
  await assert.rejects(harness.run(), /claim failed/);
  assert.equal(harness.state.galleryLists["solved:new"], undefined, "status cache must clear before reward claiming");
}

{
  const state = { ...cacheState(), galleryTab: "solved", gallerySort: "new", galleryIndex: 0, galleryView: "thumb", galleryScroll: {} };
  const loads = [];
  const dependencies = {
    state,
    beginScreenRequest: () => ({ routeName: "gallery", requestId: 1, transitionId: 1 }),
    isScreenRequestCurrent: () => true,
    isConfigured: () => true,
    appEl: { innerHTML: "" },
    loading: () => {},
    loadGalleryDrawings: async () => { loads.push(`${state.galleryTab}:${state.gallerySort}`); return [{ id: "new-solved" }]; },
    renderGalleryContent: () => {},
    bindGalleryShell: () => {},
    performance: { now: () => 0 },
    requestAnimationFrame: callback => callback(),
    scrollTo: () => {},
    emptyHtml: () => ""
  };
  dependencies.invalidateGalleryListsByStatus = invalidator(state);
  const names = Object.keys(dependencies);
  const renderGallery = Function(...names, `"use strict"; ${gallerySource}; return renderGallery;`)(...names.map(name => dependencies[name]));
  const invalidate = invalidator(state);
  for (const sort of ["new", "old", "popular"]) {
    state.gallerySort = sort;
    invalidate("solved");
    await renderGallery();
    assert.deepEqual(state.galleryLists[`solved:${sort}`], [{ id: "new-solved" }]);
  }
  assert.deepEqual(loads, ["solved:new", "solved:old", "solved:popular"]);
}

async function runExpiration({ expired }) {
  const state = cacheState();
  const invalidations = [];
  const drawing = { status: "open", solverId: null, expiresAt: expired ? 1_000 : 3_000 };
  const child = {
    key: "drawing",
    val: () => drawing,
    ref: {
      transaction: async update => {
        const next = update(drawing);
        return { committed: next !== undefined, snapshot: { val: () => next ?? drawing } };
      }
    }
  };
  const snapshot = { forEach: callback => callback(child) };
  const query = { equalTo: () => query, once: async () => snapshot };
  const db = { ref: () => ({ orderByChild: () => query }) };
  const invalidateGalleryListsByStatus = status => { invalidations.push(status); invalidator(state)(status); };
  const expireOldDrawings = Function("state", "db", "serverNow", "invalidateGalleryListsByStatus", "EXPIRY_SWEEP_INTERVAL_MS", "console", `"use strict"; ${expireSource}; return expireOldDrawings;`)(state, db, () => 2_000, invalidateGalleryListsByStatus, 60_000, { warn() {} });
  await expireOldDrawings({ force: true });
  return { state, invalidations };
}

{
  const changed = await runExpiration({ expired: true });
  assert.deepEqual(changed.invalidations, ["expired"]);
  assert.equal(changed.state.galleryLists["expired:new"], undefined);
  assert.equal(changed.state.galleryLists["expired:old"], undefined);
  assert.equal(changed.state.galleryLists["expired:popular"], undefined);
  const unchanged = await runExpiration({ expired: false });
  assert.deepEqual(unchanged.invalidations, []);
  assert.ok(unchanged.state.galleryLists["expired:new"]);
}

assert.doesNotMatch(invalidateSource, /thumbnailCache|detailImageCache|likeCache/);
console.log("v1.1.3 gallery cache checks passed.");
