import { SectionHeading } from "@/components/section-heading";
import { MemoryGallery } from "@/components/memory-gallery";
import { getGalleryCategories, getPhotos, getSettings } from "@/lib/data";
import { getRegisteredParticipantId } from "@/lib/auth";
import { hasBlobStorage } from "@/lib/env";

export async function MemoriesSection() {
  const [photos, categories, settings, participantId] = await Promise.all([
    getPhotos(), getGalleryCategories(), getSettings(), getRegisteredParticipantId(),
  ]);
  return (
    <section id="memories" className="relative py-24 sm:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Our little scrapbook"
          title="Our Little Moments, Our Big Memories."
          description="The laughter, the chaos, the perfect imperfect snapshots — all the moments that make us, us."
        />
        <MemoryGallery
          photos={photos}
          categories={categories.length ? categories : [{ id: "", name: "Old Memories" }, { id: "", name: "Funny Moments" }, { id: "", name: "Family Gatherings" }, { id: "", name: "Reunion 2026" }]}
          canUpload={settings.memorySubmissionsOpen === "true" && Boolean(participantId)}
          hasStorage={hasBlobStorage}
        />
      </div>
    </section>
  );
}
