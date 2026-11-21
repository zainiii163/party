"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Play, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/effects/confetti";
import { PRIZES } from "@/lib/universe";
import { ExperienceShell, ReportButton, usePageActive, useStoredState, useTicker } from "./shared";

const TARGETS = ["🎯", "🐧", "⭐", "🎅"];

export function SnowballBattle() {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(20);
  const [score, setScore] = useState(0);
  const [hit, setHit] = useState<number | null>(null);
  const reduce = Boolean(useReducedMotion());
  const active = usePageActive();

  useTicker(() => setTime((t) => {
    if (t <= 1) { setRunning(false); return 0; }
    return t - 1;
  }), 1000, running);

  function start() { setScore(0); setTime(20); setRunning(true); }
  function scoreHit(index: number) {
    if (!running) return;
    setScore((v) => v + 1);
    setHit(index);
    window.setTimeout(() => setHit((current) => (current === index ? null : current)), 250);
  }

  return (
    <ExperienceShell title="Snowball battle arena" intro="Twenty seconds, four moving targets and absolutely no icy injuries. Tap as many as you can.">
      <div className="relative h-64 overflow-hidden rounded-xl border border-gold/20 bg-[radial-gradient(circle_at_50%_120%,rgba(65,109,158,0.4),#061022_75%)]">
        <div className="absolute left-4 top-4 z-10 flex gap-3 text-xs text-champagne">
          <span>Score: {score}</span><span>Time: {time}s</span>
        </div>
        {TARGETS.map((emoji, index) => (
          <motion.button key={emoji} type="button" onClick={() => scoreHit(index)} disabled={!running}
            aria-label={`Hit target ${emoji}`}
            animate={reduce || !running ? undefined : { x: [0, 40, -25, 10, 0], y: [0, -18, 14, -10, 0] }}
            transition={{ duration: 3 + index * 0.6, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute grid size-16 place-items-center rounded-full border border-gold/30 bg-[#101f35]/80 text-3xl shadow-lg ${hit === index ? "scale-125 bg-gold/30" : ""}`}
            style={{ left: `${12 + index * 22}%`, top: `${28 + (index % 2) * 24}%` }}>
            {emoji}
          </motion.button>
        ))}
        {!running && <div className="absolute inset-0 grid place-items-center bg-[#081426]/60 text-center">
          <div><p className="font-display text-xl text-champagne">{time === 0 ? `Round over: ${score} hits!` : "Ready when you are"}</p>
            <Button className="mt-4" onClick={start}><Play /> {time === 0 ? "Play again" : "Start round"}</Button></div>
        </div>}
        {active && running && score >= 10 && !reduce && <Confetti pieces={20} />}
      </div>
      <ReportButton experienceId="snowball-battle" />
    </ExperienceShell>
  );
}

const RACERS = [
  { emoji: "🛷", name: "The Sled" }, { emoji: "⛄", name: "Snowman" },
  { emoji: "🐧", name: "Penguin" }, { emoji: "🦊", name: "Fox" },
];

export function SnowRace() {
  const [choice, setChoice] = useState(0);
  const [winner, setWinner] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const reduce = Boolean(useReducedMotion());
  const active = usePageActive();

  function race() {
    setRunning(true); setWinner(null);
    window.setTimeout(() => {
      // Slight home-track boost, but the other sleds still have a real chance.
      const roll = Math.random() * 3.4;
      setWinner(roll < 1.15 ? choice : Math.floor(Math.random() * RACERS.length));
      setRunning(false);
    }, reduce ? 100 : 1800);
  }

  return (
    <ExperienceShell title="Cousins snow race" intro="Pick your racer, then shout encouragement at the screen. The penguin takes this suspiciously seriously.">
      <div className="mb-5 flex flex-wrap gap-2">
        {RACERS.map((racer, i) => (
          <button key={racer.name} type="button" onClick={() => setChoice(i)} aria-pressed={choice === i}
            className={`rounded-full border px-4 py-2 text-sm transition ${choice === i ? "border-gold bg-gold/20 text-champagne" : "border-white/12 text-muted hover:border-gold/40"}`}>
            {racer.emoji} {racer.name}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {RACERS.map((racer, i) => (
          <div key={racer.name} className="flex items-center gap-3">
            <span className="w-8 text-xl">{racer.emoji}</span>
            <div className="h-8 flex-1 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#c99a4d] to-[#f2d7a0]"
                animate={{ width: running ? `${winner === i || winner === null ? 82 + i * 3 : 35 + i * 9}%` : winner === i ? "100%" : "0%" }}
                transition={{ duration: reduce ? 0 : running ? 1.8 : 0.5, ease: "easeOut" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={race} disabled={running}><Play /> {running ? "They're off!" : "Start the race"}</Button>
        <AnimatePresence>{winner !== null && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-lg text-champagne">{RACERS[winner].emoji} {RACERS[winner].name} wins!</motion.p>}</AnimatePresence>
      </div>
      {active && winner === choice && !reduce && <Confetti pieces={26} />}
      <ReportButton experienceId="snow-race" />
    </ExperienceShell>
  );
}

const MOVES = [
  { emoji: "🕺", label: "The Hot Chocolate Shuffle", accent: "from-[#d8ae63]/30 to-transparent" },
  { emoji: "💃", label: "The Snowflake Spin", accent: "from-[#72c7a1]/25 to-transparent" },
  { emoji: "🤖", label: "The Robot Cousin", accent: "from-[#416d9e]/30 to-transparent" },
  { emoji: "🐧", label: "The Penguin Waddle", accent: "from-[#f2d7a0]/25 to-transparent" },
];

export function DanceOff() {
  const [move, setMove] = useState(0);
  const [points, setPoints] = useState(0);
  const [round, setRound] = useState(false);
  const [bounce, setBounce] = useState(0);
  const reduce = Boolean(useReducedMotion());
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  function start() {
    setPoints(0); setRound(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRound(false), 15000);
  }
  function tap() { if (!round) return; setPoints((v) => v + 1); setBounce((v) => v + 1); }

  return (
    <ExperienceShell title="Avatar dance-off" intro="Fifteen seconds. Pick a move, tap to the beat, and try not to laugh at the penguin.">
      <div className="flex flex-wrap gap-2">
        {MOVES.map((item, i) => <button key={item.label} type="button" onClick={() => setMove(i)} aria-pressed={move === i}
          className={`rounded-full border px-3 py-1.5 text-xs transition ${move === i ? "border-gold bg-gold/20 text-champagne" : "border-white/12 text-muted"}`}>{item.emoji} {item.label}</button>)}
      </div>
      <div className={`relative mt-5 grid h-56 place-items-center overflow-hidden rounded-xl border border-gold/20 bg-gradient-to-b ${MOVES[move].accent} to-[#081426]`}>
        <motion.div key={`${move}-${bounce}`} initial={reduce ? undefined : { y: 0, rotate: -8, scale: 0.9 }}
          animate={reduce ? undefined : { y: [0, -26, 0], rotate: [-8, 8, -8], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: round ? 0.45 : 2, repeat: round ? 0 : Infinity }} className="text-8xl">
          {MOVES[move].emoji}
        </motion.div>
        <span className="absolute left-4 top-4 text-xs text-champagne">Points: {points}</span>
        {!round && <div className="absolute inset-0 grid place-items-center bg-[#081426]/65"><Button onClick={start}><Play /> Start 15-second round</Button></div>}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={tap} disabled={!round}>Tap the beat!</Button>
        <Button variant="ghost" onClick={start}><RotateCcw /> Restart</Button>
        {!round && points > 0 && <span className="text-sm text-champagne">Final score: {points} · {points > 30 ? "Legendary moves!" : "Nice rhythm!"}</span>}
      </div>
      <ReportButton experienceId="dance-off" />
    </ExperienceShell>
  );
}

export function PrizeMachine() {
  const [reels, setReels] = useState([0, 1, 2]);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<string | null>(null);
  const [collection, setCollection] = useStoredState<string[]>("universe.prizes", []);
  const reduce = Boolean(useReducedMotion());
  const active = usePageActive();
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  function spin() {
    if (spinning) return;
    setSpinning(true); setWon(null);
    if (reduce) {
      const index = Math.floor(Math.random() * PRIZES.length);
      setReels([index, index, index]); setWon(PRIZES[index].name);
      setCollection((prev) => prev.includes(PRIZES[index].name) ? prev : [...prev, PRIZES[index].name]);
      setSpinning(false);
      return;
    }
    timer.current = window.setInterval(() => {
      setReels([Math.floor(Math.random() * PRIZES.length), Math.floor(Math.random() * PRIZES.length), Math.floor(Math.random() * PRIZES.length)]);
    }, 90);
    window.setTimeout(() => {
      if (timer.current) window.clearInterval(timer.current);
      const index = Math.floor(Math.random() * PRIZES.length);
      setReels([index, index, index]); setWon(PRIZES[index].name);
      setCollection((prev) => prev.includes(PRIZES[index].name) ? prev : [...prev, PRIZES[index].name]);
      setSpinning(false);
    }, 1600);
  }

  return (
    <ExperienceShell title="Virtual prize machine" intro="Spin for a digital collectible. No tickets, no batteries and definitely no actual claw.">
      <div className="mx-auto max-w-sm rounded-2xl border border-gold/30 bg-gradient-to-b from-[#1b3050] to-[#081426] p-6 text-center shadow-[inset_0_0_40px_rgba(216,174,99,0.12)]">
        <p className="eyebrow">Cousins prize co.</p>
        <div className="my-5 grid grid-cols-3 gap-2">
          {reels.map((index, i) => (
            <motion.div key={i} animate={reduce ? undefined : { scaleY: spinning ? [1, 0.7, 1] : 1 }} transition={{ duration: 0.18, repeat: spinning ? Infinity : 0 }}
              className="grid h-24 place-items-center rounded-xl border border-gold/25 bg-[#0c1a30] text-4xl">{PRIZES[index].emoji}</motion.div>
          ))}
        </div>
        <Button onClick={spin} disabled={spinning} className="w-full"><Sparkles /> {spinning ? "Spinning..." : "Spin for a prize"}</Button>
      </div>
      <AnimatePresence>{won && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="mt-5 text-center font-display text-xl text-champagne">You won: {won}!</motion.p>}</AnimatePresence>
      {active && won && !reduce && <Confetti pieces={30} />}
      <div className="mt-5 border-t border-white/8 pt-4 text-center">
        <p className="eyebrow mb-2">Your collection ({collection.length}/{PRIZES.length})</p>
        <div className="flex flex-wrap justify-center gap-2">{PRIZES.map((p) => (
          <span key={p.name} title={p.rarity} className={`rounded-full border px-3 py-1 text-xs ${collection.includes(p.name) ? "border-gold/40 bg-gold/10 text-champagne" : "border-white/10 text-muted/50"}`}>
            {collection.includes(p.name) ? p.emoji : "🔒"} {p.name}
          </span>
        ))}</div>
      </div>
      <ReportButton experienceId="prize-machine" />
    </ExperienceShell>
  );
}
