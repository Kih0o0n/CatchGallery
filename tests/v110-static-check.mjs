import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const rules = JSON.parse(fs.readFileSync(new URL("../database.rules.json", import.meta.url), "utf8")).rules;
const rulesText = fs.readFileSync(new URL("../database.rules.json", import.meta.url), "utf8");

assert.match(app, /const IMAGE_OPTIONS = \{ detailMax: 720, thumbnailMax: 240,[^\n]+webpQuality: 0\.82/);
assert.match(app, /function dataUrlBytes\(/);
assert.match(app, /async function optimizeCanvasImages\(/);
assert.match(app, /data:image\/webp/);
assert.match(app, /drawingImages\/\$\{id\}\/imageData/);
assert.match(app, /drawingThumbnails\/\$\{id\}\/imageData/);
assert.doesNotMatch(app.match(/async function publishDrawing\(\)[\s\S]*?function expireOldDrawings/)[0], /imageData:\s*state\.canvas/);
assert.match(app, /imageReady:\s*false/);
assert.match(app.match(/async function publishDrawing\(\)[\s\S]*?function expireOldDrawings/)[0], /ref\.set\(data\)[\s\S]*drawingImages[\s\S]*drawingThumbnails[\s\S]*drawings\/\$\{id\}\/imageReady`\]: true[\s\S]*userDrawings/, "provisional metadata must become public with the user index only after external image writes");
assert.match(app, /IntersectionObserver/);
assert.match(app, /maxConcurrentLoads:\s*3/);
assert.match(app, /thumbnailCache:\s*new LimitedLruCache\(CACHE_LIMITS\.thumbnails\)/);
assert.match(app, /detailImageCache:\s*new LimitedLruCache\(CACHE_LIMITS\.details\)/);
assert.match(app, /likeCache:\s*new LimitedLruCache\(CACHE_LIMITS\.likes\)/);
assert.doesNotMatch(app.match(/async function loadGalleryDrawings[\s\S]*?async function renderGallery/)[0], /db\.ref\("drawingLikes"\)/);
assert.match(app, /data-open-migration/);
assert.match(app, /migrationBatch:\s*2/);
assert.match(app, /drawingImages\/\$\{drawing\.id\}\/imageData/);
assert.match(styles, /gallery-image-slot[^}]+aspect-ratio:\s*1/);
assert.ok(rules.drawingImages);
assert.ok(rules.drawingThumbnails);
assert.match(rules.drawingImages.$drawingId[".write"], /drawerId/);
assert.match(rules.drawingImages.$drawingId[".write"], /admins/);
assert.match(rules.drawingThumbnails.$drawingId[".write"], /drawerId/);
assert.equal(rules.drawingImages.$drawingId[".read"], "auth != null && root.child('drawings').child($drawingId).exists()");
assert.equal(rulesText.split("data:image\\\\/(png|webp);base64,").length - 1, 4, "image write and publish-transition Rules regexes must preserve the escaped slash for the Rules parser");
for (const imageRules of [rules.drawingImages, rules.drawingThumbnails]) {
  const validation = imageRules.$drawingId.imageData[".validate"];
  assert.match(validation, /newData\.isString\(\) && newData\.val\(\)\.length <= (2466691|386691)/);
  const regexes = [...validation.matchAll(/matches\(\/\^([^/]*)\/\)/g)];
  assert.doesNotThrow(() => new RegExp(regexes.at(-1)[1]));
}
assert.doesNotMatch(JSON.stringify(rules), /"\.read":true|"\.write":true/);

console.log("v1.1.0 static checks passed.");
