const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCXi55RYsUh7ZKpyzpET_ICik2CG9rIKJQ",
  authDomain: "catchgallery.firebaseapp.com",
  databaseURL: "https://catchgallery-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "catchgallery",
  storageBucket: "catchgallery.firebasestorage.app",
  messagingSenderId: "184579573382",
  appId: "1:184579573382:web:c4a7d3e969b35d4065b307"
};

const LEGACY_WORDS = [
  { category: "동물", word: "강아지", answers: ["강아지", "개", "멍멍이"] },
  { category: "동물", word: "고양이", answers: ["고양이", "냥이"] },
  { category: "동물", word: "토끼", answers: ["토끼"] },
  { category: "동물", word: "햄스터", answers: ["햄스터"] },
  { category: "동물", word: "다람쥐", answers: ["다람쥐"] },
  { category: "동물", word: "고슴도치", answers: ["고슴도치"] },
  { category: "동물", word: "판다", answers: ["판다"] },
  { category: "동물", word: "곰", answers: ["곰"] },
  { category: "동물", word: "호랑이", answers: ["호랑이"] },
  { category: "동물", word: "사자", answers: ["사자"] },
  { category: "동물", word: "코끼리", answers: ["코끼리"] },
  { category: "동물", word: "기린", answers: ["기린"] },
  { category: "동물", word: "원숭이", answers: ["원숭이"] },
  { category: "동물", word: "돼지", answers: ["돼지"] },
  { category: "동물", word: "소", answers: ["소", "황소"] },
  { category: "동물", word: "말", answers: ["말"] },
  { category: "동물", word: "양", answers: ["양"] },
  { category: "동물", word: "닭", answers: ["닭"] },
  { category: "동물", word: "오리", answers: ["오리"] },
  { category: "동물", word: "펭귄", answers: ["펭귄"] },
  { category: "동물", word: "공룡", answers: ["공룡"] },
  { category: "동물", word: "용", answers: ["용", "드래곤"] },

  { category: "음식", word: "김밥", answers: ["김밥"] },
  { category: "음식", word: "라면", answers: ["라면"] },
  { category: "음식", word: "떡볶이", answers: ["떡볶이"] },
  { category: "음식", word: "피자", answers: ["피자"] },
  { category: "음식", word: "햄버거", answers: ["햄버거", "버거"] },
  { category: "음식", word: "치킨", answers: ["치킨", "닭튀김"] },
  { category: "음식", word: "핫도그", answers: ["핫도그"] },
  { category: "음식", word: "계란후라이", answers: ["계란후라이", "계란프라이", "달걀후라이", "달걀프라이"] },
  { category: "음식", word: "아이스크림", answers: ["아이스크림", "아이스콘"] },
  { category: "음식", word: "케이크", answers: ["케이크"] },
  { category: "음식", word: "도넛", answers: ["도넛", "도너츠"] },
  { category: "음식", word: "초콜릿", answers: ["초콜릿", "초코"] },
  { category: "음식", word: "사탕", answers: ["사탕"] },
  { category: "음식", word: "과자", answers: ["과자"] },
  { category: "음식", word: "팝콘", answers: ["팝콘"] },
  { category: "음식", word: "우유", answers: ["우유"] },
  { category: "음식", word: "주스", answers: ["주스", "쥬스"] },
  { category: "음식", word: "커피", answers: ["커피"] },
  { category: "음식", word: "물", answers: ["물"] },
  { category: "음식", word: "수박", answers: ["수박"] },
  { category: "음식", word: "바나나", answers: ["바나나"] },
  { category: "음식", word: "사과", answers: ["사과"] },
  { category: "음식", word: "딸기", answers: ["딸기"] },
  { category: "음식", word: "포도", answers: ["포도"] },
  { category: "음식", word: "귤", answers: ["귤", "감귤"] },
  { category: "음식", word: "급식", answers: ["급식"] },

  { category: "물건", word: "핸드폰", answers: ["핸드폰", "휴대폰", "스마트폰"] },
  { category: "물건", word: "컴퓨터", answers: ["컴퓨터", "PC"] },
  { category: "물건", word: "노트북", answers: ["노트북"] },
  { category: "물건", word: "텔레비전", answers: ["텔레비전", "티비", "TV"] },
  { category: "물건", word: "리모컨", answers: ["리모컨", "리모콘"] },
  { category: "물건", word: "시계", answers: ["시계"] },
  { category: "물건", word: "안경", answers: ["안경"] },
  { category: "물건", word: "가방", answers: ["가방"] },
  { category: "물건", word: "우산", answers: ["우산"] },
  { category: "물건", word: "신발", answers: ["신발"] },
  { category: "물건", word: "모자", answers: ["모자"] },
  { category: "물건", word: "옷", answers: ["옷"] },
  { category: "물건", word: "양말", answers: ["양말"] },
  { category: "물건", word: "장갑", answers: ["장갑"] },
  { category: "물건", word: "마스크", answers: ["마스크"] },
  { category: "물건", word: "칫솔", answers: ["칫솔"] },
  { category: "물건", word: "컵", answers: ["컵", "잔"] },
  { category: "물건", word: "접시", answers: ["접시"] },
  { category: "물건", word: "숟가락", answers: ["숟가락", "스푼"] },
  { category: "물건", word: "포크", answers: ["포크"] },
  { category: "물건", word: "의자", answers: ["의자"] },
  { category: "물건", word: "책상", answers: ["책상"] },
  { category: "물건", word: "침대", answers: ["침대"] },
  { category: "물건", word: "문", answers: ["문"] },
  { category: "물건", word: "열쇠", answers: ["열쇠", "키"] },
  { category: "물건", word: "책", answers: ["책"] },
  { category: "물건", word: "공책", answers: ["공책", "노트"] },
  { category: "물건", word: "연필", answers: ["연필"] },
  { category: "물건", word: "지우개", answers: ["지우개"] },
  { category: "물건", word: "필통", answers: ["필통"] },
  { category: "물건", word: "색연필", answers: ["색연필"] },
  { category: "물건", word: "크레파스", answers: ["크레파스", "크레용"] },
  { category: "물건", word: "가위", answers: ["가위"] },
  { category: "물건", word: "딱풀", answers: ["딱풀", "풀"] },
  { category: "물건", word: "자", answers: ["자", "줄자"] },
  { category: "물건", word: "칠판", answers: ["칠판"] },
  { category: "물건", word: "풍선", answers: ["풍선"] },
  { category: "물건", word: "편지", answers: ["편지"] },
  { category: "물건", word: "카메라", answers: ["카메라"] },
  { category: "물건", word: "사진", answers: ["사진"] },
  { category: "물건", word: "지도", answers: ["지도"] },
  { category: "물건", word: "돈", answers: ["돈", "지폐"] },
  { category: "물건", word: "동전", answers: ["동전"] },
  { category: "물건", word: "쓰레기통", answers: ["쓰레기통"] },
  { category: "물건", word: "세탁기", answers: ["세탁기"] },
  { category: "물건", word: "냉장고", answers: ["냉장고"] },
  { category: "물건", word: "선풍기", answers: ["선풍기"] },
  { category: "물건", word: "에어컨", answers: ["에어컨"] },
  { category: "물건", word: "전등", answers: ["전등", "조명"] },
  { category: "물건", word: "비누", answers: ["비누"] },
  { category: "물건", word: "수건", answers: ["수건"] },
  { category: "물건", word: "거울", answers: ["거울"] },
  { category: "물건", word: "빗", answers: ["빗"] },
  { category: "물건", word: "치약", answers: ["치약"] },
  { category: "물건", word: "로봇", answers: ["로봇"] },

  { category: "장소", word: "학교", answers: ["학교"] },
  { category: "장소", word: "교실", answers: ["교실"] },
  { category: "장소", word: "운동장", answers: ["운동장"] },
  { category: "장소", word: "도서관", answers: ["도서관"] },
  { category: "장소", word: "놀이터", answers: ["놀이터"] },
  { category: "장소", word: "공원", answers: ["공원"] },
  { category: "장소", word: "병원", answers: ["병원"] },
  { category: "장소", word: "약국", answers: ["약국"] },
  { category: "장소", word: "편의점", answers: ["편의점"] },
  { category: "장소", word: "마트", answers: ["마트", "슈퍼"] },
  { category: "장소", word: "영화관", answers: ["영화관", "극장"] },
  { category: "장소", word: "식당", answers: ["식당"] },
  { category: "장소", word: "카페", answers: ["카페"] },
  { category: "장소", word: "집", answers: ["집", "우리집"] },
  { category: "장소", word: "화장실", answers: ["화장실"] },

  { category: "자연", word: "해", answers: ["해", "태양"] },
  { category: "자연", word: "달", answers: ["달"] },
  { category: "자연", word: "별", answers: ["별"] },
  { category: "자연", word: "구름", answers: ["구름"] },
  { category: "자연", word: "비", answers: ["비"] },
  { category: "자연", word: "눈", answers: ["눈"] },
  { category: "자연", word: "무지개", answers: ["무지개"] },
  { category: "자연", word: "바람", answers: ["바람"] },
  { category: "자연", word: "번개", answers: ["번개"] },
  { category: "자연", word: "산", answers: ["산"] },
  { category: "자연", word: "바다", answers: ["바다"] },
  { category: "자연", word: "강", answers: ["강"] },
  { category: "자연", word: "섬", answers: ["섬"] },
  { category: "자연", word: "나무", answers: ["나무"] },
  { category: "자연", word: "꽃", answers: ["꽃"] },
  { category: "자연", word: "잔디", answers: ["잔디", "풀밭"] },
  { category: "자연", word: "돌", answers: ["돌", "바위"] },
  { category: "자연", word: "불", answers: ["불", "불꽃"] },
  { category: "자연", word: "얼음", answers: ["얼음"] },
  { category: "자연", word: "파도", answers: ["파도"] },
  { category: "자연", word: "별똥별", answers: ["별똥별"] },

  { category: "탈것", word: "자동차", answers: ["자동차", "차"] },
  { category: "탈것", word: "버스", answers: ["버스"] },
  { category: "탈것", word: "택시", answers: ["택시"] },
  { category: "탈것", word: "지하철", answers: ["지하철"] },
  { category: "탈것", word: "기차", answers: ["기차"] },
  { category: "탈것", word: "비행기", answers: ["비행기"] },
  { category: "탈것", word: "배", answers: ["배", "선박"] },
  { category: "탈것", word: "자전거", answers: ["자전거"] },
  { category: "탈것", word: "오토바이", answers: ["오토바이", "바이크"] },
  { category: "탈것", word: "킥보드", answers: ["킥보드"] },
  { category: "탈것", word: "트럭", answers: ["트럭"] },
  { category: "탈것", word: "구급차", answers: ["구급차"] },
  { category: "탈것", word: "소방차", answers: ["소방차"] },
  { category: "탈것", word: "경찰차", answers: ["경찰차"] },

  { category: "운동과 놀이", word: "축구", answers: ["축구"] },
  { category: "운동과 놀이", word: "야구", answers: ["야구"] },
  { category: "운동과 놀이", word: "농구", answers: ["농구"] },
  { category: "운동과 놀이", word: "배구", answers: ["배구"] },
  { category: "운동과 놀이", word: "탁구", answers: ["탁구"] },
  { category: "운동과 놀이", word: "수영", answers: ["수영"] },
  { category: "운동과 놀이", word: "달리기", answers: ["달리기"] },
  { category: "운동과 놀이", word: "줄넘기", answers: ["줄넘기"] },
  { category: "운동과 놀이", word: "숨바꼭질", answers: ["숨바꼭질"] },
  { category: "운동과 놀이", word: "그네", answers: ["그네"] },
  { category: "운동과 놀이", word: "미끄럼틀", answers: ["미끄럼틀"] },
  { category: "운동과 놀이", word: "시소", answers: ["시소"] },
  { category: "운동과 놀이", word: "블록", answers: ["블록", "레고"] },
  { category: "운동과 놀이", word: "보드게임", answers: ["보드게임"] },
  { category: "운동과 놀이", word: "장난감", answers: ["장난감"] },
  { category: "운동과 놀이", word: "종이비행기", answers: ["종이비행기"] },

  { category: "직업", word: "선생님", answers: ["선생님", "교사"] },
  { category: "직업", word: "의사", answers: ["의사"] },
  { category: "직업", word: "간호사", answers: ["간호사"] },
  { category: "직업", word: "경찰", answers: ["경찰", "경찰관"] },
  { category: "직업", word: "소방관", answers: ["소방관"] },
  { category: "직업", word: "요리사", answers: ["요리사", "셰프"] },
  { category: "직업", word: "가수", answers: ["가수"] },
  { category: "직업", word: "배우", answers: ["배우"] },
  { category: "직업", word: "화가", answers: ["화가"] },
  { category: "직업", word: "작가", answers: ["작가"] },
  { category: "직업", word: "운동선수", answers: ["운동선수", "선수"] },
  { category: "직업", word: "유튜버", answers: ["유튜버"] },
  { category: "직업", word: "운전기사", answers: ["운전기사", "기사"] },
  { category: "직업", word: "농부", answers: ["농부"] },
  { category: "직업", word: "과학자", answers: ["과학자"] },

  { category: "계절과 행사", word: "봄", answers: ["봄"] },
  { category: "계절과 행사", word: "여름", answers: ["여름"] },
  { category: "계절과 행사", word: "가을", answers: ["가을"] },
  { category: "계절과 행사", word: "겨울", answers: ["겨울"] },
  { category: "계절과 행사", word: "눈사람", answers: ["눈사람"] },
  { category: "계절과 행사", word: "크리스마스", answers: ["크리스마스", "성탄절"] },
  { category: "계절과 행사", word: "산타", answers: ["산타", "산타할아버지"] },
  { category: "계절과 행사", word: "크리스마스트리", answers: ["크리스마스트리", "크리스마스 트리", "트리"] },
  { category: "계절과 행사", word: "생일", answers: ["생일"] },
  { category: "계절과 행사", word: "선물", answers: ["선물"] },
  { category: "계절과 행사", word: "운동회", answers: ["운동회"] },
  { category: "계절과 행사", word: "소풍", answers: ["소풍"] },
  { category: "계절과 행사", word: "할로윈", answers: ["할로윈"] },
  { category: "계절과 행사", word: "새해", answers: ["새해", "설날"] }
];

const BASE_WORDS = Object.entries({
  "동물": { 강아지: "강아지,개,멍멍이", 고양이: "고양이,냥이,야옹이", 토끼: "토끼,산토끼", 햄스터: "햄스터,햄찌", 다람쥐: "다람쥐", 고슴도치: "고슴도치", 여우: "여우", 늑대: "늑대", 곰: "곰,반달곰", 판다: "판다,팬더", 사자: "사자", 호랑이: "호랑이,범", 코끼리: "코끼리", 기린: "기린", 얼룩말: "얼룩말", 원숭이: "원숭이", 캥거루: "캥거루", 코알라: "코알라", 펭귄: "펭귄", 돌고래: "돌고래", 상어: "상어", 문어: "문어", 오징어: "오징어", 거북이: "거북이,거북", 개구리: "개구리", 부엉이: "부엉이,올빼미", 독수리: "독수리", 참새: "참새", 나비: "나비", 벌: "벌,꿀벌", 개미: "개미", 무당벌레: "무당벌레", 공룡: "공룡", 티라노사우루스: "티라노사우루스,티라노" },
  "음식": { 라면: "라면", 떡볶이: "떡볶이", 김밥: "김밥", 피자: "피자", 햄버거: "햄버거,버거", 치킨: "치킨,닭튀김", 아이스크림: "아이스크림", 케이크: "케이크", 도넛: "도넛,도너츠", 초콜릿: "초콜릿,초코", 사탕: "사탕,캔디", 수박: "수박", 딸기: "딸기", 바나나: "바나나", 사과: "사과", 포도: "포도", 귤: "귤,감귤", 복숭아: "복숭아", 파인애플: "파인애플", 계란: "계란,달걀", 우유: "우유", 빵: "빵", 식빵: "식빵", 감자튀김: "감자튀김,프렌치프라이", 핫도그: "핫도그", 초밥: "초밥,스시", 만두: "만두", 팝콘: "팝콘", 쿠키: "쿠키", 샌드위치: "샌드위치", 김치: "김치", 된장찌개: "된장찌개", 비빔밥: "비빔밥", 짜장면: "짜장면,자장면", 탕후루: "탕후루", 호박: "호박" },
  "학교 / 문구": { 학교: "학교", 교실: "교실", 칠판: "칠판,보드", 책상: "책상", 의자: "의자", 연필: "연필", 지우개: "지우개", 색연필: "색연필", 크레파스: "크레파스", 가위: "가위", 풀: "풀,딱풀", 공책: "공책,노트", 책가방: "책가방,가방", 자: "자,줄자", 필통: "필통", 급식: "급식", 운동장: "운동장", 종이비행기: "종이비행기", 시험지: "시험지", 현미경: "현미경", 태블릿: "태블릿,패드", 실험복: "실험복", 지구본: "지구본", 분필: "분필", 사물함: "사물함" },
  "생활용품": { 우산: "우산", 시계: "시계", 모자: "모자", 신발: "신발,운동화", 양말: "양말", 가방: "가방", 컵: "컵,물컵", 칫솔: "칫솔", 치약: "치약", 비누: "비누", 수건: "수건", 베개: "베개", 이불: "이불", 침대: "침대", 소파: "소파", 냉장고: "냉장고", 세탁기: "세탁기", 전등: "전등,조명", 거울: "거울", 문: "문", 창문: "창문", 쓰레기통: "쓰레기통", 휴지: "휴지,화장지", 열쇠: "열쇠,키" },
  "자연 / 날씨": { 해: "해,태양", 달: "달", 별: "별", 구름: "구름", 비: "비", 눈: "눈", 번개: "번개", 무지개: "무지개", 바람: "바람", 파도: "파도", 산: "산", 강: "강", 바다: "바다", 섬: "섬", 나무: "나무", 꽃: "꽃", 버섯: "버섯", 화산: "화산", 사막: "사막", 동굴: "동굴", 폭포: "폭포", 연못: "연못", 숲: "숲", 낙엽: "낙엽" },
  "탈것": { 자동차: "자동차,차", 버스: "버스", 택시: "택시", 지하철: "지하철", 기차: "기차", 비행기: "비행기", 헬리콥터: "헬리콥터", 자전거: "자전거", 오토바이: "오토바이", 배: "배,선박", 로켓: "로켓", 소방차: "소방차", 경찰차: "경찰차", 구급차: "구급차,앰뷸런스", 트럭: "트럭", 스케이트보드: "스케이트보드,보드", 킥보드: "킥보드", 열기구: "열기구", 잠수함: "잠수함", 우주선: "우주선" },
  "운동 / 놀이": { 축구: "축구", 야구: "야구", 농구: "농구", 배드민턴: "배드민턴", 탁구: "탁구", 수영: "수영", 달리기: "달리기", 줄넘기: "줄넘기", 피구: "피구", 볼링: "볼링", 스케이트: "스케이트", 스키: "스키", 썰매: "썰매", 낚시: "낚시", 캠핑: "캠핑", 숨바꼭질: "숨바꼭질", 보드게임: "보드게임", 풍선: "풍선", 연: "연,연날리기", 그네: "그네", 미끄럼틀: "미끄럼틀", 시소: "시소", 블록: "블록,장난감블록", 비눗방울: "비눗방울" },
  "장소": { 집: "집,우리집", 병원: "병원", 경찰서: "경찰서", 소방서: "소방서", 도서관: "도서관", 영화관: "영화관", 놀이공원: "놀이공원", 동물원: "동물원", 수영장: "수영장", 공원: "공원", 편의점: "편의점", 빵집: "빵집,베이커리", 식당: "식당", 카페: "카페", 공항: "공항", 학교앞: "학교앞,학교 앞", 교문: "교문", 놀이터: "놀이터", 마트: "마트" },
  "직업": { 선생님: "선생님,교사", 의사: "의사,의사선생님", 간호사: "간호사", 경찰: "경찰,경찰관", 소방관: "소방관", 요리사: "요리사,셰프", 가수: "가수", 화가: "화가", 운동선수: "운동선수,선수", 우주비행사: "우주비행사", 농부: "농부", 어부: "어부", 과학자: "과학자", 마술사: "마술사", 유튜버: "유튜버", 배우: "배우", 작가: "작가", 미용사: "미용사", 운전기사: "운전기사,기사,기사님", 판사: "판사" },
  "인물 / 역할": { 아기: "아기,애기", 어린이: "어린이,아이", 학생: "학생", 친구: "친구", 할머니: "할머니", 할아버지: "할아버지", 엄마: "엄마,어머니", 아빠: "아빠,아버지", 언니: "언니", 오빠: "오빠", 누나: "누나", 형: "형", 동생: "동생", 공주: "공주", 왕자: "왕자", 왕: "왕,임금님", 여왕: "여왕", 해적: "해적", 기사: "기사", 탐정: "탐정", 닌자: "닌자", 무사: "무사", 광대: "광대,피에로,삐에로", 요리왕: "요리왕", 선장: "선장", 대장: "대장", 심판: "심판", 응원단장: "응원단장", 경비원: "경비원" },
  "캐릭터": { 로봇: "로봇", 외계인: "외계인", 괴물: "괴물,몬스터", 좀비: "좀비", 귀신: "귀신,유령", 마법사: "마법사", 마녀: "마녀", 요정: "요정", 인어: "인어", 인어공주: "인어공주,인어", 히어로: "히어로,영웅", 악당: "악당,빌런", 천사: "천사", 악마: "악마", 드래곤: "드래곤,용", 유니콘: "유니콘", 거인: "거인", 난쟁이: "난쟁이", 도깨비: "도깨비", 구미호: "구미호", 산타: "산타,산타할아버지", 허수아비: "허수아비", 인형: "인형", 꼭두각시: "꼭두각시", 장난감병정: "장난감병정,병정" },
  "상상 / 판타지": { 보물상자: "보물상자,보물", 성: "성,궁전", 마법봉: "마법봉", 투명망토: "투명망토", 타임머신: "타임머신", 수정구슬: "수정구슬", 보물지도: "보물지도" },
  "계절 / 행사": { 크리스마스: "크리스마스", 눈사람: "눈사람", 생일: "생일", 생일파티: "생일파티,생일 파티", 선물: "선물", 할로윈: "할로윈", 추석: "추석", 송편: "송편", 설날: "설날", 세배: "세배", 졸업식: "졸업식", 소풍: "소풍", 운동회: "운동회", 방학: "방학", 입학식: "입학식", 어린이날: "어린이날", 불꽃놀이: "불꽃놀이,폭죽", 벚꽃: "벚꽃" },
  "전자기기 / 기계": { 휴대폰: "휴대폰,핸드폰,스마트폰", 컴퓨터: "컴퓨터", 노트북: "노트북", 텔레비전: "텔레비전,TV,티비", 카메라: "카메라", 이어폰: "이어폰", 헤드폰: "헤드폰", 마이크: "마이크", 스피커: "스피커", 리모컨: "리모컨", 선풍기: "선풍기", 에어컨: "에어컨", 로봇청소기: "로봇청소기", 드론: "드론", 충전기: "충전기", 게임기: "게임기", 프린터: "프린터", 전기밥솥: "전기밥솥,밥솥", 자판기: "자판기", 계산기: "계산기" },
  "몸 / 옷 / 장신구": { 손: "손", 발: "발", 눈: "눈", 코: "코", 입: "입", 귀: "귀", 머리카락: "머리카락,머리", 치아: "치아,이빨", 티셔츠: "티셔츠,티", 바지: "바지", 치마: "치마", 원피스: "원피스", 목도리: "목도리", 장갑: "장갑", 왕관: "왕관", 안경: "안경", 마스크: "마스크", 반지: "반지", 목걸이: "목걸이" },
  "영화": { 기생충: "기생충", 부산행: "부산행", 범죄도시: "범죄도시", 극한직업: "극한직업", "엽기적인 그녀": "엽기적인 그녀", 타이타닉: "타이타닉", 인터스텔라: "인터스텔라", 인셉션: "인셉션", 매트릭스: "매트릭스", 라라랜드: "라라랜드", 어벤져스: "어벤져스,어벤저스", 아이언맨: "아이언맨", 스파이더맨: "스파이더맨", 배트맨: "배트맨", 조커: "조커", "해리 포터": "해리 포터", "반지의 제왕": "반지의 제왕", "쥬라기 공원": "쥬라기 공원", 스타워즈: "스타워즈", "미션 임파서블": "미션 임파서블", 탑건: "탑건", "캐리비안의 해적": "캐리비안의 해적", "나 홀로 집에": "나 홀로 집에", "트루먼 쇼": "트루먼 쇼", 킹콩: "킹콩", 터미네이터: "터미네이터", 아바타: "아바타", "백 투 더 퓨처": "백 투 더 퓨처", "쇼생크 탈출": "쇼생크 탈출", 레옹: "레옹" },
  "애니메이션": { 원피스: "원피스", 나루토: "나루토", 드래곤볼: "드래곤볼", 포켓몬스터: "포켓몬스터,포켓몬", 디지몬: "디지몬", "명탐정 코난": "명탐정 코난,코난", "짱구는 못말려": "짱구는 못말려,짱구", 슬램덩크: "슬램덩크", "진격의 거인": "진격의 거인,진격거", "귀멸의 칼날": "귀멸의 칼날,귀칼", 주술회전: "주술회전", 데스노트: "데스노트", "강철의 연금술사": "강철의 연금술사,강연금", 에반게리온: "에반게리온,에바", 세일러문: "세일러문", "카드캡터 체리": "카드캡터 체리", 이누야샤: "이누야샤", 하이큐: "하이큐", 체인소맨: "체인소맨", "스파이 패밀리": "스파이 패밀리", "센과 치히로의 행방불명": "센과 치히로의 행방불명", "하울의 움직이는 성": "하울의 움직이는 성", "이웃집 토토로": "이웃집 토토로", "천공의 성 라퓨타": "천공의 성 라퓨타", "너의 이름은": "너의 이름은", 아키라: "아키라", "카우보이 비밥": "카우보이 비밥", 헌터헌터: "헌터헌터,헌터×헌터,헌터X헌터", "사이버펑크 엣지러너": "사이버펑크 엣지러너,사이버펑크: 엣지러너" }
}).flatMap(([category, entries]) => Object.entries(entries).map(([word, answerText]) => ({ category, word, answers: answerText.split(",") }))).filter((entry, index, list) => list.findIndex(candidate => candidate.category === entry.category && candidate.word === entry.word) === index);
const WORD_ADDITIONS_V130 = window.CATCH_GALLERY_V130_WORD_ADDITIONS;
if (!Array.isArray(WORD_ADDITIONS_V130) || WORD_ADDITIONS_V130.length !== 596 || WORD_ADDITIONS_V130.some(entry => !entry || typeof entry.category !== "string" || typeof entry.word !== "string" || !Array.isArray(entry.answers))) throw new Error("v1.3.0 신규 제시어 데이터가 누락되었거나 올바르지 않습니다.");
const WORDS = [...BASE_WORDS, ...WORD_ADDITIONS_V130].filter((entry, index, list) => list.findIndex(candidate => candidate.category === entry.category && candidate.word === entry.word) === index);

const STATUS_LABEL = { open: "도전 중", solved: "완성", expired: "미해결", withdrawn: "회수됨" };
const FEEDBACK_SORTS = [["new", "최신순"], ["old", "과거순"], ["popular", "인기순"], ["likes", "좋아요순"], ["dislikes", "싫어요순"]];
const IMAGE_OPTIONS = { detailMax: 720, thumbnailMax: 240, detailChars: 2500000, thumbnailChars: 400000, imageBytes: 1850000, thumbnailBytes: 290000, webpQuality: 0.82, version: 1, migrationBatch: 2, migrationTimeout: 25000, maxConcurrentLoads: 3 };
const IMAGE_TOO_LARGE_MESSAGE = "그림 데이터가 너무 커서 저장할 수 없어요. 그림을 조금 단순하게 만든 뒤 다시 시도해 주세요.";
const CACHE_LIMITS = { thumbnails: 60, details: 12, likes: 200, feedbackBodies: 40 };
const FEEDBACK_CACHE_TTL_MS = 30_000;
const FEEDBACK_BODY_CONCURRENCY = 3;
const EXPIRY_SWEEP_INTERVAL_MS = 60_000;
const STALE_PROVISIONAL_GRACE_MS = 15 * 60 * 1000;
const DRAWING_HISTORY_LIMIT = 15;
const PEN_TOUCH_TAKEOVER_DELAY_MS = 1500;
const DRAWING_COLORS = [
  ["#ef4458", "빨강", "solid"], ["#f064a6", "분홍", "solid"], ["#f7b6cf", "연분홍", "solid"],
  ["#f28c28", "주황", "solid"], ["#f7b267", "연주황", "solid"], ["#f4d43f", "노랑", "solid"],
  ["#9bd64b", "연두", "solid"], ["#39a96b", "초록", "solid"], ["#72c9ed", "하늘", "solid"],
  ["#3478d4", "파랑", "solid"], ["#b49ae8", "연보라", "solid"], ["#7952b3", "보라", "solid"],
  ["#3e3a48", "검정", "solid"], ["#8b5a3c", "갈색", "solid"],
  ["#d6a928", "금색", "glitter-gold"], ["#aeb7c2", "은색", "glitter-silver"]
];
const DEFAULT_DRAWING_COLOR_INDEX = 12;
const METALLIC_BRUSHES = {
  "glitter-gold": { base: "#d6a928", shadow: "#8f6814", highlight: "#fff3a1", sparkle: "#fffbe0" },
  "glitter-silver": { base: "#aeb7c2", shadow: "#626c78", highlight: "#ffffff", sparkle: "#ffffff" }
};

