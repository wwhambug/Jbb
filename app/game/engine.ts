import { FIGHTER_BY_ID } from "./roster";
import { getPixelStyle } from "./pixel-art";
import type {
  BattleEvent,
  BattleState,
  FighterState,
  HazardState,
  MoveSpec,
  ProjectileState,
  RosterPick,
  VariantId,
} from "./types";

export const FIXED_DT = 1 / 60;
export const ARENA_WIDTH = 960;
export const ARENA_HEIGHT = 600;
export const SUPERCHARGE_SECONDS = 3;
export const CHAOS_SPEED_LIMIT = 620;

const COLLISION_SPEED_MULTIPLIER = 1.075;
const COLLISION_SPEED_BONUS = 8;
const SUPERCHARGE_KNOCKBACK_MULTIPLIER = 4.8;

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash += hash << 13;
  hash ^= hash >>> 7;
  hash += hash << 3;
  hash ^= hash >>> 17;
  hash += hash << 5;
  return hash >>> 0 || 0x6d2b79f5;
}

function random(state: BattleState): number {
  let value = state.rngState >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  state.rngState = value >>> 0;
  return state.rngState / 4294967296;
}

function variantStats(variant: VariantId) {
  switch (variant) {
    case "titan":
      return { hp: 1.28, speed: 0.84, radius: 1.2, cooldown: 1 };
    case "swift":
      return { hp: 0.94, speed: 1.2, radius: 0.94, cooldown: 0.86 };
    default:
      return { hp: 1, speed: 1, radius: 1, cooldown: 1 };
  }
}

export function createBattle(seed: string, picks: RosterPick[]): BattleState {
  const safeSeed = seed.trim() || "JBB-2026";
  const seedHash = hashString(
    `${safeSeed}|${picks.map((pick) => `${pick.fighterId}:${pick.variant}`).join("|")}`,
  );
  const state: BattleState = {
    seed: safeSeed,
    seedHash,
    rngState: seedHash,
    step: 0,
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
    fighters: [],
    projectiles: [],
    hazards: [],
    slashes: [],
    events: [],
    activeCollisions: new Set<string>(),
    activeWeaponHits: new Set<string>(),
    particles: [],
    damagePopups: [],
    banner: null,
    nextEffectId: 1,
    winnerUid: null,
    finished: false,
    shake: 0,
    hitStop: 0,
    impactCount: 0,
    ultimateCount: 0,
    lastImpactPower: 0,
    fingerprint: "00000000",
  };

  picks.slice(0, 12).forEach((pick, index) => {
    const template = FIGHTER_BY_ID.get(pick.fighterId);
    if (!template) return;
    const stats = variantStats(pick.variant);
    const pixelStyle = getPixelStyle(template.id);
    const angle = (Math.PI * 2 * index) / Math.max(2, picks.length) - Math.PI / 2;
    const wobble = (random(state) - 0.5) * 28;
    const maxHp = Math.round(template.hp * stats.hp);
    const movementSpeed = template.speed * stats.speed;
    // 이동 방향은 상대 위치와 무관한 시드 기반 2축 관성이다.
    const launchAngle = random(state) * Math.PI * 2 + index * 2.399963229728653;
    const launchSpeed = movementSpeed * (1.5 + random(state) * 0.35);
    state.fighters.push({
      uid: index + 1,
      templateId: template.id,
      variant: pick.variant,
      name: template.name,
      mark: template.mark,
      color: template.color,
      ink: template.ink,
      x: state.width / 2 + Math.cos(angle) * (285 + wobble),
      y: state.height / 2 + Math.sin(angle) * (190 + wobble * 0.45),
      vx: Math.cos(launchAngle) * launchSpeed,
      vy: Math.sin(launchAngle) * launchSpeed,
      radius: template.radius * stats.radius,
      hp: maxHp,
      maxHp,
      speed: movementSpeed,
      motionScale: 1,
      cooldown: 0.35 + random(state) * 0.7,
      specialCooldown: 2.5 + random(state) * 2,
      gauge: random(state) * 16,
      basicIndex: 0,
      alive: true,
      shield: 0,
      haste: 0,
      slow: 0,
      burn: 0,
      burnTick: 0.5,
      regen: 0,
      thorns: 0,
      phase: 0,
      overcharge: 0,
      counter: 0,
      hitFlash: 0,
      charging: 0,
      ultimatePose: 0,
      pendingMove: null,
      weaponAngle: random(state) * Math.PI * 2,
      weaponSpin: pixelStyle.spin * (index % 2 === 0 ? 1 : -1),
      weaponReach: pixelStyle.reach,
      weaponDamage: pixelStyle.damage,
      weaponHits: 0,
      kills: 0,
      damageDone: 0,
    });
  });

  addEvent(state, `시드 ${safeSeed} · ${state.fighters.length}구 전투 시작`, "#111827", true);
  state.fingerprint = fingerprint(state);
  return state;
}

