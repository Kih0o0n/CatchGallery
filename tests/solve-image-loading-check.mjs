import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const renderSolveSource = app.match(/async function renderSolve[\s\S]*?(?=function openDrawingCard)/)?.[0];
const openCardSource = app.match(/function openDrawingCard[\s\S]*?(?=function cancelSolveImageLoading)/)?.[0];
const loaderSource = app.match(/function cancelSolveImageLoading[\s\S]*?(?=async function updateDrawing)/)?.[0];
const loadImageSource = app.match(/async function loadDrawingImage[\s\S]*?(?=function isConfigured)/)?.[0];
assert.ok(renderSolveSource && openCardSource && loaderSource && loadImageSource);

function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
async function settle() { for (let i = 0; i < 8; i++) await Promise.resolve(); }

{
  const list = [{ id: "one", category: "동물", expiresAt: Date.now() + 10000, drawerId: "other" }];
  const appEl = { innerHTML: "loading" };
  let observed = null;
  let imageReads = 0;
  let solveSortValue = "new";
  const submittedHintValues = [];
  const state = { hintUsed: {} };
  const hint = { dataset: { hint: "one", category: "동물", recentSuccesses: "0" }, textContent: "힌트", disabled: false, onclick: null };
  const reward = { innerHTML: "old" };
  const answerButton = { disabled: false, textContent: "정답!" };
  const answerInput = { value: "answer", select() {} };
  const form = { dataset: { answerForm: "one" }, onsubmit: null, querySelector: selector => selector === "button" ? answerButton : answerInput };
  const document = {
    querySelectorAll: selector => selector === "[data-hint]" ? [hint] : selector === "[data-answer-form]" ? [form] : [],
    querySelector: selector => selector.includes("data-answer-reward") ? reward : null
  };
  const rewardHtml = (_recent, usedHint) => `reward-${usedHint}`;
  const openDrawingCard = Function("state", "isOwnDrawing", "formatTime", "escapeHtml", "solverRewardHtml", `${openCardSource}; return openDrawingCard;`)(state, () => false, () => "1시간", value => value, rewardHtml);
  const dependencies = {
    state, appEl, sessionStorage: { getItem: () => solveSortValue, setItem: (_key, value) => { solveSortValue = value; } }, solveSort: { value: "new", onchange: null },
    beginScreenRequest: () => ({ routeName: "solve", transitionId: 1, requestId: 1 }), cancelSolveImageLoading: () => {},
    isConfigured: () => true, isScreenRequestCurrent: () => true, loading: () => {},
    loadOpenDrawings: async () => list, loadRecentSolverSuccessCount: async () => 0,
    openDrawingCard, emptyHtml: () => "empty", document,
    observeSolveImages: (items, request) => { observed = { items, request }; },
    submitAnswer: async (...args) => { submittedHintValues.push(args[2]); return { correct: false, message: "wrong" }; }, loadCurrentUser: async () => {}, showAnswerSuccessModal: () => {},
    showToast: () => {}, solverRewardHtml: rewardHtml, console: { error: () => {} },
    loadDrawingImage: () => { imageReads++; return new Promise(() => {}); }
  };
  const names = Object.keys(dependencies);
  const renderSolve = Function(...names, `"use strict"; ${renderSolveSource}; return renderSolve;`)(...names.map(name => dependencies[name]));
  await renderSolve();
  assert.match(appEl.innerHTML, /data-solve-image="one"/, "cards must render before image reads finish");
  assert.match(appEl.innerHTML, /카테고리 힌트 보기 \(-4점\)/);
  assert.match(appEl.innerHTML, /reward-false/);
  assert.equal(imageReads, 0, "renderSolve must not eagerly read images");
  assert.deepEqual(observed.items, list);
  hint.onclick();
  assert.equal(state.hintUsed.one, true);
  assert.equal(hint.textContent, "카테고리: 동물");
  assert.equal(hint.disabled, true);
  assert.equal(reward.innerHTML, "reward-true");
  assert.equal(typeof form.onsubmit, "function", "answer forms must bind before images finish");
  await form.onsubmit({ preventDefault() {} });
  assert.equal(submittedHintValues.at(-1), true, "hint use must reach submitAnswer");

  await renderSolve();
  assert.match(appEl.innerHTML, /카테고리: 동물/);
  assert.match(appEl.innerHTML, /data-hint="one"[^>]*disabled/);
  assert.match(appEl.innerHTML, /reward-true/, "route re-entry restores the hinted reward");

  solveSortValue = "old";
  await renderSolve();
  assert.match(appEl.innerHTML, /카테고리: 동물/);
  assert.match(appEl.innerHTML, /reward-true/, "sort re-render preserves the hinted UI");
  await form.onsubmit({ preventDefault() {} });
  assert.equal(submittedHintValues.at(-1), true);

  state.hintUsed = {};
  await renderSolve();
  assert.match(appEl.innerHTML, /카테고리 힌트 보기 \(-4점\)/, "a new user session starts without the previous hint");
  assert.match(appEl.innerHTML, /reward-false/);
  await form.onsubmit({ preventDefault() {} });
  assert.equal(submittedHintValues.at(-1), false, "a new user submits without inherited hint use");
}

