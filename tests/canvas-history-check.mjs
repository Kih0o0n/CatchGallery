import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
function pick(name) {
  const token = `function ${name}(`;
  const start = source.indexOf(token);
  assert.notEqual(start, -1, `${name} must exist`);
  let depth = 0, opened = false;
  for (let i = start; i < source.length; i++) {
    if (source[i] === "{") { depth++; opened = true; }
    else if (source[i] === "}" && opened && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`could not extract ${name}`);
}
function fakeContext() {
  const calls = [];
  return {
    calls, globalCompositeOperation: "source-over", strokeStyle: "#111", fillStyle: "#111", lineWidth: 9, lineCap: "", lineJoin: "",
    clearRect: (...args) => calls.push(["clearRect", ...args]),
    drawImage: (...args) => calls.push(["drawImage", ...args]),
    beginPath: () => calls.push(["beginPath"]), moveTo: (...args) => calls.push(["moveTo", ...args]),
    lineTo: (...args) => calls.push(["lineTo", ...args]), arc: (...args) => calls.push(["arc", ...args]),
    stroke: () => calls.push(["stroke"]), fill: () => calls.push(["fill"]), closePath: () => calls.push(["closePath"])
  };
}
function fakeCanvas(context = fakeContext()) {
  const listeners = new Map();
  return {
    width: 720, height: 720, isConnected: true, context, listeners, rectReads: 0, captures: new Set(),
    getContext: (...args) => { context.contextArgs = args; return context; },
    getBoundingClientRect() { this.rectReads++; return { left: 10, top: 20, width: 360, height: 360 }; },
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type, listener) { if (listeners.get(type) === listener) listeners.delete(type); },
    emit(type, values = {}) { listeners.get(type)?.({ pointerId: 7, pointerType: "touch", isPrimary: true, button: 0, buttons: 1, pressure: 0.5, clientX: 10, clientY: 20, cancelable: true, preventDefault() { this.prevented = true; }, ...values }); },
    setPointerCapture(id) { if (this.throwSetCapture) throw new Error("capture failed"); this.captures.add(id); },
    hasPointerCapture(id) { return this.captures.has(id); },
    releasePointerCapture(id) { if (this.throwReleaseCapture) throw new Error("release failed"); this.captures.delete(id); this.releaseCount = (this.releaseCount || 0) + 1; }
  };
}
function fakeEventTarget() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type, listener) { if (listeners.get(type) === listener) listeners.delete(type); },
    emit(type, values = {}) { listeners.get(type)?.({ pointerId: 7, pointerType: "touch", buttons: 0, pressure: 0, cancelable: true, preventDefault() {}, ...values }); }
  };
}
const actionNames = ["releaseCanvasHistory", "initializeCanvasHistory", "applyCanvasAction", "compactCanvasHistory", "commitCanvasAction", "redrawCanvasFromHistory", "redrawCanvasWhenIdle", "flushPendingCanvasRedraw", "canvasPoint", "sameCanvasPoint", "canvasContentAfterAction", "canvasHasVisibleContent", "safeSetPointerCapture", "safeReleasePointerCapture", "pointerMoveShowsContactEnded"];
function historyHarness() {
  const screenContext = fakeContext();
  const screen = fakeCanvas(screenContext);
  const bases = [];
  const document = { createElement: () => { const canvas = fakeCanvas(); bases.push(canvas); return canvas; } };
  const state = { canvas: screen, ctx: screenContext, history: [], historyBaseCanvas: null, historyBaseContext: null, historyBaseReady: false, historyBaseHasContent: false, historyRedrawPending: false, activeStroke: null, canvasRect: null, brushInput: null, canvasInputCleanup: null, drawing: false, activePointerId: null, dirty: false };
  const code = actionNames.map(pick).join("\n");
  const api = Function("state", "document", "DRAWING_HISTORY_LIMIT", `"use strict"; ${code}; return { ${actionNames.join(",")} };`)(state, document, 15);
  api.initializeCanvasHistory(screen, true);
  return { state, screen, screenContext, base: bases[0], baseContext: bases[0].context, api };
}

assert.doesNotMatch(source, /getImageData|putImageData|willReadFrequently/, "pixel snapshots and readback context options must be removed");
assert.match(source, /const DRAWING_HISTORY_LIMIT = 15/);

{
  const { api } = historyHarness();
  const context = fakeContext();
  api.applyCanvasAction(context, { type: "stroke", compositeOperation: "destination-out", color: "#abc", width: 20, points: [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }] });
  assert.equal(context.globalCompositeOperation, "destination-out");
  assert.equal(context.strokeStyle, "#abc");
  assert.equal(context.lineWidth, 20);
  assert.equal(context.lineCap, "round"); assert.equal(context.lineJoin, "round");
  assert.deepEqual(context.calls, [["beginPath"], ["moveTo", 1, 2], ["lineTo", 3, 4], ["lineTo", 5, 6], ["stroke"], ["closePath"]]);
  api.applyCanvasAction(context, { type: "stroke", compositeOperation: "source-over", color: "#def", width: 12, points: [{ x: 7, y: 8 }] });
  assert.deepEqual(context.calls.slice(-4), [["beginPath"], ["arc", 7, 8, 6, 0, Math.PI * 2], ["fill"], ["closePath"]], "a one-point stroke redraws as a round dot");
  api.applyCanvasAction(context, { type: "clear" });
  assert.deepEqual(context.calls.at(-1), ["clearRect", 0, 0, 720, 720]);
}

