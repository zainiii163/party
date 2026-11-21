import { SectionHeading } from "@/components/section-heading";
import { AwardsBoard } from "@/components/awards-board";
import { getAwards, getMyAwardVotes, getSettings } from "@/lib/data";
import { getRegisteredParticipantId } from "@/lib/auth";

export async function AwardsSection() {
  const [settings, awards, participantId] = await Promise.all([getSettings(), getAwards(), getRegisteredParticipantId()]);
  if (settings.awardsEnabled !== "true" || !awards.length) return null;
  const myVotes = await getMyAwardVotes(participantId);
  return (
    <section id="awards" className="relative py-24 sm:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="A little friendly fun"
          title="The Cousins Awards!"
          description="Celebrate the people who make every family gathering unforgettable. All in good fun, of course."
        />
        <AwardsBoard initial={awards} myVotes={myVotes} canVote={Boolean(participantId)} />
      </div>
    </section>
  );
}
