export type MoveKind =
  | "bolt"
  | "dash"
  | "burst"
  | "pull"
  | "push"
  | "beam"
  | "trap"
  | "orbit"
  | "split"
  | "heal";

export type SpecialKind =
  | "shield"
  | "haste"
  | "thorns"
  | "regen"
  | "blink"
  | "phase"
  | "overcharge"
  | "cleanse"
  | "gravity"
  | "counter";

export type VariantId =
  | "classic"
  | "supercharged"
  | "flame"
  | "frost"
  | "titan"
  | "swift";

export interface MoveSpec {
  name: string;
  kind: MoveKind;
  damage: number;
  cooldown: number;
  range: number;
  speed?: number;
}

export interface SpecialSpec {
  name: string;
  kind: SpecialKind;
  cooldown: number;
  power: number;
}

export interface FighterTemplate {
  id: string;
  name: string;
  mark: string;
  role: string;
  trait: string;
  color: string;
  ink: string;
  hp: number;
  speed: number;
  radius: number;
  basics: [MoveSpec, MoveSpec];
  ultimates: [MoveSpec, MoveSpec];
  special: SpecialSpec;
}

export interface VariantSpec {
  id: VariantId;
  name: string;
  short: string;
  description: string;
  color: string;
}

export interface RosterPick {
  fighterId: string;
  variant: VariantId;
}

export interface BattleEvent {
  step: number;
  text: string;
  tone: string;
  major?: boolean;
}

export interface FighterState {
  uid: number;
  templateId: string;
  variant: VariantId;
  name: string;
  mark: string;
  color: string;
  ink: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  cooldown: number;
  specialCooldown: number;
  gauge: number;
  basicIndex: 0 | 1;
  alive: boolean;
  shield: number;
  haste: number;
  slow: number;
  burn: number;
  burnTick: number;
  regen: number;
  thorns: number;
  phase: number;
  overcharge: number;
  counter: number;
  hitFlash: number;
  charging: number;
  ultimatePose: number;
  pendingMove: PendingMove | null;
  weaponAngle: number;
  weaponSpin: number;
  weaponReach: number;
  weaponDamage: number;
  weaponHits: number;
  kills: number;
  damageDone: number;
}

export interface PendingMove {
  moveIndex: number;
  ultimate: boolean;
  targetUid: number;
}

export interface ProjectileState {
  id: number;
  ownerUid: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  life: number;
  color: string;
  variant: VariantId;
  ultimate: boolean;
}

export interface HazardState {
  id: number;
  ownerUid: number;
  x: number;
  y: number;
  radius: number;
  damage: number;
  life: number;
  pulse: number;
  color: string;
  variant: VariantId;
}

export interface SlashState {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
  color: string;
  width: number;
}

export interface ParticleState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface DamagePopupState {
  id: number;
  x: number;
  y: number;
  value: number;
  life: number;
  color: string;
  critical: boolean;
}

export interface BattleBanner {
  fighterUid: number;
  fighterName: string;
  moveName: string;
  color: string;
  timer: number;
  maxTimer: number;
}

export interface BattleState {
  seed: string;
  seedHash: number;
  rngState: number;
  step: number;
  width: number;
  height: number;
  fighters: FighterState[];
  projectiles: ProjectileState[];
  hazards: HazardState[];
  slashes: SlashState[];
  events: BattleEvent[];
  activeCollisions: Set<string>;
  activeWeaponHits: Set<string>;
  particles: ParticleState[];
  damagePopups: DamagePopupState[];
  banner: BattleBanner | null;
  nextEffectId: number;
  winnerUid: number | null;
  finished: boolean;
  shake: number;
  hitStop: number;
  impactCount: number;
  ultimateCount: number;
  lastImpactPower: number;
  fingerprint: string;
}