const appEl = document.querySelector("#app");
const headerEl = document.querySelector("#appHeader");
const scoreEl = document.querySelector("#headerScore");
class LimitedLruCache {
  constructor(limit) {
    this.limit = Math.max(1, Number(limit) || 1);
    this.map = new Map();
  }
  get size() { return this.map.size; }
  has(key) { return this.map.has(key); }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }
  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    while (this.map.size > this.limit) this.map.delete(this.map.keys().next().value);
    return this;
  }
  delete(key) { return this.map.delete(key); }
  clear() { this.map.clear(); }
  entries() { return this.map.entries(); }
  keys() { return this.map.keys(); }
  values() { return this.map.values(); }
  [Symbol.iterator]() { return this.map[Symbol.iterator](); }
}
const state = {
  user: null,
  isAdmin: false,
  authReady: false,
  route: "login",
  word: null,
  seenWordKeys: new Set(),
  hintUsed: {},
  galleryTab: "solved",
  galleryView: "thumb",
  gallerySort: "new",
  galleryIndex: 0,
  galleryArtistDrawingId: null,
  galleryArtist: null,
  galleryHasGalleryBack: false,
  galleryLists: {},
  galleryMetadata: {},
  galleryMetadataPromises: {},
  galleryScroll: {},
  thumbnailCache: new LimitedLruCache(CACHE_LIMITS.thumbnails),
  detailImageCache: new LimitedLruCache(CACHE_LIMITS.details),
  likeCache: new LimitedLruCache(CACHE_LIMITS.likes),
  cacheOwnerUid: null,
  cacheGeneration: 0,
  pendingLikes: new Set(),
  solveObserver: null,
  solveLoader: null,
  galleryObserver: null,
  galleryLoader: null,
  manageDrawings: null,
  manageObserver: null,
  manageLoader: null,
  manageEditRequestId: 0,
  migrationCursor: null,
  migrationRunning: false,
  manageStatus: "open",
  rankingType: "total",
  rankingSnapshot: null,
  rankingSnapshotPromise: null,
  expirySweepPromise: null,
  expirySweepCompletedAt: 0,
  provisionalCleanupPromise: null,
  provisionalCleanupCompletedAt: 0,
  editDrawing: null,
  canvas: null,
  ctx: null,
  drawing: false,
  activePointerId: null,
  activePointerType: null,
  activePointerStartedAt: null,
  activePointerLastEventAt: null,
  activePointerCaptured: false,
  dirty: false,
  history: [],
  historyBaseCanvas: null,
  historyBaseContext: null,
  historyBaseReady: false,
  historyBaseHasContent: false,
  historyRedrawPending: false,
  activeStroke: null,
  canvasRect: null,
  brushInput: null,
  currentBrushKind: "solid",
  strokeSeedCounter: 0,
  metallicPreviewCanvas: null,
  metallicPreviewContext: null,
  metallicPreviewFrame: 0,
  canvasInputCleanup: null,
  canvasZoomScale: 1,
  canvasZoomX: 0,
  canvasZoomY: 0,
  canvasGestureActive: false,
  canvasGesturePointers: new Map(),
  canvasGestureSuppressedPointers: new Set(),
  clearCanvasModalCleanup: null,
  publishing: false,
  saveOperationId: 0,
  activeSaveOperationId: null,
  editImageRequestId: 0,
  drawingPublished: false,
  feedbackView: "all",
  feedbackSort: "new",
  editingFeedback: null,
  feedbackSnapshot: null,
  feedbackSnapshotPromise: null,
  feedbackBodyCache: new LimitedLruCache(CACHE_LIMITS.feedbackBodies),
  feedbackBodyPromises: new Map(),
  feedbackPending: new Map(),
  feedbackObserver: null,
  feedbackLoader: null
};
let routeTransitionId = 0;
const screenRequestIds = Object.create(null);
let db = null;
let auth = null;
let serverTimeOffset = 0;
let serverClockBound = false;

function firebaseReady() { return true; }
function initFirebase() {
  if (!firebaseReady()) return false;
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  db = firebase.database();
  auth = firebase.auth();
  if (!serverClockBound) {
    db.ref(".info/serverTimeOffset").on("value", snap => { serverTimeOffset = Number(snap.val()) || 0; });
    serverClockBound = true;
  }
  return true;
}
function serverNow() { return Date.now() + serverTimeOffset; }
function escapeHtml(value = "") { const d = document.createElement("div"); d.textContent = String(value); return d.innerHTML; }
function isSafeRecordId(value) { return typeof value === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(value); }
function escapeAttribute(value = "") { return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function selectorRecordId(value) { return isSafeRecordId(value) ? (globalThis.CSS?.escape ? CSS.escape(value) : value) : ""; }
function hasPublicDrawingImage(drawing) { return !!drawing?.imageData || drawing?.imageReady === true; }
function safeRecordOrWarn(kind, id) { if (isSafeRecordId(id)) return true; console.warn(`[security] 안전하지 않은 ${kind} ID를 표시에서 제외했습니다.`, id); return false; }
function safeObject(value) { return value && typeof value === "object" ? value : {}; }
function drawerName(d) { return d.drawerNickname || d.drawerDisplayName || "알 수 없음"; }
function solverName(d) { return d.solverNickname || d.solverDisplayName || "알 수 없음"; }
function drawingOwnerId(d) { return d?.drawerId || d?.drawerUid || d?.ownerUid || d?.authorUid || d?.userId || null; }
function isOwnDrawing(d) { return !!state.user?.id && drawingOwnerId(d) === state.user.id; }
function normalizedArtistName(drawing) { return String(drawerName(drawing) || "").trim().normalize("NFC"); }
function hasViewableArtist(drawing) {
  const name = normalizedArtistName(drawing);
  return !!name && name !== "알 수 없음";
}
function galleryArtistIdentity(drawing) {
  if (!drawing || !isSafeRecordId(drawing.id) || !hasViewableArtist(drawing)) return null;
  return { drawingId: drawing.id, ownerId: drawingOwnerId(drawing), name: normalizedArtistName(drawing) };
}
function isDrawingByArtist(drawing, artist) {
  if (!drawing || !artist || !hasViewableArtist(drawing)) return false;
  const ownerId = drawingOwnerId(drawing);
  const sameName = normalizedArtistName(drawing) === artist.name;
  if (artist.ownerId) return ownerId ? ownerId === artist.ownerId : sameName;
  return sameName;
}
function galleryDisplayTime(drawing) {
  for (const field of [drawing?.status === "solved" ? "solvedAt" : "expiredAt", "updatedAt", "createdAt"]) {
    const rawValue = drawing?.[field];
    const value = Number(rawValue);
    if (rawValue !== null && rawValue !== "" && Number.isFinite(value)) return value;
  }
  return 0;
}
function sortGalleryDrawings(list, sort = state.gallerySort) {
  return [...list].sort((a, b) => {
    if (sort === "popular") return (Number(b.likeCount) || 0) - (Number(a.likeCount) || 0) || galleryDisplayTime(b) - galleryDisplayTime(a);
    return sort === "old" ? galleryDisplayTime(a) - galleryDisplayTime(b) : galleryDisplayTime(b) - galleryDisplayTime(a);
  });
}
function invalidateGalleryListsByStatus(status) {
  const prefix = `${status}:`;
  for (const key of Object.keys(state.galleryLists)) {
    if (key.startsWith(prefix) || key.startsWith("artist:")) delete state.galleryLists[key];
  }
  if (state.galleryMetadata) delete state.galleryMetadata[status];
  if (state.galleryMetadataPromises) delete state.galleryMetadataPromises[status];
}
function resetUserSessionCaches() {
  if (typeof cancelFeedbackLoading === "function") cancelFeedbackLoading();
  state.thumbnailCache.clear();
  state.detailImageCache.clear();
  state.likeCache.clear();
  state.galleryLists = {};
  state.galleryMetadata = {};
  state.galleryMetadataPromises = {};
  state.galleryScroll = {};
  state.galleryArtistDrawingId = null;
  state.galleryArtist = null;
  state.galleryHasGalleryBack = false;
  state.pendingLikes.clear();
  state.manageDrawings = null;
  state.hintUsed = {};
  state.editingFeedback = null;
  state.feedbackSnapshot = null;
  state.feedbackSnapshotPromise = null;
  state.feedbackBodyCache?.clear();
  state.feedbackBodyPromises?.clear();
  state.feedbackPending?.clear();
  state.expirySweepPromise = null;
  state.expirySweepCompletedAt = 0;
  state.provisionalCleanupPromise = null;
  state.provisionalCleanupCompletedAt = 0;
  state.rankingSnapshot = null;
  state.rankingSnapshotPromise = null;
}
function setCacheSession(uid) {
  const nextUid = uid || null;
  if (state.cacheOwnerUid === nextUid) return false;
  state.cacheOwnerUid = nextUid;
  state.cacheGeneration++;
  resetUserSessionCaches();
  return true;
}
function isCacheSessionCurrent(uid, generation) {
  return !!uid && state.cacheOwnerUid === uid && state.user?.id === uid && state.cacheGeneration === generation;
}
function showToast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => el.classList.remove("show"), 2400);
}
function userErrorMessage(error, fallback = "잠시 후 다시 시도해 주세요.") {
  const code = String(error?.code || "");
  const message = String(error?.message || "");
  if (/network|offline|timeout|unavailable/i.test(`${code} ${message}`)) return "인터넷 연결을 확인한 뒤 다시 시도해 주세요.";
  if (/permission[-_ ]?denied|FirebaseError|transaction/i.test(`${code} ${message}`)) return fallback;
  return message || fallback;
}
function isTransitionCurrent(id, routeName = state.route) { return id === routeTransitionId && state.route === routeName; }
function beginScreenRequest(routeName, transitionId = routeTransitionId) {
  const requestId = (screenRequestIds[routeName] || 0) + 1;
  screenRequestIds[routeName] = requestId;
  return { routeName, transitionId, requestId };
}
function isScreenRequestCurrent(request) {
  return isTransitionCurrent(request.transitionId, request.routeName) && screenRequestIds[request.routeName] === request.requestId;
}
function loading(request = null) { if (!request || isScreenRequestCurrent(request)) appEl.innerHTML = '<div class="loading" aria-label="불러오는 중"></div>'; }
function formatTime(expiresAt) {
  const ms = Number(expiresAt) - serverNow();
  if (ms <= 0) return "마감됨";
  const h = Math.floor(ms / 3600000);
  return h < 1 ? "1시간 미만" : `${h}시간`;
}
function wordKey(entry) { return `${entry.category}\u0000${entry.word}`; }
function randomWord() {
  if (!WORDS.length) return;
  const currentKey = state.word && !state.word.isCustomWord ? wordKey(state.word) : null;
  let available = WORDS.filter(entry => !state.seenWordKeys.has(wordKey(entry)));
  if (!available.length) {
    state.seenWordKeys.clear();
    available = WORDS.length > 1 && currentKey ? WORDS.filter(entry => wordKey(entry) !== currentKey) : WORDS;
  }
  const next = available[Math.floor(Math.random() * available.length)];
  state.seenWordKeys.add(wordKey(next));
  state.word = { ...next, answers: [...next.answers], isCustomWord: false };
}
function resetDrawingDraft({ preserveSeenWords = false } = {}) {
  if (!preserveSeenWords) state.seenWordKeys.clear();
  if (state.ctx && state.canvas) {
    state.ctx.globalCompositeOperation = "source-over";
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
  }
  state.word = null;
  state.editDrawing = null;
  releaseCanvasHistory();
  state.canvas = null;
  state.ctx = null;
  state.dirty = false;
  state.publishing = false;
  state.drawingPublished = false;
}
function startNewDrawing({ preserveSeenWords = false } = {}) {
  const previousWord = preserveSeenWords ? state.word : null;
  resetDrawingDraft({ preserveSeenWords });
  if (previousWord) state.word = previousWord;
  if (state.route === "draw") {
    randomWord();
    renderDraw();
  }
  else route("draw");
}
function selectDrawingColor(button, buttons = document.querySelectorAll(".color")) {
  buttons.forEach(item => { item.classList.remove("selected"); item.setAttribute("aria-pressed", "false"); });
  button.classList.add("selected");
  button.setAttribute("aria-pressed", "true");
  const eraserButton = document.querySelector("#eraser");
  eraserButton?.classList.remove("active");
  eraserButton?.setAttribute("aria-pressed", "false");
  state.ctx.globalCompositeOperation = "source-over";
  state.ctx.strokeStyle = button.dataset.color;
  state.currentBrushKind = button.dataset.brush || "solid";
}
function normalizeAnswer(value) { return String(value || "").trim().normalize("NFC").replace(/\s+/g, "").toLowerCase(); }
function textLength(value) { return Array.from(value).length; }
function isValidCategory(value) { return typeof value === "string" && textLength(value) >= 1 && textLength(value) <= 20 && !/[<>"'`=]/u.test(value); }
function dataUrlBytes(dataUrl) {
  const base64 = String(dataUrl || "").split(",")[1] || "";
  const padding = (base64.match(/=*$/) || [""])[0].length;
  return Math.max(0, Math.floor(base64.length * 3 / 4) - padding);
}
function validateOptimizedImages(optimized) {
  const imageData = String(optimized?.imageData || "");
  const thumbnailData = String(optimized?.thumbnailData || "");
  const imageBytes = dataUrlBytes(imageData);
  const thumbnailBytes = dataUrlBytes(thumbnailData);
  const validFormat = value => /^data:image\/(png|webp);base64,/.test(value);
  if (!validFormat(imageData) || !validFormat(thumbnailData)
    || imageData.length > IMAGE_OPTIONS.detailChars || thumbnailData.length > IMAGE_OPTIONS.thumbnailChars
    || imageBytes > IMAGE_OPTIONS.imageBytes || thumbnailBytes > IMAGE_OPTIONS.thumbnailBytes) {
    const error = new Error(IMAGE_TOO_LARGE_MESSAGE);
    error.code = "image/too-large";
    throw error;
  }
  return { ...optimized, imageBytes, thumbnailBytes };
}
function scaledCanvas(source, maxSize) {
  const ratio = Math.min(1, maxSize / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * ratio));
  canvas.height = Math.max(1, Math.round(source.height * ratio));
  canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}
function webpDataUrl(canvas) {
  try {
    const data = canvas.toDataURL("image/webp", IMAGE_OPTIONS.webpQuality);
    return data.startsWith("data:image/webp") ? data : null;
  } catch (_) { return null; }
}
async function optimizeCanvasImages(source) {
  const detailCanvas = scaledCanvas(source, IMAGE_OPTIONS.detailMax);
  const png = detailCanvas.toDataURL("image/png");
  const webp = webpDataUrl(detailCanvas);
  const detail = webp && dataUrlBytes(webp) < dataUrlBytes(png) ? webp : png;
  const thumbnailCanvas = scaledCanvas(source, IMAGE_OPTIONS.thumbnailMax);
  const thumbnail = webpDataUrl(thumbnailCanvas) || thumbnailCanvas.toDataURL("image/png");
  return validateOptimizedImages({
    imageData: detail,
    thumbnailData: thumbnail,
    imageFormat: detail.startsWith("data:image/webp") ? "webp" : "png",
    imageWidth: detailCanvas.width,
    imageHeight: detailCanvas.height,
    imageBytes: dataUrlBytes(detail),
    thumbnailBytes: dataUrlBytes(thumbnail)
  });
}
function loadDataUrlImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 읽지 못했어요."));
    image.src = dataUrl;
  });
}
async function optimizeDataUrl(dataUrl) {
  const image = await loadDataUrlImage(dataUrl);
  const optimized = await optimizeCanvasImages(image);
  if (dataUrl.startsWith("data:image/png") && Math.max(image.width, image.height) <= IMAGE_OPTIONS.detailMax && dataUrlBytes(dataUrl) < optimized.imageBytes) {
    optimized.imageData = dataUrl;
    optimized.imageFormat = "png";
    optimized.imageWidth = image.width;
    optimized.imageHeight = image.height;
    optimized.imageBytes = dataUrlBytes(dataUrl);
  }
  return validateOptimizedImages(optimized);
}
async function loadDrawingImage(drawing, kind = "detail") {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(drawing?.id || "") || (!drawing?.imageData && drawing?.imageReady !== true)) throw new Error("표시할 수 없는 그림이에요.");
  const cache = kind === "thumbnail" ? state.thumbnailCache : state.detailImageCache;
  if (cache.has(drawing.id)) return cache.get(drawing.id);
  const generation = state.cacheGeneration;
  let imageData = null;
  if (drawing.imageReady) {
    const path = kind === "thumbnail" ? "drawingThumbnails" : "drawingImages";
    imageData = (await db.ref(`${path}/${drawing.id}/imageData`).once("value")).val();
  }
  imageData ||= drawing.imageData || null;
  if (!imageData) throw new Error("이미지를 불러오지 못했어요.");
  if (state.cacheGeneration === generation) cache.set(drawing.id, imageData);
  return imageData;
}
function isConfigured() {
  if (initFirebase()) return true;
  showToast("Firebase 설정을 먼저 연결해 주세요.");
  return false;
}
function cleanupScreenResources() {
  cancelSolveImageLoading();
  cancelManageImageLoading();
  cancelFeedbackLoading();
  state.manageDrawings = null;
  state.galleryObserver?.disconnect();
  state.galleryObserver = null;
  if (state.galleryLoader) {
    state.galleryLoader.cancelled = true;
    state.galleryLoader.queue.length = 0;
    state.galleryLoader = null;
  }
  state.editImageRequestId++;
  state.clearCanvasModalCleanup?.();
  releaseCanvasHistory();
  state.canvas = null;
  state.ctx = null;
  state.dirty = false;
  state.activeSaveOperationId = null;
  state.publishing = false;
}
function setDrawViewportMode(active) {
  document.documentElement.classList.toggle("draw-viewport-active", active);
  document.body.classList.toggle("draw-viewport-active", active);
}
function transitionRoute(name, { historyMode = "push", historyState = null, renderOptions = {} } = {}) {
  const previousRoute = state.route;
  setDrawViewportMode(name === "draw" && !!state.user);
  cleanupScreenResources();
  if (previousRoute === "ranking" && name !== "ranking") {
    state.rankingSnapshot = null;
    state.rankingSnapshotPromise = null;
  }
  routeTransitionId++;
  const nextHistoryState = historyState || (name === "gallery" ? fullGalleryHistoryState(false) : { route: name, galleryDetail: false });
  if (name === "gallery") {
    const artistDrawingId = nextHistoryState.galleryArtist === true && isSafeRecordId(nextHistoryState.galleryArtistDrawingId) ? nextHistoryState.galleryArtistDrawingId : null;
    if (state.galleryArtistDrawingId !== artistDrawingId) {
      state.galleryArtist = null;
      state.galleryHasGalleryBack = false;
    }
    if (!artistDrawingId) state.galleryHasGalleryBack = false;
    state.galleryArtistDrawingId = artistDrawingId;
    if (["solved", "expired"].includes(nextHistoryState.galleryTab)) state.galleryTab = nextHistoryState.galleryTab;
    if (["new", "old", "popular"].includes(nextHistoryState.gallerySort)) state.gallerySort = nextHistoryState.gallerySort;
    const detail = nextHistoryState.galleryDetail === true;
    state.galleryView = detail ? "frame" : "thumb";
    if (detail && Number.isInteger(nextHistoryState.galleryIndex)) state.galleryIndex = nextHistoryState.galleryIndex;
    else if (previousRoute !== "gallery") state.galleryIndex = 0;
  }
  if (name === "draw" && previousRoute !== "draw") {
    state.seenWordKeys.clear();
    if (!state.editDrawing) state.word = null;
  }
  state.route = name;
  if (name !== "draw") state.editDrawing = null;
  if (historyMode === "push") history.pushState(nextHistoryState, "", `#${name}`);
  else if (historyMode === "replace") history.replaceState(nextHistoryState, "", `#${name}`);
  renderRoute(renderOptions, routeTransitionId);
}
function route(name, options = {}) { transitionRoute(name, { renderOptions: options }); }

window.addEventListener("popstate", event => {
  const name = location.hash.slice(1) || (state.user ? "home" : "login");
  transitionRoute(name, { historyMode: "pop", historyState: event.state || null });
});
document.addEventListener("click", e => {
  const target = e.target.closest("[data-route]");
  if (target) route(target.dataset.route);
});
document.querySelector("#backButton").addEventListener("click", () => {
  if (state.route === "gallery" && state.galleryArtistDrawingId && state.galleryView === "frame") returnFromArtistDetail();
  else if (state.route === "gallery" && state.galleryArtistDrawingId) returnFromArtistGallery();
  else if (state.route === "gallery" && state.galleryView === "frame") history.back();
  else route("home");
});

function normalizeNickname(value) { return value.trim().normalize("NFC"); }
function nicknameKey(value) {
  const bytes = new TextEncoder().encode(normalizeNickname(value));
  return "u_" + Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}
function internalEmail(value) { return `${nicknameKey(value)}@catchgallery.app`; }
function nicknameFromInternalEmail(email) {
  const match = String(email || "").toLowerCase().match(/^(u_([0-9a-f]+))@catchgallery\.app$/);
  if (!match || match[2].length % 2 !== 0) return null;
  try {
    const bytes = new Uint8Array(match[2].match(/../g).map(value => parseInt(value, 16)));
    const nickname = normalizeNickname(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!nickname || nickname.length > 8 || nicknameKey(nickname) !== match[1]) return null;
    return nickname;
  } catch (_) { return null; }
}
function validateCredentials(nickname, password) {
  const name = normalizeNickname(nickname);
  if (!name || name.length > 8) throw new Error("닉네임은 1~8글자로 입력해 주세요.");
  if (!String(password || "").trim()) throw new Error("비밀번호를 입력해 주세요.");
  if (password.length < 6) throw new Error("비밀번호는 6자 이상 입력해 주세요.");
  return name;
}
function authMessage(error, mode) {
  const code = error?.code || "";
  if (code.includes("email-already-in-use")) return "이미 사용 중인 닉네임입니다.\n다른 닉네임을 사용해 주세요.";
  if (code.includes("wrong-password") || code.includes("invalid-credential") || code.includes("invalid-login-credentials")) return "비밀번호가 맞지 않습니다.";
  if (code.includes("user-not-found")) return "가입되지 않은 닉네임입니다.";
  if (code.includes("weak-password")) return "비밀번호는 6자 이상 입력해 주세요.";
  if (code.includes("too-many-requests")) return "잠시 후 다시 시도해 주세요.";
  return mode === "signup" ? "회원가입 중 오류가 발생했습니다." : "로그인 중 오류가 발생했습니다.";
}
let authGeneration = 0;
let authOwnerUid;
let appliedAuthGeneration = -1;
const authPreparationPromises = new Map();
const pendingAuthIntents = new Map();
let logoutRequested = false;

