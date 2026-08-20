export type PixelMatrix = readonly string[];

export interface PixelStyle {
  face: PixelMatrix;
  ultimateFace?: PixelMatrix;
  item: PixelMatrix;
  itemName: string;
  accent: string;
  accent2: string;
  reach: number;
  damage: number;
  spin: number;
  itemRadius: number;
}

export const PIXEL_PALETTE: Record<string, string> = {
  K: "#111827",
  W: "#f8fafc",
  M: "#94a3b8",
  D: "#475569",
  R: "#ef4444",
  O: "#f97316",
  Y: "#facc15",
  G: "#22c55e",
  U: "#38bdf8",
  B: "#2563eb",
  P: "#a855f7",
  N: "#713f12",
  I: "#f5d0a9",
};

const art = (...rows: string[]) => rows;

const FACES = {
  blindfold: art(
    ".........",
    "..WWWWW..",
    ".WWWWWWW.",
    ".KKKKKKK.",
    ".KKKKKKK.",
    "..K...K..",
    ".........",
  ),
  sixEyes: art(
    ".........",
    "..WWWWW..",
    ".WWWWWWW.",
    "..U...U..",
    ".UBU.UBU.",
    "..K...K..",
    ".........",
  ),
  tattoos: art(
    ".........",
    ".K.....K.",
    "..R...R..",
    ".KK...KK.",
    "...KKK...",
    ".K..K..K.",
    ".........",
  ),
  block: art(
    ".........",
    ".........",
    "..K...K..",
    "..W...W..",
    "....K....",
    "..KKKKK..",
    ".........",
  ),
  visor: art(
    ".........",
    ".MMMMMMM.",
    ".KUUUUUK.",
    ".MMMMMMM.",
    "....K....",
    "..KKKKK..",
    ".........",
  ),
  cute: art(
    ".........",
    ".........",
    "..K...K..",
    "..W...W..",
    ".........",
    "...KKK...",
    ".........",
  ),
  fierce: art(
    ".........",
    ".KK...KK.",
    "..K...K..",
    "..R...R..",
    "....K....",
    "..K.K.K..",
    ".........",
  ),
  sleepy: art(
    ".........",
    ".........",
    ".KKK.KKK.",
    ".........",
    "....K....",
    "..KKKKK..",
    ".........",
  ),
  mask: art(
    ".........",
    "..KKKKK..",
    ".K.W.W.K.",
    ".K.KKK.K.",
    ".K.KKK.K.",
    "..KKKKK..",
    ".........",
  ),
  royal: art(
    "..Y.Y.Y..",
    "..YYYYY..",
    "...YYY...",
    "..K...K..",
    "..W...W..",
    "...KKK...",
    ".........",
  ),
  goggles: art(
    ".........",
    ".KKK.KKK.",
    ".KUK.KUK.",
    ".KKK.KKK.",
    "....K....",
    "..KKKKK..",
    ".........",
  ),
  beak: art(
    ".........",
    "..K...K..",
    "..W...W..",
    "...YYY...",
    "....Y....",
    ".........",
    ".........",
  ),
  ghost: art(
    ".........",
    "..W...W..",
    "..U...U..",
    ".........",
    "...WWW...",
    "..W...W..",
    ".........",
  ),
  slime: art(
    ".........",
    ".........",
    "..K...K..",
    "..G...G..",
    ".........",
    "..K.K.K..",
    "...KKK...",
  ),
} satisfies Record<string, PixelMatrix>;

