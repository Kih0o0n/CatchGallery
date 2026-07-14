import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const lifecycleSource = app.match(/function currentRenderToken[\s\S]*?(?=function showToast)/)?.[0];
const renderSolveSource = app.match(/async function renderSolve[\s\S]*?(?=function openDrawingCard)/)?.[0];
const galleryQueueSource = app.match(/function enqueueGalleryLoad[\s\S]*?(?=function observeGalleryThumbnails)/)?.[0];
const observeSource = app.match(/function observeGalleryThumbnails[\s\S]*?(?=async function ensureLikeState)/)?.[0];
const setupCanvasSource = app.match(/function setupCanvas[\s\S]*?(?=function saveHistory)/)?.[0];
const drawingHelperSource = app.match(/function resetDrawingDraft[\s\S]*?(?=function normalizeAnswer)/)?.[0];
assert.ok(lifecycleSource && renderSolveSource && galleryQueueSource && observeSource && setupCanvasSource && drawingHelperSource);

function lifecycleHarness(stateOverrides = {}) {
  const calls = { disconnected: 0, pushed: [], replaced: [], scrollUnlocks: 0 };
  const state = {
    route: "gallery", galleryView: "frame", galleryIndex: 7, galleryObserver: { disconnect: () => { calls.disconnected += 1; } },
    galleryLoadGeneration: 3, galleryLoadQueue: ["old"], galleryActiveLoads: 2, editImageGeneration: 9,
    canvas: { id: "canvas" }, ctx: { id: "ctx" }, history: ["undo"], drawing: true, activePointerId: 42, dirty: true, publishing: true,
    editDrawing: { id: "edit" }, word: { word: "old" }, seenWordKeys: new Set(["seen"]), renderGeneration: 0,
    ...stateOverrides
  };
  const history = { pushState: (...args) => calls.pushed.push(args), replaceState: (...args) => calls.replaced.push(args) };
  const helpers = Function("state", "history", "unlockDrawingScroll", `${lifecycleSource}; return { cleanupScreenResources, beginRouteTransition, currentRenderToken, isRenderCurrent };`)(state, history, () => { calls.scrollUnlocks += 1; });
  return { state, calls, ...helpers };
}

{
  const h = lifecycleHarness();
  h.cleanupScreenResources();
  h.cleanupScreenResources();
  assert.equal(h.calls.disconnected, 1, "cleanup may be called repeatedly without failing");
  assert.equal(h.state.galleryObserver, null);
  assert.equal(h.state.galleryLoadQueue.length, 0);
  assert.equal(h.state.galleryActiveLoads, 0);
  assert.equal(h.state.galleryLoadGeneration, 5);
  assert.equal(h.state.canvas, null);
  assert.equal(h.state.ctx, null);
  assert.deepEqual(h.state.history, []);
  assert.equal(h.state.drawing, false);
  assert.equal(h.state.activePointerId, null);
  assert.equal(h.state.editImageGeneration, 11);
}

{
  const h = lifecycleHarness({ route: "home", galleryObserver: null, galleryLoadQueue: [] });
  const token = h.beginRouteTransition("draw", { historyMode: "push" });
  assert.equal(token, 1);
  assert.deepEqual(h.calls.pushed[0], [{ route: "draw", galleryDetail: false }, "", "#draw"]);
  assert.equal(h.state.route, "draw");
  assert.deepEqual(h.state.word, { word: "old" }, "editing state keeps its word when entering draw");
  assert.equal(h.state.seenWordKeys.size, 0);
  h.beginRouteTransition("gallery", { historyMode: "none" });
  assert.equal(h.calls.pushed.length, 1, "popstate transition must reuse cleanup without pushing history");
  assert.equal(h.state.galleryView, "thumb");
}

{
  const state = { route: "draw", word: { word: "방금 제시어" }, editDrawing: null, seenWordKeys: new Set(["seen-word"]), canvas: null, ctx: null, drawing: false, activePointerId: null, dirty: false, history: [], publishing: false, drawingPublished: true };
  const calls = { render: 0 };
  const helpers = Function("state", "randomWord", "renderDraw", "route", "document", `${drawingHelperSource}; return { startNewDrawing };`)(state, () => { state.word = { word: "다음" }; }, () => { calls.render += 1; }, () => assert.fail("continuous drawing should not route away"), { querySelectorAll: () => [] });
  helpers.startNewDrawing({ preserveSeenWords: true });
  assert.equal(calls.render, 1);
  assert.ok(state.seenWordKeys.has("seen-word"), "continuous drawing keeps prompt history");
}

{
  const state = { renderGeneration: 1 };
  const writes = [];
  const renderSolve = Function("state", "currentRenderToken", "isRenderCurrent", "isConfigured", "loading", "sessionStorage", "loadOpenDrawings", "loadRecentSolverSuccessCount", "loadDrawingImage", "appEl", "emptyHtml", "openDrawingCard", "console", `${renderSolveSource}; return renderSolve;`)(
    state,
    () => state.renderGeneration,
    token => token === state.renderGeneration,
    () => true,
    () => {},
    { getItem: () => "new", setItem: () => {} },
    async () => [{ id: "a" }],
    async () => 0,
    async () => "image",
    { set innerHTML(value) { writes.push(value); }, get innerHTML() { return writes.at(-1); } },
    (_icon, text) => text,
    () => "card",
    { error: () => {} }
  );
  const promise = renderSolve({ token: 1 });
  state.renderGeneration = 2;
  await promise;
  assert.deepEqual(writes, [], "stale async renderer must not overwrite the current screen");
}

{
  const state = { galleryLoadQueue: [], galleryActiveLoads: 0, galleryLoadGeneration: 1 };
  const ran = [];
  const { enqueueGalleryLoad } = Function("state", "IMAGE_OPTIONS", `${galleryQueueSource}; return { enqueueGalleryLoad, runGalleryLoadQueue };`)(state, { maxConcurrentLoads: 1 });
  enqueueGalleryLoad(async () => { ran.push("old"); }, 0);
  enqueueGalleryLoad(async () => { ran.push("current"); }, 1);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(ran, ["current"], "stale gallery queue entries are invalidated after leaving the screen");
}

assert.match(observeSource, /generation !== state\.galleryLoadGeneration \|\| !image\.isConnected/);
assert.match(observeSource, /state\.galleryObserver\?\.disconnect\(\)/);
assert.match(setupCanvasSource, /editImageGeneration === state\.editImageGeneration/);
assert.match(setupCanvasSource, /canvas === state\.canvas && ctx === state\.ctx/);

console.log("route lifecycle checks passed.");
