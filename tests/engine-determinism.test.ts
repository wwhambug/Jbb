import assert from "node:assert/strict";
import {
  CHAOS_SPEED_LIMIT,
  createBattle,
  simulateFingerprint,
  SUPERCHARGE_SECONDS,
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

const inertia = createBattle("TWO-AXIS-INERTIA", picks.slice(0, 2).map((pick) => ({ ...pick, variant: "classic" })));
const [drifter, distant] = inertia.fighters;
drifter.x = 240;
drifter.y = 190;
drifter.vx = 83;
drifter.vy = 47;
distant.x = 730;
distant.y = 440;
distant.vx = -52;
distant.vy = 61;
for (const fighter of inertia.fighters) {
  fighter.cooldown = 999;
  fighter.specialCooldown = 999;
  fighter.gauge = 0;
  fighter.weaponReach = 0;
  fighter.weaponDamage = 0;
}
const inertialVx = drifter.vx;
const inertialVy = drifter.vy;
const inertialX = drifter.x;
const inertialY = drifter.y;
for (let index = 0; index < 10; index += 1) stepBattle(inertia);
assert.equal(drifter.vx, inertialVx, "fighters must not steer horizontally toward a target");
assert.equal(drifter.vy, inertialVy, "fighters must not steer vertically toward a target");
assert.ok(drifter.x > inertialX && drifter.y > inertialY, "fighters preserve true two-axis inertia");

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
assert.ok(Math.hypot(left.vx, left.vy) > 0, "even a still overlap receives a separating kick");

const chaos = createBattle("COLLISION-CHAOS", picks.slice(0, 2).map((pick) => ({ ...pick, variant: "classic" })));
const [chaosLeft, chaosRight] = chaos.fighters;
chaosLeft.x = 400;
chaosLeft.y = 300;
chaosRight.x = 400 + chaosLeft.radius + chaosRight.radius - 2;
chaosRight.y = 300;
chaosLeft.vx = 90;
chaosLeft.vy = 20;
chaosRight.vx = -90;
chaosRight.vy = -20;
for (const fighter of chaos.fighters) {
  fighter.cooldown = 999;
  fighter.specialCooldown = 999;
  fighter.gauge = 0;
  fighter.weaponReach = 0;
  fighter.weaponDamage = 0;
}
const beforeChaosSpeed = Math.hypot(90, 20);
stepBattle(chaos);
assert.ok(chaosLeft.vx < 0 && chaosRight.vx > 0, "ball collision reverses the travel direction");
assert.ok(Math.hypot(chaosLeft.vx, chaosLeft.vy) > beforeChaosSpeed, "left ball accelerates after collision");
assert.ok(Math.hypot(chaosRight.vx, chaosRight.vy) > beforeChaosSpeed, "right ball accelerates after collision");
assert.ok(Math.hypot(chaosLeft.vx, chaosLeft.vy) <= CHAOS_SPEED_LIMIT, "chaos speed remains simulation-safe");

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

const charged = createBattle("CHARGE-CHECK", [
  { fighterId: "block-pick", variant: "supercharged" },
  { fighterId: "skuna", variant: "classic" },
]);
const [charger, target] = charged.fighters;
charger.x = 400;
charger.y = 300;
target.x = 490;
target.y = 300;
charger.vx = charger.vy = target.vx = target.vy = 0;
charger.weaponReach = target.weaponReach = 0;
charger.weaponDamage = target.weaponDamage = 0;
charger.cooldown = 0;
charger.specialCooldown = 999;
charger.gauge = 0;
target.cooldown = target.specialCooldown = 999;
stepBattle(charged);
assert.ok(charger.pendingMove, "supercharged fighter queues its attack before firing");
assert.equal(charger.charging, SUPERCHARGE_SECONDS, "supercharged fighter charges for exactly three seconds");
for (let index = 0; index < 181; index += 1) stepBattle(charged);
assert.equal(charger.pendingMove, null, "supercharged fighter fires after its three-second charge");
assert.ok(Math.hypot(target.vx, target.vy) >= 250, "supercharged attack launches with extreme knockback");

const ultimate = createBattle("ULTIMATE-CUE", picks.slice(0, 2).map((pick) => ({ ...pick, variant: "classic" })));
ultimate.fighters[0].gauge = 100;
ultimate.fighters[0].cooldown = 999;
ultimate.fighters[0].specialCooldown = 999;
ultimate.fighters[1].cooldown = ultimate.fighters[1].specialCooldown = 999;
stepBattle(ultimate);
assert.ok(ultimate.fighters[0].ultimatePose > 0, "ultimate exposes a character pose window");
assert.ok(ultimate.banner, "ultimate creates a readable battle banner");

console.log(`JBB deterministic engine OK · ${first}`);
