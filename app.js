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

const WORDS = Object.entries({
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
  "몸 / 옷 / 장신구": { 손: "손", 발: "발", 눈: "눈", 코: "코", 입: "입", 귀: "귀", 머리카락: "머리카락,머리", 치아: "치아,이빨", 티셔츠: "티셔츠,티", 바지: "바지", 치마: "치마", 원피스: "원피스", 목도리: "목도리", 장갑: "장갑", 왕관: "왕관", 안경: "안경", 마스크: "마스크", 반지: "반지", 목걸이: "목걸이" }
}).flatMap(([category, entries]) => Object.entries(entries).map(([word, answerText]) => ({ category, word, answers: answerText.split(",") }))).filter((entry, index, list) => list.findIndex(candidate => candidate.word === entry.word) === index);

const STATUS_LABEL = { open: "도전 중", solved: "완성", expired: "미해결", withdrawn: "회수됨" };
const FEEDBACK_SORTS = [["new", "최신순"], ["old", "과거순"], ["popular", "인기순"], ["likes", "좋아요순"], ["dislikes", "싫어요순"]];

const appEl = document.querySelector("#app");
const headerEl = document.querySelector("#appHeader");
const scoreEl = document.querySelector("#headerScore");
const state = {
  user: null,
  isAdmin: false,
  authReady: false,
  route: "login",
  word: null,
  hintUsed: {},
  galleryTab: "solved",
  galleryView: "thumb",
  gallerySort: "new",
  galleryIndex: 0,
  manageStatus: "open",
  rankingType: "total",
  editDrawing: null,
  canvas: null,
  ctx: null,
  drawing: false,
  activePointerId: null,
  dirty: false,
  history: [],
  publishing: false,
  feedbackView: "all",
  feedbackSort: "new",
  editingFeedback: null
};
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
function safeObject(value) { return value && typeof value === "object" ? value : {}; }
function drawerName(d) { return d.drawerNickname || d.drawerDisplayName || "알 수 없음"; }
function solverName(d) { return d.solverNickname || d.solverDisplayName || "알 수 없음"; }
function drawingOwnerId(d) { return d?.drawerId || d?.drawerUid || d?.ownerUid || d?.authorUid || d?.userId || null; }
function isOwnDrawing(d) { return !!state.user?.id && drawingOwnerId(d) === state.user.id; }
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
function loading() { appEl.innerHTML = '<div class="loading" aria-label="불러오는 중"></div>'; }
function formatTime(expiresAt) {
  const ms = Number(expiresAt) - serverNow();
  if (ms <= 0) return "마감됨";
  const h = Math.floor(ms / 3600000);
  return h < 1 ? "1시간 미만" : `${h}시간`;
}
function randomWord() {
  let next;
  do {
    next = WORDS[Math.floor(Math.random() * WORDS.length)];
  } while (WORDS.length > 1 && state.word?.word === next.word);
  state.word = { ...next, answers: [...next.answers], isCustomWord: false };
}
function normalizeAnswer(value) { return String(value || "").trim().normalize("NFC").replace(/\s+/g, "").toLowerCase(); }
function textLength(value) { return Array.from(value).length; }
function isConfigured() {
  if (initFirebase()) return true;
  showToast("Firebase 설정을 먼저 연결해 주세요.");
  return false;
}
function route(name, options = {}) {
  if (name === "gallery" && state.route !== "gallery") {
    state.galleryView = "thumb";
    state.galleryIndex = 0;
  }
  state.route = name;
  if (name !== "draw") state.editDrawing = null;
  history.pushState({ route: name, galleryDetail: false }, "", `#${name}`);
  renderRoute(options);
}

window.addEventListener("popstate", event => {
  const name = location.hash.slice(1) || (state.user ? "home" : "login");
  if (name === "gallery") state.galleryView = event.state?.galleryDetail ? "frame" : "thumb";
  if (name === "gallery" && state.route !== "gallery") state.galleryIndex = 0;
  state.route = name;
  renderRoute();
});
document.addEventListener("click", e => {
  const target = e.target.closest("[data-route]");
  if (target) route(target.dataset.route);
});
document.querySelector("#backButton").addEventListener("click", () => {
  if (state.route === "gallery" && state.galleryView === "frame") history.back();
  else route("home");
});

function normalizeNickname(value) { return value.trim().normalize("NFC"); }
function nicknameKey(value) {
  const bytes = new TextEncoder().encode(normalizeNickname(value));
  return "u_" + Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}
