"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Download, Shuffle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPLIMENTS, COURT_CASES, SAFE_ROASTS, REACTIONS, WANTED_DESCRIPTORS, pick, safeNickname } from "@/lib/universe";
import { CopyButton, ExperienceShell, ReportButton, hashString, useStoredState } from "./shared";

export function WantedPosters() {
  const [nickname, setNickname] = useState("");
  const [descriptor, setDescriptor] = useState<string>(WANTED_DESCRIPTORS[0]);
  const reduce = Boolean(useReducedMotion());

  const poster = useMemo(() => ({
    name: safeNickname(nickname, "A Very Mysterious Cousin"),
    descriptor,
    reward: "One warm hug and a seat by the fire",
  }), [nickname, descriptor]);

  function download() {
    const canvas = document.createElement("canvas");
    canvas.width = 800; canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 0, 1000);
    gradient.addColorStop(0, "#172840"); gradient.addColorStop(1, "#081426");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 800, 1000);
    ctx.strokeStyle = "#d8ae63"; ctx.lineWidth = 8; ctx.strokeRect(30, 30, 740, 940);
    ctx.textAlign = "center"; ctx.fillStyle = "#d8ae63";
    ctx.font = "bold 42px Georgia, serif"; ctx.fillText("WANTED", 400, 130);
    ctx.fillStyle = "#f2d7a0"; ctx.font = "bold 64px Georgia, serif";
    ctx.fillText(poster.name, 400, 260, 700);
    ctx.font = "48px serif"; ctx.fillText("🤶", 400, 450);
    ctx.fillStyle = "#f8f5ef"; ctx.font = "34px Arial, sans-serif";
    ctx.fillText(poster.descriptor, 400, 590, 680);
    ctx.fillStyle = "#a8b5c8"; ctx.font = "26px Arial, sans-serif";
    ctx.fillText("REWARD", 400, 760);
    ctx.fillStyle = "#f2d7a0"; ctx.font = "30px Arial, sans-serif";
    ctx.fillText(poster.reward, 400, 810, 680);
    ctx.fillStyle = "#a8b5c8"; ctx.font = "20px Arial, sans-serif";
    ctx.fillText("Cousins Winter Reunion 2026 · all in good fun", 400, 920);
    const link = document.createElement("a");
    link.download = `cousins-wanted-${poster.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <ExperienceShell title="Wanted: one legendary cousin" intro="Build a silly poster from opt-in nicknames and pre-written, family-safe descriptions. Download it and show the room.">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <label className="block text-xs text-muted">Nickname (optional)
            <input value={nickname} maxLength={24} onChange={(e) => setNickname(e.target.value)} aria-label="Poster nickname"
              className="mt-1 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-gold/60" />
          </label>
          <div>
            <p className="text-xs text-muted">Pick the charge</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {WANTED_DESCRIPTORS.map((line) => (
                <button key={line} type="button" onClick={() => setDescriptor(line)} aria-pressed={descriptor === line}
                  className={`rounded-full border px-3 py-1.5 text-left text-xs transition ${descriptor === line ? "border-gold bg-gold/20 text-champagne" : "border-white/12 text-muted hover:border-gold/40"}`}>
                  {line}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={download}><Download /> Download poster</Button>
          <p className="text-[10px] text-muted/70">Only a nickname is used. No full names, ages or contact details.</p>
        </div>
        <motion.div key={`${poster.name}-${poster.descriptor}`} initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: -2, y: 12 }}
          animate={{ opacity: 1, rotate: 0, y: 0 }} className="rounded-xl border-4 border-double border-gold/50 bg-[#102039] p-6 text-center">
          <p className="font-display text-5xl tracking-widest text-gold">WANTED</p>
          <p className="mt-4 font-display text-2xl text-champagne">{poster.name}</p>
          <p className="my-3 text-5xl">🕵️</p>
          <p className="text-sm text-foreground">{poster.descriptor}</p>
          <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-muted">Reward · {poster.reward}</p>
        </motion.div>
      </div>
      <ReportButton experienceId="wanted-posters" />
    </ExperienceShell>
  );
}

export function CousinsCourt() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [verdict, setVerdict] = useState<"guilty" | "innocent" | null>(null);
  const [tally, setTally] = useStoredState<Record<string, number>>("universe.court.tally", {});
  const reduce = Boolean(useReducedMotion());
  const current = COURT_CASES[caseIndex];
  const key = current.charge;
  const guilty = tally[key] ?? 0;
  const innocent = tally[`${key}:innocent`] ?? 0;

  function vote(side: "guilty" | "innocent") {
    setVerdict(side);
    setTally((prev) => ({ ...prev, [side === "guilty" ? key : `${key}:innocent`]: (side === "guilty" ? guilty : innocent) + 1 }));
  }

  function nextCase() { setCaseIndex((i) => (i + 1) % COURT_CASES.length); setVerdict(null); }

  return (
    <ExperienceShell title="Cousins Ki Adalat" intro="A completely unserious court for extremely serious crimes, like stealing the last samosa. Vote and watch the verdict drop.">
      <div className="rounded-xl border border-gold/20 bg-white/3 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Case {caseIndex + 1} of {COURT_CASES.length}</p>
          <motion.span key={verdict ?? caseIndex} animate={reduce ? undefined : { rotate: verdict ? [0, -35, 20, 0] : 0 }} transition={{ duration: 0.6 }} className="text-3xl">⚖️</motion.span>
        </div>
        <p className="mt-3 font-display text-xl text-champagne">&ldquo;{current.charge}&rdquo;</p>
        <p className="mt-2 text-sm text-muted">Defence: {current.defence}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => vote("guilty")}>Guilty</Button>
          <Button variant="outline" onClick={() => vote("innocent")}>Innocent</Button>
          <Button variant="ghost" onClick={nextCase}><Shuffle /> Next case</Button>
        </div>
        <AnimatePresence mode="wait">
          {verdict && (
            <motion.div key={verdict} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="mt-5 rounded-xl border border-gold/30 bg-gold/10 p-4 text-center">
              <p className="font-display text-lg text-champagne">{verdict === "guilty" ? current.guilty : current.innocent}</p>
              <p className="mt-1 text-xs text-muted">Court tally · Guilty {guilty} / Innocent {innocent}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ReportButton experienceId="cousins-court" />
    </ExperienceShell>
  );
}

export function RoastGenerator() {
  const [nickname, setNickname] = useState("");
  const [seed, setSeed] = useState(0);
  const reduce = Boolean(useReducedMotion());
  const roast = pick(SAFE_ROASTS, hashString(`${nickname}-${seed}`));

  return (
    <ExperienceShell title="Friendly roast generator" intro="The kind of teasing that ends in laughter. Every line is pre-written by the organizers, so nothing can get mean.">
      <div className="flex flex-wrap gap-3">
        <input value={nickname} maxLength={20} onChange={(e) => setNickname(e.target.value)} aria-label="Nickname for the roast"
          placeholder="Nickname (optional)" className="rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-gold/60" />
        <Button onClick={() => setSeed((v) => v + 1)}><Shuffle /> Roast me gently</Button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`${roast}-${seed}`} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, rotateX: -12 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0 }} className="mt-5 min-h-24 rounded-xl border border-gold/20 bg-gold/5 p-5">
          <p className="text-lg text-champagne">{safeNickname(nickname, "Cousin")}, {roast.charAt(0).toLowerCase() + roast.slice(1)}</p>
        </motion.div>
      </AnimatePresence>
      <CopyButton text={`${safeNickname(nickname, "Cousin")}: ${roast}`} />
      <ReportButton experienceId="roast-generator" />
    </ExperienceShell>
  );
}

type FloatReaction = { id: number; emoji: string; x: number };

export function ReactionStorm() {
  const [items, setItems] = useState<FloatReaction[]>([]);
  const [combo, setCombo] = useState(0);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);
  const reduce = Boolean(useReducedMotion());

  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);

  function react(emoji: string) {
    const id = nextId.current++;
    setItems((prev) => [...prev.slice(-18), { id, emoji, x: 10 + Math.random() * 80 }]);
    setCombo((v) => v + 1);
    if (!reduce) {
      const timer = window.setTimeout(() => setItems((prev) => prev.filter((item) => item.id !== id)), 1800);
      timers.current.push(timer);
    }
  }

  return (
    <ExperienceShell title="Reaction storm" intro="Tap an emoji and it floats up like a tiny weather system. Build a combo with your cousins beside you.">
      <div className="relative h-56 overflow-hidden rounded-xl border border-gold/20 bg-[radial-gradient(circle_at_50%_100%,rgba(216,174,99,0.16),transparent_70%)]">
        <div className="absolute inset-x-0 bottom-3 z-10 flex flex-wrap justify-center gap-2">
          {REACTIONS.map((emoji) => (
            <button key={emoji} type="button" onClick={() => react(emoji)} aria-label={`React with ${emoji}`}
              className="grid size-10 place-items-center rounded-full border border-gold/25 bg-[#101f35]/90 text-xl transition hover:scale-110 hover:border-gold">
              {emoji}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {items.map((item) => (
            <motion.span key={item.id} aria-hidden initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: reduce ? -30 : -190, scale: reduce ? 1 : 1.6, x: (item.x - 50) / 3 }}
              exit={{ opacity: 0 }} transition={{ duration: reduce ? 0.3 : 1.8, ease: "easeOut" }}
              className="absolute bottom-12 text-3xl" style={{ left: `${item.x}%` }}>{item.emoji}</motion.span>
          ))}
        </AnimatePresence>
      </div>
      <p className="mt-4 text-center text-sm text-champagne">Combo: {combo} {combo >= 10 ? "· Storm warning! 🌪️" : ""}</p>
      <ReportButton experienceId="reaction-storm" />
    </ExperienceShell>
  );
}

export function ComplimentDelivery({ cousins }: { cousins: { id: string; nickname: string }[] }) {
  const [recipient, setRecipient] = useState("");
  const [compliment, setCompliment] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [seed, setSeed] = useState(0);
  const reduce = Boolean(useReducedMotion());
  const choices = cousins.filter((c) => c.nickname).slice(0, 60);
  const name = safeNickname(recipient, "a very special cousin");

  function deliver() {
    setCompliment(pick(COMPLIMENTS, hashString(`${name}-${seed}-${Date.now()}`)));
    setOpened(false);
    window.setTimeout(() => setOpened(true), reduce ? 0 : 450);
  }

  return (
    <ExperienceShell title="A secret compliment, delivered" intro="Choose a cousin who opted in to the public board, or keep it anonymous. The message is pre-written, kind, and never stored.">
      <div className="flex flex-wrap gap-3">
        <select value={recipient} onChange={(e) => setRecipient(e.target.value)} aria-label="Choose a recipient"
          className="rounded-xl border border-white/12 bg-[#101f35] px-3 py-2 text-sm text-foreground outline-none focus:border-gold/60">
          <option value="">Someone special (anonymous)</option>
          {choices.map((c) => <option key={c.id} value={c.nickname}>{c.nickname}</option>)}
        </select>
        <Button onClick={deliver}><Send /> Deliver compliment</Button>
        <Button variant="ghost" onClick={() => setSeed((v) => v + 1)}><Shuffle /> New note</Button>
      </div>
      <div className="mt-6 flex justify-center">
        <motion.div key={`${compliment}-${seed}`} animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
          className="relative grid h-44 w-72 place-items-center rounded-xl border border-gold/30 bg-gradient-to-br from-[#d8ae63]/20 to-[#101f35] text-center">
          <span aria-hidden className="text-5xl">{opened ? "💌" : "✉️"}</span>
          <AnimatePresence>
            {opened && compliment && (
              <motion.p initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute inset-x-4 bottom-4 rounded-lg bg-[#081426]/90 p-3 text-xs text-champagne">
                {name}: {compliment}
              </motion.p>
            )}
          </AnimatePresence>
          {!compliment && <p className="absolute bottom-4 text-[10px] uppercase tracking-widest text-muted">Sealed with kindness</p>}
        </motion.div>
      </div>
      {compliment && <div className="mt-4 text-center"><CopyButton text={`${name}: ${compliment}`} /></div>}
      <ReportButton experienceId="compliment-delivery" />
    </ExperienceShell>
  );
}