function makeSlot(id) {
  const slot = {
    _html: "", image: null, retry: null, isConnected: true, loadingRemoved: false, nextAutoEvent: "load",
    set innerHTML(value) {
      this._html = value;
      if (value.includes("data-solve-image")) this.image = makeImage(id, this, this.nextAutoEvent);
      if (value.includes("data-solve-retry")) this.retry = { disabled: false, onclick: null };
    },
    get innerHTML() { return this._html; },
    querySelector(selector) {
      if (selector === ".image-loading") return { remove: () => { this.loadingRemoved = true; } };
      if (selector === "[data-solve-retry]") return this.retry;
      if (selector === "[data-solve-image]" || selector === `[data-solve-image="${id}"]`) return this.image;
      return null;
    }
  };
  return slot;
}
function makeImage(id, slot = makeSlot(id), autoEvent = "load") {
  const classes = new Set();
  const listeners = { load: new Set(), error: new Set() };
  const image = {
    dataset: { solveImage: id }, isConnected: true, parentElement: slot, complete: false, naturalWidth: 0, _src: "", removed: { load: 0, error: 0 },
    classList: { add: value => classes.add(value), contains: value => classes.has(value) },
    addEventListener(type, listener) { listeners[type].add(listener); },
    removeEventListener(type, listener) { if (listeners[type].delete(listener)) this.removed[type]++; },
    emit(type, width = type === "load" ? 100 : 0) { this.complete = true; this.naturalWidth = width; [...listeners[type]].forEach(listener => listener()); },
    listenerCount(type) { return listeners[type].size; },
    set src(value) { this._src = value; if (autoEvent) queueMicrotask(() => this.emit(autoEvent)); },
    get src() { return this._src; }
  };
  slot.image = image;
  return image;
}

function loaderHarness({ images = [], max = 2, hasObserver = true, load } = {}) {
  let current = true;
  let observer = null;
  class FakeObserver {
    constructor(callback, options) { this.callback = callback; this.options = options; this.observed = []; this.unobserved = []; observer = this; }
    observe(image) { this.observed.push(image); }
    unobserve(image) { this.unobserved.push(image); }
    disconnect() { this.disconnected = true; }
  }
  const state = { solveObserver: null, solveLoader: null, detailImageCache: new Map() };
  const document = { querySelectorAll: selector => selector === "[data-solve-image]" ? images : [] };
  const window = hasObserver ? { IntersectionObserver: FakeObserver } : {};
  const dependencies = {
    state, IMAGE_OPTIONS: { maxConcurrentLoads: max }, isScreenRequestCurrent: () => current,
    loadDrawingImage: load || (async drawing => `src-${drawing.id}`), document, window,
    IntersectionObserver: FakeObserver
  };
  const names = Object.keys(dependencies);
  const api = Function(...names, `"use strict"; ${loaderSource}; return { cancelSolveImageLoading, createSolveLoader, isSolveLoaderCurrent, enqueueSolveImage, runSolveImageQueue, waitForSolveImageLoad, queueSolveImage, observeSolveImages };`)(...names.map(name => dependencies[name]));
  return { state, api, get observer() { return observer; }, invalidate: () => { current = false; }, setCurrent: value => { current = value; } };
}

