import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const rules = JSON.parse(fs.readFileSync(new URL("../database.rules.json", import.meta.url), "utf8")).rules;
const baseExpression = app.match(/const BASE_WORDS = ([\s\S]*?);\r?\nconst WORD_ADDITIONS_V130/)?.[1];
assert.ok(baseExpression, "BASE_WORDS expression must be readable");
const generated = fs.readFileSync(new URL("../word-additions-v130.js", import.meta.url), "utf8");
const context = { window: {} };
vm.runInNewContext(generated, context);
const words = [...Function(`return (${baseExpression})`)(), ...context.window.CATCH_GALLERY_V130_WORD_ADDITIONS];
const movieWords = words.filter(entry => entry.category === "영화");
const animationWords = words.filter(entry => entry.category === "애니메이션");
const keys = words.map(entry => `${entry.category}\u0000${entry.word}`);

assert.equal(movieWords.length, 30, "movie prompt count");
assert.equal(animationWords.length, 29, "animation prompt count");
assert.equal(new Set(keys).size, keys.length, "category and representative answer pairs must be unique");
assert.ok(words.every(entry => Array.from(entry.category).length >= 1 && Array.from(entry.category).length <= 20), "all categories must fit the shared limit");
assert.ok(words.every(entry => Array.from(entry.word).length >= 1 && Array.from(entry.word).length <= 12), "all representative answers must fit drawing rules");
assert.ok(words.every(entry => entry.answers.every(answer => Array.from(answer).length >= 1 && Array.from(answer).length <= 12)), "all accepted answers must fit drawing rules");
assert.ok(words.some(entry => entry.category === "몸 / 옷 / 장신구"));
assert.ok(words.some(entry => entry.category === "전자기기 / 기계"));
assert.ok(words.some(entry => entry.category === "영화"));
assert.ok(words.some(entry => entry.category === "애니메이션"));
assert.match(rules.drawings.$id.category[".validate"], /length > 0/);
assert.match(rules.drawings.$id.category[".validate"], /length <= 20/);

console.log(`v1.0.7 checks passed: 영화 ${movieWords.length}개, 애니메이션 ${animationWords.length}개`);
