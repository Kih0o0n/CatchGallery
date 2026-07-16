import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const fixture = fs.readFileSync(new URL("./responsive-fixture.html", import.meta.url), "utf8");

function readArrayConstant(name) {
  const marker = `const ${name} =`;
  const start = app.indexOf(marker);
  assert.notEqual(start, -1, `${name} must exist`);
  const arrayStart = app.indexOf("[", start + marker.length);
  let depth = 0;
  let quote = null;
  for (let index = arrayStart; index < app.length; index++) {
    const character = app[index];
    if (quote) {
      if (character === "\\") index++;
      else if (character === quote) quote = null;
    } else if (character === '"' || character === "'") quote = character;
    else if (character === "[") depth++;
    else if (character === "]" && --depth === 0) return Function(`return (${app.slice(arrayStart, index + 1)})`)();
  }
  throw new Error(`could not extract ${name}`);
}

const drawingColors = readArrayConstant("DRAWING_COLORS");
assert.equal(drawingColors.length, 15, "the real app must expose all 15 drawing colors");

function pick(name) {
  const start = app.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  let depth = 0;
  let opened = false;
  for (let index = start; index < app.length; index++) {
    if (app[index] === "{") { depth++; opened = true; }
    else if (app[index] === "}" && opened && --depth === 0) return app.slice(start, index + 1);
  }
  throw new Error(`could not extract ${name}`);
}

function classList(initial = []) {
  const values = new Set(initial);
  return {
    contains: value => values.has(value),
    add: value => values.add(value),
    remove: value => values.delete(value),
    toggle(value, force) {
      const enabled = force === undefined ? !values.has(value) : force;
      if (enabled) values.add(value); else values.delete(value);
      return enabled;
    }
  };
}

// Execute renderDraw with its real template and bindings. The same controls are
// used for every viewport; no duplicate mobile/desktop canvas or tool DOM exists.
{
  const state = { word: { category: "테스트", word: "긴 제시어", answers: ["긴 제시어"], isCustomWord: false }, editDrawing: null, dirty: false, ctx: { globalCompositeOperation: "source-over" } };
  const appEl = { innerHTML: "" };
  const colors = Array.from({ length: drawingColors.length }, () => ({}));
  const drawScreen = { classList: classList() };
  const customWordForm = { classList: classList(["hidden"]), onsubmit: null };
  const customWordButton = { onclick: null, attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } };
  const answerHelp = { classList: classList(["hidden"]) };
  const answerHelpButton = { onclick: null, attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } };
  const customCategory = { value: "", focus() {} };
  const customWord = { value: "" };
  const customAnswers = { value: "" };
  const eraser = {};
  const undo = {};
  const clearCanvas = {};
  const nextWord = {};
  const saveDrawing = {};
  const document = {
    querySelectorAll: selector => selector === ".color" ? colors : [],
    querySelector: selector => selector === ".draw-screen" ? drawScreen : null
  };
  const names = ["state", "randomWord", "escapeHtml", "DRAWING_COLORS", "appEl", "setupCanvas", "document", "selectDrawingColor", "eraser", "undo", "clearCanvas", "nextWord", "customWordButton", "customWordForm", "customCategory", "customWord", "customAnswers", "answerHelpButton", "answerHelp", "saveDrawing", "undoCanvas", "openClearCanvasModal", "confirm", "isValidCategory", "textLength", "normalizeAnswer", "showToast", "saveDrawingDraft"];
  const values = [state, () => {}, value => String(value), drawingColors, appEl, () => {}, document, () => {}, eraser, undo, clearCanvas, nextWord, customWordButton, customWordForm, customCategory, customWord, customAnswers, answerHelpButton, answerHelp, saveDrawing, () => {}, () => {}, () => true, () => true, value => String(value).length, value => String(value), () => {}, () => {}];
  const renderDraw = Function(...names, `"use strict"; ${pick("renderDraw")}; return renderDraw;`)(...values);
  renderDraw();

  for (const id of ["drawingCanvas", "brushSize", "eraser", "undo", "clearCanvas", "saveDrawing", "customWordForm", "customWordButton"]) {
    assert.equal((appEl.innerHTML.match(new RegExp(`id="${id}"`, "g")) || []).length, 1, `${id} must appear once`);
  }
  assert.match(appEl.innerHTML, /<canvas id="drawingCanvas" width="720" height="720"/);
  assert.equal((appEl.innerHTML.match(/data-color=/g) || []).length, drawingColors.length);
  assert.match(appEl.innerHTML, /<div class="tools"><div class="colors"[\s\S]*<div class="tool-grid"><input id="brushSize"[\s\S]*id="eraser"[\s\S]*id="undo"[\s\S]*id="clearCanvas"/);
  assert.ok(appEl.innerHTML.indexOf('class="card word-card"') < appEl.innerHTML.indexOf('class="custom-word-form hidden"'));
  assert.ok(appEl.innerHTML.indexOf('class="custom-word-form hidden"') < appEl.innerHTML.indexOf('id="drawingCanvas"'));
  assert.ok(appEl.innerHTML.indexOf('id="drawingCanvas"') < appEl.innerHTML.indexOf('id="saveDrawing"'));
  assert.equal(typeof eraser.onclick, "function");
  assert.equal(typeof undo.onclick, "function");
  assert.equal(typeof clearCanvas.onclick, "function");
  assert.equal(typeof saveDrawing.onclick, "function");
  eraser.onclick();
  assert.equal(state.ctx.globalCompositeOperation, "destination-out");
  customWordButton.onclick();
  assert.equal(customWordForm.classList.contains("hidden"), false);
  assert.equal(drawScreen.classList.contains("custom-word-open"), true);
  customWordButton.onclick();
  assert.equal(customWordForm.classList.contains("hidden"), true);
  assert.equal(drawScreen.classList.contains("custom-word-open"), false);
}

