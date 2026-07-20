import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const rules = JSON.parse(fs.readFileSync(new URL("../database.rules.json", import.meta.url), "utf8")).rules;
const dataUrlBytesSource = app.match(/function dataUrlBytes[\s\S]*?(?=function validateOptimizedImages)/)?.[0];
const validateSource = app.match(/function validateOptimizedImages[\s\S]*?(?=function scaledCanvas)/)?.[0];
assert.ok(dataUrlBytesSource && validateSource);

const IMAGE_OPTIONS = { detailChars: 2_500_000, thumbnailChars: 400_000, imageBytes: 1_850_000, thumbnailBytes: 290_000 };
const IMAGE_TOO_LARGE_MESSAGE = "그림 데이터가 너무 커서 저장할 수 없어요. 그림을 조금 단순하게 만든 뒤 다시 시도해 주세요.";
const validate = Function("IMAGE_OPTIONS", "IMAGE_TOO_LARGE_MESSAGE", `${dataUrlBytesSource}\n${validateSource}\nreturn validateOptimizedImages;`)(IMAGE_OPTIONS, IMAGE_TOO_LARGE_MESSAGE);
const dataUrlForBytes = (mime, bytes) => `data:image/${mime};base64,${Buffer.alloc(bytes).toString("base64")}`;
const urlForBytes = bytes => dataUrlForBytes("png", bytes);
const valid = { imageData: urlForBytes(1_850_000), thumbnailData: urlForBytes(290_000) };
assert.equal(validate(valid).imageBytes, 1_850_000, "detail byte limit must be accepted");
assert.equal(validate(valid).thumbnailBytes, 290_000, "thumbnail byte limit must be accepted");
assert.throws(() => validate({ ...valid, imageData: urlForBytes(1_850_001) }), /그림 데이터가 너무 커서/);
assert.throws(() => validate({ ...valid, thumbnailData: urlForBytes(290_001) }), /그림 데이터가 너무 커서/);

const savedBytes = [IMAGE_OPTIONS.imageBytes, IMAGE_OPTIONS.thumbnailBytes];
IMAGE_OPTIONS.imageBytes = IMAGE_OPTIONS.thumbnailBytes = Number.MAX_SAFE_INTEGER;
assert.doesNotThrow(() => validate({ imageData: `data:image/png;base64,${"A".repeat(2_500_000 - 22)}`, thumbnailData: "data:image/png;base64,AAAA" }));
assert.throws(() => validate({ imageData: `data:image/png;base64,${"A".repeat(2_500_000 - 21)}`, thumbnailData: "data:image/png;base64,AAAA" }), /그림 데이터가 너무 커서/);
assert.doesNotThrow(() => validate({ imageData: "data:image/png;base64,AAAA", thumbnailData: `data:image/png;base64,${"A".repeat(400_000 - 22)}` }));
assert.throws(() => validate({ imageData: "data:image/png;base64,AAAA", thumbnailData: `data:image/png;base64,${"A".repeat(400_000 - 21)}` }), /그림 데이터가 너무 커서/);
[IMAGE_OPTIONS.imageBytes, IMAGE_OPTIONS.thumbnailBytes] = savedBytes;

const publishSource = app.match(/async function publishDrawing[\s\S]*?(?=function expireOldDrawings)/)?.[0];
let writes = 0;
const db = { ref: () => ({ push: () => ({ key: "id", set: async () => { writes++; }, update: async () => { writes++; } }), update: async () => { writes++; } }) };
const state = { word: { category: "동물", word: "고양이", answers: ["고양이"], isCustomWord: false }, canvas: {}, user: { id: "u", nickname: "n" } };
const publish = Function("isValidCategory", "state", "serverNow", "db", "validateOptimizedImages", "optimizeCanvasImages", "IMAGE_OPTIONS", "console", `${publishSource}; return publishDrawing;`)(() => true, state, () => 1, db, validate, async () => ({ ...valid, imageData: urlForBytes(1_850_001) }), { version: 1 }, console);
await assert.rejects(publish(), /그림 데이터가 너무 커서/);
assert.equal(writes, 0, "oversized images must be rejected before any Firebase write");