{
  const a = makeImage("a"), b = makeImage("b");
  const calls = [];
  const harness = loaderHarness({ images: [a, b], load: async drawing => { calls.push(drawing.id); return `src-${drawing.id}`; } });
  harness.api.observeSolveImages([{ id: "a" }, { id: "b" }], { transitionId: 1, requestId: 1 });
  assert.deepEqual(calls, [], "offscreen images must not load before intersection");
  harness.observer.callback([{ isIntersecting: true, target: a }]);
  await settle();
  assert.deepEqual(calls, ["a"]);
  harness.observer.callback([{ isIntersecting: true, target: a }, { isIntersecting: true, target: a }]);
  await settle();
  assert.deepEqual(calls, ["a"], "the same image must only queue once");
  assert.ok(harness.observer.unobserved.includes(a));
}

{
  const harness = loaderHarness({ max: 2 });
  const loader = harness.api.createSolveLoader({ transitionId: 1, requestId: 1 });
  const gates = [deferred(), deferred(), deferred(), deferred()];
  let running = 0, peak = 0, started = 0;
  for (const gate of gates) harness.api.enqueueSolveImage(loader, async () => { started++; running++; peak = Math.max(peak, running); await gate.promise; running--; });
  assert.equal(started, 2);
  assert.equal(peak, 2);
  gates[0].resolve(); await settle();
  assert.equal(started, 3, "a queued task must start after one active task finishes");
  gates[1].resolve(); gates[2].resolve(); gates[3].resolve(); await settle();
  assert.ok(peak <= 2);
}

{
  const good = makeImage("good"), bad = makeImage("bad");
  const harness = loaderHarness({ images: [good, bad], load: drawing => drawing.id === "bad" ? Promise.reject(new Error("image failed")) : Promise.resolve("good-src") });
  harness.api.observeSolveImages([{ id: "good" }, { id: "bad" }], { transitionId: 1, requestId: 1 });
  harness.observer.callback([{ isIntersecting: true, target: good }, { isIntersecting: true, target: bad }]);
  await settle();
  assert.equal(good.src, "good-src");
  assert.equal(good.classList.contains("loaded"), true);
  assert.match(bad.parentElement.innerHTML, /이미지를 불러오지 못했어요/);
  assert.ok(bad.parentElement.retry, "only the failed slot must expose retry");
}

{
  const image = makeImage("retry");
  let attempts = 0;
  const harness = loaderHarness({ images: [image], load: async () => { attempts++; if (attempts === 1) throw new Error("first failure"); return "retry-src"; } });
  harness.state.detailImageCache.set("retry", "stale-cache");
  harness.api.observeSolveImages([{ id: "retry" }], { transitionId: 1, requestId: 1 });
  harness.observer.callback([{ isIntersecting: true, target: image }]);
  await settle();
  const slot = image.parentElement;
  slot.retry.onclick();
  await settle();
  assert.equal(attempts, 2, "retry must load only the failed image again");
  assert.equal(harness.state.detailImageCache.has("retry"), false, "retry must clear only the drawing detail cache entry");
  assert.equal(slot.image.src, "retry-src");
}

{
  const oldImage = makeImage("old");
  const oldGate = deferred();
  const harness = loaderHarness({ images: [oldImage], load: () => oldGate.promise });
  const oldLoader = harness.api.observeSolveImages([{ id: "old" }], { transitionId: 1, requestId: 1 });
  harness.observer.callback([{ isIntersecting: true, target: oldImage }]);
  const newLoader = harness.api.createSolveLoader({ transitionId: 1, requestId: 2 });
  oldGate.resolve("old-src"); await settle();
  assert.equal(oldImage.src, "", "a stale sort loader must not apply its result");
  assert.equal(newLoader.active, 0, "an old loader finally must not alter the new active count");
  assert.equal(oldLoader.active, 0);

  const leavingImage = makeImage("leave");
  const leavingGate = deferred();
  const leaving = loaderHarness({ images: [leavingImage], load: () => leavingGate.promise });
  leaving.api.observeSolveImages([{ id: "leave" }], { transitionId: 1, requestId: 1 });
  leaving.observer.callback([{ isIntersecting: true, target: leavingImage }]);
  leaving.api.cancelSolveImageLoading();
  leavingImage.isConnected = false;
  leavingGate.resolve("leave-src"); await settle();
  assert.equal(leavingImage.src, "", "route cleanup must block removed image mutation");
}