const ITEMS = {
  voidOrb: art(
    ".........", "...PPP...", "..PBBBP..", ".PBUUUBP.", ".PBUKUBP.",
    ".PBUUUBP.", "..PBBBP..", "...PPP...", ".........",
  ),
  cleave: art(
    ".......K.", "......KR.", ".....KRR.", "....KRR..", "...KRR...",
    "..KRR....", ".KRR.....", "KR.......", ".........",
  ),
  pickaxe: art(
    ".MMMMMM..", "MMKKKKMM.", "....NN...", "....NN...", "....NN...",
    "....NN...", "....NN...", "....NN...", ".........",
  ),
  axe: art(
    "..RRR....", ".RMMMR...", ".RMMMR...", "..RMR....", "...NN....",
    "...NN....", "...NN....", "...NN....", ".........",
  ),
  mailBolt: art(
    ".........", ".WWWWWWW.", ".WUUUUUW.", ".WUWWWUW.", ".WWWUWWW.",
    ".WUUUUUW.", ".WWWWWWW.", "...YYY...", "....Y....",
  ),
  dumpling: art(
    ".........", "..OOOOO..", ".OIIIIIIO.", ".OIOOOIO.", ".OIIIIIIO.",
    "..OOOOO..", "...RRR...", "..R.R.R..", ".........",
  ),
  iceCart: art(
    "..UUUUU..", ".UWWWWWU.", ".UWUWUWU.", ".UWWWWWU.", ".UUUUUUU.",
    "..K...K..", ".KK...KK.", ".........", ".........",
  ),
  shellLance: art(
    "....M....", "....M....", "....M....", "....M....", "...MMM...",
    "..MNMNM..", ".MNNNNNM.", "..MNNNM..", "...MMM...",
  ),
  duck: art(
    ".........", "...YYY...", "..YYYYY..", ".YYKYYYYY.", ".YYYYOOOO.",
    "..YYYYY..", "...YYY...", ".........", ".........",
  ),
  inkBrush: art(
    ".....K...", "....KK...", "...KK....", "..NN.....", "..NN.....",
    ".PP......", ".PPP.....", "PPPP.....", ".........",
  ),
  magnet: art(
    ".RR...UU.", ".RR...UU.", ".RR...UU.", ".RR...UU.", ".RR...UU.",
    ".RR...UU.", "..RRMRR..", "...MMM...", ".........",
  ),
  drill: art(
    "....M....", "...MMM...", "..MMMMM..", "...MMM...", "..MMMMM..",
    "...MMM...", "....M....", "....N....", "....N....",
  ),
  shuriken: art(
    "....M....", ".M..M..M.", "..MMMMM..", "...MKM...", ".MMMMMMM.",
    "...MMM...", "..M...M..", ".M.....M.", ".........",
  ),
  sun: art(
    "....Y....", ".Y..Y..Y.", "..YYYYY..", "..YOOOY..", "YYYOOOYYY",
    "..YOOOY..", "..YYYYY..", ".Y..Y..Y.", "....Y....",
  ),
  moonClaw: art(
    "....WWW..", "...WW....", "..WW.....", ".WW..M...", ".W..MM...",
    "....M.M..", "...M..M..", "..M...M..", ".........",
  ),
  mushroom: art(
    "...PPP...", "..PPPPP..", ".PWPWPWP.", ".PPPPPPP.", "...III...",
    "...IKI...", "...III...", ".........", ".........",
  ),
  anchor: art(
    "....M....", "...MKM...", "....M....", "....M....", ".M..M..M.",
    ".MM.M.MM.", "..MMMMM..", "...MMM...", ".........",
  ),
  hourglass: art(
    "..NNNNN..", "..NIIIN..", "...NIN...", "....N....", "...NIN...",
    "..NIIIN..", "..NNNNN..", ".........", ".........",
  ),
  cannon: art(
    ".........", ".MMMMMM..", "MMMMMMMM.", ".MMMMMM..", "....N....",
    "...NNN...", "..N...N..", ".NN...NN.", ".........",
  ),
  potatoShield: art(
    "..MMMMM..", ".MNNNNNM.", ".MNIIINM.", ".MNIKINM.", ".MNIIINM.",
    ".MNNNNNM.", "..MMMMM..", "...NNN...", ".........",
  ),
  stinger: art(
    "..Y...Y..", ".Y.YYY.Y.", "..YYYYY..", "...KKK...", "..YYYYY..",
    "...YYY...", "....M....", "....M....", ".........",
  ),
  flute: art(
    ".......M.", "......MM.", ".....MM..", "....MM...", "...MM....",
    "..MM.....", ".MM......", "MM.......", ".U..U..U.",
  ),
  cactusGlove: art(
    "...G.G...", ".G.GGG.G.", "..GGGGG..", ".GGGGGGG.", ".GGGKGGG.",
    "..GGGGG..", "...NNN...", "...NNN...", ".........",
  ),
  surfboard: art(
    "...UU....", "..UWWU...", ".UWWWWU..", ".UWWWWU..", "..UWWWWU.",
    "...UWWU..", "....UU...", "..YYYYY..", ".........",
  ),
  star: art(
    "....Y....", "....Y....", ".Y..Y..Y.", "..YYYYY..", "...YYY...",
    "..YYYYY..", ".Y..Y..Y.", "....Y....", ".........",
  ),
  crown: art(
    ".Y...Y.Y.", ".YY.YYYY.", ".YYYYYYY.", "..YYYYY..", "..YKYKY..",
    "..YYYYY..", ".........", ".........", ".........",
  ),
  knightSword: art(
    "....M....", "....M....", "....M....", "....M....", "....M....",
    "..MMMMM..", "....N....", "...NNN...", "....N....",
  ),
  pixelWand: art(
    "Y...Y....", ".Y.Y.....", "..Y......", ".Y.Y.....", "Y...Y....",
    "....P....", "....P....", "....P....", "....P....",
  ),
  noodle: art(
    "..RRRRR..", ".RIIIIIR.", ".RININIR.", ".RIIIIIR.", "..RRRRR..",
    "...I.I...", "..I...I..", ".I.....I.", ".........",
  ),
  broom: art(
    ".....N...", "....N....", "...N.....", "..N......", ".N.......",
    "YYY......", "YYYY.....", "YYYYY....", ".........",
  ),
  crane: art(
    ".........", ".....W...", "....WWW..", "W..WW....", ".WWWW....",
    "..WW.W...", "...W..W..", "......W..", ".........",
  ),
  wrench: art(
    ".MM...MM.", "..MM.MM..", "...MMM...", "....M....", "....M....",
    "....M....", "...MKM...", "...MMM...", ".........",
  ),
  note: art(
    "....PPP..", "....P....", "....P....", "....P....", "....P....",
    ".PPP.PP..", "PPPP.PPP.", ".PP...PP..", ".........",
  ),
  mallet: art(
    ".NNNNNN..", "NNNNNNNN.", ".NNNNNN..", "....M....", "....M....",
    "....M....", "....M....", "....M....", ".........",
  ),
  cloudDagger: art(
    "....W....", "..WWWWW..", ".WWWWWWW.", "...MMM...", "....M....",
    "....M....", "..MMMMM..", "....N....", ".........",
  ),
  magmaDrill: art(
    "....R....", "...ROR...", "..ROROR..", "...ROR...", "..ROROR..",
    "...ROR...", "....R....", "....N....", "....N....",
  ),
  iceFin: art(
    "....U....", "...UU....", "..UUU....", ".UUUU....", "UUUUU....",
    ".UUUUU...", "..UUUUU..", "...UUUUU.", ".........",
  ),
  tofuLaser: art(
    ".........", ".IIIIIII.", ".IKIKIKI.", ".IIIIIII.", "....R....",
    "....RR...", "....RRR..", "....RRRR.", ".........",
  ),
  poisonVial: art(
    "...MMM...", "...MKM...", "...MMM...", "..PPPPP..", ".PPGPGPP.",
    ".PPPPPPP.", "..PPPPP..", "...PPP...", ".........",
  ),
  turtleShield: art(
    "...GGG...", "..GMMMG..", ".GMGGMGG.", ".GMGKGMG.", ".GMGGMGG.",
    "..GMMMG..", "...GGG...", ".........", ".........",
  ),
  boxingGlove: art(
    "..RR.RR..", ".RRRRRRR.", ".RRRRRRR.", "..RRRRR..", "...RRR...",
    "...MMM...", "...MMM...", ".........", ".........",
  ),
  camera: art(
    "..MMMM...", ".MMMMMMM.", ".MKKKKKM.", ".MKUUUKM.", ".MKUBUKM.",
    ".MKUUUKM.", ".MKKKKKM.", ".MMMMMMM.", ".........",
  ),
  clockKey: art(
    "...YYY...", "..YKKKY..", ".YKWWWKY.", ".YKWKWKY.", ".YKWWWKY.",
    "..YKKKY..", "...YYY...", "....N....", "...NNN...",
  ),
  marker: art(
    "...KKK...", "...DDD...", "...DDD...", "...DDD...", "...DDD...",
    "...DDD...", "...YYY...", "....Y....", ".........",
  ),
  slimeFlask: art(
    "...MMM...", "...MKM...", "...MMM...", "..GGGGG..", ".GGUGUGG.",
    ".GGGGGGG.", "..GGGGG..", "...GGG...", ".........",
  ),
  eggBomb: art(
    "....N....", "...NNY...", "...YYY...", "..YWWWY..", ".YWKWKWY.",
    ".YWWWWWY.", "..YYYYY..", "...YYY...", ".........",
  ),
  hook: art(
    "....M....", "....M....", "....M....", "....M....", "....M....",
    "M...M....", "MM.MM....", ".MMM.....", ".........",
  ),
  apple: art(
    "....G....", "...GG....", "....N....", "..RRRRR..", ".RRRRRRR.",
    ".RRRKRRR.", ".RRRRRRR.", "..RRRRR..", ".........",
  ),
  goblinClub: art(
    "..NNNN...", ".NNNNNN..", "..NNNN...", "...NN....", "....N....",
    "....N....", "....N....", "....N....", ".........",
  ),
  blankScroll: art(
    "..WWWWW..", ".WKKKKKW.", ".WKWWWWW.", ".WKWWWWW.", ".WKWWWWW.",
    ".WKWWWWW.", ".WKKKKKW.", "..WWWWW..", ".........",
  ),
} satisfies Record<string, PixelMatrix>;

