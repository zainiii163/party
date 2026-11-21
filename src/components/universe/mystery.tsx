"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Eye, RefreshCw, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/effects/confetti";
import { BADGES, PREDICTIONS, dailySeed, pick } from "@/lib/universe";
import { CopyButton, ExperienceShell, ReportButton, RevealPanel, hashString, usePageActive, useStoredState, useTicker } from "./shared";

export function CrystalBall() {
  const [seed, setSeed] = useState(0);
  const [show, setShow] = useState(false);
  const reduce = Boolean(useReducedMotion());
  const prediction = pick(PREDICTIONS, hashString(`${dailySeed()}-${seed}`));

  function reveal() {
    setShow(false);
    setSeed((v) => v + 1);
    window.setTimeout(() => setShow(true), reduce ? 0 : 400);
  }

  return (
    <ExperienceShell title="The crystal ball has opinions" intro="Ask the ball about your winter future. Predictions are 100% certified nonsense and 100% good luck.">
      <div className="flex flex-col items-center gap-5">
        <motion.button type="button" onClick={reveal} aria-label="Ask the crystal ball"
          animate={reduce ? undefined : { scale: [1, 1.03, 1] }} transition={{ duration: 2.4, repeat: Infinity }}
          className="relative grid size-52 place-items-center rounded-full border border-gold/30 bg-[radial-gradient(circle_at_35%_30%,rgba(216,174,99,0.45),rgba(16,31,53,0.95)_65%)] shadow-[0_0_60px_-15px_rgba(216,174,99,0.6)]">
          <span className="text-6xl drop-shadow-[0_0_18px_rgba(242,215,160,0.8)]">🔮</span>
          <span aria-hidden className="absolute inset-4 rounded-full border border-white/10" />
        </motion.button>
        <Button onClick={reveal}><Eye /> Ask again</Button>
        <AnimatePresence mode="wait">
          {show && (
            <motion.div key={prediction} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, rotateX: -10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0 }}
              className="max-w-md rounded-xl border border-gold/25 bg-gold/8 p-5 text-center">
              <p className="eyebrow">The ball says</p>
              <p className="mt-2 font-display text-lg text-champagne">{prediction}</p>
              <CopyButton text={prediction} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ReportButton experienceId="crystal-ball" />
    </ExperienceShell>
  );
}

