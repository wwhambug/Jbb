import type {
  FighterTemplate,
  MoveKind,
  SpecialKind,
  VariantSpec,
} from "./types";

const KINDS: MoveKind[] = [
  "bolt",
  "dash",
  "burst",
  "pull",
  "push",
  "beam",
  "trap",
  "orbit",
  "split",
  "heal",
];

const SPECIALS: SpecialKind[] = [
  "shield",
  "haste",
  "thorns",
  "regen",
  "blink",
  "phase",
  "overcharge",
  "cleanse",
  "gravity",
  "counter",
];

type FighterSeed = {
  id: string;
  name: string;
  mark: string;
  role: string;
  trait: string;
  color: string;
  ink: string;
  moveNames: [string, string, string, string, string];
};

const SEEDS: FighterSeed[] = [
  { id: "gojo", name: "고죠", mark: "GJ", role: "공간술사", trait: "거리를 접어 상대를 끌고 밀어낸다.", color: "#60a5fa", ink: "#102a56", moveNames: ["청색 당김", "적색 튕김", "무한 회랑", "보랏빛 충돌", "거리 무효"] },
  { id: "skuna", name: "스쿠나", mark: "SK", role: "참격왕", trait: "빠른 선형 공격과 영역 압박에 특화됐다.", color: "#fb7185", ink: "#50131f", moveNames: ["해", "팔", "복마 난도", "불꽃 개방", "왕의 반격"] },
  { id: "block-pick", name: "네모난 곡괭이", mark: "PX", role: "광부", trait: "단단한 방어를 깨고 파편을 흩뿌린다.", color: "#38bdf8", ink: "#12354a", moveNames: ["철 곡괭이", "다이아 강타", "기반암 굴착", "광맥 폭주", "채굴 가속"] },
  { id: "block-axe", name: "네모난 도끼", mark: "AX", role: "벌목꾼", trait: "근접 돌진과 넓은 회전 공격이 강하다.", color: "#a78bfa", ink: "#35245b", moveNames: ["참나무 찍기", "회전 벌목", "삼림 붕괴", "도끼비", "나무 갑옷"] },
  { id: "thunder-post", name: "번개우체부", mark: "PO", role: "속달", trait: "누구보다 빨리 공격을 배달한다.", color: "#facc15", ink: "#493b04", moveNames: ["등기 번개", "속달 돌진", "천둥 배송", "반송 폭풍", "초특급"] },
  { id: "fire-dumpling", name: "화염만두", mark: "FD", role: "요리사", trait: "뜨거운 장판으로 길목을 막는다.", color: "#fb923c", ink: "#55220a", moveNames: ["군만두 투척", "불판 구르기", "철판 지옥", "왕만두 폭발", "증기 보호"] },
  { id: "ice-merchant", name: "얼음장수", mark: "IC", role: "빙결상", trait: "상대의 속도를 빼앗아 냉동 보관한다.", color: "#67e8f9", ink: "#16425a", moveNames: ["얼음 조각", "냉장 밀치기", "빙점 시장", "극저온 창고", "성에 코팅"] },
  { id: "snail-knight", name: "달팽이기사", mark: "SN", role: "중갑", trait: "느리지만 질기고 맞을수록 단단해진다.", color: "#84cc16", ink: "#273c08", moveNames: ["촉각 찌르기", "껍질 박치기", "나선 성채", "점액 행진", "완전 수납"] },
  { id: "rubber-duck", name: "고무오리", mark: "DU", role: "튀김꾼", trait: "엉뚱한 궤도와 반동으로 전장을 휘젓는다.", color: "#fde047", ink: "#4c4105", moveNames: ["꽥 탄환", "욕조 튕김", "거대 꽥", "러버 웨이브", "물에 뜨기"] },
  { id: "ink-octopus", name: "잉크문어", mark: "IN", role: "화가", trait: "잉크 덫과 위장으로 시야를 장악한다.", color: "#818cf8", ink: "#252a60", moveNames: ["먹물 점사", "촉수 당김", "검은 캔버스", "팔방 먹물", "잉크 잠행"] },
  { id: "magnet-chief", name: "자석대장", mark: "MG", role: "극성술사", trait: "끌어당김과 밀어내기를 번갈아 쓴다.", color: "#f43f5e", ink: "#4f0d1b", moveNames: ["N극 당김", "S극 밀침", "자기 폭풍", "극성 역전", "철분 방패"] },
  { id: "drill-bean", name: "드릴콩", mark: "DB", role: "돌파수", trait: "작은 몸으로 방어선에 구멍을 낸다.", color: "#a3e635", ink: "#294208", moveNames: ["콩알 탄", "나선 돌진", "초고속 천공", "콩 폭우", "껍질 재생"] },
  { id: "shadow-ninja", name: "그림자닌자", mark: "NJ", role: "암행", trait: "순간 이동 후 빈틈을 베고 사라진다.", color: "#64748b", ink: "#17202d", moveNames: ["표창", "그림자 베기", "천영 분신", "암야 일섬", "연막 이동"] },
  { id: "sun-rabbit", name: "태양토끼", mark: "SR", role: "광속수", trait: "밝은 광선과 빠른 도약을 이어 붙인다.", color: "#fbbf24", ink: "#4f3504", moveNames: ["햇살 콩", "일광 도약", "정오 폭발", "태양 귀", "광합성"] },
  { id: "moon-wolf", name: "달빛늑대", mark: "MW", role: "추적자", trait: "약해진 상대를 끝까지 추적한다.", color: "#94a3b8", ink: "#263240", moveNames: ["초승달", "은빛 추격", "보름 포효", "월식 사냥", "야간 회복"] },
  { id: "mushroom-doc", name: "버섯박사", mark: "MD", role: "포자학자", trait: "덫을 심고 스스로를 회복한다.", color: "#c084fc", ink: "#421a5a", moveNames: ["포자탄", "균사 돌진", "버섯 군락", "거대 포자", "응급 배양"] },
  { id: "storm-captain", name: "폭풍선장", mark: "SC", role: "항해사", trait: "회오리로 적의 경로를 망가뜨린다.", color: "#22d3ee", ink: "#0c4050", moveNames: ["바람 포", "닻 돌진", "대폭풍", "해일 선회", "순풍 항해"] },
  { id: "hourglass", name: "모래시계", mark: "HG", role: "시간지기", trait: "빠르게 움직였다가 상대를 느리게 만든다.", color: "#d6b276", ink: "#44331d", moveNames: ["모래알", "시간 밀기", "정지 구역", "역행 파동", "찰나 가속"] },
  { id: "glass-cannon", name: "유리대포", mark: "GC", role: "극딜러", trait: "약하지만 사거리와 화력이 무례하다.", color: "#bae6fd", ink: "#16405b", moveNames: ["유리탄", "굴절 광선", "프리즘 포격", "수정 파편", "균열 과충전"] },
  { id: "iron-potato", name: "철벽감자", mark: "IP", role: "수비수", trait: "단단한 방패로 공격을 버틴다.", color: "#a16207", ink: "#2f1d05", moveNames: ["감자 투척", "철판 밀기", "감자 요새", "전분 대폭발", "껍질 방패"] },
  { id: "bee-queen", name: "꿀벌여왕", mark: "BQ", role: "군집왕", trait: "여러 발을 동시에 쏘고 빠르게 재정비한다.", color: "#eab308", ink: "#433704", moveNames: ["벌침", "꿀 돌진", "일벌 편대", "여왕의 군무", "로열 젤리"] },
  { id: "bone-flute", name: "해골피리", mark: "BF", role: "음유술사", trait: "소리의 파동으로 거리를 벌린다.", color: "#e5e7eb", ink: "#30343b", moveNames: ["뼈 음표", "불협 밀치기", "망령 합주", "백골 행진", "공명 갑옷"] },
  { id: "cactus-kick", name: "선인장킥", mark: "CK", role: "반격수", trait: "가까이 오면 가시와 발차기로 되갚는다.", color: "#22c55e", ink: "#0d4220", moveNames: ["가시탄", "사막 킥", "천개 가시", "오아시스 붕괴", "가시 반사"] },
  { id: "wave-surfer", name: "파도서퍼", mark: "WS", role: "기동수", trait: "파도를 타고 충돌 각도를 바꾼다.", color: "#0ea5e9", ink: "#073b58", moveNames: ["물방울", "파도 타기", "쓰나미 라인", "소용돌이", "물결 회피"] },
  { id: "star-candy", name: "별사탕", mark: "ST", role: "유성술사", trait: "갈라지는 별 조각으로 빈틈을 채운다.", color: "#f9a8d4", ink: "#54213e", moveNames: ["별가루", "사탕 돌진", "유성우", "초신성 사탕", "달콤 재생"] },
  { id: "chess-king", name: "체스킹", mark: "KG", role: "지휘관", trait: "한 칸씩 확실하게 전장을 점유한다.", color: "#f8fafc", ink: "#111827", moveNames: ["폰 전진", "룩 밀치기", "체크메이트", "캐슬링 포격", "왕의 수비"] },
  { id: "chess-knight", name: "체스나이트", mark: "KN", role: "도약수", trait: "예측하기 힘든 각도로 뛰어든다.", color: "#334155", ink: "#f8fafc", moveNames: ["나이트 포크", "L자 도약", "더블 체크", "기사단 돌격", "앙파상 회피"] },
  { id: "pixel-mage", name: "픽셀마법사", mark: "PM", role: "도트술사", trait: "공격을 셋으로 복제해 화면을 채운다.", color: "#8b5cf6", ink: "#281554", moveNames: ["8비트 볼트", "버퍼 대시", "해상도 붕괴", "픽셀 샤워", "세이브 로드"] },
  { id: "ramen-dragon", name: "라면용", mark: "RD", role: "면룡", trait: "뜨거운 국물과 면발로 적을 묶는다.", color: "#ef4444", ink: "#511313", moveNames: ["면발 채찍", "국물 분사", "라면 해일", "용의 후루룩", "면발 재생"] },
  { id: "space-cleaner", name: "우주청소부", mark: "SP", role: "진공부", trait: "쓰레기와 상대를 한곳에 빨아들인다.", color: "#14b8a6", ink: "#0a433e", moveNames: ["먼지탄", "빗자루 돌진", "블랙홀 청소", "궤도 쓰레기", "진공 보호복"] },
  { id: "origami-crane", name: "종이접기학", mark: "OC", role: "접기술사", trait: "가볍게 피하고 날카롭게 접어 친다.", color: "#f1f5f9", ink: "#1e3a5f", moveNames: ["종이날", "학의 비행", "천 마리의 학", "종이 폭풍", "방패 접기"] },
  { id: "broken-robot", name: "고장난로봇", mark: "BR", role: "오작동", trait: "예측 불가능한 과충전이 의외로 정확하다.", color: "#94a3b8", ink: "#26313f", moveNames: ["너트 발사", "오류 돌진", "시스템 폭주", "재부팅 레이저", "긴급 패치"] },
  { id: "note-ghost", name: "음표유령", mark: "NG", role: "공명체", trait: "관통하는 음파와 회복 리듬을 쓴다.", color: "#c4b5fd", ink: "#37245f", moveNames: ["높은 도", "베이스 밀기", "유령 교향곡", "침묵의 절정", "회복 박자"] },
  { id: "rice-hammer", name: "떡망치", mark: "RH", role: "장인", trait: "짧은 거리에서 묵직하게 전장을 찧는다.", color: "#f5d0a9", ink: "#55351e", moveNames: ["콩고물탄", "떡메치기", "명절 대진동", "절구 폭발", "쫀득 방어"] },
  { id: "cloud-thief", name: "구름도둑", mark: "CT", role: "절도범", trait: "속도와 거리를 훔쳐 달아난다.", color: "#e2e8f0", ink: "#334155", moveNames: ["안개탄", "바람 훔치기", "하늘 절도", "뇌운 강탈", "구름 숨기"] },
  { id: "volcano-mole", name: "화산두더지", mark: "VM", role: "굴착수", trait: "땅속에서 튀어나와 화염 지대를 만든다.", color: "#dc2626", ink: "#4a0d0d", moveNames: ["용암돌", "지하 돌진", "분화구", "대분화", "마그마 갑옷"] },
  { id: "glacier-penguin", name: "빙하펭귄", mark: "GP", role: "슬라이더", trait: "미끄러지며 상대를 얼리고 튕긴다.", color: "#dbeafe", ink: "#172554", moveNames: ["눈덩이", "배밀이", "빙산 충돌", "극지 폭설", "지방 방패"] },
  { id: "laser-tofu", name: "레이저두부", mark: "LT", role: "광선체", trait: "부드러운 몸에서 단단한 광선이 나온다.", color: "#fef3c7", ink: "#4c3a08", moveNames: ["콩 레이저", "두부 박치기", "두유 광선망", "초당 순두부", "응고 방패"] },
  { id: "toxic-shroom", name: "독버섯", mark: "TS", role: "지대술사", trait: "오래 남는 위험 구역을 퍼뜨린다.", color: "#a855f7", ink: "#3b0d57", moveNames: ["독포자", "균사 당김", "맹독 군락", "보랏빛 안개", "독성 반격"] },
  { id: "shield-turtle", name: "방패거북", mark: "TU", role: "요새", trait: "공격을 막고 그대로 튕겨낸다.", color: "#16a34a", ink: "#083b1a", moveNames: ["등딱지탄", "방패 밀기", "움직이는 성", "거북 함대", "완전 방어"] },
  { id: "balloon-boxer", name: "풍선복서", mark: "BB", role: "권투수", trait: "가볍게 접근해 연속으로 튕겨낸다.", color: "#f472b6", ink: "#511739", moveNames: ["잽 바람", "어퍼 점프", "백 펀치 러시", "폭발 훅", "공기 주입"] },
  { id: "camera-man", name: "카메라맨", mark: "CM", role: "기록자", trait: "번쩍임으로 멈추게 한 뒤 장면을 가져간다.", color: "#78716c", ink: "#1c1917", moveNames: ["셔터 샷", "줌 당김", "연속 촬영", "화이트 플래시", "초점 고정"] },
  { id: "clock-rabbit", name: "시계토끼", mark: "CR", role: "초침수", trait: "쿨다운을 앞당겨 공격 순서를 비튼다.", color: "#f59e0b", ink: "#4a2b05", moveNames: ["초침탄", "분침 도약", "열두 시", "시간 폭주", "태엽 감기"] },
  { id: "doodle-demon", name: "낙서악마", mark: "DD", role: "그림술사", trait: "선을 그어 위험한 낙서를 현실로 만든다.", color: "#111827", ink: "#f8fafc", moveNames: ["연필심", "지우개 밀기", "검은 낙서장", "선 밖의 괴물", "쓱싹 회피"] },
  { id: "alchemy-slime", name: "연금슬라임", mark: "AS", role: "변환체", trait: "맞은 힘을 보호막과 회복으로 바꾼다.", color: "#34d399", ink: "#064e3b", moveNames: ["점액탄", "금속화 돌진", "현자의 냄비", "황금 범람", "물질 변환"] },
  { id: "bomb-chick", name: "폭탄병아리", mark: "BC", role: "폭발수", trait: "작지만 넓게 터지는 공격을 품었다.", color: "#fbbf24", ink: "#3f2e05", moveNames: ["알 폭탄", "삐약 돌진", "둥지 폭격", "거대 알람", "폭발 깃털"] },
  { id: "hook-pirate", name: "갈고리해적", mark: "HP", role: "약탈자", trait: "멀리 있는 적을 끌고 가까이서 밀어낸다.", color: "#b45309", ink: "#3b1b05", moveNames: ["갈고리", "선수 돌진", "유령선 포격", "심해 약탈", "선장 방패"] },
  { id: "gravity-apple", name: "중력사과", mark: "GA", role: "낙하술사", trait: "전장의 중심을 자기 쪽으로 구부린다.", color: "#ef4444", ink: "#450a0a", moveNames: ["씨앗탄", "낙하 박치기", "만유인력", "사과별 붕괴", "중력 껍질"] },
  { id: "goblin-club", name: "도깨비방망이", mark: "GB", role: "요술수", trait: "크기와 속도를 순간적으로 바꾼다.", color: "#6366f1", ink: "#1e1b4b", moveNames: ["도깨비불", "방망이질", "금 나와라", "뚝딱 폭풍", "감투 숨기"] },
  { id: "blank-emperor", name: "백지황제", mark: "BE", role: "무효왕", trait: "상태 이상을 지우고 빈 공간을 공격한다.", color: "#ffffff", ink: "#0f172a", moveNames: ["여백탄", "문단 밀기", "전면 백지화", "마지막 마침표", "수정액"] },
];