{
  const h = historyHarness();
  const actions = Array.from({ length: 17 }, (_, i) => ({ type: "stroke", compositeOperation: "source-over", color: `#${i}`, width: i + 1, points: [{ x: i, y: 0 }, { x: i, y: 1 }] }));
  actions.forEach(h.api.commitCanvasAction);
  assert.equal(h.state.history.length, 15);
  assert.deepEqual(h.state.history.map(action => action.points[0].x), actions.slice(2).map(action => action.points[0].x));
  assert.deepEqual(h.baseContext.calls.filter(call => call[0] === "moveTo"), [["moveTo", 0, 0], ["moveTo", 1, 0]], "old actions fold into the base in order");
  assert.ok(h.state.history.every(action => !Object.values(action).includes(h.screen) && !Object.values(action).includes(h.screenContext)));
}

{
  const h = historyHarness();
  h.api.commitCanvasAction({ type: "stroke", compositeOperation: "source-over", color: "red", width: 14, points: [{ x: 9, y: 10 }] });
  for (let i = 0; i < 15; i++) h.api.commitCanvasAction({ type: "stroke", compositeOperation: "source-over", color: "black", width: 2, points: [{ x: i, y: 0 }, { x: i, y: 1 }] });
  assert.deepEqual(h.baseContext.calls.find(call => call[0] === "arc"), ["arc", 9, 10, 7, 0, Math.PI * 2], "history compression preserves a dot");
  assert.equal(h.state.historyBaseHasContent, true);
}

{
  const h = historyHarness();
  h.screenContext.globalCompositeOperation = "destination-out";
  h.screenContext.strokeStyle = "pink";
  h.screenContext.lineWidth = 33;
  const stroke = { type: "stroke", compositeOperation: "source-over", color: "blue", width: 8, points: [{ x: 0, y: 0 }, { x: 2, y: 2 }] };
  h.state.history = [stroke, { type: "clear" }, { ...stroke, color: "green" }];
  h.api.redrawCanvasFromHistory();
  assert.equal(h.screenContext.globalCompositeOperation, "destination-out");
  assert.equal(h.screenContext.strokeStyle, "pink");
  assert.equal(h.screenContext.lineWidth, 33);
  const order = h.screenContext.calls.map(call => call[0]);
  assert.ok(order.indexOf("drawImage") < order.indexOf("moveTo"));
  assert.ok(order.indexOf("clearRect", 1) > order.indexOf("moveTo"), "clear replays between strokes");
}

function setupHarness({ imageData = null, current = true, throwSetCapture = false, throwReleaseCapture = false } = {}) {
  const context = fakeContext();
  const canvas = fakeCanvas(context);
  const baseContext = fakeContext();
  const baseCanvas = fakeCanvas(baseContext);
  const brush = { value: "9" };
  canvas.throwSetCapture = throwSetCapture;
  canvas.throwReleaseCapture = throwReleaseCapture;
  const windowTarget = fakeEventTarget();
  let drawingQueries = 0, brushQueries = 0, locks = 0, unlocks = 0, image;
  const warnings = [];
  const state = { route: "draw", canvas: null, ctx: null, history: [], historyBaseCanvas: null, historyBaseContext: null, historyBaseReady: false, historyBaseHasContent: false, historyRedrawPending: false, activeStroke: null, canvasRect: null, brushInput: null, canvasInputCleanup: null, drawing: false, activePointerId: null, dirty: false, editImageRequestId: 0 };
  const documentEvents = fakeEventTarget();
  const document = {
    ...documentEvents,
    visibilityState: "visible",
    querySelector(selector) { if (selector === "#drawingCanvas") { drawingQueries++; return canvas; } if (selector === "#brushSize") { brushQueries++; return brush; } return null; },
    createElement: () => baseCanvas
  };
  class TestImage { constructor() { image = this; } set src(value) { this.value = value; } }
  const helperCode = actionNames.map(pick).join("\n");
  const setupApi = Function("state", "document", "window", "DRAWING_HISTORY_LIMIT", "PEN_TOUCH_TAKEOVER_DELAY_MS", "bindDocumentDrawingScrollBlocker", "preventIfCancelable", "lockDrawingScroll", "unlockDrawingScroll", "Image", "routeTransitionId", "isTransitionCurrent", "console", `"use strict"; ${helperCode}; ${pick("setupCanvas")}; return { setupCanvas, releaseCanvasHistory, canvasHasVisibleContent };`)(
    state, document, windowTarget, 15, 1500, () => {}, event => event?.preventDefault?.(), () => { locks++; }, () => { unlocks++; }, TestImage, 1, () => current, { warn(...args) { warnings.push(args); } }
  );
  setupApi.setupCanvas(imageData);
  return { state, canvas, context, baseCanvas, baseContext, brush, window: windowTarget, document, api: setupApi, releaseCanvasHistory: setupApi.releaseCanvasHistory, image: () => image, warnings, counts: () => ({ drawingQueries, brushQueries, locks, unlocks }) };
}
function assertPointerMetadataCleared(state) {
  assert.equal(state.activePointerId, null);
  assert.equal(state.activePointerType, null);
  assert.equal(state.activePointerStartedAt, null);
  assert.equal(state.activePointerLastEventAt, null);
  assert.equal(state.activePointerCaptured, false);
}