function addEvent(state: BattleState, text: string, tone: string, major = false) {
  const event: BattleEvent = { step: state.step, text, tone, major };
  state.events.unshift(event);
  if (state.events.length > 16) state.events.length = 16;
}

function aliveFighters(state: BattleState) {
  return state.fighters.filter((fighter) => fighter.alive);
}

function nearestEnemy(state: BattleState, fighter: FighterState) {
  let target: FighterState | null = null;
  let best = Number.POSITIVE_INFINITY;
  for (const candidate of state.fighters) {
    if (!candidate.alive || candidate.uid === fighter.uid) continue;
    const dx = candidate.x - fighter.x;
    const dy = candidate.y - fighter.y;
    const distance = dx * dx + dy * dy;
    if (distance < best || (distance === best && candidate.uid < (target?.uid ?? 999))) {
      best = distance;
      target = candidate;
    }
  }
  return target;
}

function normalize(dx: number, dy: number) {
  const distance = Math.hypot(dx, dy) || 1;
  return { x: dx / distance, y: dy / distance, distance };
}

function addImpact(
  state: BattleState,
  x: number,
  y: number,
  color: string,
  power: number,
  critical = false,
) {
  state.impactCount += 1;
  state.lastImpactPower = power;
  const count = Math.min(12, 4 + Math.floor(power / 4) + (critical ? 3 : 0));
  for (let index = 0; index < count; index += 1) {
    const angle = random(state) * Math.PI * 2;
    const speed = 28 + random(state) * (44 + power * 2.4);
    state.particles.push({
      id: state.nextEffectId++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.18 + random(state) * 0.16,
      maxLife: 0.34,
      color: index % 3 === 0 ? "#ffffff" : color,
      size: critical ? 4 : 2 + (index % 2),
    });
  }
}

function applyVariantStatus(target: FighterState, variant: VariantId) {
  if (variant === "flame") {
    target.burn = Math.max(target.burn, 3);
    target.burnTick = Math.min(target.burnTick, 0.35);
  }
  if (variant === "frost") target.slow = Math.max(target.slow, 2.4);
}

function capVelocity(fighter: FighterState, limit = CHAOS_SPEED_LIMIT) {
  const speed = Math.hypot(fighter.vx, fighter.vy);
  if (speed <= limit || speed <= 0.0001) return;
  fighter.vx = (fighter.vx / speed) * limit;
  fighter.vy = (fighter.vy / speed) * limit;
}

function boostCollisionSpeed(fighter: FighterState, fallbackX: number, fallbackY: number) {
  const speed = Math.hypot(fighter.vx, fighter.vy);
  if (speed <= 0.0001) {
    fighter.vx = fallbackX * 34;
    fighter.vy = fallbackY * 34;
    return;
  }
  const nextSpeed = Math.min(
    CHAOS_SPEED_LIMIT,
    Math.max(speed * COLLISION_SPEED_MULTIPLIER, speed + COLLISION_SPEED_BONUS),
  );
  fighter.vx = (fighter.vx / speed) * nextSpeed;
  fighter.vy = (fighter.vy / speed) * nextSpeed;
}

function damageFighter(
  state: BattleState,
  target: FighterState,
  amount: number,
  attacker: FighterState | null,
  variant: VariantId,
  sourceName: string,
  reflectable = true,
) {
  if (!target.alive || amount <= 0) return 0;
  let remaining = amount * (target.phase > 0 ? 0.32 : 1);
  if (target.shield > 0) {
    const blocked = Math.min(target.shield, remaining);
    target.shield -= blocked;
    remaining -= blocked;
  }
  if (remaining <= 0.01) return 0;
  target.hp -= remaining;
  target.hitFlash = 0.15;
  target.gauge = Math.min(100, target.gauge + remaining * 0.35);
  applyVariantStatus(target, variant);
  if (attacker || remaining >= 4) {
    state.damagePopups.push({
      id: state.nextEffectId++,
      x: target.x + (random(state) - 0.5) * target.radius,
      y: target.y - target.radius,
      value: remaining,
      life: 0.58,
      color: remaining >= 20 ? "#fef08a" : "#ffffff",
      critical: remaining >= 20,
    });
    addImpact(state, target.x, target.y, attacker?.color ?? "#ffffff", remaining, remaining >= 20);
  }
  if (attacker && attacker.alive) {
    attacker.gauge = Math.min(100, attacker.gauge + remaining * 0.85);
    attacker.damageDone += remaining;
    if (reflectable && target.thorns > 0) {
      damageFighter(state, attacker, remaining * 0.18, null, "classic", "가시 반사", false);
    }
    if (reflectable && target.counter > 0 && remaining >= 8) {
      target.counter = 0;
      damageFighter(state, attacker, remaining * 0.42, null, "classic", "반격", false);
      state.slashes.push({
        id: state.nextEffectId++,
        x1: target.x,
        y1: target.y,
        x2: attacker.x,
        y2: attacker.y,
        life: 0.22,
        maxLife: 0.22,
        color: target.color,
        width: 5,
      });
    }
  }
  if (target.hp <= 0 && target.alive) {
    target.hp = 0;
    target.alive = false;
    target.vx = 0;
    target.vy = 0;
    if (attacker) attacker.kills += 1;
    addEvent(
      state,
      `${target.name} 탈락 · ${sourceName}`,
      attacker?.color ?? "#475569",
      true,
    );
    state.shake = Math.max(state.shake, 0.25);
  }
  return remaining;
}

