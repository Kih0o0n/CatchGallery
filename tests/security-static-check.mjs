import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const rulesText = fs.readFileSync(new URL("../database.rules.json", import.meta.url), "utf8");
const rules = JSON.parse(rulesText).rules;

assert.doesNotMatch(rulesText, /\.numChildren\s*\(/, "Realtime Database Rules must not use unsupported numChildren()");
const supportedRuleMethods = new Set(["child", "exists", "hasChild", "hasChildren", "isBoolean", "isNumber", "isString", "matches", "parent", "val"]);
for (const match of rulesText.matchAll(/\.([A-Za-z][A-Za-z0-9_]*)\(/g)) {
  assert.ok(supportedRuleMethods.has(match[1]), `unsupported Realtime Database Rules method: ${match[1]}()`);
}

const count = pattern => [...app.matchAll(pattern)].length;

assert.equal(count(/^async function submitAnswer/gm), 1, "submitAnswer must have one definition");
assert.equal(count(/^async function toggleLike/gm), 1, "toggleLike must have one definition");
assert.equal(count(/^async function toggleFeedbackReaction/gm), 1, "toggleFeedbackReaction must have one definition");
assert.doesNotMatch(app, /applyLocally/, "compat transactions must use transaction(updateFn, null, false)");
assert.equal(count(/,\s*null,\s*false\)/g), 5, "five compat transactions must disable local events with the third argument");
assert.match(app, /successCount >= 10 \? 0 : successCount >= 5 \? 5 : 10/, "solver rewards must use 10, 5, 0 tiers");
assert.match(app, /claim\.type === "solver"[^\n]+now - 3600000/, "recent solver successes must use a rolling hour");
assert.match(app, /const drawerReward = 30/, "drawer solve reward must be 30");
assert.match(app, /function isOwnDrawing\(d\)/, "drawing ownership checks must be shared");
assert.match(app, /name === "gallery" && state\.route !== "gallery"[\s\S]{0,120}state\.galleryView = "thumb"/, "gallery entry must reset to thumbnail view");
assert.match(app, /data-view="thumb"[\s\S]{0,250}data-view="frame"/, "thumbnail view control must precede frame view control");
assert.match(styles, /\.gallery-screen \.frame-image[^}]+height:\s*min\(42dvh, 420px\)/, "gallery frame image must fit mobile height");
assert.match(app, /slice\(0,\s*30\)/, "ranking must remain limited to 30 users");
assert.doesNotMatch(app, /예: 기훈/);
assert.match(app, /평소 쓰는 비밀번호를 사용하지 마세요\./);
assert.match(app, /minlength="6"/);
assert.doesNotMatch(app, /다음 제시어/);
assert.match(app, /다른 제시어/);
assert.match(app, /WORDS\.length\s*>\s*1\s*&&\s*state\.word\?\.word\s*===\s*next\.word/, "word reroll must exclude the current word");
assert.match(app, /nickname\.toLowerCase\(\)\s*===\s*"admin"/, "admin must be excluded from rankings");
assert.match(app, /rankingType:\s*"total"/);
assert.match(app, /type:\s*"solver"/);
assert.match(app, /type:\s*"drawer"/);
assert.doesNotMatch(app, /그린 사람: \$\{escapeHtml\(drawerName\(d\)\)\}<\/span><\/div>\$\{mine/, "open cards must hide drawer nickname");
assert.match(app, /addEventListener\("touchstart"/);
assert.match(app, /addEventListener\("touchmove"/);
assert.match(styles, /canvas[^}]*touch-action:\s*none/s);
assert.match(app, /category:\s*"운동과 놀이",\s*word:\s*"종이비행기",\s*answers:\s*\["종이비행기"\]/);
assert.doesNotMatch(app, /로켓|우유급식|줄서기|숙제|알림장|생일케이크|학교와 생활|감정과 상태|상상과 캐릭터 느낌/);
assert.doesNotMatch(app, /users\/\$\{[^}]+\}\/score`\)\.transaction/, "client must not increment users score");
assert.doesNotMatch(app, /drawings\/\$\{[^}]+\}\/likeCount`\)\.transaction/, "client must not write drawing likeCount");
assert.doesNotMatch(app, /feedbackMeta\/\$\{[^}]+\}`\)\.transaction/, "client must not write feedback counters");

assert.equal(rules[".read"], false);
assert.equal(rules[".write"], false);
assert.equal(rules.admins.$uid[".write"], false, "admin membership must be console-managed");
assert.match(rules.users.$uid[".write"], /auth\.uid === \$uid/);
assert.match(rules.users.$uid[".write"], /newData\.child\('score'\)\.val\(\) === 0/);
assert.equal(rules.users.$uid.score[".write"], undefined, "score must not have a direct write grant");
assert.match(rules.drawings.$id[".write"], /drawerId/);
assert.match(rules.drawings.$id[".write"], /solverId/);
assert.match(rules.drawings.$id[".write"], /expiresAt/);
assert.match(rules.feedbackContent.$feedbackId[".read"], /isSecret/);
assert.match(rules.feedbackContent.$feedbackId[".read"], /feedbackOwners/);
assert.match(rules.feedbackContent.$feedbackId[".read"], /admins/);
assert.match(rules.feedbackReactions.$feedbackId.$uid[".write"], /feedbackOwners/);
assert.match(rules.scoreClaims.$uid.$drawingId[".write"], /solverReward/);
assert.match(rules.scoreClaims.$uid.$drawingId[".write"], /drawerReward/);
assert.match(rules.drawings.$id[".write"], /drawerReward'\)\.val\(\) === 30/);
assert.match(rules.drawings.$id[".write"], /solverReward'\)\.val\(\) === 0/);
assert.match(rules.scoreClaims.$uid.$drawingId.score[".validate"], /<= 30/);
assert.match(rules.scoreClaims.$uid.$drawingId[".write"], /child\('type'\)/);

const visit = value => {
  if (typeof value === "string") {
    let depth = 0;
    for (const character of value) {
      if (character === "(") depth += 1;
      if (character === ")") depth -= 1;
      assert.ok(depth >= 0, `unbalanced rule expression: ${value}`);
    }
    assert.equal(depth, 0, `unbalanced rule expression: ${value}`);
  } else if (value && typeof value === "object") Object.values(value).forEach(visit);
};
visit(rules);

console.log("Security static checks passed.");
