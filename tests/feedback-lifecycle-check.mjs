import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const rules = JSON.parse(fs.readFileSync(new URL("../database.rules.json", import.meta.url), "utf8")).rules;

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
const classSource = source.match(/class LimitedLruCache[\s\S]*?(?=\nconst state =)/)?.[0];
const LimitedLruCache = Function(`${classSource}; return LimitedLruCache;`)();
const snapshotNames = ["feedbackOperationContext", "isFeedbackContextCurrent", "feedbackPendingKey", "beginFeedbackPending", "endFeedbackPending", "feedbackMetaById", "feedbackCanRead", "feedbackCanReact", "recalculateFeedbackReaction", "feedbackSnapshotList", "loadFeedbackSnapshot"];

function childSnapshot(values) {
  return { forEach(callback) { Object.entries(values).forEach(([key, value]) => callback({ key, val: () => value })); } };
}
function valueSnapshot(value) { return { val: () => value, exists: () => value !== null && value !== undefined }; }
function makeState() {
  return {
    user: { id: "user-a", nickname: "A" }, cacheOwnerUid: "user-a", cacheGeneration: 1, route: "feedback", isAdmin: false,
    feedbackView: "all", feedbackSort: "new", feedbackSnapshot: null, feedbackSnapshotPromise: null,
    feedbackBodyCache: new LimitedLruCache(2), feedbackBodyPromises: new Map(), feedbackPending: new Map()
  };
}

{
  const state = makeState();
  let now = 1000, reads = 0;
  const gates = [];
  const values = {
    feedbackMeta: childSnapshot({ public: { createdAt: 2, deleted: false, hidden: false, isSecret: false }, secret: { createdAt: 1, deleted: false, hidden: false, isSecret: true } }),
    "userFeedback/user-a": valueSnapshot({ secret: true }),
    feedbackReactions: valueSnapshot({ public: { "user-a": "like", other: "dislike" } })
  };
  const db = { ref(path) { return { once() { reads++; const gate = Promise.resolve(values[path]); gates.push(gate); return gate; } }; } };
  const api = Function("state", "db", "safeObject", "serverNow", "FEEDBACK_CACHE_TTL_MS", "isCacheSessionCurrent", `${snapshotNames.map(pick).join("\n")}; return { ${snapshotNames.join(",")} };`)(state, db, value => value && typeof value === "object" ? value : {}, () => now, 30_000, (uid, generation) => state.user?.id === uid && state.cacheOwnerUid === uid && state.cacheGeneration === generation);
  const first = api.loadFeedbackSnapshot();
  const simultaneous = api.loadFeedbackSnapshot();
  assert.equal(first, simultaneous, "same-session loads share one in-flight Promise");
  await first;
  assert.equal(reads, 3);
  assert.equal((await api.loadFeedbackSnapshot()), state.feedbackSnapshot);
  assert.equal(reads, 3, "fresh snapshot cache prevents rereads");
  state.feedbackSort = "old"; state.feedbackView = "mine";
  assert.deepEqual(api.feedbackSnapshotList().map(item => item.id), ["secret"], "view and sort use the cached snapshot");
  assert.equal(reads, 3);
  now += 30_001;
  await api.loadFeedbackSnapshot();
  assert.equal(reads, 6, "TTL expiry refreshes the three snapshot reads");
  state.user = { id: "user-b" }; state.cacheOwnerUid = "user-b"; state.cacheGeneration++;
  assert.equal(api.isFeedbackContextCurrent({ uid: "user-a", generation: 1 }), false, "old account ownership is rejected");
}

{
  const state = makeState();
  let reads = 0;
  const responses = [];
  const db = { ref() { return { once() { reads++; return Promise.resolve(valueSnapshot(responses.shift())); } }; } };
  const isFeedbackContextCurrent = context => context.uid === state.user.id && context.generation === state.cacheGeneration;
  const feedbackCanRead = Function("state", `${pick("feedbackCanRead")}; return feedbackCanRead;`)(state);
  const loadFeedbackBody = Function("state", "db", "feedbackCanRead", "isFeedbackContextCurrent", `${pick("loadFeedbackBody")}; return loadFeedbackBody;`)(state, db, feedbackCanRead, isFeedbackContextCurrent);
  const context = { uid: "user-a", generation: 1 };
  assert.equal(await loadFeedbackBody({ id: "locked", isSecret: true, isMine: false, hidden: false, deleted: false }, context), null);
  assert.equal(reads, 0, "unreadable secret content never reaches Firebase");
  const meta = { id: "public", isSecret: false, isMine: false, hidden: false, deleted: false };
  responses.push({ content: "정상 본문 내용" });
  const first = loadFeedbackBody(meta, context);
  const simultaneous = loadFeedbackBody(meta, context);
  assert.equal(first, simultaneous, "same body shares its Promise");
  assert.equal(reads, 1);
  assert.deepEqual(await first, { content: "정상 본문 내용" });
  assert.deepEqual(await loadFeedbackBody(meta, context), { content: "정상 본문 내용" });
  assert.equal(reads, 1, "body LRU prevents rereads");

  for (const [id, invalid] of [["missing", null], ["scalar", "broken"], ["no-content", { adminReply: "답변" }]]) {
    responses.push(invalid);
    await assert.rejects(loadFeedbackBody({ ...meta, id }, context), /feedback-content-invalid/);
    assert.equal(state.feedbackBodyCache.has(id), false, `${id} is not cached as an empty body`);
    assert.equal(state.feedbackBodyPromises.has(id), false, `${id} clears its rejected Promise for retry`);
  }
  responses.push(null, { content: "재시도 본문" });
  await assert.rejects(loadFeedbackBody({ ...meta, id: "retry" }, context), /feedback-content-invalid/);
  assert.deepEqual(await loadFeedbackBody({ ...meta, id: "retry" }, context), { content: "재시도 본문" }, "retry starts a fresh Firebase read");
}

