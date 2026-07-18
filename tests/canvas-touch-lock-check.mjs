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
  documentElement: { classList: classList() },
  body: { classList: classList(), style: { position: "relative", top: "1px", left: "2px", right: "3px", width: "90%" } },
  addEventListener(type, listener, listenerOptions) { listeners.set(type, listener); options.set(type, listenerOptions); }
};
const timers = new Map();
const scrollCalls = [];
const window = {
  scrollX: 12, scrollY: 240, nextTimer: 0,
  setTimeout(callback) { const id = ++this.nextTimer; timers.set(id, callback); return id; },
  clearTimeout(id) { timers.delete(id); },
  scrollTo(x, y) { scrollCalls.push([x, y]); this.scrollX = x; this.scrollY = y; }
};
const canvas = { contains: target => target?.insideCanvas === true };
const state = { route: "draw", canvas, history: [], canvasTouchIdentifiers: new Set(), canvasIgnoredTouchPointers: new Set(), activePointerId: null };
const code = [
  'const CANVAS_TOUCH_LOCK_CLASS = "canvas-touch-session-lock";',
  pick("preventIfCancelable"), pick("setCanvasTouchDocumentLock"), pick("cancelCanvasTouchFallbackCleanup"),
  pick("lockCanvasTouchSession"), pick("clearCanvasTouchSession"), pick("canvasTouchPointersIdle"), pick("scheduleCanvasTouchFallbackCleanup"),
  pick("eventTargetsCanvas"), pick("changedTouchIdentifiers"), pick("bindDocumentDrawingScrollBlocker")
].join("\n");
const api = Function("state", "document", "window", `${code}; return { bindDocumentDrawingScrollBlocker, lockCanvasTouchSession, clearCanvasTouchSession, scheduleCanvasTouchFallbackCleanup };`)(state, document, window);
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

assert.equal(api.lockCanvasTouchSession(), true, "the first accepted touch pointer can lock before touchstart");
assert.equal(api.scheduleCanvasTouchFallbackCleanup(), true, "an early pointer-only lock has a safety fallback");
window.scrollX = 30; window.scrollY = 360;
const firstStart = touchEvent({ target: { outside: true }, changed: [1], path: [{}, canvas, document] });
listeners.get("touchstart")(firstStart);
assert.equal(timers.size, 0, "touchstart handoff cancels the pointer-only fallback");
assert.equal(firstStart.prevented, true, "canvas touchstart is cancelled immediately");
assert.equal(locked(), true);
assert.deepEqual([...state.canvasTouchIdentifiers], [1]);
assert.deepEqual(state.history, [], "Touch Events never add strokes or history actions");
assert.deepEqual(state.canvasTouchLock, { scrollX: 12, scrollY: 240, bodyStyle: { position: "relative", top: "1px", left: "2px", right: "3px", width: "90%" } });
assert.equal(api.lockCanvasTouchSession(), false, "touchstart handoff and additional pointers cannot resave lock state");
assert.deepEqual(document.body.style, { position: "fixed", top: "-240px", left: "-12px", right: "0px", width: "100%" });

const secondStart = touchEvent({ target: { outside: true }, changed: [2] });
listeners.get("touchstart")(secondStart);
assert.equal(secondStart.prevented, true, "additional fingers join the active canvas session even if retargeted");
assert.deepEqual([...state.canvasTouchIdentifiers], [1, 2]);
window.scrollX = 0; window.scrollY = 0;
assert.equal(state.canvasTouchLock.scrollY, 240, "a second touch and viewport movement cannot replace the saved scroll position");

const movedOutside = touchEvent({ target: { outside: true } });
listeners.get("touchmove")(movedOutside);
assert.equal(movedOutside.prevented, true, "an active canvas session blocks retargeted touchmove");

listeners.get("touchend")(touchEvent({ changed: [1] }));
assert.equal(locked(), true, "ending one of two canvas touches keeps the document locked");
assert.deepEqual([...state.canvasTouchIdentifiers], [2]);
listeners.get("touchend")(touchEvent({ changed: [2] }));
assert.equal(locked(), false, "the final touch releases the document lock");
assert.equal(state.canvasTouchIdentifiers.size, 0);
assert.deepEqual(document.body.style, { position: "relative", top: "1px", left: "2px", right: "3px", width: "90%" });
assert.deepEqual(scrollCalls, [[12, 240]], "the final touch restores scroll exactly once");
listeners.get("touchend")(touchEvent({ changed: [2] }));
api.clearCanvasTouchSession();
assert.deepEqual(scrollCalls, [[12, 240]], "duplicate touch/pointer cleanup cannot restore scroll twice");

