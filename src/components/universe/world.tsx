"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Download, Moon, Sun, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STAR_LABELS, VILLAGE_SPOTS, pick } from "@/lib/universe";
import { ExperienceShell, ReportButton, SparkleRow, hashString, usePageActive, useStoredState } from "./shared";

export function CousinsGalaxy({ cousins }: { cousins: { id: string; nickname: string }[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const reduce = Boolean(useReducedMotion());
  const active = usePageActive();
  const stars = useMemo(() => cousins.filter((c) => c.nickname).slice(0, 60).map((c) => {
    const hash = hashString(`${c.id}-${c.nickname}`);
    return { ...c, x: 6 + (hash % 88), y: 8 + (hash % 72), size: 2 + (hash % 4), label: pick(STAR_LABELS, hash) };
  }), [cousins]);
  const dust = useMemo(() => Array.from({ length: 46 }, (_, i) => ({
    left: `${(i * 47) % 98}%`, top: `${(i * 29) % 92}%`, delay: `${(i % 8) * 0.4}s`,
  })), []);

  return (
    <ExperienceShell title="The Cousins Galaxy" intro="Every star is a cousin who ticked 'show my nickname on the public board'. Tap a star to meet them.">
      <div className="relative h-80 overflow-hidden rounded-xl border border-gold/20 bg-[radial-gradient(circle_at_50%_50%,rgba(65,109,158,0.35),#040a14_72%)]">
        {active && dust.map((dot, i) => <span key={i} aria-hidden className="animate-twinkle absolute size-1 rounded-full bg-white/70"
          style={{ left: dot.left, top: dot.top, animationDelay: dot.delay }} />)}
        {stars.map((star) => (
          <motion.button key={star.id} type="button" onClick={() => setSelected(`${star.nickname} — ${star.label}`)}
            aria-label={`Star for ${star.nickname}`}
            animate={reduce ? undefined : { opacity: [0.65, 1, 0.65], scale: [1, 1.3, 1] }}
            transition={{ duration: 2.4 + (hashString(star.id) % 20) / 10, repeat: Infinity }}
            className="group absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={{ left: `${star.x}%`, top: `${star.y}%` }}>
            <span className="rounded-full bg-champagne shadow-[0_0_12px_4px_rgba(242,215,160,0.5)]" style={{ width: star.size * 3, height: star.size * 3 }} />
            <span className="pointer-events-none absolute top-5 whitespace-nowrap rounded-full bg-[#081426]/90 px-2 py-1 text-[10px] text-champagne opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">{star.nickname}</span>
          </motion.button>
        ))}
        {!stars.length && <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <p className="text-sm text-muted">No stars yet. Cousins who opt in on the public board will shine here.</p>
        </div>}
      </div>
      <AnimatePresence mode="wait">
        {selected && <motion.p key={selected} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="mt-4 text-center font-display text-lg text-champagne">✦ {selected}</motion.p>}
      </AnimatePresence>
      {!selected && <div className="mt-4"><SparkleRow /></div>}
      <ReportButton experienceId="cousins-galaxy" />
    </ExperienceShell>
  );
}

type AvatarLook = { skin: string; coat: string; hat: string; scarf: string; accessory: string };
const SKINS = ["#f2c9a0", "#d99b6c", "#a86a45", "#75452f"];
const COATS = ["#d8ae63", "#416d9e", "#72c7a1", "#b56c6c"];
const HATS = ["#f8f5ef", "#d8ae63", "#72c7a1"];
const SCARVES = ["#b56c6c", "#416d9e", "#f2d7a0"];
const ACCESSORIES = ["🎿", "🧤", "🎧", "☕"];
const DEFAULT_LOOK: AvatarLook = { skin: SKINS[0], coat: COATS[0], hat: HATS[0], scarf: SCARVES[0], accessory: ACCESSORIES[0] };

export function WinterAvatars() {
  const [look, setLook] = useStoredState<AvatarLook>("universe.avatar", DEFAULT_LOOK);
  const reduce = Boolean(useReducedMotion());

  function downloadSvg() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="400" height="480">
      <rect width="200" height="240" rx="24" fill="#101f35"/>
      <circle cx="100" cy="210" r="70" fill="#d8ae63" opacity="0.08"/>
      <ellipse cx="100" cy="190" rx="54" ry="46" fill="${look.coat}"/>
      <rect x="78" y="150" width="44" height="24" rx="10" fill="${look.scarf}"/>
      <circle cx="100" cy="104" r="48" fill="${look.skin}"/>
      <circle cx="83" cy="100" r="4" fill="#0b1a2e"/><circle cx="117" cy="100" r="4" fill="#0b1a2e"/>
      <path d="M88 120 Q100 130 112 120" stroke="#0b1a2e" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M48 70 Q100 6 152 70 Z" fill="${look.hat}"/>
      <rect x="40" y="66" width="120" height="16" rx="8" fill="${look.hat}"/>
      <circle cx="100" cy="16" r="12" fill="#f8f5ef"/>
      <text x="100" y="232" text-anchor="middle" font-family="Arial" font-size="11" fill="#f2d7a0">Cousins Winter Reunion 2026</text>
    </svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const link = document.createElement("a");
    link.href = url; link.download = "cousins-winter-avatar.svg"; link.click();
    URL.revokeObjectURL(url);
  }

  const swatches = (options: string[], key: keyof AvatarLook) => (
    <div className="flex flex-wrap gap-2">{options.map((option) => (
      <button key={option} type="button" onClick={() => setLook((prev) => ({ ...prev, [key]: option }))}
        aria-label={`Choose ${key} ${option}`} aria-pressed={look[key] === option}
        className={`size-8 rounded-full border-2 transition ${look[key] === option ? "border-champagne scale-110" : "border-white/20"}`}
        style={{ background: key === "accessory" ? "#172840" : option }}>
        {key === "accessory" ? option : <span className="sr-only">{option}</span>}
      </button>
    ))}</div>
  );

  return (
    <ExperienceShell title="Build your winter cousin" intro="Mix a coat, hat, scarf and accessory into your own little cartoon cousin. Your design is saved on this device only.">
      <div className="grid gap-6 sm:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div><p className="eyebrow mb-2">Skin tone</p>{swatches(SKINS, "skin")}</div>
          <div><p className="eyebrow mb-2">Coat</p>{swatches(COATS, "coat")}</div>
          <div><p className="eyebrow mb-2">Hat</p>{swatches(HATS, "hat")}</div>
          <div><p className="eyebrow mb-2">Scarf</p>{swatches(SCARVES, "scarf")}</div>
          <div><p className="eyebrow mb-2">Accessory</p>{swatches(ACCESSORIES, "accessory")}</div>
        </div>
        <motion.div animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity }}
          className="grid place-items-center rounded-xl border border-gold/20 bg-[#0c1a30] p-3">
          <svg viewBox="0 0 200 240" className="w-full max-w-56" role="img" aria-label="Your winter cartoon avatar">
            <rect width="200" height="240" rx="24" fill="#101f35" />
            <circle cx="100" cy="210" r="70" fill="#d8ae63" opacity="0.08" />
            <ellipse cx="100" cy="190" rx="54" ry="46" fill={look.coat} />
            <rect x="78" y="150" width="44" height="24" rx="10" fill={look.scarf} />
            <circle cx="100" cy="104" r="48" fill={look.skin} />
            <circle cx="83" cy="100" r="4" fill="#0b1a2e" /><circle cx="117" cy="100" r="4" fill="#0b1a2e" />
            <path d="M88 120 Q100 130 112 120" stroke="#0b1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M48 70 Q100 6 152 70 Z" fill={look.hat} />
            <rect x="40" y="66" width="120" height="16" rx="8" fill={look.hat} />
            <circle cx="100" cy="16" r="12" fill="#f8f5ef" />
            <text x="168" y="188" textAnchor="middle" fontSize="32">{look.accessory}</text>
          </svg>
          <Button variant="outline" className="mt-3" onClick={downloadSvg}><Download /> Download SVG</Button>
        </motion.div>
      </div>
      <ReportButton experienceId="winter-avatars" />
    </ExperienceShell>
  );
}