{
  const h = setupHarness();
  assert.deepEqual(h.context.contextArgs, ["2d"], "screen context uses plain getContext(2d) without options");
  h.canvas.emit("pointerdown", { clientX: 20, clientY: 30 });
  h.brush.value = "30";
  h.context.strokeStyle = "changed-after-start";
  h.canvas.emit("pointermove", { clientX: 30, clientY: 40 });
  h.canvas.emit("pointermove", { clientX: 40, clientY: 50 });
  h.canvas.emit("pointerup", { clientX: 40, clientY: 50 });
  h.canvas.emit("lostpointercapture");
  assert.equal(h.canvas.rectReads, 1);
  assert.equal(h.counts().brushQueries, 1);
  assert.equal(h.state.history.length, 1);
  assert.equal(h.state.history[0].width, 9);
  assert.equal(h.state.history[0].color, "#3e3a48");
  assert.deepEqual(h.state.history[0].points, [{ x: 20, y: 20 }, { x: 40, y: 40 }, { x: 60, y: 60 }]);
  assert.equal(h.state.dirty, true); assert.equal(h.state.drawing, false); assert.equal(h.state.activePointerId, null); assert.equal(h.state.activeStroke, null); assert.equal(h.state.canvasRect, null);
  assertPointerMetadataCleared(h.state);
  assert.equal(h.counts().unlocks, 1, "lost capture after pointerup cannot finish twice");
}

{
  const h = setupHarness();
  h.canvas.emit("pointerdown"); h.canvas.emit("pointerup");
  assert.equal(h.state.history.length, 1);
  assert.equal(h.state.dirty, true);
  assert.equal(h.context.calls.filter(call => call[0] === "stroke").length, 0);
  assert.deepEqual(h.context.calls.find(call => call[0] === "arc"), ["arc", 0, 0, 4.5, 0, Math.PI * 2]);
  assert.equal(h.api.canvasHasVisibleContent(), true, "a source-over dot makes the canvas publishable");
  h.canvas.emit("lostpointercapture");
  assert.equal(h.state.history.length, 1, "pointerup followed by lost capture commits the dot once");
}

{
  const h = setupHarness();
  h.context.globalCompositeOperation = "destination-out";
  h.brush.value = "20";
  h.canvas.emit("pointerdown", { clientX: 20, clientY: 30 });
  h.canvas.emit("pointerup", { clientX: 20, clientY: 30 });
  assert.equal(h.state.history.length, 1);
  assert.equal(h.state.history[0].compositeOperation, "destination-out");
  assert.deepEqual(h.context.calls.find(call => call[0] === "arc"), ["arc", 20, 20, 10, 0, Math.PI * 2]);
  assert.equal(h.api.canvasHasVisibleContent(), false, "an eraser dot on an empty canvas is not content");
}

{
  const h = setupHarness();
  h.canvas.emit("pointerdown", { pointerId: 8 });
  h.canvas.emit("pointercancel", { pointerId: 8 });
  h.canvas.emit("lostpointercapture", { pointerId: 8 });
  assert.equal(h.state.history.length, 0, "a cancelled one-point contact preserves the existing cancellation policy");
  assert.equal(h.context.calls.some(call => call[0] === "fill"), false);
}

{
  const h = setupHarness();
  h.context.globalCompositeOperation = "destination-out";
  h.context.strokeStyle = "orange";
  h.canvas.emit("pointerdown"); h.canvas.emit("pointermove", { clientX: 20, clientY: 30 }); h.canvas.emit("pointercancel"); h.canvas.emit("lostpointercapture");
  assert.equal(h.state.history.length, 1);
  assert.equal(h.state.history[0].compositeOperation, "destination-out");
  assert.equal(h.counts().unlocks, 1);
  assertPointerMetadataCleared(h.state);
}

{
  const h = historyHarness();
  let toasts = 0;
  const undoCanvas = Function("state", "showToast", "redrawCanvasFromHistory", `${pick("undoCanvas")}; return undoCanvas;`)(h.state, () => { toasts++; }, h.api.redrawCanvasFromHistory);
  const clearCanvasBoard = Function("state", "commitCanvasAction", `${pick("clearCanvasBoard")}; return clearCanvasBoard;`)(h.state, h.api.commitCanvasAction);
  const stroke = { type: "stroke", compositeOperation: "source-over", color: "black", width: 9, points: [{ x: 1, y: 1 }, { x: 2, y: 2 }] };
  h.api.commitCanvasAction(stroke);
  clearCanvasBoard(true);
  assert.deepEqual(h.state.history.map(action => action.type), ["stroke", "clear"]);
  undoCanvas();
  assert.deepEqual(h.state.history.map(action => action.type), ["stroke"]);
  assert.ok(h.screenContext.calls.some(call => call[0] === "stroke"));
  h.state.history = []; undoCanvas(); assert.equal(toasts, 1);
}

