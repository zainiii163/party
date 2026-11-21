"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Sparkles, RotateCcw, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/effects/confetti";
import { GIFT_SURPRISES, dailySeed, pick, safeNickname } from "@/lib/universe";
import { CopyButton, ExperienceShell, ReportButton, SparkleRow, hashString, usePageActive } from "./shared";

function NicknameField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="mb-5 block text-xs text-muted">
      Nickname for this experience (optional)
      <input
        value={value} maxLength={20} onChange={(e) => onChange(e.target.value)}
        placeholder="Cousin" aria-label="Nickname for this experience"
        className="mt-1 w-full max-w-xs rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-gold/60"
      />
    </label>
  );
}

export function MagicalPortal({ surprises }: { surprises: string[] }) {
  const [nickname, setNickname] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const reduce = Boolean(useReducedMotion());
  const active = usePageActive();
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  function enter(index: number) {
    if (open !== null) return;
    setOpen(index);
    setMessage(null);
    const pool = surprises.length ? surprises : GIFT_SURPRISES as readonly string[];
    const gift = pick(pool, hashString(`${dailySeed()}-${safeNickname(nickname)}-${index}`));
    timer.current = window.setTimeout(() => setMessage(gift), reduce ? 0 : 650);
  }

  function reset() { if (timer.current) window.clearTimeout(timer.current); setOpen(null); setMessage(null); }

  return (
    <ExperienceShell title="Choose your doorway" intro="Three golden doors. Each one opens into a different little winter surprise. No wrong answers.">
      <NicknameField value={nickname} onChange={setNickname} />
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <motion.button
            key={index} type="button" onClick={() => enter(index)} disabled={open !== null}
            whileHover={reduce || open !== null ? undefined : { y: -6 }} whileTap={reduce ? undefined : { scale: 0.97 }}
            aria-label={`Open golden door ${index + 1}`}
            className="relative h-52 overflow-hidden rounded-xl border border-gold/30 bg-gradient-to-b from-[#1a2c48] to-[#0a1526] text-champagne"
          >
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_65%,rgba(216,174,99,0.28),transparent_60%)]" />
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2 origin-left border-r border-gold/30 bg-gradient-to-r from-[#d8ae63]/25 to-[#f2d7a0]/10"
              animate={{ rotateY: open === index ? -105 : 0 }} transition={{ duration: reduce ? 0 : 0.8 }}
            />
            <motion.div
              className="absolute inset-y-0 right-0 w-1/2 origin-right border-l border-gold/30 bg-gradient-to-l from-[#d8ae63]/25 to-[#f2d7a0]/10"
              animate={{ rotateY: open === index ? 105 : 0 }} transition={{ duration: reduce ? 0 : 0.8 }}
            />
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-4xl">{open === index ? "✨" : "🚪"}</span>
            <span className="absolute inset-x-0 bottom-4 text-[10px] uppercase tracking-[0.25em] text-muted">Door {index + 1}</span>
          </motion.button>
        ))}
      </div>
      <div className="mt-5 min-h-28 text-center">
        <AnimatePresence mode="wait">
          {message && (
            <motion.div key={message} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="relative mx-auto max-w-md rounded-xl border border-gold/25 bg-gold/8 p-5">
              {active && !reduce && <Confetti pieces={22} />}
              <p className="eyebrow">Your surprise</p>
              <p className="relative mt-2 font-display text-lg text-champagne">{message}</p>
              <CopyButton text={message} label="Copy" />
            </motion.div>
          )}
        </AnimatePresence>
        {open !== null && <Button variant="ghost" size="sm" className="mt-3" onClick={reset}><RotateCcw /> Try another door</Button>}
        {open === null && <SparkleRow />}
      </div>
      <ReportButton experienceId="winter-portal" />
    </ExperienceShell>
  );
}

export function SnowGlobe() {
  const [shakes, setShakes] = useState(0);
  const [tilt, setTilt] = useState(0);
  const reduce = Boolean(useReducedMotion());
  const active = usePageActive();
  const scene = ["⛄", "🌲", "🐧", "🏡"][shakes % 4];
  const flakes = useMemo(() => Array.from({ length: reduce ? 8 : 24 }, (_, i) => ({
    left: `${(i * 37) % 96}%`, delay: `${(i % 7) * 0.32}s`, size: 2 + (i % 4), duration: 2.6 + (i % 5) * 0.7,
  })), [reduce]);

  const shake = useCallback(() => {
    setShakes((v) => v + 1);
    setTilt((v) => v + 1);
  }, []);

  return (
    <ExperienceShell title="Shake the little world" intro="Give the globe a shake (or drag it) and the snow will swirl. After a few shakes, the scene inside changes.">
      <div className="flex flex-col items-center gap-5">
        <motion.div
          key={tilt} initial={reduce ? undefined : { rotate: -7 }} animate={{ rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 8 }}
          onPointerDown={shake} role="button" tabIndex={0} aria-label="Shake the snow globe"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); shake(); } }}
          className="relative size-64 cursor-grab touch-none rounded-full border border-gold/30 bg-[radial-gradient(circle_at_40%_30%,rgba(216,174,99,0.22),rgba(6,16,31,0.9))] shadow-[inset_0_0_40px_rgba(216,174,99,0.18)] active:cursor-grabbing sm:size-72"
        >
          <div className="absolute inset-x-4 bottom-5 top-8 overflow-hidden rounded-t-full rounded-b-[45%]">
            {active && flakes.map((flake, i) => (
              <span key={i} aria-hidden className="snowflake absolute top-[-10%] rounded-full bg-white/80"
                style={{ left: flake.left, width: flake.size, height: flake.size, animationDelay: flake.delay, animationDuration: `${flake.duration}s` }} />
            ))}
            <motion.div key={scene} initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }} className="absolute inset-x-0 bottom-4 text-center text-6xl drop-shadow-[0_0_20px_rgba(216,174,99,0.5)]">
              {scene}
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 h-10 rounded-b-[45%] bg-gradient-to-t from-white/25 to-transparent" />
          </div>
          <div className="absolute inset-x-6 bottom-1 h-4 rounded-b-xl border-b border-gold/40 bg-gradient-to-b from-[#d8ae63]/70 to-[#7c5c2c]" />
        </motion.div>
        <Button onClick={shake}><Sparkles /> Shake it!</Button>
        <p className="text-center text-xs text-muted">Shakes: {shakes} · {shakes >= 3 ? "The little world is getting lively!" : "Keep going..."}</p>
      </div>
      <ReportButton experienceId="snow-globe" />
    </ExperienceShell>
  );
}

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };

