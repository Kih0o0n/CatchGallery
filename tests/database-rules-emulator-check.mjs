import fs from "node:fs";
import assert from "node:assert/strict";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { ref, set, update } from "firebase/database";

if (!process.env.FIREBASE_DATABASE_EMULATOR_HOST) {
  const message = "Firebase Database Emulator is required. Run `pnpm test:rules`.";
  if (process.env.REQUIRE_FIREBASE_EMULATOR_TEST === "1") throw new Error(message);
  console.log(`${message} Skipped.`);
  process.exit(0);
}

const projectId = "demo-catchgallery";
const rules = fs.readFileSync(new URL("../database.rules.json", import.meta.url), "utf8");
const environment = await initializeTestEnvironment({ projectId, database: { rules } });
const ownerDb = environment.authenticatedContext("owner").database();
const solverDb = environment.authenticatedContext("solver").database();
const adminDb = environment.authenticatedContext("admin").database();
const now = Date.now();

const baseDrawing = (overrides = {}) => ({
  word: "고양이", category: "동물 / 놀이·(기본) 2", answers: ["고양이"], isCustomWord: false,
  imageReady: false, imageVersion: 1, imageFormat: "webp", imageWidth: 720, imageHeight: 720,
  imageBytes: 1_850_000, thumbnailBytes: 290_000,
  drawerId: "owner", drawerNickname: "그린이", status: "open", createdAt: now,
  updatedAt: now, expiresAt: now + 172_800_000, revisionCount: 0, hintUsed: false,
  solverReward: 0, drawerReward: 0, likeCount: 0, ...overrides
});
const completeDrawing = (overrides = {}) => baseDrawing({ imageReady: true, ...overrides });
const legacyDrawing = (overrides = {}) => {
  const drawing = baseDrawing({ imageData: "data:image/png;base64,AAAA", ...overrides });
  for (const field of ["imageReady", "imageVersion", "imageFormat", "imageWidth", "imageHeight", "imageBytes", "thumbnailBytes"]) delete drawing[field];
  return drawing;
};
const drawingRef = (db, id) => ref(db, `drawings/${id}`);
const seed = async (entries, extra = {}) => environment.withSecurityRulesDisabled(async context => {
  await set(ref(context.database()), {
    users: { owner: { nickname: "그린이" }, solver: { nickname: "맞힌이" }, admin: { nickname: "관리자" } },
    admins: { admin: true }, drawings: entries, ...extra
  });
});

