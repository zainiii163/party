"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Shuffle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/effects/confetti";

const COLORS = ["#d8ae63", "#72c7a1", "#7fb0e8", "#c98fb8", "#f2d7a0", "#8fb8c9", "#e0a37d", "#a5c98f"];

export function FunWheel({ activities, enabled }: { activities: string[]; enabled: boolean }) {
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const rotationRef = useRef(0);

  const pairs = useMemo(() => activities.map((label, i) => ({ label, color: COLORS[i % COLORS.length] })), [activities]);
  const count = pairs.length;

  function spin() {
    if (spinning || count === 0) return;
    const index = Math.floor(Math.random() * count);
    const slice = 360 / count;
    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    const desired = (360 - (index * slice + slice / 2)) % 360;
    const delta = (desired - currentMod + 360) % 360;
    const next = rotationRef.current + 360 * 5 + delta;
    rotationRef.current = next;
    setRotation(next);
    setSpinning(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(pairs[index]?.label ?? "Surprise!");
      setSpinning(false);
    }, 4300);
  }

  if (!enabled || count === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <p className="font-display text-xl text-champagne">The wheel is taking a rest</p>
        <p className="mt-2 text-sm text-muted">The organizer will switch it back on soon.</p>
      </div>
    );
  }

  const slice = 360 / count;
  const cx = 170, cy = 170, radius = 156;

  return (
    <div className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
      {result && <Confetti />}
      <div className="relative mx-auto aspect-square w-full max-w-92">
        <div aria-hidden className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          <div className="h-0 w-0 border-x-[14px] border-t-[26px] border-x-transparent border-t-[#f2d7a0]" />
        </div>

        <motion.div
          className="relative size-full rounded-full border-4 border-gold/60 shadow-[0_0_60px_-12px_rgba(216,174,99,0.5)]"
          animate={{ rotate: rotation }}
          transition={{ duration: 4.3, ease: [0.12, 0.72, 0.12, 1] }}
        >
          <svg viewBox="0 0 340 340" className="size-full rounded-full" role="img" aria-label={`Activity wheel with ${count} options`}>
            {pairs.map((pair, i) => {
              const start = ((i * slice - 90) * Math.PI) / 180;
              const end = (((i + 1) * slice - 90) * Math.PI) / 180;
              const path = `M ${cx} ${cy} L ${cx + radius * Math.cos(start)} ${cy + radius * Math.sin(start)} A ${radius} ${radius} 0 0 1 ${cx + radius * Math.cos(end)} ${cy + radius * Math.sin(end)} Z`;
              const mid = ((i * slice) * Math.PI) / 180;
              const tx = cx + radius * 0.6 * Math.cos(mid - Math.PI / 2);
              const ty = cy + radius * 0.6 * Math.sin(mid - Math.PI / 2);
              return (
                <g key={`${pair.label}-${i}`}>
                  <path d={path} fill={pair.color} stroke="#081426" strokeWidth="1.5" opacity="0.92" />
                  <text
                    x={tx} y={ty}
                    fill="#081426"
                    fontSize={count > 8 ? 8.5 : 10.5}
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${i * slice}, ${tx}, ${ty})`}
                  >
                    {pair.label.length > 18 ? `${pair.label.slice(0, 16)}…` : pair.label}
                  </text>
                </g>
              );
            })}
            <circle cx={cx} cy={cy} r="25" fill="#081426" stroke="#f2d7a0" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="14" fill="#d8ae63" />
          </svg>
        </motion.div>
      </div>

      <div className="relative mt-8 flex flex-col items-center gap-4">
        <Button size="lg" onClick={spin} disabled={spinning}>
          {spinning ? <><RotateCcw className="animate-spin" /> Spinning...</> : <><Sparkles /> Spin the wheel</>}
        </Button>
        <button onClick={spin} disabled={spinning} className="inline-flex items-center gap-2 text-xs text-muted underline-offset-4 hover:text-champagne hover:underline disabled:opacity-50">
          <Shuffle className="size-3.5" /> Just pick one for me (accessible alternative)
        </button>
        <div aria-live="polite" className="min-h-12 text-center">
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <p className="eyebrow">Your activity is</p>
              <p className="mt-1 font-display text-2xl text-champagne sm:text-3xl">{result}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
