"use client";

import { useMemo } from "react";

/** Deterministic CSS-only snowfall: zero JS animation work and no hydration mismatch. */
export function Snowfall() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 38 }, (_, i) => {
        const seed = (i * 9301 + 49297) % 233280;
        const rand = seed / 233280;
        const seed2 = ((i + 17) * 4523 + 7193) % 233280;
        const rand2 = seed2 / 233280;
        return {
          left: `${rand * 100}%`,
          size: 2 + rand2 * 4,
          duration: 12 + rand * 16,
          delay: -rand2 * 24,
          opacity: 0.2 + rand * 0.5,
        };
      }),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {flakes.map((flake, i) => (
        <span
          key={i}
          className="snowflake absolute top-[-5%] rounded-full bg-white/70"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animation: `snow-fall ${flake.duration}s linear ${flake.delay}s infinite`,
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes snow-fall {
          0% { transform: translate3d(0, -10vh, 0) rotate(0deg); }
          50% { transform: translate3d(18px, 50vh, 0) rotate(180deg); }
          100% { transform: translate3d(-12px, 112vh, 0) rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) { .snowflake { display: none; } }
      `}</style>
    </div>
  );
}

export function GoldenParticles({ count = 14 }: { count?: number }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const rand = ((i * 7919 + 104729) % 1000) / 1000;
        const rand2 = ((i * 3571 + 7919) % 1000) / 1000;
        return { left: `${rand * 100}%`, top: `${rand2 * 100}%`, delay: rand2 * 4, size: 2 + rand * 3 };
      }),
    [count],
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {dots.map((dot, i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full bg-[#f2d7a0] shadow-[0_0_12px_3px_rgba(242,215,160,0.45)]"
          style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, animationDelay: `${dot.delay}s` }}
        />
      ))}
    </div>
  );
}
