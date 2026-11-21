import { SectionHeading } from "@/components/section-heading";
import { AttendanceBoard } from "@/components/attendance-board";
import { getPublicRsvps, getStats } from "@/lib/data";

export async function CousinsSection() {
  const [rsvps, stats] = await Promise.all([getPublicRsvps(), getStats()]);
  return (
    <section id="cousins" className="relative py-24 sm:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="The growing guest list"
          title="Who's Joining the Fun?"
          description="A little roll call of the cousins who have said yes (or maybe) to a winter full of love."
        />
        <AttendanceBoard initial={{ rsvps, stats, public: true }} />
      </div>
    </section>
  );
}