{
  let reads = 0;
  const state = { detailImageCache: new Map([["cached", "cached-src"]]), thumbnailCache: new Map() };
  const db = { ref: () => { reads++; return { once: async () => ({ val: () => "db-src" }) }; } };
  const loadDrawingImage = Function("state", "db", `${loadImageSource}; return loadDrawingImage;`)(state, db);
  assert.equal(await loadDrawingImage({ id: "cached", imageReady: true }), "cached-src");
  assert.equal(reads, 0, "detail cache hits must not read Firebase");
}

{
  const images = [makeImage("a"), makeImage("b"), makeImage("c")];
  const gates = images.map(() => deferred());
  let running = 0, peak = 0, calls = 0;
  const harness = loaderHarness({ images, max: 2, hasObserver: false, load: async () => { const gate = gates[calls++]; running++; peak = Math.max(peak, running); await gate.promise; running--; return "src"; } });
  harness.api.observeSolveImages(images.map(image => ({ id: image.dataset.solveImage })), { transitionId: 1, requestId: 1 });
  assert.equal(calls, 2, "fallback must queue all images while respecting concurrency");
  gates[0].resolve(); await settle();
  assert.equal(calls, 3);
  gates[1].resolve(); gates[2].resolve(); await settle();
  assert.ok(peak <= 2);
}

{
  const image = makeImage("manual-load", undefined, null);
  const harness = loaderHarness({ images: [image], max: 1, load: async () => "manual-src" });
  const loader = harness.api.observeSolveImages([{ id: "manual-load" }], { transitionId: 1, requestId: 1 });
  harness.observer.callback([{ isIntersecting: true, target: image }]);
  await settle();
  assert.equal(image.src, "manual-src");
  assert.equal(image.classList.contains("loaded"), false, "src assignment alone must not show the image");
  assert.equal(image.parentElement.loadingRemoved, false);
  assert.equal(loader.active, 1, "active must include the real img load wait");
  assert.equal(image.listenerCount("load"), 1);
  assert.equal(image.listenerCount("error"), 1);
  image.emit("load", 120);
  await settle();
  assert.equal(image.classList.contains("loaded"), true);
  assert.equal(image.parentElement.loadingRemoved, true);
  assert.equal(loader.active, 0);
  assert.equal(image.listenerCount("load"), 0);
  assert.equal(image.listenerCount("error"), 0);
}

{
  const image = makeImage("immediate-complete", undefined, null);
  Object.defineProperty(image, "src", {
    configurable: true,
    get() { return this._src; },
    set(value) { this._src = value; this.complete = true; this.naturalWidth = 64; }
  });
  const harness = loaderHarness();
  const loader = harness.api.createSolveLoader({ transitionId: 1, requestId: 1 });
  assert.equal(await harness.api.waitForSolveImageLoad(image, "cached-src", loader), "loaded");
  assert.equal(image.listenerCount("load"), 0);
  assert.equal(image.listenerCount("error"), 0);
}

{
  const failed = makeImage("event-error", undefined, null);
  const next = makeImage("after-error", undefined, null);
  const harness = loaderHarness({ images: [failed, next], max: 1, load: async drawing => `src-${drawing.id}` });
  const loader = harness.api.observeSolveImages([{ id: "event-error" }, { id: "after-error" }], { transitionId: 1, requestId: 1 });
  harness.observer.callback([{ isIntersecting: true, target: failed }, { isIntersecting: true, target: next }]);
  await settle();
  assert.equal(failed.src, "src-event-error");
  assert.equal(next.src, "");
  failed.emit("error");
  await settle();
  assert.match(failed.parentElement.innerHTML, /data-solve-retry/);
  assert.equal(next.src, "src-after-error", "an img error must release the next queued image");
  assert.equal(loader.active, 1);
  assert.equal(failed.listenerCount("load"), 0);
  assert.equal(failed.listenerCount("error"), 0);
  next.emit("load", 80); await settle();
}

