import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const requestSource = app.match(/function isTransitionCurrent[\s\S]*?(?=function formatTime)/)?.[0];
const cleanupSource = app.match(/function cleanupScreenResources[\s\S]*?(?=function transitionRoute)/)?.[0];
const transitionSource = app.match(/function transitionRoute[\s\S]*?(?=function route\()/)?.[0];
const loaderSource = app.match(/function createGalleryLoader[\s\S]*?(?=function observeGalleryThumbnails)/)?.[0];
const setupCanvasSource = app.match(/function setupCanvas[\s\S]*?(?=function undoCanvas)/)?.[0];
const galleryRenderSource = app.match(/async function renderGallery[\s\S]*?(?=async function adminDeleteDrawing)/)?.[0];
const solveRenderSource = app.match(/async function renderSolve[\s\S]*?(?=function openDrawingCard)/)?.[0];
const moveGallerySource = app.match(/function moveGalleryIndex[\s\S]*?(?=function bindGalleryContent)/)?.[0];
const confirmModalSource = app.match(/function confirmModal[\s\S]*?(?=function showAnswerSuccessModal)/)?.[0];
assert.ok(requestSource && cleanupSource && transitionSource && loaderSource && setupCanvasSource && galleryRenderSource && solveRenderSource && moveGallerySource && confirmModalSource);

function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
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
  const loader = { cancelled: false, queue: [1, 2] };
  const state = {
    galleryObserver: { disconnect: () => disconnected++ }, galleryLoader: loader,
    editImageRequestId: 4, canvas: {}, ctx: {}, history: [1], drawing: true,
    activePointerId: 7, dirty: true, activeSaveOperationId: 9, publishing: true
  };
  const cleanup = Function("state", "cancelSolveImageLoading", "cancelManageImageLoading", "cancelFeedbackLoading", "releaseCanvasHistory", `${cleanupSource}; return cleanupScreenResources;`)(state, () => {}, () => {}, () => {}, () => { state.history = []; state.drawing = false; state.activePointerId = null; });
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
  assert.equal(state.publishing, false, "cleanup must be safely repeatable without a global scroll lock");
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
  const viewport = { clientWidth: 360, clientHeight: 360, clientLeft: 0, clientTop: 0, getBoundingClientRect: () => ({ left: 0, top: 0 }) };
  const canvas = { isConnected: true, clientWidth: 360, clientHeight: 360, style: {}, closest: () => viewport, getContext: () => context, addEventListener: () => {}, removeEventListener: () => {} };
  const state = { route: "draw", canvas: null, ctx: null, history: [], dirty: false, activePointerId: null, editImageRequestId: 0 };
  class TestImage { set src(value) { this.value = value; image = this; } }
  const eventTarget = { addEventListener: () => {}, removeEventListener: () => {} };
  const document = { ...eventTarget, visibilityState: "visible", querySelector: selector => selector === "#drawingCanvas" ? canvas : { value: 9 } };
  const setupCanvas = Function("state", "document", "window", "bindDocumentDrawingScrollBlocker", "preventIfCancelable", "lockDrawingScroll", "unlockDrawingScroll", "initializeCanvasHistory", "canvasPoint", "commitCanvasAction", "compactCanvasHistory", "redrawCanvasWhenIdle", "flushPendingCanvasRedraw", "safeSetPointerCapture", "safeReleasePointerCapture", "pointerMoveShowsContactEnded", "Image", "routeTransitionId", "isTransitionCurrent", "console", `${setupCanvasSource}; return setupCanvas;`)(
    state, document, eventTarget, () => {}, () => {}, () => {}, () => {}, () => { state.historyBaseCanvas = canvas; state.historyBaseContext = context; }, () => ({ x: 0, y: 0 }), () => {}, () => {}, () => {}, () => {}, () => true, () => true, () => false, TestImage, 1, () => true, { warn: () => {} }
  );
  setupCanvas("data:image/png;base64,x");
  state.canvas = { isConnected: true };
  state.ctx = {};
  image.onload();
  assert.equal(draws, 0, "a stale edit image must not draw onto a replacement canvas");
}