{
  const h = historyHarness();
  const undoCanvas = Function("state", "showToast", "redrawCanvasFromHistory", `${pick("undoCanvas")}; return undoCanvas;`)(h.state, () => {}, h.api.redrawCanvasFromHistory);
  h.api.commitCanvasAction({ type: "stroke", compositeOperation: "source-over", color: "black", width: 9, points: [{ x: 3, y: 4 }] });
  assert.equal(h.api.canvasHasVisibleContent(), true);
  undoCanvas();
  assert.equal(h.state.history.length, 0, "undo removes a one-point action");
  assert.equal(h.api.canvasHasVisibleContent(), false);
}

{
  const h = setupHarness({ imageData: "detail-original" });
  h.canvas.emit("pointerdown"); h.canvas.emit("pointermove", { clientX: 20, clientY: 30 }); h.canvas.emit("pointerup", { clientX: 20, clientY: 30 });
  assert.equal(h.state.historyBaseReady, false);
  h.image().onload();
  assert.equal(h.state.historyBaseReady, true);
  assert.equal(h.state.historyBaseHasContent, true);
  assert.equal(h.baseContext.calls.filter(call => call[0] === "drawImage").length, 1);
  assert.ok(h.context.calls.some(call => call[0] === "stroke"), "input made before image load is replayed above the base");
  assert.equal(h.state.dirty, true);
}

{
  const h = setupHarness({ imageData: "detail-active" });
  h.canvas.emit("pointerdown", { clientX: 20, clientY: 30 });
  h.canvas.emit("pointermove", { clientX: 30, clientY: 40 });
  const screenCallsBeforeLoad = h.context.calls.length;
  const activeStroke = h.state.activeStroke;
  h.image().onload();
  assert.equal(h.state.historyBaseReady, true);
  assert.equal(h.state.historyRedrawPending, true);
  assert.equal(h.state.activeStroke, activeStroke);
  assert.equal(h.state.history.length, 0);
  assert.equal(h.context.calls.length, screenCallsBeforeLoad, "active image load must not clear or replay the screen path");
  assert.equal(h.baseContext.calls.filter(call => call[0] === "drawImage").length, 1);
  h.canvas.emit("pointermove", { clientX: 40, clientY: 50 });
  h.canvas.emit("pointerup", { clientX: 40, clientY: 50 });
  assert.equal(h.state.history.length, 1);
  assert.deepEqual(h.state.history[0].points, [{ x: 20, y: 20 }, { x: 40, y: 40 }, { x: 60, y: 60 }]);
  assert.equal(h.state.historyRedrawPending, false);
  const drawIndex = h.context.calls.findIndex(call => call[0] === "drawImage");
  assert.ok(drawIndex >= 0);
  assert.ok(h.context.calls.slice(drawIndex + 1).some(call => call[0] === "stroke"), "the completed stroke replays above the edit base");
  assert.equal(h.state.dirty, true);
}

{
  const h = setupHarness({ imageData: "broken-active" });
  h.canvas.emit("pointerdown");
  h.canvas.emit("pointermove", { clientX: 20, clientY: 30 });
  const screenCallsBeforeError = h.context.calls.length;
  h.image().onerror();
  assert.equal(h.state.historyBaseReady, true);
  assert.equal(h.state.historyBaseHasContent, false);
  assert.equal(h.state.historyRedrawPending, true);
  assert.equal(h.context.calls.length, screenCallsBeforeError);
  h.canvas.emit("pointerup", { clientX: 20, clientY: 30 });
  assert.equal(h.state.history.length, 1);
  assert.equal(h.state.historyRedrawPending, false);
  assert.ok(h.context.calls.some(call => call[0] === "stroke"));
  assert.equal(h.state.dirty, true);
}

{
  const h = setupHarness({ imageData: "detail-no-move" });
  h.canvas.emit("pointerdown");
  h.image().onload();
  assert.equal(h.state.historyRedrawPending, true);
  h.canvas.emit("pointerup");
  assert.equal(h.state.history.length, 1);
  assert.equal(h.state.dirty, true);
  assert.equal(h.state.historyRedrawPending, false);
  assert.equal(h.context.calls.filter(call => call[0] === "drawImage").length, 1);
  assert.equal(h.context.calls.filter(call => call[0] === "stroke").length, 0);
  assert.ok(h.context.calls.some(call => call[0] === "fill"), "a dot over a loaded edit image is replayed");
}

{
  const h = setupHarness();
  h.canvas.emit("pointerdown");
  h.canvas.emit("pointermove");
  h.canvas.emit("pointermove");
  h.canvas.emit("pointerup");
  assert.equal(h.state.history.length, 1);
  assert.equal(h.context.calls.filter(call => call[0] === "lineTo").length, 0);
  assert.equal(h.context.calls.filter(call => call[0] === "stroke").length, 0);
  assert.equal(h.context.calls.filter(call => call[0] === "fill").length, 1);
  assert.equal(h.state.dirty, true);
}

{
  const h = setupHarness();
  h.context.globalCompositeOperation = "destination-out";
  h.context.strokeStyle = "purple";
  h.brush.value = "17";
  h.canvas.emit("pointerdown");
  h.canvas.emit("pointermove");
  h.canvas.emit("pointermove", { clientX: 20, clientY: 30 });
  h.canvas.emit("pointermove", { clientX: 20, clientY: 30 });
  h.canvas.emit("pointermove", { clientX: 30, clientY: 40 });
  h.canvas.emit("pointerup", { clientX: 30, clientY: 40 });
  assert.equal(h.state.history.length, 1);
  assert.deepEqual(h.state.history[0].points, [{ x: 0, y: 0 }, { x: 20, y: 20 }, { x: 40, y: 40 }]);
  assert.equal(h.context.calls.filter(call => call[0] === "lineTo").length, 2);
  assert.equal(h.state.history[0].compositeOperation, "destination-out");
  assert.equal(h.state.history[0].color, "purple");
  assert.equal(h.state.history[0].width, 17);
  assert.equal(h.state.dirty, true);
}

