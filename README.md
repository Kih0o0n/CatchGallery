# 캐치갤러리

그림을 게시하고, 다른 사용자가 나중에 정답을 맞히는 모바일 우선 비동기 그림 퀴즈입니다.

## 실행하기

1. Firebase 콘솔에서 프로젝트와 Realtime Database를 만듭니다.
2. `app.js` 맨 위 `FIREBASE_CONFIG`를 웹 앱 설정값으로 교체합니다.
3. Realtime Database 규칙에 `database.rules.json` 내용을 배포합니다.
4. 정적 웹 서버로 프로젝트 폴더를 실행합니다. 예: `npx serve .`

별도의 빌드 과정은 없습니다. Firebase SDK는 공식 CDN에서 불러옵니다.

> 현재 규칙은 닉네임 기반 게임을 바로 운영할 수 있도록 공개 읽기/쓰기를 허용합니다. 공개 서비스에서는 Firebase Authentication과 App Check를 함께 적용하는 것을 권장합니다.