export function RsvpFireworks({ confirmed, nickname }: { confirmed: boolean; nickname: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const frame = useRef<number | null>(null);
  const [burst, setBurst] = useState(0);
  const reduce = Boolean(useReducedMotion());
  const active = usePageActive();

  const launch = useCallback(() => {
    setBurst((v) => v + 1);
    const colors = ["#D8AE63", "#F2D7A0", "#72C7A1", "#F8F5EF"];
    const cx = 0.5;
    const cy = 0.42;
    particles.current = Array.from({ length: reduce ? 14 : 90 }, (_, i) => {
      const angle = (i * 137.5 * Math.PI) / 180;
      const speed = 0.0015 + (i % 7) * 0.00035;
      return { x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color: colors[i % colors.length] };
    });
  }, [reduce]);

  useEffect(() => {
    if (!active || !burst || !canvas.current) return;
    const context = canvas.current.getContext("2d");
    if (!context) return;
    const draw = () => {
      const { width, height } = canvas.current!;
      context.clearRect(0, 0, width, height);
      let alive = false;
      for (const p of particles.current) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx * 16; p.y += p.vy * 16; p.life -= reduce ? 0.08 : 0.014;
        context.globalAlpha = Math.max(0, p.life);
        context.fillStyle = p.color;
        context.beginPath();
        context.arc(p.x * width, p.y * height, 2.5, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      if (alive) frame.current = window.requestAnimationFrame(draw);
    };
    draw();
    return () => { if (frame.current) window.cancelAnimationFrame(frame.current); };
  }, [burst, active, reduce]);

  return (
    <ExperienceShell title="A sky just for you" intro={confirmed ? `Confirmed, ${safeNickname(nickname, "cousin")}! Launch a little celebration in gold and champagne.` : "Launch a preview celebration. RSVP first and we will personalize the sky with your nickname."}>
      <div className="relative h-64 overflow-hidden rounded-xl border border-gold/20 bg-[radial-gradient(circle_at_50%_80%,rgba(65,109,158,0.35),#040a14_70%)]">
        <canvas ref={canvas} className="size-full" aria-hidden />
        {burst > 0 && !reduce && <Confetti key={burst} pieces={30} />}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-3xl">🏡✨🏡</div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={launch}><PartyPopper /> Launch fireworks</Button>
        <span className="text-xs text-muted">{confirmed ? "RSVP status: confirmed ✓" : "RSVP to unlock your personalized sky"}</span>
      </div>
      <ReportButton experienceId="rsvp-fireworks" />
    </ExperienceShell>
  );
}

export function MysteryGift({ surprises }: { surprises: string[] }) {
  const pool = surprises.length ? surprises : GIFT_SURPRISES as readonly string[];
  const [opened, setOpened] = useState(false);
  const reduce = Boolean(useReducedMotion());
  const gift = useMemo(() => pick(pool, dailySeed()), [pool]);
  const active = usePageActive();

  return (
    <ExperienceShell title="Today's box is sealed" intro="One gift per day, chosen by the calendar. Come back tomorrow for a different surprise.">
      <div className="flex flex-col items-center gap-5">
        <motion.button
          type="button" onClick={() => setOpened(true)} disabled={opened} aria-label="Open today's gift box"
          whileHover={reduce || opened ? undefined : { y: -6, rotate: -2 }} whileTap={reduce ? undefined : { scale: 0.95 }}
          className="relative grid size-40 place-items-center rounded-2xl border border-gold/35 bg-gradient-to-br from-[#d8ae63]/25 to-[#172840] text-6xl shadow-[0_18px_45px_-20px_rgba(216,174,99,0.8)]"
        >
          {opened ? "🎉" : "🎁"}
          {!opened && <motion.span aria-hidden className="absolute -top-4 animate-float text-3xl" style={{ animationDelay: "0.4s" }}>✨</motion.span>}
        </motion.button>
        <AnimatePresence mode="wait">
          {opened ? (
            <motion.div key="gift" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }} className="relative max-w-md rounded-xl border border-gold/25 bg-gold/8 p-5 text-center">
              {active && !reduce && <Confetti pieces={26} />}
              <p className="eyebrow">Inside the box</p>
              <p className="relative mt-2 font-display text-lg text-champagne">{gift}</p>
              <CopyButton text={gift} />
            </motion.div>
          ) : <Button variant="outline" onClick={() => setOpened(true)}>Open the box</Button>}
        </AnimatePresence>
      </div>
      <ReportButton experienceId="mystery-gift" />
    </ExperienceShell>
  );
}
