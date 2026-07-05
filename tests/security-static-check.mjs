import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const rulesText = fs.readFileSync(new URL("../database.rules.json", import.meta.url), "utf8");
const rules = JSON.parse(rulesText).rules;

const count = pattern => [...app.matchAll(pattern)].length;

assert.equal(count(/^async function submitAnswer/gm), 1, "submitAnswer must have one definition");
assert.equal(count(/^async function toggleLike/gm), 1, "toggleLike must have one definition");
assert.equal(count(/^async function toggleFeedbackReaction/gm), 1, "toggleFeedbackReaction must have one definition");
assert.doesNotMatch(app, /applyLocally/, "compat transactions must use transaction(updateFn, null, false)");
assert.equal(count(/,null,false\)/g), 5, "five compat transactions must disable local events with the third argument");
assert.match(app, /slice\(0,30\)/, "ranking must remain limited to 30 users");
assert.doesNotMatch(app, /예: 기훈/);
assert.match(app, /평소 쓰는 비밀번호를 사용하지 마세요\./);
assert.match(app, /minlength="6"/);
assert.doesNotMatch(app, /다음 제시어/);
assert.match(app, /다른 제시어/);
assert.match(app, /WORDS\.length>1\s*&&\s*state\.word\?\.\[0\]===next\[0\]/, "word reroll must exclude the current word");
assert.match(app, /nickname\.toLowerCase\(\)==="admin"/, "admin must be excluded from rankings");
assert.match(app, /rankingType:"total"/);
assert.match(app, /type:"solver"/);
assert.match(app, /type:"drawer"/);
assert.doesNotMatch(app, /그린 사람: \$\{escapeHtml\(drawerName\(d\)\)\}<\/span><\/div>\$\{mine/, "open cards must hide drawer nickname");
assert.match(app, /\["touchstart","touchmove"\]/);
assert.match(styles, /canvas[^}]*touch-action:\s*none/s);
assert.match(app, /\["눈사람","겨울"\]/);
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
