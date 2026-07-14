import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const pick = name => {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  let depth = 0;
  let opened = false;
  for (let i = start; i < source.length; i++) {
    if (source[i] === "{") { depth++; opened = true; }
    if (source[i] === "}" && opened && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`Could not extract ${name}`);
};

assert.match(source, /loadDrawingImage\(drawing, "thumbnail"\)/, "manage cards must request thumbnails");
assert.match(source, /loadDrawingImage\(drawing, "detail"\)/, "editing must request detail images");
assert.match(source, /rootMargin: "240px"/, "manage observer should preload near the viewport");
assert.match(source, /state\.manageDrawings = null/, "route cleanup must discard manage metadata");
assert.match(source, /state\.manageDrawings\.filter/, "tab changes must filter the in-memory metadata cache");

const state = { manageLoader: null, manageObserver: null, manageEditRequestId: 0, thumbnailCache: new Map(), route: "manage" };
const IMAGE_OPTIONS = { maxConcurrentLoads: 2 };
const isScreenRequestCurrent = () => true;
const api = Function("state", "IMAGE_OPTIONS", "isScreenRequestCurrent", `${pick("cancelManageImageLoading")};${pick("createManageLoader")};${pick("isManageLoaderCurrent")};${pick("runManageImageQueue")}; return { cancelManageImageLoading, createManageLoader, isManageLoaderCurrent, runManageImageQueue };`)(state, IMAGE_OPTIONS, isScreenRequestCurrent);

const request = { routeName: "manage", transitionId: 1, requestId: 1 };
const first = api.createManageLoader(request);
let running = 0;
let peak = 0;
const releases = [];
for (let i = 0; i < 4; i++) {
  first.queue.push(() => new Promise(resolve => {
    running++;
    peak = Math.max(peak, running);
    releases.push(() => { running--; resolve(); });
  }));
}
api.runManageImageQueue(first);
await new Promise(resolve => setImmediate(resolve));
assert.equal(peak, 2, "concurrent manage image work must respect the shared limit");
assert.equal(first.active, 2, "active includes pending image completion");
releases.shift()();
await new Promise(resolve => setImmediate(resolve));
assert.equal(first.active, 2, "the next queued image starts only after one completes");

const previousActive = first.active;
const second = api.createManageLoader(request);
assert.equal(first.cancelled, true, "a tab rerender cancels the old loader");
assert.equal(first.queue.length, 0, "a cancelled loader drops its own queue");
releases.shift()();
await new Promise(resolve => setImmediate(resolve));
assert.equal(second.active, 0, "old loader completion cannot change the new loader count");
assert.ok(first.active < previousActive, "old completion settles only the old loader");

let disconnected = 0;
let waiterCancelled = 0;
second.pendingWaiters.add(() => waiterCancelled++);
state.manageObserver = { disconnect: () => disconnected++ };
api.cancelManageImageLoading();
api.cancelManageImageLoading();
assert.equal(disconnected, 1, "manage observer cleanup is repeatable");
assert.equal(waiterCancelled, 1, "pending image listeners are cancelled once");
assert.equal(state.manageLoader, null);
assert.equal(state.manageObserver, null);

const renderBody = source.slice(source.indexOf("async function renderManage()"), source.indexOf("async function submitFeedback("));
assert.equal((renderBody.match(/loadManageDrawings\(\)/g) || []).length, 1, "metadata is loaded through one cache fill path");
assert.doesNotMatch(renderBody, /Promise\.all\(list\.map/, "card rendering must not await all images");
assert.match(renderBody, /Object\.assign\(drawing, \{ status: "withdrawn"/, "withdrawal updates cached metadata");

console.log("manage image loading checks passed");
