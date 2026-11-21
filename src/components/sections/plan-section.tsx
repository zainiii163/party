import { CheckCircle2, CircleDashed, Vote, Hourglass, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";
import type { PublicDecision, PublicEvent } from "@/lib/data";
import { formatDate, isDateConfirmed } from "@/lib/countdown-helpers";

const STATUS_STYLE: Record<string, { icon: typeof CheckCircle2; color: string; percent: number }> = {
  Confirmed: { icon: CheckCircle2, color: "text-success", percent: 100 },
  "Under Discussion": { icon: CircleDashed, color: "text-gold", percent: 65 },
  "Voting Open": { icon: Vote, color: "text-[#7fb0e8]", percent: 45 },
  Pending: { icon: Hourglass, color: "text-muted", percent: 20 },
};

export function PlanSection({ decisions, event }: { decisions: PublicDecision[]; event: PublicEvent }) {
  const confirmed = decisions.filter((d) => d.status === "Confirmed").length;
  const progress = decisions.length ? Math.round(decisions.reduce((sum, d) => sum + (STATUS_STYLE[d.status]?.percent ?? 20), 0) / decisions.length) : 0;

  return (
    <section id="plan" className="relative py-24 sm:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Taking shape"
          title="The Plan Is Coming Together!"
          description="Only the organizer confirms the final choices. Popular ideas guide us, but these decisions are official."
        />
        <Card className="relative overflow-hidden p-6 sm:p-10">
          <div aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full bg-gold/8 blur-3xl" />
          <div className="relative mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Overall planning progress</p>
              <p className="mt-2 font-display text-3xl text-champagne">{progress}%</p>
            </div>
            <div className="sm:w-72">
              <Progress value={progress} />
              <p className="mt-2 text-right text-[11px] text-muted">{confirmed} of {decisions.length} confirmed</p>
            </div>
          </div>

          <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decisions.map((decision) => {
              const style = STATUS_STYLE[decision.status] ?? STATUS_STYLE.Pending;
              const Icon = style.icon;
              const value = decision.value || (
                decision.key === "date" ? (isDateConfirmed(event.eventDate) ? formatDate(event.eventDate) : "To be announced")
                  : decision.key === "venue" ? (event.venue || "To be announced") : null
              );
              return (
                <div key={decision.key} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-gold/30">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-lg text-foreground">{decision.label}</span>
                    <Icon className={`size-5 ${style.color}`} />
                  </div>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted">{decision.status}</p>
                  {value && <p className="mt-3 text-sm leading-relaxed text-champagne">{value}</p>}
                  <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/8">
                    <div className={`h-full rounded-full bg-gradient-to-r from-gold/50 to-champagne transition-all duration-700`} style={{ width: `${style.percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gold/15 pt-6">
            <p className="text-xs text-muted">Final date: <span className="text-foreground">{isDateConfirmed(event.eventDate) ? formatDate(event.eventDate) : "Date to Be Announced"}</span></p>
            <a href="#suggestions" className="inline-flex items-center gap-2 text-xs font-medium text-gold hover:text-champagne">Add your idea <ArrowRight className="size-3.5" /></a>
          </div>
        </Card>
      </div>
    </section>
  );
}