function authEmailKey(firebaseUser) { return String(firebaseUser?.email || "").toLowerCase(); }
function claimAuthOwner(firebaseUser) {
  const uid = firebaseUser?.uid || null;
  if (authOwnerUid !== uid) {
    authOwnerUid = uid;
    authGeneration++;
  }
  return { uid, generation: authGeneration };
}
function isAuthPreparationCurrent(uid, generation) {
  return !!uid && authOwnerUid === uid && authGeneration === generation && auth?.currentUser?.uid === uid;
}
function profileNickname(firebaseUser, hint) {
  const email = authEmailKey(firebaseUser);
  const candidates = [hint, pendingAuthIntents.get(email)?.nickname, localStorage.getItem("catchGalleryNickname"), nicknameFromInternalEmail(email)];
  for (const candidate of candidates) {
    const nickname = normalizeNickname(candidate || "");
    if (nickname && nickname.length <= 8 && internalEmail(nickname) === email) return nickname;
  }
  throw new Error("닉네임 정보를 복구할 수 없어 다시 로그인해야 합니다.");
}
async function claimNicknameIndex(key, uid) {
  const result = await db.ref(`nicknameIndex/${key}`).transaction(current => current == null || current === uid ? uid : undefined, null, false);
  const owner = result.snapshot?.val() ?? null;
  if (!result.committed || owner !== uid) {
    const error = new Error("이미 사용 중인 닉네임입니다.");
    error.nicknameIndexObservation = { status: owner === null ? "absent" : "present", owner };
    throw error;
  }
  return { status: "present", owner: uid };
}
async function ensureUserProfile(firebaseUser, nicknameHint, signupIntent = null, shouldContinue) {
  const uid = firebaseUser.uid;
  const now = serverNow();
  const ref = db.ref(`users/${uid}`);
  const snap = await ref.once("value");
  const old = snap.val();
  if (!shouldContinue()) throw Object.assign(new Error("오래된 인증 작업입니다."), { code: "auth/stale-operation" });
  if (old) {
    if (authEmailKey(firebaseUser) !== `${old.nicknameKey}@catchgallery.app` || nicknameKey(old.nickname) !== old.nicknameKey) {
      throw new Error("사용자 프로필 정보를 안전하게 확인할 수 없습니다.");
    }
    const changes = old.rankingDeleted
      ? { lastSeenAt: now, score: 0, rankingDeleted: false, rankingDeletedAt: null }
      : { lastSeenAt: now };
    await ref.update(changes);
    return { profile: { ...old, ...changes }, created: false, key: old.nicknameKey };
  }
  const nickname = profileNickname(firebaseUser, nicknameHint);
  const key = nicknameKey(nickname);
  const profile = { nickname, nicknameKey: key, score: 0, createdAt: now, lastSeenAt: now, rankingDeleted: false };
  if (signupIntent) signupIntent.database.profile = "absent";
  if (!shouldContinue()) throw Object.assign(new Error("오래된 인증 작업입니다."), { code: "auth/stale-operation" });
  await ref.set(profile);
  if (signupIntent) signupIntent.database.profile = "present";
  try {
    if (!shouldContinue()) throw Object.assign(new Error("오래된 인증 작업입니다."), { code: "auth/stale-operation" });
    const observation = await claimNicknameIndex(key, uid);
    if (signupIntent) signupIntent.database.index = observation;
  } catch (error) {
    if (signupIntent) signupIntent.database.index = error.nicknameIndexObservation || { status: "unknown", owner: null };
    throw error;
  }
  return { profile, created: true, key };
}
async function loadCurrentUser(userId, options = {}) {
  if (!db || !userId) return null;
  const shouldApply = options.shouldApply || (() => isAuthPreparationCurrent(userId, options.generation));
  const [profileSnap, adminSnap, score] = await Promise.all([
    options.profile ? null : db.ref(`users/${userId}`).once("value"),
    options.adminSnapshot ? options.adminSnapshot : db.ref(`admins/${userId}`).once("value"),
    options.score !== undefined ? options.score : loadUserScore(userId)
  ]);
  const profile = options.profile || profileSnap?.val();
  if (!profile || !shouldApply()) return null;
  setCacheSession(userId);
  state.user = { id: userId, ...profile, score };
  state.isAdmin = adminSnap.val() === true;
  localStorage.setItem("catchGalleryUid", userId);
  localStorage.setItem("catchGalleryNickname", state.user.nickname);
  scoreEl.textContent = `${score}점`;
  return state.user;
}
async function prepareAuthSession(firebaseUser, nicknameHint = null) {
  const { uid, generation } = claimAuthOwner(firebaseUser);
  if (!uid) return null;
  if (appliedAuthGeneration === generation && state.user?.id === uid) return state.user;
  const existing = authPreparationPromises.get(uid);
  if (existing?.generation === generation) return existing.promise;
  const intent = pendingAuthIntents.get(authEmailKey(firebaseUser)) || null;
  const entry = { generation, promise: null };
  entry.promise = (async () => {
    const prepared = await ensureUserProfile(firebaseUser, nicknameHint, intent?.kind === "signup" ? intent : null, () => isAuthPreparationCurrent(uid, generation) && authPreparationPromises.get(uid) === entry);
    const [adminSnapshot, score] = await Promise.all([
      db.ref(`admins/${uid}`).once("value"),
      loadUserScore(uid)
    ]);
    if (!isAuthPreparationCurrent(uid, generation) || authPreparationPromises.get(uid) !== entry) return null;
    const user = await loadCurrentUser(uid, { profile: prepared.profile, adminSnapshot, score, generation });
    if (!user || !isAuthPreparationCurrent(uid, generation)) return null;
    appliedAuthGeneration = generation;
    state.authReady = true;
    const target = intent?.route || (location.hash.slice(1) || "home");
    transitionRoute(target, { historyMode: "replace", historyState: { route: target, galleryDetail: false } });
    expireOldDrawings().catch(console.error);
    return user;
  })().finally(() => {
    if (authPreparationPromises.get(uid) === entry) authPreparationPromises.delete(uid);
  });
  authPreparationPromises.set(uid, entry);
  return entry.promise;
}
async function observeSignupDatabase(firebaseUser, intent, cleanupErrors) {
  const uid = firebaseUser.uid;
  try {
    const snap = await db.ref(`users/${uid}`).once("value");
    intent.database.profile = snap.exists() ? "present" : "absent";
  } catch (error) { intent.database.profile = "unknown"; cleanupErrors.push(error); }
  try {
    const snap = await db.ref(`nicknameIndex/${intent.key}`).once("value");
    const owner = snap.val() ?? null;
    intent.database.index = { status: owner === null ? "absent" : "present", owner };
  } catch (error) { intent.database.index = { status: "unknown", owner: null }; cleanupErrors.push(error); }
}
async function cleanupSignup(firebaseUser, intent, originalError) {
  const cleanupErrors = [];
  const uid = firebaseUser.uid;
  if (auth?.currentUser?.uid !== uid) {
    const result = { stale: true, database: intent.database, errors: cleanupErrors };
    originalError.cleanupState = result;
    return result;
  }
  await observeSignupDatabase(firebaseUser, intent, cleanupErrors);
  if (intent.database.index.status === "present" && intent.database.index.owner === uid) {
    try {
      await db.ref(`nicknameIndex/${intent.key}`).remove();
      intent.database.index = { status: "absent", owner: null };
    } catch (error) {
      cleanupErrors.push(error);
      intent.database.index = { status: "unknown", owner: null };
      await observeSignupDatabase(firebaseUser, intent, cleanupErrors);
    }
  }
  if (intent.database.index.status === "absent" && intent.database.profile === "present") {
    try {
      await db.ref(`users/${uid}`).remove();
      intent.database.profile = "absent";
    } catch (error) {
      cleanupErrors.push(error);
      intent.database.profile = "unknown";
      await observeSignupDatabase(firebaseUser, intent, cleanupErrors);
      if (intent.database.profile === "present" && intent.database.index.status === "absent" && auth?.currentUser?.uid === uid) {
        try { intent.database.index = await claimNicknameIndex(intent.key, uid); }
        catch (restoreError) {
          cleanupErrors.push(restoreError);
          intent.database.index = restoreError.nicknameIndexObservation || { status: "unknown", owner: null };
        }
      }
    }
  }
  const databaseAbsent = intent.database.profile === "absent" && intent.database.index.status === "absent";
  if (databaseAbsent && auth?.currentUser?.uid === uid) {
    try { await firebaseUser.delete(); }
    catch (error) {
      cleanupErrors.push(error);
      if (auth?.currentUser?.uid === uid) try { await auth.signOut(); } catch (signOutError) { cleanupErrors.push(signOutError); }
    }
  } else if (auth?.currentUser?.uid === uid) {
    try { await auth.signOut(); } catch (error) { cleanupErrors.push(error); }
  }
  const result = { stale: false, database: intent.database, errors: cleanupErrors };
  originalError.cleanupState = result;
  return result;
}
async function signUp(nickname, password) {
  const name = validateCredentials(nickname, password);
  const email = internalEmail(name);
  const intent = { kind: "signup", nickname: name, key: nicknameKey(name), route: "home", database: { profile: "unknown", index: { status: "unknown", owner: null } } };
  pendingAuthIntents.set(email, intent);
  try {
    const credential = await auth.createUserWithEmailAndPassword(email, password);
    try {
      return await prepareAuthSession(credential.user, name);
    } catch (error) {
      const cleanup = await cleanupSignup(credential.user, intent, error);
      if (!error.cleanupState) error.cleanupState = cleanup;
      if (cleanup.stale) return null;
      throw error;
    }
  } catch (error) {
    if (error.message?.startsWith("이미") || error.message?.includes("오류")) throw error;
    const publicError = new Error(authMessage(error, "signup"));
    if (error.cleanupState) publicError.cleanupState = error.cleanupState;
    throw publicError;
  } finally {
    if (pendingAuthIntents.get(email) === intent) pendingAuthIntents.delete(email);
  }
}
async function signIn(nickname, password) {
  const name = validateCredentials(nickname, password);
  const email = internalEmail(name);
  const intent = { kind: "login", nickname: name, route: "home" };
  pendingAuthIntents.set(email, intent);
  let signedInUser = null;
  try {
    const credential = await auth.signInWithEmailAndPassword(email, password);
    signedInUser = credential.user;
    return await prepareAuthSession(credential.user, name);
  } catch (error) {
    if (signedInUser && auth?.currentUser?.uid !== signedInUser.uid) return null;
    if (signedInUser && auth?.currentUser?.uid === signedInUser.uid) { try { await auth.signOut(); } catch (_) {} }
    if (error.message?.includes("오류")) throw error;
    throw new Error(authMessage(error, "login"));
  } finally {
    if (pendingAuthIntents.get(email) === intent) pendingAuthIntents.delete(email);
  }
}
function applyLoggedOut() {
  const { generation } = claimAuthOwner(null);
  const shouldClearNickname = logoutRequested;
  logoutRequested = false;
  if (appliedAuthGeneration === generation && !state.user && state.authReady) {
    if (shouldClearNickname) localStorage.removeItem("catchGalleryNickname");
    return false;
  }
  appliedAuthGeneration = generation;
  authPreparationPromises.clear();
  setCacheSession(null);
  state.user = null;
  state.isAdmin = false;
  state.authReady = true;
  scoreEl.textContent = "0점";
  localStorage.removeItem("catchGalleryUid");
  if (shouldClearNickname) localStorage.removeItem("catchGalleryNickname");
  const keepLoginForm = state.route === "login" && typeof document !== "undefined" && document.querySelector("#loginForm");
  if (!keepLoginForm) transitionRoute("login", { historyMode: "replace", historyState: { route: "login", galleryDetail: false } });
  return true;
}
async function signOut() {
  logoutRequested = true;
  try { await auth.signOut(); }
  catch (error) { logoutRequested = false; throw error; }
  applyLoggedOut();
}
async function handleAuthState(firebaseUser) {
  if (!firebaseUser) return applyLoggedOut();
  claimAuthOwner(firebaseUser);
  try {
    return await prepareAuthSession(firebaseUser);
  } catch (error) {
    const current = authOwnerUid === firebaseUser.uid && auth?.currentUser?.uid === firebaseUser.uid;
    if (!current) return null;
    console.error(error);
    if (pendingAuthIntents.has(authEmailKey(firebaseUser))) return null;
    showToast(userErrorMessage(error));
    try { await auth.signOut(); } catch (_) {}
    applyLoggedOut();
    return null;
  }
}
async function boot() {
  initFirebase();
  loading();
  auth.onAuthStateChanged(firebaseUser => { handleAuthState(firebaseUser).catch(console.error); });
}

function claimScore(claim) { return typeof claim === "number" ? claim : Number(claim?.score) || 0; }
function sumClaims(claims) { return Object.values(safeObject(claims)).reduce((sum, claim) => sum + claimScore(claim), 0); }
function claimType(claim, drawing, userId) {
  if (claim && typeof claim === "object" && ["drawer", "solver"].includes(claim.type)) return claim.type;
  if (drawing?.solverId === userId) return "solver";
  if (drawingOwnerId(drawing) === userId) return "drawer";
  return null;
}
async function loadUserScore(uid) { return sumClaims((await db.ref(`scoreClaims/${uid}`).once("value")).val()); }
function recentSolverSuccessCount(claims, now = serverNow()) {
  return Object.values(safeObject(claims)).filter(claim => claim && typeof claim === "object" && claim.type === "solver" && Number(claim.createdAt) >= now - 3600000 && Number(claim.createdAt) <= now + 60000).length;
}
async function loadRecentSolverSuccessCount(uid = state.user?.id) {
  if (!uid) return 0;
  return recentSolverSuccessCount((await db.ref(`scoreClaims/${uid}`).once("value")).val());
}
function solverBaseReward(successCount) { return successCount >= 10 ? 0 : successCount >= 5 ? 5 : 10; }
function solverRewardFor(successCount, hintUsed) { return Math.max(0, solverBaseReward(successCount) - (hintUsed ? 4 : 0)); }
function solverRewardHtml(successCount, hintUsed = false) {
  const reward = solverRewardFor(successCount, hintUsed);
  if (successCount >= 10) return `<b>지금 맞혀도 랭킹 점수는 오르지 않아요.</b><small>최근 1시간 동안 정답을 많이 맞혔어요. 정답 확인은 계속할 수 있어요!</small>`;
  if (successCount >= 5) return `<b>지금 맞히면 +${reward}점!</b><small>최근 1시간 동안 정답을 여러 개 맞혀 보상이 조금 줄었어요. 계속 맞힐 수 있어요!</small>`;
  return `<b>지금 맞히면 +${reward}점!</b>${hintUsed ? "<small>카테고리 힌트 사용으로 4점이 줄었어요.</small>" : ""}`;
}

function renderRoute(_options = {}, _transitionId = routeTransitionId) {
  const publicRoute = state.route === "login";
  headerEl.classList.toggle("hidden", publicRoute);
  if (!publicRoute && !state.user) {
    state.route = "login";
    setDrawViewportMode(false);
    return renderLogin();
  }
  const routes = { login: renderLogin, home: renderHome, draw: renderDraw, solve: renderSolve, gallery: renderGallery, ranking: renderRanking, manage: renderManage, guide: renderGuide, feedback: renderFeedback };
  (routes[state.route] || renderHome)();
}
function renderLogin() {
  appEl.innerHTML = `<section class="screen center-screen"><div class="welcome-art">🖼️</div><div style="text-align:center"><h1>캐치갤러리</h1><p class="subtitle">닉네임과 비밀번호로 로그인해요!</p></div><form id="loginForm" class="card"><label class="field-label" for="nickname">닉네임</label><input id="nickname" maxlength="8" autocomplete="username" placeholder="닉네임 입력" required><label class="field-label" for="password">비밀번호</label><input id="password" type="password" minlength="6" autocomplete="current-password" placeholder="6자 이상" required><p class="password-warning">평소 쓰는 비밀번호를 사용하지 마세요.</p><p class="helper">같은 닉네임과 비밀번호로 다른 기기에서도 기록을 이어갈 수 있습니다.</p><div class="login-actions"><button id="loginButton" class="button primary full" type="submit">로그인</button><button id="signupButton" class="button ghost signup-open-button" type="button">처음이신가요? 회원가입</button></div></form></section>`;
  const form = document.querySelector("#loginForm");
  const nameInput = document.querySelector("#nickname");
  const passwordInput = document.querySelector("#password");
  const loginButton = document.querySelector("#loginButton");
  const signupButton = document.querySelector("#signupButton");
  nameInput.value = localStorage.getItem("catchGalleryNickname") || "";
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (loginButton.disabled) return;
    loginButton.disabled = signupButton.disabled = true;
    loginButton.textContent = "로그인 중…";
    try {
      await signIn(nameInput.value, passwordInput.value);
    } catch (error) {
      showToast(userErrorMessage(error, "로그인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요."));
    } finally {
      loginButton.disabled = signupButton.disabled = false;
      loginButton.textContent = "로그인";
    }
  });
  signupButton.onclick = openSignupModal;
}
function openSignupModal() {
  const root = document.querySelector("#modalRoot");
  root.innerHTML = `<div class="modal-backdrop signup-backdrop"><div class="modal signup-modal" role="dialog" aria-modal="true" aria-labelledby="signupTitle"><h3 id="signupTitle">회원가입</h3><form id="signupForm"><label class="field-label" for="signupNickname">닉네임</label><input id="signupNickname" maxlength="8" autocomplete="username" placeholder="닉네임 입력" required><label class="field-label" for="signupPassword">비밀번호</label><input id="signupPassword" type="password" minlength="6" autocomplete="new-password" placeholder="6자 이상" required><label class="field-label" for="signupPasswordConfirm">비밀번호 확인</label><input id="signupPasswordConfirm" type="password" minlength="6" autocomplete="new-password" placeholder="비밀번호 다시 입력" required><p class="password-warning">자주 쓰는 비밀번호는 사용하지 마세요.</p><div class="button-row"><button class="button ghost" type="button" data-signup-cancel>취소</button><button id="signupCompleteButton" class="button primary" type="submit">회원가입 완료</button></div></form></div></div>`;
  const form = root.querySelector("#signupForm");
  const nickname = root.querySelector("#signupNickname");
  const password = root.querySelector("#signupPassword");
  const passwordConfirm = root.querySelector("#signupPasswordConfirm");
  const completeButton = root.querySelector("#signupCompleteButton");
  const close = () => {
    document.removeEventListener("keydown", onKeydown);
    root.innerHTML = "";
    document.querySelector("#signupButton")?.focus();
  };
  const onKeydown = event => { if (event.key === "Escape") close(); };
  root.querySelector("[data-signup-cancel]").onclick = close;
  root.querySelector(".signup-backdrop").onclick = event => { if (event.target === event.currentTarget) close(); };
  document.addEventListener("keydown", onKeydown);
  form.onsubmit = async event => {
    event.preventDefault();
    if (completeButton.disabled) return;
    if (password.value !== passwordConfirm.value) {
      showToast("비밀번호가 서로 달라요. 다시 확인해 주세요.");
      passwordConfirm.focus();
      return;
    }
    completeButton.disabled = true;
    completeButton.textContent = "가입하는 중…";
    try {
      await signUp(nickname.value, password.value);
      close();
    } catch (error) {
      showToast(userErrorMessage(error, "회원가입 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요."));
      completeButton.disabled = false;
      completeButton.textContent = "회원가입 완료";
    }
  };
  nickname.focus();
}
function renderHome() {
  scoreEl.textContent = `${state.user.score || 0}점`;
  appEl.innerHTML = `<section class="screen"><div class="home-greeting"><h2>${escapeHtml(state.user.nickname)}님, 반가워요!</h2><p class="muted">그림을 그리고, 다른 사람의 그림도 맞혀보세요.</p></div><div class="main-actions"><button class="main-action draw" data-route="draw"><span class="action-icon">✏️</span><span class="action-title">그림 그리기</span><span class="action-copy">제시어를 그림으로 표현해요</span></button><button class="main-action solve" data-route="solve"><span class="action-icon">🔍</span><span class="action-title">정답 맞히기</span><span class="action-copy">이 그림은 무엇일까요?</span></button></div><div class="sub-actions"><button class="sub-action" data-route="gallery"><span>🖼️</span>전시장</button><button class="sub-action" data-route="ranking"><span>🏆</span>랭킹</button><button class="sub-action" data-route="manage"><span>🗂️</span>내 그림 관리</button><button class="sub-action" data-route="guide"><span>📖</span>게임설명</button><button class="sub-action feedback-menu" data-route="feedback"><span>💌</span>의견 보내기</button></div><button id="logoutButton" class="button ghost full logout-button">로그아웃</button><div class="home-version" aria-label="앱 버전">v1.4.0</div></section>`;
  document.querySelector("#logoutButton").onclick = async event => {
    const button = event.currentTarget;
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = "로그아웃 중…";
    try { await signOut(); }
    catch (error) { showToast(userErrorMessage(error)); button.disabled = false; button.textContent = "로그아웃"; }
  };
}

function renderDraw() {
  const previousCanvasInputCleanup = state.canvasInputCleanup;
  state.canvasInputCleanup = null;
  previousCanvasInputCleanup?.();
  if (!state.word) randomWord();
  const edit = state.editDrawing;
  const wordActions = edit ? "" : '<div class="word-actions"><button id="nextWord" class="button ghost">다른 제시어</button><button id="customWordButton" class="button ghost" aria-expanded="false">직접 제시어</button></div>';
  const customForm = edit ? "" : `<form id="customWordForm" class="custom-word-form hidden"><div class="custom-fields"><label>카테고리<input id="customCategory" maxlength="20" required placeholder="예: 음식"></label><label>제시어<input id="customWord" maxlength="12" required placeholder="예: 계란후라이"></label></div><label class="answer-label"><span>허용 정답 <button id="answerHelpButton" class="answer-help-button" type="button" aria-label="허용 정답 설명 보기" aria-expanded="false">?</button></span><input id="customAnswers" placeholder="달걀후라이, 계란프라이"></label><div id="answerHelp" class="answer-help hidden"><b>허용 정답이란?</b><br>정답은 맞지만 다르게 부를 수 있는 말을 적는 곳이에요.<br>예: 제시어가 ‘계란후라이’라면 ‘달걀후라이, 계란프라이’도 정답으로 인정할 수 있어요.<br>쉼표로 나누어 적어주세요.</div><button class="button secondary full" type="submit">이 제시어 사용하기</button></form>`;
  const shownAnswers = !edit && state.word.isCustomWord && state.word.answers.length > 1 ? `<small class="custom-answer-summary">허용 정답: ${state.word.answers.slice(1).map(escapeHtml).join(", ")}</small>` : "";
  appEl.innerHTML = `<section class="screen draw-screen"><div class="section-head"><div><h2>${edit ? "그림 수정하기" : "그림 그리기"}</h2><p class="muted">손가락으로 마음껏 그려요.</p></div>${wordActions}</div><div class="card word-card"><span class="category">${escapeHtml(edit?.category || state.word.category)}</span><div class="word">${escapeHtml(edit?.word || state.word.word)}</div>${shownAnswers}</div>${customForm}<div class="canvas-stage"><div class="canvas-wrap"><canvas id="drawingCanvas" width="720" height="720" aria-label="그림판"></canvas><canvas id="metallicPreviewCanvas" width="720" height="720" aria-hidden="true"></canvas></div></div><div class="tools"><div class="drawing-palette"><div class="colors">${DRAWING_COLORS.map(([value, name, brush], i) => { const special = brush !== "solid"; const label = `${name} ${special ? "특수 브러시" : "색연필"}`; return `<button class="color ${special ? "metallic-color " : ""}${i === DEFAULT_DRAWING_COLOR_INDEX ? "selected" : ""}" data-color="${value}" data-brush="${brush}" style="--swatch-color:${value}" aria-label="${label}" title="${label}" aria-pressed="${i === DEFAULT_DRAWING_COLOR_INDEX ? "true" : "false"}"></button>`; }).join("")}</div><button id="eraser" class="button ghost eraser-button" aria-pressed="false">지우개</button></div><div class="tool-grid"><div class="brush-size-control"><output id="brushSizeValue" class="brush-size-value" for="brushSize" aria-hidden="true">9(기본)</output><input id="brushSize" type="range" min="3" max="34" value="9" aria-label="붓 굵기" aria-valuetext="9, 기본 굵기"></div><button id="undo" class="button ghost">되돌리기</button><button id="clearCanvas" class="button ghost">전체 지우기</button></div></div><div class="notice">${edit ? "정답이 맞혀지면 그린 사람에게 30점!" : "누군가 정답을 맞히면 그린 사람에게 30점이 들어와요."}</div><button id="saveDrawing" class="button primary full">${edit ? "수정 저장하기" : "게시하기"}</button></section>`;
  setupCanvas(edit?.imageData);
  document.querySelectorAll(".color").forEach(button => button.onclick = () => selectDrawingColor(button));
  eraser.onclick = () => {
    state.ctx.globalCompositeOperation = "destination-out";
    state.currentBrushKind = "eraser";
    document.querySelectorAll(".color").forEach(button => { button.classList.remove("selected"); button.setAttribute("aria-pressed", "false"); });
    eraser.classList.add("active");
    eraser.setAttribute("aria-pressed", "true");
  };
  undo.onclick = undoCanvas;
  clearCanvas.onclick = openClearCanvasModal;
  if (!edit) nextWord.onclick = () => {
    if (state.dirty && !confirm("그림을 지우고 다른 제시어를 받을까요?")) return;
    randomWord();
    renderDraw();
  };
  if (!edit) {
    customWordButton.onclick = () => {
      const opening = customWordForm.classList.contains("hidden");
      customWordForm.classList.toggle("hidden", !opening);
      document.querySelector(".draw-screen").classList.toggle("custom-word-open", opening);
      if (!opening) document.querySelector(".draw-screen").scrollTop = 0;
      customWordButton.setAttribute("aria-expanded", String(opening));
      if (opening) customCategory.focus();
    };
    answerHelpButton.onclick = () => {
      const opening = answerHelp.classList.contains("hidden");
      answerHelp.classList.toggle("hidden", !opening);
      answerHelpButton.setAttribute("aria-expanded", String(opening));
    };
    customWordForm.onsubmit = event => {
      event.preventDefault();
      const category = customCategory.value.trim();
      const word = customWord.value.trim();
      const rawAnswers = customAnswers.value.split(",").map(value => value.trim()).filter(Boolean);
      if (!isValidCategory(category)) return showToast("카테고리는 1~20자로 입력하고 특수문자 없이 작성해 주세요.");
      if (textLength(word) < 1 || textLength(word) > 12) return showToast("제시어는 1~12자로 입력해 주세요.");
      if (rawAnswers.length > 5) return showToast("허용 정답은 최대 5개까지 입력할 수 있어요.");
      if (rawAnswers.some(value => textLength(value) < 1 || textLength(value) > 12)) return showToast("허용 정답은 각각 1~12자로 입력해 주세요.");
      const answers = [word, ...rawAnswers].filter((value, index, list) => list.findIndex(item => normalizeAnswer(item) === normalizeAnswer(value)) === index);
      state.word = { category, word, answers, isCustomWord: true };
      document.querySelector(".word-card .category").textContent = category;
      document.querySelector(".word-card .word").textContent = word;
      document.querySelector(".custom-answer-summary")?.remove();
      if (answers.length > 1) document.querySelector(".word-card").insertAdjacentHTML("beforeend", `<small class="custom-answer-summary">허용 정답: ${answers.slice(1).map(escapeHtml).join(", ")}</small>`);
      customWordForm.classList.add("hidden");
      const drawScreen = document.querySelector(".draw-screen");
      drawScreen.classList.remove("custom-word-open");
      drawScreen.scrollTop = 0;
      customWordButton.setAttribute("aria-expanded", "false");
      showToast("직접 제시어를 적용했어요!");
    };
  }
  saveDrawing.onclick = () => saveDrawingDraft(edit, saveDrawing);
}

async function saveDrawingDraft(edit, saveButton) {
  if (state.publishing || state.drawingPublished) return "ignored";
  if (!state.dirty) {
    showToast(edit ? "그림을 조금 수정해 주세요." : "빈 그림은 게시할 수 없어요.");
    return "invalid";
  }
  const operationId = ++state.saveOperationId;
  const transitionId = routeTransitionId;
  const canvas = state.canvas;
  const ownsOperation = () => state.activeSaveOperationId === operationId && isTransitionCurrent(transitionId, "draw") && state.canvas === canvas;
  state.activeSaveOperationId = operationId;
  state.publishing = true;
  saveButton.disabled = true;
  saveButton.textContent = "저장하는 중…";
  let published = false;
  try {
    if (edit) {
      const savedImages = await updateDrawing(edit.id);
      if (!ownsOperation()) return "cancelled";
      if (savedImages) {
        state.detailImageCache.set(edit.id, savedImages.imageData);
        state.thumbnailCache.set(edit.id, savedImages.thumbnailData);
      }
      state.editDrawing = null;
      state.word = null;
      showToast("수정했어요!");
      route("manage");
    } else {
      const savedDrawing = await publishDrawing();
      if (!ownsOperation()) return "cancelled";
      if (savedDrawing) {
        state.detailImageCache.set(savedDrawing.id, savedDrawing.imageData);
        state.thumbnailCache.set(savedDrawing.id, savedDrawing.thumbnailData);
      }
      state.drawingPublished = true;
      published = true;
    }
  } catch (error) {
    console.error("그림 저장 실패:", error?.code || "unknown", error);
    if (!ownsOperation()) return "cancelled";
    showToast(userErrorMessage(error, "그림을 저장하지 못했어요. 입력한 내용은 그대로 있으니 다시 시도해 주세요."));
    saveButton.disabled = false;
    saveButton.textContent = edit ? "수정 저장하기" : "게시하기";
    return "failed";
  } finally {
    if (ownsOperation()) {
      state.publishing = false;
      state.activeSaveOperationId = null;
    }
  }
  if (published) {
    showDrawingPublishedModal();
    return "published";
  }
  return "updated";
}

function showDrawingPublishedModal() {
  const root = document.querySelector("#modalRoot");
  root.innerHTML = `<div class="modal-backdrop publish-complete-backdrop"><div class="modal publish-complete-modal" role="dialog" aria-modal="true" aria-labelledby="publishCompleteTitle"><h3 id="publishCompleteTitle">그림을 게시했어요! 🎉</h3><p>다음에는 무엇을 할까요?</p><div class="publish-complete-actions"><button class="button primary full" data-draw-again>다른 그림 그리기</button><button class="button ghost full" data-go-manage>내 그림 관리</button></div></div></div>`;
  const buttons = [...root.querySelectorAll("button")];
  let handled = false;
  const choose = destination => {
    if (handled || !state.drawingPublished) return;
    handled = true;
    buttons.forEach(button => { button.disabled = true; });
    root.innerHTML = "";
    if (destination === "draw") startNewDrawing({ preserveSeenWords: true });
    else {
      resetDrawingDraft();
      route("manage");
    }
  };
  root.querySelector("[data-draw-again]").onclick = () => choose("draw");
  root.querySelector("[data-go-manage]").onclick = () => choose("manage");
  root.querySelector("[data-draw-again]").focus();
}

