import { SectionHeading } from "@/components/section-heading";
import { GuestbookBoard } from "@/components/guestbook-board";
import { getGuestbook, getSettings } from "@/lib/data";
import { getRegisteredParticipantId } from "@/lib/auth";

export async function GuestbookSection() {
  const [messages, settings, participantId] = await Promise.all([getGuestbook(), getSettings(), getRegisteredParticipantId()]);
  return (
    <section id="guestbook" className="relative py-24 sm:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="From the heart"
          title="Leave a Little Love!"
          description="A digital guestbook full of wishes, warm memories and excitement for the days ahead."
        />
        <GuestbookBoard initial={messages} canWrite={Boolean(participantId)} open={settings.guestbookOpen === "true"} />
      </div>
    </section>
  );
}
