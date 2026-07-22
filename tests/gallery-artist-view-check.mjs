import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
function pick(name) {
  const start = app.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  let depth = 0, opened = false;
  for (let index = start; index < app.length; index++) {
    if (app[index] === "{") { depth++; opened = true; }
    else if (app[index] === "}" && opened && --depth === 0) return app.slice(start, index + 1);
  }
  throw new Error(`could not extract ${name}`);
}

const helperNames = ["normalizedArtistName", "hasViewableArtist", "galleryArtistIdentity", "isDrawingByArtist", "galleryDisplayTime", "sortGalleryDrawings"];
const state = { gallerySort: "new" };
const drawerName = drawing => drawing.drawerNickname || drawing.drawerDisplayName || "알 수 없음";
const drawingOwnerId = drawing => drawing?.drawerId || drawing?.drawerUid || drawing?.ownerUid || drawing?.authorUid || drawing?.userId || null;
const isSafeRecordId = value => typeof value === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(value);
const helpers = Function("state", "drawerName", "drawingOwnerId", "isSafeRecordId", `"use strict"; ${helperNames.map(pick).join("\n")}; return { ${helperNames.join(",")} };`)(state, drawerName, drawingOwnerId, isSafeRecordId);

const selected = { id: "selected", status: "solved", drawerId: "uid-a", drawerNickname: "쿠피", solvedAt: 50, imageReady: true };
const artist = helpers.galleryArtistIdentity(selected);
assert.deepEqual(artist, { drawingId: "selected", ownerId: "uid-a", name: "쿠피" });
for (const [name, drawing, expected] of [
  ["same UID and name", { drawerId: "uid-a", drawerNickname: "쿠피" }, true],
  ["same UID changed name", { drawerId: "uid-a", drawerNickname: "새이름" }, true],
  ["legacy same name", { drawerNickname: "쿠피" }, true],
  ["different UID same name", { drawerId: "uid-b", drawerNickname: "쿠피" }, false],
  ["different UID different name", { drawerId: "uid-b", drawerNickname: "다른이" }, false]
]) assert.equal(helpers.isDrawingByArtist(drawing, artist), expected, name);
assert.equal(helpers.isDrawingByArtist({ drawerNickname: "쿠피" }, { drawingId: "legacy", ownerId: null, name: "쿠피" }), true);
assert.equal(helpers.isDrawingByArtist({ drawerNickname: "쿠피" }, { drawingId: "legacy", ownerId: null, name: "쿠피" }), true, "NFC names match");
assert.equal(helpers.galleryArtistIdentity({ id: "unknown", drawerNickname: "알 수 없음" }), null);
assert.equal(helpers.galleryArtistIdentity({ id: "unsafe/id", drawerNickname: "쿠피" }), null);

const times = [
  { id: "solved", status: "solved", solvedAt: 30, likeCount: 2 },
  { id: "expired", status: "expired", expiredAt: 20, likeCount: 2 },
  { id: "null-fallback", status: "expired", expiredAt: null, updatedAt: 15, likeCount: 1 },
  { id: "updated", status: "expired", expiredAt: "bad", updatedAt: 10, likeCount: 5 },
  { id: "zero", status: "solved", solvedAt: "bad" }
];
assert.deepEqual(helpers.sortGalleryDrawings(times, "new").map(item => item.id), ["solved", "expired", "null-fallback", "updated", "zero"]);
assert.deepEqual(helpers.sortGalleryDrawings(times, "old").map(item => item.id), ["zero", "updated", "null-fallback", "expired", "solved"]);
assert.deepEqual(helpers.sortGalleryDrawings(times, "popular").map(item => item.id), ["updated", "solved", "expired", "null-fallback", "zero"], "popular ties use newest display time");

