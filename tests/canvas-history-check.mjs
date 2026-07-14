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
    calls, globalCompositeOperation: "source-over", strokeStyle: "#111", lineWidth: 9, lineCap: "", lineJoin: "",
    clearRect: (...args) => calls.push(["clearRect", ...args]),
    drawImage: (...args) => calls.push(["drawImage", ...args]),
    beginPath: () => calls.push(["beginPath"]), moveTo: (...args) => calls.push(["moveTo", ...args]),
    lineTo: (...args) => calls.push(["lineTo", ...args]), stroke: () => calls.push(["stroke"]), closePath: () => calls.push(["closePath"])
  };
}
function fakeCanvas(context = fakeContext()) {
  const listeners = new Map();
  return {
    width: 720, height: 720, isConnected: true, context, listeners, rectReads: 0, captures: new Set(),
    getContext: (...args) => { context.contextArgs = args; return context; },
    getBoundingClientRect() { this.rectReads++; return { left: 10, top: 20, width: 360, height: 360 }; },
    addEventListener(type, listener) { listeners.set(type, listener); },
    emit(type, values = {}) { listeners.get(type)?.({ pointerId: 7, pointerType: "touch", isPrimary: true, button: 0, clientX: 10, clientY: 20, cancelable: true, preventDefault() { this.prevented = true; }, ...values }); },
    setPointerCapture(id) { this.captures.add(id); }, hasPointerCapture(id) { return this.captures.has(id); }, releasePointerCapture(id) { this.captures.delete(id); this.releaseCount = (this.releaseCount || 0) + 1; }
  };
}
const actionNames = ["releaseCanvasHistory", "initializeCanvasHistory", "applyCanvasAction", "compactCanvasHistory", "commitCanvasAction", "redrawCanvasFromHistory", "canvasPoint"];
function historyHarness() {
  const screenContext = fakeContext();
  const screen = fakeCanvas(screenContext);
  const bases = [];
  const document = { createElement: () => { const canvas = fakeCanvas(); bases.push(canvas); return canvas; } };
  const state = { canvas: screen, ctx: screenContext, history: [], historyBaseCanvas: null, historyBaseContext: null, historyBaseReady: false, activeStroke: null, canvasRect: null, brushInput: null, drawing: false, activePointerId: null, dirty: false };
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
  const before = context.calls.length;
  api.applyCanvasAction(context, { type: "stroke", points: [{ x: 1, y: 1 }] });
  assert.equal(context.calls.length, before, "a one-point stroke draws nothing");
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

function setupHarness({ imageData = null, current = true } = {}) {
  const context = fakeContext();
  const canvas = fakeCanvas(context);
  const baseContext = fakeContext();
  const baseCanvas = fakeCanvas(baseContext);
  const brush = { value: "9" };
  let drawingQueries = 0, brushQueries = 0, locks = 0, unlocks = 0, image;
  const state = { route: "draw", canvas: null, ctx: null, history: [], historyBaseCanvas: null, historyBaseContext: null, historyBaseReady: false, activeStroke: null, canvasRect: null, brushInput: null, drawing: false, activePointerId: null, dirty: false, editImageRequestId: 0 };
  const document = {
    querySelector(selector) { if (selector === "#drawingCanvas") { drawingQueries++; return canvas; } if (selector === "#brushSize") { brushQueries++; return brush; } return null; },
    createElement: () => baseCanvas
  };
  class TestImage { constructor() { image = this; } set src(value) { this.value = value; } }
  const helperCode = actionNames.map(pick).join("\n");
  const setupCanvas = Function("state", "document", "DRAWING_HISTORY_LIMIT", "bindDocumentDrawingScrollBlocker", "preventIfCancelable", "lockDrawingScroll", "unlockDrawingScroll", "Image", "routeTransitionId", "isTransitionCurrent", "console", `"use strict"; ${helperCode}; ${pick("setupCanvas")}; return setupCanvas;`)(
    state, document, 15, () => {}, event => event.preventDefault(), () => { locks++; }, () => { unlocks++; }, TestImage, 1, () => current, { warn() {} }
  );
  setupCanvas(imageData);
  return { state, canvas, context, baseCanvas, baseContext, brush, image: () => image, counts: () => ({ drawingQueries, brushQueries, locks, unlocks }) };
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
  assert.equal(h.counts().unlocks, 1, "lost capture after pointerup cannot finish twice");
}

{
  const h = setupHarness();
  h.canvas.emit("pointerdown"); h.canvas.emit("pointerup");
  assert.equal(h.state.history.length, 0);
  assert.equal(h.state.dirty, false);
  assert.equal(h.context.calls.filter(call => call[0] === "stroke").length, 0);
}

{
  const h = setupHarness();
  h.context.globalCompositeOperation = "destination-out";
  h.context.strokeStyle = "orange";
  h.canvas.emit("pointerdown"); h.canvas.emit("pointermove", { clientX: 20, clientY: 30 }); h.canvas.emit("pointercancel"); h.canvas.emit("lostpointercapture");
  assert.equal(h.state.history.length, 1);
  assert.equal(h.state.history[0].compositeOperation, "destination-out");
  assert.equal(h.counts().unlocks, 1);
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
  const h = setupHarness({ imageData: "detail-original" });
  h.canvas.emit("pointerdown"); h.canvas.emit("pointermove", { clientX: 20, clientY: 30 }); h.canvas.emit("pointerup", { clientX: 20, clientY: 30 });
  assert.equal(h.state.historyBaseReady, false);
  h.image().onload();
  assert.equal(h.state.historyBaseReady, true);
  assert.equal(h.baseContext.calls.filter(call => call[0] === "drawImage").length, 1);
  assert.ok(h.context.calls.some(call => call[0] === "stroke"), "input made before image load is replayed above the base");
  assert.equal(h.state.dirty, true);
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
  h.image().onload(); h.image().onerror();
  assert.equal(h.state.historyBaseReady, false);
  assert.equal(h.baseContext.calls.length, 0);
  assert.equal(h.context.calls.filter(call => call[0] === "drawImage").length, 0);
}

{
  const h = historyHarness();
  h.state.activeStroke = { type: "stroke" }; h.state.canvasRect = {}; h.state.brushInput = {}; h.state.drawing = true; h.state.activePointerId = 2;
  h.api.releaseCanvasHistory();
  assert.equal(h.base.width, 0); assert.equal(h.base.height, 0);
  assert.deepEqual(h.state.history, []); assert.equal(h.state.historyBaseCanvas, null); assert.equal(h.state.historyBaseContext, null); assert.equal(h.state.activeStroke, null); assert.equal(h.state.canvasRect, null); assert.equal(h.state.brushInput, null); assert.equal(h.state.drawing, false); assert.equal(h.state.activePointerId, null);
  h.api.releaseCanvasHistory();
}

console.log("Canvas action history checks passed.");
