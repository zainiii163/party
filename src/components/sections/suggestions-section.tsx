import { SectionHeading } from "@/components/section-heading";
import { SuggestionsHub } from "@/components/suggestions-hub";
import { getMyVotes, getSettings, getSuggestions } from "@/lib/data";
import { getVisitorId } from "@/lib/auth";

export async function SuggestionsSection() {
  const [suggestions, visitorId, settings] = await Promise.all([getSuggestions(), getVisitorId(), getSettings()]);
  const myVotes = await getMyVotes(visitorId);
  return (
    <section id="suggestions" className="relative py-24 sm:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Dream it together"
          title="Your Ideas, Our Perfect Reunion!"
          description="Food, games, decorations, timings — every idea makes this celebration more ours."
        />
        <SuggestionsHub initial={{ suggestions, myVotes }} open={settings.suggestionsOpen === "true"} />
      </div>
    </section>
  );
}
