import { getRegisteredParticipantId } from "@/lib/auth";
import { getEvent, getPhotos, getPublicRsvps, getSettings } from "@/lib/data";
import { isUnlocked, parseUniverseConfig } from "@/lib/universe";
import { UniverseHub } from "./universe-hub";

/** The Universe is read-only on the server; all playful state lives in the browser. */
export async function UniverseSection() {
  const [settings, photos, rsvps, event, confirmed] = await Promise.all([
    getSettings(), getPhotos(), getPublicRsvps(), getEvent(), getRegisteredParticipantId(),
  ]);
  if (settings.section_universe === "false" || settings.universeEnabled === "false") return null;

  const cousins = rsvps.map((r) => ({ id: r.id, nickname: r.displayName }));
  const config = parseUniverseConfig(settings.universeConfig);
  // Scheduled surprises stay secret in the HTML too — not just in the public API.
  const initialConfig = {
    ...config,
    reveal: config.reveal.visible && isUnlocked(config.reveal)
      ? config.reveal
      : { visible: false, title: "", message: "", unlockAt: null },
  };
  return (
    <UniverseHub
      initialConfig={initialConfig}
      initialCount={Math.max(0, Number(settings.universeMagicCount) || 0)}
      cousins={cousins}
      photos={photos}
      eventDate={event.eventDate}
      confirmed={Boolean(confirmed)}
    />
  );
}