type StyleSeed = {
  id: string;
  face: PixelMatrix;
  ultimateFace?: PixelMatrix;
  item: keyof typeof ITEMS;
  itemName: string;
  accent: string;
  accent2: string;
  feel?: "quick" | "heavy" | "reach" | "balanced";
};

const STYLE_SEEDS: StyleSeed[] = [
  { id: "gojo", face: FACES.blindfold, ultimateFace: FACES.sixEyes, item: "voidOrb", itemName: "무한 구체", accent: "#f8fafc", accent2: "#38bdf8", feel: "reach" },
  { id: "skuna", face: FACES.tattoos, item: "cleave", itemName: "참격날", accent: "#fb7185", accent2: "#7f1d1d", feel: "quick" },
  { id: "block-pick", face: FACES.block, item: "pickaxe", itemName: "다이아 곡괭이", accent: "#38bdf8", accent2: "#8b5a2b", feel: "heavy" },
  { id: "block-axe", face: FACES.block, item: "axe", itemName: "픽셀 도끼", accent: "#a78bfa", accent2: "#8b5a2b", feel: "heavy" },
  { id: "thunder-post", face: FACES.goggles, item: "mailBolt", itemName: "번개 우편", accent: "#facc15", accent2: "#2563eb", feel: "quick" },
  { id: "fire-dumpling", face: FACES.cute, item: "dumpling", itemName: "불만두", accent: "#fb923c", accent2: "#ef4444", feel: "balanced" },
  { id: "ice-merchant", face: FACES.sleepy, item: "iceCart", itemName: "빙점 카트", accent: "#67e8f9", accent2: "#2563eb", feel: "reach" },
  { id: "snail-knight", face: FACES.mask, item: "shellLance", itemName: "껍질 창", accent: "#84cc16", accent2: "#713f12", feel: "reach" },
  { id: "rubber-duck", face: FACES.beak, item: "duck", itemName: "꽥 오리", accent: "#fde047", accent2: "#f97316", feel: "quick" },
  { id: "ink-octopus", face: FACES.fierce, item: "inkBrush", itemName: "먹물 붓", accent: "#818cf8", accent2: "#111827", feel: "reach" },
  { id: "magnet-chief", face: FACES.visor, item: "magnet", itemName: "극성 자석", accent: "#f43f5e", accent2: "#38bdf8", feel: "heavy" },
  { id: "drill-bean", face: FACES.cute, item: "drill", itemName: "콩 드릴", accent: "#a3e635", accent2: "#94a3b8", feel: "quick" },
  { id: "shadow-ninja", face: FACES.mask, item: "shuriken", itemName: "그림자 수리검", accent: "#64748b", accent2: "#111827", feel: "quick" },
  { id: "sun-rabbit", face: FACES.cute, item: "sun", itemName: "태양 귀", accent: "#fbbf24", accent2: "#f97316", feel: "quick" },
  { id: "moon-wolf", face: FACES.fierce, item: "moonClaw", itemName: "월광 발톱", accent: "#94a3b8", accent2: "#f8fafc", feel: "quick" },
  { id: "mushroom-doc", face: FACES.goggles, item: "mushroom", itemName: "포자 버섯", accent: "#c084fc", accent2: "#f8fafc", feel: "balanced" },
  { id: "storm-captain", face: FACES.fierce, item: "anchor", itemName: "폭풍 닻", accent: "#22d3ee", accent2: "#475569", feel: "heavy" },
  { id: "hourglass", face: FACES.sleepy, item: "hourglass", itemName: "시간 모래", accent: "#d6b276", accent2: "#713f12", feel: "balanced" },
  { id: "glass-cannon", face: FACES.goggles, item: "cannon", itemName: "유리 대포", accent: "#bae6fd", accent2: "#94a3b8", feel: "reach" },
  { id: "iron-potato", face: FACES.fierce, item: "potatoShield", itemName: "감자 방패", accent: "#a16207", accent2: "#94a3b8", feel: "heavy" },
  { id: "bee-queen", face: FACES.royal, item: "stinger", itemName: "여왕벌 침", accent: "#eab308", accent2: "#111827", feel: "quick" },
  { id: "bone-flute", face: FACES.ghost, item: "flute", itemName: "백골 피리", accent: "#e5e7eb", accent2: "#38bdf8", feel: "reach" },
  { id: "cactus-kick", face: FACES.fierce, item: "cactusGlove", itemName: "가시 글러브", accent: "#22c55e", accent2: "#15803d", feel: "heavy" },
  { id: "wave-surfer", face: FACES.goggles, item: "surfboard", itemName: "파도 보드", accent: "#0ea5e9", accent2: "#facc15", feel: "quick" },
  { id: "star-candy", face: FACES.cute, item: "star", itemName: "별사탕", accent: "#f9a8d4", accent2: "#facc15", feel: "quick" },
  { id: "chess-king", face: FACES.royal, item: "crown", itemName: "왕관", accent: "#f8fafc", accent2: "#facc15", feel: "heavy" },
  { id: "chess-knight", face: FACES.mask, item: "knightSword", itemName: "기사검", accent: "#334155", accent2: "#94a3b8", feel: "reach" },
  { id: "pixel-mage", face: FACES.goggles, item: "pixelWand", itemName: "픽셀 지팡이", accent: "#8b5cf6", accent2: "#facc15", feel: "reach" },
  { id: "ramen-dragon", face: FACES.fierce, item: "noodle", itemName: "용 면발", accent: "#ef4444", accent2: "#f5d0a9", feel: "reach" },
  { id: "space-cleaner", face: FACES.visor, item: "broom", itemName: "진공 빗자루", accent: "#14b8a6", accent2: "#facc15", feel: "heavy" },
  { id: "origami-crane", face: FACES.cute, item: "crane", itemName: "종이학", accent: "#f1f5f9", accent2: "#94a3b8", feel: "quick" },
  { id: "broken-robot", face: FACES.visor, item: "wrench", itemName: "수리 렌치", accent: "#94a3b8", accent2: "#f97316", feel: "heavy" },
  { id: "note-ghost", face: FACES.ghost, item: "note", itemName: "공명 음표", accent: "#c4b5fd", accent2: "#a855f7", feel: "quick" },
  { id: "rice-hammer", face: FACES.cute, item: "mallet", itemName: "떡메", accent: "#f5d0a9", accent2: "#713f12", feel: "heavy" },
  { id: "cloud-thief", face: FACES.mask, item: "cloudDagger", itemName: "구름 단검", accent: "#e2e8f0", accent2: "#38bdf8", feel: "quick" },
  { id: "volcano-mole", face: FACES.goggles, item: "magmaDrill", itemName: "용암 드릴", accent: "#dc2626", accent2: "#f97316", feel: "heavy" },
  { id: "glacier-penguin", face: FACES.beak, item: "iceFin", itemName: "빙하 지느러미", accent: "#dbeafe", accent2: "#38bdf8", feel: "quick" },
  { id: "laser-tofu", face: FACES.block, item: "tofuLaser", itemName: "두부 레이저", accent: "#fef3c7", accent2: "#ef4444", feel: "reach" },
  { id: "toxic-shroom", face: FACES.fierce, item: "poisonVial", itemName: "맹독 병", accent: "#a855f7", accent2: "#22c55e", feel: "balanced" },
  { id: "shield-turtle", face: FACES.sleepy, item: "turtleShield", itemName: "거북 방패", accent: "#16a34a", accent2: "#94a3b8", feel: "heavy" },
  { id: "balloon-boxer", face: FACES.fierce, item: "boxingGlove", itemName: "폭발 글러브", accent: "#f472b6", accent2: "#ef4444", feel: "quick" },
  { id: "camera-man", face: FACES.goggles, item: "camera", itemName: "플래시 카메라", accent: "#78716c", accent2: "#38bdf8", feel: "heavy" },
  { id: "clock-rabbit", face: FACES.cute, item: "clockKey", itemName: "시계 태엽", accent: "#f59e0b", accent2: "#facc15", feel: "quick" },
  { id: "doodle-demon", face: FACES.fierce, item: "marker", itemName: "악마 마커", accent: "#111827", accent2: "#facc15", feel: "reach" },
  { id: "alchemy-slime", face: FACES.slime, item: "slimeFlask", itemName: "연금 플라스크", accent: "#34d399", accent2: "#38bdf8", feel: "balanced" },
  { id: "bomb-chick", face: FACES.beak, item: "eggBomb", itemName: "알 폭탄", accent: "#fbbf24", accent2: "#ef4444", feel: "heavy" },
  { id: "hook-pirate", face: FACES.mask, item: "hook", itemName: "선장 갈고리", accent: "#b45309", accent2: "#94a3b8", feel: "reach" },
  { id: "gravity-apple", face: FACES.cute, item: "apple", itemName: "중력 사과", accent: "#ef4444", accent2: "#22c55e", feel: "heavy" },
  { id: "goblin-club", face: FACES.fierce, item: "goblinClub", itemName: "도깨비방망이", accent: "#6366f1", accent2: "#713f12", feel: "heavy" },
  { id: "blank-emperor", face: FACES.royal, item: "blankScroll", itemName: "백지 두루마리", accent: "#ffffff", accent2: "#111827", feel: "reach" },
];