export function ReunionVillage() {
  const [night, setNight] = useState(false);
  const [spot, setSpot] = useState<string | null>(null);
  const reduce = Boolean(useReducedMotion());
  const active = usePageActive();

  return (
    <ExperienceShell title="The little reunion village" intro="Six tiny houses, six tiny secrets. Switch between day and snowy night, then knock on a door.">
      <div className="mb-4 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={() => setNight((v) => !v)}>{night ? <Sun /> : <Moon />} {night ? "Daytime" : "Snowy night"}</Button>
        <span className="self-center text-xs text-muted">{night ? "The village lights are on." : "The village is awake."}</span>
      </div>
      <div className={`relative overflow-hidden rounded-xl border border-gold/20 p-5 transition-colors duration-700 ${night ? "bg-[#060f1e]" : "bg-[linear-gradient(180deg,#1b3050,#0a1526)]"}`}>
        <div aria-hidden className="absolute inset-x-0 top-0 h-16 bg-[radial-gradient(circle_at_80%_20%,rgba(242,215,160,0.35),transparent_35%)]" />
        {active && Array.from({ length: 18 }, (_, i) => (
          <span key={i} aria-hidden className="animate-float absolute size-1 rounded-full bg-white/60"
            style={{ left: `${(i * 37) % 96}%`, top: `${(i * 23) % 80}%`, animationDelay: `${i * 0.3}s` }} />
        ))}
        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3">
          {VILLAGE_SPOTS.map((item, i) => (
            <motion.button key={item.id} type="button" onClick={() => setSpot(item.name)} aria-label={`Visit ${item.name}`}
              animate={reduce ? undefined : { y: [0, -5, 0] }} transition={{ duration: 3 + i * 0.4, repeat: Infinity }}
              className="rounded-xl border border-gold/20 bg-[#101f35]/85 p-4 text-center text-champagne transition hover:border-gold/60">
              <span className="text-4xl">{item.emoji}</span>
              <span className="mt-2 block text-xs">{item.name}</span>
              {night && <span className="mt-1 block text-[10px] text-gold">✦ light on</span>}
            </motion.button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        {spot && <motion.p key={spot} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="mt-4 text-center text-sm text-champagne">{VILLAGE_SPOTS.find((s) => s.name === spot)?.secret}</motion.p>}
      </AnimatePresence>
      <ReportButton experienceId="reunion-village" />
    </ExperienceShell>
  );
}

export function PenguinGuide({ cousinsCount }: { cousinsCount: number }) {
  const [tip, setTip] = useState(0);
  const [walking, setWalking] = useState(false);
  const reduce = Boolean(useReducedMotion());
  const active = usePageActive();
  const tips = [
    "Welcome to the reunion! I am the official guide. I have no idea why.",
    "Pro tip: the best photos happen when nobody says 'cheese'.",
    `There are ${cousinsCount} cousin stars in the galaxy. I counted twice.`,
    "If a dance-off breaks out, do not fight it. Join it.",
    "Hot chocolate is a food group. I am not taking questions.",
    "Remember: the last samosa belongs to whoever tells the best story.",
  ];

  return (
    <ExperienceShell title="Your penguin party guide" intro="Small, stylish and extremely confident. Tap along as Pip the penguin gives the tour.">
      <div className="grid gap-6 sm:grid-cols-[160px_1fr] sm:items-center">
        <motion.div animate={reduce || !active ? undefined : { x: walking ? [0, 18, 0] : 0, rotate: walking ? [0, -6, 0, 6, 0] : 0 }}
          transition={{ duration: 1.2, repeat: walking ? Infinity : 0 }} className="text-center text-8xl" role="img" aria-label="Pip the penguin">🐧</motion.div>
        <div>
          <AnimatePresence mode="wait">
            <motion.div key={tip} initial={reduce ? { opacity: 0 } : { opacity: 0, x: 18, rotate: 1 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -18 }}
              className="relative rounded-2xl border border-gold/25 bg-gold/8 p-5">
              <p className="eyebrow mb-2">Pip says</p>
              <p className="text-sm text-champagne sm:text-base">{tips[tip]}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => setTip((v) => (v + 1) % tips.length)}><ChevronsRight /> Next tip</Button>
            <Button variant="outline" onClick={() => setWalking((v) => !v)}>{walking ? "Make Pip stop" : "Make Pip waddle"}</Button>
          </div>
        </div>
      </div>
      <ReportButton experienceId="penguin-guide" />
    </ExperienceShell>
  );
}
