import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const pick = name => {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  let depth = 0;
  let opened = false;
  for (let i = start; i < source.length; i++) {
    if (source[i] === "{") { depth++; opened = true; }
    if (source[i] === "}" && opened && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`Could not extract ${name}`);
};
const pickAsync = name => `async ${pick(name)}`;
function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
async function settle() { for (let i = 0; i < 10; i++) await Promise.resolve(); }

assert.match(source, /loadDrawingImage\(drawing, "thumbnail"\)/, "manage cards must request thumbnails");
assert.match(source, /loadDrawingImage\(drawing, "detail"\)/, "editing must request detail images");
assert.match(source, /rootMargin: "240px"/, "manage observer should preload near the viewport");
assert.match(source, /state\.manageDrawings = null/, "route cleanup must discard manage metadata");
assert.match(source, /state\.manageDrawings\.filter/, "tab changes must filter the in-memory metadata cache");

const state = { manageLoader: null, manageObserver: null, manageEditRequestId: 0, thumbnailCache: new Map(), route: "manage" };
const IMAGE_OPTIONS = { maxConcurrentLoads: 2 };
const isScreenRequestCurrent = () => true;
const api = Function("state", "IMAGE_OPTIONS", "isScreenRequestCurrent", `${pick("cancelManageImageLoading")};${pick("createManageLoader")};${pick("isManageLoaderCurrent")};${pick("runManageImageQueue")}; return { cancelManageImageLoading, createManageLoader, isManageLoaderCurrent, runManageImageQueue };`)(state, IMAGE_OPTIONS, isScreenRequestCurrent);

const request = { routeName: "manage", transitionId: 1, requestId: 1 };
const first = api.createManageLoader(request);
let running = 0;
let peak = 0;
const releases = [];
for (let i = 0; i < 4; i++) {
  first.queue.push(() => new Promise(resolve => {
    running++;
    peak = Math.max(peak, running);
    releases.push(() => { running--; resolve(); });
  }));
}
api.runManageImageQueue(first);
await new Promise(resolve => setImmediate(resolve));
assert.equal(peak, 2, "concurrent manage image work must respect the shared limit");
assert.equal(first.active, 2, "active includes pending image completion");
releases.shift()();
await new Promise(resolve => setImmediate(resolve));
assert.equal(first.active, 2, "the next queued image starts only after one completes");

const previousActive = first.active;
const second = api.createManageLoader(request);
assert.equal(first.cancelled, true, "a tab rerender cancels the old loader");
assert.equal(first.queue.length, 0, "a cancelled loader drops its own queue");
releases.shift()();
await new Promise(resolve => setImmediate(resolve));
assert.equal(second.active, 0, "old loader completion cannot change the new loader count");
assert.ok(first.active < previousActive, "old completion settles only the old loader");

let disconnected = 0;
let waiterCancelled = 0;
second.pendingWaiters.add(() => waiterCancelled++);
state.manageObserver = { disconnect: () => disconnected++ };
api.cancelManageImageLoading();
api.cancelManageImageLoading();
assert.equal(disconnected, 1, "manage observer cleanup is repeatable");
assert.equal(waiterCancelled, 1, "pending image listeners are cancelled once");
assert.equal(state.manageLoader, null);
assert.equal(state.manageObserver, null);

const renderBody = source.slice(source.indexOf("async function renderManage()"), source.indexOf("async function submitFeedback("));
assert.equal((renderBody.match(/loadManageDrawings\(\)/g) || []).length, 1, "metadata is loaded through one cache fill path");
assert.doesNotMatch(renderBody, /Promise\.all\(list\.map/, "card rendering must not await all images");
assert.match(renderBody, /updateManageDrawingAfterWithdraw/, "withdrawal updates cached metadata");

// Execute renderManage itself: cards render immediately and an in-route tab change reuses metadata.
{
  const renderState = { manageDrawings: null, manageStatus: "open", route: "manage" };
  const appEl = { innerHTML: "" };
  let metadataReads = 0, loadingCalls = 0, observed = 0;
  const list = [
    { id: "open-one", status: "open", word: "고양이", createdAt: 2, expiresAt: Date.now() + 10000 },
    { id: "solved-one", status: "solved", word: "강아지", createdAt: 1, solverNickname: "정답자" }
  ];
  const document = {
    querySelector: selector => selector === "#newDrawingFromManage" ? { disabled: false, onclick: null } : null,
    querySelectorAll: () => []
  };
  const manageImageMarkup = Function(`${pick("manageImageMarkup")}; return manageImageMarkup;`)();
  const manageCard = Function("manageImageMarkup", "STATUS_LABEL", "escapeHtml", "formatTime", "solverName", `${pick("manageCard")}; return manageCard;`)(manageImageMarkup, { open: "공개 중", solved: "해결됨" }, value => value, () => "1시간", () => "정답자");
  const deps = {
    state: renderState, appEl, document, STATUS_LABEL: { open: "공개 중", solved: "해결됨" },
    beginScreenRequest: () => ({ routeName: "manage", transitionId: 1, requestId: ++deps.requestId }), requestId: 0,
    isConfigured: () => true, isScreenRequestCurrent: () => true, cancelManageImageLoading: () => {},
    loading: () => { loadingCalls++; appEl.innerHTML = "loading"; }, loadManageDrawings: async () => { metadataReads++; return list; },
    manageCard, emptyHtml: () => "empty", startNewDrawing: () => {}, loadManageEditDrawing: () => {},
    confirmModal: () => {}, observeManageImages: () => { observed++; }, console: { error() {} }, showToast: () => {},
    withdrawDrawing: async () => {}, serverNow: () => 100
  };
  const names = Object.keys(deps);
  const renderManage = Function(...names, `"use strict"; ${pickAsync("renderManage")}; return renderManage;`)(...names.map(name => deps[name]));
  await renderManage();
  assert.match(appEl.innerHTML, /data-manage-image="open-one"/);
  assert.match(appEl.innerHTML, /공개 중/);
  assert.match(appEl.innerHTML, /제시어: 고양이/);
  assert.match(appEl.innerHTML, /수정하기/);
  assert.match(appEl.innerHTML, /회수하기/);
  assert.equal(metadataReads, 1);
  assert.equal(observed, 1, "render completes without waiting for thumbnail work");
  renderState.manageStatus = "solved";
  await renderManage();
  assert.equal(metadataReads, 1, "same-route tab renders must reuse metadata");
  assert.equal(loadingCalls, 1, "cached tab renders must not restore the full loading screen");
  assert.match(appEl.innerHTML, /data-manage-image="solved-one"/);
  assert.doesNotMatch(appEl.innerHTML, /data-manage-image="open-one"/);
  renderState.manageDrawings = null;
  await renderManage();
  assert.equal(metadataReads, 2, "route cleanup followed by re-entry must reload metadata");
  assert.equal(loadingCalls, 2, "a genuine re-entry shows the loading state again");
}

function makeManageSlot(id) {
  const slot = {
    _html: "", image: null, retry: null, isConnected: true, loadingRemoved: false,
    set innerHTML(value) {
      this._html = value;
      if (value.includes("data-manage-image")) this.image = makeManageImage(id, this);
      if (value.includes("data-manage-retry")) this.retry = { disabled: false, onclick: null };
    },
    get innerHTML() { return this._html; },
    querySelector(selector) {
      if (selector === ".image-loading") return { remove: () => { this.loadingRemoved = true; } };
      if (selector === "[data-manage-retry]") return this.retry;
      if (selector === "[data-manage-image]" || selector === `[data-manage-image="${id}"]`) return this.image;
      return null;
    }
  };
  return slot;
}
function makeManageImage(id, slot = makeManageSlot(id)) {
  const classes = new Set();
  const listeners = { load: new Set(), error: new Set() };
  const image = {
    dataset: { manageImage: id }, isConnected: true, parentElement: slot, complete: false, naturalWidth: 0, _src: "",
    classList: { add: value => classes.add(value), contains: value => classes.has(value) },
    addEventListener(type, listener) { listeners[type].add(listener); },
    removeEventListener(type, listener) { listeners[type].delete(listener); },
    emit(type, width = type === "load" ? 100 : 0) { this.complete = true; this.naturalWidth = width; [...listeners[type]].forEach(fn => fn()); },
    listenerCount: type => listeners[type].size,
    set src(value) { this._src = value; }, get src() { return this._src; }
  };
  slot.image = image;
  return image;
}
function manageLoaderHarness({ images = [], max = 2, load } = {}) {
  let current = true, observer;
  class FakeObserver {
    constructor(callback, options) { this.callback = callback; this.options = options; this.unobserved = []; observer = this; }
    observe() {}
    unobserve(image) { this.unobserved.push(image); }
    disconnect() { this.disconnected = true; }
  }
  const harnessState = { manageObserver: null, manageLoader: null, manageEditRequestId: 0, thumbnailCache: new Map(), detailImageCache: new Map() };
  const document = { querySelectorAll: () => images };
  const deps = {
    state: harnessState, IMAGE_OPTIONS: { maxConcurrentLoads: max }, isScreenRequestCurrent: () => current,
    loadDrawingImage: load || (async drawing => `src-${drawing.id}`), waitForSolveImageLoad: null,
    document, window: { IntersectionObserver: FakeObserver }, IntersectionObserver: FakeObserver
  };
  deps.waitForSolveImageLoad = Function("queueMicrotask", `${pick("waitForSolveImageLoad")}; return waitForSolveImageLoad;`)(queueMicrotask);
  const names = Object.keys(deps);
  const code = ["cancelManageImageLoading", "createManageLoader", "isManageLoaderCurrent", "runManageImageQueue", "manageImageMarkup", "queueManageImage", "observeManageImages"].map(pick).join(";");
  const api = Function(...names, `"use strict"; ${code}; return { cancelManageImageLoading, createManageLoader, queueManageImage, observeManageImages };`)(...names.map(name => deps[name]));
  return { state: harnessState, api, get observer() { return observer; }, invalidate: () => { current = false; } };
}

// Observer gating, actual img events, concurrency, failure isolation, and stale cleanup.
{
  const images = ["a", "b", "c"].map(id => makeManageImage(id));
  const calls = [];
  const harness = manageLoaderHarness({ images, max: 2, load: async (drawing, kind) => { calls.push([drawing.id, kind]); return `src-${drawing.id}`; } });
  const loader = harness.api.observeManageImages(images.map(image => ({ id: image.dataset.manageImage })), { transitionId: 1, requestId: 1 });
  assert.equal(harness.observer.options.rootMargin, "240px");
  assert.deepEqual(calls, [], "offscreen thumbnails must not read before intersection");
  harness.observer.callback([{ isIntersecting: true, target: images[0] }, { isIntersecting: true, target: images[1] }, { isIntersecting: true, target: images[2] }]);
  await settle();
  assert.deepEqual(calls, [["a", "thumbnail"], ["b", "thumbnail"]]);
  assert.equal(loader.active, 2, "active includes actual img load waits");
  assert.equal(images[2].src, "");
  harness.observer.callback([{ isIntersecting: true, target: images[0] }]);
  assert.equal(calls.length, 2, "duplicate intersections do not enqueue twice");
  images[0].emit("load"); await settle();
  assert.equal(images[0].classList.contains("loaded"), true);
  assert.equal(images[0].listenerCount("load"), 0);
  assert.equal(images[2].src, "src-c", "next image starts only after an actual load event");
  images[1].emit("error"); await settle();
  assert.match(images[1].parentElement.innerHTML, /data-manage-retry/);
  assert.equal(images[1].listenerCount("error"), 0);
  images[2].emit("load"); await settle();
  assert.equal(loader.active, 0);
}

{
  const failed = makeManageImage("failed");
  const next = makeManageImage("next");
  const harness = manageLoaderHarness({ images: [failed, next], max: 1, load: drawing => drawing.id === "failed" ? Promise.reject(new Error("firebase")) : Promise.resolve("next-src") });
  const loader = harness.api.observeManageImages([{ id: "failed" }, { id: "next" }], { transitionId: 1, requestId: 1 });
  harness.observer.callback([{ isIntersecting: true, target: failed }, { isIntersecting: true, target: next }]);
  await settle();
  assert.match(failed.parentElement.innerHTML, /이미지를 불러오지 못했어요/);
  assert.equal(next.src, "next-src", "one Firebase failure must release the next card");
  next.emit("load"); await settle();
  assert.equal(loader.active, 0);
}

{
  const oldImage = makeManageImage("old");
  const harness = manageLoaderHarness({ images: [oldImage], load: async () => "old-src" });
  const oldLoader = harness.api.observeManageImages([{ id: "old" }], { transitionId: 1, requestId: 1 });
  harness.observer.callback([{ isIntersecting: true, target: oldImage }]);
  await settle();
  assert.equal(oldLoader.active, 1);
  const newLoader = harness.api.createManageLoader({ transitionId: 1, requestId: 2 });
  await settle();
  assert.equal(oldImage.listenerCount("load"), 0, "tab change removes old image listeners");
  oldImage.emit("load"); await settle();
  assert.equal(oldImage.classList.contains("loaded"), false);
  assert.equal(newLoader.active, 0, "old finally cannot change the new loader count");
  harness.api.cancelManageImageLoading();
  harness.api.cancelManageImageLoading();
  assert.equal(harness.state.manageLoader, null);
}

// Retry owns a replacement img and clears only the thumbnail cache entry.
{
  const firstImage = makeManageImage("retry");
  const slot = firstImage.parentElement;
  let attempts = 0;
  const harness = manageLoaderHarness({ images: [firstImage], max: 1, load: async () => { attempts++; if (attempts === 1) throw new Error("first"); return "retry-src"; } });
  harness.state.thumbnailCache.set("retry", "stale-thumbnail");
  harness.state.detailImageCache.set("retry", "detail-original");
  const loader = harness.api.observeManageImages([{ id: "retry" }], { transitionId: 1, requestId: 1 });
  harness.observer.callback([{ isIntersecting: true, target: firstImage }]);
  await settle();
  const retry = slot.retry;
  retry.onclick(); retry.onclick();
  await settle();
  const replacement = slot.image;
  assert.equal(attempts, 2, "repeat retry clicks must not duplicate the request");
  assert.equal(harness.state.thumbnailCache.has("retry"), false);
  assert.equal(harness.state.detailImageCache.get("retry"), "detail-original");
  assert.notEqual(replacement, firstImage);
  assert.equal(replacement.classList.contains("loaded"), false);
  firstImage.emit("load"); firstImage.emit("error"); await settle();
  assert.equal(replacement.classList.contains("loaded"), false);
  replacement.emit("load"); await settle();
  assert.equal(replacement.classList.contains("loaded"), true);
  assert.equal(loader.active, 0);
}

// Route cleanup discards metadata and repeatedly cancels observer/loader/waiters.
{
  let solveCancels = 0, manageCancels = 0, unlocks = 0;
  const cleanupState = {
    manageDrawings: [{ id: "a" }], galleryObserver: null, galleryLoader: null,
    editImageRequestId: 0, canvas: {}, ctx: {}, history: [1], drawing: true,
    activePointerId: 1, dirty: true, activeSaveOperationId: 1, publishing: true
  };
  const cleanup = Function("state", "cancelSolveImageLoading", "cancelManageImageLoading", "unlockDrawingScroll", `${pick("cleanupScreenResources")}; return cleanupScreenResources;`)(cleanupState, () => solveCancels++, () => manageCancels++, () => unlocks++);
  cleanup(); cleanup();
  assert.equal(cleanupState.manageDrawings, null);
  assert.equal(manageCancels, 2);
  assert.equal(solveCancels, 2);
  assert.equal(unlocks, 2);
}

function editHarness() {
  const editState = { route: "manage", manageEditRequestId: 0, editDrawing: null, word: null };
  let currentRequestId = 1;
  const gates = new Map(), routes = [], toasts = [];
  const deps = {
    state: editState,
    isScreenRequestCurrent: request => request.requestId === currentRequestId,
    loadDrawingImage: drawing => { const gate = deferred(); gates.set(drawing.id, gate); return gate.promise; },
    route: name => { routes.push(name); editState.route = name; }, showToast: message => toasts.push(message), userErrorMessage: (_e, fallback) => fallback
  };
  const names = Object.keys(deps);
  const loadManageEditDrawing = Function(...names, `"use strict"; ${pickAsync("loadManageEditDrawing")}; return loadManageEditDrawing;`)(...names.map(name => deps[name]));
  return { state: editState, gates, routes, toasts, loadManageEditDrawing, setRequest: id => { currentRequestId = id; } };
}
const button = () => ({ textContent: "수정하기", disabled: false, isConnected: true });
const drawing = id => ({ id, word: `${id}단어`, category: "동물", answers: [id], imageData: `${id}-thumb` });

// Detail success/failure and two-button ownership separation.
{
  const h = editHarness(), a = button();
  const job = h.loadManageEditDrawing(drawing("a"), a, { requestId: 1 });
  assert.equal(a.disabled, true); assert.equal(a.textContent, "불러오는 중…");
  assert.equal(h.state.editDrawing, null); assert.deepEqual(h.routes, []);
  h.gates.get("a").resolve("a-detail"); await job;
  assert.equal(h.state.editDrawing.imageData, "a-detail");
  assert.equal(h.state.word.word, "a단어"); assert.deepEqual(h.routes, ["draw"]);
}
{
  const h = editHarness(), a = button();
  const job = h.loadManageEditDrawing(drawing("a"), a, { requestId: 1 });
  h.gates.get("a").reject(new Error("failed")); await job;
  assert.equal(h.state.editDrawing, null); assert.equal(h.toasts.length, 1);
  assert.equal(a.disabled, false); assert.equal(a.textContent, "수정하기");
}
{
  const h = editHarness(), a = button(), b = button();
  const aJob = h.loadManageEditDrawing(drawing("a"), a, { requestId: 1 });
  const bJob = h.loadManageEditDrawing(drawing("b"), b, { requestId: 1 });
  h.gates.get("a").reject(new Error("stale")); await aJob;
  assert.equal(h.state.editDrawing, null); assert.equal(h.toasts.length, 0);
  assert.equal(a.disabled, false); assert.equal(a.textContent, "수정하기");
  assert.equal(b.disabled, true); assert.equal(b.textContent, "불러오는 중…");
  h.gates.get("b").reject(new Error("current")); await bJob;
  assert.equal(b.disabled, false); assert.equal(b.textContent, "수정하기"); assert.equal(h.toasts.length, 1);
}
{
  const h = editHarness(), a = button(), b = button();
  const aJob = h.loadManageEditDrawing(drawing("a"), a, { requestId: 1 });
  const bJob = h.loadManageEditDrawing(drawing("b"), b, { requestId: 1 });
  h.gates.get("b").resolve("b-detail"); await bJob;
  a.isConnected = false;
  h.gates.get("a").resolve("a-detail"); await aJob;
  assert.equal(h.state.editDrawing.id, "b"); assert.deepEqual(h.routes, ["draw"]);
}
{
  const h = editHarness(), a = button();
  const job = h.loadManageEditDrawing(drawing("a"), a, { requestId: 1 });
  h.setRequest(2); a.isConnected = false;
  h.gates.get("a").reject(new Error("old tab")); await job;
  assert.equal(h.state.editDrawing, null); assert.equal(h.toasts.length, 0); assert.deepEqual(h.routes, []);
}
{
  const h = editHarness(), a = button();
  const job = h.loadManageEditDrawing(drawing("a"), a, { requestId: 1 });
  h.state.route = "home"; a.isConnected = false;
  h.gates.get("a").resolve("late"); await job;
  assert.equal(h.state.editDrawing, null); assert.deepEqual(h.routes, []); assert.equal(h.toasts.length, 0);
}

// Withdrawal cache update is executable and does not invoke metadata loading.
{
  const withdrawState = { manageDrawings: [
    { id: "a", status: "open", createdAt: 2 },
    { id: "b", status: "withdrawn", createdAt: 1 }
  ] };
  const update = Function("state", "serverNow", `${pick("updateManageDrawingAfterWithdraw")}; return updateManageDrawingAfterWithdraw;`)(withdrawState, () => 777);
  assert.equal(update("a"), true);
  assert.deepEqual(withdrawState.manageDrawings.filter(item => item.status === "open").map(item => item.id), []);
  assert.deepEqual(withdrawState.manageDrawings.filter(item => item.status === "withdrawn").map(item => item.id), ["a", "b"]);
  assert.equal(withdrawState.manageDrawings[0].withdrawnAt, 777);
  assert.equal(withdrawState.manageDrawings[0].updatedAt, 777);
  const before = structuredClone(withdrawState.manageDrawings);
  assert.equal(update("missing"), false);
  assert.deepEqual(withdrawState.manageDrawings, before, "a failed/nonexistent withdrawal must not alter the cache");
}

console.log("manage image loading checks passed");