{
  const h = setupHarness({ imageData: "detail-single-flush" });
  h.canvas.emit("pointerdown"); h.canvas.emit("pointermove", { clientX: 20, clientY: 30 });
  h.image().onload();
  h.canvas.emit("pointerup", { clientX: 20, clientY: 30 });
  const replayDraws = h.context.calls.filter(call => call[0] === "drawImage").length;
  h.canvas.emit("lostpointercapture");
  assert.equal(h.state.history.length, 1);
  assert.equal(h.context.calls.filter(call => call[0] === "drawImage").length, replayDraws, "lost capture cannot flush a second time");
  assert.equal(h.state.historyRedrawPending, false);
  assert.equal(h.counts().unlocks, 1);
}

{
  const h = setupHarness({ imageData: "cleanup-active" });
  h.canvas.emit("pointerdown"); h.canvas.emit("pointermove", { clientX: 20, clientY: 30 });
  h.image().onload();
  assert.equal(h.state.historyRedrawPending, true);
  const screenCalls = h.context.calls.length;
  h.releaseCanvasHistory();
  h.canvas.emit("pointerup", { clientX: 20, clientY: 30 });
  h.image().onload(); h.image().onerror();
  assert.equal(h.state.historyRedrawPending, false);
  assert.equal(h.state.activeStroke, null);
  assert.equal(h.state.historyBaseCanvas, null);
  assert.equal(h.baseCanvas.width, 0); assert.equal(h.baseCanvas.height, 0);
  assert.equal(h.context.calls.length, screenCalls, "late pointer and image events after cleanup cannot redraw the old canvas");
}

{
  const h = setupHarness({ imageData: "detail-original" });
  h.image().onload();
  assert.equal(h.state.historyBaseReady, true);
  assert.equal(h.state.dirty, false, "loading the edit base alone must not mark the drawing dirty");
  assert.equal(h.baseContext.calls.find(call => call[0] === "drawImage")[1], h.image(), "the detail image becomes the detached base");
}

{
  const h = setupHarness({ imageData: "broken" });
  for (let i = 0; i < 17; i++) h.state.history.push({ type: "stroke", compositeOperation: "source-over", color: "x", width: 1, points: [{ x: i, y: 0 }, { x: i, y: 1 }] });
  h.image().onerror();
  assert.equal(h.state.historyBaseReady, true);
  assert.equal(h.state.history.length, 15);
}

{
  const h = setupHarness({ imageData: "stale", current: false });
  h.canvas.emit("pointerdown"); h.canvas.emit("pointermove", { clientX: 20, clientY: 30 });
  const screenCalls = structuredClone(h.context.calls);
  h.image().onload(); h.image().onerror();
  assert.equal(h.state.historyBaseReady, false);
  assert.equal(h.state.historyRedrawPending, false);
  assert.equal(h.baseContext.calls.length, 0);
  assert.deepEqual(h.context.calls, screenCalls);
  assert.equal(h.state.history.length, 0);
  assert.equal(h.state.dirty, true);
}

{
  const h = historyHarness();
  h.state.activeStroke = { type: "stroke" }; h.state.canvasRect = {}; h.state.brushInput = {}; h.state.drawing = true; h.state.activePointerId = 2;
  h.state.historyRedrawPending = true;
  h.api.releaseCanvasHistory();
  assert.equal(h.base.width, 0); assert.equal(h.base.height, 0);
  assert.deepEqual(h.state.history, []); assert.equal(h.state.historyBaseCanvas, null); assert.equal(h.state.historyBaseContext, null); assert.equal(h.state.activeStroke, null); assert.equal(h.state.canvasRect, null); assert.equal(h.state.brushInput, null); assert.equal(h.state.drawing, false); assert.equal(h.state.activePointerId, null);
  assert.equal(h.state.historyRedrawPending, false);
  h.api.releaseCanvasHistory();
}

// Pointer capture failures and missing canvas end events recover through the window fallback.
{
  const h = setupHarness({ throwSetCapture: true });
  h.canvas.emit("pointerdown", { pointerId: 1, pointerType: "pen" });
  h.canvas.emit("pointermove", { pointerId: 1, pointerType: "pen", clientX: 30, clientY: 40 });
  assert.equal(h.state.drawing, true);
  h.window.emit("pointerup", { pointerId: 1, pointerType: "pen" });
  assert.equal(h.state.history.length, 1);
  assert.equal(h.state.activePointerId, null);
  assert.equal(h.state.activeStroke, null);
  assert.equal(h.state.canvasRect, null);
  assert.equal(h.state.drawing, false);
  assert.equal(h.counts().unlocks, 1);
  assert.equal(h.warnings.length, 1);
  h.canvas.emit("pointerdown", { pointerId: 2, pointerType: "touch" });
  assert.equal(h.state.activePointerId, 2, "capture failure cannot block the next finger input");
  h.window.emit("pointerup", { pointerId: 2, pointerType: "touch" });
}

