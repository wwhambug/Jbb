import assert from "node:assert/strict";
import {
  createBattle,
  simulateFingerprint,
  stepBattle,
} from "../app/game/engine";
import { FIGHTERS } from "../app/game/roster";
import { getPixelStyle, PIXEL_STYLES } from "../app/game/pixel-art";
import type { RosterPick } from "../app/game/types";

assert.equal(FIGHTERS.length, 50, "JBB must ship with exactly 50 fighters");
assert.equal(PIXEL_STYLES.size, 50, "every fighter gets authored pixel art");
for (const fighter of FIGHTERS) {
  assert.equal(fighter.basics.length, 2, `${fighter.name}: two basic moves`);
  assert.equal(fighter.ultimates.length, 2, `${fighter.name}: two ultimates`);
  assert.ok(fighter.special.name, `${fighter.name}: one named special`);
  assert.ok(getPixelStyle(fighter.id).item.length >= 7, `${fighter.name}: pixel item exists`);
}

const picks: RosterPick[] = [
  { fighterId: "gojo", variant: "supercharged" },
  { fighterId: "skuna", variant: "flame" },
  { fighterId: "block-pick", variant: "classic" },
  { fighterId: "gravity-apple", variant: "frost" },
];
const first = simulateFingerprint("JBB-TEST-77", picks, 2400);
const second = simulateFingerprint("JBB-TEST-77", picks, 2400);
const differentSeed = simulateFingerprint("JBB-TEST-78", picks, 2400);
assert.equal(first, second, "same seed and roster must produce the same fingerprint");
assert.notEqual(first, differentSeed, "different seeds should branch the fight");

const activeBattle = createBattle("WEAPON-ACTIVITY", picks);
for (let index = 0; index < 900 && !activeBattle.finished; index += 1) stepBattle(activeBattle);
assert.ok(
  activeBattle.fighters.reduce((sum, fighter) => sum + fighter.weaponHits, 0) >= 4,
  "orbiting pixel items must produce visible combat activity",
);

const collision = createBattle("COLLISION-ONE", picks.slice(0, 2).map((pick) => ({ ...pick, variant: "classic" })));
const [left, right] = collision.fighters;
left.x = 400;
left.y = 300;
right.x = 400 + left.radius + right.radius - 1;
right.y = 300;
left.vx = left.vy = right.vx = right.vy = 0;
left.weaponAngle = Math.PI;
right.weaponAngle = 0;
left.cooldown = right.cooldown = 999;
left.specialCooldown = right.specialCooldown = 999;
left.gauge = right.gauge = 0;
const leftHp = left.hp;
const rightHp = right.hp;
stepBattle(collision);
assert.equal(leftHp - left.hp, 1, "a fresh collision deals exactly one damage to the left fighter");
assert.equal(rightHp - right.hp, 1, "a fresh collision deals exactly one damage to the right fighter");

const weaponBattle = createBattle("WEAPON-GROWTH", picks.slice(0, 2).map((pick) => ({ ...pick, variant: "classic" })));
const [weaponUser, weaponTarget] = weaponBattle.fighters;
weaponUser.x = 300;
weaponUser.y = 300;
weaponUser.vx = weaponUser.vy = 0;
weaponUser.weaponAngle = 0;
weaponTarget.x = weaponUser.x + weaponUser.radius + weaponUser.weaponReach;
weaponTarget.y = weaponUser.y;
weaponTarget.vx = weaponTarget.vy = 0;
weaponUser.cooldown = weaponTarget.cooldown = 999;
weaponUser.specialCooldown = weaponTarget.specialCooldown = 999;
const startingWeaponDamage = weaponUser.weaponDamage;
stepBattle(weaponBattle);
assert.equal(weaponUser.weaponHits, 1, "a pixel item contact registers a weapon hit");
assert.ok(weaponUser.weaponDamage > startingWeaponDamage, "weapon damage scales after a hit");

const charged = createBattle("CHARGE-CHECK", picks.slice(0, 2));
const [charger, target] = charged.fighters;
charger.x = 400;
charger.y = 300;
target.x = 500;
target.y = 300;
charger.cooldown = 0;
charger.specialCooldown = 999;
charger.gauge = 0;
target.cooldown = target.specialCooldown = 999;
stepBattle(charged);
assert.ok(charger.pendingMove, "supercharged fighter queues its attack before firing");
assert.ok(charger.charging > 0, "supercharged fighter exposes a charge window");

const ultimate = createBattle("ULTIMATE-CUE", picks.slice(0, 2).map((pick) => ({ ...pick, variant: "classic" })));
ultimate.fighters[0].gauge = 100;
ultimate.fighters[0].cooldown = 999;
ultimate.fighters[0].specialCooldown = 999;
ultimate.fighters[1].cooldown = ultimate.fighters[1].specialCooldown = 999;
stepBattle(ultimate);
assert.ok(ultimate.fighters[0].ultimatePose > 0, "ultimate exposes a character pose window");
assert.ok(ultimate.banner, "ultimate creates a readable battle banner");

console.log(`JBB deterministic engine OK · ${first}`);