function internalEmail(value) { return `${nicknameKey(value)}@catchgallery.app`; }
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
async function ensureUserProfile(firebaseUser, nickname) {
  const uid = firebaseUser.uid;
  const key = nicknameKey(nickname);
  const now = serverNow();
  const ref = db.ref(`users/${uid}`);
  const snap = await ref.once("value");
  const old = snap.val();
  const profile = old || { nickname, nicknameKey: key, score: 0, createdAt: now, lastSeenAt: now, rankingDeleted: false, rankingDeletedAt: null };
  profile.nickname = profile.nickname || nickname;
  profile.nicknameKey = profile.nicknameKey || key;
  profile.lastSeenAt = now;
  if (profile.rankingDeleted) {
    profile.score = 0;
    profile.rankingDeleted = false;
    profile.rankingDeletedAt = null;
  }
  await ref.set(profile);
  try {
    await db.ref(`nicknameIndex/${key}`).set(uid);
  } catch (error) {
    if (!old) {
      try { await ref.remove(); } catch (_) {}
    }
    throw error;
  }
  return loadCurrentUser(uid);
}
async function signUp(nickname, password) {
  const name = validateCredentials(nickname, password);
  localStorage.setItem("catchGalleryNickname", name);
  try {
    const credential = await auth.createUserWithEmailAndPassword(internalEmail(name), password);
    try {
      await ensureUserProfile(credential.user, name);
    } catch (error) {
      try { await credential.user.delete(); } catch (_) {}
      throw error;
    }
    return state.user;
  } catch (error) {
    if (error.message?.startsWith("이미") || error.message?.includes("오류")) throw error;
    throw new Error(authMessage(error, "signup"));
  }
}
async function signIn(nickname, password) {
  const name = validateCredentials(nickname, password);
  localStorage.setItem("catchGalleryNickname", name);
  try {
    const credential = await auth.signInWithEmailAndPassword(internalEmail(name), password);
    await ensureUserProfile(credential.user, name);
    return state.user;
  } catch (error) {
    if (error.message?.includes("오류")) throw error;
    throw new Error(authMessage(error, "login"));
  }
}
async function signOut() {
  await auth.signOut();
  state.user = null;
  state.isAdmin = false;
  localStorage.removeItem("catchGalleryUid");
  localStorage.removeItem("catchGalleryNickname");
  route("login");
}
async function boot() {
  initFirebase();
  loading();
  auth.onAuthStateChanged(async firebaseUser => {
    try {
      if (firebaseUser) {
        const saved = localStorage.getItem("catchGalleryNickname");
        const snap = await db.ref(`users/${firebaseUser.uid}`).once("value");
        if (snap.exists()) await loadCurrentUser(firebaseUser.uid);
        else if (saved) await ensureUserProfile(firebaseUser, saved);
        else {
          await auth.signOut();
          throw new Error("닉네임 정보를 복구할 수 없어 다시 로그인해야 합니다.");
        }
      } else {
        state.user = null;
        state.isAdmin = false;
      }
    } catch (error) {
      console.error(error);
      showToast(userErrorMessage(error));
    }
    state.authReady = true;
    const initial = state.user ? (location.hash.slice(1) || "home") : "login";
    state.route = initial;
    history.replaceState({ route: initial }, "", `#${initial}`);
    renderRoute();
    if (state.user) expireOldDrawings().catch(console.error);
  });
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
async function loadCurrentUser(userId = auth?.currentUser?.uid) {
  if (!db || !userId) return null;
  const [snap, adminSnap, score] = await Promise.all([
    db.ref(`users/${userId}`).once("value"),
    db.ref(`admins/${userId}`).once("value"),
    loadUserScore(userId)
  ]);
  if (!snap.exists()) return null;
  state.user = { id: userId, ...snap.val(), score };
  state.isAdmin = adminSnap.val() === true;
  localStorage.setItem("catchGalleryUid", userId);
  localStorage.setItem("catchGalleryNickname", state.user.nickname);
  scoreEl.textContent = `${score}점`;
  return state.user;
}

function renderRoute() {
  const publicRoute = state.route === "login";
  headerEl.classList.toggle("hidden", publicRoute);
  if (!publicRoute && !state.user) {
    state.route = "login";
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
      route("home");
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
      route("home");
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
  appEl.innerHTML = `<section class="screen"><div class="home-greeting"><h2>${escapeHtml(state.user.nickname)}님, 반가워요!</h2><p class="muted">그림을 그리고, 다른 사람의 그림도 맞혀보세요.</p></div><div class="main-actions"><button class="main-action draw" data-route="draw"><span class="action-icon">✏️</span><span class="action-title">그림 그리기</span><span class="action-copy">제시어를 그림으로 표현해요</span></button><button class="main-action solve" data-route="solve"><span class="action-icon">🔍</span><span class="action-title">정답 맞히기</span><span class="action-copy">이 그림은 무엇일까요?</span></button></div><div class="sub-actions"><button class="sub-action" data-route="gallery"><span>🖼️</span>전시장</button><button class="sub-action" data-route="ranking"><span>🏆</span>랭킹</button><button class="sub-action" data-route="manage"><span>🗂️</span>내 그림 관리</button><button class="sub-action" data-route="guide"><span>📖</span>게임설명</button><button class="sub-action feedback-menu" data-route="feedback"><span>💌</span>의견 보내기</button></div><button id="logoutButton" class="button ghost full logout-button">로그아웃</button><div class="home-version" aria-label="앱 버전">v1.0.5</div></section>`;
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
  if (!state.word) randomWord();
  const edit = state.editDrawing;
  const wordActions = edit ? "" : '<div class="word-actions"><button id="nextWord" class="button ghost">다른 제시어</button><button id="customWordButton" class="button ghost" aria-expanded="false">직접 제시어</button></div>';
  const customForm = edit ? "" : `<form id="customWordForm" class="custom-word-form hidden"><div class="custom-fields"><label>카테고리<input id="customCategory" maxlength="8" required placeholder="예: 음식"></label><label>제시어<input id="customWord" maxlength="12" required placeholder="예: 계란후라이"></label></div><label class="answer-label"><span>허용 정답 <button id="answerHelpButton" class="answer-help-button" type="button" aria-label="허용 정답 설명 보기" aria-expanded="false">?</button></span><input id="customAnswers" placeholder="달걀후라이, 계란프라이"></label><div id="answerHelp" class="answer-help hidden"><b>허용 정답이란?</b><br>정답은 맞지만 다르게 부를 수 있는 말을 적는 곳이에요.<br>예: 제시어가 ‘계란후라이’라면 ‘달걀후라이, 계란프라이’도 정답으로 인정할 수 있어요.<br>쉼표로 나누어 적어주세요.</div><button class="button secondary full" type="submit">이 제시어 사용하기</button></form>`;
  const shownAnswers = !edit && state.word.isCustomWord && state.word.answers.length > 1 ? `<small class="custom-answer-summary">허용 정답: ${state.word.answers.slice(1).map(escapeHtml).join(", ")}</small>` : "";
  appEl.innerHTML = `<section class="screen draw-screen"><div class="section-head"><div><h2>${edit ? "그림 수정하기" : "그림 그리기"}</h2><p class="muted">손가락으로 마음껏 그려요.</p></div>${wordActions}</div><div class="card word-card"><span class="category">${escapeHtml(edit?.category || state.word.category)}</span><div class="word">${escapeHtml(edit?.word || state.word.word)}</div>${shownAnswers}</div>${customForm}<div class="canvas-wrap"><canvas id="drawingCanvas" width="720" height="720" aria-label="그림판"></canvas></div><div class="tools"><div class="colors">${["#3e3a48", "#ed5f72", "#f29b38", "#f0cf3a", "#57b879", "#45a8df", "#745bc7"].map((c, i) => `<button class="color ${i === 0 ? "selected" : ""}" data-color="${c}" style="background:${c}" aria-label="색상 선택"></button>`).join("")}</div><div class="tool-grid"><input id="brushSize" type="range" min="3" max="34" value="9" aria-label="붓 굵기"><button id="eraser" class="button ghost">지우개</button><button id="undo" class="button ghost">되돌리기</button><button id="clearCanvas" class="button ghost">전체 지우기</button></div></div><div class="notice">${edit ? "정답이 맞혀지면 그린 사람에게 30점!" : "누군가 정답을 맞히면 그린 사람에게 30점이 들어와요."}</div><button id="saveDrawing" class="button primary full">${edit ? "수정 저장하기" : "게시하기"}</button></section>`;
  setupCanvas(edit?.imageData);
  document.querySelectorAll(".color").forEach(button => button.onclick = () => {
    document.querySelectorAll(".color").forEach(x => x.classList.remove("selected"));
    button.classList.add("selected");
    state.ctx.globalCompositeOperation = "source-over";
    state.ctx.strokeStyle = button.dataset.color;
  });
  eraser.onclick = () => { state.ctx.globalCompositeOperation = "destination-out"; };
  undo.onclick = undoCanvas;
  clearCanvas.onclick = () => clearCanvasBoard(true);
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
      if (textLength(category) < 1 || textLength(category) > 8) return showToast("카테고리는 1~8자로 입력해 주세요.");
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
      document.querySelector(".draw-screen").classList.remove("custom-word-open");
      customWordButton.setAttribute("aria-expanded", "false");
      showToast("직접 제시어를 적용했어요!");
    };
  }
  saveDrawing.onclick = async () => {
    if (state.publishing) return;
    if (!state.dirty) {
      showToast(edit ? "그림을 조금 수정해 주세요." : "빈 그림은 게시할 수 없어요.");
      return;
    }
    state.publishing = true;
    saveDrawing.disabled = true;
    saveDrawing.textContent = "저장하는 중…";
    try {
      edit ? await updateDrawing(edit.id) : await publishDrawing();
      state.editDrawing = null;
      state.word = null;
      showToast(edit ? "수정했어요!" : "그림을 게시했어요!");
      route("manage");
    } catch (error) {
      showToast(userErrorMessage(error, "그림을 저장하지 못했어요. 입력한 내용은 그대로 있으니 다시 시도해 주세요."));
      saveDrawing.disabled = false;
      saveDrawing.textContent = edit ? "수정 저장하기" : "게시하기";
    } finally {
      state.publishing = false;
    }
  };
}