function preventIfCancelable(event) { if (event && event.cancelable) event.preventDefault(); }
const CANVAS_TOUCH_LOCK_CLASS = "canvas-touch-session-lock";
function setCanvasTouchDocumentLock(locked) {
  document.documentElement?.classList.toggle(CANVAS_TOUCH_LOCK_CLASS, !!locked);
  document.body?.classList.toggle(CANVAS_TOUCH_LOCK_CLASS, !!locked);
}
function cancelCanvasTouchFallbackCleanup() {
  if (!state.canvasTouchCleanupTimer) return;
  window.clearTimeout(state.canvasTouchCleanupTimer);
  state.canvasTouchCleanupTimer = null;
}
function lockCanvasTouchSession() {
  if (state.canvasTouchLock) return false;
  cancelCanvasTouchFallbackCleanup();
  const body = document.body;
  const scrollX = Number.isFinite(Number(window.scrollX)) ? Number(window.scrollX) : 0;
  const scrollY = Number.isFinite(Number(window.scrollY)) ? Number(window.scrollY) : 0;
  const lock = {
    scrollX, scrollY,
    bodyStyle: {
      position: body.style.position, top: body.style.top, left: body.style.left,
      right: body.style.right, width: body.style.width
    }
  };
  state.canvasTouchLock = lock;
  setCanvasTouchDocumentLock(true);
  body.style.position = "fixed";
  body.style.top = `${-scrollY}px`;
  body.style.left = scrollX ? `${-scrollX}px` : "0px";
  body.style.right = "0px";
  body.style.width = "100%";
  return true;
}
function clearCanvasTouchSession() {
  cancelCanvasTouchFallbackCleanup();
  state.canvasTouchIdentifiers?.clear();
  const lock = state.canvasTouchLock;
  state.canvasTouchLock = null;
  setCanvasTouchDocumentLock(false);
  if (!lock) return false;
  const body = document.body;
  Object.assign(body.style, lock.bodyStyle);
  if (Number.isFinite(lock.scrollX) && Number.isFinite(lock.scrollY) && (window.scrollX !== lock.scrollX || window.scrollY !== lock.scrollY)) window.scrollTo(lock.scrollX, lock.scrollY);
  return true;
}
function canvasTouchPointersIdle() {
  return state.activePointerId === null && !state.canvasGestureActive && !state.canvasGesturePointers?.size && !state.canvasGestureSuppressedPointers?.size;
}
function scheduleCanvasTouchFallbackCleanup() {
  if (!state.canvasTouchLock || !canvasTouchPointersIdle()) return false;
  cancelCanvasTouchFallbackCleanup();
  const lock = state.canvasTouchLock;
  state.canvasTouchCleanupTimer = window.setTimeout(() => {
    state.canvasTouchCleanupTimer = null;
    if (state.canvasTouchLock === lock && canvasTouchPointersIdle()) clearCanvasTouchSession();
  }, 120);
  return true;
}
function eventTargetsCanvas(event, canvas = state.canvas) {
  if (!canvas || !event) return false;
  if (typeof event.composedPath === "function") {
    try { if (event.composedPath().includes(canvas)) return true; }
    catch (_) {}
  }
  return event.target === canvas || !!canvas.contains?.(event.target);
}
function changedTouchIdentifiers(event) {
  return Array.from(event?.changedTouches || [], touch => touch?.identifier).filter(identifier => identifier !== undefined && identifier !== null);
}
function bindDocumentDrawingScrollBlocker() {
  if (window.__catchGalleryDrawingScrollBlockerBound) return;
  const identifiers = () => state.canvasTouchIdentifiers ||= new Set();
  const start = event => {
    const active = identifiers();
    if (state.route !== "draw" || (!active.size && !eventTargetsCanvas(event))) return;
    preventIfCancelable(event);
    const wasEmpty = active.size === 0;
    changedTouchIdentifiers(event).forEach(identifier => active.add(identifier));
    if (active.size) cancelCanvasTouchFallbackCleanup();
    if (wasEmpty && active.size) lockCanvasTouchSession();
  };
  const move = event => {
    if (state.route === "draw" && identifiers().size) preventIfCancelable(event);
  };
  const end = event => {
    const active = identifiers();
    if (!active.size) return;
    preventIfCancelable(event);
    const ended = changedTouchIdentifiers(event);
    if (ended.length) ended.forEach(identifier => active.delete(identifier));
    else active.clear();
    if (!active.size) clearCanvasTouchSession();
  };
  const gesture = event => {
    if (state.route === "draw" && (identifiers().size || eventTargetsCanvas(event))) preventIfCancelable(event);
  };
  document.addEventListener("touchstart", start, { passive: false, capture: true });
  document.addEventListener("touchmove", move, { passive: false, capture: true });
  document.addEventListener("touchend", end, { passive: false, capture: true });
  document.addEventListener("touchcancel", end, { passive: false, capture: true });
  document.addEventListener("gesturestart", gesture, { passive: false, capture: true });
  window.__catchGalleryDrawingScrollBlockerBound = true;
}
function releaseCanvasHistory() {
  state.canvasInputCleanup?.();
  state.canvasInputCleanup = null;
  if (typeof clearCanvasTouchSession === "function") clearCanvasTouchSession();
  if (state.historyBaseCanvas) {
    state.historyBaseCanvas.width = 0;
    state.historyBaseCanvas.height = 0;
  }
  state.history = [];
  state.historyBaseCanvas = null;
  state.historyBaseContext = null;
  state.historyBaseReady = false;
  state.historyBaseHasContent = false;
  state.historyRedrawPending = false;
  state.activeStroke = null;
  state.canvasRect = null;
  state.brushInput = null;
  state.currentBrushKind = "solid";
  state.strokeSeedCounter = 0;
  state.metallicPreviewCanvas = null;
  state.metallicPreviewContext = null;
  state.metallicPreviewFrame = 0;
  state.drawing = false;
  state.activePointerId = null;
  state.activePointerType = null;
  state.activePointerStartedAt = null;
  state.activePointerLastEventAt = null;
  state.activePointerCaptured = false;
  state.canvasZoomScale = 1;
  state.canvasZoomX = 0;
  state.canvasZoomY = 0;
  state.canvasGestureActive = false;
  state.canvasGesturePointers = new Map();
  state.canvasGestureSuppressedPointers = new Set();
}
function initializeCanvasHistory(canvas, baseReady = true) {
  releaseCanvasHistory();
  const baseCanvas = document.createElement("canvas");
  baseCanvas.width = canvas.width;
  baseCanvas.height = canvas.height;
  state.historyBaseCanvas = baseCanvas;
  state.historyBaseContext = baseCanvas.getContext("2d");
  state.historyBaseReady = baseReady;
  state.historyBaseHasContent = false;
}
function seededCanvasRandom(seed) {
  let value = (Number(seed) >>> 0) || 0x6d2b79f5;
  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ mixed >>> 15, mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ mixed >>> 7, mixed | 61);
    return ((mixed ^ mixed >>> 14) >>> 0) / 4294967296;
  };
}
function drawStrokePath(context, points, width, color) {
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = Math.max(1, width);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  if (points.length === 1) {
    context.arc(points[0].x, points[0].y, Math.max(0.5, width / 2), 0, Math.PI * 2);
    context.fill();
  } else {
    context.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) context.lineTo(point.x, point.y);
    context.stroke();
  }
  context.closePath();
}
function canvasPathMetrics(points) {
  const segments = [];
  let total = 0;
  for (let index = 1; index < points.length; index++) {
    const from = points[index - 1];
    const to = points[index];
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    if (!(length > 0)) continue;
    segments.push({ from, to, start: total, length });
    total += length;
  }
  return { segments, total };
}
function pointAlongCanvasPath(metrics, distance, fallback) {
  if (!metrics.segments.length) return { x: fallback.x, y: fallback.y, nx: 0, ny: -1 };
  const safeDistance = Math.min(metrics.total, Math.max(0, distance));
  const segment = metrics.segments.find(item => safeDistance <= item.start + item.length) || metrics.segments[metrics.segments.length - 1];
  const ratio = Math.min(1, Math.max(0, (safeDistance - segment.start) / segment.length));
  const dx = segment.to.x - segment.from.x;
  const dy = segment.to.y - segment.from.y;
  return { x: segment.from.x + dx * ratio, y: segment.from.y + dy * ratio, nx: -dy / segment.length, ny: dx / segment.length };
}
function drawMetallicSparkle(context, point, radius, color, star) {
  context.fillStyle = color;
  context.beginPath();
  if (star) {
    context.moveTo(point.x, point.y - radius * 1.8);
    context.lineTo(point.x + radius * 0.42, point.y - radius * 0.42);
    context.lineTo(point.x + radius * 1.8, point.y);
    context.lineTo(point.x + radius * 0.42, point.y + radius * 0.42);
    context.lineTo(point.x, point.y + radius * 1.8);
    context.lineTo(point.x - radius * 0.42, point.y + radius * 0.42);
    context.lineTo(point.x - radius * 1.8, point.y);
    context.lineTo(point.x - radius * 0.42, point.y - radius * 0.42);
    context.closePath();
  } else {
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
  }
  context.fill();
}
function drawMetallicStroke(context, action, options) {
  const sparkles = options?.sparkles !== false;
  const style = METALLIC_BRUSHES[action.brushKind];
  if (!style) return false;
  const points = action.points;
  const width = Math.max(3, Number(action.width) || 9);
  context.save();
  context.globalCompositeOperation = action.compositeOperation || "source-over";
  context.globalAlpha = 1;
  drawStrokePath(context, points, width, style.shadow);
  drawStrokePath(context, points, width * 0.82, style.base);
  context.globalAlpha = 0.82;
  drawStrokePath(context, points, Math.max(1.2, width * 0.27), style.highlight);
  if (sparkles) {
    const random = seededCanvasRandom(action.seed);
    const metrics = canvasPathMetrics(points);
    const count = Math.min(48, Math.max(1, Math.floor(metrics.total / Math.max(20, width * 1.45)) + 1));
    context.globalAlpha = 0.96;
    for (let index = 0; index < count; index++) {
      const distance = count === 1 ? metrics.total * 0.5 : metrics.total * (index + 0.35 + random() * 0.3) / count;
      const location = pointAlongCanvasPath(metrics, distance, points[0]);
      const offset = (random() - 0.5) * width * 0.7;
      const radius = Math.min(3.2, Math.max(1.15, width * (0.09 + random() * 0.06)));
      drawMetallicSparkle(context, { x: location.x + location.nx * offset, y: location.y + location.ny * offset }, radius, style.sparkle, index % 4 === 0);
    }
  }
  context.restore();
  return true;
}
function applyCanvasAction(context, action) {
  if (!context || !action) return;
  if (action.type === "clear") {
    context.globalCompositeOperation = "source-over";
    context.clearRect(0, 0, 720, 720);
    return;
  }
  if (action.type !== "stroke" || !Array.isArray(action.points) || action.points.length < 1) return;
  if (drawMetallicStroke(context, action)) return;
  context.globalCompositeOperation = action.compositeOperation;
  context.strokeStyle = action.color;
  context.fillStyle = action.color;
  context.lineWidth = action.width;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  if (action.points.length === 1) {
    context.arc(action.points[0].x, action.points[0].y, action.width / 2, 0, Math.PI * 2);
    context.fill();
    context.closePath();
    return;
  }
  context.moveTo(action.points[0].x, action.points[0].y);
  for (const point of action.points.slice(1)) context.lineTo(point.x, point.y);
  context.stroke();
  context.closePath();
}
function compactCanvasHistory() {
  if (!state.historyBaseReady || !state.historyBaseContext) return;
  while (state.history.length > DRAWING_HISTORY_LIMIT) {
    const action = state.history.shift();
    applyCanvasAction(state.historyBaseContext, action);
    state.historyBaseHasContent = canvasContentAfterAction(state.historyBaseHasContent, action);
  }
}
function commitCanvasAction(action) {
  if (!action || (action.type === "stroke" && (!Array.isArray(action.points) || action.points.length < 1))) return false;
  state.history.push(action);
  compactCanvasHistory();
  return true;
}
function redrawCanvasFromHistory() {
  if (!state.ctx || !state.canvas) return;
  const tool = {
    compositeOperation: state.ctx.globalCompositeOperation,
    color: state.ctx.strokeStyle,
    fillColor: state.ctx.fillStyle,
    width: state.ctx.lineWidth
  };
  state.ctx.globalCompositeOperation = "source-over";
  state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
  if (state.historyBaseReady && state.historyBaseCanvas) state.ctx.drawImage(state.historyBaseCanvas, 0, 0);
  state.history.forEach(action => applyCanvasAction(state.ctx, action));
  state.ctx.globalCompositeOperation = tool.compositeOperation;
  state.ctx.strokeStyle = tool.color;
  state.ctx.fillStyle = tool.fillColor;
  state.ctx.lineWidth = tool.width;
  state.ctx.lineCap = "round";
  state.ctx.lineJoin = "round";
  if (!state.activeStroke) state.historyRedrawPending = false;
}
function redrawCanvasWhenIdle() {
  if (state.activeStroke) {
    state.historyRedrawPending = true;
    return false;
  }
  state.historyRedrawPending = false;
  redrawCanvasFromHistory();
  return true;
}
function flushPendingCanvasRedraw() {
  if (!state.historyRedrawPending || state.activeStroke) return false;
  state.historyRedrawPending = false;
  redrawCanvasFromHistory();
  return true;
}
function canvasPoint(event, rect, canvas = state.canvas) {
  return {
    x: (event.clientX - rect.left) * canvas.width / rect.width,
    y: (event.clientY - rect.top) * canvas.height / rect.height
  };
}
function clampCanvasZoom(scale) {
  const value = Number(scale);
  return Number.isFinite(value) ? Math.min(2.5, Math.max(1, value)) : 1;
}
function clampCanvasTransform(scale, x, y, viewportWidth, viewportHeight) {
  const safeScale = clampCanvasZoom(scale);
  const width = Number(viewportWidth);
  const height = Number(viewportHeight);
  if (!(width > 0) || !(height > 0) || safeScale === 1) return { scale: safeScale, x: 0, y: 0 };
  const safeX = Number.isFinite(Number(x)) ? Number(x) : 0;
  const safeY = Number.isFinite(Number(y)) ? Number(y) : 0;
  return {
    scale: safeScale,
    x: Math.min(0, Math.max(width - width * safeScale, safeX)),
    y: Math.min(0, Math.max(height - height * safeScale, safeY))
  };
}
function canvasTouchCenter(points) {
  if (!Array.isArray(points) || points.length !== 2) return null;
  const values = points.map(point => ({ x: Number(point?.x), y: Number(point?.y) }));
  if (values.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) return null;
  return { x: (values[0].x + values[1].x) / 2, y: (values[0].y + values[1].y) / 2 };
}
function canvasTouchDistance(points) {
  if (!Array.isArray(points) || points.length !== 2) return 0;
  const dx = Number(points[1]?.x) - Number(points[0]?.x);
  const dy = Number(points[1]?.y) - Number(points[0]?.y);
  return Number.isFinite(dx) && Number.isFinite(dy) ? Math.hypot(dx, dy) : 0;
}
function calculateCanvasGestureTransform(start, currentPoints, viewportWidth, viewportHeight) {
  const startPoints = start?.points;
  const startCenter = canvasTouchCenter(startPoints);
  const currentCenter = canvasTouchCenter(currentPoints);
  const startDistance = canvasTouchDistance(startPoints);
  const currentDistance = canvasTouchDistance(currentPoints);
  const startScale = clampCanvasZoom(start?.scale);
  if (!startCenter || !currentCenter || !(startDistance > 0) || !(currentDistance > 0)) {
    return clampCanvasTransform(startScale, start?.x, start?.y, viewportWidth, viewportHeight);
  }
  const scale = clampCanvasZoom(startScale * currentDistance / startDistance);
  const anchorX = (startCenter.x - Number(start?.x || 0)) / startScale;
  const anchorY = (startCenter.y - Number(start?.y || 0)) / startScale;
  return clampCanvasTransform(scale, currentCenter.x - anchorX * scale, currentCenter.y - anchorY * scale, viewportWidth, viewportHeight);
}
function sameCanvasPoint(a, b) { return !!a && !!b && a.x === b.x && a.y === b.y; }
function canvasContentAfterAction(hasContent, action) {
  if (!action) return hasContent;
  if (action.type === "clear") return false;
  if (action.type === "stroke" && action.points?.length >= 1 && action.compositeOperation !== "destination-out") return true;
  return hasContent;
}
function canvasHasVisibleContent() {
  let hasContent = !!state.historyBaseHasContent;
  state.history.forEach(action => { hasContent = canvasContentAfterAction(hasContent, action); });
  if (state.activeStroke?.points?.length >= 1) hasContent = canvasContentAfterAction(hasContent, state.activeStroke);
  return hasContent;
}
function safeSetPointerCapture(canvas, pointerId) {
  if (typeof canvas?.setPointerCapture !== "function") return false;
  try { canvas.setPointerCapture(pointerId); return true; }
  catch (error) { console.warn("포인터 캡처를 설정하지 못했습니다.", error); return false; }
}
function safeReleasePointerCapture(canvas, pointerId) {
  if (typeof canvas?.releasePointerCapture !== "function") return false;
  try {
    if (typeof canvas.hasPointerCapture === "function" && !canvas.hasPointerCapture(pointerId)) return false;
    canvas.releasePointerCapture(pointerId);
    return true;
  }
  catch (error) { console.warn("포인터 캡처를 해제하지 못했습니다.", error); return false; }
}
function pointerMoveShowsContactEnded(event) {
  if (event.pointerType === "mouse") return event.buttons === 0;
  if (event.pointerType === "pen") return event.buttons === 0 && event.pressure === 0;
  return false;
}
function setupBrushSizeControl(input) {
  const wrapper = input?.closest?.(".brush-size-control");
  const output = wrapper?.querySelector?.(".brush-size-value");
  if (!input || !wrapper || !output) return () => {};
  const defaultValue = 9;
  let pointerActive = false;
  let keyboardActive = false;
  let disposed = false;
  const update = () => {
    if (disposed) return;
    const min = Number(input.min);
    const max = Number(input.max);
    const value = Number(input.value);
    const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
    const safeProgress = Math.min(100, Math.max(0, progress));
    wrapper.style.setProperty("--brush-progress", `${safeProgress}%`);
    output.value = value === defaultValue ? `${value}(기본)` : String(value);
    input.setAttribute("aria-valuetext", value === defaultValue ? `${value}, 기본 굵기` : String(value));
  };
  const show = () => { if (!disposed) wrapper.classList.add("is-active"); };
  const hide = () => {
    pointerActive = false;
    keyboardActive = false;
    wrapper.classList.remove("is-active");
  };
  const onPointerDown = () => { pointerActive = true; keyboardActive = false; update(); show(); };
  const onInput = () => { update(); if (pointerActive || keyboardActive) show(); };
  const onKeyDown = event => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) return;
    keyboardActive = true;
    pointerActive = false;
    show();
    window.requestAnimationFrame(update);
  };
  const onPointerEnd = () => { if (pointerActive) hide(); };
  const onBlur = () => hide();
  const onVisibility = () => { if (document.visibilityState === "hidden") hide(); };
  input.addEventListener("pointerdown", onPointerDown);
  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onKeyDown);
  input.addEventListener("blur", onBlur);
  window.addEventListener("pointerup", onPointerEnd);
  window.addEventListener("pointercancel", onPointerEnd);
  window.addEventListener("blur", hide);
  window.addEventListener("pagehide", hide);
  window.addEventListener("resize", update);
  window.addEventListener("orientationchange", update);
  document.addEventListener("visibilitychange", onVisibility);
  input.value = String(defaultValue);
  update();
  return () => {
    if (disposed) return;
    disposed = true;
    input.removeEventListener("pointerdown", onPointerDown);
    input.removeEventListener("input", onInput);
    input.removeEventListener("keydown", onKeyDown);
    input.removeEventListener("blur", onBlur);
    window.removeEventListener("pointerup", onPointerEnd);
    window.removeEventListener("pointercancel", onPointerEnd);
    window.removeEventListener("blur", hide);
    window.removeEventListener("pagehide", hide);
    window.removeEventListener("resize", update);
    window.removeEventListener("orientationchange", update);
    document.removeEventListener("visibilitychange", onVisibility);
    hide();
  };
}
function setupCanvas(imageData) {
  if (typeof clearCanvasTouchSession === "function") clearCanvasTouchSession();
  bindDocumentDrawingScrollBlocker();
  state.canvas = document.querySelector("#drawingCanvas");
  state.ctx = state.canvas.getContext("2d");
  state.ctx.lineCap = "round";
  state.ctx.lineJoin = "round";
  state.ctx.globalCompositeOperation = "source-over";
  state.ctx.strokeStyle = "#3e3a48";
  state.ctx.lineWidth = 9;
  state.currentBrushKind = "solid";
  state.strokeSeedCounter = 0;
  initializeCanvasHistory(state.canvas, !imageData);
  state.brushInput = document.querySelector("#brushSize");
  const releaseBrushSizeControl = typeof setupBrushSizeControl === "function" ? setupBrushSizeControl(state.brushInput) : () => {};
  state.dirty = false;

  const canvas = state.canvas;
  const context = state.ctx;
  const previewCanvas = document.querySelector("#metallicPreviewCanvas");
  const previewContext = previewCanvas?.getContext("2d") || null;
  state.metallicPreviewCanvas = previewCanvas;
  state.metallicPreviewContext = previewContext;
  state.metallicPreviewFrame = 0;
  if (previewContext) {
    previewContext.lineCap = "round";
    previewContext.lineJoin = "round";
  }
  const viewport = canvas.closest?.(".canvas-wrap") || canvas.parentElement;
  const ownsCanvas = () => state.route === "draw" && state.canvas === canvas && state.ctx === context && state.metallicPreviewCanvas === previewCanvas && canvas.isConnected && !!previewCanvas?.isConnected;
  let inputDisposed = false;
  let activeStrokeInitialDirty = false;
  let gestureStart = null;
  let gesturePointerIds = [];
  let resizeObserver = null;
  let viewportFrame = 0;
  let metallicPreviewFrame = 0;
  const eventTime = event => Number.isFinite(event?.timeStamp) ? event.timeStamp : null;
  const viewportSize = () => ({ width: Number(viewport?.clientWidth || canvas.clientWidth || 0), height: Number(viewport?.clientHeight || canvas.clientHeight || 0) });
  const applyCanvasTransform = transform => {
    const size = viewportSize();
    const safe = clampCanvasTransform(transform?.scale, transform?.x, transform?.y, size.width, size.height);
    state.canvasZoomScale = safe.scale;
    state.canvasZoomX = safe.x;
    state.canvasZoomY = safe.y;
    const canvasTransform = safe.scale === 1 && safe.x === 0 && safe.y === 0
      ? ""
      : `translate(${safe.x}px, ${safe.y}px) scale(${safe.scale})`;
    [canvas, previewCanvas].filter(Boolean).forEach(layer => {
      layer.style.transformOrigin = "0 0";
      layer.style.transform = canvasTransform;
    });
    return safe;
  };
  const viewportPoint = event => {
    const rect = viewport.getBoundingClientRect();
    return { x: event.clientX - rect.left - Number(viewport.clientLeft || 0), y: event.clientY - rect.top - Number(viewport.clientTop || 0) };
  };
  const gesturePoints = () => gesturePointerIds.map(id => state.canvasGesturePointers.get(id)).filter(Boolean);
  const cancelMetallicPreviewFrame = () => {
    if (metallicPreviewFrame) window.cancelAnimationFrame(metallicPreviewFrame);
    metallicPreviewFrame = 0;
    state.metallicPreviewFrame = 0;
  };
  const clearMetallicPreview = () => {
    cancelMetallicPreviewFrame();
    previewContext?.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  };
  const renderMetallicPreview = () => {
    metallicPreviewFrame = 0;
    state.metallicPreviewFrame = 0;
    if (inputDisposed || !ownsCanvas() || !previewContext) return false;
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    if (!state.activeStroke || !METALLIC_BRUSHES[state.activeStroke.brushKind]) return false;
    drawMetallicStroke(previewContext, state.activeStroke, { sparkles: false });
    return true;
  };
  const scheduleMetallicPreview = () => {
    if (metallicPreviewFrame || inputDisposed || !previewContext) return false;
    metallicPreviewFrame = window.requestAnimationFrame(renderMetallicPreview);
    state.metallicPreviewFrame = metallicPreviewFrame;
    return true;
  };
  const clearActivePointer = () => {
    clearMetallicPreview();
    state.drawing = false;
    state.activePointerId = null;
    state.activePointerType = null;
    state.activePointerStartedAt = null;
    state.activePointerLastEventAt = null;
    state.activePointerCaptured = false;
    state.activeStroke = null;
    state.canvasRect = null;
  };
  const finish = (event, { releaseCapture = false, commit = true, commitDot = false } = {}) => {
    if (inputDisposed || !ownsCanvas()) return false;
    const pointerId = event?.pointerId ?? state.activePointerId;
    if (pointerId !== state.activePointerId || !state.activeStroke) return false;
    if (state.drawing && event) preventIfCancelable(event);
    const stroke = state.activeStroke;
    clearActivePointer();
    context.closePath();
    let committed = false;
    if (commit && (stroke.points.length > 1 || commitDot)) {
      if (stroke.points.length === 1 && !METALLIC_BRUSHES[stroke.brushKind]) applyCanvasAction(context, stroke);
      committed = commitCanvasAction(stroke);
      if (committed) state.dirty = true;
    }
    if (committed && METALLIC_BRUSHES[stroke.brushKind]) redrawCanvasFromHistory();
    else flushPendingCanvasRedraw();
    if (releaseCapture) safeReleasePointerCapture(canvas, pointerId);
    return true;
  };
  const cancelStrokeForGesture = () => {
    if (state.activePointerType !== "touch" || !state.activeStroke) return false;
    const dirty = activeStrokeInitialDirty;
    const metallic = !!METALLIC_BRUSHES[state.activeStroke.brushKind];
    const pending = state.historyRedrawPending;
    finish(null, { releaseCapture: false, commit: false });
    state.dirty = dirty;
    if (!metallic && !pending) redrawCanvasFromHistory();
    return true;
  };
  const beginGesture = event => {
    const firstId = state.activePointerId;
    if (state.activePointerType !== "touch" || firstId === null || !state.canvasGesturePointers.has(firstId)) return false;
    cancelStrokeForGesture();
    state.canvasGesturePointers.set(event.pointerId, viewportPoint(event));
    gesturePointerIds = [firstId, event.pointerId];
    gesturePointerIds.forEach(id => state.canvasGestureSuppressedPointers.add(id));
    const points = gesturePoints();
    if (points.length !== 2 || !(canvasTouchDistance(points) > 0)) {
      gesturePointerIds = [];
      return false;
    }
    state.canvasGestureActive = true;
    const size = viewportSize();
    gestureStart = { points, scale: state.canvasZoomScale, x: state.canvasZoomX, y: state.canvasZoomY, ...size };
    safeSetPointerCapture(canvas, event.pointerId);
    return true;
  };
  const finishGesturePointer = event => {
    const id = event?.pointerId;
    if (!state.canvasGestureSuppressedPointers.has(id)) return false;
    preventIfCancelable(event);
    state.canvasGesturePointers.delete(id);
    state.canvasGestureSuppressedPointers.delete(id);
    safeReleasePointerCapture(canvas, id);
    if (gesturePointerIds.includes(id)) {
      state.canvasGestureActive = false;
      gestureStart = null;
      gesturePointerIds = [];
    }
    if (state.canvasGestureSuppressedPointers.size === 0) state.canvasGesturePointers.clear();
    return true;
  };
  const start = event => {
    const now = eventTime(event);
    const recentPenPalm = state.activePointerType === "pen" && event.pointerType === "touch" &&
      now !== null && state.activePointerLastEventAt !== null && now >= state.activePointerLastEventAt &&
      now - state.activePointerLastEventAt < PEN_TOUCH_TAKEOVER_DELAY_MS;
    if (recentPenPalm) {
      preventIfCancelable(event);
      return;
    }
    if (event.pointerType === "touch") {
      preventIfCancelable(event);
      if (event.isPrimary !== false && ownsCanvas() && eventTargetsCanvas(event, canvas) &&
        state.activePointerType !== "touch" && !state.canvasGestureActive && !state.canvasGestureSuppressedPointers.size) {
        lockCanvasTouchSession();
      }
      if (state.activePointerType !== "pen") {
        if (state.canvasGestureActive || state.canvasGestureSuppressedPointers.size) {
          state.canvasGesturePointers.set(event.pointerId, viewportPoint(event));
          state.canvasGestureSuppressedPointers.add(event.pointerId);
          safeSetPointerCapture(canvas, event.pointerId);
          return;
        }
        if (state.activePointerType === "touch" && event.pointerId !== state.activePointerId) {
          beginGesture(event);
          return;
        }
        state.canvasGesturePointers.set(event.pointerId, viewportPoint(event));
      }
    }
    if (event.isPrimary === false) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.pointerId === state.activePointerId) return;
    if (state.activePointerId !== null) {
      const replacedPointerId = state.activePointerId;
      const replacedPointerType = state.activePointerType;
      finish(null, { releaseCapture: true, commit: true });
      if (replacedPointerType === "touch") state.canvasGesturePointers.delete(replacedPointerId);
    }
    if (!ownsCanvas() || state.activePointerId !== null) return;
    if (event.pointerType === "touch" && !state.canvasGesturePointers.has(event.pointerId)) state.canvasGesturePointers.set(event.pointerId, viewportPoint(event));
    preventIfCancelable(event);
    const rect = canvas.getBoundingClientRect();
    const point = canvasPoint(event, rect, canvas);
    state.activePointerId = event.pointerId;
    state.activePointerType = event.pointerType || "";
    state.activePointerStartedAt = eventTime(event);
    state.activePointerLastEventAt = state.activePointerStartedAt;
    state.canvasRect = rect;
    state.activeStroke = {
      type: "stroke",
      compositeOperation: context.globalCompositeOperation,
      color: context.strokeStyle || "#3e3a48",
      brushKind: state.currentBrushKind === "eraser" ? "solid" : state.currentBrushKind,
      seed: (Math.imul(++state.strokeSeedCounter, 0x9e3779b1) ^ Math.round(point.x * 100) ^ Math.imul(Math.round(point.y * 100), 31)) >>> 0,
      width: Number(state.brushInput?.value || 9),
      points: [point]
    };
    activeStrokeInitialDirty = state.dirty;
    state.drawing = true;
    if (METALLIC_BRUSHES[state.activeStroke.brushKind]) renderMetallicPreview();
    else {
      clearMetallicPreview();
      context.globalCompositeOperation = state.activeStroke.compositeOperation;
      context.strokeStyle = state.activeStroke.color;
      context.lineWidth = state.activeStroke.width;
      context.beginPath();
      context.moveTo(point.x, point.y);
    }
    state.activePointerCaptured = safeSetPointerCapture(canvas, event.pointerId);
  };
  const move = event => {
    if (event.pointerType === "touch" && state.canvasGestureSuppressedPointers.has(event.pointerId)) {
      preventIfCancelable(event);
      state.canvasGesturePointers.set(event.pointerId, viewportPoint(event));
      if (state.canvasGestureActive && gestureStart && gesturePointerIds.includes(event.pointerId)) {
        const size = viewportSize();
        applyCanvasTransform(calculateCanvasGestureTransform(gestureStart, gesturePoints(), size.width, size.height));
      }
      return;
    }
    if (event.pointerType === "touch" && state.canvasGesturePointers.has(event.pointerId)) state.canvasGesturePointers.set(event.pointerId, viewportPoint(event));
    if (!ownsCanvas() || !state.drawing || event.pointerId !== state.activePointerId || !state.activeStroke || !state.canvasRect) return;
    preventIfCancelable(event);
    if (pointerMoveShowsContactEnded(event)) {
      finish(event, { releaseCapture: true, commit: true, commitDot: true });
      return;
    }
    const movedAt = eventTime(event);
    if (movedAt !== null) state.activePointerLastEventAt = movedAt;
    const point = canvasPoint(event, state.canvasRect, canvas);
    const lastPoint = state.activeStroke.points[state.activeStroke.points.length - 1];
    if (sameCanvasPoint(lastPoint, point)) return;
    state.activeStroke.points.push(point);
    if (METALLIC_BRUSHES[state.activeStroke.brushKind]) {
      scheduleMetallicPreview();
    } else {
      context.globalCompositeOperation = state.activeStroke.compositeOperation;
      context.strokeStyle = state.activeStroke.color;
      context.lineWidth = state.activeStroke.width;
      context.lineTo(point.x, point.y);
      context.stroke();
    }
    state.dirty = true;
  };
  const end = event => {
    if (!finishGesturePointer(event)) finish(event, { releaseCapture: true, commit: true, commitDot: true });
    if (event.pointerType === "touch") state.canvasGesturePointers.delete(event.pointerId);
    if (event.pointerType === "touch" && typeof scheduleCanvasTouchFallbackCleanup === "function") scheduleCanvasTouchFallbackCleanup();
  };
  const cancel = event => {
    if (!finishGesturePointer(event)) finish(event, { releaseCapture: true, commit: true });
    if (event.pointerType === "touch") state.canvasGesturePointers.delete(event.pointerId);
    if (event.pointerType === "touch" && typeof scheduleCanvasTouchFallbackCleanup === "function") scheduleCanvasTouchFallbackCleanup();
  };
  const lost = event => {
    if (!finishGesturePointer(event)) finish(event, { releaseCapture: false, commit: true, commitDot: true });
    if (event.pointerType === "touch") state.canvasGesturePointers.delete(event.pointerId);
    if (event.pointerType === "touch" && typeof scheduleCanvasTouchFallbackCleanup === "function") scheduleCanvasTouchFallbackCleanup();
  };
  const interrupt = () => {
    const hadGesture = state.canvasGestureSuppressedPointers.size > 0;
    if (state.canvasGestureSuppressedPointers.size) {
      for (const id of [...state.canvasGestureSuppressedPointers]) safeReleasePointerCapture(canvas, id);
      state.canvasGestureSuppressedPointers.clear();
      state.canvasGesturePointers.clear();
      state.canvasGestureActive = false;
      gestureStart = null;
      gesturePointerIds = [];
    }
    const finishedStroke = finish(null, { releaseCapture: true, commit: true });
    if (typeof clearCanvasTouchSession === "function") clearCanvasTouchSession();
    return hadGesture || finishedStroke;
  };
  const visibility = () => { if (document.visibilityState === "hidden") interrupt(); };
  canvas.addEventListener("pointerdown", start, { passive: false });
  canvas.addEventListener("pointermove", move, { passive: false });
  canvas.addEventListener("pointerup", end, { passive: false });
  canvas.addEventListener("pointercancel", cancel, { passive: false });
  canvas.addEventListener("lostpointercapture", lost);
  window.addEventListener("pointerup", end, { passive: false });
  window.addEventListener("pointercancel", cancel, { passive: false });
  window.addEventListener("blur", interrupt);
  window.addEventListener("pagehide", interrupt);
  document.addEventListener("visibilitychange", visibility);
  applyCanvasTransform({ scale: 1, x: 0, y: 0 });
  const refreshViewport = () => {
    viewportFrame = 0;
    if (!ownsCanvas()) return;
    applyCanvasTransform({ scale: state.canvasZoomScale, x: state.canvasZoomX, y: state.canvasZoomY });
    if (state.activeStroke) state.canvasRect = canvas.getBoundingClientRect();
    if (state.canvasGestureActive && gesturePointerIds.length === 2) {
      const points = gesturePoints();
      const size = viewportSize();
      if (points.length === 2 && canvasTouchDistance(points) > 0) gestureStart = { points, scale: state.canvasZoomScale, x: state.canvasZoomX, y: state.canvasZoomY, ...size };
    }
  };
  const scheduleViewportRefresh = () => {
    if (viewportFrame || inputDisposed) return;
    viewportFrame = window.requestAnimationFrame(refreshViewport);
  };
  if (typeof ResizeObserver === "function" && viewport) {
    resizeObserver = new ResizeObserver(scheduleViewportRefresh);
    resizeObserver.observe(viewport);
  }
  window.addEventListener("resize", scheduleViewportRefresh);
  window.addEventListener("orientationchange", scheduleViewportRefresh);
  window.visualViewport?.addEventListener("resize", scheduleViewportRefresh);
  window.visualViewport?.addEventListener("scroll", scheduleViewportRefresh);
  state.canvasInputCleanup = () => {
    if (inputDisposed) return;
    inputDisposed = true;
    releaseBrushSizeControl();
    canvas.removeEventListener("pointerdown", start);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", end);
    canvas.removeEventListener("pointercancel", cancel);
    canvas.removeEventListener("lostpointercapture", lost);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", cancel);
    window.removeEventListener("blur", interrupt);
    window.removeEventListener("pagehide", interrupt);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("resize", scheduleViewportRefresh);
    window.removeEventListener("orientationchange", scheduleViewportRefresh);
    window.visualViewport?.removeEventListener("resize", scheduleViewportRefresh);
    window.visualViewport?.removeEventListener("scroll", scheduleViewportRefresh);
    if (viewportFrame) window.cancelAnimationFrame(viewportFrame);
    viewportFrame = 0;
    resizeObserver?.disconnect();
    resizeObserver = null;
    safeReleasePointerCapture(canvas, state.activePointerId);
    for (const id of state.canvasGestureSuppressedPointers) safeReleasePointerCapture(canvas, id);
    state.canvasGesturePointers.clear();
    state.canvasGestureSuppressedPointers.clear();
    state.canvasGestureActive = false;
    gestureStart = null;
    gesturePointerIds = [];
    clearActivePointer();
    applyCanvasTransform({ scale: 1, x: 0, y: 0 });
    if (typeof clearCanvasTouchSession === "function") clearCanvasTouchSession();
  };

  if (imageData) {
    const editImageRequestId = ++state.editImageRequestId;
    const transitionId = routeTransitionId;
    const baseCanvas = state.historyBaseCanvas;
    const baseContext = state.historyBaseContext;
    const ownsImage = () => editImageRequestId === state.editImageRequestId && isTransitionCurrent(transitionId, "draw") && state.canvas === canvas && state.ctx === context && state.historyBaseCanvas === baseCanvas && state.historyBaseContext === baseContext && canvas.isConnected;
    const finishBase = image => {
      if (!ownsImage()) return;
      baseContext.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
      if (image) baseContext.drawImage(image, 0, 0, baseCanvas.width, baseCanvas.height);
      state.historyBaseReady = true;
      state.historyBaseHasContent = !!image;
      compactCanvasHistory();
      redrawCanvasWhenIdle();
    };
    const img = new Image();
    img.onload = () => finishBase(img);
    img.onerror = () => { if (!ownsImage()) return; console.warn("수정 이미지를 불러오지 못했습니다."); finishBase(null); };
    img.src = imageData;
  }
}
function undoCanvas() {
  if (!state.history.length) return showToast("되돌릴 내용이 없어요.");
  state.history.pop();
  redrawCanvasFromHistory();
  state.dirty = true;
}
function clearCanvasBoard(track) {
  if (track) commitCanvasAction({ type: "clear" });
  state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
  state.dirty = !!track;
}
function openClearCanvasModal() {
  if (!canvasHasVisibleContent()) return showToast("지울 그림이 없어요.");
  const root = document.querySelector("#modalRoot");
  if (!root || root.firstElementChild) return;
  root.innerHTML = `<div class="modal-backdrop clear-canvas-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="clearCanvasTitle" aria-describedby="clearCanvasDescription"><h3 id="clearCanvasTitle">그림을 모두 지울까요?</h3><p id="clearCanvasDescription">지운 뒤에도 되돌리기 버튼으로 한 번 복구할 수 있어요.</p><div class="button-row"><button class="button ghost" type="button" data-clear-cancel>취소</button><button class="button danger" type="button" data-clear-confirm>전체 지우기</button></div></div></div>`;
  const backdrop = root.firstElementChild;
  const cancel = root.querySelector("[data-clear-cancel]");
  const confirm = root.querySelector("[data-clear-confirm]");
  const ownsModal = () => root.firstElementChild === backdrop && backdrop?.isConnected !== false;
  const close = () => {
    document.removeEventListener("keydown", onKeydown);
    if (ownsModal()) root.innerHTML = "";
    if (state.clearCanvasModalCleanup === close) state.clearCanvasModalCleanup = null;
  };
  const onKeydown = event => { if (event.key === "Escape") close(); };
  cancel.onclick = close;
  confirm.onclick = () => {
    if (!ownsModal()) return;
    clearCanvasBoard(true);
    close();
  };
  backdrop.onclick = event => { if (event.target === backdrop) close(); };
  document.addEventListener("keydown", onKeydown);
  state.clearCanvasModalCleanup = close;
  cancel.focus();
}
async function publishDrawing() {
  if (!isValidCategory(state.word?.category)) throw new Error("invalid-category");
  const now = serverNow();
  const ref = db.ref("drawings").push();
  const id = ref.key;
  const optimized = validateOptimizedImages(await optimizeCanvasImages(state.canvas));
  const data = {
    word: state.word.word,
    category: state.word.category,
    answers: state.word.answers,
    isCustomWord: state.word.isCustomWord,
    imageVersion: IMAGE_OPTIONS.version,
    imageFormat: optimized.imageFormat,
    imageWidth: optimized.imageWidth,
    imageHeight: optimized.imageHeight,
    imageBytes: optimized.imageBytes,
    thumbnailBytes: optimized.thumbnailBytes,
    imageReady: false,
    drawerId: state.user.id,
    drawerNickname: state.user.nickname,
    status: "open",
    createdAt: now,
    updatedAt: now,
    expiresAt: now + 48 * 3600000,
    revisionCount: 0,
    solverId: null,
    solverNickname: null,
    solvedAt: null,
    hintUsed: false,
    solverReward: 0,
    drawerReward: 0,
    expiredAt: null,
    withdrawnAt: null,
    likeCount: 0
  };
  try {
    await ref.set(data);
    await db.ref().update({
      [`drawingImages/${id}/imageData`]: optimized.imageData,
      [`drawingThumbnails/${id}/imageData`]: optimized.thumbnailData
    });
    await db.ref().update({ [`drawings/${id}/imageReady`]: true, [`userDrawings/${state.user.id}/${id}`]: true });
  } catch (error) {
    console.error("그림 이미지 저장 실패:", error?.code || "unknown", error);
    try {
      await db.ref().update({ [`drawingImages/${id}`]: null, [`drawingThumbnails/${id}`]: null });
      await ref.update({ status: "withdrawn", withdrawnAt: serverNow(), updatedAt: serverNow() });
    } catch (cleanupError) { console.error(`불완전한 그림 정리 실패: drawingImages/${id}, drawingThumbnails/${id}, drawings/${id}`, cleanupError); }
    throw error;
  }
  return { id, imageData: optimized.imageData, thumbnailData: optimized.thumbnailData };
}
function hasCompleteImageMetadata(drawing) {
  return ["imageVersion", "imageFormat", "imageWidth", "imageHeight", "imageBytes", "thumbnailBytes"].every(field => drawing?.[field] !== undefined && drawing?.[field] !== null);
}
function isStaleProvisionalDrawing(drawing, now = serverNow()) {
  return !!drawing && drawing.status === "open" && !drawing.imageData && drawing.imageReady === false && !drawing.solverId && hasCompleteImageMetadata(drawing) && Number.isFinite(Number(drawing.createdAt)) && Number(drawing.createdAt) <= now - STALE_PROVISIONAL_GRACE_MS;
}
function cleanupStaleProvisionalDrawings({ snapshot = null, force = false, now = serverNow() } = {}) {
  if (!db) return Promise.resolve({ snapshot: null, changed: false, skipped: true, failed: [] });
  if (state.provisionalCleanupPromise) return state.provisionalCleanupPromise;
  if (!force && state.provisionalCleanupCompletedAt && now - state.provisionalCleanupCompletedAt < EXPIRY_SWEEP_INTERVAL_MS) {
    return Promise.resolve({ snapshot, changed: false, skipped: true, failed: [] });
  }
  const generation = state.cacheGeneration;
  let cleanupPromise;
  cleanupPromise = (async () => {
    try {
      const snap = snapshot || await db.ref("drawings").orderByChild("status").equalTo("open").once("value");
      const jobs = [];
      snap.forEach(child => {
        if (!isStaleProvisionalDrawing(child.val(), now)) return;
        const cleanupAt = serverNow();
        const paths = [`drawingImages/${child.key}`, `drawingThumbnails/${child.key}`, `drawings/${child.key}`];
        jobs.push({ id: child.key, paths, promise: db.ref().update({
          [`drawingImages/${child.key}`]: null,
          [`drawingThumbnails/${child.key}`]: null,
          [`drawings/${child.key}/status`]: "withdrawn",
          [`drawings/${child.key}/withdrawnAt`]: cleanupAt,
          [`drawings/${child.key}/updatedAt`]: cleanupAt
        }) });
      });
      const settled = await Promise.allSettled(jobs.map(job => job.promise));
      const failed = [];
      settled.forEach((result, index) => {
        if (result.status !== "rejected") return;
        const job = jobs[index];
        failed.push(job.id);
        console.warn(`[provisional cleanup] ${job.id} 정리 실패 (${job.paths.join(", ")})`, result.reason);
      });
      if (state.cacheGeneration === generation) state.provisionalCleanupCompletedAt = now;
      return { snapshot: snap, changed: settled.some(result => result.status === "fulfilled"), skipped: false, failed };
    } finally {
      if (state.provisionalCleanupPromise === cleanupPromise) state.provisionalCleanupPromise = null;
    }
  })();
  state.provisionalCleanupPromise = cleanupPromise;
  return cleanupPromise;
}
function expireOldDrawings({ force = false, now = serverNow() } = {}) {
  if (!db) return Promise.resolve({ snapshot: null, changed: false, skipped: true });
  if (state.expirySweepPromise) return state.expirySweepPromise;
  if (!force && state.expirySweepCompletedAt && now - state.expirySweepCompletedAt < EXPIRY_SWEEP_INTERVAL_MS) {
    return Promise.resolve({ snapshot: null, changed: false, skipped: true });
  }
  const generation = state.cacheGeneration;
  let sweepPromise;
  sweepPromise = (async () => {
    try {
      const snap = await db.ref("drawings").orderByChild("status").equalTo("open").once("value");
      const cleanupPromise = cleanupStaleProvisionalDrawings({ snapshot: snap, force, now }).catch(error => {
        console.warn("중단된 provisional 그림 정리 sweep 실패:", error);
        return { snapshot: snap, changed: false, skipped: false, failed: ["sweep"] };
      });
      const jobs = [];
      snap.forEach(child => {
        const d = child.val();
        if (!d.solverId && (d.imageData || d.imageReady === true) && Number(d.expiresAt) <= now) {
          const fallbackDrawing = d;
          jobs.push({ key: child.key, promise: child.ref.transaction(cur => {
            const current = cur || fallbackDrawing;
            if (!current || current.status !== "open" || current.solverId || Number(current.expiresAt) > serverNow()) return;
            const expiredAt = serverNow();
            return { ...current, status: "expired", expiredAt, updatedAt: expiredAt };
          }, (error, committed) => {
            if (error) console.warn("미해결 그림 만료 처리 실패:", child.key, error);
            else if (!committed) console.warn("미해결 그림 만료 처리 미커밋:", child.key);
          }, false) });
        }
      });
      const settled = await Promise.allSettled(jobs.map(job => job.promise));
      const provisionalCleanup = await cleanupPromise;
      let failedTransactions = 0;
      settled.forEach((result, index) => {
        if (result.status === "rejected") {
          failedTransactions++;
          console.warn("미해결 그림 만료 transaction 예외:", jobs[index].key, result.reason);
        }
      });
      const changed = settled.some(result => result.status === "fulfilled" && result.value.committed && result.value.snapshot.val()?.status === "expired");
      if (changed && state.cacheGeneration === generation) invalidateGalleryListsByStatus("expired");
      if (!failedTransactions && state.cacheGeneration === generation) state.expirySweepCompletedAt = serverNow();
      return { snapshot: snap, changed, skipped: false, failedTransactions, provisionalCleanup };
    } finally {
      if (state.expirySweepPromise === sweepPromise) state.expirySweepPromise = null;
    }
  })();
  state.expirySweepPromise = sweepPromise;
  return sweepPromise;
}
async function loadOpenDrawings(sort = "new") {
  const sweep = await expireOldDrawings();
  const snap = sweep.snapshot || await db.ref("drawings").orderByChild("status").equalTo("open").once("value");
  const list = [];
  snap.forEach(child => {
    const d = child.val() || {};
    if (/^[A-Za-z0-9_-]{1,80}$/.test(child.key) && (d.imageData || d.imageReady === true) && Number(d.expiresAt) > serverNow()) list.push({ ...d, id: child.key });
    else if (!/^[A-Za-z0-9_-]{1,80}$/.test(child.key)) console.warn("[security] 안전하지 않은 drawing ID를 표시에서 제외했습니다.", child.key);
  });
  return list.sort((a, b) => sort === "new" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);
}
async function renderSolve() {
  const request = beginScreenRequest("solve");
  cancelSolveImageLoading();
  if (!isConfigured()) { if (isScreenRequestCurrent(request)) appEl.innerHTML = '<section class="screen"><div class="empty">Firebase 설정을 연결해 주세요.</div></section>'; return; }
  loading(request);
  const sort = sessionStorage.getItem("solveSort") || "new";
  try {
    const [list, recentSuccesses] = await Promise.all([loadOpenDrawings(sort), loadRecentSolverSuccessCount()]);
    if (!isScreenRequestCurrent(request)) return;
    appEl.innerHTML = `<section class="screen"><div class="section-head"><div><h2>정답 맞히기</h2><p class="muted">그림 속 제시어를 찾아보세요!</p></div></div><div class="filters"><select id="solveSort"><option value="new" ${sort === "new" ? "selected" : ""}>최신순</option><option value="old" ${sort === "old" ? "selected" : ""}>과거순</option></select></div><div id="openList">${list.length ? list.map(d => openDrawingCard(d, recentSuccesses)).join("") : emptyHtml("", "아직 도전할 그림이 없어요.")}</div></section>`;
    solveSort.onchange = () => { sessionStorage.setItem("solveSort", solveSort.value); renderSolve(); };
    const drawingsById = new Map(list.map(drawing => [drawing.id, drawing]));
    document.querySelectorAll("[data-hint]").forEach(button => button.onclick = () => {
      if (button.disabled) return;
      state.hintUsed[button.dataset.hint] = true;
      showCategoryHint(button, drawingsById);
      button.disabled = true;
      const reward = document.querySelector(`[data-answer-reward="${button.dataset.hint}"]`);
      if (reward) reward.innerHTML = solverRewardHtml(Number(button.dataset.recentSuccesses) || 0, true);
    });
    document.querySelectorAll("[data-answer-form]").forEach(form => form.onsubmit = async event => {
      event.preventDefault();
      const id = form.dataset.answerForm;
      const button = form.querySelector("button");
      const input = form.querySelector("input");
      if (button.disabled) return;
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "확인 중…";
      try {
        const result = await submitAnswer(id, input.value, !!state.hintUsed[id]);
        if (!isScreenRequestCurrent(request)) return;
        if (result.correct) {
          await loadCurrentUser(undefined, () => isScreenRequestCurrent(request));
          if (!isScreenRequestCurrent(request)) return;
          renderSolve();
          showAnswerSuccessModal(result);
        } else {
          showToast(result.message);
          input.select();
          button.disabled = false;
          button.textContent = originalText;
        }
      } catch (error) {
        if (!isScreenRequestCurrent(request)) return;
        console.error("정답 확인 중 오류:", error);
        const permissionError = /permission[-_ ]?denied/i.test(`${error?.code || ""} ${error?.message || ""}`);
        showToast(permissionError
          ? "권한 확인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요."
          : "정답 확인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.");
        button.disabled = false;
        button.textContent = originalText;
      }
    });
    observeSolveImages(list, request);
  } catch (error) {
    if (!isScreenRequestCurrent(request)) return;
    console.error(error);
    appEl.innerHTML = `<section class="screen">${emptyHtml("", "그림을 불러오지 못했어요.")}</section>`;
  }
}
function showCategoryHint(button, drawingsById) {
  button.textContent = `카테고리: ${drawingsById.get(button.dataset.hint)?.category || "알 수 없음"}`;
}
function openDrawingCard(d, recentSuccesses = 0) {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(d?.id || "")) return "";
  const id = String(d.id).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const mine = isOwnDrawing(d);
  const usedHint = !!state.hintUsed[d.id];
  return `<article class="card drawing-card" data-solve-card="${id}"><div class="solve-image-slot" data-solve-slot="${id}"><img data-solve-image="${id}" alt="도전 중인 그림"><span class="image-loading">불러오는 중…</span></div><div class="meta"><span class="badge open">남은 시간: ${formatTime(d.expiresAt)}</span></div>${mine ? '<div class="notice">내 그림은 맞힐 수 없습니다.</div>' : `<button class="button secondary full" data-hint="${id}" data-recent-successes="${recentSuccesses}" ${usedHint ? "disabled" : ""}>${usedHint ? `카테고리: ${escapeHtml(d.category)}` : "카테고리 힌트 보기 (-4점)"}</button><div class="answer-reward" data-answer-reward="${id}">${solverRewardHtml(recentSuccesses, usedHint)}</div><form class="answer-row" data-answer-form="${id}"><input maxlength="30" autocomplete="off" placeholder="정답을 입력해요" aria-label="정답"><button class="button primary">정답!</button></form>`}</article>`;
}
function cancelSolveImageLoading() {
  state.solveObserver?.disconnect();
  state.solveObserver = null;
  if (state.solveLoader) {
    state.solveLoader.cancelled = true;
    state.solveLoader.queue.length = 0;
    state.solveLoader.pendingWaiters.forEach(cancel => cancel());
    state.solveLoader.pendingWaiters.clear();
    state.solveLoader = null;
  }
}
function createSolveLoader(request) {
  cancelSolveImageLoading();
  const loader = { queue: [], active: 0, cancelled: false, transitionId: request.transitionId, request, pendingWaiters: new Set() };
  state.solveLoader = loader;
  return loader;
}
function isSolveLoaderCurrent(loader) {
  return !loader.cancelled && state.solveLoader === loader && isScreenRequestCurrent(loader.request);
}
function enqueueSolveImage(loader, task) {
  if (loader.cancelled) return;
  loader.queue.push(task);
  runSolveImageQueue(loader);
}
function runSolveImageQueue(loader) {
  while (!loader.cancelled && loader.active < IMAGE_OPTIONS.maxConcurrentLoads && loader.queue.length) {
    loader.active++;
    const task = loader.queue.shift();
    Promise.resolve(task()).finally(() => {
      loader.active--;
      if (!loader.cancelled) runSolveImageQueue(loader);
    });
  }
}
function solveImageMarkup(drawingId) {
  return `<img data-solve-image="${drawingId}" alt="도전 중인 그림"><span class="image-loading">불러오는 중…</span>`;
}
function waitForSolveImageLoad(image, src, loader) {
  return new Promise(resolve => {
    let settled = false;
    const cleanup = () => {
      image.removeEventListener("load", onLoad);
      image.removeEventListener("error", onError);
      loader.pendingWaiters.delete(cancel);
    };
    const finish = result => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };
    const onLoad = () => finish(image.naturalWidth > 0 ? "loaded" : "error");
    const onError = () => finish("error");
    const cancel = () => finish("cancelled");
    loader.pendingWaiters.add(cancel);
    image.addEventListener("load", onLoad);
    image.addEventListener("error", onError);
    image.src = src;
    if (image.complete) queueMicrotask(() => image.naturalWidth > 0 ? onLoad() : onError());
  });
}
function queueSolveImage(loader, image, drawing) {
  if (!image || image.dataset.queued || !isSolveLoaderCurrent(loader)) return;
  image.dataset.queued = "true";
  enqueueSolveImage(loader, async () => {
    try {
      const src = await loadDrawingImage(drawing, "detail");
      if (!isSolveLoaderCurrent(loader) || !image.isConnected) return;
      const result = await waitForSolveImageLoad(image, src, loader);
      if (result === "cancelled" || !isSolveLoaderCurrent(loader) || !image.isConnected) return;
      if (result !== "loaded") throw new Error("solve-image-render-failed");
      const slot = image.parentElement;
      if (!slot?.isConnected || slot.querySelector(`[data-solve-image="${drawing.id}"]`) !== image) return;
      image.classList.add("loaded");
      slot.querySelector(".image-loading")?.remove();
    } catch (_) {
      if (!isSolveLoaderCurrent(loader) || !image.isConnected) return;
      const slot = image.parentElement;
      if (!slot?.isConnected || slot.querySelector(`[data-solve-image="${drawing.id}"]`) !== image) return;
      slot.innerHTML = `<span class="image-error">이미지를 불러오지 못했어요.</span><button class="image-retry" data-solve-retry="${drawing.id}">다시 불러오기</button>`;
      const retry = slot.querySelector("[data-solve-retry]");
      retry.onclick = () => {
        if (retry.disabled || !isSolveLoaderCurrent(loader)) return;
        retry.disabled = true;
        state.detailImageCache.delete(drawing.id);
        slot.innerHTML = solveImageMarkup(drawing.id);
        queueSolveImage(loader, slot.querySelector("[data-solve-image]"), drawing);
      };
    }
  });
}
function observeSolveImages(list, request) {
  const loader = createSolveLoader(request);
  const images = [...document.querySelectorAll("[data-solve-image]")];
  const queue = image => queueSolveImage(loader, image, list.find(drawing => drawing.id === image.dataset.solveImage));
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting && isSolveLoaderCurrent(loader)) {
        observer.unobserve(entry.target);
        queue(entry.target);
      }
    }), { rootMargin: "240px" });
    state.solveObserver = observer;
    images.forEach(image => observer.observe(image));
  } else images.forEach(queue);
  return loader;
}
async function updateDrawing(drawingId) {
  if (!isSafeRecordId(drawingId)) throw new Error("수정할 수 없는 그림이에요.");
  const ref = db.ref(`drawings/${drawingId}`);
  const drawing = (await ref.once("value")).val();
  const readAt = serverNow();
  if (!drawing || drawing.status !== "open" || !isOwnDrawing(drawing) || drawing.solverId || Number(drawing.expiresAt) <= readAt || !hasPublicDrawingImage(drawing)) throw new Error("수정할 수 없는 그림이에요.");
  const optimized = validateOptimizedImages(await optimizeCanvasImages(state.canvas));
  const updatedAt = serverNow();
  if (Number(drawing.expiresAt) <= updatedAt) throw new Error("수정할 수 없는 그림이에요.");
  const updates = {
    [`drawingImages/${drawingId}/imageData`]: optimized.imageData,
    [`drawingThumbnails/${drawingId}/imageData`]: optimized.thumbnailData,
    [`drawings/${drawingId}/imageVersion`]: IMAGE_OPTIONS.version,
    [`drawings/${drawingId}/imageFormat`]: optimized.imageFormat,
    [`drawings/${drawingId}/imageWidth`]: optimized.imageWidth,
    [`drawings/${drawingId}/imageHeight`]: optimized.imageHeight,
    [`drawings/${drawingId}/imageBytes`]: optimized.imageBytes,
    [`drawings/${drawingId}/thumbnailBytes`]: optimized.thumbnailBytes,
    [`drawings/${drawingId}/imageReady`]: true,
    [`drawings/${drawingId}/updatedAt`]: updatedAt,
    [`drawings/${drawingId}/revisionCount`]: (Number(drawing.revisionCount) || 0) + 1
  };
  if (drawing.imageData) updates[`drawings/${drawingId}/imageData`] = null;
  await db.ref().update(updates);
  return { imageData: optimized.imageData, thumbnailData: optimized.thumbnailData };
}
async function withdrawDrawing(drawingId) {
  const now = serverNow();
  const ref = db.ref(`drawings/${drawingId}`);
  const fallbackDrawing = (await ref.once("value")).val();
  const result = await ref.transaction(current => {
    const d = current || fallbackDrawing;
    return d && d.status === "open" && isOwnDrawing(d) && !d.solverId && Number(d.expiresAt) > now ? { ...d, status: "withdrawn", withdrawnAt: now, updatedAt: now } : undefined;
  }, null, false);
  if (!result.committed) throw new Error("회수할 수 없는 그림이에요.");
}
async function loadGalleryMetadata(status) {
  if (state.galleryMetadata[status]) return state.galleryMetadata[status];
  if (state.galleryMetadataPromises[status]) return state.galleryMetadataPromises[status];
  let metadataPromise;
  metadataPromise = (async () => {
    try {
      const snap = await db.ref("drawings").orderByChild("status").equalTo(status).once("value");
      const list = [];
      snap.forEach(child => {
        const d = child.val() || {};
        if (!/^[A-Za-z0-9_-]{1,80}$/.test(child.key) || (!d.imageData && d.imageReady !== true)) { if (!/^[A-Za-z0-9_-]{1,80}$/.test(child.key)) console.warn("[security] 안전하지 않은 drawing ID를 표시에서 제외했습니다.", child.key); return; }
        const cachedLike = state.likeCache.get(child.key);
        list.push({ ...d, likeCount: cachedLike?.count ?? (Number(d.likeCount) || 0), isLiked: cachedLike?.liked ?? false, id: child.key });
      });
      if (state.galleryMetadataPromises[status] === metadataPromise) state.galleryMetadata[status] = list;
      return list;
    } finally {
      if (state.galleryMetadataPromises[status] === metadataPromise) delete state.galleryMetadataPromises[status];
    }
  })();
  state.galleryMetadataPromises[status] = metadataPromise;
  return metadataPromise;
}
async function loadGalleryDrawings(status = state.galleryTab, sort = state.gallerySort) {
  const started = performance.now();
  await expireOldDrawings();
  const list = await loadGalleryMetadata(status);
  if (sort === "popular") {
    await Promise.all(list.map(async drawing => {
      const like = await ensureLikeState(drawing.id);
      drawing.likeCount = like.count; drawing.isLiked = like.liked;
    }));
  }
  const sorted = sortGalleryDrawings(list, sort);
  console.info(`[gallery] metadata ${Math.round(performance.now() - started)}ms · ${sorted.length}개`);
  return sorted;
}
async function loadGalleryArtistDrawings(sort = state.gallerySort) {
  const artistDrawingId = state.galleryArtistDrawingId;
  await expireOldDrawings();
  const [solved, expired] = await Promise.all([loadGalleryMetadata("solved"), loadGalleryMetadata("expired")]);
  const combined = [...solved, ...expired];
  const selected = combined.find(drawing => drawing.id === artistDrawingId);
  const retained = state.galleryArtist?.drawingId === artistDrawingId ? state.galleryArtist : null;
  const artist = galleryArtistIdentity(selected) || retained;
  if (!artist || state.galleryArtistDrawingId !== artistDrawingId) return null;
  state.galleryArtist = artist;
  const list = combined.filter(drawing => ["solved", "expired"].includes(drawing.status) && hasPublicDrawingImage(drawing) && isSafeRecordId(drawing.id) && isDrawingByArtist(drawing, artist));
  if (sort === "popular") {
    await Promise.all(list.map(async drawing => {
      const like = await ensureLikeState(drawing.id);
      drawing.likeCount = like.count; drawing.isLiked = like.liked;
    }));
  }
  return sortGalleryDrawings(list, sort);
}
function galleryListKey() { return state.galleryArtistDrawingId ? `artist:${state.galleryArtistDrawingId}:${state.gallerySort}` : `${state.galleryTab}:${state.gallerySort}`; }
function fullGalleryHistoryState(detail = state.galleryView === "frame") {
  return {
    route: "gallery",
    galleryTab: ["solved", "expired"].includes(state.galleryTab) ? state.galleryTab : "solved",
    gallerySort: ["new", "old", "popular"].includes(state.gallerySort) ? state.gallerySort : "new",
    galleryDetail: detail,
    galleryIndex: detail ? state.galleryIndex : 0,
    galleryArtist: false,
    galleryArtistDrawingId: null,
    galleryHasGalleryBack: false,
    galleryHasArtistListBack: false,
    galleryReturnState: null
  };
}
function validGalleryReturnState(value) {
  if (!value || value.route !== "gallery" || value.galleryArtist === true) return null;
  const galleryTab = ["solved", "expired"].includes(value.galleryTab) ? value.galleryTab : "solved";
  const gallerySort = ["new", "old", "popular"].includes(value.gallerySort) ? value.gallerySort : "new";
  const galleryDetail = value.galleryDetail === true;
  return { route: "gallery", galleryTab, gallerySort, galleryDetail, galleryIndex: galleryDetail && Number.isInteger(value.galleryIndex) ? value.galleryIndex : 0, galleryArtist: false, galleryArtistDrawingId: null, galleryHasGalleryBack: false, galleryHasArtistListBack: false, galleryReturnState: null };
}
function galleryHistoryState(detail = state.galleryView === "frame", options = {}) {
  if (!state.galleryArtistDrawingId) return fullGalleryHistoryState(detail);
  const galleryReturnState = validGalleryReturnState(options.galleryReturnState ?? history.state?.galleryReturnState);
  const galleryHasGalleryBack = state.galleryHasGalleryBack === true && (options.galleryHasGalleryBack ?? history.state?.galleryHasGalleryBack) === true && !!galleryReturnState;
  const galleryHasArtistListBack = detail && (options.galleryHasArtistListBack ?? history.state?.galleryHasArtistListBack) === true;
  return {
    route: "gallery",
    galleryTab: ["solved", "expired"].includes(state.galleryTab) ? state.galleryTab : "solved",
    gallerySort: ["new", "old", "popular"].includes(state.gallerySort) ? state.gallerySort : "new",
    galleryDetail: detail,
    galleryIndex: detail ? state.galleryIndex : 0,
    galleryArtist: true,
    galleryArtistDrawingId: state.galleryArtistDrawingId,
    galleryHasGalleryBack,
    galleryHasArtistListBack,
    galleryReturnState
  };
}
function openGalleryArtist(drawing) {
  const artist = galleryArtistIdentity(drawing);
  if (!artist) return false;
  if (state.galleryView === "thumb") state.galleryScroll[galleryListKey()] = scrollY;
  const galleryReturnState = fullGalleryHistoryState(state.galleryView === "frame");
  history.replaceState(galleryReturnState, "", "#gallery");
  state.galleryArtistDrawingId = artist.drawingId;
  state.galleryArtist = artist;
  state.galleryHasGalleryBack = true;
  state.galleryView = "thumb";
  state.galleryIndex = 0;
  state.galleryScroll[galleryListKey()] = 0;
  history.pushState(galleryHistoryState(false, { galleryHasGalleryBack: true, galleryReturnState }), "", "#gallery");
  renderGallery();
  return true;
}
function showFullGallery({ replace = false, historyState = null } = {}) {
  const restoredState = validGalleryReturnState(historyState);
  state.galleryArtistDrawingId = null;
  state.galleryArtist = null;
  state.galleryHasGalleryBack = false;
  state.galleryTab = restoredState?.galleryTab || state.galleryTab;
  state.gallerySort = restoredState?.gallerySort || state.gallerySort;
  state.galleryView = restoredState?.galleryDetail ? "frame" : "thumb";
  state.galleryIndex = restoredState?.galleryDetail ? restoredState.galleryIndex : 0;
  const nextState = restoredState || fullGalleryHistoryState(false);
  if (replace) history.replaceState(nextState, "", "#gallery");
  else history.pushState(nextState, "", "#gallery");
  renderGallery();
}
function returnFromArtistGallery() {
  const galleryReturnState = validGalleryReturnState(history.state?.galleryReturnState);
  if (state.galleryHasGalleryBack === true && history.state?.galleryHasGalleryBack === true && galleryReturnState) history.back();
  else showFullGallery({ replace: true, historyState: galleryReturnState });
}
function returnFromArtistDetail() {
  if (history.state?.galleryHasArtistListBack === true) history.back();
  else {
    state.galleryView = "thumb";
    state.galleryIndex = 0;
    history.replaceState(galleryHistoryState(false, { galleryHasArtistListBack: false }), "", "#gallery");
    renderGallery();
  }
}
async function renderGallery(force = false) {
  const request = beginScreenRequest("gallery");
  if (!isConfigured()) { if (isScreenRequestCurrent(request)) appEl.innerHTML = '<section class="screen"><div class="empty">Firebase 설정을 연결해 주세요.</div></section>'; return; }
  const key = galleryListKey();
  if (force) {
    if (state.galleryArtistDrawingId) { invalidateGalleryListsByStatus("solved"); invalidateGalleryListsByStatus("expired"); }
    else invalidateGalleryListsByStatus(state.galleryTab);
  }
  const cachedList = state.galleryLists[key] && (!state.galleryArtistDrawingId || state.galleryArtist?.drawingId === state.galleryArtistDrawingId) ? state.galleryLists[key] : null;
  const cacheHit = !!cachedList;
  if (!cachedList) loading(request);
  try {
    const list = cachedList || (state.galleryArtistDrawingId ? await loadGalleryArtistDrawings() : await loadGalleryDrawings());
    if (!isScreenRequestCurrent(request)) return;
    if (!list) { showFullGallery({ replace: true }); return; }
    state.galleryLists[key] = list;
    if (state.galleryIndex >= list.length) state.galleryIndex = 0;
    const renderedAt = performance.now();
    const artistMode = !!state.galleryArtistDrawingId;
    const heading = artistMode ? `${escapeHtml(state.galleryArtist.name)}님의 작품` : "전시장";
    const description = artistMode ? "완성 액자와 미해결 그림을 함께 보여드려요." : "그림을 감상하고 마음에 쏙 들면 좋아요!";
    const artistReturn = artistMode && state.galleryView === "thumb" ? '<button class="gallery-return-button" data-gallery-return>← 전체 전시장으로</button>' : "";
    const tabs = artistMode ? "" : `<div class="tabs"><button data-gallery-tab="solved" class="${state.galleryTab === "solved" ? "active" : ""}">완성 액자</button><button data-gallery-tab="expired" class="${state.galleryTab === "expired" ? "active" : ""}">미해결 그림</button></div>`;
    appEl.innerHTML = `<section class="screen gallery-screen${state.galleryView === "frame" ? " gallery-detail" : ""}${artistMode ? " gallery-artist-screen" : ""}">${artistReturn}<h2>${heading}</h2><p class="muted">${description}</p>${tabs}<div class="gallery-controls"><select id="gallerySort" aria-label="작품 정렬"><option value="new" ${state.gallerySort === "new" ? "selected" : ""}>최신순</option><option value="old" ${state.gallerySort === "old" ? "selected" : ""}>과거순</option><option value="popular" ${state.gallerySort === "popular" ? "selected" : ""}>인기순</option></select></div>${state.isAdmin ? '<button class="button ghost migration-open" data-open-migration>기존 그림 최적화</button>' : ""}<div id="galleryContent"></div></section>`;
    renderGalleryContent(list);
    bindGalleryShell();
    console.info(`[gallery] cards rendered ${Math.round(performance.now() - renderedAt)}ms · server reread=${!cacheHit}`);
    if (state.galleryView === "thumb") requestAnimationFrame(() => {
      if (isScreenRequestCurrent(request) && galleryListKey() === key) scrollTo(0, state.galleryScroll[key] || 0);
    });
  } catch (error) {
    if (!isScreenRequestCurrent(request)) return;
    console.error(error);
    appEl.innerHTML = `<section class="screen">${emptyHtml("", "전시장을 불러오지 못했어요.")}</section>`;
  }
}
async function adminDeleteDrawing(drawingId) {
  if (!state.isAdmin) throw new Error("관리자만 그림을 숨길 수 있어요.");
  const adminUserId = state.user.id;
  const ref = db.ref(`drawings/${drawingId}`);
  const fallbackDrawing = (await ref.once("value")).val();
  const now = serverNow();
  let previousStatus = null;
  const result = await ref.transaction(current => {
    const d = current || fallbackDrawing;
    if (!d || d.status === "adminDeleted") return;
    previousStatus = d.status;
    return { ...d, status: "adminDeleted", adminDeletedAt: now, adminDeletedBy: adminUserId, updatedAt: now };
  }, null, false);
  if (!result.committed) throw new Error("그림을 숨기지 못했어요.");
  invalidateDrawingCachesAfterAdminDelete(drawingId, previousStatus);
  return previousStatus;
}
function invalidateDrawingCachesAfterAdminDelete(drawingId, status) {
  if (status) invalidateGalleryListsByStatus(status);
  state.thumbnailCache.delete(drawingId);
  state.detailImageCache.delete(drawingId);
  state.likeCache.delete(drawingId);
  state.pendingLikes.delete(drawingId);
}
function galleryFrame(list, i) {
  const d = list[i];
  const statusBadge = state.galleryArtistDrawingId ? `<span class="gallery-status-badge">${d.status === "solved" ? "완성 액자" : "미해결 그림"}</span>` : "";
  return `<div class="frame ${Number(d.likeCount) > 0 ? "has-likes" : ""}" data-gallery-card="${d.id}"><div class="gallery-image-slot detail-slot">${statusBadge}<img class="frame-image" data-detail-image="${d.id}" alt="전시 그림"><span class="image-loading">불러오는 중…</span></div></div><div class="frame-nav"><button class="button ghost" data-prev ${i === 0 ? "disabled" : ""}>이전</button><span>${i + 1} / ${list.length}</span><button class="button ghost" data-next ${i === list.length - 1 ? "disabled" : ""}>다음</button></div><div class="frame-info"><button class="secret-word" data-secret>제시어 보기 </button><div class="meta"><span>그린 사람: ${escapeHtml(drawerName(d))}</span><span>${d.status === "solved" ? `맞힌 사람: ${escapeHtml(solverName(d))}` : "맞힌 사람: 없음"}</span></div>${galleryArtistButton(d, false)}<button class="button like-button ${isOwnDrawing(d) ? "ghost" : "secondary"} ${d.isLiked ? "is-liked" : ""} full" data-like="${d.id}" aria-pressed="${d.isLiked ? "true" : "false"}" ${isOwnDrawing(d) ? "disabled" : ""}><span class="heart" aria-hidden="true">${d.isLiked ? "♥" : "♡"}</span> 좋아요 <span data-like-count>${Number(d.likeCount) || 0}</span>${isOwnDrawing(d) ? " · 내 그림" : ""}</button></div>`;
}
function galleryArtistButton(drawing, compact = false) {
  if (state.galleryArtistDrawingId || !galleryArtistIdentity(drawing)) return "";
  const name = drawerName(drawing);
  const visibleName = isOwnDrawing(drawing) ? "내" : escapeHtml(name);
  const label = escapeAttribute(`${name}님의 작품 보기`);
  return `<button class="gallery-artist-button${compact ? " compact-artist-button" : ""}" data-artist-drawing="${drawing.id}" aria-label="${label}"><span aria-hidden="true">👤</span><span class="artist-button-name">${visibleName}${isOwnDrawing(drawing) ? "" : "님"}</span><span class="artist-button-action">작품 보기 〉</span></button>`;
}
function galleryThumbs(list) {
  return `<div class="thumbnail-grid">${list.map((d, i) => { const badge = state.galleryArtistDrawingId ? `<span class="gallery-status-badge">${d.status === "solved" ? "완성 액자" : "미해결 그림"}</span>` : ""; return `<div class="thumbnail-wrap ${Number(d.likeCount) > 0 ? "has-likes" : ""}" data-gallery-card="${d.id}"><button class="thumbnail" data-thumb="${i}"><div class="gallery-image-slot">${badge}<img data-thumbnail-image="${d.id}" alt="전시 그림"><span class="image-loading">불러오는 중…</span></div><small>· ${escapeHtml(drawerName(d))}</small></button><button class="thumbnail-like-button ${d.isLiked ? "is-liked" : ""}" data-like="${d.id}" aria-label="좋아요" aria-pressed="${d.isLiked ? "true" : "false"}" ${isOwnDrawing(d) ? "disabled" : ""}><span class="heart">${d.isLiked ? "♥" : "♡"}</span> <span data-like-count>${Number(d.likeCount) || 0}</span></button>${galleryArtistButton(d, true)}${state.isAdmin ? `<button class="button danger admin-delete-button" data-admin-delete="${d.id}">관리자 삭제</button>` : ""}</div>`; }).join("")}</div>`;
}
function renderGalleryContent(list = state.galleryLists[galleryListKey()] || []) {
  const content = document.querySelector("#galleryContent");
  if (!content) return;
  document.querySelector(".gallery-screen")?.classList.toggle("gallery-detail", state.galleryView === "frame");
  content.innerHTML = list.length ? (state.galleryView === "frame" ? galleryFrame(list, state.galleryIndex) : galleryThumbs(list)) : emptyHtml("🖼️", state.galleryArtistDrawingId ? "이 작가의 전시 작품이 아직 없어요." : "아직 전시된 그림이 없어요.");
  bindGalleryContent(list);
}
function bindGalleryShell() {
  document.querySelectorAll("[data-gallery-tab]").forEach(button => button.onclick = () => {
    state.galleryScroll[galleryListKey()] = 0;
    state.galleryTab = button.dataset.galleryTab; state.galleryIndex = 0; state.galleryView = "thumb";
    history.replaceState(galleryHistoryState(false), "", "#gallery"); renderGallery();
  });
  gallerySort.onchange = () => { state.galleryScroll[galleryListKey()] = 0; state.gallerySort = gallerySort.value; state.galleryIndex = 0; history.replaceState(galleryHistoryState(false), "", "#gallery"); renderGallery(); };
  document.querySelector("[data-gallery-return]")?.addEventListener("click", returnFromArtistGallery);
  document.querySelector("[data-open-migration]")?.addEventListener("click", openMigrationPanel);
}
function moveGalleryIndex(delta, list) {
  state.galleryIndex += delta;
  history.replaceState(galleryHistoryState(true), "", "#gallery");
  renderGalleryContent(list);
}
function bindGalleryContent(list) {
  const request = { routeName: "gallery", transitionId: routeTransitionId, requestId: screenRequestIds.gallery };
  document.querySelector("[data-prev]")?.addEventListener("click", () => moveGalleryIndex(-1, list));
  document.querySelector("[data-next]")?.addEventListener("click", () => moveGalleryIndex(1, list));
  document.querySelector("[data-secret]")?.addEventListener("click", e => { e.currentTarget.textContent = `제시어: ${list[state.galleryIndex].word}`; });
  document.querySelectorAll("[data-thumb]").forEach(button => button.onclick = () => {
    state.galleryScroll[galleryListKey()] = scrollY; state.galleryIndex = Number(button.dataset.thumb); state.galleryView = "frame";
    history.pushState(galleryHistoryState(true, { galleryHasArtistListBack: !!state.galleryArtistDrawingId }), "", "#gallery"); renderGalleryContent(list);
  });
  document.querySelectorAll("[data-artist-drawing]").forEach(button => button.onclick = event => {
    event.stopPropagation();
    const drawing = list.find(item => item.id === button.dataset.artistDrawing && isSafeRecordId(item.id));
    if (drawing) openGalleryArtist(drawing);
  });
  document.querySelectorAll("[data-like]").forEach(button => button.onclick = async event => {
    event.stopPropagation();
    const id = button.dataset.like;
    if (button.disabled || state.pendingLikes.has(id)) return;
    state.pendingLikes.add(id); button.disabled = true;
    try {
      await ensureLikeState(id); await toggleLike(id, list.find(d => d.id === id));
      if (!isScreenRequestCurrent(request)) return;
      syncGalleryLike(id);
    }
    catch (error) { if (isScreenRequestCurrent(request)) showToast(userErrorMessage(error)); }
    finally {
      state.pendingLikes.delete(id);
      if (!isScreenRequestCurrent(request)) return;
      const own = isOwnDrawing(list.find(d => d.id === id));
      document.querySelectorAll(`[data-like="${id}"]`).forEach(item => { item.disabled = own; });
    }
  });
  document.querySelectorAll("[data-admin-delete]").forEach(button => button.onclick = () => confirmModal("관리자 삭제", "관리자 권한으로 이 그림을 전시장에서 숨길까요?", async () => {
    await adminDeleteDrawing(button.dataset.adminDelete);
    if (!isScreenRequestCurrent(request)) return;
    showToast("그림을 전시장에서 숨겼어요."); renderGallery();
  }));
  if (state.galleryView === "thumb") observeGalleryThumbnails(list); else loadGalleryDetail(list[state.galleryIndex], list);
}
function createGalleryLoader() {
  if (state.galleryLoader) {
    state.galleryLoader.cancelled = true;
    state.galleryLoader.queue.length = 0;
  }
  const loader = { queue: [], active: 0, cancelled: false, transitionId: routeTransitionId };
  state.galleryLoader = loader;
  return loader;
}
function isGalleryLoaderCurrent(loader) {
  return !loader.cancelled && state.galleryLoader === loader && isTransitionCurrent(loader.transitionId, "gallery");
}
function enqueueGalleryLoad(loader, task) {
  if (loader.cancelled) return;
  loader.queue.push(task);
  runGalleryLoadQueue(loader);
}
function runGalleryLoadQueue(loader) {
  while (!loader.cancelled && loader.active < IMAGE_OPTIONS.maxConcurrentLoads && loader.queue.length) {
    loader.active++;
    const task = loader.queue.shift();
    Promise.resolve(task()).finally(() => {
      loader.active--;
      if (!loader.cancelled) runGalleryLoadQueue(loader);
    });
  }
}
function observeGalleryThumbnails(list) {
  state.galleryObserver?.disconnect();
  const loader = createGalleryLoader();
  const started = performance.now();
  const images = [...document.querySelectorAll("[data-thumbnail-image]")];
  const initiallyVisible = new Set(images.filter(image => image.getBoundingClientRect().top < innerHeight + 40));
  let visibleLogged = false;
  const load = image => {
    if (image.dataset.queued) return;
    image.dataset.queued = "true";
    const drawing = list.find(item => item.id === image.dataset.thumbnailImage);
    enqueueGalleryLoad(loader, async () => {
      const first = !state.thumbnailCache.size;
      try {
        const [src] = await Promise.all([loadDrawingImage(drawing, "thumbnail"), ensureLikeState(drawing.id)]);
        if (!isGalleryLoaderCurrent(loader) || !image.isConnected) return;
        image.src = src; image.classList.add("loaded");
        image.parentElement.querySelector(".image-loading")?.remove();
        syncGalleryLike(drawing.id);
        if (first) console.info(`[gallery] first thumbnail ${Math.round(performance.now() - started)}ms`);
        initiallyVisible.delete(image);
        if (!initiallyVisible.size && !visibleLogged) { visibleLogged = true; console.info(`[gallery] visible thumbnails complete ${Math.round(performance.now() - started)}ms`); }
      } catch (_) {
        if (!isGalleryLoaderCurrent(loader) || !image.isConnected) return;
        image.parentElement.innerHTML = `<button class="image-retry" data-image-retry="${drawing.id}">다시 불러오기</button>`;
        document.querySelector(`[data-image-retry="${drawing.id}"]`)?.addEventListener("click", () => { state.thumbnailCache.delete(drawing.id); renderGalleryContent(list); });
      }
    });
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting && isGalleryLoaderCurrent(loader)) { observer.unobserve(entry.target); load(entry.target); } }), { rootMargin: "240px" });
    state.galleryObserver = observer;
    images.forEach(image => state.galleryObserver.observe(image));
  } else images.forEach(load);
}
async function ensureLikeState(id) {
  if (state.likeCache.has(id)) return state.likeCache.get(id);
  const userId = state.user?.id;
  const generation = state.cacheGeneration;
  if (!userId) return { count: 0, liked: false };
  const snap = await db.ref(`drawingLikes/${id}`).once("value");
  const likes = safeObject(snap.val());
  const value = { count: Object.keys(likes).length, liked: likes[userId] === true };
  if (!isCacheSessionCurrent(userId, generation)) return value;
  state.likeCache.set(id, value);
  for (const list of Object.values(state.galleryLists)) {
    const drawing = list.find(item => item.id === id);
    if (drawing) Object.assign(drawing, { likeCount: value.count, isLiked: value.liked });
  }
  for (const list of Object.values(state.galleryMetadata || {})) {
    const drawing = list.find(item => item.id === id);
    if (drawing) Object.assign(drawing, { likeCount: value.count, isLiked: value.liked });
  }
  return value;
}
function syncGalleryLike(id) {
  const value = state.likeCache.get(id);
  if (!value) return;
  document.querySelectorAll(`[data-gallery-card="${id}"]`).forEach(card => card.classList.toggle("has-likes", value.count > 0));
  document.querySelectorAll(`[data-like="${id}"]`).forEach(button => {
    button.classList.toggle("is-liked", value.liked);
    button.setAttribute("aria-pressed", String(value.liked));
    const heart = button.querySelector(".heart"); if (heart) heart.textContent = value.liked ? "♥" : "♡";
    const count = button.querySelector("[data-like-count]"); if (count) count.textContent = value.count;
  });
}
async function loadGalleryDetail(drawing, list) {
  if (!drawing) return;
  const loader = createGalleryLoader();
  const started = performance.now();
  try {
    const [src] = await Promise.all([loadDrawingImage(drawing), ensureLikeState(drawing.id)]);
    if (!isGalleryLoaderCurrent(loader)) return;
    const image = document.querySelector(`[data-detail-image="${drawing.id}"]`);
    if (image) { image.src = src; image.classList.add("loaded"); image.parentElement.querySelector(".image-loading")?.remove(); }
    syncGalleryLike(drawing.id);
    console.info(`[gallery] detail ${Math.round(performance.now() - started)}ms · server list reread=false`);
    const neighbor = list[state.galleryIndex + 1] || list[state.galleryIndex - 1];
    if (neighbor) loadDrawingImage(neighbor).catch(() => {});
  } catch (_) {
    if (!isGalleryLoaderCurrent(loader)) return;
    const slot = document.querySelector(`[data-detail-image="${drawing.id}"]`)?.parentElement;
    if (slot) slot.innerHTML = `<button class="image-retry" data-detail-retry>이미지 다시 불러오기</button>`;
    slot?.querySelector("[data-detail-retry]")?.addEventListener("click", () => { state.detailImageCache.delete(drawing.id); renderGalleryContent(list); });
  }
}
function openMigrationPanel() {
  if (!state.isAdmin) return;
  state.migrationCursor = null;
  const root = document.querySelector("#modalRoot");
  root.innerHTML = `<div class="modal-backdrop"><div class="modal migration-modal"><h3>기존 그림 최적화</h3><p><b>시작 전에 Realtime Database JSON 백업을 꼭 받아주세요.</b>\n한 번에 ${IMAGE_OPTIONS.migrationBatch}개씩 처리하며, 중단 후 다시 실행할 수 있습니다.</p><div class="button-row"><button class="button ghost" data-migration-cancel>취소</button><button class="button danger" data-migration-start>백업 완료 · 시작</button></div></div></div>`;
  root.querySelector("[data-migration-cancel]").onclick = () => { root.innerHTML = ""; };
  root.querySelector("[data-migration-start]").onclick = async () => {
    root.innerHTML = `<div class="modal-backdrop"><div class="modal migration-modal"><h3>기존 그림 최적화</h3><div data-migration-status>그림 목록을 확인하는 중...</div><button class="button secondary full" data-migrate-next disabled>다음 ${IMAGE_OPTIONS.migrationBatch}개 처리</button><button class="button ghost full" data-migration-close>닫기</button></div></div>`;
    root.querySelector("[data-migration-close]").onclick = () => { root.innerHTML = ""; };
    root.querySelector("[data-migrate-next]").onclick = () => runMigrationBatch(root);
    await runMigrationBatch(root);
  };
}
function isValidMigrationCursor(cursor) {
  return typeof cursor === "string" && cursor.trim().length > 0 && !/[.#$\/[\]\u0000-\u001F\u007F]/.test(cursor);
}
function buildMigrationQuery(ref, cursor, batchSize) {
  let query = ref.orderByKey();
  if (isValidMigrationCursor(cursor)) return query.startAt(cursor).limitToFirst(batchSize + 1);
  return query.limitToFirst(batchSize);
}
function migrationBatchItems(snapshot, cursor, batchSize) {
  const items = [];
  let first = true;
  snapshot.forEach(child => {
    if (first && isValidMigrationCursor(cursor) && child.key === cursor) { first = false; return; }
    first = false;
    items.push({ ...(child.val() || {}), id: child.key });
  });
  return items.slice(0, batchSize);
}
function migrationNextCursor(batchStartCursor, items, failed) {
  return failed || !items.length ? batchStartCursor : items[items.length - 1].id;
}
function migrationTimeout(promise, stage) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => { const error = new Error(`${stage} 시간 초과`); error.code = "migration/timeout"; reject(error); }, IMAGE_OPTIONS.migrationTimeout); })
  ]).finally(() => clearTimeout(timer));
}
function migrationErrorMessage(error, stage) {
  if (error?.code === "migration/timeout") return `${stage} 시간이 초과되었습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.`;
  if (error?.code === "PERMISSION_DENIED" || error?.code === "permission_denied") return "관리자 권한을 확인할 수 없습니다. Firebase 규칙과 관리자 등록을 확인해 주세요.";
  if (stage === "그림 목록 조회") return "그림 목록을 불러오지 못했습니다. 네트워크 상태와 Firebase 규칙을 확인한 뒤 다시 시도해 주세요.";
  return "최적화 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}
async function runMigrationBatch(root) {
  const status = root.querySelector("[data-migration-status]");
  const nextButton = root.querySelector("[data-migrate-next]");
  const closeButton = root.querySelector("[data-migration-close]");
  if (state.migrationRunning || !status || !nextButton) return;
  state.migrationRunning = true;
  nextButton.disabled = true;
  if (closeButton) closeButton.disabled = true;
  let canContinue = false;
  let stage = "관리자 권한 확인";
  const totals = { success: 0, failed: 0, skipped: 0, unsafeSkipped: 0, original: 0, converted: 0 };
  try {
    status.textContent = "그림 목록을 확인하는 중...";
    if (!state.isAdmin || auth.currentUser?.uid !== state.user?.id) { const error = new Error("관리자 권한 없음"); error.code = "PERMISSION_DENIED"; throw error; }
    stage = "그림 목록 조회";
    status.textContent = "처리할 그림을 불러오는 중...";
    const batchStartCursor = state.migrationCursor;
    const query = buildMigrationQuery(db.ref("drawings"), batchStartCursor, IMAGE_OPTIONS.migrationBatch);
    const snap = await migrationTimeout(query.once("value"), stage);
    const items = migrationBatchItems(snap, batchStartCursor, IMAGE_OPTIONS.migrationBatch);
    if (!items.length) {
      status.textContent = state.migrationCursor ? "모든 기존 그림의 최적화가 완료되었습니다." : "최적화할 기존 그림이 없습니다.";
      return;
    }
    for (let index = 0; index < items.length; index++) {
      const drawing = items[index];
      if (!isSafeRecordId(drawing.id)) {
        totals.skipped++;
        totals.unsafeSkipped++;
        console.warn(`[gallery migration] unsafe drawing ID 건너뜀: ${drawing.id}`);
        continue;
      }
      if (!drawing.imageData) { totals.skipped++; continue; }
      try {
        let optimized = null;
        if (!drawing.imageReady) {
          stage = "이미지 변환"; status.textContent = `${index + 1}/${items.length} 이미지 변환 중... · 성공 ${totals.success} · 실패 ${totals.failed} · 건너뜀 ${totals.skipped}`;
          optimized = await migrationTimeout(optimizeDataUrl(drawing.imageData), stage);
          totals.original += dataUrlBytes(drawing.imageData); totals.converted += optimized.imageBytes + optimized.thumbnailBytes;
          stage = "새 이미지 저장"; status.textContent = `${index + 1}/${items.length} 새 이미지 저장 중... · 성공 ${totals.success} · 실패 ${totals.failed} · 건너뜀 ${totals.skipped}`;
          await migrationTimeout(db.ref().update({ [`drawingImages/${drawing.id}/imageData`]: optimized.imageData, [`drawingThumbnails/${drawing.id}/imageData`]: optimized.thumbnailData }), stage);
        }
        stage = "저장 결과 확인"; status.textContent = `${index + 1}/${items.length} 저장 결과 확인 중... · 성공 ${totals.success} · 실패 ${totals.failed} · 건너뜀 ${totals.skipped}`;
        const [imageCheck, thumbnailCheck] = await migrationTimeout(Promise.all([db.ref(`drawingImages/${drawing.id}/imageData`).once("value"), db.ref(`drawingThumbnails/${drawing.id}/imageData`).once("value")]), stage);
        if (!imageCheck.exists() || !thumbnailCheck.exists()) { const error = new Error("저장 확인 실패"); error.code = "migration/verify-failed"; throw error; }
        if (optimized) await migrationTimeout(db.ref(`drawings/${drawing.id}`).update({ imageVersion: IMAGE_OPTIONS.version, imageFormat: optimized.imageFormat, imageWidth: optimized.imageWidth, imageHeight: optimized.imageHeight, imageBytes: optimized.imageBytes, thumbnailBytes: optimized.thumbnailBytes, imageReady: true }), "메타데이터 저장");
        stage = "기존 이미지 정리"; status.textContent = `${index + 1}/${items.length} 기존 이미지 정리 중... · 성공 ${totals.success} · 실패 ${totals.failed} · 건너뜀 ${totals.skipped}`;
        await migrationTimeout(db.ref(`drawings/${drawing.id}/imageData`).remove(), stage);
        totals.success++;
      } catch (error) {
        totals.failed++;
        console.error(`[gallery migration] ${stage}`, error?.code || "unknown", error);
      }
    }
    const saved = Math.max(0, totals.original - totals.converted);
    const resultTitle = totals.failed > 0 ? "최적화 중 오류가 발생했습니다." : totals.success === 0 ? "모든 기존 그림의 최적화가 완료되었습니다." : "최적화 완료";
    status.innerHTML = `<p>${resultTitle}</p><p>성공 ${totals.success} · 실패 ${totals.failed} · 건너뜀 ${totals.skipped} (unsafe ID ${totals.unsafeSkipped})</p><p>원본 ${Math.round(totals.original / 1024)}KB · 변환 후 ${Math.round(totals.converted / 1024)}KB · 절감 ${Math.round(saved / 1024)}KB</p>`;
    state.migrationCursor = migrationNextCursor(batchStartCursor, items, totals.failed > 0);
    canContinue = totals.failed > 0 || items.length >= IMAGE_OPTIONS.migrationBatch;
  } catch (error) {
    status.textContent = migrationErrorMessage(error, stage);
    console.error(`[gallery migration] ${stage}`, error?.code || "unknown", error);
    canContinue = true;
  } finally {
    state.migrationRunning = false;
    if (root.querySelector("[data-migrate-next]")) nextButton.disabled = !canContinue;
    if (root.querySelector("[data-migration-close]") && closeButton) closeButton.disabled = false;
  }
}

function hasLegacyRankingClaims(claims) {
  return Object.values(safeObject(claims)).some(userClaims => Object.values(safeObject(userClaims)).some(claim =>
    !claim || typeof claim !== "object" || !["drawer", "solver"].includes(claim.type)
  ));
}
function buildRankingSnapshot(usersSnap, claims, drawings = {}) {
  const snapshot = [];
  usersSnap.forEach(child => {
    const u = child.val() || {};
    const nickname = u.nickname || u.displayName || "";
    if (u.rankingDeleted || nickname.toLowerCase() === "admin") return;
    const scores = { total: 0, drawer: 0, solver: 0 };
    for (const [drawingId, claim] of Object.entries(safeObject(claims[child.key]))) {
      const inferredType = claimType(claim, drawings[drawingId], child.key);
      const score = claimScore(claim);
      scores.total += score;
      if (inferredType) scores[inferredType] += score;
    }
    snapshot.push({ id: child.key, ...u, nickname, scores });
  });
  return snapshot;
}
function rankingListFromSnapshot(snapshot, type = state.rankingType) {
  return snapshot.map(user => ({ ...user, score: user.scores[type] || 0 }))
    .sort((a, b) => (b.score || 0) - (a.score || 0) || a.createdAt - b.createdAt)
    .slice(0, 30);
}
function loadRankingSnapshot() {
  if (state.rankingSnapshot) return Promise.resolve(state.rankingSnapshot);
  if (state.rankingSnapshotPromise) return state.rankingSnapshotPromise;
  const userId = state.user?.id;
  const generation = state.cacheGeneration;
  if (!userId) return Promise.resolve([]);
  let snapshotPromise;
  snapshotPromise = (async () => {
    try {
      const [usersSnap, claimsSnap] = await Promise.all([db.ref("users").once("value"), db.ref("scoreClaims").once("value")]);
      const claims = safeObject(claimsSnap.val());
      const drawings = hasLegacyRankingClaims(claims) ? safeObject((await db.ref("drawings").once("value")).val()) : {};
      const snapshot = buildRankingSnapshot(usersSnap, claims, drawings);
      if (state.route === "ranking" && isCacheSessionCurrent(userId, generation) && state.rankingSnapshotPromise === snapshotPromise) {
        state.rankingSnapshot = snapshot;
      }
      return snapshot;
    } finally {
      if (state.rankingSnapshotPromise === snapshotPromise) state.rankingSnapshotPromise = null;
    }
  })();
  state.rankingSnapshotPromise = snapshotPromise;
  return snapshotPromise;
}
async function loadRanking(type = state.rankingType) {
  return rankingListFromSnapshot(await loadRankingSnapshot(), type);
}
async function renderRanking() {
  const request = beginScreenRequest("ranking");
  if (!state.rankingSnapshot) loading(request);
  try {
    const list = await loadRanking();
    if (!isScreenRequestCurrent(request)) return;
    const labels = { total: "종합 랭킹", drawer: "그리기 랭킹", solver: "맞히기 랭킹" };
    appEl.innerHTML = `<section class="screen"><h2>랭킹</h2><p class="muted">${labels[state.rankingType]} 상위 30명까지 보여드려요.</p><div class="tabs ranking-tabs"><button data-ranking="total" class="${state.rankingType === "total" ? "active" : ""}">종합</button><button data-ranking="drawer" class="${state.rankingType === "drawer" ? "active" : ""}">그리기</button><button data-ranking="solver" class="${state.rankingType === "solver" ? "active" : ""}">맞히기</button></div><div>${list.map((u, i) => `<div class="rank-row ${u.id === state.user.id ? "mine" : ""}"><div class="rank-num">${i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</div><div><b>${escapeHtml(u.nickname)}</b>${u.id === state.user.id ? "<small> · 나</small>" : ""}</div><div class="rank-score">${Number(u.score) || 0}점</div></div>`).join("") || emptyHtml("", "아직 랭킹이 비어 있어요.")}</div><button id="deleteRanking" class="button danger full" style="margin-top:20px">내 랭킹 삭제</button></section>`;
    document.querySelectorAll("[data-ranking]").forEach(button => button.onclick = () => { state.rankingType = button.dataset.ranking; renderRanking(); });
    document.querySelector("#deleteRanking").onclick = () => confirmModal("정말 내 랭킹을 삭제할까요?", "내 점수와 랭킹 기록이 사라집니다.\n하지만 이미 전시장에 올라간 그림은 삭제되지 않습니다.", async () => {
      await deleteMyRanking();
      if (!isScreenRequestCurrent(request)) return;
      showToast("랭킹을 삭제했어요.\n다음 로그인부터 0점으로 다시 참여해요.");
      await signOut();
    });
  } catch (error) {
    if (!isScreenRequestCurrent(request)) return;
    console.error(error);
  }
}
async function deleteMyRanking() {
  const now = serverNow();
  await db.ref().update({
    [`users/${state.user.id}/score`]: 0,
    [`users/${state.user.id}/rankingDeleted`]: true,
    [`users/${state.user.id}/rankingDeletedAt`]: now,
    [`users/${state.user.id}/lastSeenAt`]: now,
    [`scoreClaims/${state.user.id}`]: null
  });
}
function cancelManageImageLoading() {
  state.manageObserver?.disconnect();
  state.manageObserver = null;
  if (state.manageLoader) {
    state.manageLoader.cancelled = true;
    state.manageLoader.queue.length = 0;
    state.manageLoader.pendingWaiters.forEach(cancel => cancel());
    state.manageLoader.pendingWaiters.clear();
    state.manageLoader = null;
  }
  state.manageEditRequestId++;
}
function createManageLoader(request) {
  cancelManageImageLoading();
  const loader = { queue: [], active: 0, cancelled: false, transitionId: request.transitionId, request, pendingWaiters: new Set() };
  state.manageLoader = loader;
  return loader;
}
function isManageLoaderCurrent(loader) { return !loader.cancelled && state.manageLoader === loader && isScreenRequestCurrent(loader.request); }
function runManageImageQueue(loader) {
  while (!loader.cancelled && loader.active < IMAGE_OPTIONS.maxConcurrentLoads && loader.queue.length) {
    loader.active++;
    const task = loader.queue.shift();
    Promise.resolve(task()).finally(() => { loader.active--; if (!loader.cancelled) runManageImageQueue(loader); });
  }
}
function manageImageMarkup(id) { return `<img data-manage-image="${id}" alt="내 그림"><span class="image-loading">불러오는 중…</span>`; }
function queueManageImage(loader, image, drawing) {
  if (!image || !drawing || image.dataset.queued || !isManageLoaderCurrent(loader)) return;
  image.dataset.queued = "true";
  loader.queue.push(async () => {
    try {
      const src = await loadDrawingImage(drawing, "thumbnail");
      if (!isManageLoaderCurrent(loader) || !image.isConnected) return;
      const result = await waitForSolveImageLoad(image, src, loader);
      if (result === "cancelled" || !isManageLoaderCurrent(loader) || !image.isConnected) return;
      if (result !== "loaded") throw new Error("manage-image-render-failed");
      const slot = image.parentElement;
      if (!slot?.isConnected || slot.querySelector(`[data-manage-image="${drawing.id}"]`) !== image) return;
      image.classList.add("loaded");
      slot.querySelector(".image-loading")?.remove();
    } catch (_) {
      if (!isManageLoaderCurrent(loader) || !image.isConnected) return;
      const slot = image.parentElement;
      if (!slot?.isConnected || slot.querySelector(`[data-manage-image="${drawing.id}"]`) !== image) return;
      slot.innerHTML = `<span class="image-error">이미지를 불러오지 못했어요.</span><button class="image-retry" data-manage-retry="${drawing.id}">다시 불러오기</button>`;
      const retry = slot.querySelector("[data-manage-retry]");
      retry.onclick = () => {
        if (retry.disabled || !isManageLoaderCurrent(loader)) return;
        retry.disabled = true;
        state.thumbnailCache.delete(drawing.id);
        slot.innerHTML = manageImageMarkup(drawing.id);
        queueManageImage(loader, slot.querySelector("[data-manage-image]"), drawing);
      };
    }
  });
  runManageImageQueue(loader);
}
function observeManageImages(list, request) {
  const loader = createManageLoader(request);
  const images = [...document.querySelectorAll("[data-manage-image]")];
  const queue = image => queueManageImage(loader, image, list.find(d => d.id === image.dataset.manageImage));
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting && isManageLoaderCurrent(loader)) { observer.unobserve(entry.target); queue(entry.target); }
    }), { rootMargin: "240px" });
    state.manageObserver = observer;
    images.forEach(image => observer.observe(image));
  } else images.forEach(queue);
  return loader;
}
async function loadManageDrawings() {
  const userId = state.user?.id;
  if (!userId) return [];
  await expireOldDrawings();
  const snap = await db.ref("drawings").orderByChild("drawerId").equalTo(userId).once("value");
  const drawings = [];
  snap.forEach(child => {
    const drawing = child.val() || {};
    if (drawing.drawerId === userId && /^[A-Za-z0-9_-]{1,80}$/.test(child.key) && (drawing.imageData || drawing.imageReady === true)) drawings.push({ ...drawing, id: child.key });
    else if (drawing.drawerId === userId && !/^[A-Za-z0-9_-]{1,80}$/.test(child.key)) console.warn("[security] 안전하지 않은 drawing ID를 표시에서 제외했습니다.", child.key);
  });
  return drawings.sort((a, b) => b.createdAt - a.createdAt);
}
async function loadManageEditDrawing(drawing, button, request) {
  const operationId = ++state.manageEditRequestId;
  const originalText = button.textContent;
  const originalDisabled = button.disabled;
  button.disabled = true;
  button.textContent = "불러오는 중…";
  const ownsResult = () => state.route === "manage" && isScreenRequestCurrent(request) && state.manageEditRequestId === operationId && button.isConnected;
  const canRestoreButton = () => state.route === "manage" && isScreenRequestCurrent(request) && button.isConnected;
  try {
    const imageData = await loadDrawingImage(drawing, "detail");
    if (!ownsResult()) return;
    state.editDrawing = { ...drawing, imageData };
    state.word = { word: drawing.word, category: drawing.category, answers: drawing.answers || [drawing.word], isCustomWord: !!drawing.isCustomWord };
    route("draw");
  } catch (error) {
    if (ownsResult()) showToast(userErrorMessage(error, "그림을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."));
  } finally {
    if (canRestoreButton()) { button.disabled = originalDisabled; button.textContent = originalText; }
  }
}
function updateManageDrawingAfterWithdraw(drawingId, now = serverNow()) {
  const drawing = state.manageDrawings?.find(item => item.id === drawingId);
  if (!drawing) return false;
  Object.assign(drawing, { status: "withdrawn", withdrawnAt: now, updatedAt: now });
  return true;
}
async function renderManage() {
  const request = beginScreenRequest("manage");
  if (!isConfigured()) { if (isScreenRequestCurrent(request)) appEl.innerHTML = '<section class="screen"><div class="empty">Firebase 설정을 연결해 주세요.</div></section>'; return; }
  cancelManageImageLoading();
  if (!state.manageDrawings) loading(request);
  try {
    if (!state.manageDrawings) {
      const drawings = await loadManageDrawings();
      if (!isScreenRequestCurrent(request)) return;
      state.manageDrawings = drawings;
    }
    const list = state.manageDrawings.filter(d => d.status === state.manageStatus);
    if (!isScreenRequestCurrent(request)) return;
    appEl.innerHTML = `<section class="screen"><h2>내 그림 관리</h2><p class="muted">내가 그린 그림을 상태별로 모아봐요.</p><button id="newDrawingFromManage" class="button primary manage-new-drawing">✏️ 새 그림 그리기</button><div class="tabs status-tabs">${Object.entries(STATUS_LABEL).map(([k, v]) => `<button data-status="${k}" class="${state.manageStatus === k ? "active" : ""}">${v}</button>`).join("")}</div><div style="margin-top:15px">${list.length ? list.map(manageCard).join("") : emptyHtml("", "여기에 해당하는 그림이 없어요.")}</div></section>`;
    document.querySelector("#newDrawingFromManage").onclick = event => {
      if (event.currentTarget.disabled) return;
      event.currentTarget.disabled = true;
      startNewDrawing();
    };
    document.querySelectorAll("[data-status]").forEach(button => button.onclick = () => {
      state.manageStatus = button.dataset.status;
      renderManage();
    });
    document.querySelectorAll("[data-edit]").forEach(button => button.onclick = () => {
      const drawing = list.find(item => item.id === button.dataset.edit);
      if (drawing) loadManageEditDrawing(drawing, button, request);
    });
    document.querySelectorAll("[data-withdraw]").forEach(button => button.onclick = () => confirmModal("정말 이 그림을 회수할까요?", "회수한 그림은 복구할 수 없고,\n전시장에도 전시되지 않습니다.", async () => {
      await withdrawDrawing(button.dataset.withdraw);
      if (!isScreenRequestCurrent(request)) return;
      updateManageDrawingAfterWithdraw(button.dataset.withdraw);
      showToast("그림을 회수했어요.");
      renderManage();
    }));
    observeManageImages(list, request);
  } catch (error) {
    if (!isScreenRequestCurrent(request)) return;
    console.error(error);
    appEl.innerHTML = `<section class="screen">${emptyHtml("", "그림을 불러오지 못했어요.")}</section>`;
  }
}
function manageCard(d) {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(d?.id || "")) return "";
  return `<article class="card drawing-card" data-manage-card="${d.id}"><div class="solve-image-slot manage-image-slot" data-manage-slot="${d.id}">${manageImageMarkup(d.id)}</div><div class="meta"><span class="badge ${d.status}">${STATUS_LABEL[d.status]}</span><span>제시어: ${escapeHtml(d.word)}</span>${d.status === "open" ? `<span>남은 시간: ${formatTime(d.expiresAt)}</span><span>수정 ${Number(d.revisionCount) || 0}회</span>` : ""}</div>${d.status === "open" ? `<div class="notice">정답을 맞히면 그린 사람에게 30점!</div><div class="button-row"><button class="button secondary" data-edit="${d.id}">수정하기</button><button class="button danger" data-withdraw="${d.id}">회수하기</button></div>` : d.status === "solved" ? `<p>맞힌 사람: <b>${escapeHtml(solverName(d))}</b><br>획득 점수: <b>${Number(d.drawerReward) || 0}점</b></p>` : d.status === "expired" ? "<p>아무도 맞히지 못했어요.<br>획득 점수: <b>0점</b></p>" : '<p class="muted">회수한 그림은 다시 복구할 수 없어요.</p>'}</article>`;
}
function feedbackOperationContext(request = null) {
  return { uid: state.user?.id || null, generation: state.cacheGeneration, request };
}
function isFeedbackContextCurrent(context, requireScreen = false) {
  return !!context?.uid && isCacheSessionCurrent(context.uid, context.generation) &&
    (!requireScreen || (state.route === "feedback" && (!context.request || isScreenRequestCurrent(context.request))));
}
function feedbackPendingKey(type, id = "global") { return `${type}:${id}`; }
function beginFeedbackPending(type, id, context) {
  const key = feedbackPendingKey(type, id);
  if (!isFeedbackContextCurrent(context) || state.feedbackPending.has(key)) return null;
  const record = { key, context };
  state.feedbackPending.set(key, record);
  return record;
}
function endFeedbackPending(record) { if (record && state.feedbackPending.get(record.key) === record) state.feedbackPending.delete(record.key); }
function feedbackMetaById(id) { return state.feedbackSnapshot?.items?.find(item => item.id === id) || null; }
function feedbackCanRead(meta, uid = state.user?.id, isAdmin = state.isAdmin) {
  return !!meta && !meta.deleted && (!meta.hidden || isAdmin) && (!meta.isSecret || meta.isMine || isAdmin) && !!uid;
}
function feedbackCanReact(meta) { return !!meta && !meta.deleted && !meta.hidden && !meta.isSecret && !meta.isMine; }
function recalculateFeedbackReaction(meta, reactions, uid) {
  const values = Object.values(safeObject(reactions));
  meta.likeCount = values.filter(value => value === "like").length;
  meta.dislikeCount = values.filter(value => value === "dislike").length;
  meta.popularityScore = meta.likeCount - meta.dislikeCount;
  meta.myReaction = safeObject(reactions)[uid] || null;
  return meta;
}
function feedbackSnapshotList() {
  const items = state.feedbackSnapshot?.items || [];
  const visible = items.filter(meta => !meta.deleted && (state.isAdmin || !meta.hidden) && (state.feedbackView !== "mine" || meta.isMine));
  const comparators = {
    new: (a, b) => b.createdAt - a.createdAt,
    old: (a, b) => a.createdAt - b.createdAt,
    popular: (a, b) => (b.popularityScore || 0) - (a.popularityScore || 0),
    likes: (a, b) => (b.likeCount || 0) - (a.likeCount || 0),
    dislikes: (a, b) => (b.dislikeCount || 0) - (a.dislikeCount || 0)
  };
  return [...visible].sort(comparators[state.feedbackSort] || comparators.new).map(meta => ({ ...meta, content: state.feedbackBodyCache.get(meta.id) || null }));
}
function loadFeedbackSnapshot(preferCache = false) {
  const context = feedbackOperationContext();
  if (!context.uid) throw new Error("로그인이 필요해요.");
  const cached = state.feedbackSnapshot;
  if (cached?.uid === context.uid && cached.generation === context.generation && (preferCache || serverNow() - cached.loadedAt < FEEDBACK_CACHE_TTL_MS)) return cached;
  if (state.feedbackSnapshotPromise?.uid === context.uid && state.feedbackSnapshotPromise.generation === context.generation) return state.feedbackSnapshotPromise.promise;
  const loadPromise = Promise.all([
    db.ref("feedbackMeta").once("value"),
    db.ref(`userFeedback/${context.uid}`).once("value"),
    db.ref("feedbackReactions").once("value")
  ]).then(([metaSnap, mySnap, reactionsSnap]) => {
    const mine = safeObject(mySnap.val());
    const reactions = safeObject(reactionsSnap.val());
    const items = [];
    metaSnap.forEach(child => {
      if (!/^[A-Za-z0-9_-]{1,80}$/.test(child.key)) { console.warn("[security] 안전하지 않은 feedback ID를 표시에서 제외했습니다.", child.key); return; }
      const meta = { id: child.key, ...child.val(), isMine: !!mine[child.key] };
      recalculateFeedbackReaction(meta, safeObject(reactions[child.key]), context.uid);
      items.push(meta);
    });
    const snapshot = { uid: context.uid, generation: context.generation, loadedAt: serverNow(), items, reactions };
    if (isFeedbackContextCurrent(context)) state.feedbackSnapshot = snapshot;
    return snapshot;
  });
  const record = { uid: context.uid, generation: context.generation, promise: null };
  const promise = loadPromise.finally(() => { if (state.feedbackSnapshotPromise === record) state.feedbackSnapshotPromise = null; });
  record.promise = promise;
  state.feedbackSnapshotPromise = record;
  return promise;
}
async function cleanupIncompleteFeedback(id, uid, context) {
  if (!isFeedbackContextCurrent(context) || context.uid !== uid) return false;
  let snapshots;
  try {
    snapshots = await Promise.all([
      db.ref(`feedbackOwners/${id}/${uid}`).once("value"), db.ref(`userFeedback/${uid}/${id}`).once("value"),
      db.ref(`feedbackMeta/${id}`).once("value"), db.ref(`feedbackContent/${id}`).once("value")
    ]);
  } catch (readError) {
    console.error("의견 작성 cleanup 상태 확인 실패:", readError);
    return false;
  }
  const [ownerSnap, userSnap, metaSnap, contentSnap] = snapshots;
  if (contentSnap.exists()) return false;
  let cleaned = true;
  const remove = async (path, exists) => {
    if (!exists) return;
    try { await db.ref(path).remove(); }
    catch (cleanupError) { cleaned = false; console.error("의견 작성 cleanup 실패:", cleanupError); }
  };
  await remove(`feedbackMeta/${id}`, metaSnap.exists());
  await remove(`userFeedback/${uid}/${id}`, userSnap.exists());
  await remove(`feedbackOwners/${id}/${uid}`, ownerSnap.val() === true);
  return cleaned;
}
async function submitFeedback(content, isAnonymous, isSecret, context = feedbackOperationContext()) {
  content = content.trim();
  if (content.length <= 5) throw new Error("조금만 더 자세히 적어주세요.");
  if (content.length > 300) throw new Error("300자 이내로 줄여주세요.");
  if (!isFeedbackContextCurrent(context)) throw new Error("로그인 상태가 변경됐어요.");
  const uid = context.uid;
  const nickname = state.user.nickname;
  const now = serverNow();
  const ref = db.ref("feedbackMeta").push();
  const id = ref.key;
  const meta = { createdAt: now, updatedAt: now, isAnonymous: !!isAnonymous, isSecret: !!isSecret, displayAuthor: isAnonymous ? "익명" : nickname, status: "open", hidden: false, deleted: false, likeCount: 0, dislikeCount: 0, popularityScore: 0 };
  const body = { content, adminReply: null, repliedAt: null, repliedBy: null, repliedByNickname: null };
  try {
    await db.ref(`feedbackOwners/${id}/${uid}`).set(true);
    await db.ref(`userFeedback/${uid}/${id}`).set(true);
    await db.ref(`feedbackMeta/${id}`).set(meta);
    await db.ref(`feedbackContent/${id}`).set(body);
  } catch (error) {
    await cleanupIncompleteFeedback(id, uid, context);
    throw error;
  }
  if (!isFeedbackContextCurrent(context)) return null;
  const item = { id, ...meta, isMine: true, myReaction: null };
  if (state.feedbackSnapshot) state.feedbackSnapshot.items.unshift(item);
  state.feedbackBodyCache.set(id, body);
  return item;
}
async function loadFeedback(options = {}) {
  await loadFeedbackSnapshot(options.preferCache === true);
  return feedbackSnapshotList();
}
async function updateFeedback(id, content, context = feedbackOperationContext()) {
  content = content.trim();
  if (content.length <= 5) throw new Error("조금만 더 자세히 적어주세요.");
  if (content.length > 300) throw new Error("300자 이내로 줄여주세요.");
  const meta = feedbackMetaById(id);
  if (!meta?.isMine || !isFeedbackContextCurrent(context)) throw new Error("내 의견만 수정할 수 있어요.");
  const updatedAt = serverNow();
  await db.ref().update({ [`feedbackContent/${id}/content`]: content, [`feedbackMeta/${id}/updatedAt`]: updatedAt });
  if (!isFeedbackContextCurrent(context)) return null;
  meta.updatedAt = updatedAt;
  state.feedbackBodyCache.set(id, { ...(state.feedbackBodyCache.get(id) || {}), content });
  return meta;
}
async function deleteFeedback(id, context = feedbackOperationContext()) {
  const meta = feedbackMetaById(id);
  if (!meta?.isMine || !isFeedbackContextCurrent(context)) throw new Error("내 의견만 삭제할 수 있어요.");
  const deletedAt = serverNow();
  await db.ref(`feedbackMeta/${id}`).update({ deleted: true, deletedAt, updatedAt: deletedAt });
  if (!isFeedbackContextCurrent(context)) return false;
  meta.deleted = true; meta.deletedAt = deletedAt; meta.updatedAt = deletedAt;
  state.feedbackBodyCache.delete(id);
  return true;
}
async function saveAdminReply(id, reply, context = feedbackOperationContext()) {
  if (!state.isAdmin || !isFeedbackContextCurrent(context)) throw new Error("관리자만 답변할 수 있어요.");
  reply = reply.trim();
  if (!reply) throw new Error("답변 내용을 입력해 주세요.");
  if (reply.length > 300) throw new Error("답변은 300자 이내로 적어주세요.");
  const now = serverNow();
  const nickname = state.user.nickname;
  await db.ref().update({ [`feedbackContent/${id}/adminReply`]: reply, [`feedbackContent/${id}/repliedAt`]: now, [`feedbackContent/${id}/repliedBy`]: context.uid, [`feedbackContent/${id}/repliedByNickname`]: nickname, [`feedbackMeta/${id}/status`]: "answered", [`feedbackMeta/${id}/updatedAt`]: now });
  if (!isFeedbackContextCurrent(context)) return null;
  const meta = feedbackMetaById(id); if (meta) { meta.status = "answered"; meta.updatedAt = now; }
  state.feedbackBodyCache.set(id, { ...(state.feedbackBodyCache.get(id) || {}), adminReply: reply, repliedAt: now, repliedBy: context.uid, repliedByNickname: nickname });
  return meta;
}
async function toggleFeedbackHidden(id, hidden, context = feedbackOperationContext()) {
  if (!state.isAdmin || !isFeedbackContextCurrent(context)) throw new Error("관리자만 관리할 수 있어요.");
  const updatedAt = serverNow();
  await db.ref(`feedbackMeta/${id}`).update({ hidden, updatedAt });
  if (!isFeedbackContextCurrent(context)) return null;
  const meta = feedbackMetaById(id); if (meta) { meta.hidden = !!hidden; meta.updatedAt = updatedAt; }
  return meta;
}
function cancelFeedbackLoading() {
  state.feedbackObserver?.disconnect();
  state.feedbackObserver = null;
  if (state.feedbackLoader) {
    state.feedbackLoader.cancelled = true;
    state.feedbackLoader.queue.length = 0;
    state.feedbackLoader = null;
  }
}
function isFeedbackLoaderCurrent(loader) {
  return !loader.cancelled && state.feedbackLoader === loader && isScreenRequestCurrent(loader.request) && isFeedbackContextCurrent(loader.context, true);
}
function loadFeedbackBody(meta, context) {
  if (!feedbackCanRead(meta, context.uid, state.isAdmin)) return Promise.resolve(null);
  if (state.feedbackBodyCache.has(meta.id)) return Promise.resolve(state.feedbackBodyCache.get(meta.id));
  const existing = state.feedbackBodyPromises.get(meta.id);
  if (existing?.uid === context.uid && existing.generation === context.generation) return existing.promise;
  const promise = db.ref(`feedbackContent/${meta.id}`).once("value").then(snapshot => {
    const content = snapshot.val();
    if (!content || typeof content !== "object" || Array.isArray(content) || typeof content.content !== "string" || content.content.length < 6 || content.content.length > 300) throw new Error("feedback-content-invalid");
    if (isFeedbackContextCurrent(context)) state.feedbackBodyCache.set(meta.id, content);
    return content;
  });
  const record = { uid: context.uid, generation: context.generation, promise: null };
  const sharedPromise = promise.finally(() => { if (state.feedbackBodyPromises.get(meta.id) === record) state.feedbackBodyPromises.delete(meta.id); });
  record.promise = sharedPromise;
  state.feedbackBodyPromises.set(meta.id, record);
  return sharedPromise;
}
function renderFeedbackBody(slot, item, content) {
  if (!slot?.isConnected || slot.dataset.feedbackBody !== item.id) return;
  item.content = content;
  slot.innerHTML = `<p class="feedback-content">${escapeHtml(content?.content || "")}</p>${content?.adminReply ? `<div class="admin-reply"><b>🛠 운영자 답변</b><p>${escapeHtml(content.adminReply)}</p></div>` : ""}`;
  const textarea = slot.closest("[data-feedback-id]")?.querySelector(`[data-reply-text="${item.id}"]`);
  if (textarea) textarea.value = content?.adminReply || "";
  const article = slot.closest("[data-feedback-id]");
  const editButton = article?.querySelector("[data-edit-feedback]");
  if (editButton && !state.feedbackPending.has(feedbackPendingKey("edit", item.id))) editButton.disabled = false;
  const replyButton = article?.querySelector("[data-admin-reply]");
  if (replyButton && !state.feedbackPending.has(feedbackPendingKey("reply", item.id))) replyButton.disabled = false;
}
function runFeedbackBodyQueue(loader) {
  while (isFeedbackLoaderCurrent(loader) && loader.active < FEEDBACK_BODY_CONCURRENCY && loader.queue.length) {
    const task = loader.queue.shift();
    loader.active++;
    Promise.resolve(task()).finally(() => {
      loader.active--;
      if (isFeedbackLoaderCurrent(loader)) runFeedbackBodyQueue(loader);
    });
  }
}
function queueFeedbackBody(loader, slot, item) {
  if (!slot || slot.dataset.queued || !feedbackCanRead(item, loader.context.uid, state.isAdmin) || !isFeedbackLoaderCurrent(loader)) return;
  slot.dataset.queued = "true";
  loader.queue.push(async () => {
    try {
      const content = await loadFeedbackBody(item, loader.context);
      if (!isFeedbackLoaderCurrent(loader)) return;
      renderFeedbackBody(slot, item, content);
    } catch (_) {
      if (!isFeedbackLoaderCurrent(loader) || !slot.isConnected) return;
      slot.innerHTML = `<span class="feedback-content-error">내용을 불러오지 못했어요.</span><button class="button ghost" data-feedback-retry="${item.id}">다시 불러오기</button>`;
      const retry = slot.querySelector("[data-feedback-retry]");
      retry.onclick = () => {
        if (!isFeedbackLoaderCurrent(loader)) return;
        state.feedbackBodyCache.delete(item.id);
        state.feedbackBodyPromises.delete(item.id);
        delete slot.dataset.queued;
        slot.innerHTML = '<span class="feedback-content-loading">내용을 불러오는 중…</span>';
        queueFeedbackBody(loader, slot, item);
      };
    }
  });
  runFeedbackBodyQueue(loader);
}
function observeFeedbackBodies(list, request) {
  cancelFeedbackLoading();
  const loader = { request, context: feedbackOperationContext(request), queue: [], active: 0, cancelled: false };
  state.feedbackLoader = loader;
  const slots = [...document.querySelectorAll("[data-feedback-body]")];
  const queue = slot => queueFeedbackBody(loader, slot, list.find(item => item.id === slot.dataset.feedbackBody));
  if ("IntersectionObserver" in window) {
    state.feedbackObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      state.feedbackObserver?.unobserve(entry.target);
      queue(entry.target);
    }), { rootMargin: "240px" });
    slots.forEach(slot => state.feedbackObserver.observe(slot));
  } else slots.forEach(queue);
}
async function renderFeedback(preferCache = false) {
  const request = beginScreenRequest("feedback");
  loading(request);
  try {
    const list = await loadFeedback({ preferCache });
    if (!isScreenRequestCurrent(request)) return;
    const editing = state.editingFeedback;
    appEl.innerHTML = `<section class="screen"><h2>의견 보내기</h2><p class="muted">게임에 바라는 점이나 불편한 점을 남겨주세요.</p><form id="feedbackForm" class="card feedback-form"><textarea id="feedbackText" maxlength="300" placeholder="의견을 적어주세요" required>${editing ? escapeHtml(editing.content) : ""}</textarea>${editing ? "" : `<label class="check-row"><input id="anonymousCheck" type="checkbox"> 익명으로 올리기</label><label class="check-row"><input id="secretCheck" type="checkbox"> 비밀글로 올리기</label>`}<div class="button-row">${editing ? '<button id="cancelFeedbackEdit" class="button ghost" type="button">취소</button>' : ""}<button class="button primary" type="submit">${editing ? "수정 저장" : "보내기"}</button></div></form><div class="feedback-view-tabs"><button data-feedback-view="all" class="${state.feedbackView === "all" ? "active" : ""}">전체 글</button><button data-feedback-view="mine" class="${state.feedbackView === "mine" ? "active" : ""}">내 글</button></div><div class="feedback-sorts">${FEEDBACK_SORTS.map(([key, label]) => `<button data-feedback-sort="${key}" class="${state.feedbackSort === key ? "active" : ""}">${label}</button>`).join("")}</div><div>${list.length ? list.map(feedbackCard).join("") : emptyHtml("", "아직 의견이 없어요.")}</div></section>`;
    bindFeedback(list, request);
    observeFeedbackBodies(list, request);
  } catch (error) {
    if (!isScreenRequestCurrent(request)) return;
    console.error(error);
    appEl.innerHTML = `<section class="screen">${emptyHtml("", "의견을 불러오지 못했어요.")}</section>`;
  }
}
function feedbackCard(f) {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(f?.id || "")) return "";
  const id = String(f.id).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const canRead = feedbackCanRead(f);
  const body = !canRead ? '<div class="secret-feedback">🔒 내용을 볼 수 없는 글입니다.</div>' : f.content ? `<div data-feedback-body="${id}"><p class="feedback-content">${escapeHtml(f.content.content || "")}</p>${f.content.adminReply ? `<div class="admin-reply"><b>💬 운영자 답변</b><p>${escapeHtml(f.content.adminReply)}</p></div>` : ""}</div>` : `<div data-feedback-body="${id}"><span class="feedback-content-loading">내용을 불러오는 중…</span></div>`;
  const canReact = feedbackCanReact(f);
  const reactionPending = state.feedbackPending.has(feedbackPendingKey("reaction", f.id));
  const editPending = state.feedbackPending.has(feedbackPendingKey("edit", f.id));
  const deletePending = state.feedbackPending.has(feedbackPendingKey("delete", f.id));
  const replyPending = state.feedbackPending.has(feedbackPendingKey("reply", f.id));
  const hidePending = state.feedbackPending.has(feedbackPendingKey("hide", f.id));
  const reactions = canReact ? `<div class="reaction-row"><button class="feedback-reaction like ${f.myReaction === "like" ? "is-active" : ""}" data-react="like" data-id="${id}" aria-pressed="${f.myReaction === "like" ? "true" : "false"}" ${reactionPending ? "disabled" : ""}>${reactionPending ? "처리 중…" : `👍 ${Number(f.likeCount) || 0}`}</button><button class="feedback-reaction dislike ${f.myReaction === "dislike" ? "is-active" : ""}" data-react="dislike" data-id="${id}" aria-pressed="${f.myReaction === "dislike" ? "true" : "false"}" ${reactionPending ? "disabled" : ""}>${reactionPending ? "처리 중…" : `👎 ${Number(f.dislikeCount) || 0}`}</button></div>` : "";
  return `<article class="card feedback-card ${f.hidden ? "is-hidden" : ""}" data-feedback-id="${id}"><div class="feedback-head"><b>${f.isSecret ? "🔒 " : ""}${escapeHtml(f.displayAuthor)}</b><span>${f.status === "answered" ? "답변 완료" : "답변 대기"}${f.hidden ? " · 숨김" : ""}</span></div>${body}${reactions}${f.isMine ? `<div class="button-row compact"><button class="button ghost" data-edit-feedback="${id}" ${editPending || !f.content ? "disabled" : ""}>${editPending ? "저장 중…" : "수정"}</button><button class="button danger" data-delete-feedback="${id}" ${deletePending ? "disabled" : ""}>${deletePending ? "삭제 중…" : "삭제"}</button></div>` : ""}${state.isAdmin ? `<div class="admin-tools"><textarea data-reply-text="${id}" maxlength="300" placeholder="운영자 답변" ${replyPending ? "disabled" : ""}>${escapeHtml(f.content?.adminReply || "")}</textarea><div class="button-row compact"><button class="button secondary" data-admin-reply="${id}" ${replyPending || !f.content ? "disabled" : ""}>${replyPending ? "저장 중…" : f.content?.adminReply ? "답변 수정" : "답변하기"}</button><button class="button ghost" data-admin-hide="${id}" data-hidden="${f.hidden}" ${hidePending ? "disabled" : ""}>${hidePending ? "처리 중…" : f.hidden ? "다시 보이기" : "숨기기"}</button></div></div>` : ""}</article>`;
}
async function performFeedbackOperation(type, id, request, operation) {
  const context = feedbackOperationContext(request);
  const pendingKey = beginFeedbackPending(type, id, context);
  if (!pendingKey) return { ok: false, duplicate: true };
  try {
    const value = await operation(context);
    if (!isFeedbackContextCurrent(context) || state.route !== "feedback") return { ok: false, stale: true };
    return { ok: true, value, refresh: !isScreenRequestCurrent(request) };
  } catch (error) {
    if (!isFeedbackContextCurrent(context) || state.route !== "feedback") return { ok: false, stale: true };
    return { ok: false, error, refresh: !isScreenRequestCurrent(request) };
  } finally { endFeedbackPending(pendingKey); }
}
function bindFeedback(list, request = beginScreenRequest("feedback")) {
  const form = document.querySelector("#feedbackForm");
  const initialPending = state.editingFeedback ? state.feedbackPending.has(feedbackPendingKey("edit", state.editingFeedback.id)) : state.feedbackPending.has(feedbackPendingKey("submit", "global"));
  const initialSubmit = form.querySelector('[type="submit"]');
  if (initialPending) { initialSubmit.disabled = true; initialSubmit.textContent = state.editingFeedback ? "저장 중…" : "보내는 중…"; }
  form.onsubmit = async event => {
    event.preventDefault();
    const button = event.submitter;
    if (!button || button.disabled) return;
    const editing = state.editingFeedback;
    const content = document.querySelector("#feedbackText").value;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = editing ? "저장 중…" : "보내는 중…";
    const result = await performFeedbackOperation(editing ? "edit" : "submit", editing?.id || "global", request, context => editing ? updateFeedback(editing.id, content, context) : submitFeedback(content, document.querySelector("#anonymousCheck").checked, document.querySelector("#secretCheck").checked, context));
    if (result.ok) {
      state.editingFeedback = null;
      showToast("의견을 저장했어요.");
      renderFeedback(true);
    } else if (result.error) {
      showToast(userErrorMessage(result.error, "의견을 저장하지 못했어요. 입력한 내용은 그대로 있으니 다시 시도해 주세요."));
      if (result.refresh) renderFeedback(true);
      else if (button.isConnected) { button.disabled = false; button.textContent = originalText; }
    }
  };
  document.querySelector("#cancelFeedbackEdit")?.addEventListener("click", () => { state.editingFeedback = null; renderFeedback(true); });
  document.querySelectorAll("[data-feedback-view]").forEach(button => button.onclick = () => { state.feedbackView = button.dataset.feedbackView; state.editingFeedback = null; renderFeedback(true); });
  document.querySelectorAll("[data-feedback-sort]").forEach(button => button.onclick = () => { state.feedbackSort = button.dataset.feedbackSort; renderFeedback(true); });
  document.querySelectorAll("[data-react]").forEach(button => button.onclick = async () => {
    const result = await performFeedbackOperation("reaction", button.dataset.id, request, context => toggleFeedbackReaction(button.dataset.id, button.dataset.react, context));
    if (result.ok) { showToast(result.value ? `${result.value === "like" ? "좋아요" : "싫어요"}를 눌렀어요.` : "반응을 취소했어요."); renderFeedback(true); }
    else if (result.error) { showToast(userErrorMessage(result.error)); if (result.refresh) renderFeedback(true); }
  });
  document.querySelectorAll("[data-edit-feedback]").forEach(button => button.onclick = () => { const feedback = list.find(item => item.id === button.dataset.editFeedback); if (!feedback?.content) return; state.editingFeedback = { id: feedback.id, content: feedback.content.content || "" }; renderFeedback(true); });
  document.querySelectorAll("[data-delete-feedback]").forEach(button => button.onclick = () => confirmModal("이 의견을 정말 삭제할까요?", "삭제하면 다시 되돌릴 수 없고 목록에서도 보이지 않습니다.", async () => {
    const result = await performFeedbackOperation("delete", button.dataset.deleteFeedback, request, context => deleteFeedback(button.dataset.deleteFeedback, context));
    if (result.ok) { showToast("의견을 삭제했어요."); renderFeedback(true); }
    else if (result.error) { showToast(userErrorMessage(result.error)); if (result.refresh) renderFeedback(true); }
  }));
  document.querySelectorAll("[data-admin-reply]").forEach(button => button.onclick = async () => {
    const id = button.dataset.adminReply;
    const reply = document.querySelector(`[data-reply-text="${selectorRecordId(id)}"]`).value;
    const result = await performFeedbackOperation("reply", id, request, context => saveAdminReply(id, reply, context));
    if (result.ok) { showToast("답변을 저장했어요."); renderFeedback(true); }
    else if (result.error) { showToast(userErrorMessage(result.error)); if (result.refresh) renderFeedback(true); }
  });
  document.querySelectorAll("[data-admin-hide]").forEach(button => button.onclick = async () => {
    const id = button.dataset.adminHide;
    const result = await performFeedbackOperation("hide", id, request, context => toggleFeedbackHidden(id, button.dataset.hidden !== "true", context));
    if (result.ok) renderFeedback(true);
    else if (result.error) { showToast(userErrorMessage(result.error)); if (result.refresh) renderFeedback(true); }
  });
}