export function SecretVault() {
  const [found, setFound] = useStoredState<string[]>("universe.vault.badges", []);
  const [peek, setPeek] = useState<string | null>(null);
  const reduce = Boolean(useReducedMotion());
  const active = usePageActive();
  const order = useMemo(() => [...BADGES].sort((a, b) => hashString(`${dailySeed()}-${a.id}`) - hashString(`${dailySeed()}-${b.id}`)), []);

  function open(badgeId: string) {
    setPeek(badgeId);
    if (!found.includes(badgeId)) setFound((prev) => [...prev, badgeId]);
  }

  const allFound = found.length === BADGES.length;

  return (
    <ExperienceShell title="The secret vault" intro="Six tiles, six hidden badges. Tap carefully — this room keeps its treasures in surprising places. Progress stays on this device only.">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {order.map((badge, index) => {
          const isFound = found.includes(badge.id);
          return (
            <motion.button key={badge.id} type="button" onClick={() => open(badge.id)} aria-label={`Inspect tile ${index + 1}${isFound ? `, found ${badge.name}` : ""}`}
              whileHover={reduce ? undefined : { y: -4 }} whileTap={reduce ? undefined : { scale: 0.94 }}
              className="grid aspect-square place-items-center rounded-xl border border-gold/20 bg-gradient-to-br from-[#172840] to-[#0a1526] text-3xl text-champagne">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={isFound ? badge.id : "hidden"} initial={reduce ? { opacity: 0 } : { opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0 }}>{isFound ? badge.emoji : "❔"}</motion.span>
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted">{found.length} / {BADGES.length} badges found · {peek ? BADGES.find((b) => b.id === peek)?.name : "Tap a tile"}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {BADGES.map((badge) => (
          <span key={badge.id} title={badge.hint} className={`rounded-full border px-3 py-1 text-xs ${found.includes(badge.id) ? "border-gold/40 bg-gold/10 text-champagne" : "border-white/10 text-muted/60"}`}>
            {found.includes(badge.id) ? badge.emoji : "🔒"} {badge.name}
          </span>
        ))}
      </div>
      {allFound && active && !reduce && <Confetti pieces={36} />}
      {allFound && <p className="mt-4 text-center font-display text-lg text-champagne">Vault complete — you found every badge! ✨</p>}
      <ReportButton experienceId="secret-vault" />
    </ExperienceShell>
  );
}

type RevealState = {
  visible: boolean;
  title: string;
  message: string;
  unlockAt: string | null;
};

function remainingText(target: string | null): string {
  if (!target) return "";
  const diff = Date.parse(target) - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) return "";
  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return days ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m ${secs}s`;
}

export function MidnightMessage({ reveal }: { reveal: RevealState | null }) {
  const [, force] = useState(0);
  const [local, setLocal] = useState<RevealState | null>(reveal);
  const reduce = Boolean(useReducedMotion());
  useTicker(() => force((v) => v + 1), 1000, Boolean(local?.visible && local.unlockAt));

  async function checkAgain() {
    try {
      const res = await fetch("/api/universe", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) return;
      setLocal({
        visible: Boolean(json.config?.reveal),
        title: json.config?.reveal?.title ?? "A surprise is being prepared",
        message: json.config?.reveal?.message ?? "",
        unlockAt: json.config?.revealUnlockAt ?? null,
      });
    } catch { /* keep the last known state */ }
  }

  const unlocked = Boolean(local?.visible && (!local.unlockAt || Date.parse(local.unlockAt) <= Date.now()));

  return (
    <ExperienceShell title="The midnight message" intro="A sealed note the organizers can unlock at a chosen moment. Until then, even we cannot peek.">
      <div className="mx-auto max-w-lg text-center">
        <motion.div animate={reduce ? undefined : { y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity }}
          className="mx-auto grid size-40 place-items-center rounded-xl border border-gold/30 bg-gradient-to-br from-[#d8ae63]/20 to-[#101f35] text-6xl">
          {unlocked ? "💌" : "🔒"}
        </motion.div>
        <AnimatePresence mode="wait">
          {unlocked ? (
            <motion.div key="open" initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-5 rounded-xl border border-gold/30 bg-gold/8 p-5">
              <p className="eyebrow">Unsealed</p>
              <p className="mt-2 font-display text-xl text-champagne">{local?.title}</p>
              <p className="mt-2 text-sm text-foreground">{local?.message}</p>
            </motion.div>
          ) : (
            <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
              <p className="font-display text-lg text-champagne">{local?.visible ? "Still sealed" : "Nothing scheduled yet"}</p>
              <p className="mt-1 text-xs text-muted">{local?.visible && local.unlockAt ? `Opens in ${remainingText(local.unlockAt)}` : "The organizers have not set the time. Ask them nicely."}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <Button variant="outline" className="mt-5" onClick={checkAgain}><RefreshCw /> Check for the unlock</Button>
      </div>
      <ReportButton experienceId="midnight-message" />
    </ExperienceShell>
  );
}

export function SurpriseReveal({ reveal, unlockAt }: { reveal: { title: string; message: string } | null; unlockAt: string | null }) {
  const [open, setOpen] = useState(false);
  const reduce = Boolean(useReducedMotion());
  const active = usePageActive();
  const ready = Boolean(reveal);
  const countdown = remainingText(unlockAt);

  const revealNow = useCallback(() => setOpen(true), []);

  return (
    <ExperienceShell title="The big surprise" intro="Only the organizers can lift this curtain. When they do, the reveal appears here for everyone at the same time.">
      <div className="relative mx-auto h-64 max-w-xl overflow-hidden rounded-2xl border border-gold/25 bg-[#081426]">
        <div className="absolute inset-0 grid place-items-center px-8 text-center">
          <RevealPanel show={open && ready}>
            <p className="eyebrow">Surprise!</p>
            <p className="mt-2 font-display text-2xl text-champagne">{reveal?.title}</p>
            <p className="mt-2 text-sm text-foreground">{reveal?.message}</p>
          </RevealPanel>
          {!open && <div className="text-center"><p className="text-5xl">🎁</p><p className="mt-3 text-xs text-muted">{ready ? "The organizer has set the surprise" : "Still under wraps"}</p></div>}
        </div>
        <AnimatePresence>
          {!open && (
            <>
              <motion.div key="left" exit={reduce ? { opacity: 0 } : { x: "-100%" }} transition={{ duration: 0.9 }}
                className="absolute inset-y-0 left-0 w-1/2 border-r border-gold/30 bg-gradient-to-r from-[#c99a4d]/40 to-[#172840] p-4">
                <span className="font-display text-2xl text-champagne">✦</span>
              </motion.div>
              <motion.div key="right" exit={reduce ? { opacity: 0 } : { x: "100%" }} transition={{ duration: 0.9 }}
                className="absolute inset-y-0 right-0 w-1/2 border-l border-gold/30 bg-gradient-to-l from-[#c99a4d]/40 to-[#172840] p-4 text-right">
                <span className="font-display text-2xl text-champagne">✦</span>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      {active && open && ready && !reduce && <Confetti pieces={40} />}
      <div className="mt-5 text-center">
        <Button disabled={!ready} onClick={revealNow}>{ready ? "Open the curtain" : <><LockKeyhole /> Waiting for the organizer</>}</Button>
        {countdown && <p className="mt-2 text-xs text-muted">Scheduled for {new Date(unlockAt!).toLocaleString()} · {countdown}</p>}
      </div>
      <ReportButton experienceId="surprise-reveal" />
    </ExperienceShell>
  );
}
