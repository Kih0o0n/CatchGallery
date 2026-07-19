import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
assert.match(app, /const STALE_PROVISIONAL_GRACE_MS = 15 \* 60 \* 1000;/);
const source = app.match(/function hasCompleteImageMetadata[\s\S]*?(?=async function loadOpenDrawings)/)?.[0];
assert.ok(source, "production provisional cleanup source must be extractable");

const GRACE = 15 * 60 * 1000;
const INTERVAL = 60_000;
const modern = (overrides = {}) => ({
  status: "open", imageReady: false, imageVersion: 1, imageFormat: "webp", imageWidth: 720,
  imageHeight: 720, imageBytes: 100, thumbnailBytes: 50, createdAt: 0, expiresAt: 999_999_999,
  ...overrides
});
const snapshot = entries => ({
  forEach(callback) {
    for (const [key, value] of Object.entries(entries)) callback({ key, val: () => value, ref: value.ref });
  }
});

function harness(entries, { failIds = [], current = {}, now = 2_000_000, updateGate = null } = {}) {
  const snap = snapshot(entries);
  const updates = [];
  const attempts = [];
  const warnings = [];
  const transactions = [];
  const state = {
    provisionalCleanupPromise: null, provisionalCleanupCompletedAt: 0,
    expirySweepPromise: null, expirySweepCompletedAt: 0, cacheGeneration: 1
  };
  const db = {
    ref(path) {
      if (path === undefined) return {
        update: async values => {
          const id = Object.keys(values).find(key => key.startsWith("drawings/"))?.split("/")[1];
          attempts.push(id);
          if (updateGate) await updateGate;
          if (failIds.includes(id) || current[id]?.imageReady === true) throw new Error(`blocked ${id}`);
          updates.push(values);
        }
      };
      if (path === "drawings") return { orderByChild: () => ({ equalTo: () => ({ once: async () => snap }) }) };
      throw new Error(`unexpected ref ${path}`);
    }
  };
  for (const [id, value] of Object.entries(entries)) value.ref = {
    transaction: async updater => {
      const result = updater(value);
      transactions.push(id);
      return { committed: !!result, snapshot: { val: () => result } };
    }
  };
  const dependencies = {
    state, db, serverNow: () => now, STALE_PROVISIONAL_GRACE_MS: GRACE,
    EXPIRY_SWEEP_INTERVAL_MS: INTERVAL, invalidateGalleryListsByStatus: () => {},
    console: { warn: (...args) => warnings.push(args) }
  };
  const names = Object.keys(dependencies);
  const api = Function(...names, `"use strict"; ${source}; return { hasCompleteImageMetadata, isStaleProvisionalDrawing, cleanupStaleProvisionalDrawings, expireOldDrawings };`)(...names.map(name => dependencies[name]));
  return { ...api, state, updates, attempts, warnings, transactions, snap, setNow(value) { now = value; } };
}

{
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const h = harness({ stale: modern() }, { updateGate: gate });
  const first = h.cleanupStaleProvisionalDrawings({ snapshot: h.snap, now: 2_000_000 });
  const second = h.cleanupStaleProvisionalDrawings({ snapshot: h.snap, now: 2_000_000 });
  assert.equal(first, second, "concurrent cleanup calls must share the promise guard");
  release();
  await first;
  assert.equal(h.state.provisionalCleanupPromise, null);
}

{
  const h = harness({});
  assert.equal(h.isStaleProvisionalDrawing(modern({ createdAt: 2_000_000 - GRACE + 1 }), 2_000_000), false);
  assert.equal(h.isStaleProvisionalDrawing(modern({ createdAt: 2_000_000 - GRACE }), 2_000_000), true);
  assert.equal(h.isStaleProvisionalDrawing(modern({ imageReady: true }), 2_000_000), false);
  assert.equal(h.isStaleProvisionalDrawing({ ...modern(), imageData: "legacy" }, 2_000_000), false);
  for (const status of ["solved", "expired", "withdrawn", "adminDeleted"]) assert.equal(h.isStaleProvisionalDrawing(modern({ status }), 2_000_000), false);
  for (const field of ["imageVersion", "imageFormat", "imageWidth", "imageHeight", "imageBytes", "thumbnailBytes"]) {
    const drawing = modern(); delete drawing[field];
    assert.equal(h.isStaleProvisionalDrawing(drawing, 2_000_000), false);
  }
}

{
  const entries = {
    staleFail: modern(), staleOk: modern(), fresh: modern({ createdAt: 2_000_000 - GRACE + 1 }),
    complete: modern({ imageReady: true }), legacy: { ...modern(), imageReady: undefined, imageData: "legacy" },
    solved: modern({ status: "solved" }), raceComplete: modern()
  };
  const h = harness(entries, { failIds: ["staleFail"], current: { raceComplete: { imageReady: true } } });
  const result = await h.cleanupStaleProvisionalDrawings({ snapshot: h.snap, now: 2_000_000 });
  assert.deepEqual(result.failed, ["staleFail", "raceComplete"]);
  assert.deepEqual(h.updates.map(update => Object.keys(update).find(key => key.startsWith("drawings/"))?.split("/")[1]), ["staleOk"]);
  const update = h.updates[0];
  assert.deepEqual(update, {
    "drawingImages/staleOk": null, "drawingThumbnails/staleOk": null,
    "drawings/staleOk/status": "withdrawn", "drawings/staleOk/withdrawnAt": 2_000_000,
    "drawings/staleOk/updatedAt": 2_000_000
  });
  assert.equal(Object.keys(update).some(key => key.startsWith("userDrawings/")), false);
  assert.ok(h.attempts.includes("staleOk"), "one failed cleanup must not stop a later item");
  assert.equal(h.state.provisionalCleanupCompletedAt, 2_000_000, "partial failure still starts cooldown");
  await h.cleanupStaleProvisionalDrawings({ snapshot: h.snap, now: 2_030_000 });
  assert.equal(h.attempts.filter(id => id === "staleFail").length, 1, "cooldown suppresses immediate retry");
  h.setNow(2_060_001);
  await h.cleanupStaleProvisionalDrawings({ snapshot: h.snap, now: 2_060_001 });
  assert.equal(h.attempts.filter(id => id === "staleFail").length, 2, "failed item retries next sweep cycle");
  assert.ok(h.warnings.some(args => String(args[0]).includes("staleFail") && String(args[0]).includes("drawingImages/staleFail")));
}

{
  const entries = {
    provisional: modern({ createdAt: 1_500_000, expiresAt: 1_900_000 }),
    legacy: { status: "open", imageData: "legacy", createdAt: 0, expiresAt: 1_900_000 },
    complete: modern({ imageReady: true, createdAt: 0, expiresAt: 1_900_000 })
  };
  const h = harness(entries, { failIds: ["provisional"] });
  await h.expireOldDrawings({ force: true, now: 2_000_000 });
  assert.deepEqual(h.transactions.sort(), ["complete", "legacy"], "provisional must never enter expiry transactions");
  assert.equal(h.state.expirySweepCompletedAt, 2_000_000, "cleanup failure must not poison expiry cooldown");
  assert.equal(h.state.provisionalCleanupCompletedAt, 2_000_000);
}

console.log("Provisional cleanup lifecycle checks passed.");