function renderGuide() {
  const items = [
    ["캐치갤러리란?", "그림을 그리고, 다른 사람이 정답을 맞히는 그림 퀴즈 게임입니다.", "#ff8ea1"],
    ["로그인", "닉네임과 비밀번호로 로그인하면 다른 기기에서도 기록을 이어갈 수 있습니다.", "#f0c75a"],
    ["그림 그리기", "그림은 게시만으로 점수를 얻지 않습니다. 누군가 맞혀야 점수를 얻습니다.", "#73cba5"],
    ["정답 맞히기", "한 그림은 단 한 명만 맞힐 수 있습니다. 자기 그림은 맞힐 수 없습니다.", "#77bfea"],
    ["힌트와 점수", "힌트 없이 맞히면 양쪽 10점, 힌트를 보면 양쪽 6점입니다. 수정한 그림은 그린 사람의 점수가 1회당 2점 줄어요.", "#b59ae3"],
    ["그림 수정·회수", "도전 중인 내 그림은 수정하거나 회수할 수 있습니다.\n회수하면 복구할 수 없어요.", "#ffad88"],
    ["48시간 미해결 마감", "48시간 동안 아무도 못 맞히면 미해결 그림으로 전시됩니다.", "#8ecbc6"],
    ["전시장과 좋아요", "완성 액자와 미해결 그림을 볼 수 있습니다.\n제시어는 터치하면 공개되고, 남의 그림에 좋아요를 누를 수 있어요.", "#e99ca9"],
    ["의견 보내기", "게임에 바라는 점이나 불편한 점을 익명 또는 비밀글로 남길 수 있습니다.", "#79b9d3"],
    ["랭킹 삭제", "점수와 랭킹 기록은 사라지지만 이미 전시장에 올라간 그림은 그대로 남습니다.", "#a9a1cf"]
  ];
  appEl.innerHTML = `<section class="screen"><h2>게임설명</h2><p class="muted">알고 나면 더 재미있는 캐치갤러리!</p>${items.map(x => `<article class="card guide-card" style="--accent:${x[2]}"><h3>${x[0]}</h3><p>${x[1]}</p></article>`).join("")}</section>`;
}
function emptyHtml(icon, text) { return `<div class="empty"><div class="empty-icon">${icon}</div><p>${text}</p></div>`; }
function confirmModal(title, message, onConfirm) {
  const root = document.querySelector("#modalRoot");
  root.innerHTML = `<div class="modal-backdrop"><div class="modal"><h3>${title}</h3><p>${message}</p><div class="button-row"><button class="button ghost" data-cancel>취소</button><button class="button danger" data-confirm>확인</button></div></div></div>`;
  const backdrop = root.firstElementChild;
  const ownsModal = () => root.firstElementChild === backdrop && backdrop?.isConnected !== false;
  root.querySelector("[data-cancel]").onclick = () => { if (ownsModal()) root.innerHTML = ""; };
  root.querySelector("[data-confirm]").onclick = async event => {
    const button = event.currentTarget;
    if (button.disabled) return;
    const original = button.textContent;
    button.disabled = true;
    button.textContent = "처리 중…";
    try {
      await onConfirm();
      if (ownsModal()) root.innerHTML = "";
    }
    catch (error) {
      if (!ownsModal() || !button.isConnected) return;
      showToast(userErrorMessage(error)); button.disabled = false; button.textContent = original;
    }
  };
}

