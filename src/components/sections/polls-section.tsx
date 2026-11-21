import { SectionHeading } from "@/components/section-heading";
import { PollsBoard } from "@/components/polls-board";
import { getMyPollVotes, getPolls } from "@/lib/data";
import { getRegisteredParticipantId } from "@/lib/auth";

export async function PollsSection() {
  const [polls, participantId] = await Promise.all([getPolls(), getRegisteredParticipantId()]);
  const myVotes = await getMyPollVotes(participantId);
  return (
    <section id="polls" className="relative py-24 sm:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Have your say"
          title="Let's Decide Together"
          description="Pick your favourites and watch the results come alive. You can change your vote while a poll is open."
        />
        <PollsBoard initial={polls} myVotes={myVotes} canVote={Boolean(participantId)} />
      </div>
    </section>
  );
}