function createProjectile(
  state: BattleState,
  fighter: FighterState,
  target: FighterState,
  move: MoveSpec,
  damage: number,
  angleOffset = 0,
  ultimate = false,
) {
  const direction = normalize(target.x - fighter.x, target.y - fighter.y);
  const baseAngle = Math.atan2(direction.y, direction.x) + angleOffset;
  const speed = (move.speed ?? 280) * (ultimate ? 1.08 : 1);
  const knockbackMultiplier = fighter.variant === "supercharged"
    ? SUPERCHARGE_KNOCKBACK_MULTIPLIER
    : 1;
  const projectile: ProjectileState = {
    id: state.nextEffectId++,
    ownerUid: fighter.uid,
    x: fighter.x + Math.cos(baseAngle) * (fighter.radius + 7),
    y: fighter.y + Math.sin(baseAngle) * (fighter.radius + 7),
    vx: Math.cos(baseAngle) * speed,
    vy: Math.sin(baseAngle) * speed,
    radius: ultimate ? 8 : 5.5,
    damage,
    knockback: (ultimate ? 82 : 38) * knockbackMultiplier,
    life: Math.max(0.75, move.range / speed + 0.3),
    color: fighter.color,
    variant: fighter.variant,
    ultimate,
  };
  state.projectiles.push(projectile);
}

