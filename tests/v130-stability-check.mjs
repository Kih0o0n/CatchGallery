import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const updateSource = app.match(/async function updateDrawing[\s\S]*?(?=async function withdrawDrawing)/)?.[0];
assert.ok(updateSource, "production updateDrawing must be readable");

const optimized = {
  imageData: "data:image/webp;base64,UklGRg==",
  thumbnailData: "data:image/webp;base64,AAAA",
  imageFormat: "webp",
  imageWidth: 720,
  imageHeight: 640,
  imageBytes: 1000,
  thumbnailBytes: 200
};
const baseDrawing = (overrides = {}) => ({
  drawerId: "owner",
  status: "open",
  expiresAt: 10_000,
  imageReady: true,
  imageVersion: 1,
  imageFormat: "webp",
  imageWidth: 600,
  imageHeight: 600,
  imageBytes: 900,
  thumbnailBytes: 180,
  revisionCount: 3,
  updatedAt: 1,
  ...overrides
});
const clone = value => structuredClone(value);
const applyPaths = (root, updates) => {
  for (const [path, value] of Object.entries(updates)) {
    const parts = path.split("/");
    let target = root;
    for (const part of parts.slice(0, -1)) target = target[part] ||= {};
    if (value === null) delete target[parts.at(-1)];
    else target[parts.at(-1)] = value;
  }
};

function makeUpdateHarness(initialDrawing, beforeCommit) {
  const store = {
    drawings: { picture: clone(initialDrawing) },
    drawingImages: { picture: { imageData: "data:image/png;base64,AAAA" } },
    drawingThumbnails: { picture: { imageData: "data:image/png;base64,AAAA" } }
  };
  const updateCalls = [];
  const db = { ref(path) {
    if (path === `drawings/picture`) return { once: async () => ({ val: () => clone(store.drawings.picture) }) };
    assert.equal(path, undefined, "updateDrawing must write only through the root reference");
    return { update: async updates => {
      updateCalls.push(clone(updates));
      if (beforeCommit) await beforeCommit(store, updates);
      const current = store.drawings.picture;
      const nextRevision = updates["drawings/picture/revisionCount"];
      if (current.status !== "open" || current.solverId || current.expiresAt <= 100 || nextRevision !== current.revisionCount + 1) {
        throw Object.assign(new Error("PERMISSION_DENIED"), { code: "PERMISSION_DENIED" });
      }
      applyPaths(store, updates);
    } };
  } };
  const updateDrawing = Function(
    "isSafeRecordId", "db", "serverNow", "isOwnDrawing", "hasPublicDrawingImage", "validateOptimizedImages",
    "optimizeCanvasImages", "state", "IMAGE_OPTIONS",
    `${updateSource}; return updateDrawing;`
  )(
    value => /^[A-Za-z0-9_-]{1,80}$/.test(value), db, () => 100,
    drawing => drawing.drawerId === "owner", drawing => Boolean(drawing.imageData) || drawing.imageReady === true,
    value => value, async () => clone(optimized), { canvas: {} }, { version: 1 }
  );
  return { updateDrawing, store, updateCalls };
}

{
  const harness = makeUpdateHarness(baseDrawing({ imageData: "data:image/png;base64,AAAA" }));
  const result = await harness.updateDrawing("picture");
  assert.deepEqual(result, { imageData: optimized.imageData, thumbnailData: optimized.thumbnailData });
  assert.equal(harness.updateCalls.length, 1, "an edit must use one root update");
  const paths = Object.keys(harness.updateCalls[0]);
  for (const path of [
    "drawingImages/picture/imageData", "drawingThumbnails/picture/imageData", "drawings/picture/imageVersion",
    "drawings/picture/imageFormat", "drawings/picture/imageWidth", "drawings/picture/imageHeight",
    "drawings/picture/imageBytes", "drawings/picture/thumbnailBytes", "drawings/picture/imageReady",
    "drawings/picture/updatedAt", "drawings/picture/revisionCount", "drawings/picture/imageData"
  ]) assert.ok(paths.includes(path), `atomic edit is missing ${path}`);
  assert.equal(harness.store.drawings.picture.revisionCount, 4);
  assert.equal(harness.store.drawings.picture.imageData, undefined, "legacy imageData must be removed in the same update");
  assert.equal(harness.store.drawingImages.picture.imageData, optimized.imageData);
  assert.equal(harness.store.drawingThumbnails.picture.imageData, optimized.thumbnailData);
}

for (const [name, mutation] of [
  ["solve", drawing => { drawing.status = "solved"; drawing.solverId = "solver"; }],
  ["expiry", drawing => { drawing.expiresAt = 99; }],
  ["withdraw", drawing => { drawing.status = "withdrawn"; }]
]) {
  const harness = makeUpdateHarness(baseDrawing(), store => mutation(store.drawings.picture));
  const beforeImages = clone({ detail: harness.store.drawingImages.picture, thumbnail: harness.store.drawingThumbnails.picture });
  await assert.rejects(harness.updateDrawing("picture"), /PERMISSION_DENIED/, `${name} must reject the entire edit`);
  assert.deepEqual(harness.store.drawingImages.picture, beforeImages.detail);
  assert.deepEqual(harness.store.drawingThumbnails.picture, beforeImages.thumbnail);
  assert.equal(harness.store.drawings.picture.revisionCount, 3);
}

