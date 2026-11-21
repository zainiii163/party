"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { Copy, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExperienceId, ReportReason } from "@/lib/universe";

/** Tiny localStorage helper used only for harmless local progress and styling. */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // Private browsing or corrupted data: fall back to the in-memory value.
    }
  }, [key]);

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try { window.localStorage.setItem(key, JSON.stringify(resolved)); } catch { /* ignore */ }
      return resolved;
    });
  }, [key]);

  return [value, update] as const;
}

/** Animations stop when the browser tab is hidden. Modal unmounting stops them too. */
export function usePageActive() {
  const [active, setActive] = useState(true);
  useEffect(() => {
    const update = () => setActive(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return active;
}

/** Deterministic pseudo-random from a string, so daily surprises stay stable. */
export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function ExperienceShell({
  title, intro, children, className = "",
}: { title: string; intro: string; children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gold/20 bg-[#0c1a30]/80 p-5 sm:p-7 ${className}`}>
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-gold/8 blur-3xl" />
      <div className="relative">
        <h3 className="font-display text-xl text-champagne sm:text-2xl">{title}</h3>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted sm:text-sm">{intro}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function SparkleRow({ count = 5 }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none flex justify-center gap-3">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="animate-twinkle text-gold" style={{ animationDelay: `${i * 0.35}s` }}>✦</span>
      ))}
    </div>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  return (
    <Button variant="ghost" size="sm" onClick={async () => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to your clipboard");
      } catch {
        toast.error("Could not copy. Select the text instead.");
      }
    }}><Copy /> {label}</Button>
  );
}

const REASONS: { reason: ReportReason; label: string }[] = [
  { reason: "spoiler", label: "Spoils a surprise" },
  { reason: "uncomfortable", label: "Feels unkind" },
  { reason: "broken", label: "Something is broken" },
];

export function ReportButton({ experienceId }: { experienceId: ExperienceId }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
      <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <Flag /> Report
      </Button>
      {open && REASONS.map((item) => (
        <Button key={item.reason} variant="ghost" size="sm" onClick={async () => {
          try {
            const res = await fetch("/api/universe", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "report", experienceId, reason: item.reason }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Could not send report");
            toast.success("Thanks — the organizers will take a look.");
            setOpen(false);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not send report");
          }
        }}>{item.label}</Button>
      ))}
      <span className="text-[10px] text-muted/70">Anonymous, no personal details.</span>
    </div>
  );
}

/** A reusable animated highlight used by reveal-style experiences. */
export function RevealPanel({ show, children }: { show: boolean; children: ReactNode }) {
  const reduce = Boolean(useReducedMotion());
  return (
    <motion.div
      initial={reduce ? { opacity: show ? 1 : 0 } : { opacity: 0, scale: 0.94, rotateX: -8 }}
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.94, rotateX: show ? 0 : -8 }}
      transition={{ duration: reduce ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden={!show}
    >
      {children}
    </motion.div>
  );
}

/** Lightweight timer that stops when the tab is hidden. */
export function useTicker(callback: () => void, intervalMs: number, enabled = true) {
  const saved = useRef(callback);
  saved.current = callback;
  const active = usePageActive();
  useEffect(() => {
    if (!enabled || !active) return;
    const timer = window.setInterval(() => saved.current(), intervalMs);
    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, active]);
}
