import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const html = app.match(/appEl\.innerHTML = `<section class="screen draw-screen"[\s\S]*?`;\s*setupCanvas/)?.[0] || "";
const slider = html.match(/<div class="brush-size-control">[\s\S]*?<\/div>/)?.[0] || "";
const setup = app.match(/function setupBrushSizeControl[\s\S]*?(?=function setupCanvas)/)?.[0] || "";
const canvasSetup = app.match(/function setupCanvas[\s\S]*?(?=function undoCanvas)/)?.[0] || "";
const renderDrawSource = app.match(/function renderDraw[\s\S]*?(?=async function saveDrawingDraft)/)?.[0] || "";

assert.match(slider, /<output id="brushSizeValue"[^>]*aria-hidden="true">9\(기본\)<\/output>/);
assert.match(slider, /id="brushSize" type="range" min="3" max="34" value="9"/);
assert.match(slider, /aria-label="붓 굵기"/);
assert.match(slider, /aria-valuetext="9, 기본 굵기"/);
assert.match(styles, /appearance:\s*none/);
assert.match(styles, /-webkit-appearance:\s*none/);
assert.match(styles, /::-webkit-slider-runnable-track/);
assert.match(styles, /::-webkit-slider-thumb/);
assert.match(styles, /::-moz-range-track/);
assert.match(styles, /::-moz-range-progress/);
assert.match(styles, /::-moz-range-thumb/);
assert.match(styles, /linear-gradient\(to right, var\(--pink\)[^}]*#fff/);
const sliderStyles = styles.match(/\.brush-size-control \{[\s\S]*?(?=\.notice \{)/)?.[0] || "";
assert.doesNotMatch(sliderStyles, /accent-color/);
assert.match(setup, /\(\(value - min\) \/ \(max - min\)\) \* 100/);
assert.match(setup, /input\.value = String\(defaultValue\)/);
assert.match(setup, /window\.addEventListener\("pointerup"/);
assert.match(setup, /window\.removeEventListener\("pointerup"/);
assert.match(setup, /visibilitychange/);
assert.match(setup, /aria-valuetext/);
assert.match(canvasSetup, /width:\s*Number\(state\.brushInput\?\.value \|\| 9\)/);
assert.match(canvasSetup, /releaseBrushSizeControl\(\)/);
assert.match(renderDrawSource, /const previousCanvasInputCleanup = state\.canvasInputCleanup;\s*state\.canvasInputCleanup = null;\s*previousCanvasInputCleanup\?\.\(\);\s*if \(!state\.word\)/);

function eventTarget() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, listener) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(listener); },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
    emit(type, event = {}) { for (const listener of [...(listeners.get(type) || [])]) listener({ type, key: "", ...event }); },
    count() { return [...listeners.values()].reduce((total, set) => total + set.size, 0); }
  };
}
function classList(initial = []) {
  const values = new Set(initial);
  return { add: value => values.add(value), remove: value => values.delete(value), contains: value => values.has(value), toggle(value, force) { if (force ?? !values.has(value)) values.add(value); else values.delete(value); } };
}

{
  const windowTarget = eventTarget();
  windowTarget.requestAnimationFrame = callback => { callback(); return 1; };
  const documentTarget = eventTarget();
  documentTarget.visibilityState = "visible";
  const controls = [];
  const makeControl = () => {
    const wrapper = { classList: classList(), style: { values: new Map(), setProperty(name, value) { this.values.set(name, value); }, getPropertyValue(name) { return this.values.get(name) || ""; } }, querySelector: () => output };
    const output = { value: "9(기본)" };
    const input = { ...eventTarget(), min: "3", max: "34", value: "9", attributes: {}, closest: () => wrapper, setAttribute(name, value) { this.attributes[name] = value; } };
    return { input, output, wrapper };
  };
  let currentControl = null;
  const colors = Array.from({ length: 16 }, () => ({ classList: classList(), setAttribute() {} }));
  const drawScreen = { classList: classList(), scrollTop: 0 };
  const eraser = { classList: classList(), setAttribute() {} };
  const undo = {}, clearCanvas = {}, nextWord = {}, customWordButton = { setAttribute() {} }, customWordForm = { classList: classList(["hidden"]) };
  const customCategory = { value: "", focus() {} }, customWord = { value: "" }, customAnswers = { value: "" };
  const answerHelpButton = { setAttribute() {} }, answerHelp = { classList: classList(["hidden"]) }, saveDrawing = {};
  const document = Object.assign(documentTarget, {
    querySelectorAll: selector => selector === ".color" ? colors : [],
    querySelector: selector => selector === "#brushSize" ? currentControl?.input : selector === ".draw-screen" ? drawScreen : selector === "#eraser" ? eraser : null
  });
  const state = { route: "draw", word: { category: "테스트", word: "첫 제시어", answers: ["첫 제시어"], isCustomWord: false }, editDrawing: null, dirty: false, canvasInputCleanup: null, ctx: { globalCompositeOperation: "source-over" } };
  const appEl = { _html: "", set innerHTML(value) { this._html = value; currentControl = makeControl(); controls.push(currentControl); }, get innerHTML() { return this._html; } };
  const setupBrush = Function("window", "document", `${setup}; return setupBrushSizeControl;`)(windowTarget, document);
  let canvasCleanupCount = 0, sliderCleanupCount = 0;
  const setupCanvas = () => {
    const releaseSlider = setupBrush(currentControl.input);
    const onCanvasResize = () => {};
    const onCanvasPointerUp = () => {};
    windowTarget.addEventListener("resize", onCanvasResize);
    windowTarget.addEventListener("pointerup", onCanvasPointerUp);
    let disposed = false;
    state.canvasInputCleanup = () => {
      if (disposed) return;
      disposed = true;
      canvasCleanupCount++;
      releaseSlider();
      sliderCleanupCount++;
      windowTarget.removeEventListener("resize", onCanvasResize);
      windowTarget.removeEventListener("pointerup", onCanvasPointerUp);
    };
  };
  let wordNumber = 1;
  const randomWord = () => { wordNumber++; state.word = { category: "테스트", word: `${wordNumber}번 제시어`, answers: [`${wordNumber}번 제시어`], isCustomWord: false }; };
  const dependencies = { state, randomWord, escapeHtml: String, DRAWING_COLORS: Array.from({ length: 16 }, (_, index) => [`#${index}`, `${index}`, "solid"]), DEFAULT_DRAWING_COLOR_INDEX: 12, appEl, setupCanvas, document, selectDrawingColor() {}, eraser, undo, clearCanvas, nextWord, customWordButton, customWordForm, customCategory, customWord, customAnswers, answerHelpButton, answerHelp, saveDrawing, undoCanvas() {}, openClearCanvasModal() {}, confirm: () => true, isValidCategory: () => true, textLength: value => String(value).length, normalizeAnswer: String, showToast() {}, saveDrawingDraft() {} };
  const names = Object.keys(dependencies);
  const renderDraw = Function(...names, `"use strict"; ${renderDrawSource}; return renderDraw;`)(...names.map(name => dependencies[name]));

  renderDraw();
  const activeListenerCount = windowTarget.count() + documentTarget.count();
  assert.equal(activeListenerCount, 9, "one draw lifecycle owns seven slider and two canvas global listeners in this harness");
  for (let rerender = 1; rerender <= 3; rerender++) {
    const detached = controls.at(-1);
    const detachedProgress = detached.wrapper.style.getPropertyValue("--brush-progress");
    nextWord.onclick();
    assert.equal(canvasCleanupCount, rerender, `rerender ${rerender} cleans the previous canvas once`);
    assert.equal(sliderCleanupCount, rerender, `rerender ${rerender} cleans the previous slider once`);
    assert.equal(windowTarget.count() + documentTarget.count(), activeListenerCount, `rerender ${rerender} keeps the listener count stable`);
    detached.input.emit("pointerdown");
    windowTarget.emit("pointerup");
    windowTarget.emit("resize");
    assert.equal(detached.wrapper.classList.contains("is-active"), false, "a detached slider no longer reacts to pointer events");
    assert.equal(detached.wrapper.style.getPropertyValue("--brush-progress"), detachedProgress, "a detached slider no longer reacts to resize");
    currentControl.input.emit("pointerdown");
    assert.equal(currentControl.wrapper.classList.contains("is-active"), true, "the current slider still reacts to pointer input");
    currentControl.input.emit("keydown", { key: "ArrowRight" });
    assert.equal(currentControl.wrapper.classList.contains("is-active"), true, "the current slider still reacts to keyboard input");
    windowTarget.emit("pointerup");
  }
  const finalCleanup = state.canvasInputCleanup;
  state.canvasInputCleanup = null;
  finalCleanup();
  assert.equal(canvasCleanupCount, 4);
  assert.equal(sliderCleanupCount, 4);
  assert.equal(windowTarget.count() + documentTarget.count(), 0, "route exit removes the final global listeners");
}

console.log("Brush size slider static checks passed.");
