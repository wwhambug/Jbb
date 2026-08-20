"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PixelOrb } from "./components/PixelOrb";
import { drawBattle } from "./game/draw";
import {
  createBattle,
  FIXED_DT,
  hashString,
  stepBattle,
} from "./game/engine";
import { getPixelStyle } from "./game/pixel-art";
import { FIGHTERS, FIGHTER_BY_ID, VARIANTS } from "./game/roster";
import type { BattleState, RosterPick, VariantId } from "./game/types";

type BattleConfig = { seed: string; picks: RosterPick[] };
type GameMode = "setup" | "battle";

function formatTime(step: number) {
  const seconds = Math.floor(step / 60);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function getSnapshot(state: BattleState): BattleState {
  return {
    ...state,
    fighters: state.fighters.map((fighter) => ({ ...fighter })),
    events: state.events.map((event) => ({ ...event })),
    projectiles: [],
    hazards: [],
    slashes: [],
    activeCollisions: new Set(),
    activeWeaponHits: new Set(),
    particles: [],
    damagePopups: [],
    banner: state.banner ? { ...state.banner } : null,
  };
}

function playTone(
  context: AudioContext | null,
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType,
  delay = 0,
) {
  if (!context || context.state !== "running") return;
  const now = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(45, frequency * 0.52), now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

const FighterTile = memo(function FighterTile({
  fighterId,
  selected,
  focused,
  onChoose,
}: {
  fighterId: string;
  selected: boolean;
  focused: boolean;
  onChoose: (fighterId: string) => void;
}) {
  const fighter = FIGHTER_BY_ID.get(fighterId);
  if (!fighter) return null;
  return (
    <button
      className={`fighter-tile${selected ? " selected" : ""}${focused ? " focused" : ""}`}
      type="button"
      onClick={() => onChoose(fighter.id)}
      aria-pressed={selected}
      aria-label={`${fighter.name} ${selected ? "선택 해제" : "선택"}`}
    >
      <PixelOrb fighterId={fighter.id} color={fighter.color} ink={fighter.ink} size={44} className="tile-orb" />
      <span className="tile-copy"><b>{fighter.name}</b><small>{fighter.role} · {getPixelStyle(fighter.id).itemName}</small></span>
      <span className="tile-check" aria-hidden="true">{selected ? "✓" : "+"}</span>
    </button>
  );
});

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const battleRef = useRef<BattleState | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const lastImpactRef = useRef(0);
  const lastUltimateRef = useRef(0);
  const [mode, setMode] = useState<GameMode>("setup");
  const [seed, setSeed] = useState("JBB-2026");
  const [picks, setPicks] = useState<RosterPick[]>([]);
  const [focusedId, setFocusedId] = useState(FIGHTERS[0].id);
  const [battleConfig, setBattleConfig] = useState<BattleConfig | null>(null);
  const [snapshot, setSnapshot] = useState<BattleState | null>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("공을 최소 2개 골라야 전투를 시작할 수 있다.");

  const selectedIds = useMemo(() => new Set(picks.map((pick) => pick.fighterId)), [picks]);
  const focused = FIGHTER_BY_ID.get(focusedId) ?? FIGHTERS[0];
  const focusedPick = picks.find((pick) => pick.fighterId === focused.id);
  const filteredFighters = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return FIGHTERS;
    return FIGHTERS.filter((fighter) =>
      `${fighter.name} ${fighter.role} ${fighter.trait} ${fighter.basics.map((move) => move.name).join(" ")} ${fighter.ultimates.map((move) => move.name).join(" ")} ${fighter.special.name}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  const toggleFighter = useCallback((fighterId: string) => {
    setFocusedId(fighterId);
    setPicks((current) => {
      if (current.some((pick) => pick.fighterId === fighterId)) {
        const next = current.filter((pick) => pick.fighterId !== fighterId);
        setNotice(next.length < 2 ? "공을 최소 2개 골라야 전투를 시작할 수 있다." : `${next.length}구 편성 완료.`);
        return next;
      }
      if (current.length >= 12) {
        setNotice("최대 12구까지만 출전할 수 있다.");
        return current;
      }
      const next = [...current, { fighterId, variant: "classic" as VariantId }];
      setNotice(next.length < 2 ? "한 개 더 골라라." : `${next.length}구 편성 완료. 시작 가능.`);
      return next;
    });
  }, []);

  const setVariant = useCallback((fighterId: string, variant: VariantId) => {
    setPicks((current) => current.map((pick) => (pick.fighterId === fighterId ? { ...pick, variant } : pick)));
  }, []);

  const startBattle = useCallback(() => {
    if (picks.length < 2) {
      setNotice("공을 최소 2개 골라야 전투를 시작할 수 있다.");
      return;
    }
    const config: BattleConfig = {
      seed: seed.trim() || "JBB-2026",
      picks: picks.map((pick) => ({ ...pick })),
    };
    const battle = createBattle(config.seed, config.picks);
    if (!audioRef.current) audioRef.current = new AudioContext();
    void audioRef.current.resume();
    lastImpactRef.current = battle.impactCount;
    lastUltimateRef.current = battle.ultimateCount;
    battleRef.current = battle;
    setBattleConfig(config);
    setSnapshot(getSnapshot(battle));
    setPaused(false);
    setMode("battle");
  }, [picks, seed]);

  const restartBattle = useCallback(() => {
    if (!battleConfig) return;
    const battle = createBattle(battleConfig.seed, battleConfig.picks);
    lastImpactRef.current = battle.impactCount;
    lastUltimateRef.current = battle.ultimateCount;
    battleRef.current = battle;
    setSnapshot(getSnapshot(battle));
    setPaused(false);
  }, [battleConfig]);

  useEffect(() => {
    if (mode !== "battle") return;
    let animationFrame = 0;
    let lastTime = performance.now();
    let accumulator = 0;
    let lastUiStep = -1;

    const render = (time: number) => {
      const state = battleRef.current;
      if (!state) return;
      const elapsed = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;
      if (!paused && !state.finished) {
        accumulator += elapsed * speed;
        let safety = 0;
        while (accumulator >= FIXED_DT && safety < 18) {
          stepBattle(state);
          accumulator -= FIXED_DT;
          safety += 1;
        }
        if (state.impactCount !== lastImpactRef.current) {
          lastImpactRef.current = state.impactCount;
          const power = state.lastImpactPower;
          playTone(audioRef.current, 150 + Math.min(220, power * 7), 0.055, Math.min(0.045, 0.012 + power * 0.0012), "square");
        }
        if (state.ultimateCount !== lastUltimateRef.current) {
          lastUltimateRef.current = state.ultimateCount;
          playTone(audioRef.current, 190, 0.34, 0.035, "sawtooth");
          playTone(audioRef.current, 380, 0.28, 0.025, "square", 0.08);
        }
      }
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (canvas && context) drawBattle(context, state);
      if (state.step - lastUiStep >= 10 || state.finished) {
        lastUiStep = state.step;
        setSnapshot(getSnapshot(state));
      }
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [mode, paused, speed]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (mode !== "battle") return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, select, textarea, button")) return;
      if (event.code === "Space") {
        event.preventDefault();
        setPaused((value) => !value);
      }
      if (event.key.toLowerCase() === "r") restartBattle();
      if (["1", "2", "4"].includes(event.key)) setSpeed(Number(event.key));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, restartBattle]);

  const nextSeed = () => {
    const next = `JBB-${hashString(`${seed}:next`).toString(36).toUpperCase().slice(0, 7)}`;
    setSeed(next);
  };

  const copyMatchCode = async () => {
    const code = `${seed.trim() || "JBB-2026"}|${picks.map((pick) => `${pick.fighterId}:${pick.variant}`).join(",")}`;
    await navigator.clipboard.writeText(code);
    setNotice("매치 코드를 복사했다.");
  };

  const ranking = useMemo(() => {
    if (!snapshot) return [];
    return [...snapshot.fighters].sort(
      (left, right) => Number(right.alive) - Number(left.alive)
        || right.hp / right.maxHp - left.hp / left.maxHp
        || right.damageDone - left.damageDone,
    );
  }, [snapshot]);

  if (mode === "battle" && snapshot && battleConfig) {
    const alive = snapshot.fighters.filter((fighter) => fighter.alive).length;
    const totalHits = snapshot.fighters.reduce((sum, fighter) => sum + fighter.weaponHits, 0);
    return (
      <main className="game-root battle-mode">
        <header className="game-header">
          <div className="game-logo"><span>JBB</span><b>JUST BATTLE BALLS</b></div>
          <div className="match-hud">
            <span><small>SEED</small><b>{battleConfig.seed}</b></span>
            <span><small>TIME</small><b>{formatTime(snapshot.step)}</b></span>
            <span><small>ALIVE</small><b>{alive}/{snapshot.fighters.length}</b></span>
          </div>
          <button className="back-button" type="button" onClick={() => { setPaused(true); setMode("setup"); }}>편성으로</button>
        </header>

        <section className="battle-stage">
          <div className="canvas-frame">
            <canvas ref={canvasRef} className="battle-canvas" width={960} height={600} aria-label={`${battleConfig.seed} 시드의 ${battleConfig.picks.length}구 전투`} />
            <div className="battle-controls">
              <button type="button" className="control-main" onClick={() => setPaused((value) => !value)}>{paused ? "계속하기" : "일시정지"}</button>
              <button type="button" onClick={restartBattle}>다시 시작</button>
              <div className="speed-buttons" aria-label="전투 속도">
                {[1, 2, 4].map((value) => (
                  <button type="button" className={speed === value ? "active" : ""} onClick={() => setSpeed(value)} key={value}>{value}×</button>
                ))}
              </div>
            </div>
          </div>

          <aside className="battle-panel">
            <div className="panel-title"><span>LIVE RANKING</span><b>{totalHits} WEAPON HITS</b></div>
            <ol className="rank-list">
              {ranking.map((fighter, index) => {
                const variant = VARIANTS.find((entry) => entry.id === fighter.variant);
                return (
                  <li key={fighter.uid} className={fighter.alive ? "" : "out"}>
                    <strong>{index + 1}</strong>
                    <PixelOrb fighterId={fighter.templateId} color={fighter.color} ink={fighter.ink} size={33} variant={fighter.variant} showItem={false} className="rank-orb" />
                    <span><b>{fighter.name}</b><small>{variant?.short} · {fighter.weaponHits} HIT · {fighter.kills} KO</small></span>
                    <em>{Math.max(0, Math.ceil(fighter.hp))}</em>
                  </li>
                );
              })}
            </ol>
            <div className="panel-title log-title"><span>BATTLE FEED</span><b>{snapshot.events.length}</b></div>
            <div className="battle-feed" aria-live="polite">
              {snapshot.events.slice(0, 7).map((event, index) => (
                <p key={`${event.step}-${index}`} className={event.major ? "major" : ""}><time>{formatTime(event.step)}</time>{event.text}</p>
              ))}
            </div>
            <div className="seed-lock"><i />SEED LOCKED · #{snapshot.fingerprint}</div>
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main className="game-root setup-mode">
      <header className="game-header">
        <div className="game-logo"><span>JBB</span><b>JUST BATTLE BALLS</b></div>
        <div className="setup-step"><b>1</b><span>파이터 선택</span><i /><b>2</b><span>전투</span></div>
        <div className="seed-badge"><small>DETERMINISTIC</small><b>동일 시드 = 동일 결과</b></div>
      </header>

      <section className="loadout-bar" aria-label="선택한 파이터">
        <div className="loadout-title"><small>YOUR LINEUP</small><b>출전 공 <em>{picks.length}</em>/12</b></div>
        <div className="loadout-slots">
          {picks.length === 0 ? (
            <div className="empty-loadout"><span>+</span><b>아래에서 공을 직접 골라라</b><small>자동 선택 없음</small></div>
          ) : picks.map((pick, index) => {
            const fighter = FIGHTER_BY_ID.get(pick.fighterId);
            const variant = VARIANTS.find((entry) => entry.id === pick.variant);
            if (!fighter) return null;
            return (
              <button className={`loadout-chip${focusedId === fighter.id ? " active" : ""}`} type="button" key={fighter.id} onClick={() => setFocusedId(fighter.id)}>
                <i>{index + 1}</i>
                <PixelOrb fighterId={fighter.id} color={fighter.color} ink={fighter.ink} size={40} variant={pick.variant} className="chip-orb" />
                <span><b>{fighter.name}</b><small>{variant?.name}</small></span>
                <em onClick={(event) => { event.stopPropagation(); toggleFighter(fighter.id); }} aria-label={`${fighter.name} 빼기`}>×</em>
              </button>
            );
          })}
        </div>
        {picks.length > 0 ? <button className="clear-button" type="button" onClick={() => { setPicks([]); setNotice("공을 최소 2개 골라야 전투를 시작할 수 있다."); }}>전부 빼기</button> : null}
      </section>

      <section className="setup-grid">
        <div className="roster-panel">
          <div className="roster-heading">
            <div><small>FIGHTER SELECT</small><h1>파이터 선택</h1></div>
            <label className="fighter-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름·기술 검색" /></label>
          </div>
          <div className="roster-count"><span>50 FIGHTERS</span><b>{filteredFighters.length}개 표시</b></div>
          <div className="fighter-selector">
            {filteredFighters.map((fighter) => (
              <FighterTile
                key={fighter.id}
                fighterId={fighter.id}
                selected={selectedIds.has(fighter.id)}
                focused={focusedId === fighter.id}
                onChoose={toggleFighter}
              />
            ))}
          </div>
        </div>

        <aside className="fighter-detail">
          <div className="detail-hero" style={{ background: `linear-gradient(145deg, ${focused.color}, #ffffff)` }}>
            <PixelOrb fighterId={focused.id} color={focused.color} ink={focused.ink} size={94} variant={focusedPick?.variant} className="detail-orb" />
            <div><small>{focused.role}</small><h2>{focused.name}</h2><p>{focused.trait}</p></div>
            <button className={focusedPick ? "remove-fighter" : "add-fighter"} type="button" onClick={() => toggleFighter(focused.id)}>
              {focusedPick ? "편성에서 빼기" : "이 공 선택"}
            </button>
          </div>

          <div className="stat-row">
            <span><small>ITEM</small><b>{getPixelStyle(focused.id).itemName}</b></span>
            <span><small>START DMG</small><b>{getPixelStyle(focused.id).damage.toFixed(1)}</b></span>
            <span><small>SPIN</small><b>{getPixelStyle(focused.id).spin.toFixed(1)}</b></span>
          </div>

          <section className="skills-box">
            <div className="detail-section-title"><b>기술 구성</b><small>평타 2 · 궁극기 2 · 특별기 1</small></div>
            <div className="skill-list">
              <span><i>평타 1</i><b>{focused.basics[0].name}</b><small>{focused.basics[0].damage} 피해</small></span>
              <span><i>평타 2</i><b>{focused.basics[1].name}</b><small>{focused.basics[1].damage} 피해</small></span>
              <span className="ult"><i>궁극 1</i><b>{focused.ultimates[0].name}</b><small>게이지 발동</small></span>
              <span className="ult"><i>궁극 2</i><b>{focused.ultimates[1].name}</b><small>시드로 택1</small></span>
              <span className="special"><i>특별</i><b>{focused.special.name}</b><small>자동 발동</small></span>
            </div>
          </section>

          <section className="variant-box">
            <div className="detail-section-title"><b>변형 선택</b><small>{focusedPick ? "이 파이터에 적용" : "먼저 파이터를 선택해야 함"}</small></div>
            <div className="variant-grid">
              {VARIANTS.map((variant) => (
                <button
                  type="button"
                  key={variant.id}
                  disabled={!focusedPick}
                  className={focusedPick?.variant === variant.id ? "active" : ""}
                  onClick={() => setVariant(focused.id, variant.id)}
                >
                  <i style={{ background: variant.color }} />
                  <span><b>{variant.name}</b><small>{variant.description}</small></span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <footer className="start-dock">
        <div className="seed-control">
          <label htmlFor="seed-input">MATCH SEED</label>
          <input id="seed-input" value={seed} onChange={(event) => setSeed(event.target.value.slice(0, 30))} spellCheck={false} />
          <button type="button" onClick={nextSeed}>새 시드</button>
          <button type="button" onClick={copyMatchCode}>코드 복사</button>
        </div>
        <p className={picks.length >= 2 ? "ready" : ""}><b>{notice}</b><small>충돌 시작 순간 양쪽 1 피해 · 모든 랜덤은 시드 고정</small></p>
        <button className="start-button" type="button" onClick={startBattle} disabled={picks.length < 2}>
          <span>{picks.length < 2 ? `${2 - picks.length}개 더 선택` : "전투 시작"}</span>
          <small>{picks.length}구 · {seed.trim() || "JBB-2026"}</small>
        </button>
      </footer>
    </main>
  );
}
