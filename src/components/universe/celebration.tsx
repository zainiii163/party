"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/misc";
import { Confetti } from "@/components/effects/confetti";
import { getTimeLeft } from "@/lib/countdown";
import { STORY_PAGES } from "@/lib/universe";
import type { PublicPhoto } from "@/lib/data";
import { ExperienceShell, ReportButton, usePageActive, useTicker } from "./shared";

export function GrandCountdown({ target }: { target: string | null }) {
  const [time, setTime] = useState(() => getTimeLeft(target));
  const [celebrated, setCelebrated] = useState(false);
  const reduce = Boolean(useReducedMotion());
  const active = usePageActive();
  useTicker(() => setTime(getTimeLeft(target)), 1000, Boolean(target));

  useEffect(() => {
    if (time.done && !celebrated) setCelebrated(true);
  }, [time.done, celebrated]);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <ExperienceShell title="The grand countdown" intro="The final stretch, in four glowing numbers. When it hits zero, the whole room gets to celebrate.">
      {!target ? (
        <div className="rounded-xl border border-gold/20 bg-gold/5 p-8 text-center">
          <p className="font-display text-xl text-champagne">The date is still a beautiful secret.</p>
          <p className="mt-2 text-xs text-muted">The organizers will reveal it soon. The countdown lights will turn on automatically.</p>
        </div>
      ) : time.done ? (
        <div className="relative rounded-xl border border-gold/30 bg-gold/8 p-10 text-center">
          {active && !reduce && <Confetti pieces={60} />}
          <p className="relative font-display text-3xl text-champagne">The reunion is here! 🎉</p>
          <p className="relative mt-2 text-sm text-muted">Every cousin, one room, zero spare chairs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {units.map((unit, index) => (
            <motion.div key={unit.label} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : index * 0.1 }}
              className="rounded-xl border border-gold/25 bg-[#0c1a30] p-5 text-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p key={`${unit.label}-${unit.value}`}
                  initial={reduce ? false : { y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }}
                  className="font-display text-4xl tabular-nums text-champagne sm:text-5xl">
                  {String(unit.value).padStart(2, "0")}
                </motion.p>
              </AnimatePresence>
              <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted">{unit.label}</p>
            </motion.div>
          ))}
        </div>
      )}
      <ReportButton experienceId="grand-countdown" />
    </ExperienceShell>
  );
}

