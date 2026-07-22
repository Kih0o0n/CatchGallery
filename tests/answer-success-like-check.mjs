import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const rules = readFileSync(new URL("../database.rules.json", import.meta.url), "utf8");

function pick(name) {
  const marker = app.includes(`async function ${name}(`) ? `async function ${name}(` : `function ${name}(`;
  const start = app.indexOf(marker);
  assert.notEqual(start, -1, `${name} must exist`);
  const bodyStart = app.indexOf(") {", start) + 2;
  let depth = 0;
  for (let index = bodyStart; index < app.length; index++) {
    if (app[index] === "{") depth++;
    else if (app[index] === "}" && --depth === 0) return app.slice(start, index + 1);
  }
  throw new Error(`could not extract ${name}`);
}

async function runSubmit(currentDrawing, answer = "answer") {
  const state = { user: { id: "solver", nickname: "solver" } };
  let updatedDrawing = null;
  const drawingRef = {
    once: async () => ({ val: () => currentDrawing }),
    transaction: async update => {
      updatedDrawing = update(currentDrawing);
      return { committed: updatedDrawing !== undefined, snapshot: { val: () => updatedDrawing } };
    }
  };
  const db = { ref: path => path === "drawings/safe-id" ? drawingRef : { once: async () => ({ exists: () => true }) } };
  const submitAnswer = Function(
    "state", "db", "resolveDrawingId", "serverNow", "loadRecentSolverSuccessCount", "solverRewardFor",
    "safeObject", "normalizeAnswer", "isOwnDrawing", "drawerName", "invalidateGalleryListsByStatus", "cacheRecentFinalizedDrawing", "claimAnswerRewards",
    `"use strict"; ${pick("submitAnswer")}; return submitAnswer;`
  )(
    state, db, async () => "safe-id", () => 100, async () => 0, () => 10,
    value => value || {}, value => String(value || "").trim().toLowerCase(), drawing => drawing.drawerId === state.user.id,
    drawing => drawing.drawerNickname || "unknown", () => {}, () => true, async () => {}
  );
  return submitAnswer("safe-id", answer, false);
}

const openDrawing = { status: "open", drawerId: "drawer", drawerNickname: "artist", imageReady: true, word: "answer", answers: ["answer"], expiresAt: 1000 };
const normal = await runSubmit(openDrawing);
assert.equal(normal.correct, true);
assert.equal(normal.drawingId, "safe-id");
assert.equal(normal.likeDrawing.status, "solved");
assert.equal(normal.likeDrawing.solverId, "solver");

const settled = { ...openDrawing, status: "solved", solverId: "solver", solverReward: 10, drawerReward: 30, solvedAt: 90 };
const idempotent = await runSubmit(settled);
assert.equal(idempotent.correct, true);
assert.equal(idempotent.drawingId, "safe-id");
assert.equal(idempotent.likeDrawing, settled);

const wrong = await runSubmit(openDrawing, "wrong");
assert.equal(wrong.correct, false);
assert.equal(wrong.drawingId, undefined);
assert.equal(wrong.likeDrawing, undefined);

{
  const pendingState = { pendingLikes: new Set(), pendingLikeOwners: new Map() };
  const operations = Function(
    "state", "isSafeRecordId",
    `"use strict"; ${pick("beginLikeOperation")}; ${pick("finishLikeOperation")}; ${pick("clearPendingLikeOperation")}; return { beginLikeOperation, finishLikeOperation, clearPendingLikeOperation };`
  )(pendingState, value => /^[A-Za-z0-9_-]{1,80}$/.test(value || ""));
  const oldToken = operations.beginLikeOperation("drawing-x");
  assert.ok(oldToken); assert.equal(operations.beginLikeOperation("drawing-x"), null);
  pendingState.pendingLikes.clear(); pendingState.pendingLikeOwners.clear();
  const newToken = operations.beginLikeOperation("drawing-x");
  assert.equal(operations.finishLikeOperation("drawing-x", oldToken), false);
  assert.equal(pendingState.pendingLikes.has("drawing-x"), true);
  assert.equal(pendingState.pendingLikeOwners.get("drawing-x"), newToken);
  const otherToken = operations.beginLikeOperation("drawing-y");
  assert.equal(operations.finishLikeOperation("drawing-x", newToken), true);
  assert.equal(pendingState.pendingLikes.has("drawing-y"), true);
  operations.clearPendingLikeOperation("drawing-y");
  assert.equal(pendingState.pendingLikes.size, 0); assert.equal(pendingState.pendingLikeOwners.size, 0);
  assert.equal(operations.finishLikeOperation("drawing-y", otherToken), false);
}

