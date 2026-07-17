import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");

function pick(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  let depth = 0, opened = false;
  for (let index = start; index < source.length; index++) {
    if (source[index] === "{") { depth++; opened = true; }
    else if (source[index] === "}" && opened && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`could not extract ${name}`);
}

function classList() {
  const values = new Set();
  return { toggle(name, force) { if (force) values.add(name); else values.delete(name); }, contains: name => values.has(name) };
}

const listeners = new Map();
const options = new Map();
const document = {
  documentElement: { classList: classList() }, body: { classList: classList() },
  addEventListener(type, listener, listenerOptions) { listeners.set(type, listener); options.set(type, listenerOptions); }
};
const window = {};
const canvas = { contains: target => target?.insideCanvas === true };
const state = { route: "draw", canvas, history: [], canvasTouchIdentifiers: new Set() };
const code = [
  'const CANVAS_TOUCH_LOCK_CLASS = "canvas-touch-session-lock";',
  pick("preventIfCancelable"), pick("setCanvasTouchDocumentLock"), pick("clearCanvasTouchSession"),
  pick("eventTargetsCanvas"), pick("changedTouchIdentifiers"), pick("bindDocumentDrawingScrollBlocker")
].join("\n");
const api = Function("state", "document", "window", `${code}; return { bindDocumentDrawingScrollBlocker, clearCanvasTouchSession };`)(state, document, window);
api.bindDocumentDrawingScrollBlocker();

for (const type of ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]) {
  assert.equal(options.get(type)?.passive, false, `${type} must be non-passive`);
  assert.equal(options.get(type)?.capture, true, `${type} must run during capture`);
}

function touchEvent({ target, changed = [], path, cancelable = true } = {}) {
  return {
    target, changedTouches: changed.map(identifier => ({ identifier })), cancelable, prevented: false,
    preventDefault() { this.prevented = true; },
    ...(path ? { composedPath: () => path } : {})
  };
}
const locked = () => document.documentElement.classList.contains("canvas-touch-session-lock") && document.body.classList.contains("canvas-touch-session-lock");

const outsideStart = touchEvent({ target: { outside: true }, changed: [9] });
listeners.get("touchstart")(outsideStart);
assert.equal(outsideStart.prevented, false, "touches starting outside the canvas keep normal page scrolling");
assert.equal(locked(), false);

const firstStart = touchEvent({ target: { outside: true }, changed: [1], path: [{}, canvas, document] });
listeners.get("touchstart")(firstStart);
assert.equal(firstStart.prevented, true, "canvas touchstart is cancelled immediately");
assert.equal(locked(), true);
assert.deepEqual([...state.canvasTouchIdentifiers], [1]);
assert.deepEqual(state.history, [], "Touch Events never add strokes or history actions");

const secondStart = touchEvent({ target: { outside: true }, changed: [2] });
listeners.get("touchstart")(secondStart);
assert.equal(secondStart.prevented, true, "additional fingers join the active canvas session even if retargeted");
assert.deepEqual([...state.canvasTouchIdentifiers], [1, 2]);

const movedOutside = touchEvent({ target: { outside: true } });
listeners.get("touchmove")(movedOutside);
assert.equal(movedOutside.prevented, true, "an active canvas session blocks retargeted touchmove");

listeners.get("touchend")(touchEvent({ changed: [1] }));
assert.equal(locked(), true, "ending one of two canvas touches keeps the document locked");
assert.deepEqual([...state.canvasTouchIdentifiers], [2]);
listeners.get("touchend")(touchEvent({ changed: [2] }));
assert.equal(locked(), false, "the final touch releases the document lock");
assert.equal(state.canvasTouchIdentifiers.size, 0);

listeners.get("touchstart")(touchEvent({ target: canvas, changed: [3] }));
listeners.get("touchcancel")(touchEvent({ changed: [3] }));
assert.equal(state.canvasTouchIdentifiers.size, 0);
assert.equal(locked(), false, "touchcancel clears identifiers and lock classes");

listeners.get("touchstart")(touchEvent({ target: canvas, changed: [4] }));
api.clearCanvasTouchSession();
api.clearCanvasTouchSession();
assert.equal(state.canvasTouchIdentifiers.size, 0);
assert.equal(locked(), false, "route/release cleanup is idempotent");

const lockCss = styles.match(/html\.canvas-touch-session-lock,[\s\S]*?\}/)?.[0] || "";
assert.match(lockCss, /overflow:\s*hidden/);
assert.match(lockCss, /overscroll-behavior:\s*none/);
assert.doesNotMatch(lockCss, /position:\s*fixed|\btop\s*:/);
assert.doesNotMatch(source, /body\.dataset\.scrollY|body\.style\.top/);
const setupSource = source.match(/function setupCanvas[\s\S]*?(?=function undoCanvas)/)?.[0] || "";
assert.doesNotMatch(setupSource, /window\.scrollTo\(/);
assert.match(setupSource, /window\.addEventListener\("blur", interrupt\)/);
assert.match(setupSource, /window\.addEventListener\("pagehide", interrupt\)/);
assert.match(setupSource, /visibilityState === "hidden"/);
assert.match(setupSource, /clearTouchSessionIfPointerIdle/);
assert.match(source.match(/function releaseCanvasHistory[\s\S]*?(?=function initializeCanvasHistory)/)?.[0] || "", /clearCanvasTouchSession/);
assert.match(source.match(/function cleanupScreenResources[\s\S]*?(?=function transitionRoute)/)?.[0] || "", /releaseCanvasHistory/);

console.log("Canvas touch session lock checks passed.");