function showAnswerSuccessModal(result) {
  const root = document.querySelector("#modalRoot");
  const scoreMessage = Number(result.solverReward) > 0
    ? `풀이 점수 +${Number(result.solverReward)}점`
    : "이번에는 랭킹 점수가 오르지 않아요.";
  root.innerHTML = `<div class="modal-backdrop answer-success-backdrop"><div class="modal answer-success-modal" role="dialog" aria-modal="true" aria-labelledby="answerSuccessTitle"><div class="success-sparkles" aria-hidden="true">✨ 🎉 ✨</div><h3 id="answerSuccessTitle">정답입니다 🎉</h3><p class="success-drawer">이 그림은 <b>${escapeHtml(result.drawerNickname || "알 수 없는 친구")}</b>님이 그렸어요!</p><p class="success-score">${scoreMessage}</p><p class="success-reward">그린 사람에게도 +30점이 들어갔어요!</p><button class="button primary full" data-success-close>계속 둘러보기</button></div></div>`;
  const close = () => { root.innerHTML = ""; document.removeEventListener("keydown", onKeydown); };
  const onKeydown = event => { if (event.key === "Escape") close(); };
  root.querySelector("[data-success-close]").onclick = close;
  root.querySelector(".answer-success-backdrop").onclick = event => { if (event.target === event.currentTarget) close(); };
  document.addEventListener("keydown", onKeydown);
  root.querySelector("[data-success-close]").focus();
}