{
  const images = ["one", "two", "three", "four"].map(id => makeImage(id, undefined, null));
  const harness = loaderHarness({ images, max: 2, load: async drawing => `src-${drawing.id}` });
  const loader = harness.api.observeSolveImages(images.map(image => ({ id: image.dataset.solveImage })), { transitionId: 1, requestId: 1 });
  harness.observer.callback(images.map(target => ({ isIntersecting: true, target })));
  await settle();
  assert.deepEqual(images.map(image => image.src), ["src-one", "src-two", "", ""]);
  assert.equal(loader.active, 2);
  images[0].emit("load", 100); await settle();
  assert.equal(images[2].src, "src-three", "the next task must wait for an actual img load event");
  images[1].emit("load", 100); images[2].emit("load", 100); await settle();
  images[3].emit("load", 100); await settle();
}

{
  const image = makeImage("cancel-wait", undefined, null);
  const harness = loaderHarness({ images: [image], max: 1, load: async () => "cancel-src" });
  const loader = harness.api.observeSolveImages([{ id: "cancel-wait" }], { transitionId: 1, requestId: 1 });
  harness.observer.callback([{ isIntersecting: true, target: image }]);
  await settle();
  assert.equal(loader.active, 1);
  harness.api.cancelSolveImageLoading();
  await settle();
  assert.equal(image.listenerCount("load"), 0);
  assert.equal(image.listenerCount("error"), 0);
  assert.equal(loader.active, 0);
  image.emit("load", 100); await settle();
  assert.equal(image.classList.contains("loaded"), false);
  assert.equal(image.parentElement.loadingRemoved, false);
}

{
  const oldImage = makeImage("old-sort-event", undefined, null);
  const harness = loaderHarness({ images: [oldImage], load: async () => "old-sort-src" });
  const oldLoader = harness.api.observeSolveImages([{ id: "old-sort-event" }], { transitionId: 1, requestId: 1 });
  harness.observer.callback([{ isIntersecting: true, target: oldImage }]);
  await settle();
  const newLoader = harness.api.createSolveLoader({ transitionId: 1, requestId: 2 });
  await settle();
  oldImage.emit("load", 100); await settle();
  assert.equal(oldImage.classList.contains("loaded"), false);
  assert.equal(oldLoader.active, 0);
  assert.equal(newLoader.active, 0, "an old image event must not change the new loader count");
}

{
  const first = makeImage("retry-event", undefined, null);
  const slot = first.parentElement;
  const harness = loaderHarness({ images: [first], load: async () => "retry-event-src" });
  const loader = harness.api.observeSolveImages([{ id: "retry-event" }], { transitionId: 1, requestId: 1 });
  harness.observer.callback([{ isIntersecting: true, target: first }]);
  await settle();
  first.emit("error"); await settle();
  slot.nextAutoEvent = null;
  slot.retry.onclick(); await settle();
  const replacement = slot.image;
  assert.notEqual(replacement, first);
  assert.equal(replacement.src, "retry-event-src");
  assert.equal(replacement.classList.contains("loaded"), false);
  assert.equal(loader.active, 1);
  first.emit("load", 100); first.emit("error"); await settle();
  assert.equal(replacement.classList.contains("loaded"), false, "late events from the old img must not affect its replacement");
  replacement.emit("load", 100); await settle();
  assert.equal(replacement.classList.contains("loaded"), true);
  assert.equal(loader.active, 0);
}

{
  const image = makeImage("zero-width", undefined, null);
  const harness = loaderHarness({ images: [image], load: async () => "zero-src" });
  harness.api.observeSolveImages([{ id: "zero-width" }], { transitionId: 1, requestId: 1 });
  harness.observer.callback([{ isIntersecting: true, target: image }]);
  await settle();
  image.emit("load", 0); await settle();
  assert.equal(image.classList.contains("loaded"), false);
  assert.match(image.parentElement.innerHTML, /이미지를 불러오지 못했어요/);
  assert.equal(image.listenerCount("load"), 0);
  assert.equal(image.listenerCount("error"), 0);
}

assert.match(openCardSource, /data-hint/);
assert.match(openCardSource, /data-answer-form/);
assert.match(openCardSource, /data-solve-image/);
assert.doesNotMatch(renderSolveSource, /Promise\.all\(list\.map[\s\S]*loadDrawingImage/);

console.log("Solve image lazy-loading checks passed.");
