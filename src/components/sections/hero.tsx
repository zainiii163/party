import { CalendarDays, MapPin, ArrowDown, Sparkles } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { HeroBackdrop, Reveal } from "@/components/effects/reveal";
import { Badge } from "@/components/ui/misc";
import type { PublicEvent } from "@/lib/data";
import { formatDate, isDateConfirmed } from "@/lib/countdown-helpers";

export function Hero({ event }: { event: PublicEvent }) {
  const dateKnown = isDateConfirmed(event.eventDate);
  return (
    <section id="home" className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20">
      <HeroBackdrop />

      <div className="section-shell relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="text-center lg:text-left">
          <Reveal delay={0.05}>
            <Badge className="mb-6 inline-flex"><Sparkles className="size-3" /> The most wonderful time of the year</Badge>
            <h1 className="font-display text-[2.6rem] leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-[4.7rem]">
              {event.heroLine.split(" ").map((word, i) => (
                <span key={i} className={word === "Warmer" || word === "Together." ? "gold-text" : ""}>{word}{" "}</span>
              ))}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted sm:text-lg lg:mx-0">
              {event.subheading}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
              <a href="#rsvp" className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#e7c37e] to-[#c99a4d] px-7 text-sm font-semibold text-[#0b1a2e] shadow-[0_12px_34px_-14px_rgba(216,174,99,0.9)] transition hover:-translate-y-0.5 hover:brightness-110">
                Count Me In!
              </a>
              <a href="#event" className="inline-flex h-12 items-center justify-center rounded-full border border-gold/40 px-7 text-sm font-medium text-champagne transition hover:bg-gold/10">
                Explore the Reunion
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mx-auto mt-10 flex max-w-lg flex-wrap justify-center gap-x-7 gap-y-3 text-xs text-muted sm:text-sm lg:mx-0 lg:justify-start">
              <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-gold" /> {dateKnown ? formatDate(event.eventDate) : "Date to Be Announced"}</span>
              <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-gold" /> {event.venue || "Venue to Be Announced"}</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.14} y={32}>
          <div className="relative mx-auto w-full max-w-md">
            <div className="glass glow-gold relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <p className="eyebrow">The countdown begins</p>
                <Sparkles className="size-4 text-gold" />
              </div>
              <Countdown target={event.eventDate} />
              <div className="my-6 hairline" />
              <p className="text-center font-display text-lg text-champagne">{event.title}</p>
              <p className="mt-2 text-center text-xs leading-relaxed text-muted">
                {dateKnown ? "We cannot wait to see you there." : "The date is being decided together — stay close for the reveal."}
              </p>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-gold/25 bg-[#101f35]/90 px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-muted backdrop-blur">
              Made with love · Pakistan
            </div>
          </div>
        </Reveal>
      </div>

      <a href="#event" aria-label="Scroll to event details" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted transition hover:text-gold md:flex">
        <span className="text-[9px] uppercase tracking-[0.3em]">Discover</span>
        <ArrowDown className="size-4 animate-bounce" />
      </a>
    </section>
  );
}
