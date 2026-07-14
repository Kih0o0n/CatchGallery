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
async function settle() { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); }

{
  const list = [{ id: "one", category: "동물", expiresAt: Date.now() + 10000, drawerId: "other" }];
  const appEl = { innerHTML: "loading" };
  let observed = null;
  let imageReads = 0;
  const state = { hintUsed: {} };
  const hint = { dataset: { hint: "one", category: "동물", recentSuccesses: "0" }, textContent: "힌트", disabled: false, onclick: null };
  const reward = { innerHTML: "old" };
  const answerButton = { disabled: false, textContent: "정답!" };
  const answerInput = { value: "", select() {} };
  const form = { dataset: { answerForm: "one" }, onsubmit: null, querySelector: selector => selector === "button" ? answerButton : answerInput };
  const document = {
    querySelectorAll: selector => selector === "[data-hint]" ? [hint] : selector === "[data-answer-form]" ? [form] : [],
    querySelector: selector => selector.includes("data-answer-reward") ? reward : null
  };
  const openDrawingCard = Function("isOwnDrawing", "formatTime", "escapeHtml", "solverRewardHtml", `${openCardSource}; return openDrawingCard;`)(() => false, () => "1시간", value => value, () => "10점");
  const dependencies = {
    state, appEl, sessionStorage: { getItem: () => "new", setItem: () => {} }, solveSort: { onchange: null },
    beginScreenRequest: () => ({ routeName: "solve", transitionId: 1, requestId: 1 }), cancelSolveImageLoading: () => {},
    isConfigured: () => true, isScreenRequestCurrent: () => true, loading: () => {},
    loadOpenDrawings: async () => list, loadRecentSolverSuccessCount: async () => 0,
    openDrawingCard, emptyHtml: () => "empty", document,
    observeSolveImages: (items, request) => { observed = { items, request }; },
    submitAnswer: async () => ({ correct: false }), loadCurrentUser: async () => {}, renderSolve: () => {}, showAnswerSuccessModal: () => {},
    showToast: () => {}, solverRewardHtml: () => "", console: { error: () => {} },
    loadDrawingImage: () => { imageReads++; return new Promise(() => {}); }
  };
  const names = Object.keys(dependencies);
  const renderSolve = Function(...names, `"use strict"; ${renderSolveSource}; return renderSolve;`)(...names.map(name => dependencies[name]));
  await renderSolve();
  assert.match(appEl.innerHTML, /data-solve-image="one"/, "cards must render before image reads finish");
  assert.equal(imageReads, 0, "renderSolve must not eagerly read images");
  assert.deepEqual(observed.items, list);
  hint.onclick();
  assert.equal(state.hintUsed.one, true);
  assert.equal(hint.textContent, "카테고리: 동물");
  assert.equal(hint.disabled, true);
  assert.equal(reward.innerHTML, "");
  assert.equal(typeof form.onsubmit, "function", "answer forms must bind before images finish");
}

function makeSlot(id) {
  const slot = {
    _html: "", image: null, retry: null,
    set innerHTML(value) {
      this._html = value;
      if (value.includes("data-solve-image")) this.image = makeImage(id, this);
      if (value.includes("data-solve-retry")) this.retry = { disabled: false, onclick: null };
    },
    get innerHTML() { return this._html; },
    querySelector(selector) {
      if (selector === ".image-loading") return { remove: () => { this.loadingRemoved = true; } };
      if (selector === "[data-solve-retry]") return this.retry;
      if (selector === "[data-solve-image]") return this.image;
      return null;
    }
  };
  return slot;
}
function makeImage(id, slot = makeSlot(id)) {
  const classes = new Set();
  const image = { dataset: { solveImage: id }, isConnected: true, parentElement: slot, src: "", classList: { add: value => classes.add(value), contains: value => classes.has(value) } };
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
  const api = Function(...names, `"use strict"; ${loaderSource}; return { cancelSolveImageLoading, createSolveLoader, isSolveLoaderCurrent, enqueueSolveImage, runSolveImageQueue, queueSolveImage, observeSolveImages };`)(...names.map(name => dependencies[name]));
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

assert.match(openCardSource, /data-hint/);
assert.match(openCardSource, /data-answer-form/);
assert.match(openCardSource, /data-solve-image/);
assert.doesNotMatch(renderSolveSource, /Promise\.all\(list\.map[\s\S]*loadDrawingImage/);

console.log("Solve image lazy-loading checks passed.");