{
  const loader = { active: 0, queue: [], cancelled: false };
  const gates = [];
  for (let index = 0; index < 7; index++) loader.queue.push(() => new Promise(resolve => gates.push(resolve)));
  const run = Function("isFeedbackLoaderCurrent", "FEEDBACK_BODY_CONCURRENCY", `${pick("runFeedbackBodyQueue")}; return runFeedbackBodyQueue;`)(() => !loader.cancelled, 3);
  run(loader);
  assert.equal(loader.active, 3, "body queue enforces the concurrency limit");
  gates.shift()(); await Promise.resolve(); await Promise.resolve();
  assert.equal(loader.active, 3, "the next body starts only after a slot is released");
  loader.cancelled = true; loader.queue.length = 0;
}

{
  const removed = [];
  const data = { owner: true, user: true, meta: { id: "draft" }, content: null };
  const pathKey = path => path.startsWith("feedbackOwners") ? "owner" : path.startsWith("userFeedback") ? "user" : path.startsWith("feedbackMeta") ? "meta" : "content";
  const db = { ref(path) { const key = pathKey(path); return { once: async () => valueSnapshot(data[key]), remove: async () => { removed.push(key); data[key] = null; } }; } };
  const cleanup = Function("db", "isFeedbackContextCurrent", "console", `async ${pick("cleanupIncompleteFeedback")}; return cleanupIncompleteFeedback;`)(db, () => true, { error() {} });
  assert.equal(await cleanup("draft", "user-a", { uid: "user-a" }), true);
  assert.deepEqual(removed, ["meta", "user", "owner"], "incomplete creation cleanup uses the safe staged order");
  data.owner = true; data.user = true; data.meta = {}; data.content = { content: "완성" }; removed.length = 0;
  assert.equal(await cleanup("complete", "user-a", { uid: "user-a" }), false);
  assert.deepEqual(removed, [], "completed content is never cleaned up as an incomplete write");
}

{
  const state = makeState();
  let currentRequest = 1;
  const isCacheSessionCurrent = (uid, generation) => state.user?.id === uid && state.cacheOwnerUid === uid && state.cacheGeneration === generation;
  const isScreenRequestCurrent = request => state.route === "feedback" && request.id === currentRequest;
  const code = ["feedbackOperationContext", "isFeedbackContextCurrent", "feedbackPendingKey", "beginFeedbackPending", "endFeedbackPending", "performFeedbackOperation"].map(name => name === "performFeedbackOperation" ? `async ${pick(name)}` : pick(name)).join("\n");
  const api = Function("state", "isCacheSessionCurrent", "isScreenRequestCurrent", `${code}; return { performFeedbackOperation, feedbackPendingKey };`)(state, isCacheSessionCurrent, isScreenRequestCurrent);
  let finish;
  const gate = new Promise(resolve => { finish = resolve; });
  const first = api.performFeedbackOperation("edit", "post", { id: 1 }, () => gate);
  const duplicate = await api.performFeedbackOperation("edit", "post", {}, async () => "duplicate");
  assert.equal(duplicate.duplicate, true, "the same pending operation cannot execute twice");
  currentRequest = 2;
  finish("saved");
  assert.deepEqual(await first, { ok: true, value: "saved", refresh: true }, "sort/tab rerender keeps same-session success and requests a fresh screen render");
  assert.equal(state.feedbackPending.size, 0, "same-session completion always clears pending");

  let rejectEdit;
  const failed = api.performFeedbackOperation("edit", "post", { id: 2 }, () => new Promise((_, reject) => { rejectEdit = reject; }));
  currentRequest = 3;
  rejectEdit(new Error("save failed"));
  const failedResult = await failed;
  assert.equal(failedResult.error.message, "save failed");
  assert.equal(failedResult.refresh, true, "stale-request failure restores the latest sort/tab screen");
  assert.equal(state.feedbackPending.size, 0, "failed operation always clears pending so no processing label remains");

  let finishOldAccount;
  const oldAccount = api.performFeedbackOperation("reaction", "other", { id: 3 }, () => new Promise(resolve => { finishOldAccount = resolve; }));
  state.user = { id: "user-b" }; state.cacheOwnerUid = "user-b"; state.cacheGeneration = 2;
  state.feedbackPending = new Map([[api.feedbackPendingKey("reaction", "other"), { owner: "b" }]]);
  finishOldAccount("late-a");
  assert.equal((await oldAccount).stale, true, "account changes block old results and therefore their toast/render path");
  assert.equal(state.feedbackPending.has(api.feedbackPendingKey("reaction", "other")), true, "old completion cannot clear the new user's pending operation");

  state.user = { id: "user-b" }; state.cacheOwnerUid = "user-b"; state.cacheGeneration = 2; state.feedbackPending.clear(); state.route = "feedback"; currentRequest = 4;
  let finishAfterLeave;
  const afterLeave = api.performFeedbackOperation("hide", "post", { id: 4 }, () => new Promise(resolve => { finishAfterLeave = resolve; }));
  state.route = "gallery";
  finishAfterLeave(true);
  assert.equal((await afterLeave).stale, true, "leaving feedback blocks its toast and screen rerender path");
  assert.equal(state.feedbackPending.size, 0);
}

