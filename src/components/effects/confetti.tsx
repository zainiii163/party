"use client";

import { useMemo } from "react";

export function Confetti({ pieces = 40 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => {
        const a = (i * 137.5 * Math.PI) / 180;
        const radius = 80 + (i % 7) * 22;
        return {
          x: Math.cos(a) * radius,
          y: Math.sin(a) * radius - 40,
          delay: (i % 5) * 0.05,
          color: ["#D8AE63", "#F2D7A0", "#72C7A1", "#F8F5EF"][i % 4],
        };
      }),
    [pieces],
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {bits.map((bit, i) => (
        <span
          key={i}
          className="absolute size-2 rounded-[2px]"
          style={{
            background: bit.color,
            animation: `confetti-pop 1.4s ease-out ${bit.delay}s forwards`,
            ["--cx" as string]: `${bit.x}px`,
            ["--cy" as string]: `${bit.y}px`,
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes confetti-pop {
          0% { transform: translate(0,0) rotate(0); opacity: 1; }
          100% { transform: translate(var(--cx), var(--cy)) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
