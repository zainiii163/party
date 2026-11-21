"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cwr_invitation_seen_v1";

export function InvitationGate() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/rsvp/manage")) return;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch { /* storage unavailable: let them in */ }
  }, [pathname]);

  function finish() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 900);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-[#050d1a]/95 px-5 backdrop-blur-xl"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          aria-label="Digital invitation"
        >
          <div aria-hidden className="absolute inset-0">
            {Array.from({ length: 26 }, (_, i) => (
              <span
                key={i}
                className="animate-twinkle absolute size-1 rounded-full bg-champagne shadow-[0_0_10px_2px_rgba(242,215,160,0.4)]"
                style={{
                  left: `${((i * 37) % 100)}%`,
                  top: `${((i * 61) % 100)}%`,
                  animationDelay: `${(i % 7) * 0.5}s`,
                }}
              />
            ))}
          </div>

          <motion.div
            className="relative flex w-full max-w-md flex-col items-center text-center"
            animate={leaving ? { opacity: 0, scale: 1.08, y: -20 } : { opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <motion.p
              className="eyebrow mb-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              A special delivery for you
            </motion.p>
            <motion.h1
              className="font-display text-3xl leading-tight text-foreground sm:text-5xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              Something Special <span className="gold-text">Is Waiting</span> For You...
            </motion.h1>

            <div className="relative mt-12 h-52 w-72 perspective-[900px] sm:h-60 sm:w-80">
              <motion.div
                className="absolute inset-0"
                animate={open ? { rotateX: -12, y: 34 } : { rotateX: 0, y: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 rounded-xl border border-gold/30 bg-gradient-to-br from-[#1d3352] to-[#101f35] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.9)]" />
                <div className="absolute inset-x-0 top-0 h-full origin-top rounded-t-xl border-b border-gold/20 bg-gradient-to-b from-[#203657] to-[#142540]"
                  style={{ transform: open ? "rotateX(-105deg)" : "rotateX(0deg)", transition: "transform 1.1s cubic-bezier(.4,0,.2,1)", transformOrigin: "top" }}
                >
                  <div className="absolute inset-x-6 top-7 h-px bg-gold/25" />
                  <div className="absolute inset-x-12 top-12 h-px bg-gold/15" />
                </div>
                <motion.div
                  className="absolute left-1/2 top-[44%] z-10 grid size-16 -translate-x-1/2 place-items-center rounded-full bg-gradient-to-br from-[#e6c383] to-[#b98b43] shadow-[0_0_35px_rgba(216,174,99,0.6)]"
                  animate={open ? { scale: 1.6, opacity: 0, y: -40 } : { scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Sparkles className="size-6 text-[#0b1a2e]" />
                </motion.div>
                <motion.div
                  className="absolute inset-x-8 bottom-8 top-14 flex items-center justify-center rounded-lg border border-gold/30 bg-[#f3e6c9] text-[#1a2b44]"
                  initial={false}
                  animate={open ? { y: -70, opacity: 1 } : { y: 0, opacity: 0 }}
                  transition={{ delay: 0.35, duration: 0.9 }}
                >
                  <div className="px-4 font-display text-lg leading-snug">
                    You&apos;re invited to a winter<br />reunion full of love.
                  </div>
                </motion.div>
              </motion.div>
              {open && (
                <div aria-hidden className="absolute inset-0">
                  {Array.from({ length: 34 }, (_, i) => (
                    <motion.span
                      key={i}
                      className="absolute left-1/2 top-1/2 size-1.5 rounded-full bg-champagne shadow-[0_0_14px_3px_rgba(242,215,160,0.5)]"
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos((i / 34) * Math.PI * 2) * (90 + (i % 5) * 32),
                        y: Math.sin((i / 34) * Math.PI * 2) * (70 + (i % 4) * 28) - 40,
                        opacity: 0,
                        scale: 0.2,
                      }}
                      transition={{ duration: 1.6, ease: "easeOut" }}
                    />
                  ))}
                </div>
              )}
            </div>

            <motion.div className="mt-10 flex flex-col items-center gap-4" animate={{ opacity: open ? 0 : 1 }} transition={{ duration: 0.3 }}>
              <Button size="lg" onClick={() => { setOpen(true); window.setTimeout(finish, 1500); }}>
                Open Your Invitation <ArrowRight className="size-4" />
              </Button>
              <button onClick={finish} className="text-xs text-muted underline-offset-4 transition hover:text-champagne hover:underline">
                Skip the animation
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
