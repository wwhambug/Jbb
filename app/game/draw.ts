import { FIGHTER_BY_ID, VARIANTS } from "./roster";
import { drawPixelMatrix, getPixelStyle } from "./pixel-art";
import type { BattleState, FighterState } from "./types";

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function drawPaper(ctx: CanvasRenderingContext2D, state: BattleState) {
  const floor = ctx.createRadialGradient(
    state.width / 2,
    state.height / 2,
    40,
    state.width / 2,
    state.height / 2,
    state.width * 0.7,
  );
  floor.addColorStop(0, "#f8edc8");
  floor.addColorStop(1, "#cdbb82");
  ctx.fillStyle = floor;
  ctx.fillRect(0, 0, state.width, state.height);
  ctx.strokeStyle = "rgba(16, 42, 73, .22)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(state.width / 2, state.height / 2, 105, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(state.width / 2, 22);
  ctx.lineTo(state.width / 2, state.height - 22);
  ctx.stroke();
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.arc(state.width / 2, state.height / 2, Math.min(state.width, state.height) * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 5;
  roundedRect(ctx, 12, 12, state.width - 24, state.height - 24, 26);
  ctx.stroke();
  ctx.strokeStyle = "rgba(31, 41, 55, .35)";
  ctx.lineWidth = 1.5;
  roundedRect(ctx, 18, 18, state.width - 36, state.height - 36, 22);
  ctx.stroke();
}

function drawHazards(ctx: CanvasRenderingContext2D, state: BattleState) {
  for (const hazard of state.hazards) {
    const alpha = Math.min(0.28, hazard.life * 0.12);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = hazard.color;
    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = Math.min(0.8, hazard.life * 0.4);
    ctx.setLineDash([7, 8]);
    ctx.strokeStyle = hazard.color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
}

function drawEffects(ctx: CanvasRenderingContext2D, state: BattleState) {
  for (const slash of state.slashes) {
    ctx.save();
    ctx.globalAlpha = slash.life / slash.maxLife;
    ctx.strokeStyle = slash.color;
    ctx.lineWidth = slash.width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(slash.x1, slash.y1);
    ctx.lineTo(slash.x2, slash.y2);
    ctx.stroke();
    ctx.globalAlpha *= 0.45;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = Math.max(1.5, slash.width * 0.22);
    ctx.stroke();
    ctx.restore();
  }
  for (const projectile of state.projectiles) {
    ctx.save();
    ctx.strokeStyle = "rgba(17, 24, 39, .35)";
    ctx.lineWidth = projectile.radius * 0.9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(projectile.x - projectile.vx * 0.045, projectile.y - projectile.vy * 0.045);
    ctx.lineTo(projectile.x, projectile.y);
    ctx.stroke();
    ctx.fillStyle = projectile.color;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawStatusRings(ctx: CanvasRenderingContext2D, fighter: FighterState) {
  const rings: string[] = [];
  if (fighter.shield > 0) rings.push("#2563eb");
  if (fighter.burn > 0) rings.push("#ea580c");
  if (fighter.slow > 0) rings.push("#0891b2");
  if (fighter.thorns > 0) rings.push("#16a34a");
  if (fighter.phase > 0) rings.push("#7c3aed");
  rings.forEach((color, index) => {
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.62;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5 + index * 2, 4]);
    ctx.beginPath();
    ctx.arc(fighter.x, fighter.y, fighter.radius + 7 + index * 4, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
}

function drawVariantPixels(ctx: CanvasRenderingContext2D, fighter: FighterState, step: number) {
  const color = fighter.variant === "flame"
    ? "#f97316"
    : fighter.variant === "frost"
      ? "#38bdf8"
      : fighter.variant === "supercharged"
        ? "#a855f7"
        : fighter.variant === "swift"
          ? "#22c55e"
          : fighter.variant === "titan"
            ? "#facc15"
            : null;
  if (!color) return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.72;
  const count = fighter.variant === "titan" ? 5 : 7;
  for (let index = 0; index < count; index += 1) {
    const angle = step * (fighter.variant === "swift" ? 0.11 : 0.045) + index * (Math.PI * 2 / count);
    const orbit = fighter.radius + 6 + (index % 2) * 3;
    const size = fighter.variant === "titan" ? 3 : 2;
    ctx.fillRect(
      Math.round(fighter.x + Math.cos(angle) * orbit - size / 2),
      Math.round(fighter.y + Math.sin(angle) * orbit - size / 2),
      size,
      size,
    );
  }
  ctx.restore();
}

function drawWeapon(ctx: CanvasRenderingContext2D, fighter: FighterState, step: number) {
  if (!fighter.alive) return;
  const style = getPixelStyle(fighter.templateId);
  const orbit = fighter.radius + fighter.weaponReach;
  const weaponX = fighter.x + Math.cos(fighter.weaponAngle) * orbit;
  const weaponY = fighter.y + Math.sin(fighter.weaponAngle) * orbit;
  const growthScale = fighter.weaponHits >= 18 ? 3 : 2;

  ctx.save();
  ctx.strokeStyle = style.accent2;
  ctx.globalAlpha = 0.18 + Math.min(0.28, fighter.weaponHits * 0.012);
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  ctx.arc(fighter.x, fighter.y, orbit, fighter.weaponAngle - 0.72, fighter.weaponAngle);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.34;
  ctx.beginPath();
  ctx.moveTo(fighter.x, fighter.y);
  ctx.lineTo(weaponX, weaponY);
  ctx.stroke();
  ctx.globalAlpha = 1;
  if (fighter.variant === "supercharged" && fighter.charging > 0) {
    const pulse = 4 + Math.round(Math.sin(step * 0.45) * 2);
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 3;
    ctx.strokeRect(Math.round(weaponX - pulse), Math.round(weaponY - pulse), pulse * 2, pulse * 2);
  }
  ctx.restore();

  drawPixelMatrix(
    ctx,
    style.item,
    style,
    weaponX,
    weaponY,
    growthScale,
    fighter.weaponAngle + Math.PI / 2,
  );
}

function drawFighter(ctx: CanvasRenderingContext2D, fighter: FighterState, step: number) {
  if (!fighter.alive) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(fighter.x - 10, fighter.y - 10);
    ctx.lineTo(fighter.x + 10, fighter.y + 10);
    ctx.moveTo(fighter.x + 10, fighter.y - 10);
    ctx.lineTo(fighter.x - 10, fighter.y + 10);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.save();
  drawStatusRings(ctx, fighter);
  drawVariantPixels(ctx, fighter, step);
  if (fighter.charging > 0) {
    const pulse = 1 + Math.sin(step * 0.32) * 0.08;
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 5;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.arc(fighter.x, fighter.y, (fighter.radius + 13) * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.shadowColor = "rgba(39, 32, 20, .2)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = "rgba(39, 32, 20, .18)";
  ctx.beginPath();
  ctx.ellipse(fighter.x + 2, fighter.y + fighter.radius + 7, fighter.radius * 0.9, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = fighter.hitFlash > 0 ? "#ffffff" : fighter.color;
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(fighter.x, fighter.y, fighter.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = fighter.ink;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(fighter.x - 1.5, fighter.y + 1, fighter.radius - 5, 0.2, Math.PI * 1.76);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const pixelStyle = getPixelStyle(fighter.templateId);
  const face = fighter.ultimatePose > 0 && pixelStyle.ultimateFace
    ? pixelStyle.ultimateFace
    : pixelStyle.face;
  drawPixelMatrix(ctx, face, pixelStyle, fighter.x, fighter.y + 1, fighter.radius >= 22 ? 2 : 1.65);

  const barWidth = 48;
  const healthRatio = Math.max(0, fighter.hp / fighter.maxHp);
  roundedRect(ctx, fighter.x - barWidth / 2, fighter.y - fighter.radius - 16, barWidth, 6, 3);
  ctx.fillStyle = "rgba(17, 24, 39, .2)";
  ctx.fill();
  if (healthRatio > 0) {
    roundedRect(ctx, fighter.x - barWidth / 2, fighter.y - fighter.radius - 16, barWidth * healthRatio, 6, 3);
    ctx.fillStyle = healthRatio > 0.5 ? "#16a34a" : healthRatio > 0.25 ? "#eab308" : "#dc2626";
    ctx.fill();
  }
  const gaugeRatio = fighter.gauge / 100;
  roundedRect(ctx, fighter.x - barWidth / 2, fighter.y + fighter.radius + 9, barWidth, 4, 2);
  ctx.fillStyle = "rgba(17, 24, 39, .16)";
  ctx.fill();
  if (gaugeRatio > 0) {
    roundedRect(ctx, fighter.x - barWidth / 2, fighter.y + fighter.radius + 9, barWidth * gaugeRatio, 4, 2);
    ctx.fillStyle = "#7c3aed";
    ctx.fill();
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#111827";
  ctx.font = "900 7px ui-monospace, monospace";
  ctx.fillText(`${Math.round(fighter.weaponDamage)} DMG · ${fighter.weaponHits} HIT`, fighter.x, fighter.y + fighter.radius + 21);
  ctx.restore();
}

function drawImpactLayer(ctx: CanvasRenderingContext2D, state: BattleState) {
  for (const particle of state.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.fillRect(
      Math.round(particle.x - particle.size / 2),
      Math.round(particle.y - particle.size / 2),
      particle.size,
      particle.size,
    );
    ctx.restore();
  }
  for (const popup of state.damagePopups) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, popup.life * 2.4);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = popup.critical ? 4 : 3;
    ctx.strokeStyle = "#111827";
    ctx.fillStyle = popup.color;
    ctx.font = `1000 ${popup.critical ? 18 : 12}px ui-monospace, monospace`;
    const label = `${popup.critical ? "!" : ""}-${Math.max(1, Math.round(popup.value))}`;
    ctx.strokeText(label, popup.x, popup.y);
    ctx.fillText(label, popup.x, popup.y);
    ctx.restore();
  }
}

function drawUltimateBanner(ctx: CanvasRenderingContext2D, state: BattleState) {
  const banner = state.banner;
  if (!banner) return;
  const progress = banner.timer / banner.maxTimer;
  const width = 560;
  const x = state.width / 2 - width / 2;
  const y = 88;
  ctx.save();
  ctx.globalAlpha = Math.min(1, (1 - progress) * 5, progress * 5);
  ctx.fillStyle = "rgba(17, 24, 39, .92)";
  ctx.fillRect(x, y, width, 58);
  ctx.fillStyle = banner.color;
  ctx.fillRect(x, y, 9, 58);
  ctx.fillRect(x + width - 9, y, 9, 58);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, 58);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#facc15";
  ctx.font = "900 10px ui-monospace, monospace";
  ctx.fillText(`${banner.fighterName} · ULTIMATE`, state.width / 2, y + 17);
  ctx.fillStyle = "#ffffff";
  ctx.font = "1000 24px Arial, sans-serif";
  ctx.fillText(banner.moveName, state.width / 2, y + 40);
  ctx.restore();
}

function drawHeader(ctx: CanvasRenderingContext2D, state: BattleState) {
  ctx.save();
  roundedRect(ctx, 31, 28, 180, 50, 14);
  ctx.fillStyle = "rgba(255, 255, 255, .82)";
  ctx.fill();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = "#111827";
  ctx.font = "900 17px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`JBB · ${String(Math.floor(state.step / 60)).padStart(2, "0")}s`, 45, 50);
  ctx.font = "700 11px ui-monospace, monospace";
  ctx.fillStyle = "#64748b";
  ctx.fillText(`#${state.fingerprint}`, 45, 68);

  roundedRect(ctx, state.width - 213, 28, 182, 50, 14);
  ctx.fillStyle = "rgba(255, 255, 255, .82)";
  ctx.fill();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = "#111827";
  ctx.textAlign = "right";
  ctx.font = "900 14px Arial, sans-serif";
  ctx.fillText(`${state.fighters.filter((fighter) => fighter.alive).length}구 생존`, state.width - 45, 51);
  ctx.font = "700 11px Arial, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText(`시드 ${state.seed}`, state.width - 45, 68);
  ctx.restore();
}

function drawWinner(ctx: CanvasRenderingContext2D, state: BattleState) {
  if (!state.finished) return;
  const winner = state.fighters.find((fighter) => fighter.uid === state.winnerUid);
  ctx.save();
  ctx.fillStyle = "rgba(245, 239, 217, .76)";
  ctx.fillRect(0, 0, state.width, state.height);
  roundedRect(ctx, state.width / 2 - 190, state.height / 2 - 95, 380, 190, 24);
  ctx.fillStyle = "#fffdf5";
  ctx.fill();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = "#7c3aed";
  ctx.font = "900 16px Arial, sans-serif";
  ctx.fillText("SEED CHAMPION", state.width / 2, state.height / 2 - 51);
  ctx.fillStyle = "#111827";
  ctx.font = "900 38px Arial, sans-serif";
  ctx.fillText(winner?.name ?? "무승부", state.width / 2, state.height / 2 + 4);
  ctx.font = "700 14px Arial, sans-serif";
  ctx.fillStyle = "#475569";
  const template = winner ? FIGHTER_BY_ID.get(winner.templateId) : null;
  const variant = winner ? VARIANTS.find((entry) => entry.id === winner.variant) : null;
  ctx.fillText(
    winner ? `${variant?.name ?? "기본형"} · ${template?.role ?? "파이터"} · ${winner.kills} KO` : "끝까지 남은 공 없음",
    state.width / 2,
    state.height / 2 + 42,
  );
  ctx.font = "700 12px ui-monospace, monospace";
  ctx.fillText(`결과 지문 ${state.fingerprint}`, state.width / 2, state.height / 2 + 70);
  ctx.restore();
}

export function drawBattle(ctx: CanvasRenderingContext2D, state: BattleState) {
  const shakeAmount = state.shake > 0 ? Math.sin(state.step * 2.23) * state.shake * 16 : 0;
  ctx.save();
  ctx.translate(shakeAmount, -shakeAmount * 0.45);
  drawPaper(ctx, state);
  drawHazards(ctx, state);
  drawEffects(ctx, state);
  for (const fighter of state.fighters) drawWeapon(ctx, fighter, state.step);
  for (const fighter of state.fighters) drawFighter(ctx, fighter, state.step);
  drawImpactLayer(ctx, state);
  drawHeader(ctx, state);
  drawUltimateBanner(ctx, state);
  drawWinner(ctx, state);
  if (state.hitStop > 0) {
    ctx.fillStyle = "rgba(255, 255, 255, .08)";
    ctx.fillRect(0, 0, state.width, state.height);
  }
  ctx.restore();
}
