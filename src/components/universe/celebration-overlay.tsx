"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/effects/confetti";
import { RSVP_SUCCESS_EVENT } from "@/lib/events";
import { safeNickname } from "@/lib/universe";

/** Fires the moment an RSVP succeeds — a personalized thank-you from the Universe. */
export function UniverseCelebration() {
  const [visible, setVisible] = useState(false);
  const [nickname, setNickname] = useState("cousin");
  const timer = useRef<number | null>(null);
  const reduce = Boolean(useReducedMotion());

  useEffect(() => {
    const onSuccess = (event: Event) => {
      const detail = (event as CustomEvent<{ nickname?: string }>).detail;
      const name = safeNickname(detail?.nickname, "cousin");
      setNickname(name);
      try { window.localStorage.setItem("universe.nickname", JSON.stringify(name)); } catch { /* ignore */ }
      setVisible(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setVisible(false), 8000);
    };
    window.addEventListener(RSVP_SUCCESS_EVENT, onSuccess);
    return () => {
      window.removeEventListener(RSVP_SUCCESS_EVENT, onSuccess);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div role="status" aria-live="polite"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-70 grid place-items-center bg-[#040a14]/85 p-5 backdrop-blur-md">
          <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-[#172840] to-[#081426] p-8 text-center shadow-[0_30px_90px_-30px_rgba(216,174,99,0.7)]">
            {!reduce && <Confetti pieces={70} />}
            <div className="relative">
              <Sparkles className="mx-auto size-8 text-gold" />
              <p className="eyebrow mt-4">RSVP confirmed</p>
              <h2 className="mt-2 font-display text-3xl text-champagne">You&apos;re on the list, {nickname}!</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                The fireworks are officially launched. Twenty-five little worlds are waiting for you in the Cousins Universe.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={() => setVisible(false)}>Explore the Universe</Button>
                <Button variant="outline" onClick={() => { setVisible(false); document.getElementById("universe")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }}>
                  Take me there
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
