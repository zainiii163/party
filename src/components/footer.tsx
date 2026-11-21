import { Snowflake, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-gold/15 py-12">
      <div className="section-shell flex flex-col items-center gap-5 text-center">
        <div className="flex items-center gap-2 font-display text-lg text-champagne">
          <Snowflake className="size-4 text-gold" /> Cousins Winter Reunion 2026
        </div>
        <p className="max-w-md text-xs leading-relaxed text-muted">
          Made with warmth for the people who make every winter brighter. See you soon, Inshallah.
        </p>
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <Heart className="size-3 text-gold" /> Family · Food · Forever memories
        </div>
        <a href="/admin/login" className="text-[10px] uppercase tracking-[0.2em] text-muted/50 transition hover:text-gold">Organizer login</a>
      </div>
    </footer>
  );
}