{
  const initial = baseDrawing();
  const store = {
    drawings: { picture: clone(initial) },
    drawingImages: { picture: { imageData: "data:image/png;base64,AAAA" } },
    drawingThumbnails: { picture: { imageData: "data:image/png;base64,AAAA" } }
  };
  const pending = [];
  const db = { ref(path) {
    if (path === "drawings/picture") return { once: async () => ({ val: () => clone(store.drawings.picture) }) };
    return { update: updates => new Promise((resolve, reject) => {
      pending.push({ updates, resolve, reject });
      if (pending.length !== 2) return;
      for (const request of pending) {
        if (request.updates["drawings/picture/revisionCount"] !== store.drawings.picture.revisionCount + 1) request.reject(new Error("PERMISSION_DENIED"));
        else { applyPaths(store, request.updates); request.resolve(); }
      }
    }) };
  } };
  const updateDrawing = Function(
    "isSafeRecordId", "db", "serverNow", "isOwnDrawing", "hasPublicDrawingImage", "validateOptimizedImages",
    "optimizeCanvasImages", "state", "IMAGE_OPTIONS", `${updateSource}; return updateDrawing;`
  )(value => /^[A-Za-z0-9_-]{1,80}$/.test(value), db, () => 100, drawing => drawing.drawerId === "owner",
    drawing => drawing.imageReady === true, value => value, async () => clone(optimized), { canvas: {} }, { version: 1 });
  const results = await Promise.allSettled([updateDrawing("picture"), updateDrawing("picture")]);
  assert.deepEqual(results.map(result => result.status).sort(), ["fulfilled", "rejected"]);
  assert.equal(store.drawings.picture.revisionCount, 4, "two stale edits must increment the revision only once");
}

const migrationSource = app.match(/function isValidMigrationCursor[\s\S]*?(?=function hasLegacyRankingClaims)/)?.[0];
assert.ok(migrationSource, "production migration batch must be readable");
const unsafeGuardIndex = migrationSource.indexOf("if (!isSafeRecordId(drawing.id))");
assert.ok(unsafeGuardIndex >= 0 && unsafeGuardIndex < migrationSource.indexOf("optimizeDataUrl(drawing.imageData)"), "unsafe IDs must be rejected before optimization");

function migrationRoot() {
  const status = { textContent: "", innerHTML: "" };
  const nextButton = { disabled: false };
  const closeButton = { disabled: false };
  return {
    status,
    querySelector(selector) {
      return { "[data-migration-status]": status, "[data-migrate-next]": nextButton, "[data-migration-close]": closeButton }[selector] || null;
    }
  };
}
const migrationSnapshot = entries => ({ forEach(callback) { for (const [key, value] of entries) callback({ key, val: () => clone(value) }); } });

async function runMigration(entries, { failSafeWrite = false, cursor = null } = {}) {
  const writes = [];
  const optimizedIds = [];
  const logs = [];
  const external = new Set();
  const query = {
    orderByKey() { return this; }, startAt() { return this; }, limitToFirst() { return this; },
    once: async () => migrationSnapshot(entries)
  };
  const db = { ref(path) {
    if (path === "drawings") return query;
    if (path === undefined) return { update: async updates => {
      writes.push(...Object.keys(updates));
      if (failSafeWrite) throw new Error("network");
      for (const key of Object.keys(updates)) external.add(key);
    } };
    if (/^drawing(Images|Thumbnails)\//.test(path)) return { once: async () => ({ exists: () => external.has(path) }) };
    if (/^drawings\/[^/]+$/.test(path)) return { update: async () => { writes.push(path); } };
    if (/^drawings\/[^/]+\/imageData$/.test(path)) return { remove: async () => { writes.push(path); } };
    throw new Error(`unexpected ref: ${String(path)}`);
  } };
  const state = { migrationRunning: false, migrationCursor: cursor, isAdmin: true, user: { id: "admin" } };
  const root = migrationRoot();
  const runMigrationBatch = Function(
    "IMAGE_OPTIONS", "state", "auth", "db", "isSafeRecordId", "optimizeDataUrl", "dataUrlBytes", "console",
    `${migrationSource}; return runMigrationBatch;`
  )(
    { migrationBatch: 2, migrationTimeout: 1000, version: 1 }, state, { currentUser: { uid: "admin" } }, db,
    value => /^[A-Za-z0-9_-]{1,80}$/.test(value),
    async imageData => { optimizedIds.push(imageData); return clone(optimized); },
    () => 4,
    { warn: message => logs.push(message), error: () => {} }
  );
  await runMigrationBatch(root);
  return { state, root, writes, optimizedIds, logs };
}

{
  const result = await runMigration([["bad id", { imageData: "unsafe-image" }], ["safe-id", { imageData: "safe-image" }]]);
  assert.deepEqual(result.optimizedIds, ["safe-image"], "unsafe IDs must not reach the optimizer");
  assert.ok(result.writes.length > 0 && result.writes.every(path => !path.includes("bad id")), "unsafe IDs must not reach Firebase writes");
  assert.equal(result.state.migrationCursor, "safe-id", "a mixed successful batch must advance past an unsafe ID");
  assert.match(result.root.status.innerHTML, /건너뜀 1 \(unsafe ID 1\)/);
  assert.ok(result.logs.some(message => message.includes("bad id")));
}

{
  const result = await runMigration([["bad id", { imageData: "unsafe-image" }]]);
  assert.equal(result.state.migrationCursor, "bad id", "an unsafe-only batch must still advance its cursor");
  assert.equal(result.writes.length, 0);
  assert.equal(result.optimizedIds.length, 0);
}

{
  const result = await runMigration([["safe-id", { imageData: "safe-image" }]], { failSafeWrite: true, cursor: "previous-id" });
  assert.equal(result.state.migrationCursor, "previous-id", "a transient safe-ID failure must retain the starting cursor");
  assert.deepEqual(result.optimizedIds, ["safe-image"]);
}

console.log("v1.3.0 stability checks passed.");
