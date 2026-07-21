import assert from "node:assert/strict";
import fs from "node:fs";

const rootUrl = new URL("../", import.meta.url);
const read = relativePath => fs.readFileSync(new URL(relativePath, rootUrl), "utf8");
const app = read("app.js");
const index = read("index.html");
const readme = read("README.md");
const securityCheck = read("tests/security-static-check.mjs");

assert.match(app, /home-version[^\n]+>v1\.4\.0<\/div>/, "home must display v1.4.0");
assert.equal((app.match(/class="home-version"/g) || []).length, 1, "app must keep one current-version display location");
assert.match(securityCheck, /home-version[^\n]+v1\\\.4\\\.0/, "security check must expect v1.4.0");

const currentSection = readme.indexOf("## v1.4.0 그림판 색상과 반짝이 색연필");
const previousSection = readme.indexOf("## v1.3.0 기기 호환성과 안정성 강화");
assert.ok(currentSection >= 0 && previousSection > currentSection, "README must list v1.4.0 before retained v1.3.0 history");
for (const note of [
  "그림판 색상이 16색으로 새롭게 바뀌었어요.",
  "연분홍, 연주황, 연두, 연보라 색상이 추가됐어요.",
  "반짝이는 금색과 은색 색연필이 추가됐어요.",
  "금색과 은색도 끊김 없이 부드럽게 그려져요.",
  "스마트폰과 태블릿에서도 색상을 편하게 고를 수 있도록 배치를 다듬었어요."
]) assert.match(readme, new RegExp(note.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `README must include: ${note}`);

const colorsSource = app.match(/const DRAWING_COLORS = (\[[\s\S]*?\]);\r?\nconst DEFAULT_DRAWING_COLOR_INDEX/)?.[1];
assert.ok(colorsSource, "drawing palette must be readable");
const colors = Function(`return (${colorsSource})`)();
assert.deepEqual(colors.map(([, name]) => name), ["빨강", "분홍", "연분홍", "주황", "연주황", "노랑", "연두", "초록", "하늘", "파랑", "연보라", "보라", "검정", "갈색", "금색", "은색"]);
assert.deepEqual(colors.slice(-2).map(([, name, brush]) => [name, brush]), [["금색", "glitter-gold"], ["은색", "glitter-silver"]]);
assert.match(app, /const METALLIC_BRUSHES = \{[\s\S]*"glitter-gold"[\s\S]*"glitter-silver"/);

const additionsScript = index.indexOf('<script src="word-additions-v130.js"></script>');
const appScript = index.indexOf('<script src="app.js"></script>');
assert.ok(additionsScript >= 0 && appScript > additionsScript, "v1.3.0 word additions must remain loaded before app.js");
assert.ok(fs.existsSync(new URL("RELEASE_NOTES_v1.3.0.md", rootUrl)), "v1.3.0 release notes must remain historical documentation");

console.log("v1.4.0 release checks passed: current version, README notes, 16-color metallic palette, and v1.3.0 history.");