{
  const h = setupHarness({ throwReleaseCapture: true });
  h.canvas.emit("pointerdown", { pointerId: 3 });
  h.canvas.emit("pointermove", { pointerId: 3, clientX: 30, clientY: 40 });
  h.window.emit("pointerup", { pointerId: 3 });
  h.canvas.emit("lostpointercapture", { pointerId: 3 });
  assert.equal(h.state.history.length, 1, "release failure and lost capture cannot double commit");
  assert.equal(h.state.activePointerId, null);
  assert.equal(h.warnings.length, 1);
  h.canvas.emit("pointerdown", { pointerId: 4 });
  assert.equal(h.state.activePointerId, 4);
}

// Canvas/window cancellation and duplicate end signals are idempotent.
for (const endTarget of ["canvas", "window"]) {
  const h = setupHarness();
  h.canvas.emit("pointerdown", { pointerId: 5 });
  h.canvas.emit("pointermove", { pointerId: 5, clientX: 30, clientY: 40 });
  h[endTarget].emit("pointercancel", { pointerId: 5 });
  h.canvas.emit("lostpointercapture", { pointerId: 5 });
  h.window.emit("pointerup", { pointerId: 5 });
  h.window.emit("pointercancel", { pointerId: 5 });
  assert.equal(h.state.history.length, 1);
  assert.equal(h.counts().unlocks, 1);
  assert.equal(h.state.activePointerId, null);
}

// A recent active pen cannot be displaced by a separately-primary touch pointer.
{
  const h = setupHarness();
  h.canvas.emit("pointerdown", { pointerId: 10, pointerType: "pen", timeStamp: 100, clientX: 10, clientY: 20 });
  h.canvas.emit("pointermove", { pointerId: 10, pointerType: "pen", timeStamp: 200, clientX: 30, clientY: 40 });
  const activeStroke = h.state.activeStroke;
  const beginPaths = h.context.calls.filter(call => call[0] === "beginPath").length;
  h.canvas.emit("pointerdown", { pointerId: 11, pointerType: "touch", timeStamp: 300, clientX: 200, clientY: 210 });
  h.canvas.emit("pointermove", { pointerId: 11, pointerType: "touch", timeStamp: 350, clientX: 220, clientY: 230 });
  h.canvas.emit("pointerup", { pointerId: 11, pointerType: "touch", timeStamp: 400 });
  h.canvas.emit("pointercancel", { pointerId: 11, pointerType: "touch", timeStamp: 450 });
  assert.equal(h.state.activePointerId, 10);
  assert.equal(h.state.activePointerType, "pen");
  assert.equal(h.state.activeStroke, activeStroke);
  assert.equal(h.state.history.length, 0);
  assert.equal(h.context.calls.filter(call => call[0] === "beginPath").length, beginPaths);
  h.canvas.emit("pointermove", { pointerId: 10, pointerType: "pen", timeStamp: 500, clientX: 50, clientY: 60 });
  h.canvas.emit("pointerup", { pointerId: 10, pointerType: "pen", timeStamp: 550 });
  assert.equal(h.state.history.length, 1);
  assert.deepEqual(h.state.history[0].points, [{ x: 0, y: 0 }, { x: 40, y: 40 }, { x: 80, y: 80 }]);
}

// A stale pen is finalized once, then touch starts a disconnected action.
{
  const h = setupHarness();
  h.canvas.emit("pointerdown", { pointerId: 10, pointerType: "pen", timeStamp: 100, clientX: 10, clientY: 20 });
  h.canvas.emit("pointermove", { pointerId: 10, pointerType: "pen", timeStamp: 200, clientX: 30, clientY: 40 });
  h.canvas.emit("pointerdown", { pointerId: 11, pointerType: "touch", timeStamp: 1800, clientX: 200, clientY: 210 });
  assert.equal(h.state.history.length, 1, "stale pen stroke must be committed once");
  assert.equal(h.state.activePointerId, 11);
  h.canvas.emit("pointermove", { pointerId: 11, pointerType: "touch", timeStamp: 1900, clientX: 220, clientY: 230 });
  h.window.emit("pointerup", { pointerId: 11, pointerType: "touch", timeStamp: 2000 });
  assert.equal(h.state.history.length, 2);
  assert.deepEqual(h.state.history[0].points, [{ x: 0, y: 0 }, { x: 40, y: 40 }]);
  assert.deepEqual(h.state.history[1].points, [{ x: 380, y: 380 }, { x: 420, y: 420 }]);
  assert.equal(h.context.calls.filter(call => call[0] === "beginPath").length, 2);
  assert.equal(h.context.calls.filter(call => call[0] === "moveTo").length, 2, "the new pointer begins with moveTo rather than connecting by lineTo");
}

// A stale one-point pen creates no history action before touch begins.
{
  const h = setupHarness();
  h.canvas.emit("pointerdown", { pointerId: 20, pointerType: "pen", timeStamp: 100 });
  h.canvas.emit("pointerdown", { pointerId: 21, pointerType: "touch", timeStamp: 1700, clientX: 100, clientY: 110 });
  assert.equal(h.state.history.length, 0, "a stale one-point pointer is not an undo action");
  h.canvas.emit("pointermove", { pointerId: 21, pointerType: "touch", timeStamp: 1800, clientX: 120, clientY: 130 });
  h.window.emit("pointerup", { pointerId: 21, pointerType: "touch", timeStamp: 1900 });
  assert.equal(h.state.history.length, 1);
}