{
  const galleryState = { galleryArtistDrawingId: "selected", galleryArtist: null, gallerySort: "new" };
  const solved = [selected, { id: "renamed", status: "solved", drawerId: "uid-a", drawerNickname: "새이름", solvedAt: 40, imageReady: true }, { id: "other", status: "solved", drawerId: "uid-b", drawerNickname: "쿠피", solvedAt: 60, imageReady: true }, { id: "open", status: "open", drawerId: "uid-a", drawerNickname: "쿠피", imageReady: true }];
  const expired = [{ id: "legacy", status: "expired", drawerNickname: "쿠피", expiredAt: 35, imageReady: true }, { id: "withdrawn", status: "withdrawn", drawerId: "uid-a", drawerNickname: "쿠피", imageReady: true }, { id: "provisional", status: "expired", drawerId: "uid-a", drawerNickname: "쿠피", imageReady: false }];
  const source = [...helperNames.map(pick), `async ${pick("loadGalleryArtistDrawings")}`].join("\n");
  const load = Function("state", "drawerName", "drawingOwnerId", "isSafeRecordId", "expireOldDrawings", "loadGalleryMetadata", "hasPublicDrawingImage", "ensureLikeState", `"use strict"; ${source}; return loadGalleryArtistDrawings;`)(
    galleryState, drawerName, drawingOwnerId, isSafeRecordId, async () => {}, async status => status === "solved" ? solved : expired, drawing => drawing.imageReady === true || !!drawing.imageData, async drawingId => ({ count: drawingId.length, liked: false })
  );
  const mixed = await load("new");
  assert.deepEqual(mixed.map(item => item.id), ["selected", "renamed", "legacy"], "solved and expired merge with exclusions");
  assert.deepEqual(new Set(mixed.map(item => item.status)), new Set(["solved", "expired"]));
}

{
  const renderState = { galleryArtistDrawingId: null, user: { id: "mine" }, isAdmin: false };
  const escapeHtml = value => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapeAttribute = value => escapeHtml(value).replace(/"/g, "&quot;");
  const isOwnDrawing = drawing => drawingOwnerId(drawing) === renderState.user.id;
  const source = [...helperNames.slice(0, 4).map(pick), pick("likeAccessibilityLabel"), pick("galleryArtistButton"), pick("galleryThumbs"), pick("galleryFrame")].join("\n");
  const api = Function("state", "drawerName", "drawingOwnerId", "isSafeRecordId", "escapeHtml", "escapeAttribute", "isOwnDrawing", "solverName", `"use strict"; ${source}; return { galleryArtistButton, galleryThumbs, galleryFrame };`)(renderState, drawerName, drawingOwnerId, isSafeRecordId, escapeHtml, escapeAttribute, isOwnDrawing, () => "맞힌이");
  const mine = { ...selected, id: "mine-drawing", drawerId: "mine", drawerNickname: "내닉네임" };
  const unsafeName = { ...selected, id: "safe-drawing", drawerNickname: '<img src=x onerror="bad">' };
  assert.match(api.galleryArtistButton(mine, true), /<button[^>]*data-artist-drawing="mine-drawing"[^>]*>[\s\S]*👤[\s\S]*내[\s\S]*작품 보기/);
  assert.doesNotMatch(api.galleryArtistButton(unsafeName, true), /<img/);
  assert.match(api.galleryThumbs([selected]), /data-thumb="0"[\s\S]*<button class="gallery-artist-button compact-artist-button"/);
  assert.match(api.galleryFrame([selected], 0), /그린 사람:[\s\S]*gallery-artist-button/);
  renderState.galleryArtistDrawingId = "selected";
  assert.doesNotMatch(api.galleryThumbs([selected]), /data-artist-drawing/);
  assert.match(api.galleryThumbs([selected]), /완성 액자/);
}

assert.match(app, /Promise\.all\(\[loadGalleryMetadata\("solved"\), loadGalleryMetadata\("expired"\)\]\)/);
assert.match(pick("loadGalleryArtistDrawings"), /state\.galleryArtistDrawingId !== artistDrawingId/);
assert.doesNotMatch(pick("loadGalleryArtistDrawings"), /db\.ref|users|drawings"\)\.once/);
assert.match(app, /data-artist-drawing="\$\{drawing\.id\}"/);
assert.match(app, /event\.stopPropagation\(\)/);
assert.match(styles, /\.gallery-artist-button\s*\{[^}]*min-height:\s*44px/);
assert.match(styles, /\.gallery-artist-button:focus-visible/);
assert.match(styles, /\.thumbnail-grid\s*\{[^}]*repeat\(3/);

console.log("Gallery artist view static and logic checks passed.");
