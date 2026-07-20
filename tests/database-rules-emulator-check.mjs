import fs from "node:fs";
import assert from "node:assert/strict";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { get, ref, set, update } from "firebase/database";

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
const PNG_DATA_URL = "data:image/png;base64,iVBORw0KGgo=";
const WEBP_DATA_URL = "data:image/webp;base64,UklGRg==";
const dataUrlForBytes = (mime, bytes) => `data:image/${mime};base64,${Buffer.alloc(bytes).toString("base64")}`;
const editUpdate = (id, revisionCount, suffix = "") => ({
  [`drawingImages/${id}/imageData`]: `data:image/png;base64,iVBORw0KGg${suffix || "o"}=`,
  [`drawingThumbnails/${id}/imageData`]: WEBP_DATA_URL,
  [`drawings/${id}/imageVersion`]: 1,
  [`drawings/${id}/imageFormat`]: "webp",
  [`drawings/${id}/imageWidth`]: 720,
  [`drawings/${id}/imageHeight`]: 720,
  [`drawings/${id}/imageBytes`]: 1000,
  [`drawings/${id}/thumbnailBytes`]: 200,
  [`drawings/${id}/imageReady`]: true,
  [`drawings/${id}/updatedAt`]: now + revisionCount,
  [`drawings/${id}/revisionCount`]: revisionCount
});
const staleCleanupUpdate = (id, timestamp = now) => ({
  [`drawingImages/${id}`]: null,
  [`drawingThumbnails/${id}`]: null,
  [`drawings/${id}/status`]: "withdrawn",
  [`drawings/${id}/withdrawnAt`]: timestamp,
  [`drawings/${id}/updatedAt`]: timestamp
});
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
  await seed({ imageFormats: baseDrawing() });
  await assertSucceeds(set(ref(ownerDb, "drawingImages/imageFormats/imageData"), PNG_DATA_URL));
  await assertSucceeds(set(ref(ownerDb, "drawingThumbnails/imageFormats/imageData"), WEBP_DATA_URL));
  const malformedDataUrls = [
    "data:image/jpeg;base64,AAAA",
    "data:image/png;base64,",
    "data:image/png;base64,AAAA suffix",
    "data:image/png;base64,AA AA",
    "data:image/png;base64,AA\nAA",
    "data:image/png;base64,AAAA,",
    "data:image/png;base64,한글",
    "data:image/png;base64,AAA*",
    "data:image/png;base64,AAAA===",
    "data:image/png;base64,A==="
  ];
  for (const [index, value] of malformedDataUrls.entries()) {
    await seed({ [`malformed-${index}`]: baseDrawing() });
    await assertFails(set(ref(ownerDb, `drawingImages/malformed-${index}/imageData`), value));
  }
  for (const mime of ["png", "webp"]) {
    const detailId = `detail-boundary-${mime}`;
    const thumbnailId = `thumbnail-boundary-${mime}`;
    const detailAtLimit = dataUrlForBytes(mime, 1_850_000);
    const thumbnailAtLimit = dataUrlForBytes(mime, 290_000);
    await seed({ [detailId]: baseDrawing() });
    await assertSucceeds(set(ref(ownerDb, `drawingImages/${detailId}/imageData`), detailAtLimit));
    await assertFails(set(ref(ownerDb, `drawingImages/${detailId}/imageData`), dataUrlForBytes(mime, 1_850_001)));
    assert.equal((await get(ref(ownerDb, `drawingImages/${detailId}/imageData`))).val(), detailAtLimit);
    await seed({ [thumbnailId]: baseDrawing() });
    await assertSucceeds(set(ref(ownerDb, `drawingThumbnails/${thumbnailId}/imageData`), thumbnailAtLimit));
    await assertFails(set(ref(ownerDb, `drawingThumbnails/${thumbnailId}/imageData`), dataUrlForBytes(mime, 290_001)));
    assert.equal((await get(ref(ownerDb, `drawingThumbnails/${thumbnailId}/imageData`))).val(), thumbnailAtLimit);
  }
  const finalDetailAtLimit = dataUrlForBytes("png", 1_850_000);
  const finalThumbnailAtLimit = dataUrlForBytes("webp", 290_000);
  await seed({ boundaryFinalization: baseDrawing() }, {
    drawingImages: { boundaryFinalization: { imageData: finalDetailAtLimit } },
    drawingThumbnails: { boundaryFinalization: { imageData: finalThumbnailAtLimit } }
  });
  await assertSucceeds(update(ref(ownerDb), { "drawings/boundaryFinalization/imageReady": true, "userDrawings/owner/boundaryFinalization": true }));
  for (const [id, detailBytes, thumbnailBytes] of [
    ["detailBoundaryFailure", 1_850_001, 290_000],
    ["thumbnailBoundaryFailure", 1_850_000, 290_001]
  ]) {
    const detailData = dataUrlForBytes("png", detailBytes);
    const thumbnailData = dataUrlForBytes("webp", thumbnailBytes);
    await seed({ [id]: baseDrawing() }, {
      drawingImages: { [id]: { imageData: detailData } },
      drawingThumbnails: { [id]: { imageData: thumbnailData } }
    });
    await assertFails(update(ref(ownerDb), { [`drawings/${id}/imageReady`]: true, [`userDrawings/owner/${id}`]: true }));
    assert.equal((await get(drawingRef(ownerDb, id))).val().imageReady, false);
    assert.equal((await get(ref(ownerDb, `userDrawings/owner/${id}`))).exists(), false);
    assert.equal((await get(ref(ownerDb, `drawingImages/${id}/imageData`))).val(), detailData);
    assert.equal((await get(ref(ownerDb, `drawingThumbnails/${id}/imageData`))).val(), thumbnailData);
  }
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
  await seed({ malformedFinalization: baseDrawing() }, {
    drawingImages: { malformedFinalization: { imageData: PNG_DATA_URL } },
    drawingThumbnails: { malformedFinalization: { imageData: "data:image/webp;base64,AAAA suffix" } }
  });
  await assertFails(update(drawingRef(ownerDb, "malformedFinalization"), { imageReady: true }));
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

  const freshProvisional = baseDrawing({ createdAt: now - 600_000 });
  await seed({ freshProvisional });
  await assertFails(update(drawingRef(solverDb, "freshProvisional"), { status: "withdrawn", withdrawnAt: now, updatedAt: now }));
  const staleProvisional = baseDrawing({ createdAt: now - 900_001 });
  await seed({ staleProvisional });
  await assertSucceeds(update(drawingRef(solverDb, "staleProvisional"), { status: "withdrawn", withdrawnAt: now, updatedAt: now }));
  await seed({ staleProvisional }, { drawingImages: { staleProvisional: { imageData: "data:image/webp;base64,AAAA" } }, drawingThumbnails: { staleProvisional: { imageData: "data:image/webp;base64,AAAA" } } });
  await assertSucceeds(update(ref(solverDb), staleCleanupUpdate("staleProvisional")));
  for (const mutation of [{ word: "강아지" }, { category: "다른 분류" }, { answers: ["강아지"] }, { imageBytes: 99 }, { revisionCount: 1 }]) {
    await seed({ staleProvisional });
    await assertFails(update(drawingRef(solverDb, "staleProvisional"), { ...mutation, status: "withdrawn", withdrawnAt: now, updatedAt: now }));
  }
  await seed({ staleProvisional }, { drawingImages: { staleProvisional: { imageData: "data:image/webp;base64,AAAA" } }, drawingThumbnails: { staleProvisional: { imageData: "data:image/webp;base64,AAAA" } } });
  await assertFails(update(ref(solverDb), { ...staleCleanupUpdate("staleProvisional"), "drawings/staleProvisional/imageReady": true }));
  for (const status of ["solved", "expired"]) {
    await seed({ staleProvisional });
    await assertFails(update(drawingRef(solverDb, "staleProvisional"), { status, [`${status}At`]: now, updatedAt: now }));
  }
  await seed({ staleComplete: completeDrawing({ createdAt: now - 900_001 }) });
  await assertFails(update(drawingRef(solverDb, "staleComplete"), { status: "withdrawn", withdrawnAt: now, updatedAt: now }));
  await seed({ staleLegacy: legacyDrawing({ createdAt: now - 900_001 }) });
  await assertFails(update(drawingRef(solverDb, "staleLegacy"), { status: "withdrawn", withdrawnAt: now, updatedAt: now }));

  const unsafeIds = ['bad"id', "bad'id", "bad`id", "bad=id", "bad id", "x".repeat(81)];
  for (const [index, unsafeId] of unsafeIds.entries()) {
    await seed({});
    await assertFails(set(drawingRef(ownerDb, unsafeId), baseDrawing()));
    await assertFails(set(ref(ownerDb, `feedbackOwners/${unsafeId}/owner`), true));
  }
  const unsafeExistingId = 'bad"id';
  await seed({ [unsafeExistingId]: completeDrawing() });
  await assertSucceeds(update(drawingRef(ownerDb, unsafeExistingId), { status: "withdrawn", withdrawnAt: now, updatedAt: now }));
  await seed({ [unsafeExistingId]: completeDrawing({ expiresAt: now - 1 }) });
  await assertSucceeds(update(drawingRef(solverDb, unsafeExistingId), { status: "expired", expiredAt: now, updatedAt: now }));
  await seed({ [unsafeExistingId]: completeDrawing() });
  await assertSucceeds(update(drawingRef(adminDb, unsafeExistingId), { status: "adminDeleted", adminDeletedAt: now, adminDeletedBy: "admin", updatedAt: now }));
  await seed({ [unsafeExistingId]: completeDrawing() });
  await assertFails(update(drawingRef(ownerDb, unsafeExistingId), { updatedAt: now + 1 }));
  await assertFails(update(drawingRef(ownerDb, unsafeExistingId), { revisionCount: 1, updatedAt: now + 1 }));
  await assertFails(set(ref(ownerDb, `drawingImages/${unsafeExistingId}/imageData`), "data:image/webp;base64,AAAA"));
  const unsafeProvisional = baseDrawing({ createdAt: now - 900_001 });
  await seed({ [unsafeExistingId]: unsafeProvisional }, { drawingImages: { [unsafeExistingId]: { imageData: "data:image/webp;base64,AAAA" } }, drawingThumbnails: { [unsafeExistingId]: { imageData: "data:image/webp;base64,AAAA" } } });
  await assertFails(update(drawingRef(ownerDb, unsafeExistingId), { imageReady: true, updatedAt: now }));
  await assertSucceeds(update(ref(solverDb), staleCleanupUpdate(unsafeExistingId)));
  await seed({ [unsafeExistingId]: completeDrawing() });
  await assertFails(set(drawingRef(solverDb, unsafeExistingId), { ...completeDrawing(), status: "solved", solverId: "solver", solverNickname: "맞힌이", solvedAt: now, hintUsed: false, solverReward: 10, drawerReward: 30, updatedAt: now }));
  await seed({ [unsafeExistingId]: completeDrawing({ status: "solved", solverId: "solver", solvedAt: now }) });
  await assertFails(set(ref(solverDb, `drawingLikes/${unsafeExistingId}/solver`), true));
  await assertFails(set(ref(solverDb, `scoreClaims/solver/${unsafeExistingId}`), { score: 10, type: "solver", createdAt: now }));
  await assertFails(set(ref(ownerDb, `userDrawings/owner/${unsafeExistingId}`), true));
  await assertFails(set(ref(solverDb, `userSolved/solver/${unsafeExistingId}`), true));
  await seed({ [unsafeExistingId]: legacyDrawing() }, { drawingImages: { [unsafeExistingId]: { imageData: "data:image/webp;base64,AAAA" } }, drawingThumbnails: { [unsafeExistingId]: { imageData: "data:image/webp;base64,AAAA" } } });
  await assertFails(update(drawingRef(adminDb, unsafeExistingId), { imageData: null, imageReady: true, imageVersion: 1, imageFormat: "webp", imageWidth: 720, imageHeight: 720, imageBytes: 1000, thumbnailBytes: 200 }));

  await seed({ safeOpen: completeDrawing() }, { drawingImages: { safeOpen: { imageData: PNG_DATA_URL } }, drawingThumbnails: { safeOpen: { imageData: WEBP_DATA_URL } } });
  await assertSucceeds(update(ref(ownerDb), editUpdate("safeOpen", 1)));
  assert.equal((await get(drawingRef(ownerDb, "safeOpen"))).val().revisionCount, 1);

  for (const [id, drawing] of [
    ["editSolved", completeDrawing({ status: "solved", solverId: "solver", solverNickname: "맞힌이", solvedAt: now })],
    ["editExpired", completeDrawing({ expiresAt: now - 1 })],
    ["editWithdrawn", completeDrawing({ status: "withdrawn", withdrawnAt: now })]
  ]) {
    await seed({ [id]: drawing }, { drawingImages: { [id]: { imageData: PNG_DATA_URL } }, drawingThumbnails: { [id]: { imageData: WEBP_DATA_URL } } });
    const before = (await get(ref(ownerDb))).val();
    await assertFails(update(ref(ownerDb), editUpdate(id, 1)));
    const after = (await get(ref(ownerDb))).val();
    assert.deepEqual(after.drawings[id], before.drawings[id]);
    assert.deepEqual(after.drawingImages[id], before.drawingImages[id]);
    assert.deepEqual(after.drawingThumbnails[id], before.drawingThumbnails[id]);
  }

  await seed({ concurrentEdit: completeDrawing() }, { drawingImages: { concurrentEdit: { imageData: PNG_DATA_URL } }, drawingThumbnails: { concurrentEdit: { imageData: WEBP_DATA_URL } } });
  const secondOwnerDb = environment.authenticatedContext("owner").database();
  const editResults = await Promise.allSettled([
    update(ref(ownerDb), editUpdate("concurrentEdit", 1)),
    update(ref(secondOwnerDb), editUpdate("concurrentEdit", 1, "w"))
  ]);
  assert.deepEqual(editResults.map(result => result.status).sort(), ["fulfilled", "rejected"]);
  assert.equal((await get(drawingRef(ownerDb, "concurrentEdit"))).val().revisionCount, 1);

  await seed({ atomicLegacy: legacyDrawing() });
  await assertSucceeds(update(ref(ownerDb), { ...editUpdate("atomicLegacy", 1), "drawings/atomicLegacy/imageData": null }));
  const migratedLegacy = (await get(drawingRef(ownerDb, "atomicLegacy"))).val();
  assert.equal(migratedLegacy.imageData, undefined);
  assert.equal(migratedLegacy.revisionCount, 1);
  await seed({ safeSolve: completeDrawing() });
  await assertSucceeds(set(drawingRef(solverDb, "safeSolve"), { ...completeDrawing(), status: "solved", solverId: "solver", solverNickname: "맞힌이", solvedAt: now, hintUsed: false, solverReward: 10, drawerReward: 30, updatedAt: now }));

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
