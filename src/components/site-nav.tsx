"use client";

import { useEffect, useState } from "react";
import { Menu, X, Snowflake } from "lucide-react";
import { SECTIONS, type SectionKey } from "@/lib/defaults";

export function SiteNav({ sections }: { sections: SectionKey[] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<SectionKey | "">("");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      setScrolled(window.scrollY > 24);

      // Highlight the last section whose top has passed just below the header.
      const marker = window.scrollY + 140;
      let current: SectionKey | "" = sections[0] ?? "";
      for (const key of sections) {
        const element = document.getElementById(key);
        if (element && element.getBoundingClientRect().top + window.scrollY <= marker) current = key;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sections]);

  const links = SECTIONS.filter((s) => sections.includes(s.key));

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-gold/15 bg-[#081426]/90 backdrop-blur-xl" : "bg-transparent"}`}>
      <nav className="section-shell flex h-18 items-center justify-between gap-4" aria-label="Main navigation">
        <a href="#home" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid size-9 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold transition group-hover:bg-gold/20">
            <Snowflake className="size-4.5" />
          </span>
          <span className="font-display text-sm leading-tight tracking-wide text-champagne sm:text-base">
            Cousins Winter <span className="gold-text">2026</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a
              key={link.key}
              href={`#${link.key}`}
              aria-current={active === link.key ? "location" : undefined}
              className={`rounded-full px-3 py-2 text-[11px] font-medium tracking-wide transition ${active === link.key ? "bg-gold/15 text-champagne" : "text-muted hover:bg-white/5 hover:text-champagne"}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <a href="#rsvp" className={`hidden rounded-full border px-4 py-2 text-xs font-semibold transition lg:inline-block ${active === "rsvp" ? "border-gold bg-gold/25 text-champagne" : "border-gold/40 bg-gold/10 text-champagne hover:bg-gold/20"}`}>
          Count Me In
        </a>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-full border border-gold/25 text-champagne lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="glass mx-4 mb-4 rounded-2xl p-3 lg:hidden">
          <div className="grid grid-cols-2 gap-1">
            {links.map((link) => (
              <a
                key={link.key}
                href={`#${link.key}`}
                onClick={() => setOpen(false)}
                aria-current={active === link.key ? "location" : undefined}
                className={`rounded-xl px-3 py-2.5 text-sm transition ${active === link.key ? "bg-gold/20 text-champagne" : "text-muted hover:bg-gold/10 hover:text-champagne"}`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px]">
        <div
          className="h-full bg-gradient-to-r from-[#c99a4d] via-[#f2d7a0] to-[#d8ae63] shadow-[0_0_10px_rgba(216,174,99,0.7)] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
