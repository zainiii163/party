import { CalendarDays, Clock3, MapPin, Shirt, Heart, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import type { PublicEvent } from "@/lib/data";
import { formatDate, isDateConfirmed } from "@/lib/countdown-helpers";

type ScheduleItem = { id: string; time: string; title: string; note: string | null };

export function EventSection({ event, schedule }: { event: PublicEvent; schedule: ScheduleItem[] }) {
  const details = [
    { icon: CalendarDays, label: "Date", value: isDateConfirmed(event.eventDate) ? formatDate(event.eventDate) : "Date to Be Announced" },
    { icon: Clock3, label: "Time", value: `${event.startTime} – ${event.endTime} (PKT)` },
    { icon: MapPin, label: "Venue", value: event.venue || "Venue to Be Announced" },
    { icon: Shirt, label: "Dress code", value: event.dressCode },
  ];

  return (
    <section id="event" className="relative py-24 sm:py-32">
      <div className="section-shell">
        <SectionHeading eyebrow="The celebration" title="Every Little Detail" description={event.description} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass group rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/40">
              <div className="mb-4 grid size-10 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-gold transition group-hover:bg-gold/20">
                <Icon className="size-5" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="size-5 text-gold" />
              <h3 className="font-display text-2xl text-champagne">The Day, Moment by Moment</h3>
            </div>
            <ol className="relative space-y-6 border-l border-gold/20 pl-6">
              {schedule.map((item) => (
                <li key={item.id} className="relative">
                  <span className="absolute -left-[29px] top-1.5 size-2.5 rounded-full bg-gold shadow-[0_0_12px_rgba(216,174,99,0.8)]" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{item.time}</p>
                  <p className="mt-1 font-display text-lg text-foreground">{item.title}</p>
                  {item.note && <p className="mt-1 text-xs leading-relaxed text-muted">{item.note}</p>}
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col gap-6">
            <div className="glass glow-gold relative overflow-hidden rounded-2xl p-7 sm:p-9">
              <div className="absolute -right-10 -top-10 size-40 rounded-full bg-gold/8 blur-2xl" />
              <Heart className="size-6 text-gold" />
              <p className="eyebrow mt-5">A note from your hosts</p>
              <p className="mt-4 font-display text-xl leading-relaxed text-champagne sm:text-2xl">“{event.hostMessage}”</p>
              <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted">With love, the organizers</p>
            </div>
            {event.location && (
              <div className="glass rounded-2xl p-6">
                <p className="eyebrow">Location</p>
                <p className="mt-3 text-sm text-foreground">{event.location}</p>
                <p className="mt-2 text-xs text-muted">Exact address will be shared with confirmed attendees closer to the day.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
