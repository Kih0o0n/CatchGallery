import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const colorExpression = app.match(/const DRAWING_COLORS = (\[[\s\S]*?\]);\r?\n/)?.[1];
const drawingHelperSource = app.match(/function resetDrawingDraft[\s\S]*?(?=function normalizeAnswer)/)?.[0];
const saveSource = app.match(/async function saveDrawingDraft[\s\S]*?(?=function showDrawingPublishedModal)/)?.[0];
const modalSource = app.match(/function showDrawingPublishedModal[\s\S]*?(?=function preventIfCancelable)/)?.[0];
const randomWordSource = app.match(/function wordKey[\s\S]*?(?=function resetDrawingDraft)/)?.[0];
assert.ok(colorExpression && drawingHelperSource && saveSource && modalSource && randomWordSource, "v1.2.0 sources must be readable");

const colors = Function(`return (${colorExpression})`)();
const existingColors = ["#3e3a48", "#ed5f72", "#f29b38", "#f0cf3a", "#57b879", "#45a8df", "#745bc7"];
const addedColors = ["#f08fbd", "#8b5a3c", "#83d3f2", "#2f7d57", "#8b8f9c", "#f2c6a0", "#304a8a", "#b69de8"];
assert.equal(colors.length, 15);
assert.equal(new Set(colors.map(([value]) => value)).size, 15);
for (const value of [...existingColors, ...addedColors]) assert.ok(colors.some(([candidate]) => candidate === value), value);
assert.ok(colors.every(([, name]) => typeof name === "string" && name.length > 0));
assert.match(app, /aria-label="\$\{name\} 색연필"/);
assert.match(app, /title="\$\{name\} 색연필"/);

function drawingHelpers(state, overrides = {}) {
  const dependencies = {
    state,
    randomWord: overrides.randomWord || (() => { state.word = { word: "새 제시어" }; }),
    renderDraw: overrides.renderDraw || (() => {}),
    route: overrides.route || (() => {}),
    document: overrides.document || { querySelectorAll: () => [] }
  };
  const names = Object.keys(dependencies);
  return Function(...names, `"use strict"; ${drawingHelperSource}; return { resetDrawingDraft, startNewDrawing, selectDrawingColor };`)(...names.map(name => dependencies[name]));
}

{
  const cleared = [];
  const state = {
    route: "draw", word: { word: "방금 제시어" }, editDrawing: { id: "edit" },
    seenWordKeys: new Set(["seen-word"]), canvas: { width: 720, height: 720 },
    ctx: { globalCompositeOperation: "destination-out", clearRect: (...args) => cleared.push(args) },
    drawing: true, activePointerId: 9, dirty: true, history: ["undo"], publishing: true, drawingPublished: true
  };
  let rendered = 0;
  let seenDuringSelection = null;
  const helpers = drawingHelpers(state, {
    randomWord: () => { seenDuringSelection = new Set(state.seenWordKeys); state.word = { word: "새 제시어" }; },
    renderDraw: () => { rendered += 1; }
  });
  helpers.startNewDrawing({ preserveSeenWords: true });
  assert.equal(rendered, 1);
  assert.ok(seenDuringSelection.has("seen-word"), "continuous drawing must preserve seen prompts");
  assert.deepEqual(cleared, [[0, 0, 720, 720]]);
  assert.equal(state.word.word, "새 제시어");
  assert.equal(state.editDrawing, null);
  assert.equal(state.dirty, false);
  assert.deepEqual(state.history, []);
  assert.equal(state.drawing, false);
  assert.equal(state.activePointerId, null);
  assert.equal(state.publishing, false);
  assert.equal(state.drawingPublished, false);
  assert.equal(state.canvas, null);
  assert.equal(state.ctx, null);
}

{
  const state = { route: "manage", word: { word: "old" }, editDrawing: { id: "edit" }, seenWordKeys: new Set(["old"]), canvas: null, ctx: null, drawing: false, activePointerId: null, dirty: false, history: [], publishing: false, drawingPublished: false };
  const routes = [];
  drawingHelpers(state, { route: name => routes.push(name) }).startNewDrawing();
  assert.equal(state.seenWordKeys.size, 0, "manage entry must start a fresh prompt session");
  assert.equal(state.editDrawing, null);
  assert.deepEqual(routes, ["draw"]);
}