export function MemoryWall({ photos }: { photos: PublicPhoto[] }) {
  const [active, setActive] = useState<number | null>(null);
  const reduce = Boolean(useReducedMotion());
  const move = useCallback((direction: number) => {
    setActive((current) => current === null || !photos.length ? current : (current + direction + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, move]);

  return (
    <ExperienceShell title="The approved memory wall" intro="Every photo here was reviewed by an organizer first. Nothing pending, nothing private.">
      {photos.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.slice(0, 24).map((photo, index) => (
            <motion.button key={photo.id} type="button" onClick={() => setActive(index)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, rotate: (index % 2 ? 1 : -1) * 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: reduce ? 0 : (index % 6) * 0.04 }}
              className="group overflow-hidden rounded-xl border border-gold/20 bg-[#0c1a30] text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.imageUrl} alt={photo.caption} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
              <p className="truncate px-3 py-2 text-[11px] text-champagne">{photo.caption}</p>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gold/25 p-10 text-center">
          <p className="font-display text-lg text-champagne">The wall is waiting for its first memory.</p>
          <p className="mt-2 text-xs text-muted">Approved photos from the gallery will appear here automatically.</p>
        </div>
      )}
      <Dialog open={active !== null} onOpenChange={(open) => { if (!open) setActive(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">Memory photo</DialogTitle>
          {active !== null && photos[active] && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[active].imageUrl} alt={photos[active].caption} className="mx-auto max-h-[65vh] w-auto rounded-xl object-contain" />
              <p className="mt-4 text-center font-display text-lg text-champagne">{photos[active].caption}</p>
              <p className="text-center text-xs text-muted">{active + 1} / {photos.length} · {photos[active].categoryName}</p>
              <div className="mt-4 flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => move(-1)}><ChevronLeft /> Previous</Button>
                <Button variant="outline" size="sm" onClick={() => move(1)}>Next <ChevronRight /></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ReportButton experienceId="memory-wall" />
    </ExperienceShell>
  );
}

export function ReunionStorybook() {
  const [page, setPage] = useState(0);
  const reduce = Boolean(useReducedMotion());
  const current = STORY_PAGES[page];
  const next = useCallback(() => setPage((p) => (p + 1) % STORY_PAGES.length), []);
  const previous = useCallback(() => setPage((p) => (p - 1 + STORY_PAGES.length) % STORY_PAGES.length), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous]);

  return (
    <ExperienceShell title="The reunion storybook" intro="A six-page story of how a group chat became a winter tradition. Use the arrows or your keyboard.">
      <div className="mx-auto max-w-xl">
        <div className="relative min-h-64 overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-[#172840] to-[#081426] p-8">
          <span aria-hidden className="absolute right-6 top-4 text-7xl opacity-20">{current.emoji}</span>
          <AnimatePresence mode="wait">
            <motion.div key={page} initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40, rotateY: -12 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }} exit={{ opacity: 0, x: -40, rotateY: 12 }}
              transition={{ duration: reduce ? 0 : 0.45 }}>
              <p className="eyebrow">Chapter {page + 1}</p>
              <h4 className="mt-3 font-display text-2xl text-champagne">{current.title}</h4>
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">{current.text}</p>
              <p className="mt-6 text-5xl">{current.emoji}</p>
            </motion.div>
          </AnimatePresence>
          <span className="absolute bottom-3 right-5 font-display text-sm text-muted">{page + 1} / {STORY_PAGES.length}</span>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={previous}><ChevronLeft /> Previous</Button>
          <Button size="sm" onClick={next}>Next <ChevronRight /></Button>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {STORY_PAGES.map((_, i) => <button key={i} type="button" onClick={() => setPage(i)} aria-label={`Go to chapter ${i + 1}`}
            className={`size-2 rounded-full transition ${i === page ? "bg-gold" : "bg-white/20"}`} />)}
        </div>
      </div>
      <ReportButton experienceId="reunion-storybook" />
    </ExperienceShell>
  );
}

export function MagicMeter({ initialCount, goal }: { initialCount: number; goal: number }) {
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const reduce = Boolean(useReducedMotion());
  const active = usePageActive();
  const percent = Math.min(100, Math.round((count / Math.max(1, goal)) * 100));
  useEffect(() => { if (percent >= 100) setCelebrated(true); }, [percent]);

  async function addMagic() {
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/universe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "magic", source: "magic-meter" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not add magic");
      setCount(Math.max(count, json.magicCount ?? count + 1));
      toast.success("A little more magic in the room ✨");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add magic");
    } finally {
      setPending(false);
    }
  }

  return (
    <ExperienceShell title="The community magic meter" intro="Every cousin can add a sparkle. The total is shared, but no names or devices are stored — one tap per visitor per hour.">
      <div className="relative rounded-xl border border-gold/25 bg-[#0c1a30] p-6 text-center">
        {active && !reduce && celebrated && <Confetti pieces={40} />}
        <Sparkles />
        <p className="mt-2 font-display text-5xl text-champagne tabular-nums">{count.toLocaleString()}</p>
        <p className="mt-1 text-xs text-muted">of {goal.toLocaleString()} magic points</p>
        <Progress value={percent} className="mt-6 h-3" />
        <p className="mt-2 text-xs text-muted">{percent}% of the way to a fully lit reunion</p>
        <Button className="mt-6" onClick={addMagic} disabled={pending}><Sparkles /> {pending ? "Adding..." : "Add a sparkle"}</Button>
        {celebrated && <p className="mt-4 font-display text-lg text-champagne">The meter is full — the room is glowing! 🎉</p>}
      </div>
      <ReportButton experienceId="magic-meter" />
    </ExperienceShell>
  );
}