{
  const galleryState = { pendingLikes: new Set(), pendingLikeOwners: new Map(), galleryIndex: 0, galleryArtistDrawingId: null };
  let currentButtons = [];
  const document = {
    querySelector: () => null,
    querySelectorAll: selector => selector === "[data-like]" || selector.startsWith("[data-like=") ? currentButtons : []
  };
  const gates = [];
  const bindGalleryContent = Function(
    "state", "document", "moveGalleryIndex", "galleryListKey", "history", "galleryHistoryState", "renderGalleryContent",
    "isSafeRecordId", "openGalleryArtist", "ensureLikeState", "toggleLike", "isScreenRequestCurrent", "syncGalleryLike",
    "showToast", "userErrorMessage", "isOwnDrawing", "confirmModal", "adminDeleteDrawing", "renderGallery", "observeGalleryThumbnails", "loadGalleryDetail",
    `"use strict"; let routeTransitionId = 1; const screenRequestIds = { gallery: 1 }; ${pick("beginLikeOperation")}; ${pick("finishLikeOperation")}; ${pick("bindGalleryContent")}; return bindGalleryContent;`
  )(
    galleryState, document, () => {}, () => "solved:new", { pushState() {} }, () => ({}), () => {},
    value => /^[A-Za-z0-9_-]{1,80}$/.test(value || ""), () => {}, async () => {},
    () => new Promise(resolve => gates.push(resolve)), () => true, () => {}, () => {}, error => String(error),
    () => false, () => {}, async () => {}, () => {}, () => {}, () => {}
  );
  const button = id => ({ dataset: { like: id }, disabled: false });
  const event = { stopPropagation() {} };
  const list = [{ id: "drawing-x", drawerId: "artist" }];
  const oldButton = button("drawing-x"); currentButtons = [oldButton]; bindGalleryContent(list);
  const oldRequest = oldButton.onclick(event); await Promise.resolve(); await Promise.resolve();
  galleryState.pendingLikes.clear(); galleryState.pendingLikeOwners.clear();
  const newButton = button("drawing-x"); currentButtons = [newButton]; bindGalleryContent(list);
  const newRequest = newButton.onclick(event); await Promise.resolve(); await Promise.resolve();
  assert.equal(gates.length, 2); gates[0](); await oldRequest;
  assert.equal(galleryState.pendingLikes.has("drawing-x"), true); assert.equal(newButton.disabled, true);
  await newButton.onclick(event); assert.equal(gates.length, 2, "the new owner's disabled button must block duplicates");
  gates[1](); await newRequest;
  assert.equal(galleryState.pendingLikes.has("drawing-x"), false); assert.equal(galleryState.pendingLikeOwners.size, 0); assert.equal(newButton.disabled, false);
}

const modal = pick("showAnswerSuccessModal");
assert.match(modal, /data-like="\$\{drawingId\}"/);
assert.match(modal, /data-answer-success-like="\$\{drawingId\}"/);
assert.match(modal, /aria-pressed="false"/);
assert.match(modal, /ensureLikeState\(drawingId\)/);
assert.match(modal, /toggleLike\(drawingId, likeDrawing\)/);
assert.match(modal, /syncGalleryLike\(drawingId\)/);
assert.match(modal, /beginLikeOperation\(drawingId\)/);
assert.match(modal, /finishLikeOperation\(drawingId, operationToken\)/);
assert.doesNotMatch(modal, /pendingLikes\.(?:add|delete)\(drawingId\)/);
const galleryBinding = pick("bindGalleryContent");
assert.match(galleryBinding, /beginLikeOperation\(id\)/);
assert.match(galleryBinding, /finishLikeOperation\(id, operationToken\)/);
assert.doesNotMatch(galleryBinding, /pendingLikes\.(?:add|delete)\(id\)/);
assert.match(modal, /ownsModal/);
assert.match(modal, /sessionIsCurrent/);
assert.match(modal, /isCacheSessionCurrent\(userId, generation\)/);
assert.match(modal, /MutationObserver/);
assert.match(modal, /다시 불러오기/);
assert.match(pick("syncGalleryLike"), /updateLikeButtonAccessibility/);
assert.match(pick("updateLikeButtonAccessibility"), /data-answer-success-like/);
assert.match(pick("likeAccessibilityLabel"), /좋아요 취소, 현재 \$\{count\}개/);
assert.match(pick("likeAccessibilityLabel"), /좋아요, 현재 \$\{count\}개/);
assert.match(pick("likeAccessibilityLabel"), /내 그림에는 좋아요를 누를 수 없음/);
assert.match(pick("galleryFrame"), /data-own-like/);
assert.match(pick("galleryThumbs"), /data-own-like/);
assert.match(pick("syncAnswerSuccessLikeAvailability"), /pendingLikes/);
assert.doesNotMatch(pick("syncGalleryLike"), /value\.liked \? "좋아요 취소" : "좋아요"/);
assert.match(styles, /\.answer-success-like-button[^}]*min-height:\s*48px/);
assert.match(styles, /\.answer-success-modal[^}]*overflow:\s*auto/);
assert.doesNotMatch(app, /submitAnswer[\s\S]{0,200}toggleLike\(/, "answer transaction must not auto-like");
assert.doesNotMatch(modal, /db\.ref|drawingLikes\//, "modal must reuse like helpers");
assert.doesNotMatch(rules, /answerSuccessLike/, "Rules must remain unchanged for this feature");

console.log("Answer success like static and production result checks passed.");
