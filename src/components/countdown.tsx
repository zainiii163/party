"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getTimeLeft } from "@/lib/countdown";

export function Countdown({ target }: { target: string | null }) {
  const [time, setTime] = useState(() => getTimeLeft(target));
  const reduce = Boolean(useReducedMotion());

  useEffect(() => {
    setTime(getTimeLeft(target));
    if (!target) return;
    const timer = window.setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className="w-full">
      {time.done ? (
        <p className="font-display text-2xl text-champagne">The reunion is here! ✨</p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-4" role="timer" aria-label="Countdown to the reunion">
          {units.map((unit) => (
            <div key={unit.label} className="glass rounded-xl px-1 py-3 text-center sm:rounded-2xl sm:py-4">
              <div className="relative flex h-[1.15em] items-center justify-center overflow-hidden font-display text-2xl tabular-nums text-champagne sm:text-4xl lg:text-5xl">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={`${unit.label}-${unit.value}`}
                    initial={reduce ? false : { y: "-70%", opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                    exit={reduce ? { opacity: 0 } : { y: "70%", opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="block"
                  >
                    {String(unit.value).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="mt-1 text-[9px] uppercase tracking-[0.2em] text-muted sm:text-[11px]">{unit.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
