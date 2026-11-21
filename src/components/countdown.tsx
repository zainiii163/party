"use client";

import { useEffect, useState } from "react";
import { getTimeLeft } from "@/lib/countdown";

export function Countdown({ target }: { target: string | null }) {
  const [time, setTime] = useState(() => getTimeLeft(target));

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
              <div className="font-display text-2xl tabular-nums text-champagne sm:text-4xl lg:text-5xl">
                {String(unit.value).padStart(2, "0")}
              </div>
              <div className="mt-1 text-[9px] uppercase tracking-[0.2em] text-muted sm:text-[11px]">{unit.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
