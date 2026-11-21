import { CheckCircle2, Clock3, HeartHandshake } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { RsvpForm } from "@/components/rsvp-form";

export function RsvpSection({ open }: { open: boolean }) {
  return (
    <section id="rsvp" className="relative py-24 sm:py-32">
      <div className="section-shell grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28">
          <SectionHeading
            align="left"
            eyebrow="Your presence is the gift"
            title="Save Your Seat by the Fire"
            description="Tell us whether you can make it and help us plan the perfect reunion. No account needed — just a few happy details."
          />
          <div className="mt-8 space-y-4">
            {[
              { icon: CheckCircle2, text: "Takes less than two minutes" },
              { icon: HeartHandshake, text: "Your private link lets you update anytime" },
              { icon: Clock3, text: "Nothing is shared publicly without your consent" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-muted">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-gold/25 bg-gold/8 text-gold"><Icon className="size-4" /></span>
                {text}
              </div>
            ))}
          </div>
          <div className="mt-10 hidden rounded-2xl border border-gold/20 bg-gold/[0.04] p-6 lg:block">
            <p className="font-display text-xl italic text-champagne">“Family is the compass that guides us.”</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">— A favourite reminder</p>
          </div>
        </div>
        <RsvpForm open={open} />
      </div>
    </section>
  );
}