{
  const WORDS = [
    { category: "테스트", word: "첫째", answers: ["첫째"] },
    { category: "테스트", word: "둘째", answers: ["둘째"] }
  ];
  const state = { word: { ...WORDS[1], isCustomWord: false }, seenWordKeys: new Set(["테스트\u0000첫째", "테스트\u0000둘째"]) };
  const randomWord = Function("state", "WORDS", "Math", `"use strict"; ${randomWordSource}; return randomWord;`)(state, WORDS, { random: () => 0, floor: Math.floor });
  randomWord();
  assert.equal(state.word.word, "첫째", "a reset cycle must avoid the immediately previous prompt");
}

function classList(initial = []) {
  const values = new Set(initial);
  return { add: value => values.add(value), remove: value => values.delete(value), contains: value => values.has(value) };
}

{
  const state = { ctx: { globalCompositeOperation: "destination-out", strokeStyle: "old" } };
  const first = { dataset: { color: "#3e3a48" }, classList: classList(["selected"]) };
  const next = { dataset: { color: "#83d3f2" }, classList: classList() };
  drawingHelpers(state).selectDrawingColor(next, [first, next]);
  assert.equal(first.classList.contains("selected"), false);
  assert.equal(next.classList.contains("selected"), true);
  assert.equal(state.ctx.globalCompositeOperation, "source-over");
  assert.equal(state.ctx.strokeStyle, "#83d3f2");
}

function saveHarness({ edit = null, fail = false, deferred = false } = {}) {
  const state = { dirty: true, publishing: false, drawingPublished: false, editDrawing: edit, word: { word: "제시어" }, canvas: {}, saveOperationId: 0, activeSaveOperationId: null };
  const calls = { publish: 0, update: 0, modal: 0, routes: [], toasts: [] };
  let release;
  let transitionCurrent = true;
  const wait = deferred ? new Promise(resolve => { release = resolve; }) : null;
  const dependencies = {
    state,
    routeTransitionId: 1,
    isTransitionCurrent: () => transitionCurrent,
    showToast: message => calls.toasts.push(message),
    updateDrawing: async () => { calls.update += 1; if (fail) throw new Error("save failed"); },
    publishDrawing: async () => { calls.publish += 1; if (wait) await wait; if (fail) throw new Error("save failed"); },
    route: name => calls.routes.push(name),
    showDrawingPublishedModal: () => { calls.modal += 1; },
    userErrorMessage: (_error, fallback) => fallback,
    console: { error: () => {} }
  };
  const names = Object.keys(dependencies);
  const saveDrawingDraft = Function(...names, `"use strict"; ${saveSource}; return saveDrawingDraft;`)(...names.map(name => dependencies[name]));
  return { state, calls, release, invalidate: () => { transitionCurrent = false; state.activeSaveOperationId = null; }, button: { disabled: false, textContent: edit ? "수정 저장하기" : "게시하기" }, run: button => saveDrawingDraft(edit, button) };
}

{
  const harness = saveHarness({ deferred: true });
  const pending = harness.run(harness.button);
  harness.invalidate();
  harness.state.publishing = true;
  harness.release();
  assert.equal(await pending, "cancelled");
  assert.equal(harness.state.publishing, true, "an old save finally must not clear a newer canvas save state");
  assert.equal(harness.calls.modal, 0, "an old save must not show a completion modal");
  assert.deepEqual(harness.calls.toasts, [], "an old save must not show a toast");
  assert.deepEqual(harness.calls.routes, [], "an old save must not navigate");
}

{
  const harness = saveHarness({ deferred: true });
  const first = harness.run(harness.button);
  assert.equal(await harness.run(harness.button), "ignored", "a second publish click must be ignored");
  harness.release();
  assert.equal(await first, "published");
  assert.equal(harness.calls.publish, 1);
  assert.equal(harness.calls.modal, 1);
  assert.deepEqual(harness.calls.routes, [], "new publishing must not route to manage automatically");
  assert.equal(harness.state.drawingPublished, true);
  assert.equal(harness.button.disabled, true);
}