function executeMove(
  state: BattleState,
  fighter: FighterState,
  target: FighterState,
  move: MoveSpec,
  ultimate: boolean,
) {
  if (!fighter.alive || !target.alive) return;
  const charged = fighter.variant === "supercharged" ? 1.45 : 1;
  const boosted = fighter.overcharge > 0 ? 1.24 : 1;
  const flame = fighter.variant === "flame" ? 1.08 : 1;
  const damage = move.damage * charged * boosted * flame;
  const direction = normalize(target.x - fighter.x, target.y - fighter.y);
  const knockbackMultiplier = fighter.variant === "supercharged"
    ? SUPERCHARGE_KNOCKBACK_MULTIPLIER
    : 1;

  if (ultimate) {
    addEvent(state, `${fighter.name} 궁극기 · ${move.name}`, fighter.color, true);
    state.shake = Math.max(state.shake, 0.34);
  }

  switch (move.kind) {
    case "bolt":
      createProjectile(state, fighter, target, move, damage, 0, ultimate);
      break;
    case "split":
      [-0.18, 0, 0.18].forEach((offset) =>
        createProjectile(state, fighter, target, move, damage * 0.58, offset, ultimate),
      );
      break;
    case "orbit": {
      const count = ultimate ? 8 : 5;
      for (let index = 0; index < count; index += 1) {
        const offset = (Math.PI * 2 * index) / count;
        createProjectile(state, fighter, target, move, damage * 0.52, offset, ultimate);
      }
      break;
    }
    case "dash":
      fighter.vx += direction.x * (ultimate ? 250 : 175) * (fighter.variant === "supercharged" ? 1.65 : 1);
      fighter.vy += direction.y * (ultimate ? 250 : 175) * (fighter.variant === "supercharged" ? 1.65 : 1);
      if (direction.distance < move.range * 0.72) {
        damageFighter(state, target, damage, fighter, fighter.variant, move.name);
        target.vx += direction.x * 62 * knockbackMultiplier;
        target.vy += direction.y * 62 * knockbackMultiplier;
      }
      break;
    case "burst": {
      const radius = ultimate ? 190 : 112;
      for (const enemy of state.fighters) {
        if (!enemy.alive || enemy.uid === fighter.uid) continue;
        const dist = Math.hypot(enemy.x - fighter.x, enemy.y - fighter.y);
        if (dist <= radius + enemy.radius) {
          damageFighter(state, enemy, damage * (1 - dist / (radius * 2.4)), fighter, fighter.variant, move.name);
          const away = normalize(enemy.x - fighter.x, enemy.y - fighter.y);
          enemy.vx += away.x * (ultimate ? 110 : 65) * knockbackMultiplier;
          enemy.vy += away.y * (ultimate ? 110 : 65) * knockbackMultiplier;
        }
      }
      state.hazards.push({
        id: state.nextEffectId++,
        ownerUid: fighter.uid,
        x: fighter.x,
        y: fighter.y,
        radius,
        damage: 0,
        life: 0.38,
        pulse: 10,
        color: fighter.color,
        variant: fighter.variant,
        knockback: 0,
      });
      break;
    }
    case "pull":
    case "push": {
      damageFighter(state, target, damage * 0.78, fighter, fighter.variant, move.name);
      const sign = move.kind === "pull" ? -1 : 1;
      target.vx += direction.x * sign * (ultimate ? 220 : 125) * knockbackMultiplier;
      target.vy += direction.y * sign * (ultimate ? 220 : 125) * knockbackMultiplier;
      state.slashes.push({
        id: state.nextEffectId++,
        x1: fighter.x,
        y1: fighter.y,
        x2: target.x,
        y2: target.y,
        life: 0.24,
        maxLife: 0.24,
        color: fighter.color,
        width: ultimate ? 10 : 5,
      });
      break;
    }
    case "beam":
      damageFighter(state, target, damage, fighter, fighter.variant, move.name);
      target.vx += direction.x * (ultimate ? 82 : 44) * knockbackMultiplier;
      target.vy += direction.y * (ultimate ? 82 : 44) * knockbackMultiplier;
      state.slashes.push({
        id: state.nextEffectId++,
        x1: fighter.x,
        y1: fighter.y,
        x2: target.x,
        y2: target.y,
        life: ultimate ? 0.42 : 0.24,
        maxLife: ultimate ? 0.42 : 0.24,
        color: fighter.color,
        width: ultimate ? 14 : 6,
      });
      break;
    case "trap": {
      const hazard: HazardState = {
        id: state.nextEffectId++,
        ownerUid: fighter.uid,
        x: target.x + target.vx * 0.35,
        y: target.y + target.vy * 0.35,
        radius: ultimate ? 84 : 52,
        damage: damage * (ultimate ? 0.28 : 0.22),
        life: ultimate ? 5.5 : 3.4,
        pulse: 0.25,
        color: fighter.color,
        variant: fighter.variant,
        knockback: (ultimate ? 74 : 46) * knockbackMultiplier,
      };
      state.hazards.push(hazard);
      break;
    }
    case "heal":
      fighter.hp = Math.min(fighter.maxHp, fighter.hp + damage * 0.62);
      damageFighter(state, target, damage * 0.55, fighter, fighter.variant, move.name);
      target.vx += direction.x * 36 * knockbackMultiplier;
      target.vy += direction.y * 36 * knockbackMultiplier;
      state.slashes.push({
        id: state.nextEffectId++,
        x1: fighter.x,
        y1: fighter.y,
        x2: target.x,
        y2: target.y,
        life: 0.2,
        maxLife: 0.2,
        color: "#22c55e",
        width: 4,
      });
      break;
  }
}

function queueMove(
  state: BattleState,
  fighter: FighterState,
  target: FighterState,
  moveIndex: number,
  ultimate: boolean,
) {
  const template = FIGHTER_BY_ID.get(fighter.templateId);
  if (!template) return;
  const move = ultimate ? template.ultimates[moveIndex] : template.basics[moveIndex];
  const chargeTime = fighter.variant === "supercharged"
    ? SUPERCHARGE_SECONDS
    : ultimate
      ? 0.68
      : 0;
  if (ultimate) {
    fighter.ultimatePose = fighter.variant === "supercharged"
      ? SUPERCHARGE_SECONDS + 0.35
      : 0.92;
    state.banner = {
      fighterUid: fighter.uid,
      fighterName: fighter.name,
      moveName: move.name,
      color: fighter.color,
      timer: 0.92,
      maxTimer: 0.92,
    };
    state.ultimateCount += 1;
    state.hitStop = Math.max(state.hitStop, 3);
  }
  if (chargeTime > 0) {
    fighter.charging = chargeTime;
    fighter.pendingMove = { moveIndex, ultimate, targetUid: target.uid };
    if (fighter.variant === "supercharged") {
      addEvent(state, `${fighter.name} 슈퍼차지 · 3초`, "#7c3aed");
    }
  } else {
    executeMove(state, fighter, target, move, ultimate);
  }
  if (!ultimate) {
    const cooldownModifier = variantStats(fighter.variant).cooldown;
    fighter.cooldown = move.cooldown * cooldownModifier;
    fighter.basicIndex = fighter.basicIndex === 0 ? 1 : 0;
  }
}

