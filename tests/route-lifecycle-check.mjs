import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const requestSource = app.match(/function isTransitionCurrent[\s\S]*?(?=function formatTime)/)?.[0];
const cleanupSource = app.match(/function cleanupScreenResources[\s\S]*?(?=function transitionRoute)/)?.[0];
const transitionSource = app.match(/function transitionRoute[\s\S]*?(?=function route\()/)?.[0];
const loaderSource = app.match(/function createGalleryLoader[\s\S]*?(?=function observeGalleryThumbnails)/)?.[0];
const setupCanvasSource = app.match(/function setupCanvas[\s\S]*?(?=function saveHistory)/)?.[0];
assert.ok(requestSource && cleanupSource && transitionSource && loaderSource && setupCanvasSource);

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

{
  const state = { route: "solve" };
  const screenRequestIds = Object.create(null);
  const appEl = { innerHTML: "" };
  const api = Function("state", "screenRequestIds", "appEl", `let routeTransitionId = 1; ${requestSource}; return { beginScreenRequest, isScreenRequestCurrent, setTransition: value => routeTransitionId = value };`)(state, screenRequestIds, appEl);
  const first = api.beginScreenRequest("solve");
  const second = api.beginScreenRequest("solve");
  assert.equal(api.isScreenRequestCurrent(first), false, "a later same-screen request must supersede the first");
  assert.equal(api.isScreenRequestCurrent(second), true);
  state.route = "home";
  api.setTransition(2);
  assert.equal(api.isScreenRequestCurrent(second), false, "route changes must invalidate pending renders");
}

{
  let disconnected = 0;
  let unlocked = 0;
  const loader = { cancelled: false, queue: [1, 2] };
  const state = {
    galleryObserver: { disconnect: () => disconnected++ }, galleryLoader: loader,
    editImageRequestId: 4, canvas: {}, ctx: {}, history: [1], drawing: true,
    activePointerId: 7, dirty: true, activeSaveOperationId: 9, publishing: true
  };
  const cleanup = Function("state", "unlockDrawingScroll", `${cleanupSource}; return cleanupScreenResources;`)(state, () => unlocked++);
  cleanup();
  cleanup();
  assert.equal(disconnected, 1, "IntersectionObserver must be disconnected once and cleared");
  assert.equal(loader.cancelled, true);
  assert.deepEqual(loader.queue, []);
  assert.equal(state.canvas, null);
  assert.equal(state.ctx, null);
  assert.deepEqual(state.history, []);
  assert.equal(state.drawing, false);
  assert.equal(state.activePointerId, null);
  assert.equal(unlocked, 2, "cleanup must be safely repeatable");
}

{
  const state = { route: "home", galleryView: "thumb", galleryIndex: 0, seenWordKeys: new Set(), editDrawing: null };
  const calls = [];
  const history = { pushState: () => calls.push("push"), replaceState: () => calls.push("replace") };
  const transitionRoute = Function("state", "history", "cleanupScreenResources", "renderRoute", `${"let routeTransitionId = 0;"} ${transitionSource}; return transitionRoute;`)(
    state, history, () => calls.push("cleanup"), () => calls.push("render")
  );
  transitionRoute("gallery", { historyMode: "pop", historyState: { route: "gallery", galleryDetail: true, galleryIndex: 3 } });
  assert.deepEqual(calls, ["cleanup", "render"], "popstate transitions must use the same cleanup/render flow without writing history");
  assert.equal(state.galleryView, "frame");
  assert.equal(state.galleryIndex, 3, "gallery detail history must restore the selected drawing");
}

{
  const state = { route: "gallery", galleryView: "thumb", galleryIndex: 0, galleryLoader: null };
  const IMAGE_OPTIONS = { maxConcurrentLoads: 1 };
  const isTransitionCurrent = id => id === 1 && state.route === "gallery";
  const api = Function("state", "IMAGE_OPTIONS", "isTransitionCurrent", `let routeTransitionId = 1; ${loaderSource}; return { createGalleryLoader, enqueueGalleryLoad, isGalleryLoaderCurrent };`)(state, IMAGE_OPTIONS, isTransitionCurrent);
  const oldGate = deferred();
  const old = api.createGalleryLoader();
  api.enqueueGalleryLoad(old, () => oldGate.promise);
  assert.equal(old.active, 1);
  const current = api.createGalleryLoader();
  let applied = false;
  api.enqueueGalleryLoad(current, async () => { if (api.isGalleryLoaderCurrent(current)) applied = true; });
  await Promise.resolve();
  assert.equal(current.active, 0);
  oldGate.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(old.active, 0);
  assert.equal(current.active, 0, "an old loader completion must not alter the current loader count");
  assert.equal(applied, true);
  assert.equal(api.isGalleryLoaderCurrent(old), false, "old loader results must be rejected");
}

{
  let image;
  let draws = 0;
  const context = { lineCap: "", lineJoin: "", globalCompositeOperation: "", strokeStyle: "", lineWidth: 0, drawImage: () => draws++ };
  const canvas = { isConnected: true, getContext: () => context, addEventListener: () => {} };
  const state = { route: "draw", canvas: null, ctx: null, history: [], dirty: false, activePointerId: null, editImageRequestId: 0 };
  class TestImage { set src(value) { this.value = value; image = this; } }
  const setupCanvas = Function("state", "document", "bindDocumentDrawingScrollBlocker", "preventIfCancelable", "lockDrawingScroll", "unlockDrawingScroll", "saveHistory", "Image", "routeTransitionId", "isTransitionCurrent", `${setupCanvasSource}; return setupCanvas;`)(
    state, { querySelector: () => canvas }, () => {}, () => {}, () => {}, () => {}, () => {}, TestImage, 1, () => true
  );
  setupCanvas("data:image/png;base64,x");
  state.canvas = { isConnected: true };
  state.ctx = {};
  image.onload();
  assert.equal(draws, 0, "a stale edit image must not draw onto a replacement canvas");
}

assert.match(app, /window\.addEventListener\("popstate"[\s\S]{0,220}transitionRoute\(/, "popstate must use the common transition flow");
assert.match(transitionSource, /galleryDetail === true[\s\S]*galleryIndex/, "gallery detail history must restore its saved index");
assert.match(app, /async function renderGallery\(force = false\)/, "renderGallery(force) must preserve its boolean interface");
for (const name of ["renderSolve", "renderRanking", "renderManage", "renderFeedback"]) assert.match(app, new RegExp(`async function ${name}\\(\\)`));
assert.match(app, /startNewDrawing\(\{ preserveSeenWords: true \}\)/, "continuous drawing must preserve seen prompts");

console.log("Route lifecycle regression checks passed.");