{
  const harness = saveHarness({ fail: true });
  const originalWord = harness.state.word;
  assert.equal(await harness.run(harness.button), "failed");
  assert.equal(harness.calls.modal, 0);
  assert.equal(harness.state.word, originalWord);
  assert.equal(harness.state.dirty, true);
  assert.equal(harness.button.disabled, false);
  assert.equal(harness.button.textContent, "게시하기");
}

{
  const harness = saveHarness({ edit: { id: "edit" } });
  assert.equal(await harness.run(harness.button), "updated");
  assert.equal(harness.calls.update, 1);
  assert.equal(harness.calls.modal, 0);
  assert.deepEqual(harness.calls.routes, ["manage"]);
  assert.equal(harness.state.editDrawing, null);
}

function modalHarness(destination) {
  const buttons = {
    draw: { disabled: false, focus() { this.focused = true; }, onclick: null },
    manage: { disabled: false, focus() {}, onclick: null }
  };
  const root = {
    innerHTML: "",
    querySelectorAll: selector => selector === "button" ? [buttons.draw, buttons.manage] : [],
    querySelector: selector => selector === "[data-draw-again]" ? buttons.draw : buttons.manage
  };
  const state = { drawingPublished: true };
  const calls = { starts: [], resets: 0, routes: [] };
  const dependencies = {
    document: { querySelector: selector => selector === "#modalRoot" ? root : null },
    state,
    startNewDrawing: options => calls.starts.push(options),
    resetDrawingDraft: () => { calls.resets += 1; state.drawingPublished = false; },
    route: name => calls.routes.push(name)
  };
  const names = Object.keys(dependencies);
  const showDrawingPublishedModal = Function(...names, `"use strict"; ${modalSource}; return showDrawingPublishedModal;`)(...names.map(name => dependencies[name]));
  showDrawingPublishedModal();
  assert.match(root.innerHTML, /그림을 게시했어요! 🎉/);
  assert.match(root.innerHTML, /다른 그림 그리기/);
  assert.match(root.innerHTML, /내 그림 관리/);
  buttons[destination].onclick();
  buttons[destination].onclick();
  return { buttons, calls, root };
}

{
  const { calls, root } = modalHarness("draw");
  assert.deepEqual(calls.starts, [{ preserveSeenWords: true }]);
  assert.equal(calls.resets, 0);
  assert.deepEqual(calls.routes, []);
  assert.equal(root.innerHTML, "");
}

{
  const { calls } = modalHarness("manage");
  assert.equal(calls.resets, 1);
  assert.deepEqual(calls.routes, ["manage"]);
}

assert.doesNotMatch(modalSource, /addEventListener\("keydown"|publish-complete-backdrop[^\n]+onclick/);
assert.match(app, /id="newDrawingFromManage"[^>]*>✏️ 새 그림 그리기/);
assert.match(app, /newDrawingFromManage[\s\S]{0,300}startNewDrawing\(\)/);
assert.match(app, /id="customWordForm" class="custom-word-form hidden"/);
assert.match(app, /id="answerHelp" class="answer-help hidden"/);
assert.match(app, /eraser\.onclick[\s\S]{0,100}destination-out/);
assert.match(app, /undo\.onclick = undoCanvas/);
assert.match(app, /clearCanvas\.onclick = \(\) => clearCanvasBoard\(true\)/);
assert.match(styles, /\.colors[^}]+grid-template-columns:\s*repeat\(8,/);
assert.match(styles, /@media \(max-width: 699px\)[\s\S]+\.draw-screen \.color \{ width: 29px; height: 29px/);
assert.doesNotMatch(styles.match(/\.colors \{[^}]+\}/)?.[0] || "", /overflow-x|white-space:\s*nowrap/);
assert.match(app, /home-version[^\n]+v1\.2\.0/);

console.log("v1.2.0 drawing flow checks passed.");