function feelStats(feel: StyleSeed["feel"], index: number) {
  switch (feel) {
    case "quick": return { reach: 30 + index % 4, damage: 4.4 + (index % 3) * 0.35, spin: 4.15 + (index % 4) * 0.12, itemRadius: 7 };
    case "heavy": return { reach: 35 + index % 5, damage: 7.2 + (index % 4) * 0.45, spin: 2.45 + (index % 3) * 0.12, itemRadius: 9 };
    case "reach": return { reach: 43 + index % 6, damage: 5.7 + (index % 4) * 0.38, spin: 3.05 + (index % 3) * 0.14, itemRadius: 8 };
    default: return { reach: 36 + index % 5, damage: 5.8 + (index % 4) * 0.36, spin: 3.35 + (index % 3) * 0.13, itemRadius: 8 };
  }
}

export const PIXEL_STYLES = new Map<string, PixelStyle>(
  STYLE_SEEDS.map((seed, index) => [
    seed.id,
    {
      face: seed.face,
      ultimateFace: seed.ultimateFace,
      item: ITEMS[seed.item],
      itemName: seed.itemName,
      accent: seed.accent,
      accent2: seed.accent2,
      ...feelStats(seed.feel, index),
    },
  ]),
);

const FALLBACK = PIXEL_STYLES.get("blank-emperor")!;

