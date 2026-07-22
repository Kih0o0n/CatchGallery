import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = path => readFileSync(new URL(path, root), "utf8");
const app = read("app.js");
const styles = read("styles.css");
const readme = read("README.md");

assert.match(app, /home-version[^\n]+>v1\.5\.0<\/div>/);
assert.equal((app.match(/class="home-version"/g) || []).length, 1);
assert.doesNotMatch(app.match(/class="home-version"[^\n]+/)?.[0] || "", /v1\.4\.0/);

const current = readme.indexOf("## v1.5.0 사용성 개선");
const historical = readme.indexOf("## v1.4.0 그림판 색상과 반짝이 색연필");
assert.ok(current >= 0 && historical > current, "README must lead with v1.5.0 and retain v1.4.0 history");
const currentLines = readme.slice(current, historical).split(/\r?\n/);
const noteTitle = "[캐치갤러리 v1.5.0 패치 노트🎉]";
const notes = [
  "- 그림판 굵기 조절 바가 브라우저와 관계없이 같은 모습으로 보여요.",
  "- 굵기를 조절할 때 현재 굵기 숫자와 기본 굵기를 확인할 수 있어요.",
  "- 전시장에서 작가별 작품을 모아볼 수 있어요.",
  "- 정답을 맞힌 직후 결과 화면에서 바로 좋아요를 누를 수 있어요."
];
assert.equal(currentLines.filter(line => line === noteTitle).length, 1, "exact release-note title must occur once in the current section");
assert.deepEqual(currentLines.filter(line => line.startsWith("- ")), notes, "current release-note bullets must match exactly and remain ordered");
for (const note of notes) assert.equal(currentLines.filter(line => line === note).length, 1, `exact current-section release note required once: ${note}`);

assert.match(app, /id="brushSize" type="range" min="3" max="34" value="9"/);
assert.match(app, />9\(기본\)<\/output>/);
assert.match(styles, /::-webkit-slider-runnable-track/);
assert.match(styles, /::-webkit-slider-thumb/);
assert.match(styles, /::-moz-range-track/);
assert.match(styles, /::-moz-range-progress/);
assert.match(styles, /::-moz-range-thumb/);

assert.match(app, /function galleryArtistIdentity\(drawing\)/);
assert.match(app, /function galleryArtistButton\(drawing, compact = false\)/);
assert.match(app, /artist-button-name[^\n]+isOwnDrawing\(drawing\)/);
assert.match(app, /작품 보기 〉/);
assert.match(app, /\["solved", "expired"\]/);
assert.match(app, /function drawingOwnerId\(d\)/);
assert.match(app, /d\?\.drawerId \|\| d\?\.drawerUid[\s\S]*d\?\.userId/);
assert.match(app, /function galleryHistoryState\(detail/);

assert.match(app, /function showAnswerSuccessModal\(result\)/);
assert.match(app, /data-answer-success-like/);
assert.match(app, /result\.drawingId/);
assert.match(app, /result\.likeDrawing/);
assert.match(app, /ensureLikeState\(drawingId\)/);
assert.match(app, /toggleLike\(drawingId, likeDrawing\)/);
assert.match(app, /syncGalleryLike\(drawingId\)/);
assert.match(app, /function beginLikeOperation\(drawingId\)/);
assert.match(app, /pendingLikeOwners\.set\(drawingId, token\)/);
assert.match(app, /function finishLikeOperation\(drawingId, token\)/);

const rules = read("database.rules.json");
assert.equal(createHash("sha256").update(rules).digest("hex"), "4451bba25c1447aa12deaddcdb3dfb1472430d1742daf42430a89f544e875493", "v1.5.0 release must not change Firebase Rules");
const rootFiles = readdirSync(root).map(name => name.toLowerCase());
assert.equal(rootFiles.some(name => name === "manifest.json" || name.endsWith(".webmanifest") || name === "service-worker.js" || name === "sw.js"), false, "v1.5.0 release must not add PWA files");

console.log("v1.5.0 release checks passed: version, exact notes, three features, unchanged Rules, and no PWA files.");