try {
  await seed({});
  await assertSucceeds(set(drawingRef(ownerDb, "new-ok"), baseDrawing()));
  await assertSucceeds(update(ref(ownerDb), { "drawingImages/new-ok/imageData": "data:image/webp;base64,AAAA", "drawingThumbnails/new-ok/imageData": "data:image/webp;base64,AAAA" }));
  await assertSucceeds(update(ref(ownerDb), { "drawings/new-ok/imageReady": true, "userDrawings/owner/new-ok": true }));
  await seed({ detailOnly: baseDrawing() }, { drawingImages: { detailOnly: { imageData: "data:image/webp;base64,AAAA" } } });
  await assertFails(update(drawingRef(ownerDb, "detailOnly"), { imageReady: true }));
  await seed({ thumbOnly: baseDrawing() }, { drawingThumbnails: { thumbOnly: { imageData: "data:image/webp;base64,AAAA" } } });
  await assertFails(update(drawingRef(ownerDb, "thumbOnly"), { imageReady: true }));
  await seed({ noImages: baseDrawing() });
  await assertFails(update(drawingRef(ownerDb, "noImages"), { imageReady: true }));
  await seed({ invalidImages: baseDrawing() }, {
    drawingImages: { invalidImages: { imageData: "not-an-image" } },
    drawingThumbnails: { invalidImages: { imageData: "not-an-image" } }
  });
  await assertFails(update(drawingRef(ownerDb, "invalidImages"), { imageReady: true }));
  await assertFails(set(drawingRef(ownerDb, "new-legacy"), baseDrawing({ imageData: "data:image/png;base64,AAAA" })));
  for (const [index, category] of ["<", ">", '"', "'", "`", "="].entries()) {
    await assertFails(set(drawingRef(ownerDb, `bad-category-${index}`), baseDrawing({ category: `안전${category}위험` })));
  }
  await assertSucceeds(set(drawingRef(ownerDb, "new-korean"), baseDrawing({ category: "한글 A1 / · (괄호)" })));
  for (const field of ["imageVersion", "imageFormat", "imageWidth", "imageHeight", "imageBytes", "thumbnailBytes"]) {
    const incomplete = baseDrawing(); delete incomplete[field];
    await assertFails(set(drawingRef(ownerDb, `missing-${field}`), incomplete));
  }
  const missingReady = baseDrawing(); delete missingReady.imageReady;
  await assertFails(set(drawingRef(ownerDb, "missing-ready"), missingReady));
  await assertFails(set(drawingRef(ownerDb, "true-ready"), completeDrawing()));
  await assertFails(set(drawingRef(ownerDb, "image-bytes-over"), baseDrawing({ imageBytes: 1_850_001 })));
  await assertFails(set(drawingRef(ownerDb, "thumbnail-bytes-over"), baseDrawing({ thumbnailBytes: 290_001 })));

  await seed({ modern: completeDrawing() });
  await assertSucceeds(update(drawingRef(ownerDb, "modern"), { status: "withdrawn", withdrawnAt: now, updatedAt: now }));
  const existingUnsafeCategory = completeDrawing({ category: 'x" onfocus="x=1' });
  await seed({ existingUnsafeCategory });
  await assertSucceeds(set(drawingRef(ownerDb, "existingUnsafeCategory"), { ...existingUnsafeCategory, status: "withdrawn", withdrawnAt: now, updatedAt: now }));
  await seed({ modern: completeDrawing() });
  await assertFails(update(drawingRef(ownerDb, "modern"), { imageReady: false }));
  for (const field of ["imageReady", "imageVersion", "imageFormat", "imageWidth", "imageHeight", "imageBytes", "thumbnailBytes"]) {
    await seed({ modern: completeDrawing() });
    await assertFails(update(drawingRef(ownerDb, "modern"), { [field]: null }));
  }
  await seed({ modern: completeDrawing() });
  await assertFails(update(drawingRef(ownerDb, "modern"), { imageReady: null, imageVersion: null, imageFormat: null, imageWidth: null, imageHeight: null, imageBytes: null, thumbnailBytes: null }));
  await assertFails(update(drawingRef(ownerDb, "modern"), { imageData: "data:image/png;base64,AAAA" }));

  await seed({ provisional: baseDrawing() });
  await assertFails(set(drawingRef(solverDb, "provisional"), { ...baseDrawing(), status: "solved", solverId: "solver", solverNickname: "맞힌이", solvedAt: now, solverReward: 10, drawerReward: 30 }));
  await assertFails(set(ref(solverDb, "drawingLikes/provisional/solver"), true));
  await assertFails(set(ref(solverDb, "scoreClaims/solver/provisional"), { score: 10, type: "solver", createdAt: now }));
  await assertFails(set(ref(solverDb, "userSolved/solver/provisional"), true));
  await assertSucceeds(update(drawingRef(ownerDb, "provisional"), { status: "withdrawn", withdrawnAt: now, updatedAt: now }));
  await seed({ provisional: baseDrawing() });
  await assertSucceeds(update(drawingRef(adminDb, "provisional"), { status: "adminDeleted", adminDeletedAt: now, adminDeletedBy: "admin", updatedAt: now }));

  const unsafeIds = ['bad"id', "bad'id", "bad`id", "bad=id", "bad id", "x".repeat(81)];
  for (const [index, unsafeId] of unsafeIds.entries()) {
    await seed({});
    await assertFails(set(drawingRef(ownerDb, unsafeId), baseDrawing()));
    await assertFails(set(ref(ownerDb, `feedbackOwners/${unsafeId}/owner`), true));
  }
  const unsafeExistingId = 'bad"id';
  await seed({ [unsafeExistingId]: completeDrawing() });
  await assertSucceeds(update(drawingRef(ownerDb, unsafeExistingId), { status: "withdrawn", withdrawnAt: now, updatedAt: now }));
  await seed({ [unsafeExistingId]: completeDrawing() });
  await assertSucceeds(update(drawingRef(adminDb, unsafeExistingId), { status: "adminDeleted", adminDeletedAt: now, adminDeletedBy: "admin", updatedAt: now }));
  await seed({ [unsafeExistingId]: completeDrawing({ status: "solved", solverId: "solver", solvedAt: now }) });
  await assertFails(set(ref(solverDb, `drawingLikes/${unsafeExistingId}/solver`), true));
  await assertFails(set(ref(solverDb, `scoreClaims/solver/${unsafeExistingId}`), { score: 10, type: "solver", createdAt: now }));
  await assertFails(set(ref(ownerDb, `userDrawings/owner/${unsafeExistingId}`), true));

  const feedbackMeta = { createdAt: now, updatedAt: now, isAnonymous: false, isSecret: false, displayAuthor: "그린이", status: "open", hidden: false, deleted: false, likeCount: 0, dislikeCount: 0, popularityScore: 0 };
  await seed({});
  await assertSucceeds(set(ref(ownerDb, "feedbackOwners/push_Feedback-1/owner"), true));
  await assertSucceeds(set(ref(ownerDb, "feedbackMeta/push_Feedback-1"), feedbackMeta));
  await assertSucceeds(set(ref(ownerDb, "userFeedback/owner/push_Feedback-1"), true));
  await assertSucceeds(set(ref(ownerDb, "feedbackContent/push_Feedback-1"), { content: "정상 의견입니다" }));
  await seed({}, { feedbackOwners: { [unsafeExistingId]: { owner: true } }, feedbackMeta: { [unsafeExistingId]: feedbackMeta }, feedbackContent: { [unsafeExistingId]: { content: "기존 위험 의견" } }, userFeedback: { owner: { [unsafeExistingId]: true } } });
  await assertSucceeds(update(ref(ownerDb, `feedbackMeta/${unsafeExistingId}`), { deleted: true, deletedAt: now, updatedAt: now }));
  await assertFails(set(ref(solverDb, `feedbackReactions/${unsafeExistingId}/solver`), "like"));

  const solveLegacy = legacyDrawing();
  await seed({ solveLegacy });
  await assertSucceeds(set(drawingRef(solverDb, "solveLegacy"), { ...solveLegacy, status: "solved", solverId: "solver", solverNickname: "맞힌이", solvedAt: now, hintUsed: false, solverReward: 10, drawerReward: 30, updatedAt: now }));
  const expireLegacy = legacyDrawing({ expiresAt: now - 1 });
  await seed({ expireLegacy });
  await assertSucceeds(set(drawingRef(solverDb, "expireLegacy"), { ...expireLegacy, status: "expired", expiredAt: now, updatedAt: now }));
  const withdrawLegacy = legacyDrawing();
  await seed({ withdrawLegacy });
  await assertSucceeds(set(drawingRef(ownerDb, "withdrawLegacy"), { ...withdrawLegacy, status: "withdrawn", withdrawnAt: now, updatedAt: now }));
  const deleteLegacy = legacyDrawing();
  await seed({ deleteLegacy });
  await assertSucceeds(set(drawingRef(adminDb, "deleteLegacy"), { ...deleteLegacy, status: "adminDeleted", adminDeletedAt: now, adminDeletedBy: "admin", updatedAt: now }));
  await seed({ legacy: legacyDrawing() });
  await assertFails(update(drawingRef(ownerDb, "legacy"), { imageData: "data:image/png;base64,BBBB" }));
  await assertSucceeds(update(drawingRef(adminDb, "legacy"), { imageData: null, imageReady: true, imageVersion: 1, imageFormat: "webp", imageWidth: 720, imageHeight: 720, imageBytes: 1000, thumbnailBytes: 200 }));
  await seed({ legacy: legacyDrawing() });
  await assertFails(update(drawingRef(adminDb, "legacy"), { imageData: null, imageReady: true, imageVersion: 1 }));

  assert.ok(true, "database rules compiled and all authenticated allow/deny scenarios completed");
  console.log("Firebase Realtime Database Emulator Rules checks passed.");
} finally {
  await environment.cleanup();
}