window.scrollX = 4; window.scrollY = 500;
listeners.get("touchstart")(touchEvent({ target: canvas, changed: [3] }));
assert.equal(state.canvasTouchLock.scrollY, 500, "a new session saves its own current scroll position");
window.scrollX = 0; window.scrollY = 0;
listeners.get("touchcancel")(touchEvent({ changed: [3] }));
assert.equal(state.canvasTouchIdentifiers.size, 0);
assert.equal(locked(), false, "touchcancel clears identifiers and lock classes");
assert.deepEqual(scrollCalls.at(-1), [4, 500]);

window.scrollX = 0; window.scrollY = 700;
listeners.get("touchstart")(touchEvent({ target: canvas, changed: [4] }));
window.scrollY = 0;
assert.equal(api.scheduleCanvasTouchFallbackCleanup(), true);
assert.equal(locked(), true, "pointer completion only schedules fallback and cannot unlock before touchend");
listeners.get("touchend")(touchEvent({ changed: [4] }));
assert.equal(timers.size, 0, "normal touchend cancels deferred pointer fallback");
api.clearCanvasTouchSession();
api.clearCanvasTouchSession();
assert.equal(state.canvasTouchIdentifiers.size, 0);
assert.equal(locked(), false, "route/release cleanup is idempotent");
assert.deepEqual(scrollCalls.at(-1), [0, 700]);

window.scrollX = 0; window.scrollY = 900;
assert.equal(api.lockCanvasTouchSession(), true);
window.scrollY = 0;
assert.equal(state.canvasTouchIdentifiers.size, 0, "early pointer lock may exist before touchstart identifiers arrive");
state.canvasIgnoredTouchPointers.add(99);
assert.equal(api.scheduleCanvasTouchFallbackCleanup(), false, "ignored touch pointers keep pointer-only fallback from unlocking early");
state.canvasIgnoredTouchPointers.clear();
assert.equal(api.scheduleCanvasTouchFallbackCleanup(), true, "pointer-only sessions still schedule fallback cleanup");
const fallback = [...timers.values()][0];
fallback();
assert.equal(locked(), false);
assert.deepEqual(scrollCalls.at(-1), [0, 900], "missing touchstart is restored exactly once by pointer fallback");
api.clearCanvasTouchSession();
assert.equal(scrollCalls.filter(([, y]) => y === 900).length, 1);

const lockCss = styles.match(/html\.canvas-touch-session-lock,[\s\S]*?\}/)?.[0] || "";
assert.match(lockCss, /overflow:\s*hidden/);
assert.match(lockCss, /overscroll-behavior:\s*none/);
assert.match(lockCss, /touch-action:\s*none/);
assert.match(styles, /body\.canvas-touch-session-lock\s*\{[^}]*position:\s*fixed[^}]*left:\s*0[^}]*right:\s*0[^}]*width:\s*100%/s);
assert.match(source, /body\.style\.top = `\$\{-scrollY\}px`/);
const setupSource = source.match(/function setupCanvas[\s\S]*?(?=function undoCanvas)/)?.[0] || "";
assert.match(setupSource, /window\.addEventListener\("blur", interrupt\)/);
assert.match(setupSource, /window\.addEventListener\("pagehide", interrupt\)/);
assert.match(setupSource, /visibilityState === "hidden"/);
assert.match(setupSource, /scheduleCanvasTouchFallbackCleanup/);
const startSource = setupSource.match(/const start = event => \{[\s\S]*?\r?\n  \};\r?\n  const move/)?.[0] || "";
assert.ok(startSource, "setupCanvas pointerdown handler must be extractable");
assert.ok(startSource.indexOf("lockCanvasTouchSession()") < startSource.indexOf("canvas.getBoundingClientRect()"), "pointerdown must lock before canvas bounds and coordinate reads");
assert.match(source.match(/function releaseCanvasHistory[\s\S]*?(?=function initializeCanvasHistory)/)?.[0] || "", /clearCanvasTouchSession/);
assert.match(source.match(/function cleanupScreenResources[\s\S]*?(?=function transitionRoute)/)?.[0] || "", /releaseCanvasHistory/);

console.log("Canvas touch session lock checks passed.");
