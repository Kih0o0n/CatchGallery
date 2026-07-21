import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");

function readConstant(name, opening, closing) {
  const marker = `const ${name} =`;
  const start = app.indexOf(marker);
  assert.notEqual(start, -1, `${name} must exist`);
  const valueStart = app.indexOf(opening, start + marker.length);
  let depth = 0;
  let quote = null;
  for (let index = valueStart; index < app.length; index++) {
    const character = app[index];
    if (quote) {
      if (character === "\\") index++;
      else if (character === quote) quote = null;
    } else if (character === '"' || character === "'") quote = character;
    else if (character === opening) depth++;
    else if (character === closing && --depth === 0) return Function(`return (${app.slice(valueStart, index + 1)})`)();
  }
  throw new Error(`could not extract ${name}`);
}

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

const colors = readConstant("DRAWING_COLORS", "[", "]");
const metallicBrushes = readConstant("METALLIC_BRUSHES", "{", "}");
const expectedNames = ["빨강", "분홍", "연분홍", "주황", "연주황", "노랑", "연두", "초록", "하늘", "파랑", "연보라", "보라", "검정", "갈색", "금색", "은색"];
assert.equal(colors.length, 16);
assert.deepEqual(colors.map(([, name]) => name), expectedNames);
assert.deepEqual(colors.slice(0, 14).map(([, , brush]) => brush), Array(14).fill("solid"));
assert.deepEqual(colors.slice(14).map(([, , brush]) => brush), ["glitter-gold", "glitter-silver"]);
assert.match(app, /const DEFAULT_DRAWING_COLOR_INDEX = 12/);
assert.match(styles, /\.color\[data-brush="glitter-gold"\][^{]*\{[^}]*linear-gradient/);
assert.match(styles, /\.color\[data-brush="glitter-silver"\][^{]*\{[^}]*linear-gradient/);
assert.doesNotMatch(styles.match(/\.color\.metallic-color[^}]*\}/g)?.join("\n") || "", /animation/);

function classList(initial = []) {
  const values = new Set(initial);
  return { add: value => values.add(value), remove: value => values.delete(value), contains: value => values.has(value) };
}

{
  const state = { ctx: { globalCompositeOperation: "destination-out", strokeStyle: "#000" }, currentBrushKind: "eraser" };
  const solid = { dataset: { color: colors[0][0], brush: "solid" }, classList: classList(), setAttribute() {} };
  const gold = { dataset: { color: colors[14][0], brush: "glitter-gold" }, classList: classList(), setAttribute() {} };
  const eraser = { classList: classList(["active"]), setAttribute() {} };
  const selectDrawingColor = Function("state", "document", `${pick("selectDrawingColor")}; return selectDrawingColor;`)(state, { querySelector: () => eraser });
  selectDrawingColor(gold, [solid, gold]);
  assert.equal(state.currentBrushKind, "glitter-gold");
  assert.equal(state.ctx.globalCompositeOperation, "source-over");
  assert.equal(state.ctx.strokeStyle, colors[14][0]);
  selectDrawingColor(solid, [solid, gold]);
  assert.equal(state.currentBrushKind, "solid", "solid selection clears the special brush state");
}

function recordingContext() {
  const calls = [];
  const context = {
    calls, globalCompositeOperation: "source-over", globalAlpha: 1, strokeStyle: "", fillStyle: "", lineWidth: 1, lineCap: "", lineJoin: "",
    save: () => calls.push(["save"]), restore: () => calls.push(["restore"]),
    beginPath: () => calls.push(["beginPath"]), closePath: () => calls.push(["closePath"]),
    moveTo: (...args) => calls.push(["moveTo", ...args]), lineTo: (...args) => calls.push(["lineTo", ...args]),
    arc: (...args) => calls.push(["arc", ...args]), stroke: () => calls.push(["stroke", context.strokeStyle, context.lineWidth]),
    fill: () => calls.push(["fill", context.fillStyle]), clearRect: (...args) => calls.push(["clearRect", ...args])
  };
  return context;
}

const renderNames = ["seededCanvasRandom", "drawStrokePath", "canvasPathMetrics", "pointAlongCanvasPath", "drawMetallicSparkle", "drawMetallicStroke", "applyCanvasAction"];
const renderApi = Function("METALLIC_BRUSHES", `"use strict"; ${renderNames.map(pick).join("\n")}; return { ${renderNames.join(",")} };`)(metallicBrushes);
const actions = [
  { type: "stroke", compositeOperation: "source-over", color: colors[14][0], brushKind: "glitter-gold", seed: 123456, width: 18, points: [{ x: 40, y: 60 }, { x: 180, y: 140 }, { x: 360, y: 120 }] },
  { type: "stroke", compositeOperation: "source-over", color: colors[15][0], brushKind: "glitter-silver", seed: 987654, width: 18, points: [{ x: 40, y: 90 }, { x: 220, y: 210 }, { x: 420, y: 170 }] },
  { type: "stroke", compositeOperation: "source-over", color: colors[14][0], brushKind: "glitter-gold", seed: 42, width: 9, points: [{ x: 300, y: 300 }] },
  { type: "stroke", compositeOperation: "source-over", color: colors[15][0], brushKind: "glitter-silver", seed: 43, width: 9, points: [{ x: 320, y: 300 }] }
];

for (const action of actions) {
  const first = recordingContext();
  const second = recordingContext();
  renderApi.applyCanvasAction(first, structuredClone(action));
  renderApi.applyCanvasAction(second, structuredClone(action));
  assert.deepEqual(first.calls, second.calls, `${action.brushKind} replay must be deterministic`);
  assert.ok(first.calls.some(call => call[0] === "fill"), `${action.brushKind} must include a fixed sparkle or dot texture`);
  assert.ok(first.calls.some(call => call[0] === "stroke" || call[0] === "arc"), `${action.brushKind} must retain a metallic base on short strokes and dots`);
}

{
  const long = recordingContext();
  renderApi.applyCanvasAction(long, { ...actions[0], points: [{ x: 0, y: 0 }, { x: 720, y: 720 }], width: 3 });
  const sparkleFills = long.calls.filter(call => call[0] === "fill").length;
  assert.ok(sparkleFills <= 48, "sparkle count must remain capped for long strokes");
}

assert.doesNotMatch(pick("drawMetallicStroke"), /Math\.random/);
assert.match(pick("setupCanvas"), /brushKind:[\s\S]*seed:/, "stroke actions store brush kind and replay seed");
assert.match(pick("setupCanvas"), /cancelStrokeForGesture[\s\S]*commit:\s*false/, "pinch continues to cancel the pending touch stroke");

console.log("Glitter palette and deterministic brush checks passed.");