{
  const state = makeState();
  const meta = { id: "post", deleted: false, hidden: false, isSecret: false, isMine: false, likeCount: 0, dislikeCount: 0 };
  state.feedbackSnapshot = { items: [meta], reactions: { post: {} } };
  let stored = null, transactions = 0;
  const db = { ref(path) { assert.equal(path, "feedbackReactions/post/user-a"); return { transaction: async updater => { transactions++; stored = updater(stored); return { committed: true }; } }; } };
  const context = { uid: "user-a", generation: 1 };
  const toggle = Function("state", "db", "feedbackMetaById", "feedbackCanReact", "isFeedbackContextCurrent", "safeObject", "recalculateFeedbackReaction", `async ${pick("toggleFeedbackReaction")}; return toggleFeedbackReaction;`)(
    state, db, id => state.feedbackSnapshot.items.find(item => item.id === id), item => !!item && !item.isMine && !item.isSecret && !item.hidden && !item.deleted,
    ctx => ctx.uid === state.user.id && ctx.generation === state.cacheGeneration, value => value && typeof value === "object" ? value : {},
    (item, reactions, uid) => { const values = Object.values(reactions); item.likeCount = values.filter(value => value === "like").length; item.dislikeCount = values.filter(value => value === "dislike").length; item.popularityScore = item.likeCount - item.dislikeCount; item.myReaction = reactions[uid] || null; }
  );
  assert.equal(await toggle("post", "like", context), "like");
  assert.deepEqual({ like: meta.likeCount, dislike: meta.dislikeCount, mine: meta.myReaction }, { like: 1, dislike: 0, mine: "like" });
  assert.equal(await toggle("post", "like", context), null);
  assert.equal(await toggle("post", "dislike", context), "dislike");
  assert.deepEqual({ like: meta.likeCount, dislike: meta.dislikeCount, mine: meta.myReaction }, { like: 0, dislike: 1, mine: "dislike" });
  assert.equal(transactions, 3, "reaction transitions do not reread the feedback list");
}

assert.match(source, /maxlength="300" placeholder="운영자 답변"/);
assert.match(source, /reply\.length > 300/);
assert.match(rules.feedbackContent.$feedbackId[".read"], /deleted'\)\.val\(\) === false/);
assert.match(rules.feedbackContent.$feedbackId[".read"], /hidden'\)\.val\(\) === false/);
assert.match(rules.feedbackReactions.$feedbackId.$uid[".write"], /isSecret'\)\.val\(\) === false/);
assert.match(rules.feedbackReactions.$feedbackId.$uid[".write"], /hidden'\)\.val\(\) === false/);
assert.match(rules.feedbackOwners.$feedbackId.$uid[".write"], /!newData\.exists\(\)/);
assert.match(rules.feedbackMeta.$feedbackId[".write"], /!root\.child\('feedbackContent'\)/);
const contentWrite = rules.feedbackContent.$feedbackId[".write"];
assert.match(contentWrite, /data\.exists\(\) && newData\.exists\(\) && newData\.hasChild\('content'\)/, "owner updates require a complete surviving body node");
assert.match(contentWrite, /newData\.child\('adminReply'\)\.val\(\) === data\.child\('adminReply'\)\.val\(\)/, "owners preserve administrator reply fields");
assert.match(contentWrite, /!data\.exists\(\).*newData\.child\('adminReply'\)/, "normal first body creation remains available without admin fields");
assert.match(contentWrite, /root\.child\('admins'\).*newData\.child\('content'\)\.val\(\) === data\.child\('content'\)\.val\(\)/, "administrator reply creation and edits preserve the body text");
assert.match(rules.feedbackMeta.$feedbackId[".write"], /newData\.exists\(\) \|\| !root\.child\('feedbackContent'\)/, "only metadata without a completed content node can use incomplete cleanup");

console.log("Feedback lifecycle cache checks passed.");
