import { SiteNav } from "@/components/site-nav";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { EventSection } from "@/components/sections/event-section";
import { RsvpSection } from "@/components/sections/rsvp-section";
import { CousinsSection } from "@/components/sections/cousins-section";
import { SuggestionsSection } from "@/components/sections/suggestions-section";
import { PollsSection } from "@/components/sections/polls-section";
import { PlanSection } from "@/components/sections/plan-section";
import { AwardsSection } from "@/components/sections/awards-section";
import { FunSection } from "@/components/sections/fun-section";
import { UniverseSection } from "@/components/universe/universe-section";
import { MemoriesSection } from "@/components/sections/memories-section";
import { GuestbookSection } from "@/components/sections/guestbook-section";
import { InviteCardSection } from "@/components/sections/invite-card-section";
import { getDecisions, getEvent, getSchedule, getSettings, sectionEnabled } from "@/lib/data";
import { SECTIONS } from "@/lib/defaults";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, event, schedule, decisions] = await Promise.all([
    getSettings(), getEvent(), getSchedule(), getDecisions(),
  ]);
  const enabled = SECTIONS.filter((s) => sectionEnabled(settings, s.key)).map((s) => s.key);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SiteNav sections={enabled} />
      <main className="relative z-10">
        {enabled.includes("home") && <Hero event={event} />}
        {enabled.includes("event") && <EventSection event={event} schedule={schedule} />}
        {enabled.includes("rsvp") && <RsvpSection open={settings.registrationsOpen === "true"} />}
        {enabled.includes("cousins") && settings.attendancePublic === "true" && <CousinsSection />}
        {enabled.includes("suggestions") && <SuggestionsSection />}
        {enabled.includes("polls") && settings.pollsEnabled === "true" && <PollsSection />}
        {enabled.includes("plan") && settings.planEnabled === "true" && <PlanSection decisions={decisions} event={event} />}
        {enabled.includes("awards") && <AwardsSection />}
        {enabled.includes("fun") && <FunSection />}
        {enabled.includes("universe") && <UniverseSection />}
        {enabled.includes("memories") && settings.galleryEnabled === "true" && <MemoriesSection />}
        {enabled.includes("guestbook") && <GuestbookSection />}
        <InviteCardSection />
      </main>
      <Footer />
    </div>
  );
}