function executeSpecial(state: BattleState, fighter: FighterState) {
  const template = FIGHTER_BY_ID.get(fighter.templateId);
  if (!template || !fighter.alive) return;
  const special = template.special;
  const target = nearestEnemy(state, fighter);
  fighter.specialCooldown = special.cooldown * variantStats(fighter.variant).cooldown;
  addEvent(state, `${fighter.name} 특별기 · ${special.name}`, fighter.color);
  switch (special.kind) {
    case "shield":
      fighter.shield = Math.min(fighter.maxHp * 0.5, fighter.shield + special.power * 1.5);
      break;
    case "haste":
      fighter.haste = 4.5;
      break;
    case "thorns":
      fighter.thorns = 5;
      fighter.shield += special.power * 0.45;
      break;
    case "regen":
      fighter.regen = 5.5;
      break;
    case "blink":
      if (target) {
        const angle = random(state) * Math.PI * 2;
        fighter.x = Math.max(40, Math.min(state.width - 40, target.x + Math.cos(angle) * 84));
        fighter.y = Math.max(40, Math.min(state.height - 40, target.y + Math.sin(angle) * 84));
      }
      break;
    case "phase":
      fighter.phase = 3.5;
      break;
    case "overcharge":
      fighter.overcharge = 4.2;
      fighter.gauge = Math.min(100, fighter.gauge + special.power * 0.75);
      break;
    case "cleanse":
      fighter.slow = 0;
      fighter.burn = 0;
      fighter.hp = Math.min(fighter.maxHp, fighter.hp + special.power);
      break;
    case "gravity":
      for (const enemy of state.fighters) {
        if (!enemy.alive || enemy.uid === fighter.uid) continue;
        const pull = normalize(fighter.x - enemy.x, fighter.y - enemy.y);
        enemy.vx += pull.x * special.power * 3.4;
        enemy.vy += pull.y * special.power * 3.4;
        if (pull.distance < 180) {
          damageFighter(state, enemy, special.power * 0.3, fighter, fighter.variant, special.name);
        }
      }
      break;
    case "counter":
      fighter.counter = 4.5;
      break;
  }
}

function updateFighter(state: BattleState, fighter: FighterState) {
  if (!fighter.alive) return;
  const dt = FIXED_DT;
  const target = nearestEnemy(state, fighter);
  if (!target) return;

  fighter.cooldown -= dt;
  fighter.specialCooldown -= dt;
  fighter.hitFlash = Math.max(0, fighter.hitFlash - dt);
  fighter.haste = Math.max(0, fighter.haste - dt);
  fighter.slow = Math.max(0, fighter.slow - dt);
  fighter.thorns = Math.max(0, fighter.thorns - dt);
  fighter.phase = Math.max(0, fighter.phase - dt);
  fighter.overcharge = Math.max(0, fighter.overcharge - dt);
  fighter.counter = Math.max(0, fighter.counter - dt);
  fighter.ultimatePose = Math.max(0, fighter.ultimatePose - dt);
  const nextMotionScale = (fighter.slow > 0 ? 0.7 : 1) * (fighter.haste > 0 ? 1.28 : 1);
  if (Math.abs(nextMotionScale - fighter.motionScale) > 0.0001) {
    const ratio = nextMotionScale / fighter.motionScale;
    fighter.vx *= ratio;
    fighter.vy *= ratio;
    fighter.motionScale = nextMotionScale;
  }
  if (fighter.regen > 0) {
    fighter.regen = Math.max(0, fighter.regen - dt);
    fighter.hp = Math.min(fighter.maxHp, fighter.hp + fighter.maxHp * 0.012 * dt);
  }
  if (fighter.burn > 0) {
    fighter.burn = Math.max(0, fighter.burn - dt);
    fighter.burnTick -= dt;
    if (fighter.burnTick <= 0) {
      fighter.burnTick += 0.5;
      damageFighter(state, fighter, 1.25, null, "classic", "화상", false);
    }
  }

  if (fighter.charging > 0 && fighter.pendingMove) {
    fighter.charging -= dt;
    if (fighter.charging <= 0) {
      const pending = fighter.pendingMove;
      fighter.pendingMove = null;
      const pendingTarget = state.fighters.find((entry) => entry.uid === pending.targetUid && entry.alive) ?? nearestEnemy(state, fighter);
      const template = FIGHTER_BY_ID.get(fighter.templateId);
      if (pendingTarget && template) {
        const move = pending.ultimate
          ? template.ultimates[pending.moveIndex]
          : template.basics[pending.moveIndex];
        executeMove(state, fighter, pendingTarget, move, pending.ultimate);
      }
    }
  } else {
    const template = FIGHTER_BY_ID.get(fighter.templateId);
    if (template) {
      const distance = Math.hypot(target.x - fighter.x, target.y - fighter.y);
      if (fighter.gauge >= 100) {
        const ultimateIndex = random(state) < 0.5 ? 0 : 1;
        fighter.gauge = 0;
        queueMove(state, fighter, target, ultimateIndex, true);
      } else if (fighter.cooldown <= 0 && distance <= template.basics[fighter.basicIndex].range) {
        queueMove(state, fighter, target, fighter.basicIndex, false);
      }
      if (fighter.specialCooldown <= 0) executeSpecial(state, fighter);
    }
  }

  // 공은 표적을 추적하지 않는다. 현재 속도를 그대로 유지하는 2축 관성 이동만 한다.
  capVelocity(fighter);
  fighter.x += fighter.vx * dt;
  fighter.y += fighter.vy * dt;

  const wall = 18;
  if (fighter.x - fighter.radius < wall) {
    fighter.x = wall + fighter.radius;
    fighter.vx = Math.abs(fighter.vx);
  } else if (fighter.x + fighter.radius > state.width - wall) {
    fighter.x = state.width - wall - fighter.radius;
    fighter.vx = -Math.abs(fighter.vx);
  }
  if (fighter.y - fighter.radius < wall) {
    fighter.y = wall + fighter.radius;
    fighter.vy = Math.abs(fighter.vy);
  } else if (fighter.y + fighter.radius > state.height - wall) {
    fighter.y = state.height - wall - fighter.radius;
    fighter.vy = -Math.abs(fighter.vy);
  }
}