const makeMove = (
  name: string,
  kind: MoveKind,
  index: number,
  ultimate: boolean,
) => ({
  name,
  kind,
  damage: ultimate ? 30 + (index % 5) * 3 : 9 + (index % 5) * 1.5,
  cooldown: ultimate ? 0 : 1.05 + (index % 4) * 0.14,
  range: ultimate ? 220 + (index % 4) * 35 : 145 + (index % 5) * 22,
  speed: 245 + (index % 6) * 24,
});

export const FIGHTERS: FighterTemplate[] = SEEDS.map((seed, index) => {
  const baseKind = KINDS[index % KINDS.length];
  const secondKind = KINDS[(index * 3 + 4) % KINDS.length];
  const ultKind = KINDS[(index * 5 + 2) % KINDS.length];
  const secondUltKind = KINDS[(index * 7 + 7) % KINDS.length];
  return {
    id: seed.id,
    name: seed.name,
    mark: seed.mark,
    role: seed.role,
    trait: seed.trait,
    color: seed.color,
    ink: seed.ink,
    hp: 155 + (index % 7) * 9,
    speed: 78 + (index % 8) * 4,
    radius: 18 + (index % 5),
    basics: [
      makeMove(seed.moveNames[0], baseKind, index, false),
      makeMove(seed.moveNames[1], secondKind, index + 2, false),
    ],
    ultimates: [
      makeMove(seed.moveNames[2], ultKind, index + 1, true),
      makeMove(seed.moveNames[3], secondUltKind, index + 3, true),
    ],
    special: {
      name: seed.moveNames[4],
      kind: SPECIALS[(index * 3) % SPECIALS.length],
      cooldown: 7.5 + (index % 5) * 0.7,
      power: 18 + (index % 6) * 4,
    },
  };
});

export const FIGHTER_BY_ID = new Map(FIGHTERS.map((fighter) => [fighter.id, fighter]));

export const VARIANTS: VariantSpec[] = [
  { id: "classic", name: "기본형", short: "기본", description: "원래 능력치 그대로 싸운다.", color: "#64748b" },
  { id: "supercharged", name: "슈퍼차지드", short: "충전", description: "0.55초 충전 후 45% 강한 공격을 발사한다.", color: "#7c3aed" },
  { id: "flame", name: "화염형", short: "화염", description: "공격이 3초 동안 작은 화상 피해를 남긴다.", color: "#ea580c" },
  { id: "frost", name: "빙결형", short: "빙결", description: "공격이 상대 이동 속도를 잠시 낮춘다.", color: "#0891b2" },
  { id: "titan", name: "거대형", short: "거대", description: "체력과 크기가 늘지만 이동이 느려진다.", color: "#854d0e" },
  { id: "swift", name: "신속형", short: "신속", description: "이동과 재사용 속도가 빨라진다.", color: "#16a34a" },
];