function galleryHarness() {
  const state = { route: "gallery", galleryTab: "solved", gallerySort: "new", galleryView: "thumb", galleryIndex: 0, galleryLists: {}, galleryScroll: { "solved:new": 47 }, isAdmin: false };
  const appEl = { innerHTML: "gallery-loading" };
  const gate = deferred();
  const frames = [];
  const scrolls = [];
  let current = true;
  const dependencies = {
    state, appEl,
    cancelSolveImageLoading: () => {},
    beginScreenRequest: () => ({ routeName: "gallery", transitionId: 1, requestId: 1 }),
    isScreenRequestCurrent: () => current,
    isConfigured: () => true,
    galleryListKey: () => `${state.galleryTab}:${state.gallerySort}`,
    loading: () => { appEl.innerHTML = "loading"; },
    loadGalleryDrawings: () => gate.promise,
    performance: { now: () => 0 },
    renderGalleryContent: () => {}, bindGalleryShell: () => {},
    requestAnimationFrame: callback => frames.push(callback),
    scrollTo: (...args) => scrolls.push(args),
    emptyHtml: (_icon, text) => text,
    console: { info: () => {}, error: () => {} }
  };
  const names = Object.keys(dependencies);
  const renderGallery = Function(...names, `"use strict"; ${galleryRenderSource}; return renderGallery;`)(...names.map(name => dependencies[name]));
  return { state, appEl, gate, frames, scrolls, renderGallery, invalidate: () => { current = false; state.route = "home"; } };
}

{
  const harness = galleryHarness();
  const pending = harness.renderGallery();
  harness.invalidate();
  harness.appEl.innerHTML = "home-screen";
  harness.gate.reject(new Error("late gallery failure"));
  await pending;
  assert.equal(harness.appEl.innerHTML, "home-screen", "a stale gallery catch must not replace the current screen");

  const current = galleryHarness();
  const currentPending = current.renderGallery();
  current.gate.reject(new Error("current gallery failure"));
  await currentPending;
  assert.equal(current.appEl.innerHTML, '<section class="screen">전시장을 불러오지 못했어요.</section>', "the current gallery request must retain its error UI");
}

{
  const current = galleryHarness();
  const rendered = current.renderGallery();
  current.gate.resolve([]);
  await rendered;
  assert.equal(current.frames.length, 1);
  current.frames[0]();
  assert.deepEqual(current.scrolls, [[0, 47]], "a current gallery request must restore its scroll");

  const stale = galleryHarness();
  const staleRendered = stale.renderGallery();
  stale.gate.resolve([]);
  await staleRendered;
  stale.invalidate();
  stale.frames[0]();
  assert.deepEqual(stale.scrolls, [], "a stale animation frame must not change another route's scroll");
}

{
  const state = { galleryIndex: 1 };
  const replaced = [];
  const pushed = [];
  const history = { state: { route: "gallery", galleryDetail: true, preserved: "yes" }, replaceState: (...args) => replaced.push(args), pushState: (...args) => pushed.push(args) };
  const renders = [];
  const moveGalleryIndex = Function("state", "history", "renderGalleryContent", `${moveGallerySource}; return moveGalleryIndex;`)(state, history, list => renders.push(list));
  const list = [{}, {}, {}];
  moveGalleryIndex(1, list);
  assert.equal(state.galleryIndex, 2);
  assert.equal(replaced.length, 1);
  assert.deepEqual(replaced[0][0], { route: "gallery", galleryDetail: true, preserved: "yes", galleryIndex: 2 });
  assert.equal(pushed.length, 0, "previous/next must not add history entries");
  assert.deepEqual(renders, [list]);
}