function updateWeapons(state: BattleState) {
  const next = new Set<string>();
  for (const attacker of state.fighters) {
    if (!attacker.alive) continue;
    const style = getPixelStyle(attacker.templateId);
    const statusSpin = attacker.slow > 0 ? 0.72 : 1;
    const hasteSpin = attacker.haste > 0 ? 1.28 : 1;
    const variantSpin = attacker.variant === "swift" ? 1.24 : attacker.variant === "supercharged" ? 0.74 : 1;
    attacker.weaponAngle += attacker.weaponSpin * statusSpin * hasteSpin * variantSpin * FIXED_DT;
    const orbit = attacker.radius + attacker.weaponReach;
    const weaponX = attacker.x + Math.cos(attacker.weaponAngle) * orbit;
    const weaponY = attacker.y + Math.sin(attacker.weaponAngle) * orbit;

    for (const target of state.fighters) {
      if (!target.alive || target.uid === attacker.uid) continue;
      const distance = Math.hypot(target.x - weaponX, target.y - weaponY);
      if (distance > target.radius + style.itemRadius) continue;
      const key = `${attacker.uid}:${target.uid}`;
      next.add(key);
      if (state.activeWeaponHits.has(key)) continue;

      const variantDamage = attacker.variant === "supercharged" ? 1.45 : attacker.variant === "flame" ? 1.08 : 1;
      const dealt = damageFighter(
        state,
        target,
        attacker.weaponDamage * variantDamage,
        attacker,
        attacker.variant,
        style.itemName,
      );
      if (dealt <= 0) continue;

      const push = normalize(target.x - attacker.x, target.y - attacker.y);
      const weaponKnockback = attacker.variant === "supercharged" ? 3.4 : 1;
      target.vx += push.x * (42 + dealt * 2.2) * weaponKnockback;
      target.vy += push.y * (42 + dealt * 2.2) * weaponKnockback;
      attacker.vx -= push.x * 9;
      attacker.vy -= push.y * 9;
      capVelocity(target);
      attacker.weaponHits += 1;
      const spinSign = Math.sign(attacker.weaponSpin) || 1;
      attacker.weaponSpin = spinSign * Math.min(7.2, Math.abs(attacker.weaponSpin) + 0.055);
      attacker.weaponDamage = Math.min(style.damage + 18, attacker.weaponDamage + 0.36);
      attacker.weaponReach = Math.min(style.reach + 17, attacker.weaponReach + 0.15);
      state.hitStop = Math.max(state.hitStop, dealt >= 18 ? 5 : 2);
      state.shake = Math.max(state.shake, Math.min(0.22, 0.045 + dealt * 0.006));
    }
  }
  state.activeWeaponHits = next;
}

