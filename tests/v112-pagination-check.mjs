import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const helpersSource = app.match(/function isValidMigrationCursor[\s\S]*?(?=function migrationTimeout)/)?.[0];
assert.ok(helpersSource, "migration pagination helpers must be readable");
const { isValidMigrationCursor, buildMigrationQuery, migrationBatchItems, migrationNextCursor } = Function(`${helpersSource}; return { isValidMigrationCursor, buildMigrationQuery, migrationBatchItems, migrationNextCursor };`)();

function queryMock() {
  const calls = [];
  const query = {
    orderByKey() { calls.push(["orderByKey"]); return this; },
    startAt(cursor) { calls.push(["startAt", cursor]); return this; },
    limitToFirst(limit) { calls.push(["limitToFirst", limit]); return this; }
  };
  return { query, calls };
}

function snapshot(keys) {
  return { forEach(callback) { keys.forEach(key => callback({ key, val: () => ({ marker: key }) })); } };
}

for (const cursor of [undefined, null, "", "   ", 0, 12, {}, [], "bad/key", "bad.key", "bad#key", "bad$key", "bad[key", "bad]key", "bad\u0000key"]) {
  const { query, calls } = queryMock();
  buildMigrationQuery(query, cursor, 2);
  assert.deepEqual(calls, [["orderByKey"], ["limitToFirst", 2]], `invalid cursor must not call startAt: ${String(cursor)}`);
  assert.equal(isValidMigrationCursor(cursor), false);
}

{
  const { query, calls } = queryMock();
  buildMigrationQuery(query, "B", 2);
  assert.deepEqual(calls, [["orderByKey"], ["startAt", "B"], ["limitToFirst", 3]]);
  assert.equal(isValidMigrationCursor("B"), true);
}

const processed = [];
let cursor = null;
let items = migrationBatchItems(snapshot(["A", "B"]), cursor, 2);
processed.push(...items.map(item => item.id));
cursor = migrationNextCursor(cursor, items, false);
assert.equal(cursor, "B");

items = migrationBatchItems(snapshot(["B", "C", "D"]), cursor, 2);
assert.deepEqual(items.map(item => item.id), ["C", "D"], "next batch must drop only the repeated cursor");
processed.push(...items.map(item => item.id));
cursor = migrationNextCursor(cursor, items, false);
assert.equal(cursor, "D");

items = migrationBatchItems(snapshot(["D", "E"]), cursor, 2);
assert.deepEqual(items.map(item => item.id), ["E"], "last one-item batch must be retained");
processed.push(...items.map(item => item.id));
cursor = migrationNextCursor(cursor, items, false);
assert.equal(cursor, "E");
assert.deepEqual(processed, ["A", "B", "C", "D", "E"]);
assert.equal(new Set(processed).size, processed.length, "drawings must not be processed twice");

assert.deepEqual(migrationBatchItems(snapshot([]), null, 2), [], "empty snapshots must complete normally");
assert.deepEqual(migrationBatchItems(snapshot(["B", "B", "C"]), "B", 2).map(item => item.id), ["B", "C"], "only the first cursor match is removed");
assert.equal(migrationNextCursor("B", [{ id: "C" }, { id: "D" }], true), "B", "failed batches must retain their starting cursor");
assert.equal(migrationNextCursor("B", [], false), "B", "empty batches must not move the cursor");

let cursorAfterRejectedQuery = "B";
try {
  await Promise.reject(Object.assign(new Error("invalid_parameters"), { code: "INVALID_PARAMETERS" }));
  cursorAfterRejectedQuery = migrationNextCursor(cursorAfterRejectedQuery, [{ id: "C" }], false);
} catch (_) {}
assert.equal(cursorAfterRejectedQuery, "B", "query rejection must not advance the cursor");

const migration = app.match(/async function runMigrationBatch[\s\S]*?async function loadRanking/)?.[0];
assert.ok(migration);
assert.doesNotMatch(migration, /startAt\(state\.migrationCursor\s*\|\|\s*""\)/);
assert.match(migration, /const batchStartCursor = state\.migrationCursor[\s\S]*buildMigrationQuery\([^\n]+batchStartCursor/);
assert.match(migration, /state\.migrationCursor = migrationNextCursor\(batchStartCursor, items, totals\.failed > 0\)/);
assert.match(migration, /finally \{[\s\S]*state\.migrationRunning = false/);
assert.match(app, /migrationBatch:\s*2/);
assert.match(app, /migrationTimeout:\s*25000/);
assert.match(app, /home-version[^\n]+v1\.5\.0/);

console.log("v1.1.2 pagination checks passed.");
