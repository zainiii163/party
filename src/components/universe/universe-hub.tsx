"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Sparkles, LockKeyhole, X } from "lucide-react";
import { Progress } from "@/components/ui/misc";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/misc";
import {
  EXPERIENCES, EXPERIENCE_GROUPS, type ExperienceGroup, type ExperienceId, type UniverseConfig,
} from "@/lib/universe";
import type { PublicPhoto } from "@/lib/data";
import { useStoredState } from "./shared";

const loading = () => <div className="skeleton h-72 rounded-2xl" />;

// Demanding scenes are downloaded only when a visitor actually opens them.
const MagicalPortal = dynamic(() => import("./gateway").then((m) => m.MagicalPortal), { ssr: false, loading });
const SnowGlobe = dynamic(() => import("./gateway").then((m) => m.SnowGlobe), { ssr: false, loading });
const RsvpFireworks = dynamic(() => import("./gateway").then((m) => m.RsvpFireworks), { ssr: false, loading });
const MysteryGift = dynamic(() => import("./gateway").then((m) => m.MysteryGift), { ssr: false, loading });
const WantedPosters = dynamic(() => import("./antics").then((m) => m.WantedPosters), { ssr: false, loading });
const CousinsCourt = dynamic(() => import("./antics").then((m) => m.CousinsCourt), { ssr: false, loading });
const RoastGenerator = dynamic(() => import("./antics").then((m) => m.RoastGenerator), { ssr: false, loading });
const ReactionStorm = dynamic(() => import("./antics").then((m) => m.ReactionStorm), { ssr: false, loading });
const ComplimentDelivery = dynamic(() => import("./antics").then((m) => m.ComplimentDelivery), { ssr: false, loading });
const CrystalBall = dynamic(() => import("./mystery").then((m) => m.CrystalBall), { ssr: false, loading });
const SecretVault = dynamic(() => import("./mystery").then((m) => m.SecretVault), { ssr: false, loading });
const MidnightMessage = dynamic(() => import("./mystery").then((m) => m.MidnightMessage), { ssr: false, loading });
const SurpriseReveal = dynamic(() => import("./mystery").then((m) => m.SurpriseReveal), { ssr: false, loading });
const SnowballBattle = dynamic(() => import("./playground").then((m) => m.SnowballBattle), { ssr: false, loading });
const SnowRace = dynamic(() => import("./playground").then((m) => m.SnowRace), { ssr: false, loading });
const DanceOff = dynamic(() => import("./playground").then((m) => m.DanceOff), { ssr: false, loading });
const PrizeMachine = dynamic(() => import("./playground").then((m) => m.PrizeMachine), { ssr: false, loading });
const CousinsGalaxy = dynamic(() => import("./world").then((m) => m.CousinsGalaxy), { ssr: false, loading });
const WinterAvatars = dynamic(() => import("./world").then((m) => m.WinterAvatars), { ssr: false, loading });
const ReunionVillage = dynamic(() => import("./world").then((m) => m.ReunionVillage), { ssr: false, loading });
const PenguinGuide = dynamic(() => import("./world").then((m) => m.PenguinGuide), { ssr: false, loading });
const GrandCountdown = dynamic(() => import("./celebration").then((m) => m.GrandCountdown), { ssr: false, loading });
const MemoryWall = dynamic(() => import("./celebration").then((m) => m.MemoryWall), { ssr: false, loading });
const ReunionStorybook = dynamic(() => import("./celebration").then((m) => m.ReunionStorybook), { ssr: false, loading });
const MagicMeter = dynamic(() => import("./celebration").then((m) => m.MagicMeter), { ssr: false, loading });

type Cousin = { id: string; nickname: string };