function updateProjectiles(state: BattleState) {
  const survivors: ProjectileState[] = [];
  for (const projectile of state.projectiles) {
    projectile.life -= FIXED_DT;
    projectile.x += projectile.vx * FIXED_DT;
    projectile.y += projectile.vy * FIXED_DT;
    if (
      projectile.life <= 0 ||
      projectile.x < 12 ||
      projectile.x > state.width - 12 ||
      projectile.y < 12 ||
      projectile.y > state.height - 12
    ) {
      continue;
    }
    let hit = false;
    const owner = state.fighters.find((fighter) => fighter.uid === projectile.ownerUid) ?? null;
    for (const target of state.fighters) {
      if (!target.alive || target.uid === projectile.ownerUid) continue;
      if (Math.hypot(target.x - projectile.x, target.y - projectile.y) <= target.radius + projectile.radius) {
        damageFighter(state, target, projectile.damage, owner, projectile.variant, "투사체");
        const push = normalize(projectile.vx, projectile.vy);
        target.vx += push.x * projectile.knockback;
        target.vy += push.y * projectile.knockback;
        capVelocity(target);
        hit = true;
        break;
      }
    }
    if (!hit) survivors.push(projectile);
  }
  state.projectiles = survivors;
}

function updateHazards(state: BattleState) {
  const survivors: HazardState[] = [];
  for (const hazard of state.hazards) {
    hazard.life -= FIXED_DT;
    hazard.pulse -= FIXED_DT;
    if (hazard.damage > 0 && hazard.pulse <= 0) {
      hazard.pulse += 0.6;
      const owner = state.fighters.find((fighter) => fighter.uid === hazard.ownerUid) ?? null;
      for (const target of state.fighters) {
        if (!target.alive || target.uid === hazard.ownerUid) continue;
        if (Math.hypot(target.x - hazard.x, target.y - hazard.y) <= hazard.radius + target.radius) {
          damageFighter(state, target, hazard.damage, owner, hazard.variant, "위험 지대");
          if (hazard.knockback > 0) {
            const away = normalize(target.x - hazard.x, target.y - hazard.y);
            target.vx += away.x * hazard.knockback;
            target.vy += away.y * hazard.knockback;
            capVelocity(target);
          }
        }
      }
    }
    if (hazard.life > 0) survivors.push(hazard);
  }
  state.hazards = survivors;
}

function updateCollisions(state: BattleState) {
  const next = new Set<string>();
  const fighters = aliveFighters(state);
  for (let leftIndex = 0; leftIndex < fighters.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < fighters.length; rightIndex += 1) {
      const left = fighters[leftIndex];
      const right = fighters[rightIndex];
      const dx = right.x - left.x;
      const dy = right.y - left.y;
      const rawDistance = Math.hypot(dx, dy);
      const fallbackAngle = ((left.uid * 97 + right.uid * 53) % 360) * (Math.PI / 180);
      const normal = rawDistance > 0.0001
        ? { x: dx / rawDistance, y: dy / rawDistance, distance: rawDistance }
        : { x: Math.cos(fallbackAngle), y: Math.sin(fallbackAngle), distance: 0 };
      const minimum = left.radius + right.radius;
      if (normal.distance >= minimum) continue;
      const key = `${Math.min(left.uid, right.uid)}:${Math.max(left.uid, right.uid)}`;
      next.add(key);
      const overlap = minimum - normal.distance;
      left.x -= normal.x * overlap * 0.5;
      left.y -= normal.y * overlap * 0.5;
      right.x += normal.x * overlap * 0.5;
      right.y += normal.y * overlap * 0.5;
      const relative = (right.vx - left.vx) * normal.x + (right.vy - left.vy) * normal.y;
      const freshCollision = !state.activeCollisions.has(key);
      if (relative < 0) {
        // 동일 질량 탄성 충돌: 법선 속도를 서로 교환하고 방향을 실제로 반전한다.
        const impulse = -relative;
        left.vx -= normal.x * impulse;
        left.vy -= normal.y * impulse;
        right.vx += normal.x * impulse;
        right.vy += normal.y * impulse;
      } else if (freshCollision) {
        // 정지 상태에서 겹친 경우에도 서로 붙어 있지 않도록 최소 반동을 준다.
        left.vx -= normal.x * 18;
        left.vy -= normal.y * 18;
        right.vx += normal.x * 18;
        right.vy += normal.y * 18;
      }
      if (freshCollision) {
        boostCollisionSpeed(left, -normal.x, -normal.y);
        boostCollisionSpeed(right, normal.x, normal.y);
        // JBB의 기본 규칙: 서로 부딪힐 때 양쪽 모두 정확히 1 피해.
        damageFighter(state, left, 1, right, "classic", "자연 충돌", false);
        damageFighter(state, right, 1, left, "classic", "자연 충돌", false);
        state.hitStop = Math.max(state.hitStop, 2);
        state.shake = Math.max(state.shake, 0.06);
      }
    }
  }
  state.activeCollisions = next;
}