// Execute the existing card builders and verify the data contracts consumed by
// the lazy loaders and event binders remain intact.
{
  const drawing = { id: "drawing-1", category: "동물", word: "고양이", drawerId: "drawer", drawerNickname: "그린이", solverNickname: "맞힌이", status: "solved", likeCount: 2, isLiked: false, expiresAt: Date.now() + 1000, revisionCount: 1 };
  const state = { user: { id: "viewer" }, hintUsed: {} };
  const openDrawingCard = Function("state", "isOwnDrawing", "formatTime", "escapeHtml", "solverRewardHtml", `"use strict"; ${pick("openDrawingCard")}; return openDrawingCard;`)(state, () => false, () => "1:00", String, () => "reward");
  const solve = openDrawingCard(drawing, 0);
  assert.match(solve, /data-solve-card="drawing-1"/);
  assert.match(solve, /data-solve-slot="drawing-1"/);
  assert.match(solve, /data-solve-image="drawing-1"/);
  assert.match(solve, /data-answer-form="drawing-1"/);

  const galleryFrame = Function("state", "escapeHtml", "drawerName", "solverName", `"use strict"; ${pick("galleryFrame")}; return galleryFrame;`)(state, String, item => item.drawerNickname, item => item.solverNickname);
  const galleryThumbs = Function("state", "escapeHtml", "drawerName", `"use strict"; ${pick("galleryThumbs")}; return galleryThumbs;`)(state, String, item => item.drawerNickname);
  assert.match(galleryFrame([drawing], 0), /data-gallery-card="drawing-1"[\s\S]*data-detail-image="drawing-1"[\s\S]*data-prev[\s\S]*data-next/);
  assert.match(galleryThumbs([drawing]), /data-gallery-card="drawing-1"[\s\S]*data-thumb="0"[\s\S]*data-thumbnail-image="drawing-1"[\s\S]*data-like="drawing-1"/);

  const manageCard = Function("STATUS_LABEL", "formatTime", "escapeHtml", "solverName", "manageImageMarkup", `"use strict"; ${pick("manageCard")}; return manageCard;`)({ open: "진행 중", solved: "완료" }, () => "1:00", String, item => item.solverNickname, id => `<img data-manage-image="${id}">`);
  const manage = manageCard({ ...drawing, status: "open" });
  assert.match(manage, /data-manage-card="drawing-1"[\s\S]*data-manage-slot="drawing-1"[\s\S]*data-manage-image="drawing-1"[\s\S]*data-edit="drawing-1"[\s\S]*data-withdraw="drawing-1"/);
}

assert.doesNotMatch(styles, /100dvh\s*-\s*61px|100dvh\s*-\s*375px/);
assert.match(styles, /\.app-shell\s*\{[^}]*max-width:\s*1180px/);
assert.match(styles, /\.canvas-wrap\s*\{[^}]*max-width:\s*720px/);
assert.match(styles, /@media \(min-width: 960px\) and \(min-height: 501px\) and \(orientation: landscape\)[\s\S]*grid-template-areas:\s*"canvas heading"/);
assert.match(styles, /@media \(min-width: 700px\)[\s\S]*\.answer-row\s*\{ position:\s*static/);
assert.match(styles, /\.modal\s*\{[^}]*max-height:[^}]*overflow:\s*auto/);
assert.match(styles, /env\(safe-area-inset-left\)|env\(safe-area-inset-right\)/);
assert.doesNotMatch(styles, /\.draw-screen \.canvas-wrap[^}]*dvh/);
assert.match(styles, /\.draw-screen \.canvas-wrap\s*\{[^}]*width:\s*100%[^}]*max-width:\s*720px/);
assert.match(fixture, /<header class="app-header">\s*<button class="home-button"[\s\S]*<button class="brand-button"[\s\S]*<div class="score-chip"/);
assert.match(fixture, /<div class="tools"><div class="colors" data-colors><\/div><div class="tool-grid"><input id="brushSize"[\s\S]*id="eraser"[\s\S]*id="undo"[\s\S]*id="clearCanvas"/);
assert.match(fixture, /<div class="card word-card"[\s\S]*<form class="custom-word-form hidden"[\s\S]*<canvas id="drawingCanvas" width="720" height="720"[\s\S]*<button id="saveDrawing"/);
assert.match(fixture, /drawingColors = JSON\.parse\(params\.get\("colors"\)/);
assert.match(fixture, /<div id="galleryContent"><div class="frame"[\s\S]*<div class="frame-nav"[\s\S]*<div class="frame-info"/);

console.log("Responsive layout structure checks passed.");
