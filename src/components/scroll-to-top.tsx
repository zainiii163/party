"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp } from "lucide-react";

/** Appears after the visitor is well into the page; respects reduced motion. */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const reduce = Boolean(useReducedMotion());

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.9 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-40 grid size-11 place-items-center rounded-full border border-gold/40 bg-[#101f35]/90 text-gold shadow-[0_12px_30px_-12px_rgba(0,0,0,0.9)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-gold/20"
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