async function claimAnswerRewards(drawingId, drawing) {
  const createdAt = Number(drawing.solvedAt) || serverNow();
  await db.ref().update({
    [`scoreClaims/${drawing.solverId}/${drawingId}`]: { score: drawing.solverReward, type: "solver", createdAt },
    [`scoreClaims/${drawing.drawerId}/${drawingId}`]: { score: drawing.drawerReward, type: "drawer", createdAt },
    [`userSolved/${drawing.solverId}/${drawingId}`]: true
  });
}
async function resolveDrawingId(drawingId) {
  if (!drawingId) return drawingId;
  const directSnap = await db.ref(`drawings/${drawingId}`).once("value");
  if (directSnap.exists()) return drawingId;
  const snap = await db.ref("drawings").once("value");
  let found = null;
  snap.forEach(child => {
    const d = child.val() || {};
    if (d.id === drawingId || d.legacyId === drawingId || d.drawingId === drawingId) found = child.key;
  });
  return found || drawingId;
}
async function submitAnswer(drawingId, answer, hintUsed) {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(drawingId || "")) return { correct: false, message: "표시할 수 없는 그림이에요." };
  answer = String(answer || "").trim();
  if (!answer) return { correct: false, message: "정답을 입력해 주세요." };

  const resolvedId = await resolveDrawingId(drawingId);
  const drawingRef = db.ref(`drawings/${resolvedId}`);

  // Firebase Realtime Database transaction의 update 함수는
  // 해당 경로의 값이 서버에는 있어도 클라이언트 캐시가 비어 있으면
  // 첫 호출에서 null을 받을 수 있다.
  // 여기서 바로 return 하면 실제 그림이 있는데도 "그림을 찾을 수 없어요."가 뜨므로,
  // transaction 전에 한 번 읽어 둔 값을 안전한 fallback으로 사용한다.
  const beforeSnap = await drawingRef.once("value");
  const fallbackDrawing = beforeSnap.val();
  if (!fallbackDrawing || (!fallbackDrawing.imageData && fallbackDrawing.imageReady !== true)) return { correct: false, message: "그림을 찾을 수 없어요." };

  const now = serverNow();
  const recentSuccesses = await loadRecentSolverSuccessCount();
  const solverReward = solverRewardFor(recentSuccesses, hintUsed);
  let outcome = { correct: false, message: "아쉽지만 정답이 아니에요." };
  let settledDrawing = null;

  const result = await drawingRef.transaction(current => {
    const d = current || fallbackDrawing;
    if (!d) { outcome.message = "그림을 찾을 수 없어요."; return; }

    if (d.status === "solved" && d.solverId === state.user.id) {
      settledDrawing = d;
      outcome = { correct: true, solverReward: d.solverReward, drawerReward: d.drawerReward, drawerNickname: drawerName(d) };
      return;
    }

    if (isOwnDrawing(d)) { outcome.message = "내 그림은 맞힐 수 없습니다."; return; }
    if (d.status !== "open" || d.solverId) { outcome.message = "이미 도전이 끝난 그림이에요."; return; }

    if (Number(d.expiresAt) <= now) {
      outcome.message = "방금 마감된 그림이에요.";
      return { ...d, status: "expired", expiredAt: now, updatedAt: now };
    }

    const storedAnswers = Array.isArray(d.answers) ? d.answers : Object.values(safeObject(d.answers));
    const acceptedAnswers = [d.word, ...storedAnswers];
    if (!acceptedAnswers.some(candidate => normalizeAnswer(candidate) === normalizeAnswer(answer))) return;

    const drawerReward = 30;
    outcome = { correct: true, solverReward, drawerReward, drawerNickname: drawerName(d) };

    const solvedUpdate = {
      ...d,
      revisionCount: Number(d.revisionCount) || 0,
      likeCount: Number(d.likeCount) || 0,
      status: "solved",
      solverId: state.user.id,
      solverNickname: state.user.nickname,
      solvedAt: now,
      updatedAt: now,
      hintUsed: !!hintUsed,
      solverReward,
      drawerReward
    };

    if (!d.answers) solvedUpdate.answers = [d.word];
    if (typeof d.isCustomWord !== "boolean") solvedUpdate.isCustomWord = false;
    return solvedUpdate;
  }, null, false);

  const transactionDrawing = result.committed ? result.snapshot.val() : null;
  if (transactionDrawing?.status === "expired") invalidateGalleryListsByStatus("expired");

  if (settledDrawing) {
    invalidateGalleryListsByStatus("solved");
    await claimAnswerRewards(resolvedId, settledDrawing);
    return outcome;
  }

  if (!outcome.correct) return outcome;
  if (!result.committed) return { correct: false, message: "다른 사람이 먼저 맞혔어요." };

  invalidateGalleryListsByStatus("solved");
  await claimAnswerRewards(resolvedId, transactionDrawing);
  return outcome;
}
async function toggleLike(drawingId, cachedDrawing = null) {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(drawingId || "")) throw new Error("좋아요를 누를 수 없는 그림이에요.");
  const started = performance.now();
  const userId = state.user?.id;
  const generation = state.cacheGeneration;
  if (!userId) throw new Error("로그인이 필요해요.");
  const drawing = cachedDrawing || (await db.ref(`drawings/${drawingId}`).once("value")).val();
  if (!drawing || (!drawing.imageData && drawing.imageReady !== true) || !["solved", "expired"].includes(drawing.status)) throw new Error("좋아요를 누를 수 없는 그림이에요.");
  if (drawing.drawerId === userId) throw new Error("내 그림에는 좋아요를 누를 수 없어요.");
  let liked = false;
  const result = await db.ref(`drawingLikes/${drawingId}/${userId}`).transaction(value => {
    liked = value !== true;
    return liked ? true : null;
  }, null, false);
  if (!result.committed) throw new Error("좋아요를 바꾸지 못했어요.");
  if (!isCacheSessionCurrent(userId, generation)) return null;
  const previous = state.likeCache.get(drawingId) || { count: 0, liked: !liked };
  const next = { liked, count: Math.max(0, previous.count + (liked ? 1 : -1)) };
  state.likeCache.set(drawingId, next);
  for (const list of Object.values(state.galleryLists)) {
    const item = list.find(entry => entry.id === drawingId);
    if (item) Object.assign(item, { isLiked: next.liked, likeCount: next.count });
  }
  for (const list of Object.values(state.galleryMetadata || {})) {
    const item = list.find(entry => entry.id === drawingId);
    if (item) Object.assign(item, { isLiked: next.liked, likeCount: next.count });
  }
  console.info(`[gallery] like ${Math.round(performance.now() - started)}ms · server list reread=false`);
  showToast(liked ? "좋아요를 눌렀어요!" : "좋아요를 취소했어요.");
  return next;
}
async function toggleFeedbackReaction(id, next, context = feedbackOperationContext()) {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(id || "")) throw new Error("이 의견에는 반응할 수 없어요.");
  const meta = feedbackMetaById(id);
  if (!feedbackCanReact(meta) || !isFeedbackContextCurrent(context)) throw new Error("이 의견에는 반응할 수 없어요.");
  const uid = context.uid;
  let current = null;
  const result = await db.ref(`feedbackReactions/${id}/${uid}`).transaction(value => {
    current = value === next ? null : next;
    return current;
  }, null, false);
  if (!result.committed) throw new Error("반응을 저장하지 못했어요.");
  if (!isFeedbackContextCurrent(context)) return null;
  const reactions = safeObject(state.feedbackSnapshot?.reactions[id]);
  if (current) reactions[uid] = current; else delete reactions[uid];
  state.feedbackSnapshot.reactions[id] = reactions;
  recalculateFeedbackReaction(meta, reactions, uid);
  return current;
}

boot();
