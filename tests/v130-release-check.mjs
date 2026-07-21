import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const rootUrl = new URL("../", import.meta.url);
const read = relativePath => fs.readFileSync(new URL(relativePath, rootUrl), "utf8");
const app = read("app.js");
const index = read("index.html");
const readme = read("README.md");
const securityCheck = read("tests/security-static-check.mjs");
const releaseNotesUrl = new URL("RELEASE_NOTES_v1.3.0.md", rootUrl);

assert.match(app, /home-version[^\n]+>v1\.3\.0<\/div>/, "home must display v1.3.0");
assert.equal((app.match(/class="home-version"/g) || []).length, 1, "app must have one current-version display location");
assert.match(securityCheck, /home-version[^\n]+v1\\\.3\\\.0/, "security check must expect v1.3.0");

assert.match(readme, /^## v1\.3\.0\b/m, "README must contain a v1.3.0 section");
assert.match(readme, /총 999개|최종 제시어 999개/, "README must state the final 999-word catalog");
assert.equal((readme.match(/v1\.0\.4: 48시간 지난 미해결 그림 표시 문제 수정, 기본 제시어 확장/g) || []).length, 1, "the v1.0.4 history line must appear once");

assert.ok(fs.existsSync(releaseNotesUrl), "public release notes must exist");
const releaseNotes = fs.readFileSync(releaseNotesUrl, "utf8");
assert.match(releaseNotes, /캐치갤러리 v1\.3\.0/);
assert.match(releaseNotes, /제시어를 999개로 확장/);
for (const exaggeration of ["모든 기기에서 완벽하게 작동", "iPad 실기기 검증 완료", "Apple Pencil 실기기 검증 완료", "카카오톡 인앱 브라우저 완전 지원", "보안이 완벽함", "해킹 불가능", "서버 검증으로 부정행위 완전 차단"]) {
  assert.doesNotMatch(`${readme}\n${releaseNotes}`, new RegExp(exaggeration), `release documents must not claim: ${exaggeration}`);
}

const additionsScript = index.indexOf('<script src="word-additions-v130.js"></script>');
const appScript = index.indexOf('<script src="app.js"></script>');
assert.ok(additionsScript >= 0 && appScript > additionsScript, "word additions must load before app.js");

const approved = JSON.parse(read("data/word-additions-v130.json"));
assert.equal(approved.entries.length, 596, "approved additions count");
const generatedContext = { window: {} };
vm.runInNewContext(read("word-additions-v130.js"), generatedContext);
const additions = generatedContext.window.CATCH_GALLERY_V130_WORD_ADDITIONS;
assert.equal(additions.length, 596, "generated additions count");
const baseExpression = app.match(/const BASE_WORDS = ([\s\S]*?);\r?\nconst WORD_ADDITIONS_V130/)?.[1];
assert.ok(baseExpression, "BASE_WORDS expression must be readable");
const baseWords = Function(`return (${baseExpression})`)();
const key = entry => `${entry.category}\u0000${entry.word}`;
const finalWords = [...baseWords, ...additions].filter((entry, position, list) => list.findIndex(candidate => key(candidate) === key(entry)) === position);
assert.equal(baseWords.length, 403, "existing catalog count");
assert.equal(finalWords.length, 999, "final catalog count");

for (const pwaFile of ["manifest.json", "manifest.webmanifest", "service-worker.js", "serviceworker.js", "sw.js"]) {
  assert.equal(fs.existsSync(new URL(pwaFile, rootUrl)), false, `${pwaFile} must not be introduced`);
}
assert.doesNotMatch(index, /rel=["']manifest["']|serviceWorker\.register/i, "index must not introduce PWA registration");

console.log("v1.3.0 release checks passed: version, documents, load order, and 403 + 596 = 999 catalog.");
