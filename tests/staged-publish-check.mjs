import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const source = app.match(/async function publishDrawing[\s\S]*?(?=function expireOldDrawings)/)?.[0];
assert.ok(source);

function harness({ failImages = false } = {}) {
  const calls = [];
  let imageFailurePending = failImages;
  const drawingRef = {
    key: "push_Id-1",
    async set(value) { calls.push(["metadata", value]); },
    async update(value) { calls.push(["cleanupDrawing", value]); }
  };
  const root = { async update(value) {
    calls.push(["root", value]);
    if (imageFailurePending && Object.keys(value).some(key => key.endsWith("/imageData"))) { imageFailurePending = false; throw new Error("image write failed"); }
  } };
  const db = { ref(path) { return path === "drawings" ? { push: () => drawingRef } : root; } };
  const state = { word: { word: "고양이", category: "동물", answers: ["고양이"], isCustomWord: false }, canvas: {}, user: { id: "owner", nickname: "그린이" } };
  const optimized = { imageData: "data:image/webp;base64,AAAA", thumbnailData: "data:image/webp;base64,AAAA", imageFormat: "webp", imageWidth: 720, imageHeight: 720, imageBytes: 3, thumbnailBytes: 3 };
  const publish = Function("isValidCategory", "state", "serverNow", "db", "validateOptimizedImages", "optimizeCanvasImages", "IMAGE_OPTIONS", "console", `${source}; return publishDrawing;`)(() => true, state, () => 100, db, value => value, async () => optimized, { version: 1 }, { error() {} });
  return { calls, publish };
}

{
  const h = harness();
  await h.publish();
  assert.equal(h.calls[0][0], "metadata");
  assert.equal(h.calls[0][1].imageReady, false);
  assert.deepEqual(Object.keys(h.calls[1][1]).sort(), ["drawingImages/push_Id-1/imageData", "drawingThumbnails/push_Id-1/imageData"]);
  assert.deepEqual(h.calls[2][1], { "drawings/push_Id-1/imageReady": true, "userDrawings/owner/push_Id-1": true });
}

{
  const h = harness({ failImages: true });
  await assert.rejects(h.publish(), /image write failed/);
  assert.equal(h.calls.some(([, value]) => value?.["drawings/push_Id-1/imageReady"] === true), false, "failed image writes must not publish the drawing");
  assert.ok(h.calls.some(([, value]) => value?.["drawingImages/push_Id-1"] === null && value?.["drawingThumbnails/push_Id-1"] === null));
  assert.ok(h.calls.some(([kind, value]) => kind === "cleanupDrawing" && value.status === "withdrawn"));
  assert.equal(h.calls.some(([, value]) => value?.["userDrawings/owner/push_Id-1"] === true), false);
}

console.log("Staged drawing publish checks passed.");
