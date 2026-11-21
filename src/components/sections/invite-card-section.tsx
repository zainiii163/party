import { SectionHeading } from "@/components/section-heading";
import { InvitationCard } from "@/components/invitation-card";
import { getEvent } from "@/lib/data";

export async function InviteCardSection() {
  const event = await getEvent();
  return (
    <section id="invite-card" className="relative py-24 sm:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Make it yours"
          title="Your Personal Invitation"
          description="Add your name, download a beautiful card and send it to the cousins who need to know."
        />
        <InvitationCard event={event} />
      </div>
    </section>
  );
}