function updateEffects(state: BattleState) {
  state.slashes = state.slashes
    .map((slash) => ({ ...slash, life: slash.life - FIXED_DT }))
    .filter((slash) => slash.life > 0);
  state.particles = state.particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * FIXED_DT,
      y: particle.y + particle.vy * FIXED_DT,
      vx: particle.vx * 0.92,
      vy: particle.vy * 0.92 + 18 * FIXED_DT,
      life: particle.life - FIXED_DT,
    }))
    .filter((particle) => particle.life > 0);
  state.damagePopups = state.damagePopups
    .map((popup) => ({ ...popup, y: popup.y - 24 * FIXED_DT, life: popup.life - FIXED_DT }))
    .filter((popup) => popup.life > 0);
  if (state.banner) {
    state.banner = { ...state.banner, timer: state.banner.timer - FIXED_DT };
    if (state.banner.timer <= 0) state.banner = null;
  }
  state.shake = Math.max(0, state.shake - FIXED_DT);
}

export function stepBattle(state: BattleState) {
  if (state.finished) return;
  state.step += 1;
  if (state.hitStop > 0) {
    state.hitStop -= 1;
    if (state.step % 30 === 0) state.fingerprint = fingerprint(state);
    return;
  }
  for (const fighter of state.fighters) updateFighter(state, fighter);
  updateWeapons(state);
  updateProjectiles(state);
  updateHazards(state);
  updateCollisions(state);
  updateEffects(state);

  const alive = aliveFighters(state);
  if (alive.length <= 1 && state.fighters.length >= 2) {
    state.finished = true;
    state.winnerUid = alive[0]?.uid ?? null;
    addEvent(
      state,
      alive[0] ? `${alive[0].name} 우승` : "무승부",
      alive[0]?.color ?? "#475569",
      true,
    );
  }
  if (state.step >= 60 * 180 && !state.finished) {
    const ranked = [...alive].sort((a, b) => b.hp - a.hp || b.damageDone - a.damageDone || a.uid - b.uid);
    state.finished = true;
    state.winnerUid = ranked[0]?.uid ?? null;
    addEvent(state, `${ranked[0]?.name ?? "무승부"} 판정승`, ranked[0]?.color ?? "#475569", true);
  }
  if (state.step % 30 === 0 || state.finished) state.fingerprint = fingerprint(state);
}

export function fingerprint(state: BattleState): string {
  const compact = [
    state.seedHash,
    state.rngState,
    state.step,
    ...state.fighters.flatMap((fighter) => [
      fighter.uid,
      Math.round(fighter.x * 100),
      Math.round(fighter.y * 100),
      Math.round(fighter.vx * 100),
      Math.round(fighter.vy * 100),
      Math.round(fighter.hp * 100),
      Math.round(fighter.gauge * 100),
      Math.round(fighter.weaponAngle * 1000),
      Math.round(fighter.weaponDamage * 100),
      Math.round(fighter.weaponReach * 100),
      fighter.weaponHits,
      Math.round(fighter.charging * 100),
      fighter.alive ? 1 : 0,
    ]),
    state.projectiles.length,
    state.hazards.length,
  ].join("|");
  return hashString(compact).toString(16).padStart(8, "0").toUpperCase();
}

export function simulateFingerprint(seed: string, picks: RosterPick[], steps = 900) {
  const state = createBattle(seed, picks);
  for (let index = 0; index < steps && !state.finished; index += 1) stepBattle(state);
  state.fingerprint = fingerprint(state);
  return state.fingerprint;
}

export function seededRoster(seed: string, count: number, fighterIds: string[]): RosterPick[] {
  const state = createBattle(`${seed}:roster`, [
    { fighterId: fighterIds[0], variant: "classic" },
    { fighterId: fighterIds[1] ?? fighterIds[0], variant: "classic" },
  ]);
  const pool = [...fighterIds];
  const picks: RosterPick[] = [];
  while (pool.length > 0 && picks.length < count) {
    const index = Math.floor(random(state) * pool.length);
    const fighterId = pool.splice(index, 1)[0];
    const variants: VariantId[] = ["classic", "supercharged", "flame", "frost", "titan", "swift"];
    picks.push({ fighterId, variant: variants[Math.floor(random(state) * variants.length)] });
  }
  return picks;
}