// Pen takes priority over touch, while duplicate downs and non-primary input do nothing.
{
  const h = setupHarness();
  h.canvas.emit("pointerdown", { pointerId: 22, pointerType: "touch", timeStamp: 100, clientX: 10, clientY: 20 });
  h.canvas.emit("pointermove", { pointerId: 22, pointerType: "touch", timeStamp: 200, clientX: 30, clientY: 40 });
  const beginPaths = h.context.calls.filter(call => call[0] === "beginPath").length;
  h.canvas.emit("pointerdown", { pointerId: 22, pointerType: "touch", timeStamp: 250, clientX: 300, clientY: 310 });
  h.canvas.emit("pointerdown", { pointerId: 23, pointerType: "pen", isPrimary: false, timeStamp: 260 });
  assert.equal(h.context.calls.filter(call => call[0] === "beginPath").length, beginPaths);
  assert.equal(h.state.history.length, 0);
  h.canvas.emit("pointerdown", { pointerId: 24, pointerType: "pen", timeStamp: 300, clientX: 200, clientY: 210 });
  assert.equal(h.state.history.length, 1);
  h.canvas.emit("pointermove", { pointerId: 24, pointerType: "pen", timeStamp: 400, clientX: 220, clientY: 230 });
  h.window.emit("pointerup", { pointerId: 24, pointerType: "pen", timeStamp: 500 });
  assert.equal(h.state.history.length, 2);
  assert.deepEqual(h.state.history[0].points, [{ x: 0, y: 0 }, { x: 40, y: 40 }]);
  assert.deepEqual(h.state.history[1].points, [{ x: 380, y: 380 }, { x: 420, y: 420 }]);
  assert.equal(h.context.calls.filter(call => call[0] === "beginPath").length, 2);
}

// Mouse/pen moves with reliable released-contact signals end the stroke; touch remains conservative.
for (const pointerType of ["mouse", "pen"]) {
  const h = setupHarness();
  h.canvas.emit("pointerdown", { pointerId: 30, pointerType, buttons: 1, pressure: 0.5 });
  h.canvas.emit("pointermove", { pointerId: 30, pointerType, buttons: 1, pressure: 0.5, clientX: 30, clientY: 40 });
  h.canvas.emit("pointermove", { pointerId: 30, pointerType, buttons: 0, pressure: 0, clientX: 300, clientY: 310 });
  assert.equal(h.state.activePointerId, null);
  assert.equal(h.state.history.length, 1);
  assert.equal(h.state.history[0].points.length, 2, "released-contact coordinates are not connected to the stroke");
}
{
  const h = setupHarness();
  h.canvas.emit("pointerdown", { pointerId: 31, pointerType: "touch" });
  h.canvas.emit("pointermove", { pointerId: 31, pointerType: "touch", buttons: 0, pressure: 0, clientX: 350, clientY: 360 });
  assert.equal(h.state.drawing, true, "touch values are not assumed to match mouse or pen contact semantics");
  assert.equal(h.context.calls.filter(call => call[0] === "lineTo").length, 1, "a fast large move is preserved without a distance filter");
  h.window.emit("pointerup", { pointerId: 31, pointerType: "touch" });
}

{
  const h = setupHarness();
  h.canvas.emit("pointerdown", { pointerId: 40 });
  h.canvas.emit("pointermove", { pointerId: 40, clientX: 30, clientY: 40 });
  h.window.emit("blur");
  h.window.emit("pointerup", { pointerId: 40 });
  assert.equal(h.state.history.length, 1);
  assert.equal(h.state.activePointerId, null);
  assert.equal(h.counts().unlocks, 1);
  assertPointerMetadataCleared(h.state);
}

{
  const h = setupHarness();
  h.canvas.emit("pointerdown", { pointerId: 50 });
  h.canvas.emit("pointermove", { pointerId: 50, clientX: 30, clientY: 40 });
  const callsBeforeCleanup = h.context.calls.length;
  h.releaseCanvasHistory();
  h.state.route = "home";
  h.window.emit("pointerup", { pointerId: 50 });
  h.window.emit("pointercancel", { pointerId: 50 });
  assert.equal(h.window.listeners.has("pointerup"), false);
  assert.equal(h.window.listeners.has("pointercancel"), false);
  assert.equal(h.context.calls.length, callsBeforeCleanup, "late window events cannot touch the released canvas");
  assert.equal(h.state.canvasInputCleanup, null);
  assertPointerMetadataCleared(h.state);
}