const detailValidation = rules.drawingImages.$drawingId.imageData[".validate"];
const thumbnailValidation = rules.drawingThumbnails.$drawingId.imageData[".validate"];
const finalizationValidation = rules.drawings.$id[".validate"];
const boundaryClause = (valueExpression, mime, maximum) => `${valueExpression}.matches(/^data:image\\/${mime};base64,/) && (${valueExpression}.length < ${maximum} || (${valueExpression}.length === ${maximum} && ${valueExpression}.matches(/=$/)))`;
const boundaryAllows = (dataUrl, maximum) => dataUrl.length < maximum || (dataUrl.length === maximum && dataUrl.endsWith("="));
const boundaryCases = [
  { kind: "detail", bytes: 1_850_000, validation: detailValidation, limits: { png: 2_466_690, webp: 2_466_691 } },
  { kind: "thumbnail", bytes: 290_000, validation: thumbnailValidation, limits: { png: 386_690, webp: 386_691 } }
];
for (const { kind, bytes, validation, limits } of boundaryCases) {
  for (const mime of ["png", "webp"]) {
    const atLimit = dataUrlForBytes(mime, bytes);
    const overLimit = dataUrlForBytes(mime, bytes + 1);
    assert.equal(atLimit.length, limits[mime], `${kind} ${mime} exact byte limit must use the documented total length`);
    assert.equal(overLimit.length, limits[mime], `${kind} ${mime} limit+1 must share the same base64 length`);
    assert.ok(atLimit.endsWith("=") && !overLimit.endsWith("="), `${kind} ${mime} boundary must be distinguished by padding`);
    assert.equal(boundaryAllows(atLimit, limits[mime]), true);
    assert.equal(boundaryAllows(overLimit, limits[mime]), false);
    assert.ok(validation.includes(boundaryClause("newData.val()", mime, limits[mime])), `${kind} ${mime} Rules boundary clause is missing`);
  }
}
for (const [path, limits] of [
  ["drawingImages", { png: 2_466_690, webp: 2_466_691 }],
  ["drawingThumbnails", { png: 386_690, webp: 386_691 }]
]) {
  const valueExpression = `root.child('${path}').child($id).child('imageData').val()`;
  for (const mime of ["png", "webp"]) assert.ok(finalizationValidation.includes(boundaryClause(valueExpression, mime, limits[mime])), `finalization ${path} ${mime} boundary clause is missing`);
}
for (const validation of [detailValidation, thumbnailValidation]) {
  assert.match(validation, /\^data:image\\\/\(png\|webp\);base64,/);
  assert.match(validation, /\{2\}==/);
  assert.match(validation, /\{3\}=/);
  assert.match(validation, /\$\//, "Rules data URL validation must be anchored at the end");
}
const rulePatternStart = detailValidation.lastIndexOf(".matches(/") + ".matches(/".length;
const rulePatternEnd = detailValidation.indexOf("$/)", rulePatternStart);
const rulePatternSource = detailValidation.slice(rulePatternStart, rulePatternEnd + 1);
assert.ok(rulePatternStart >= ".matches(/".length && rulePatternEnd > rulePatternStart);
const rulePattern = new RegExp(rulePatternSource);
for (const accepted of ["data:image/png;base64,AAAA", "data:image/webp;base64,UklGRg==", "data:image/png;base64,iVBORw0KGgo="]) assert.match(accepted, rulePattern);
for (const rejected of [
  "data:image/jpeg;base64,AAAA", "data:image/png;base64,", "data:image/png;base64,AAAA suffix",
  "data:image/png;base64,AA AA", "data:image/png;base64,AA\nAA", "data:image/png;base64,AAAA,",
  "data:image/png;base64,한글", "data:image/png;base64,AAA*", "data:image/png;base64,AAAA===", "data:image/png;base64,A==="
]) assert.doesNotMatch(rejected, rulePattern);
assert.equal((rules.drawings.$id[".validate"].match(/\^data:image\\\/\(png\|webp\);base64,/g) || []).length, 2);
assert.match(rules.drawings.$id.imageBytes[".validate"], /<= 1850000/);
assert.match(rules.drawings.$id.thumbnailBytes[".validate"], /<= 290000/);
assert.match(rules.drawings.$id[".validate"], /!newData\.hasChild\('imageData'\)/);
assert.match(rules.drawings.$id.imageData[".validate"], /newData\.val\(\) === data\.val\(\)/);
assert.match(rules.drawings.$id.imageData[".validate"], /!newData\.exists\(\).*imageReady/);
assert.doesNotMatch(rules.drawings.$id.imageData[".validate"], /!data\.exists\(\)/);
assert.match(app, /optimizeDataUrl[\s\S]*validateOptimizedImages/);

console.log("Image security limit checks passed.");
