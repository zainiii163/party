"use client";

import { useEffect, useState } from "react";
import { Menu, X, Snowflake } from "lucide-react";
import { SECTIONS, type SectionKey } from "@/lib/defaults";

export function SiteNav({ sections }: { sections: SectionKey[] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
              className="rounded-full px-3 py-2 text-[11px] font-medium tracking-wide text-muted transition hover:bg-white/5 hover:text-champagne"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a href="#rsvp" className="hidden rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold text-champagne transition hover:bg-gold/20 lg:inline-block">
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
                className="rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-gold/10 hover:text-champagne"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