{
  const gate = deferred();
  let current = true;
  const toasts = [];
  const button = { disabled: false, textContent: "정답!" };
  const input = { value: "answer", selectCalls: 0, select() { this.selectCalls++; } };
  const form = { dataset: { answerForm: "drawing" }, querySelector: selector => selector === "button" ? button : input, onsubmit: null };
  const document = { querySelectorAll: selector => selector === "[data-answer-form]" ? [form] : [], querySelector: () => null };
  const state = { route: "solve", hintUsed: {} };
  const dependencies = {
    state, appEl: { innerHTML: "" }, document, solveSort: { onchange: null }, sessionStorage: { getItem: () => "new", setItem: () => {} },
    beginScreenRequest: () => ({ routeName: "solve", transitionId: 1, requestId: 1 }), isScreenRequestCurrent: () => current,
    isConfigured: () => true, loading: () => {}, loadOpenDrawings: async () => [], loadRecentSolverSuccessCount: async () => 0,
    loadDrawingImage: async () => "", openDrawingCard: () => "", emptyHtml: () => "", solverRewardHtml: () => "",
    submitAnswer: () => gate.promise, loadCurrentUser: async () => {}, renderSolve: () => {}, showAnswerSuccessModal: () => {},
    cancelSolveImageLoading: () => {}, observeSolveImages: () => {},
    showToast: message => toasts.push(message), console: { error: () => {} }
  };
  const names = Object.keys(dependencies);
  const renderSolve = Function(...names, `"use strict"; ${solveRenderSource}; return renderSolve;`)(...names.map(name => dependencies[name]));
  await renderSolve();
  const submission = form.onsubmit({ preventDefault() {} });
  assert.equal(button.textContent, "확인 중…");
  current = false;
  state.route = "home";
  gate.reject(new Error("late answer failure"));
  await submission;
  assert.deepEqual(toasts, []);
  assert.equal(button.disabled, true, "a stale catch must not touch a detached button");
  assert.equal(button.textContent, "확인 중…");
  assert.equal(input.selectCalls, 0);
}

function modalHarness() {
  const toasts = [];
  const root = {
    _html: "", firstElementChild: null, buttons: null,
    set innerHTML(value) {
      if (this.firstElementChild) this.firstElementChild.isConnected = false;
      this._html = value;
      if (!value) { this.firstElementChild = null; this.buttons = null; return; }
      this.firstElementChild = { isConnected: true, marker: value };
      this.buttons = { cancel: { isConnected: true }, confirm: { isConnected: true, disabled: false, textContent: "확인" } };
    },
    get innerHTML() { return this._html; },
    querySelector(selector) { return selector === "[data-cancel]" ? this.buttons.cancel : this.buttons.confirm; }
  };
  const document = { querySelector: () => root };
  const confirmModal = Function("document", "showToast", "userErrorMessage", `${confirmModalSource}; return confirmModal;`)(document, message => toasts.push(message), error => error.message);
  return { root, toasts, confirmModal };
}

for (const outcome of ["resolve", "reject"]) {
  const harness = modalHarness();
  const gate = deferred();
  harness.confirmModal("A", "first", () => gate.promise);
  const oldButton = harness.root.buttons.confirm;
  const pending = oldButton.onclick({ currentTarget: oldButton });
  harness.root.innerHTML = "modal-b";
  const newButton = harness.root.buttons.confirm;
  newButton.disabled = false;
  newButton.textContent = "B confirm";
  if (outcome === "resolve") gate.resolve(); else gate.reject(new Error("old failure"));
  await pending;
  assert.equal(harness.root.innerHTML, "modal-b", `an old modal ${outcome} must not close the replacement modal`);
  assert.equal(newButton.disabled, false);
  assert.equal(newButton.textContent, "B confirm");
  assert.deepEqual(harness.toasts, [], `an old modal ${outcome} must not show errors on the replacement modal`);
}

assert.match(app, /window\.addEventListener\("popstate"[\s\S]{0,220}transitionRoute\(/, "popstate must use the common transition flow");
assert.match(transitionSource, /galleryDetail === true[\s\S]*galleryIndex/, "gallery detail history must restore its saved index");
assert.match(app, /async function renderGallery\(force = false\)/, "renderGallery(force) must preserve its boolean interface");
for (const name of ["renderSolve", "renderRanking", "renderManage"]) assert.match(app, new RegExp(`async function ${name}\\(\\)`));
assert.match(app, /async function renderFeedback\([^)]*\)/);
assert.match(app, /startNewDrawing\(\{ preserveSeenWords: true \}\)/, "continuous drawing must preserve seen prompts");

console.log("Route lifecycle regression checks passed.");