function preventIfCancelable(event) { if (event && event.cancelable) event.preventDefault(); }
function lockDrawingScroll() {
  if (document.body.classList.contains("drawing-scroll-lock")) return;
  const y = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.dataset.scrollY = String(y);
  document.body.style.top = `-${y}px`;
  document.documentElement.classList.add("drawing-scroll-lock");
  document.body.classList.add("drawing-scroll-lock");
}
function unlockDrawingScroll() {
  if (!document.body.classList.contains("drawing-scroll-lock")) return;
  const y = Number(document.body.dataset.scrollY || 0);
  document.documentElement.classList.remove("drawing-scroll-lock");
  document.body.classList.remove("drawing-scroll-lock");
  document.body.style.top = "";
  delete document.body.dataset.scrollY;
  window.scrollTo(0, y);
}
function bindDocumentDrawingScrollBlocker() {
  if (window.__catchGalleryDrawingScrollBlockerBound) return;
  const block = event => {
    if (state.route === "draw" && state.drawing) preventIfCancelable(event);
  };
  document.addEventListener("touchmove", block, { passive: false, capture: true });
  document.addEventListener("touchcancel", block, { passive: false, capture: true });
  document.addEventListener("gesturestart", block, { passive: false, capture: true });
  window.__catchGalleryDrawingScrollBlockerBound = true;
}
function setupCanvas(imageData) {
  bindDocumentDrawingScrollBlocker();
  state.canvas = document.querySelector("#drawingCanvas");
  state.ctx = state.canvas.getContext("2d", { willReadFrequently: true });
  state.ctx.lineCap = "round";
  state.ctx.lineJoin = "round";
  state.ctx.strokeStyle = "#3e3a48";
  state.ctx.lineWidth = 9;
  state.history = [];
  state.dirty = false;
  state.activePointerId = null;

  const pos = event => {
    const rect = state.canvas.getBoundingClientRect();
    return [
      (event.clientX - rect.left) * state.canvas.width / rect.width,
      (event.clientY - rect.top) * state.canvas.height / rect.height
    ];
  };
  const start = event => {
    if (state.activePointerId !== null || event.isPrimary === false) return;
    preventIfCancelable(event);
    lockDrawingScroll();
    state.activePointerId = event.pointerId;
    state.canvas.setPointerCapture?.(event.pointerId);
    saveHistory();
    state.drawing = true;
    const [x, y] = pos(event);
    state.ctx.beginPath();
    state.ctx.moveTo(x, y);
  };
  const move = event => {
    if (!state.drawing || event.pointerId !== state.activePointerId) return;
    preventIfCancelable(event);
    const [x, y] = pos(event);
    const brush = document.querySelector("#brushSize");
    state.ctx.lineWidth = Number(brush?.value || 9);
    state.ctx.lineTo(x, y);
    state.ctx.stroke();
    state.dirty = true;
  };
  const end = event => {
    if (event.pointerId !== state.activePointerId) return;
    if (state.drawing) preventIfCancelable(event);
    if (state.canvas.hasPointerCapture?.(event.pointerId)) state.canvas.releasePointerCapture(event.pointerId);
    state.drawing = false;
    state.activePointerId = null;
    state.ctx.closePath();
    unlockDrawingScroll();
  };
  const lost = event => {
    if (event.pointerId !== state.activePointerId) return;
    state.drawing = false;
    state.activePointerId = null;
    state.ctx.closePath();
    unlockDrawingScroll();
  };

  state.canvas.addEventListener("pointerdown", start, { passive: false });
  state.canvas.addEventListener("pointermove", move, { passive: false });
  state.canvas.addEventListener("pointerup", end, { passive: false });
  state.canvas.addEventListener("pointercancel", end, { passive: false });
  state.canvas.addEventListener("lostpointercapture", lost);

  if (imageData) {
    const img = new Image();
    img.onload = () => { state.ctx.drawImage(img, 0, 0, 720, 720); };
    img.src = imageData;
  }
}
function saveHistory() {
  if (state.history.length >= 15) state.history.shift();
  state.history.push(state.ctx.getImageData(0, 0, state.canvas.width, state.canvas.height));
}
function undoCanvas() {
  const last = state.history.pop();
  if (!last) return showToast("되돌릴 내용이 없어요.");
  state.ctx.globalCompositeOperation = "source-over";
  state.ctx.putImageData(last, 0, 0);
  state.dirty = true;
}
function clearCanvasBoard(track) {
  if (track) saveHistory();
  state.ctx.clearRect(0, 0, 720, 720);
  state.dirty = !!track;
}
async function publishDrawing() {
  const now = serverNow();
  const ref = db.ref("drawings").push();
  const id = ref.key;
  const data = {
    word: state.word.word,
    category: state.word.category,
    answers: state.word.answers,
    isCustomWord: state.word.isCustomWord,
    imageData: state.canvas.toDataURL("image/png"),
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
  await ref.set(data);
  await db.ref(`userDrawings/${state.user.id}/${id}`).set(true);
  state.word = null;
}
async function expireOldDrawings() {
  if (!db) return;
  const snap = await db.ref("drawings").orderByChild("status").equalTo("open").once("value");
  const jobs = [];
  snap.forEach(child => {
    const d = child.val();
    if (!d.solverId && Number(d.expiresAt) <= serverNow()) {
      const fallbackDrawing = d;
      jobs.push(child.ref.transaction(cur => {
        const current = cur || fallbackDrawing;
        if (!current || current.status !== "open" || current.solverId || Number(current.expiresAt) > serverNow()) return;
        const expiredAt = serverNow();
        return { ...current, status: "expired", expiredAt, updatedAt: expiredAt };
      }, (error, committed) => {
        if (error) console.warn("미해결 그림 만료 처리 실패:", child.key, error);
        else if (!committed) console.warn("미해결 그림 만료 처리 미커밋:", child.key);
      }, false));
    }
  });
  await Promise.all(jobs);
}
async function loadOpenDrawings(sort = "new") {
  await expireOldDrawings();
  const snap = await db.ref("drawings").orderByChild("status").equalTo("open").once("value");
  const list = [];
  snap.forEach(child => {
    const d = child.val() || {};
    if (Number(d.expiresAt) > serverNow()) list.push({ ...d, id: child.key });
  });
  return list.sort((a, b) => sort === "new" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);
}
async function renderSolve() {
  if (!isConfigured()) { appEl.innerHTML = '<section class="screen"><div class="empty">Firebase 설정을 연결해 주세요.</div></section>'; return; }
  loading();
  const sort = sessionStorage.getItem("solveSort") || "new";
  try {
    const [list, recentSuccesses] = await Promise.all([loadOpenDrawings(sort), loadRecentSolverSuccessCount()]);
    appEl.innerHTML = `<section class="screen"><div class="section-head"><div><h2>정답 맞히기</h2><p class="muted">그림 속 제시어를 찾아보세요!</p></div></div><div class="filters"><select id="solveSort"><option value="new" ${sort === "new" ? "selected" : ""}>최신순</option><option value="old" ${sort === "old" ? "selected" : ""}>과거순</option></select></div><div id="openList">${list.length ? list.map(d => openDrawingCard(d, recentSuccesses)).join("") : emptyHtml("", "아직 도전할 그림이 없어요.")}</div></section>`;
    solveSort.onchange = () => { sessionStorage.setItem("solveSort", solveSort.value); renderSolve(); };
    document.querySelectorAll("[data-hint]").forEach(button => button.onclick = () => {
      state.hintUsed[button.dataset.hint] = true;
      button.textContent = `카테고리: ${button.dataset.category}`;
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
        if (result.correct) {
          await loadCurrentUser();
          renderSolve();
          showAnswerSuccessModal(result);
        } else {
          showToast(result.message);
          input.select();
          button.disabled = false;
          button.textContent = originalText;
        }
      } catch (error) {
        console.error("정답 확인 중 오류:", error);
        const permissionError = /permission[-_ ]?denied/i.test(`${error?.code || ""} ${error?.message || ""}`);
        showToast(permissionError
          ? "권한 확인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요."
          : "정답 확인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.");
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  } catch (error) {
    console.error(error);
    appEl.innerHTML = `<section class="screen">${emptyHtml("", "그림을 불러오지 못했어요.")}</section>`;
  }
}
function openDrawingCard(d, recentSuccesses = 0) {
  const mine = isOwnDrawing(d);
  return `<article class="card drawing-card"><img src="${d.imageData}" alt="도전 중인 그림"><div class="meta"><span class="badge open">남은 시간: ${formatTime(d.expiresAt)}</span></div>${mine ? '<div class="notice">내 그림은 맞힐 수 없습니다.</div>' : `<button class="button secondary full" data-hint="${d.id}" data-category="${escapeHtml(d.category)}" data-recent-successes="${recentSuccesses}">카테고리 힌트 보기 (-4점)</button><div class="answer-reward" data-answer-reward="${d.id}">${solverRewardHtml(recentSuccesses, false)}</div><form class="answer-row" data-answer-form="${d.id}"><input maxlength="30" autocomplete="off" placeholder="정답을 입력해요" aria-label="정답"><button class="button primary">정답!</button></form>`}</article>`;
}
async function updateDrawing(drawingId) {
  const imageData = state.canvas.toDataURL("image/png");
  const now = serverNow();
  const ref = db.ref(`drawings/${drawingId}`);
  const fallbackDrawing = (await ref.once("value")).val();
  let reason = "수정할 수 없는 그림이에요.";
  const result = await ref.transaction(current => {
    const d = current || fallbackDrawing;
    if (!d) return;
    if (d.status !== "open" || !isOwnDrawing(d) || d.solverId || Number(d.expiresAt) <= now) return;
    reason = "";
    return { ...d, imageData, updatedAt: now, revisionCount: (Number(d.revisionCount) || 0) + 1 };
  }, null, false);
  if (!result.committed) throw new Error(reason);
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
async function loadGalleryDrawings(status = state.galleryTab, sort = state.gallerySort) {
  await expireOldDrawings();
  const [snap, likesSnap] = await Promise.all([
    db.ref("drawings").orderByChild("status").equalTo(status).once("value"),
    db.ref("drawingLikes").once("value")
  ]);
  const likes = safeObject(likesSnap.val());
  const list = [];
  snap.forEach(child => {
    const d = child.val() || {};
    const drawingLikes = safeObject(likes[child.key]);
    list.push({ ...d, likeCount: Object.keys(drawingLikes).length, isLiked: drawingLikes[state.user.id] === true, id: child.key });
  });
  const timeKey = status === "solved" ? "solvedAt" : "expiredAt";
  return list.sort((a, b) => sort === "popular" ? (b.likeCount || 0) - (a.likeCount || 0) : sort === "new" ? b[timeKey] - a[timeKey] : a[timeKey] - b[timeKey]);
}
async function renderGallery() {
  if (!isConfigured()) { appEl.innerHTML = '<section class="screen"><div class="empty">Firebase 설정을 연결해 주세요.</div></section>'; return; }
  loading();
  try {
    const list = await loadGalleryDrawings();
    if (state.galleryIndex >= list.length) state.galleryIndex = 0;
    appEl.innerHTML = `<section class="screen gallery-screen${state.galleryView === "frame" ? " gallery-detail" : ""}"><h2>전시장</h2><p class="muted">그림을 감상하고 마음에 쏙 들면 좋아요!</p><div class="tabs"><button data-gallery-tab="solved" class="${state.galleryTab === "solved" ? "active" : ""}">완성 액자</button><button data-gallery-tab="expired" class="${state.galleryTab === "expired" ? "active" : ""}">미해결 그림</button></div><div class="gallery-controls"><select id="gallerySort"><option value="new" ${state.gallerySort === "new" ? "selected" : ""}>최신순</option><option value="old" ${state.gallerySort === "old" ? "selected" : ""}>과거순</option><option value="popular" ${state.gallerySort === "popular" ? "selected" : ""}>인기순</option></select></div><div id="galleryContent">${list.length ? (state.galleryView === "frame" ? galleryFrame(list, state.galleryIndex) : galleryThumbs(list)) : emptyHtml("🖼️", "아직 전시된 그림이 없어요.")}</div></section>`;
    bindGallery(list);
  } catch (error) {
    console.error(error);
    appEl.innerHTML = `<section class="screen">${emptyHtml("", "전시장을 불러오지 못했어요.")}</section>`;
  }
}
async function adminDeleteDrawing(drawingId) {
  if (!state.isAdmin) throw new Error("관리자만 그림을 숨길 수 있어요.");
  const ref = db.ref(`drawings/${drawingId}`);
  const fallbackDrawing = (await ref.once("value")).val();
  const now = serverNow();
  const result = await ref.transaction(current => {
    const d = current || fallbackDrawing;
    if (!d || d.status === "adminDeleted") return;
    return { ...d, status: "adminDeleted", adminDeletedAt: now, adminDeletedBy: state.user.id, updatedAt: now };
  }, null, false);
  if (!result.committed) throw new Error("그림을 숨기지 못했어요.");
}
function galleryFrame(list, i) {
  const d = list[i];
  return `<div class="frame"><img class="frame-image" src="${d.imageData}" alt="전시 그림"></div><div class="frame-nav"><button class="button ghost" data-prev ${i === 0 ? "disabled" : ""}>이전</button><span>${i + 1} / ${list.length}</span><button class="button ghost" data-next ${i === list.length - 1 ? "disabled" : ""}>다음</button></div><div class="frame-info"><button class="secret-word" data-secret>제시어 보기 </button><div class="meta"><span>그린 사람: ${escapeHtml(drawerName(d))}</span><span>${d.status === "solved" ? `맞힌 사람: ${escapeHtml(solverName(d))}` : "맞힌 사람: 없음"}</span></div><button class="button like-button ${d.drawerId === state.user.id ? "ghost" : "secondary"} ${d.isLiked ? "is-liked" : ""} full" data-like="${d.id}" aria-pressed="${d.isLiked ? "true" : "false"}" ${d.drawerId === state.user.id ? "disabled" : ""}><span class="heart" aria-hidden="true">${d.isLiked ? "♥" : "♡"}</span> 좋아요 ${Number(d.likeCount) || 0}${d.drawerId === state.user.id ? " · 내 그림" : ""}</button></div>`;
}
function galleryThumbs(list) {
  return `<div class="thumbnail-grid">${list.map((d, i) => `<div class="thumbnail-wrap"><button class="thumbnail" data-thumb="${i}"><img src="${d.imageData}" alt="전시 그림"><small><span class="thumbnail-like ${d.isLiked ? "is-liked" : ""}"><span class="heart" aria-hidden="true">${d.isLiked ? "♥" : "♡"}</span> ${Number(d.likeCount) || 0}</span> · ${escapeHtml(drawerName(d))}</small></button>${state.isAdmin ? `<button class="button danger admin-delete-button" data-admin-delete="${d.id}">관리자 삭제</button>` : ""}</div>`).join("")}</div>`;
}
function bindGallery(list) {
  document.querySelectorAll("[data-gallery-tab]").forEach(button => button.onclick = () => { state.galleryTab = button.dataset.galleryTab; state.galleryIndex = 0; state.galleryView = "thumb"; history.replaceState({ route: "gallery", galleryDetail: false }, "", "#gallery"); renderGallery(); });
  gallerySort.onchange = () => { state.gallerySort = gallerySort.value; state.galleryIndex = 0; renderGallery(); };
  document.querySelector("[data-prev]")?.addEventListener("click", () => { state.galleryIndex--; renderGallery(); });
  document.querySelector("[data-next]")?.addEventListener("click", () => { state.galleryIndex++; renderGallery(); });
  document.querySelector("[data-secret]")?.addEventListener("click", e => { e.currentTarget.textContent = `제시어: ${list[state.galleryIndex].word}`; });
  document.querySelectorAll("[data-thumb]").forEach(button => button.onclick = () => { state.galleryIndex = Number(button.dataset.thumb); state.galleryView = "frame"; history.pushState({ route: "gallery", galleryDetail: true }, "", "#gallery"); renderGallery(); });
  document.querySelector("[data-like]")?.addEventListener("click", async e => {
    const button = e.currentTarget;
    if (button.disabled) return;
    const original = button.innerHTML;
    button.disabled = true;
    button.textContent = "처리 중…";
    try { await toggleLike(button.dataset.like); renderGallery(); }
    catch (error) { showToast(userErrorMessage(error)); button.disabled = false; button.innerHTML = original; }
  });
  document.querySelectorAll("[data-admin-delete]").forEach(button => button.onclick = () => confirmModal("관리자 삭제", "관리자 권한으로 이 그림을 전시장에서 숨길까요?", async () => { await adminDeleteDrawing(button.dataset.adminDelete); showToast("그림을 전시장에서 숨겼어요."); renderGallery(); }));
}

async function loadRanking(type = state.rankingType) {
  const [usersSnap, claimsSnap, drawingsSnap] = await Promise.all([db.ref("users").once("value"), db.ref("scoreClaims").once("value"), db.ref("drawings").once("value")]);
  const claims = safeObject(claimsSnap.val());
  const drawings = safeObject(drawingsSnap.val());
  const list = [];
  usersSnap.forEach(child => {
    const u = child.val();
    const nickname = u.nickname || u.displayName || "";
    if (u.rankingDeleted || nickname.toLowerCase() === "admin") return;
    let score = 0;
    for (const [drawingId, claim] of Object.entries(safeObject(claims[child.key]))) {
      const inferredType = claimType(claim, drawings[drawingId], child.key);
      if (type === "total" || inferredType === type) score += claimScore(claim);
    }
    list.push({ id: child.key, ...u, nickname, score });
  });
  return list.sort((a, b) => (b.score || 0) - (a.score || 0) || a.createdAt - b.createdAt).slice(0, 30);
}
async function renderRanking() {
  loading();
  try {
    const list = await loadRanking();
    const labels = { total: "종합 랭킹", drawer: "그리기 랭킹", solver: "맞히기 랭킹" };
    appEl.innerHTML = `<section class="screen"><h2>랭킹</h2><p class="muted">${labels[state.rankingType]} 상위 30명까지 보여드려요.</p><div class="tabs ranking-tabs"><button data-ranking="total" class="${state.rankingType === "total" ? "active" : ""}">종합</button><button data-ranking="drawer" class="${state.rankingType === "drawer" ? "active" : ""}">그리기</button><button data-ranking="solver" class="${state.rankingType === "solver" ? "active" : ""}">맞히기</button></div><div>${list.map((u, i) => `<div class="rank-row ${u.id === state.user.id ? "mine" : ""}"><div class="rank-num">${i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</div><div><b>${escapeHtml(u.nickname)}</b>${u.id === state.user.id ? "<small> · 나</small>" : ""}</div><div class="rank-score">${Number(u.score) || 0}점</div></div>`).join("") || emptyHtml("", "아직 랭킹이 비어 있어요.")}</div><button id="deleteRanking" class="button danger full" style="margin-top:20px">내 랭킹 삭제</button></section>`;
    document.querySelectorAll("[data-ranking]").forEach(button => button.onclick = () => { state.rankingType = button.dataset.ranking; renderRanking(); });
    document.querySelector("#deleteRanking").onclick = () => confirmModal("정말 내 랭킹을 삭제할까요?", "내 점수와 랭킹 기록이 사라집니다.\n하지만 이미 전시장에 올라간 그림은 삭제되지 않습니다.", async () => {
      await deleteMyRanking();
      showToast("랭킹을 삭제했어요.\n다음 로그인부터 0점으로 다시 참여해요.");
      await signOut();
    });
  } catch (error) {
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
async function renderManage() {
  if (!isConfigured()) { appEl.innerHTML = '<section class="screen"><div class="empty">Firebase 설정을 연결해 주세요.</div></section>'; return; }
  loading();
  try {
    await expireOldDrawings();
    const idsSnap = await db.ref(`userDrawings/${state.user.id}`).once("value");
    const ids = Object.keys(safeObject(idsSnap.val()));
    const all = await Promise.all(ids.map(async id => {
      const snap = await db.ref(`drawings/${id}`).once("value");
      return snap.exists() ? { ...(snap.val() || {}), id } : null;
    }));
    const list = all.filter(d => d && d.status === state.manageStatus).sort((a, b) => b.createdAt - a.createdAt);
    appEl.innerHTML = `<section class="screen"><h2>내 그림 관리</h2><p class="muted">내가 그린 그림을 상태별로 모아봐요.</p><div class="tabs status-tabs">${Object.entries(STATUS_LABEL).map(([k, v]) => `<button data-status="${k}" class="${state.manageStatus === k ? "active" : ""}">${v}</button>`).join("")}</div><div style="margin-top:15px">${list.length ? list.map(manageCard).join("") : emptyHtml("", "여기에 해당하는 그림이 없어요.")}</div></section>`;
    document.querySelectorAll("[data-status]").forEach(button => button.onclick = () => { state.manageStatus = button.dataset.status; renderManage(); });
    document.querySelectorAll("[data-edit]").forEach(button => button.onclick = () => {
      const d = list.find(x => x.id === button.dataset.edit);
      state.editDrawing = d;
      state.word = { word: d.word, category: d.category, answers: d.answers || [d.word], isCustomWord: !!d.isCustomWord };
      route("draw");
    });
    document.querySelectorAll("[data-withdraw]").forEach(button => button.onclick = () => confirmModal("정말 이 그림을 회수할까요?", "회수한 그림은 복구할 수 없고,\n전시장에도 전시되지 않습니다.", async () => {
      await withdrawDrawing(button.dataset.withdraw);
      showToast("그림을 회수했어요.");
      renderManage();
    }));
  } catch (error) {
    console.error(error);
  }
}
function manageCard(d) {
  return `<article class="card drawing-card"><img src="${d.imageData}" alt="내 그림"><div class="meta"><span class="badge ${d.status}">${STATUS_LABEL[d.status]}</span><span>제시어: ${escapeHtml(d.word)}</span>${d.status === "open" ? `<span>남은 시간: ${formatTime(d.expiresAt)}</span><span>수정 ${Number(d.revisionCount) || 0}회</span>` : ""}</div>${d.status === "open" ? `<div class="notice">정답이 맞혀지면 그린 사람에게 30점!</div><div class="button-row"><button class="button secondary" data-edit="${d.id}">수정하기</button><button class="button danger" data-withdraw="${d.id}">회수하기</button></div>` : d.status === "solved" ? `<p>맞힌 사람: <b>${escapeHtml(solverName(d))}</b><br>획득 점수: <b>${Number(d.drawerReward) || 0}점</b></p>` : d.status === "expired" ? "<p>아무도 맞히지 못했어요.<br>획득 점수: <b>0점</b></p>" : '<p class="muted">회수한 그림은 다시 복구할 수 없어요.</p>'}</article>`;
}

async function submitFeedback(content, isAnonymous, isSecret) {
  content = content.trim();
  if (content.length <= 5) throw new Error("조금만 더 자세히 적어주세요.");
  if (content.length > 300) throw new Error("300자 이내로 줄여주세요.");
  const now = serverNow();
  const ref = db.ref("feedbackMeta").push();
  const id = ref.key;
  const meta = { createdAt: now, updatedAt: now, isAnonymous: !!isAnonymous, isSecret: !!isSecret, displayAuthor: isAnonymous ? "익명" : state.user.nickname, status: "open", hidden: false, deleted: false, likeCount: 0, dislikeCount: 0, popularityScore: 0 };
  await db.ref(`feedbackOwners/${id}/${state.user.id}`).set(true);
  try {
    await db.ref(`userFeedback/${state.user.id}/${id}`).set(true);
    await db.ref(`feedbackMeta/${id}`).set(meta);
    await db.ref(`feedbackContent/${id}`).set({ content, adminReply: null, repliedAt: null, repliedBy: null, repliedByNickname: null });
  } catch (error) {
    try { await db.ref(`feedbackMeta/${id}`).update({ deleted: true, deletedAt: serverNow(), updatedAt: serverNow() }); } catch (_) {}
    throw error;
  }
}
async function loadFeedback() {
  const [metaSnap, mySnap, reactionsSnap] = await Promise.all([db.ref("feedbackMeta").once("value"), db.ref(`userFeedback/${state.user.id}`).once("value"), db.ref("feedbackReactions").once("value")]);
  const mine = safeObject(mySnap.val());
  const reactions = safeObject(reactionsSnap.val());
  const items = [];
  const jobs = [];
  metaSnap.forEach(child => {
    const reactionValues = Object.values(safeObject(reactions[child.key]));
    const likeCount = reactionValues.filter(v => v === "like").length;
    const dislikeCount = reactionValues.filter(v => v === "dislike").length;
    const meta = { id: child.key, ...child.val(), likeCount, dislikeCount, popularityScore: likeCount - dislikeCount, isMine: !!mine[child.key], myReaction: safeObject(reactions[child.key])[state.user.id] || null };
    if (meta.deleted) return;
    if (state.feedbackView === "mine" && !meta.isMine) return;
    if (meta.hidden && !state.isAdmin) return;
    const canRead = !meta.isSecret || meta.isMine || state.isAdmin;
    jobs.push((async () => {
      let content = null;
      if (canRead) {
        try { content = (await db.ref(`feedbackContent/${meta.id}`).once("value")).val(); } catch (_) { content = null; }
      }
      items.push({ ...meta, content });
    })());
  });
  await Promise.all(jobs);
  const comparators = {
    new: (a, b) => b.createdAt - a.createdAt,
    old: (a, b) => a.createdAt - b.createdAt,
    popular: (a, b) => (b.popularityScore || 0) - (a.popularityScore || 0),
    likes: (a, b) => (b.likeCount || 0) - (a.likeCount || 0),
    dislikes: (a, b) => (b.dislikeCount || 0) - (a.dislikeCount || 0)
  };
  return items.sort(comparators[state.feedbackSort]);
}
async function updateFeedback(id, content) {
  content = content.trim();
  if (content.length <= 5) throw new Error("조금만 더 자세히 적어주세요.");
  if (content.length > 300) throw new Error("300자 이내로 줄여주세요.");
  const owner = (await db.ref(`feedbackOwners/${id}/${state.user.id}`).once("value")).val() === true;
  if (!owner) throw new Error("내 의견만 수정할 수 있어요.");
  await db.ref().update({ [`feedbackContent/${id}/content`]: content, [`feedbackMeta/${id}/updatedAt`]: serverNow() });
}
async function deleteFeedback(id) {
  const owner = (await db.ref(`feedbackOwners/${id}/${state.user.id}`).once("value")).val() === true;
  if (!owner) throw new Error("내 의견만 삭제할 수 있어요.");
  await db.ref(`feedbackMeta/${id}`).update({ deleted: true, deletedAt: serverNow(), updatedAt: serverNow() });
}
async function saveAdminReply(id, reply) {
  if (!state.isAdmin) throw new Error("관리자만 답변할 수 있어요.");
  reply = reply.trim();
  if (!reply) throw new Error("답변 내용을 입력해 주세요.");
  await db.ref().update({ [`feedbackContent/${id}/adminReply`]: reply, [`feedbackContent/${id}/repliedAt`]: serverNow(), [`feedbackContent/${id}/repliedBy`]: state.user.id, [`feedbackContent/${id}/repliedByNickname`]: state.user.nickname, [`feedbackMeta/${id}/status`]: "answered", [`feedbackMeta/${id}/updatedAt`]: serverNow() });
}
async function toggleFeedbackHidden(id, hidden) {
  if (!state.isAdmin) throw new Error("관리자만 관리할 수 있어요.");
  await db.ref(`feedbackMeta/${id}`).update({ hidden, updatedAt: serverNow() });
}
async function renderFeedback() {
  loading();
  try {
    const list = await loadFeedback();
    const editing = state.editingFeedback;
    appEl.innerHTML = `<section class="screen"><h2>의견 보내기</h2><p class="muted">게임에 바라는 점이나 불편한 점을 남겨주세요.</p><form id="feedbackForm" class="card feedback-form"><textarea id="feedbackText" maxlength="300" placeholder="의견을 적어주세요" required>${editing ? escapeHtml(editing.content) : ""}</textarea>${editing ? "" : `<label class="check-row"><input id="anonymousCheck" type="checkbox"> 익명으로 올리기</label><label class="check-row"><input id="secretCheck" type="checkbox"> 비밀글로 올리기</label>`}<div class="button-row">${editing ? '<button id="cancelFeedbackEdit" class="button ghost" type="button">취소</button>' : ""}<button class="button primary" type="submit">${editing ? "수정 저장" : "보내기"}</button></div></form><div class="feedback-view-tabs"><button data-feedback-view="all" class="${state.feedbackView === "all" ? "active" : ""}">전체 글</button><button data-feedback-view="mine" class="${state.feedbackView === "mine" ? "active" : ""}">내 글</button></div><div class="feedback-sorts">${FEEDBACK_SORTS.map(([key, label]) => `<button data-feedback-sort="${key}" class="${state.feedbackSort === key ? "active" : ""}">${label}</button>`).join("")}</div><div>${list.length ? list.map(feedbackCard).join("") : emptyHtml("", "아직 의견이 없어요.")}</div></section>`;
    bindFeedback(list);
  } catch (error) {
    console.error(error);
    appEl.innerHTML = `<section class="screen">${emptyHtml("", "의견을 불러오지 못했어요.")}</section>`;
  }
}
function feedbackCard(f) {
  const secretLocked = f.isSecret && !f.content;
  const body = secretLocked ? '<div class="secret-feedback">🔒 비밀글입니다.<br><span>운영자와 작성자만 내용을 볼 수 있습니다.</span></div>' : `<p class="feedback-content">${escapeHtml(f.content?.content || "")}</p>`;
  const reply = f.content?.adminReply ? `<div class="admin-reply"><b>💬 운영자 답변</b><p>${escapeHtml(f.content.adminReply)}</p></div>` : "";
  return `<article class="card feedback-card ${f.hidden ? "is-hidden" : ""}"><div class="feedback-head"><b>${f.isSecret ? "🔒 " : ""}${escapeHtml(f.displayAuthor)}</b><span>${f.status === "answered" ? "답변 완료" : "답변 대기"}${f.hidden ? " · 숨김" : ""}</span></div>${body}${reply}<div class="reaction-row"><button class="feedback-reaction like ${f.myReaction === "like" ? "is-active" : ""}" data-react="like" data-id="${f.id}" aria-pressed="${f.myReaction === "like" ? "true" : "false"}" ${f.isMine ? "disabled" : ""}>👍 ${Number(f.likeCount) || 0}</button><button class="feedback-reaction dislike ${f.myReaction === "dislike" ? "is-active" : ""}" data-react="dislike" data-id="${f.id}" aria-pressed="${f.myReaction === "dislike" ? "true" : "false"}" ${f.isMine ? "disabled" : ""}>👎 ${Number(f.dislikeCount) || 0}</button></div>${f.isMine ? `<div class="button-row compact"><button class="button ghost" data-edit-feedback="${f.id}">수정</button><button class="button danger" data-delete-feedback="${f.id}">삭제</button></div>` : ""}${state.isAdmin ? `<div class="admin-tools"><textarea data-reply-text="${f.id}" placeholder="운영자 답변">${escapeHtml(f.content?.adminReply || "")}</textarea><div class="button-row compact"><button class="button secondary" data-admin-reply="${f.id}">${f.content?.adminReply ? "답변 수정" : "답변하기"}</button><button class="button ghost" data-admin-hide="${f.id}" data-hidden="${f.hidden}">${f.hidden ? "다시 보이기" : "숨기기"}</button></div></div>` : ""}</article>`;
}
function bindFeedback(list) {
  const form = document.querySelector("#feedbackForm");
  form.onsubmit = async event => {
    event.preventDefault();
    const button = event.submitter;
    if (!button || button.disabled) return;
    const content = document.querySelector("#feedbackText").value;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = state.editingFeedback ? "저장 중…" : "보내는 중…";
    try {
      if (state.editingFeedback) await updateFeedback(state.editingFeedback.id, content);
      else await submitFeedback(content, document.querySelector("#anonymousCheck").checked, document.querySelector("#secretCheck").checked);
      state.editingFeedback = null;
      showToast("의견을 저장했어요.");
      renderFeedback();
    } catch (error) {
      showToast(userErrorMessage(error, "의견을 저장하지 못했어요. 입력한 내용은 그대로 있으니 다시 시도해 주세요."));
      button.disabled = false;
      button.textContent = originalText;
    }
  };
  document.querySelector("#cancelFeedbackEdit")?.addEventListener("click", () => { state.editingFeedback = null; renderFeedback(); });
  document.querySelectorAll("[data-feedback-view]").forEach(button => button.onclick = () => { state.feedbackView = button.dataset.feedbackView; state.editingFeedback = null; renderFeedback(); });
  document.querySelectorAll("[data-feedback-sort]").forEach(button => button.onclick = () => { state.feedbackSort = button.dataset.feedbackSort; renderFeedback(); });
  document.querySelectorAll("[data-react]").forEach(button => button.onclick = async () => { if (button.disabled) return; const original = button.textContent; button.disabled = true; button.textContent = "처리 중…"; try { await toggleFeedbackReaction(button.dataset.id, button.dataset.react); renderFeedback(); } catch (error) { showToast(userErrorMessage(error)); button.disabled = false; button.textContent = original; } });
  document.querySelectorAll("[data-edit-feedback]").forEach(button => button.onclick = () => { const feedback = list.find(item => item.id === button.dataset.editFeedback); state.editingFeedback = { id: feedback.id, content: feedback.content?.content || "" }; renderFeedback(); });
  document.querySelectorAll("[data-delete-feedback]").forEach(button => button.onclick = () => confirmModal("이 의견을 정말 삭제할까요?", "삭제하면 다시 되돌릴 수 없고 목록에서도 보이지 않습니다.", async () => { await deleteFeedback(button.dataset.deleteFeedback); showToast("의견을 삭제했어요."); renderFeedback(); }));
  document.querySelectorAll("[data-admin-reply]").forEach(button => button.onclick = async () => { if (button.disabled) return; const original = button.textContent; button.disabled = true; button.textContent = "저장 중…"; try { await saveAdminReply(button.dataset.adminReply, document.querySelector(`[data-reply-text="${button.dataset.adminReply}"]`).value); showToast("답변을 저장했어요."); renderFeedback(); } catch (error) { showToast(userErrorMessage(error)); button.disabled = false; button.textContent = original; } });
  document.querySelectorAll("[data-admin-hide]").forEach(button => button.onclick = async () => { if (button.disabled) return; const original = button.textContent; button.disabled = true; button.textContent = "처리 중…"; try { await toggleFeedbackHidden(button.dataset.adminHide, button.dataset.hidden !== "true"); renderFeedback(); } catch (error) { showToast(userErrorMessage(error)); button.disabled = false; button.textContent = original; } });
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
  root.querySelector("[data-cancel]").onclick = () => root.innerHTML = "";
  root.querySelector("[data-confirm]").onclick = async event => {
    const button = event.currentTarget;
    if (button.disabled) return;
    const original = button.textContent;
    button.disabled = true;
    button.textContent = "처리 중…";
    try { await onConfirm(); root.innerHTML = ""; }
    catch (error) { showToast(userErrorMessage(error)); button.disabled = false; button.textContent = original; }
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
  if (!fallbackDrawing) return { correct: false, message: "그림을 찾을 수 없어요." };

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

  if (settledDrawing) {
    await claimAnswerRewards(resolvedId, settledDrawing);
    return outcome;
  }

  if (!outcome.correct) return outcome;
  if (!result.committed) return { correct: false, message: "다른 사람이 먼저 맞혔어요." };

  await claimAnswerRewards(resolvedId, result.snapshot.val());
  return outcome;
}
async function toggleLike(drawingId) {
  const drawing = (await db.ref(`drawings/${drawingId}`).once("value")).val();
  if (!drawing || !["solved", "expired"].includes(drawing.status)) throw new Error("좋아요를 누를 수 없는 그림이에요.");
  if (drawing.drawerId === state.user.id) throw new Error("내 그림에는 좋아요를 누를 수 없어요.");
  let liked = false;
  const result = await db.ref(`drawingLikes/${drawingId}/${state.user.id}`).transaction(value => {
    liked = value !== true;
    return liked ? true : null;
  }, null, false);
  if (!result.committed) throw new Error("좋아요를 바꾸지 못했어요.");
  showToast(liked ? "좋아요를 눌렀어요!" : "좋아요를 취소했어요.");
}
async function toggleFeedbackReaction(id, next) {
  const owner = (await db.ref(`feedbackOwners/${id}/${state.user.id}`).once("value")).val() === true;
  if (owner) throw new Error("내 의견에는 반응할 수 없어요.");
  let current = null;
  const result = await db.ref(`feedbackReactions/${id}/${state.user.id}`).transaction(value => {
    current = value === next ? null : next;
    return current;
  }, null, false);
  if (!result.committed) throw new Error("반응을 저장하지 못했어요.");
  showToast(current ? `${current === "like" ? "좋아요" : "싫어요"}를 눌렀어요.` : "반응을 취소했어요.");
}

boot();
