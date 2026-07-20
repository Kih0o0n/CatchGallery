import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import { catalogKey, normalizeAnswer, validateDocument } from "../scripts/generate-word-additions.mjs";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const document = JSON.parse(fs.readFileSync(new URL("../data/word-additions-v130.json", import.meta.url), "utf8"));
const generated = fs.readFileSync(new URL("../word-additions-v130.js", import.meta.url), "utf8");
const context = { window: {} };
vm.runInNewContext(generated, context);
const additions = JSON.parse(JSON.stringify(context.window.CATCH_GALLERY_V130_WORD_ADDITIONS));
assert.deepEqual(additions, document.entries, "generated JS must exactly preserve approved JSON entry order and values");
assert.deepEqual(validateDocument(document), document.entries);

const baseExpression = app.match(/const BASE_WORDS = ([\s\S]*?);\r?\nconst WORD_ADDITIONS_V130/)?.[1];
assert.ok(baseExpression, "BASE_WORDS expression must be readable");
const baseWords = Function(`return (${baseExpression})`)();
const finalWords = [...baseWords, ...additions].filter((entry, index, list) => list.findIndex(candidate => catalogKey(candidate) === catalogKey(entry)) === index);
assert.equal(baseWords.length, 403, "existing category+word catalog count");
assert.equal(additions.length, 596, "approved addition count");
assert.equal(finalWords.length, 999, "final category+word catalog count");
assert.deepEqual(finalWords.slice(403), additions, "all additions must remain appended in approved order");
assert.equal(new Set(finalWords.map(catalogKey)).size, finalWords.length, "category+word keys must be unique");
assert.equal(new Set(additions.map(catalogKey)).size, additions.length, "new category+word keys must be unique");
assert.ok(additions.every(entry => entry.answers.some(answer => normalizeAnswer(answer) === normalizeAnswer(entry.word))));
assert.ok(additions.every(entry => new Set(entry.answers.map(normalizeAnswer)).size === entry.answers.length));

const expectedCounts = { "유명인": 86, "게임": 101, "게임 캐릭터": 127, "만화 / 애니 캐릭터": 143, "유명 캐릭터 / 마스코트": 97, "스타크래프트 1 유닛": 42 };
assert.deepEqual(Object.fromEntries(Object.keys(expectedCounts).map(category => [category, additions.filter(entry => entry.category === category).length])), expectedCounts);
for (const [category, word] of [["자연 / 날씨", "눈"], ["몸 / 옷 / 장신구", "눈"], ["몸 / 옷 / 장신구", "원피스"], ["애니메이션", "원피스"], ["전자기기 / 기계", "드론"], ["스타크래프트 1 유닛", "드론"]]) {
  assert.equal(finalWords.filter(entry => entry.category === category && entry.word === word).length, 1, `${category} — ${word} must be preserved`);
}
const starcraft = word => additions.find(entry => entry.category === "스타크래프트 1 유닛" && entry.word === word);
assert.deepEqual(starcraft("라바").answers, ["라바", "애벌레"]);
assert.deepEqual(starcraft("드론").answers, ["드론"]);
for (const [word, answers] of [["파이어뱃", ["파이어뱃", "파이어벳", "화염방사병"]], ["히드라리스크", ["히드라리스크", "히드라"]], ["울트라리스크", ["울트라리스크", "울트라"]], ["뮤탈리스크", ["뮤탈리스크", "뮤탈"]]]) assert.deepEqual(starcraft(word).answers, answers);
for (const word of ["케리건", "짐 레이너", "제라툴", "아르타니스", "태사다르", "노바 테라"]) assert.equal(starcraft(word), undefined);

assert.doesNotMatch(app, /findIndex\(candidate => candidate\.word === entry\.word\)/);
assert.match(app, /candidate\.category === entry\.category && candidate\.word === entry\.word/);
assert.match(app, /function wordKey\(entry\) \{ return `\$\{entry\.category\}\\u0000\$\{entry\.word\}`; \}/);
assert.match(app, /WORDS\.filter\(entry => !state\.seenWordKeys\.has\(wordKey\(entry\)\)\)/);
const additionsScript = index.indexOf('<script src="word-additions-v130.js"></script>');
const appScript = index.indexOf('<script src="app.js"></script>');
assert.ok(additionsScript >= 0 && appScript > additionsScript, "generated additions must load before app.js");

console.log("Word catalog checks passed: 403 existing + 596 new = 999 total.");
