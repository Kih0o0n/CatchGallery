# 캐치갤러리

그림을 게시하고, 다른 사용자가 나중에 정답을 맞히는 모바일 우선 비동기 그림 퀴즈입니다.

## 실행하기

1. Firebase Console의 Authentication에서 **이메일/비밀번호** 로그인 제공업체를 활성화합니다.
2. Authentication의 승인된 도메인에 `kih0o0n.github.io`를 추가합니다.
3. Realtime Database 규칙에 `database.rules.json` 내용을 배포합니다.
4. 정적 웹 서버로 프로젝트 폴더를 실행합니다. 예: `npx serve .`

별도의 빌드 과정은 없습니다. Firebase SDK는 공식 CDN에서 불러옵니다.

## 관리자 등록

1. 앱에서 닉네임 `admin`과 안전한 비밀번호로 회원가입하거나 Firebase Authentication에 동일한 내부 이메일 계정을 만듭니다.
2. Authentication에서 해당 계정의 UID를 확인합니다.
3. Realtime Database의 `admins/{uid}` 값을 `true`로 저장합니다.

관리자 비밀번호는 코드나 데이터베이스에 저장하지 않습니다. 운영 환경에서는 Firebase App Check도 함께 활성화하는 것을 권장합니다.