export function getPixelStyle(fighterId: string): PixelStyle {
  return PIXEL_STYLES.get(fighterId) ?? FALLBACK;
}

export function matrixSize(matrix: PixelMatrix) {
  return {
    width: Math.max(0, ...matrix.map((row) => row.length)),
    height: matrix.length,
  };
}

export function colorForPixel(symbol: string, style: PixelStyle) {
  if (symbol === "A") return style.accent;
  if (symbol === "C") return style.accent2;
  return PIXEL_PALETTE[symbol] ?? "transparent";
}

export function pixelCss(matrix: PixelMatrix, style: PixelStyle, scale: number) {
  const points: Array<{ x: number; y: number; color: string }> = [];
  matrix.forEach((row, y) => {
    [...row].forEach((symbol, x) => {
      if (symbol !== ".") points.push({ x, y, color: colorForPixel(symbol, style) });
    });
  });
  const first = points[0] ?? { x: 0, y: 0, color: "transparent" };
  return {
    left: first.x * scale,
    top: first.y * scale,
    width: scale,
    height: scale,
    backgroundColor: first.color,
    boxShadow: points.slice(1).map((point) =>
      `${(point.x - first.x) * scale}px ${(point.y - first.y) * scale}px 0 ${point.color}`,
    ).join(","),
  };
}

export function drawPixelMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: PixelMatrix,
  style: PixelStyle,
  x: number,
  y: number,
  scale: number,
  rotation = 0,
) {
  const size = matrixSize(matrix);
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(rotation);
  ctx.imageSmoothingEnabled = false;
  matrix.forEach((row, rowIndex) => {
    [...row].forEach((symbol, columnIndex) => {
      if (symbol === ".") return;
      ctx.fillStyle = colorForPixel(symbol, style);
      ctx.fillRect(
        Math.round((columnIndex - size.width / 2) * scale),
        Math.round((rowIndex - size.height / 2) * scale),
        Math.ceil(scale),
        Math.ceil(scale),
      );
    });
  });
  ctx.restore();
}
