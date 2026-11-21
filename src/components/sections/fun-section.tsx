import { SectionHeading } from "@/components/section-heading";
import { FunWheel } from "@/components/fun-wheel";
import { getSettings, getWheelActivities } from "@/lib/data";

export async function FunSection() {
  const [activities, settings] = await Promise.all([getWheelActivities(), getSettings()]);
  return (
    <section id="fun" className="relative py-24 sm:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="A little spontaneity"
          title="Spin the Fun!"
          description="Can't decide what to do next? Let the wheel choose a memory-making activity for everyone."
        />
        <FunWheel activities={activities} enabled={settings.wheelEnabled === "true"} />
      </div>
    </section>
  );
}