function clearModalHarness({ baseHasContent = false, history = [] } = {}) {
  const h = historyHarness();
  h.state.historyBaseHasContent = baseHasContent;
  h.state.history = structuredClone(history);
  h.state.clearCanvasModalCleanup = null;
  h.state.dirty = false;
  const keyListeners = new Map();
  const makeButton = text => ({ textContent: text, isConnected: true, focusCalls: 0, focus() { this.focusCalls++; } });
  const root = {
    _html: "", firstElementChild: null, controls: null,
    set innerHTML(value) {
      if (this.firstElementChild) this.firstElementChild.isConnected = false;
      this._html = value;
      if (!value) { this.firstElementChild = null; this.controls = null; return; }
      const backdrop = { isConnected: true, onclick: null };
      this.firstElementChild = backdrop;
      this.controls = { cancel: makeButton("취소"), confirm: makeButton("전체 지우기") };
    },
    get innerHTML() { return this._html; },
    querySelector(selector) { return selector.includes("cancel") ? this.controls?.cancel : this.controls?.confirm; }
  };
  const document = {
    querySelector: selector => selector === "#modalRoot" ? root : null,
    addEventListener: (type, listener) => keyListeners.set(type, listener),
    removeEventListener: (type, listener) => { if (keyListeners.get(type) === listener) keyListeners.delete(type); }
  };
  const toasts = [];
  const clearCanvasBoard = Function("state", "commitCanvasAction", `${pick("clearCanvasBoard")}; return clearCanvasBoard;`)(h.state, h.api.commitCanvasAction);
  const undoCanvas = Function("state", "showToast", "redrawCanvasFromHistory", `${pick("undoCanvas")}; return undoCanvas;`)(h.state, message => toasts.push(message), h.api.redrawCanvasFromHistory);
  const openClearCanvasModal = Function("state", "document", "canvasHasVisibleContent", "showToast", "clearCanvasBoard", `${pick("openClearCanvasModal")}; return openClearCanvasModal;`)(h.state, document, h.api.canvasHasVisibleContent, message => toasts.push(message), clearCanvasBoard);
  return { ...h, root, keyListeners, toasts, openClearCanvasModal, undoCanvas };
}

assert.match(pick("openClearCanvasModal"), /role="dialog"[\s\S]*aria-modal="true"[\s\S]*aria-labelledby="clearCanvasTitle"/);
{
  const stroke = { type: "stroke", compositeOperation: "source-over", color: "black", width: 9, points: [{ x: 1, y: 1 }, { x: 2, y: 2 }] };
  const h = clearModalHarness({ history: [stroke] });
  const before = structuredClone(h.state.history);
  h.openClearCanvasModal();
  assert.ok(h.root.innerHTML.includes("그림을 모두 지울까요?"));
  assert.equal(h.root.controls.cancel.focusCalls, 1);
  h.openClearCanvasModal();
  assert.equal(h.root.controls.cancel.focusCalls, 1, "a second clear dialog is not opened");
  h.root.controls.cancel.onclick();
  assert.deepEqual(h.state.history, before);
  assert.equal(h.state.dirty, false);
  assert.equal(h.root.innerHTML, "");
}
{
  const stroke = { type: "stroke", compositeOperation: "source-over", color: "black", width: 9, points: [{ x: 1, y: 1 }, { x: 2, y: 2 }] };
  const h = clearModalHarness({ history: [stroke] });
  h.openClearCanvasModal();
  h.keyListeners.get("keydown")({ key: "Escape" });
  assert.equal(h.root.innerHTML, "");
  assert.equal(h.state.clearCanvasModalCleanup, null);
  h.openClearCanvasModal();
  h.state.clearCanvasModalCleanup();
  assert.equal(h.root.innerHTML, "", "route cleanup can close the clear dialog without changing the drawing");
  assert.deepEqual(h.state.history, [stroke]);
}
{
  const stroke = { type: "stroke", compositeOperation: "source-over", color: "black", width: 9, points: [{ x: 1, y: 1 }, { x: 2, y: 2 }] };
  const h = clearModalHarness({ history: [stroke] });
  h.openClearCanvasModal();
  h.root.controls.confirm.onclick();
  assert.deepEqual(h.state.history.map(action => action.type), ["stroke", "clear"]);
  assert.equal(h.state.dirty, true);
  h.undoCanvas();
  assert.deepEqual(h.state.history.map(action => action.type), ["stroke"]);
  assert.ok(h.screenContext.calls.some(call => call[0] === "stroke"));
}
{
  const h = clearModalHarness();
  h.openClearCanvasModal();
  assert.equal(h.root.innerHTML, "");
  assert.deepEqual(h.state.history, []);
  assert.deepEqual(h.toasts, ["지울 그림이 없어요."]);
}
{
  const stroke = { type: "stroke", compositeOperation: "source-over", color: "black", width: 9, points: [{ x: 1, y: 1 }, { x: 2, y: 2 }] };
  const h = clearModalHarness({ history: [stroke] });
  h.undoCanvas();
  h.openClearCanvasModal();
  assert.equal(h.root.innerHTML, "", "undoing the only stroke returns to an empty board");
}
{
  const h = clearModalHarness({ baseHasContent: true });
  assert.equal(h.state.dirty, false);
  h.openClearCanvasModal();
  assert.ok(h.root.innerHTML, "an edit base is visible even when dirty is false");
  h.root.controls.confirm.onclick();
  assert.deepEqual(h.state.history.map(action => action.type), ["clear"]);
  h.undoCanvas();
  assert.equal(h.api.canvasHasVisibleContent(), true, "undo restores the edit base content state");
  assert.ok(h.screenContext.calls.some(call => call[0] === "drawImage"));
}

console.log("Canvas action history checks passed.");
