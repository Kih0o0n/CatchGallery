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
    "safeObject", "normalizeAnswer", "isOwnDrawing", "drawerName", "invalidateGalleryListsByStatus", "claimAnswerRewards",
    `"use strict"; ${pick("submitAnswer")}; return submitAnswer;`
  )(
    state, db, async () => "safe-id", () => 100, async () => 0, () => 10,
    value => value || {}, value => String(value || "").trim().toLowerCase(), drawing => drawing.drawerId === state.user.id,
    drawing => drawing.drawerNickname || "unknown", () => {}, async () => {}
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

const modal = pick("showAnswerSuccessModal");
assert.match(modal, /data-like="\$\{drawingId\}"/);
assert.match(modal, /data-answer-success-like="\$\{drawingId\}"/);
assert.match(modal, /aria-pressed="false"/);
assert.match(modal, /ensureLikeState\(drawingId\)/);
assert.match(modal, /toggleLike\(drawingId, likeDrawing\)/);
assert.match(modal, /syncGalleryLike\(drawingId\)/);
assert.match(modal, /state\.pendingLikes\.has\(drawingId\)/);
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