export function UniverseHub({
  initialConfig, initialCount, cousins, photos, eventDate, confirmed,
}: {
  initialConfig: UniverseConfig;
  initialCount: number;
  cousins: Cousin[];
  photos: PublicPhoto[];
  eventDate: string | null;
  confirmed: boolean;
}) {
  const [config, setConfig] = useState(initialConfig);
  const [magicCount, setMagicCount] = useState(initialCount);
  const [group, setGroup] = useState<ExperienceGroup | "All">("All");
  const [active, setActive] = useState<ExperienceId | null>(null);
  const [nickname] = useStoredState<string>("universe.nickname", "");
  const [visited, setVisited] = useStoredState<string[]>("universe.visited", []);
  const reduce = Boolean(useReducedMotion());

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const res = await fetch("/api/universe", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setMagicCount(Number(json.magicCount) || 0);
        if (json.config) {
          setConfig((prev) => ({
            ...prev,
            enabled: Boolean(json.config.enabled),
            surprises: Array.isArray(json.config.surprises) && json.config.surprises.length ? json.config.surprises : prev.surprises,
            magicGoal: Number(json.config.magicGoal) || prev.magicGoal,
            reveal: json.config.reveal ? { ...json.config.reveal } : { visible: false, title: "", message: "", unlockAt: null },
          }));
        }
      } catch { /* the server-rendered state remains usable */ }
    };
    void refresh();
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { cancelled = true; document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  const visible = useMemo(() => EXPERIENCES.filter((e) =>
    config.enabled && config.experiences[e.id] !== false && (group === "All" || e.group === group)), [config, group]);

  function open(id: ExperienceId) {
    setActive(id);
    setVisited((prev) => prev.includes(id) ? prev : [...prev, id]);
  }

  function renderExperience(id: ExperienceId) {
    switch (id) {
      case "winter-portal": return <MagicalPortal surprises={config.surprises} />;
      case "snow-globe": return <SnowGlobe />;
      case "rsvp-fireworks": return <RsvpFireworks confirmed={confirmed} nickname={nickname} />;
      case "mystery-gift": return <MysteryGift surprises={config.surprises} />;
      case "wanted-posters": return <WantedPosters />;
      case "cousins-court": return <CousinsCourt />;
      case "roast-generator": return <RoastGenerator />;
      case "reaction-storm": return <ReactionStorm />;
      case "compliment-delivery": return <ComplimentDelivery cousins={cousins} />;
      case "crystal-ball": return <CrystalBall />;
      case "secret-vault": return <SecretVault />;
      case "midnight-message": return <MidnightMessage reveal={config.reveal.visible ? config.reveal : null} />;
      case "snowball-battle": return <SnowballBattle />;
      case "snow-race": return <SnowRace />;
      case "dance-off": return <DanceOff />;
      case "prize-machine": return <PrizeMachine />;
      case "cousins-galaxy": return <CousinsGalaxy cousins={cousins} />;
      case "winter-avatars": return <WinterAvatars />;
      case "reunion-village": return <ReunionVillage />;
      case "penguin-guide": return <PenguinGuide cousinsCount={cousins.length} />;
      case "grand-countdown": return <GrandCountdown target={eventDate} />;
      case "memory-wall": return <MemoryWall photos={photos} />;
      case "surprise-reveal": return <SurpriseReveal reveal={config.reveal.visible ? config.reveal : null} unlockAt={config.reveal.unlockAt} />;
      case "reunion-storybook": return <ReunionStorybook />;
      case "magic-meter": return <MagicMeter initialCount={magicCount} goal={config.magicGoal} />;
    }
  }

  const progress = Math.min(100, Math.round((magicCount / Math.max(1, config.magicGoal)) * 100));

  return (
    <section id="universe" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-10 size-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(216,174,99,0.1),transparent_65%)]" />
      <div className="section-shell">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">A universe of little wonders</p>
            <h2 className="font-display text-3xl leading-tight text-foreground sm:text-5xl">
              The Cousins <span className="gold-text">Universe</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              Twenty-five tiny worlds to wander through: magical doors, a shakeable snow globe, a penguin with opinions, a vault of secret badges and a sky full of cousin stars. Everything here is opt-in, playful and safe for the whole family.
            </p>
          </div>
          <div className="w-full max-w-sm rounded-2xl border border-gold/20 bg-[#0c1a30]/70 p-5">
            <div className="flex items-center justify-between text-xs text-muted"><span>Visited {visited.length} of 25</span><span>{magicCount} magic</span></div>
            <Progress value={Math.round((visited.length / EXPERIENCES.length) * 100)} className="mt-3" />
            <div className="mt-3 flex items-center justify-between text-xs text-muted"><span>Community goal</span><span>{progress}%</span></div>
            <Progress value={progress} className="mt-2" />
          </div>
        </div>

        {config.reveal.visible && (
          <motion.button type="button" onClick={() => open("surprise-reveal")}
            animate={reduce ? undefined : { scale: [1, 1.01, 1] }} transition={{ duration: 3, repeat: Infinity }}
            className="mb-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/15 to-transparent px-5 py-4 text-center text-sm text-champagne">
            <Sparkles className="size-4" /> {config.reveal.title} · tap to open <Sparkles className="size-4" />
          </motion.button>
        )}

        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
          {(["All", ...EXPERIENCE_GROUPS] as const).map((item) => (
            <button key={item} type="button" onClick={() => setGroup(item)} aria-pressed={group === item}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${group === item ? "border-gold bg-gold/20 text-champagne" : "border-white/12 text-muted hover:border-gold/40"}`}>
              {item}
            </button>
          ))}
        </div>

        {!config.enabled ? (
          <div className="rounded-2xl border border-dashed border-gold/25 p-12 text-center">
            <LockKeyhole className="mx-auto mb-3 size-8 text-gold" />
            <p className="font-display text-xl text-champagne">The universe is taking a nap.</p>
            <p className="mt-2 text-xs text-muted">The organizers will switch the lights back on soon.</p>
          </div>
        ) : visible.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((experience, index) => (
              <motion.button key={experience.id} type="button" onClick={() => open(experience.id)}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.4, delay: reduce ? 0 : (index % 3) * 0.05 }}
                whileHover={reduce ? undefined : { y: -5 }} whileTap={reduce ? undefined : { scale: 0.98 }}
                className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-[#0c1a30]/75 p-5 text-left transition-colors hover:border-gold/60">
                <div aria-hidden className="absolute -right-8 -top-8 size-28 rounded-full bg-gold/8 blur-2xl transition group-hover:bg-gold/20" />
                <div className="flex items-start justify-between gap-3">
                  <span className="text-3xl" role="img" aria-hidden>{experience.emoji}</span>
                  {visited.includes(experience.id) && <span className="rounded-full border border-success/30 bg-success/10 px-2 py-1 text-[9px] text-success">VISITED</span>}
                </div>
                <p className="eyebrow mt-4">{experience.group}</p>
                <h3 className="mt-1 font-display text-lg text-champagne">{experience.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{experience.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-gold">Enter experience <span className="transition group-hover:translate-x-1">→</span></span>
              </motion.button>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-gold/25 p-10 text-center text-sm text-muted">No experiences in this group right now.</p>
        )}
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => { if (!open) setActive(null); }}>
        <DialogContent className="max-h-[88svh] max-w-4xl overflow-y-auto p-5 sm:p-7"
          onInteractOutside={(event) => {
            // Let inner Radix popovers handle their own interactions.
            if ((event.target as HTMLElement)?.closest?.("[data-radix-popper-content-wrapper]")) event.preventDefault();
          }}>
          <DialogTitle className="sr-only">{EXPERIENCES.find((e) => e.id === active)?.title ?? "Cousins Universe experience"}</DialogTitle>
          <button type="button" onClick={() => setActive(null)} aria-label="Close experience"
            className="absolute right-4 top-4 z-20 grid size-9 place-items-center rounded-full border border-gold/25 text-champagne transition hover:bg-gold/15">
            <X className="size-4" />
          </button>
          <AnimatePresence mode="wait">
            {active && <motion.div key={active} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="pt-6">
              {renderExperience(active)}
            </motion.div>}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </section>
  );
}
