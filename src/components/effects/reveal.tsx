"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { GoldenParticles } from "./snowfall";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Staggered, accessibility-aware entrance reveal for hero content. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  const reduce = Boolean(useReducedMotion());
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: reduce ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Winter glow blobs that drift gently as the hero scrolls out of view. */
export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Nested wrappers keep Tailwind's positioning transforms independent of the
  // inline transforms Motion applies for parallax.
  const goldY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const blueY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const greenY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);

  return (
    <div ref={ref} aria-hidden className="absolute inset-0">
      <div className="absolute left-1/2 top-[-20%] -translate-x-1/2">
        <motion.div style={{ y: goldY }} className="size-[60rem] rounded-full bg-[radial-gradient(circle,rgba(216,174,99,0.11),transparent_62%)]" />
      </div>
      <motion.div style={{ y: blueY }} className="absolute bottom-[-30%] left-[-10%] size-[40rem] rounded-full bg-[radial-gradient(circle,rgba(65,109,158,0.16),transparent_65%)]" />
      <motion.div style={{ y: greenY }} className="absolute right-[-10%] top-1/4 size-[35rem] rounded-full bg-[radial-gradient(circle,rgba(114,199,161,0.06),transparent_65%)]" />
      <GoldenParticles count={20} />
    </div>
  );
}
