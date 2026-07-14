import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const migration = app.match(/function migrationTimeout[\s\S]*?async function loadRanking/)[0];

assert.match(app, /migrationBatch:\s*2/);
assert.match(app, /migrationTimeout:\s*25000/);
assert.match(app, /migrationRunning:\s*false/);
assert.match(migration, /if \(state\.migrationRunning/);
assert.match(migration, /try \{[\s\S]*query\.once\("value"\)/);
assert.match(migration, /catch \(error\)[\s\S]*finally/);
assert.match(migration, /그림 목록을 확인하는 중/);
assert.match(migration, /처리할 그림을 불러오는 중/);
assert.match(migration, /이미지 변환 중/);
assert.match(migration, /새 이미지 저장 중/);
assert.match(migration, /저장 결과 확인 중/);
assert.match(migration, /기존 이미지 정리 중/);
assert.match(migration, /migrationTimeout\(query\.once/);
assert.match(migration, /migrationTimeout\(optimizeDataUrl/);
assert.match(migration, /migrationTimeout\(db\.ref\(\)\.update/);
assert.match(migration, /migrationTimeout\(Promise\.all/);
assert.match(migration, /imageCheck\.exists\(\)[\s\S]*thumbnailCheck\.exists\(\)[\s\S]*imageData`\)\.remove/);
assert.match(migration, /finally \{[\s\S]*state\.migrationRunning = false/);
assert.match(migration, /최적화할 기존 그림이 없습니다/);
assert.match(migration, /모든 기존 그림의 최적화가 완료되었습니다/);
assert.match(migration, /최적화 중 오류가 발생했습니다/);
assert.match(app, /home-version[^\n]+v1\.2\.0/);

console.log("v1.1.1 static checks passed.");
