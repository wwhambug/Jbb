"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { drawBattle } from "./game/draw";
import {
  createBattle,
  FIXED_DT,
  hashString,
  seededRoster,
  simulateFingerprint,
  stepBattle,
} from "./game/engine";
import { FIGHTERS, FIGHTER_BY_ID, VARIANTS } from "./game/roster";
import type { BattleState, RosterPick, VariantId } from "./game/types";

const DEFAULT_PICKS: RosterPick[] = [
  { fighterId: "kojo", variant: "supercharged" },
  { fighterId: "skuna", variant: "flame" },
  { fighterId: "block-pick", variant: "classic" },
  { fighterId: "block-axe", variant: "titan" },
  { fighterId: "rubber-duck", variant: "swift" },
  { fighterId: "magnet-chief", variant: "frost" },
  { fighterId: "pixel-mage", variant: "classic" },
  { fighterId: "gravity-apple", variant: "supercharged" },
];

type BattleConfig = { seed: string; picks: RosterPick[]; version: number };

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
  };
}

const FighterCard = memo(function FighterCard({
  fighterId,
  selected,
  onToggle,
}: {
  fighterId: string;
  selected: boolean;
  onToggle: (fighterId: string) => void;
}) {
  const fighter = FIGHTER_BY_ID.get(fighterId);
  if (!fighter) return null;
  return (
    <article className={`fighter-card ${selected ? "is-selected" : ""}`}>
      <button
        className="fighter-card-main"
        type="button"
        onClick={() => onToggle(fighter.id)}
        aria-pressed={selected}
        aria-label={`${fighter.name} ${selected ? "선택 해제" : "선택"}`}
      >
        <span className="fighter-orb" style={{ background: fighter.color, color: fighter.ink }} aria-hidden="true">
          {fighter.mark}
        </span>
        <span className="fighter-card-copy">
          <span className="fighter-title-line"><strong>{fighter.name}</strong><small>{fighter.role}</small></span>
          <span className="fighter-trait">{fighter.trait}</span>
        </span>
        <span className="select-stamp">{selected ? "출전" : "+"}</span>
      </button>
      <div className="move-list" aria-label={`${fighter.name} 기술 목록`}>
        <span><b>평1</b>{fighter.basics[0].name}</span>
        <span><b>평2</b>{fighter.basics[1].name}</span>
        <span className="ultimate"><b>궁1</b>{fighter.ultimates[0].name}</span>
        <span className="ultimate"><b>궁2</b>{fighter.ultimates[1].name}</span>
        <span className="special"><b>특</b>{fighter.special.name}</span>
      </div>
    </article>
  );
});

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [initialBattle] = useState(() => createBattle("JBB-2026", DEFAULT_PICKS));
  const battleRef = useRef<BattleState>(initialBattle);
  const [seed, setSeed] = useState("JBB-2026");
  const [picks, setPicks] = useState<RosterPick[]>(DEFAULT_PICKS);
  const [battleConfig, setBattleConfig] = useState<BattleConfig>({ seed: "JBB-2026", picks: DEFAULT_PICKS, version: 0 });
  const [snapshot, setSnapshot] = useState<BattleState>(() => getSnapshot(initialBattle));
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [notice, setNotice] = useState("");
  const [verifyResult, setVerifyResult] = useState<"idle" | "checking" | "same" | "different">("idle");

  const selectedIds = useMemo(() => new Set(picks.map((pick) => pick.fighterId)), [picks]);
  const filteredFighters = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return FIGHTERS.filter((fighter) => {
      if (selectedOnly && !selectedIds.has(fighter.id)) return false;
      if (!normalized) return true;
      return `${fighter.name} ${fighter.role} ${fighter.trait} ${fighter.basics.map((move) => move.name).join(" ")} ${fighter.ultimates.map((move) => move.name).join(" ")} ${fighter.special.name}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [query, selectedIds, selectedOnly]);

  const startBattle = useCallback(() => {
    if (picks.length < 2) {
      setNotice("파이터를 최소 2개 골라야 전투가 열린다.");
      return;
    }
    setNotice("");
    setPaused(false);
    setVerifyResult("idle");
    setBattleConfig((current) => ({
      seed: seed.trim() || "JBB-2026",
      picks: picks.map((pick) => ({ ...pick })),
      version: current.version + 1,
    }));
  }, [picks, seed]);

  useEffect(() => {
    battleRef.current = createBattle(battleConfig.seed, battleConfig.picks);
    setSnapshot(getSnapshot(battleRef.current));
  }, [battleConfig]);

  useEffect(() => {
    let animationFrame = 0;
    let lastTime = performance.now();
    let accumulator = 0;
    let lastUiStep = -1;
    const render = (time: number) => {
      const state = battleRef.current;
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
      }
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (canvas && context) drawBattle(context, state);
      if (state.step - lastUiStep >= 12 || state.finished) {
        lastUiStep = state.step;
        setSnapshot(getSnapshot(state));
      }
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [paused, speed]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, select, textarea, button")) return;
      if (event.code === "Space") {
        event.preventDefault();
        setPaused((value) => !value);
      }
      if (event.key.toLowerCase() === "r") startBattle();
      if (["1", "2", "4"].includes(event.key)) setSpeed(Number(event.key));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [startBattle]);

  const toggleFighter = useCallback((fighterId: string) => {
    setNotice("");
    setPicks((current) => {
      if (current.some((pick) => pick.fighterId === fighterId)) return current.filter((pick) => pick.fighterId !== fighterId);
      if (current.length >= 12) {
        setNotice("한 경기에는 최대 12구까지만 들어간다.");
        return current;
      }
      return [...current, { fighterId, variant: "classic" }];
    });
  }, []);

  const setVariant = (fighterId: string, variant: VariantId) => {
    setPicks((current) => current.map((pick) => (pick.fighterId === fighterId ? { ...pick, variant } : pick)));
  };

  const makeSeededLineup = () => {
    setPicks(seededRoster(seed.trim() || "JBB-2026", 8, FIGHTERS.map((fighter) => fighter.id)));
    setNotice("이 시드로 8구와 변형까지 골랐다.");
  };

  const nextSeed = () => {
    const next = `JBB-${hashString(`${seed}:next`).toString(36).toUpperCase().slice(0, 7)}`;
    setSeed(next);
    setNotice(`다음 결정 시드: ${next}`);
  };

  const copyMatchCode = async () => {
    const code = `${seed.trim() || "JBB-2026"}|${picks.map((pick) => `${pick.fighterId}:${pick.variant}`).join(",")}`;
    await navigator.clipboard.writeText(code);
    setNotice("시드와 출전표를 복사했다.");
  };

  const verifyDeterminism = () => {
    setVerifyResult("checking");
    window.setTimeout(() => {
      const first = simulateFingerprint(battleConfig.seed, battleConfig.picks, 900);
      const second = simulateFingerprint(battleConfig.seed, battleConfig.picks, 900);
      setVerifyResult(first === second ? "same" : "different");
      setNotice(first === second ? `900스텝 재현 성공 · ${first}` : "재현 결과가 달라졌다. 엔진 점검 필요.");
    }, 10);
  };

  const ranking = [...snapshot.fighters].sort(
    (left, right) => Number(right.alive) - Number(left.alive) || right.hp / right.maxHp - left.hp / left.maxHp || right.damageDone - left.damageDone,
  );

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#arena" aria-label="JBB 아레나 맨 위로">
          <span className="brand-block">JBB</span>
          <span className="brand-copy"><b>JUST BATTLE BALLS</b><small>시드가 운명을 고정한다</small></span>
        </a>
        <nav className="topnav" aria-label="페이지 바로가기">
          <a href="#arena">아레나</a><a href="#lineup">출전표</a><a href="#fighters">50 파이터</a>
        </nav>
      </header>

      <section className="hero" id="arena">
        <div className="hero-heading">
          <div><p className="eyebrow">DETERMINISTIC BALL BRAWL</p><h1>공은 튕기고,<br /><span>결과는 안 튄다.</span></h1></div>
          <p className="hero-note">
            같은 시드 + 같은 출전표 + 같은 변형이면 모든 궁극기 선택과 이동, 충돌 결과가 완전히 같다.
            부딪히는 순간에는 양쪽이 정확히 1 피해를 받는다.
          </p>
        </div>

        <div className="seed-console" aria-label="전투 시드 설정">
          <label htmlFor="seed-input">MATCH SEED</label>
          <input id="seed-input" value={seed} onChange={(event) => setSeed(event.target.value.slice(0, 30))} spellCheck={false} aria-describedby="seed-help" />
          <button className="paper-button small" type="button" onClick={nextSeed}>다음 시드</button>
          <button className="paper-button small" type="button" onClick={copyMatchCode}>매치 코드 복사</button>
          <p id="seed-help">게임 중 발생하는 모든 선택은 이 문자열에서만 시작된다.</p>
        </div>

        <div className="battle-layout">
          <section className="arena-panel" aria-label="JBB 전투 화면">
            <div className="tape tape-left" aria-hidden="true" /><div className="tape tape-right" aria-hidden="true" />
            <canvas ref={canvasRef} className="battle-canvas" width={960} height={600} aria-label={`${battleConfig.seed} 시드의 ${battleConfig.picks.length}구 자동 전투`} />
            <div className="arena-controls">
              <button className="primary-button" type="button" onClick={startBattle}>처음부터 전투</button>
              <button className="icon-button" type="button" onClick={() => setPaused((value) => !value)}>{paused ? "계속" : "정지"}</button>
              <div className="speed-control" aria-label="전투 속도">
                {[1, 2, 4].map((value) => (
                  <button type="button" className={speed === value ? "active" : ""} onClick={() => setSpeed(value)} key={value}>{value}×</button>
                ))}
              </div>
              <span className="shortcut-note">Space 정지 · R 재시작</span>
            </div>
          </section>

          <aside className="battle-sidebar">
            <section className="score-sheet">
              <div className="sheet-heading"><div><span>LIVE TABLE</span><b>{formatTime(snapshot.step)}</b></div><small>#{snapshot.fingerprint}</small></div>
              <ol className="ranking-list">
                {ranking.map((fighter, index) => {
                  const variant = VARIANTS.find((entry) => entry.id === fighter.variant);
                  return (
                    <li key={fighter.uid} className={fighter.alive ? "" : "out"}>
                      <span className="rank-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="mini-orb" style={{ background: fighter.color, color: fighter.ink }}>{fighter.mark}</span>
                      <span className="rank-copy"><b>{fighter.name}</b><small>{variant?.short} · {fighter.kills} KO</small></span>
                      <span className="hp-copy">{Math.ceil(fighter.hp)}<small>HP</small></span>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="event-sheet">
              <div className="sheet-heading"><div><span>BATTLE LOG</span><b>{snapshot.events.length}</b></div></div>
              <div className="event-list" aria-live="polite">
                {snapshot.events.slice(0, 7).map((event, index) => (
                  <p key={`${event.step}-${index}`} className={event.major ? "major" : ""}>
                    <time>{formatTime(event.step)}</time><span style={{ borderColor: event.tone }}>{event.text}</span>
                  </p>
                ))}
              </div>
            </section>

            <button className={`verify-button ${verifyResult}`} type="button" onClick={verifyDeterminism} disabled={verifyResult === "checking"}>
              <span>{verifyResult === "checking" ? "900스텝 계산 중" : verifyResult === "same" ? "시드 재현 확인됨" : "시드 재현 검사"}</span>
              <small>같은 경기를 2번 돌려 지문 비교</small>
            </button>
          </aside>
        </div>
      </section>

      <section className="lineup-section" id="lineup">
        <div className="section-heading">
          <div><p className="eyebrow">BUILD THE MATCH</p><h2>출전표 & 변형</h2></div>
          <p>2–12구. 파이터별로 변형을 따로 고를 수 있다. 슈퍼차지드는 공격을 충전한 뒤 더 세게 발사한다.</p>
        </div>
        <div className="variant-legend">
          {VARIANTS.map((variant) => (
            <div key={variant.id}><i style={{ background: variant.color }} /><span><b>{variant.name}</b><small>{variant.description}</small></span></div>
          ))}
        </div>
        <div className="lineup-board">
          <div className="lineup-board-header">
            <b>현재 출전 {picks.length}/12</b>
            <div><button className="paper-button small" type="button" onClick={makeSeededLineup}>시드로 8구 뽑기</button><button className="paper-button small" type="button" onClick={() => setPicks([])}>모두 빼기</button></div>
          </div>
          <div className="lineup-grid">
            {picks.length === 0 && <p className="empty-lineup">아래 50 파이터에서 공을 눌러 출전시켜라.</p>}
            {picks.map((pick, index) => {
              const fighter = FIGHTER_BY_ID.get(pick.fighterId);
              if (!fighter) return null;
              return (
                <article className="lineup-pick" key={pick.fighterId}>
                  <span className="pick-order">{index + 1}</span>
                  <span className="lineup-orb" style={{ background: fighter.color, color: fighter.ink }}>{fighter.mark}</span>
                  <div><b>{fighter.name}</b><small>{fighter.role}</small></div>
                  <label>
                    <span className="sr-only">{fighter.name} 변형</span>
                    <select value={pick.variant} onChange={(event) => setVariant(fighter.id, event.target.value as VariantId)}>
                      {VARIANTS.map((variant) => <option value={variant.id} key={variant.id}>{variant.name}</option>)}
                    </select>
                  </label>
                  <button type="button" onClick={() => toggleFighter(fighter.id)} aria-label={`${fighter.name} 출전 해제`}>×</button>
                </article>
              );
            })}
          </div>
          <div className="lineup-action">
            <span className={notice ? "notice show" : "notice"}>{notice || "출전표를 바꾸면 전투 시작을 눌러 적용된다."}</span>
            <button className="primary-button large" type="button" onClick={startBattle}>이 출전표로 전투 시작</button>
          </div>
        </div>
      </section>

      <section className="fighters-section" id="fighters">
        <div className="section-heading">
          <div><p className="eyebrow">50 ORIGINAL FIGHTERS</p><h2>공 도감</h2></div>
          <p>모든 파이터는 평타 2개, 궁극기 2개, 특별기 1개를 가진다. 궁극 게이지가 차면 둘 중 하나를 시드 RNG로 고른다.</p>
        </div>
        <div className="fighter-toolbar">
          <label className="search-box"><span>찾기</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름, 역할, 기술 검색" /></label>
          <button className={selectedOnly ? "filter-button active" : "filter-button"} type="button" onClick={() => setSelectedOnly((value) => !value)}>출전 중만 보기 <b>{picks.length}</b></button>
          <span className="result-count">{filteredFighters.length} / 50</span>
        </div>
        <div className="fighter-grid">
          {filteredFighters.map((fighter) => (
            <FighterCard key={fighter.id} fighterId={fighter.id} selected={selectedIds.has(fighter.id)} onToggle={toggleFighter} />
          ))}
        </div>
      </section>

      <section className="rules-section">
        <div className="rules-sticker"><span>1</span><b>SEED</b><p>문자열을 32비트 값으로 바꾼다.</p></div>
        <div className="rules-arrow" aria-hidden="true">→</div>
        <div className="rules-sticker"><span>2</span><b>FIXED STEP</b><p>초당 60회 같은 순서로 계산한다.</p></div>
        <div className="rules-arrow" aria-hidden="true">→</div>
        <div className="rules-sticker"><span>3</span><b>SAME FIGHT</b><p>궁극기, 덫, 충돌까지 그대로 재생된다.</p></div>
      </section>

      <footer>
        <span className="brand-block small-mark">JBB</span><p>JUST BATTLE BALLS · DETERMINISTIC ARENA</p><a href="#arena">맨 위로</a>
      </footer>
    </main>
  );
}
