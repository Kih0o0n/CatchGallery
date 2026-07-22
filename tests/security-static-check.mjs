import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const rulesText = fs.readFileSync(new URL("../database.rules.json", import.meta.url), "utf8");
const rules = JSON.parse(rulesText).rules;
const transitionSource = app.match(/function transitionRoute[\s\S]*?(?=function route\()/)?.[0];
assert.ok(transitionSource);

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
assert.equal(count(/,\s*null,\s*false\)/g), 6, "compat transactions without completion callbacks must disable local events with the third argument");
assert.match(app, /successCount >= 10 \? 0 : successCount >= 5 \? 5 : 10/, "solver rewards must use 10, 5, 0 tiers");
assert.match(app, /claim\.type === "solver"[^\n]+now - 3600000/, "recent solver successes must use a rolling hour");
assert.match(app, /const drawerReward = 30/, "drawer solve reward must be 30");
assert.match(app, /function isOwnDrawing\(d\)/, "drawing ownership checks must be shared");
assert.match(transitionSource, /if \(name === "gallery"\)[\s\S]*state\.galleryView = detail \? "frame" : "thumb"/, "gallery entry must reset to thumbnails while preserving history detail state");
assert.match(styles, /\.gallery-screen \.frame-image[^}]+height:\s*min\(42dvh, 420px\)/, "gallery frame image must fit mobile height");
assert.match(app, /function showAnswerSuccessModal\(result\)/, "answer success modal must exist");
assert.match(app, /정답입니다 🎉/, "answer success modal must show its title");
assert.match(app, /drawerNickname: drawerName\(d\)/, "answer result must include the drawer name");
assert.match(app, /function expireOldDrawings\([^)]*\)[\s\S]*fallbackDrawing = d/, "expiration must retain a transaction fallback snapshot");
assert.match(app, /status: \"expired\", expiredAt, updatedAt: expiredAt/, "expiration must write expired timestamps");
assert.match(app, /"학교 \/ 문구"|"전자기기 \/ 기계"/, "expanded prompt categories must be present");
assert.match(app, /운전기사: "운전기사,기사,기사님"/, "driver answer aliases must be present");
assert.match(app, /findIndex\(candidate => candidate\.category === entry\.category && candidate\.word === entry\.word\)/, "default words must be deduplicated by category and word");
assert.match(app, /home-version[^\n]+v1\.4\.0/, "home version must show v1.4.0");
assert.match(app, /function adminDeleteDrawing\(drawingId\)/, "admin drawing soft delete must exist");
assert.match(app, /status: "adminDeleted"/, "admin delete must use soft delete status");
assert.match(app, /data-admin-delete/, "admin delete controls must be rendered");
assert.match(rules.drawings.$id[".write"], /adminDeleted/);
assert.match(rules.drawings.$id.status[".validate"], /adminDeleted/);
assert.doesNotMatch(app, /썸네일 보기|액자 보기/);
assert.match(styles, /grid-template-columns:\s*repeat\(3,/);
assert.match(
  app,
  /function galleryHistoryState\(detail[\s\S]*galleryDetail:\s*detail/,
);
assert.match(app, /slice\(0,\s*30\)/, "ranking must remain limited to 30 users");
assert.doesNotMatch(app, /예: 기훈/);
assert.match(app, /평소 쓰는 비밀번호를 사용하지 마세요\./);
assert.match(app, /minlength="6"/);
assert.doesNotMatch(app, /다음 제시어/);
assert.match(app, /다른 제시어/);
assert.match(app, /seenWordKeys:\s*new Set\(\)/, "word selection sessions must track seen prompts in memory");
assert.match(app, /state\.seenWordKeys\.clear\(\)/, "word selection sessions must reset on entry and after exhaustion");
assert.match(app, /WORDS\.filter\(entry => !state\.seenWordKeys\.has\(wordKey\(entry\)\)\)/, "word rerolls must select from unseen prompts");
assert.match(app, /WORDS\.length > 1 && currentKey/, "a new cycle must avoid the immediately previous prompt");
assert.match(app, /maxlength="20"[^>]+id="customCategory"|id="customCategory"[^>]+maxlength="20"/, "custom categories must allow 20 characters");
assert.match(app, /카테고리는 1~20자로 입력하고 특수문자 없이 작성해 주세요/, "custom category validation must explain the safe input rule");
assert.match(app, /function isValidCategory\(value\)[^\n]+<= 20[^\n]+\[<>\"'`=\]/, "new drawing categories must reject attribute-breaking characters");
assert.match(app, /publishDrawing\(\)[\s\S]{0,100}isValidCategory\(state\.word\?\.category\)/, "publishing must validate default and custom categories alike");
assert.match(app, /그림 저장 실패:[^\n]+console|console\.error\("그림 저장 실패:/, "drawing save failures must be logged");
assert.match(rules.drawings.$id.category[".validate"], /length <= 20/, "drawing categories must allow up to 20 characters");
assert.match(app, /"영화": \{ 기생충:/, "movie prompts must be included");
assert.match(app, /"애니메이션": \{ 원피스:/, "animation prompts must be included");
assert.match(app, /nickname\.toLowerCase\(\)\s*===\s*"admin"/, "admin must be excluded from rankings");
assert.match(app, /rankingType:\s*"total"/);
assert.match(app, /type:\s*"solver"/);
assert.match(app, /type:\s*"drawer"/);
assert.doesNotMatch(app, /그린 사람: \$\{escapeHtml\(drawerName\(d\)\)\}<\/span><\/div>\$\{mine/, "open cards must hide drawer nickname");
assert.match(app, /addEventListener\("touchmove"/);
assert.match(app, /addEventListener\("touchstart"/);
assert.match(app, /addEventListener\("pointerdown"/);
assert.match(app, /addEventListener\("pointercancel"/);
assert.match(app, /activePointerId/);
assert.doesNotMatch(app, /state\.canvas\.addEventListener\("touch/);
assert.match(styles, /canvas[^}]*touch-action:\s*none/s);
assert.match(app, /category:\s*"운동과 놀이",\s*word:\s*"종이비행기",\s*answers:\s*\["종이비행기"\]/);
assert.doesNotMatch(app, /우유급식|줄서기|숙제|알림장|생일케이크|학교와 생활|감정과 상태|상상과 캐릭터 느낌/);
assert.doesNotMatch(app, /users\/\$\{[^}]+\}\/score`\)\.transaction/, "client must not increment users score");
assert.doesNotMatch(app, /drawings\/\$\{[^}]+\}\/likeCount`\)\.transaction/, "client must not write drawing likeCount");
assert.doesNotMatch(app, /feedbackMeta\/\$\{[^}]+\}`\)\.transaction/, "client must not write feedback counters");

assert.equal(rules[".read"], false);
assert.equal(rules[".write"], false);
assert.equal(rules.admins.$uid[".write"], false, "admin membership must be console-managed");
assert.match(rules.users.$uid[".write"], /auth\.uid === \$uid/);
assert.match(rules.users.$uid[".write"], /auth\.token\.email/);
assert.match(rules.users.$uid[".write"], /nicknameKey/);
assert.match(rules.users.$uid[".write"], /newData\.child\('score'\)\.val\(\) === 0/);
assert.match(rules.nicknameIndex.$key[".write"], /auth\.token\.email === \$key \+ '@catchgallery\.app'/);
assert.match(rules.nicknameIndex.$key[".write"], /data\.val\(\) === auth\.uid/);
assert.doesNotMatch(rules.nicknameIndex.$key[".write"], /newData\.val\(\) !== auth\.uid/);
assert.equal(rules.users.$uid.score[".write"], undefined, "score must not have a direct write grant");
assert.match(rules.drawings.$id[".write"], /drawerId/);
assert.match(rules.drawings.$id[".write"], /solverId/);
assert.match(rules.drawings.$id[".write"], /expiresAt/);
assert.match(rules.feedbackContent.$feedbackId[".read"], /isSecret/);
assert.match(rules.feedbackContent.$feedbackId[".read"], /feedbackOwners/);
assert.match(rules.feedbackContent.$feedbackId[".read"], /admins/);
assert.match(rules.feedbackReactions.$feedbackId.$uid[".write"], /feedbackOwners/);
assert.match(rules.feedbackContent.$feedbackId[".read"], /deleted'\)\.val\(\) === false/);
assert.match(rules.feedbackContent.$feedbackId[".read"], /hidden'\)\.val\(\) === false/);
assert.match(rules.feedbackReactions.$feedbackId.$uid[".write"], /isSecret'\)\.val\(\) === false/);
assert.match(rules.feedbackReactions.$feedbackId.$uid[".write"], /hidden'\)\.val\(\) === false/);
assert.match(rules.feedbackOwners.$feedbackId.$uid[".write"], /!newData\.exists\(\)/, "incomplete owner cleanup must be explicit");
assert.match(rules.feedbackOwners.$feedbackId.$uid[".write"], /!root\.child\('feedbackContent'\)/, "completed posts must block cleanup deletion");
assert.match(rules.feedbackMeta.$feedbackId[".write"], /newData\.exists\(\) \|\| !root\.child\('feedbackContent'\)/, "owners may hard-delete only incomplete metadata");
assert.match(rules.feedbackContent.$feedbackId[".write"], /data\.exists\(\) && newData\.exists\(\) && newData\.hasChild\('content'\)/, "owners cannot hard-delete a completed feedback body");
assert.match(app, /maxlength="300" placeholder="운영자 답변"/);
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
