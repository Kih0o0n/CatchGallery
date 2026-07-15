import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
function pick(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  let depth = 0, opened = false;
  for (let i = start; i < source.length; i++) {
    if (source[i] === "{") { depth++; opened = true; }
    else if (source[i] === "}" && opened && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`could not extract ${name}`);
}
function pickAsync(name) { return `async ${pick(name)}`; }
function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
async function settle() { for (let i = 0; i < 8; i++) await Promise.resolve(); }

const classSource = source.match(/class LimitedLruCache[\s\S]*?(?=\nconst state =)/)?.[0];
assert.ok(classSource);
const LimitedLruCache = Function(`${classSource}; return LimitedLruCache;`)();

{
  const cache = new LimitedLruCache(3);
  cache.set("a", 1).set("b", 2).set("c", 3);
  assert.equal(cache.size, 3);
  assert.equal(cache.get("a"), 1);
  cache.set("d", 4);
  assert.equal(cache.has("b"), false, "get must extend an entry's lifetime");
  cache.set("c", 30);
  cache.set("e", 5);
  assert.equal(cache.has("a"), false, "updating an existing key makes it most recent");
  assert.equal(cache.get("c"), 30);
  assert.equal(cache.delete("d"), true);
  assert.equal(cache.size, 2);
  cache.clear();
  assert.equal(cache.size, 0);
}

for (const [limit, label] of [[60, "thumbnail"], [12, "detail"], [200, "like"]]) {
  const cache = new LimitedLruCache(limit);
  for (let i = 0; i <= limit; i++) cache.set(`key-${i}`, `value-${i}`);
  assert.equal(cache.size, limit, `${label} cache must be bounded`);
  assert.equal(cache.has("key-0"), false);
}

function sessionHarness() {
  const state = {
    user: { id: "a" }, cacheOwnerUid: null, cacheGeneration: 0,
    thumbnailCache: new LimitedLruCache(60), detailImageCache: new LimitedLruCache(12), likeCache: new LimitedLruCache(200),
    galleryLists: {}, galleryScroll: {}, pendingLikes: new Set(), manageDrawings: null,
    hintUsed: {}, editingFeedback: null
  };
  const api = Function("state", `${pick("resetUserSessionCaches")};${pick("setCacheSession")};${pick("isCacheSessionCurrent")}; return { resetUserSessionCaches, setCacheSession, isCacheSessionCurrent };`)(state);
  return { state, ...api };
}

{
  const h = sessionHarness();
  h.setCacheSession("a");
  h.state.thumbnailCache.set("image", "thumb"); h.state.detailImageCache.set("image", "detail"); h.state.likeCache.set("image", { liked: true });
  h.state.galleryLists = { "solved:new": [{ id: "image", isLiked: true }] };
  h.state.galleryScroll = { "solved:new": 55 }; h.state.pendingLikes.add("image"); h.state.manageDrawings = [{ id: "image" }];
  h.state.hintUsed = { drawing: true };
  h.state.editingFeedback = { id: "feedback-a", content: "사용자 A의 의견" };
  const generation = h.state.cacheGeneration;
  assert.equal(h.setCacheSession("a"), false);
  assert.equal(h.state.cacheGeneration, generation);
  assert.equal(h.state.thumbnailCache.get("image"), "thumb", "same UID profile refresh preserves caches");
  assert.deepEqual(h.state.hintUsed, { drawing: true }, "same UID preserves hint state");
  assert.deepEqual(h.state.editingFeedback, { id: "feedback-a", content: "사용자 A의 의견" }, "same UID preserves feedback editing state");
  assert.equal(h.setCacheSession("b"), true);
  assert.equal(h.state.thumbnailCache.size, 0); assert.equal(h.state.detailImageCache.size, 0); assert.equal(h.state.likeCache.size, 0);
  assert.deepEqual(h.state.galleryLists, {}); assert.deepEqual(h.state.galleryScroll, {}); assert.equal(h.state.pendingLikes.size, 0); assert.equal(h.state.manageDrawings, null);
  assert.deepEqual(h.state.hintUsed, {}); assert.equal(h.state.editingFeedback, null);
  h.state.hintUsed = { drawing: true }; h.state.editingFeedback = { id: "feedback-b", content: "사용자 B의 의견" };
  assert.equal(h.setCacheSession(null), true);
  assert.deepEqual(h.state.hintUsed, {}); assert.equal(h.state.editingFeedback, null);
  assert.equal(h.setCacheSession(null), false, "repeated logout cleanup is safe");
  assert.deepEqual(h.state.hintUsed, {}); assert.equal(h.state.editingFeedback, null);
}

{
  const h = sessionHarness(); h.setCacheSession("a");
  h.state.editingFeedback = { id: "feedback-a", content: "사용자 A의 의견" };
  h.state.user = { id: "b" }; h.setCacheSession("b");
  const appEl = { innerHTML: "" };
  const renderFeedback = Function(
    "state", "beginScreenRequest", "loading", "loadFeedback", "isScreenRequestCurrent", "appEl", "FEEDBACK_SORTS", "escapeHtml", "emptyHtml", "feedbackCard", "bindFeedback", "console",
    `${pickAsync("renderFeedback")}; return renderFeedback;`
  )(
    h.state, () => ({ routeName: "feedback", transitionId: 1, requestId: 1 }), () => {}, async () => [], () => true,
    appEl, ["new"], value => String(value), () => "empty", () => "", () => {}, { error() {} }
  );
  await renderFeedback();
  assert.doesNotMatch(appEl.innerHTML, /사용자 A의 의견/);
  assert.match(appEl.innerHTML, /보내기/);
  assert.doesNotMatch(appEl.innerHTML, /수정 저장/);
}

{
  const h = sessionHarness(); h.setCacheSession("a");
  const gate = deferred(); let reads = 0;
  const db = { ref: () => ({ once: () => { reads++; return gate.promise; } }) };
  const loadDrawingImage = Function("state", "db", `${pickAsync("loadDrawingImage")}; return loadDrawingImage;`)(h.state, db);
  const pending = loadDrawingImage({ id: "late", imageReady: true }, "detail");
  h.state.user = { id: "b" }; h.setCacheSession("b");
  gate.resolve({ val: () => "late-detail" });
  assert.equal(await pending, "late-detail");
  assert.equal(h.state.detailImageCache.has("late"), false, "old image completion cannot populate the new session cache");
  h.state.detailImageCache.set("cached", "cache-hit");
  assert.equal(await loadDrawingImage({ id: "cached", imageReady: true }), "cache-hit");
  assert.equal(reads, 1, "image cache hits avoid Firebase reads");
}

{
  const h = sessionHarness(); h.setCacheSession("a");
  const gate = deferred();
  const db = { ref: () => ({ once: () => gate.promise }) };
  const safeObject = value => value && typeof value === "object" ? value : {};
  const ensureLikeState = Function("state", "db", "safeObject", "isCacheSessionCurrent", `${pickAsync("ensureLikeState")}; return ensureLikeState;`)(h.state, db, safeObject, h.isCacheSessionCurrent);
  h.state.galleryLists = { "solved:new": [{ id: "drawing", likeCount: 1, isLiked: false }] };
  const pending = ensureLikeState("drawing");
  h.state.user = { id: "b" }; h.setCacheSession("b");
  h.state.galleryLists = { "solved:new": [{ id: "other", likeCount: 7, isLiked: true }] };
  gate.resolve({ val: () => ({ a: true }) });
  assert.deepEqual(await pending, { count: 1, liked: true });
  assert.equal(h.state.likeCache.has("drawing"), false);
  assert.deepEqual(h.state.galleryLists, { "solved:new": [{ id: "other", likeCount: 7, isLiked: true }] });
}

{
  const h = sessionHarness(); h.setCacheSession("a");
  const gate = deferred(); let path = "", toasts = 0;
  const db = { ref: value => { path = value; return { transaction: () => gate.promise }; } };
  const toggleLike = Function("state", "db", "performance", "isCacheSessionCurrent", "showToast", "console", `${pickAsync("toggleLike")}; return toggleLike;`)(h.state, db, { now: () => 0 }, h.isCacheSessionCurrent, () => { toasts++; }, { info() {} });
  const pending = toggleLike("drawing", { id: "drawing", status: "solved", drawerId: "owner" });
  assert.equal(path, "drawingLikes/drawing/a", "transaction path is owned by the starting user");
  h.state.user = { id: "b" }; h.setCacheSession("b");
  h.state.likeCache.set("new-user", { liked: false, count: 4 });
  h.state.galleryLists = { "solved:new": [{ id: "new-user", isLiked: false, likeCount: 4 }] };
  gate.resolve({ committed: true });
  assert.equal(await pending, null);
  assert.equal(h.state.likeCache.has("drawing"), false);
  assert.deepEqual(h.state.galleryLists["solved:new"], [{ id: "new-user", isLiked: false, likeCount: 4 }]);
  assert.equal(toasts, 0);
}

function cacheState() {
  return {
    galleryLists: {
      "solved:new": [{ id: "drawing" }], "solved:old": [{ id: "drawing" }], "solved:popular": [{ id: "drawing" }],
      "expired:new": [{ id: "other" }], "expired:old": [{ id: "other" }]
    },
    thumbnailCache: new LimitedLruCache(60), detailImageCache: new LimitedLruCache(12), likeCache: new LimitedLruCache(200), pendingLikes: new Set(["drawing"])
  };
}
{
  const state = cacheState();
  state.thumbnailCache.set("drawing", "thumb"); state.detailImageCache.set("drawing", "detail"); state.likeCache.set("drawing", { liked: true });
  const invalidateGalleryListsByStatus = Function("state", `${pick("invalidateGalleryListsByStatus")}; return invalidateGalleryListsByStatus;`)(state);
  const invalidate = Function("state", "invalidateGalleryListsByStatus", `${pick("invalidateDrawingCachesAfterAdminDelete")}; return invalidateDrawingCachesAfterAdminDelete;`)(state, invalidateGalleryListsByStatus);
  invalidate("drawing", "solved");
  assert.equal(state.galleryLists["solved:new"], undefined); assert.equal(state.galleryLists["solved:old"], undefined); assert.equal(state.galleryLists["solved:popular"], undefined);
  assert.ok(state.galleryLists["expired:new"]); assert.ok(state.galleryLists["expired:old"]);
  assert.equal(state.thumbnailCache.has("drawing"), false); assert.equal(state.detailImageCache.has("drawing"), false); assert.equal(state.likeCache.has("drawing"), false); assert.equal(state.pendingLikes.has("drawing"), false);
}

{
  const state = cacheState(); let invalidations = 0;
  state.isAdmin = true; state.user = { id: "admin" };
  const db = { ref: () => ({ once: async () => ({ val: () => ({ id: "drawing", status: "solved" }) }), transaction: async () => ({ committed: false }) }) };
  const adminDeleteDrawing = Function("state", "db", "serverNow", "invalidateDrawingCachesAfterAdminDelete", `${pickAsync("adminDeleteDrawing")}; return adminDeleteDrawing;`)(state, db, () => 1, () => { invalidations++; });
  await assert.rejects(adminDeleteDrawing("drawing"));
  assert.equal(invalidations, 0, "failed/uncommitted deletion preserves caches");
  assert.ok(state.galleryLists["solved:new"]); assert.equal(state.pendingLikes.has("drawing"), true);
}

{
  const state = cacheState(); let invalidations = 0;
  state.isAdmin = true; state.user = { id: "admin" };
  state.thumbnailCache.set("drawing", "thumb"); state.detailImageCache.set("drawing", "detail"); state.likeCache.set("drawing", { liked: true });
  const db = { ref: () => ({ once: async () => ({ val: () => ({ id: "drawing", status: "solved" }) }), transaction: async () => { throw new Error("transaction failed"); } }) };
  const adminDeleteDrawing = Function("state", "db", "serverNow", "invalidateDrawingCachesAfterAdminDelete", `${pickAsync("adminDeleteDrawing")}; return adminDeleteDrawing;`)(state, db, () => 1, () => { invalidations++; });
  await assert.rejects(adminDeleteDrawing("drawing"), /transaction failed/);
  assert.equal(invalidations, 0, "transaction exceptions must not invalidate caches");
  assert.ok(state.galleryLists["solved:new"]); assert.equal(state.thumbnailCache.get("drawing"), "thumb");
  assert.equal(state.detailImageCache.get("drawing"), "detail"); assert.deepEqual(state.likeCache.get("drawing"), { liked: true });
  assert.equal(state.pendingLikes.has("drawing"), true);
}

{
  const state = cacheState(); state.isAdmin = true; state.user = { id: "admin" };
  let invalidated = null;
  const db = { ref: () => ({
    once: async () => ({ val: () => ({ id: "drawing", status: "solved" }) }),
    transaction: async update => { const updated = update({ id: "drawing", status: "solved" }); assert.equal(updated.adminDeletedBy, "admin"); return { committed: true }; }
  }) };
  const adminDeleteDrawing = Function("state", "db", "serverNow", "invalidateDrawingCachesAfterAdminDelete", `${pickAsync("adminDeleteDrawing")}; return adminDeleteDrawing;`)(state, db, () => 5, (id, status) => { invalidated = { id, status }; });
  assert.equal(await adminDeleteDrawing("drawing"), "solved");
  assert.deepEqual(invalidated, { id: "drawing", status: "solved" }, "successful transactions invalidate using the previous status");
}

assert.match(source, /CACHE_LIMITS = \{ thumbnails: 60, details: 12, likes: 200 \}/);
console.log("Cache lifecycle checks passed.");
