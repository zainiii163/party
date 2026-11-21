/**
 * Shared, server-safe foundation for the Cousins Universe.
 * No personal data is stored here: every playful prompt comes from a curated,
 * family-friendly pool and visitors only ever supply a nickname.
 */

export const EXPERIENCE_IDS = [
  "winter-portal",
  "snow-globe",
  "rsvp-fireworks",
  "mystery-gift",
  "wanted-posters",
  "cousins-court",
  "roast-generator",
  "reaction-storm",
  "compliment-delivery",
  "crystal-ball",
  "secret-vault",
  "midnight-message",
  "snowball-battle",
  "snow-race",
  "dance-off",
  "prize-machine",
  "cousins-galaxy",
  "winter-avatars",
  "reunion-village",
  "penguin-guide",
  "grand-countdown",
  "memory-wall",
  "surprise-reveal",
  "reunion-storybook",
  "magic-meter",
] as const;

export type ExperienceId = (typeof EXPERIENCE_IDS)[number];

export type ExperienceGroup = "Gateway" | "Cousin Antics" | "Mystery" | "Playground" | "World" | "Celebration";

export type ExperienceDef = {
  id: ExperienceId;
  title: string;
  tagline: string;
  group: ExperienceGroup;
  emoji: string;
};

export const EXPERIENCES: ExperienceDef[] = [
  { id: "winter-portal", title: "Magical Winter Portal", tagline: "Pick a golden door. One leads to a surprise.", group: "Gateway", emoji: "🚪" },
  { id: "snow-globe", title: "3D Snow Globe", tagline: "Shake the world and watch the snow dance.", group: "Gateway", emoji: "🔮" },
  { id: "rsvp-fireworks", title: "RSVP Fireworks", tagline: "A sky full of gold for every confirmed cousin.", group: "Gateway", emoji: "🎆" },
  { id: "mystery-gift", title: "Daily Mystery Gift", tagline: "A different wholesome surprise every day.", group: "Gateway", emoji: "🎁" },
  { id: "wanted-posters", title: "Wanted Posters", tagline: "Opt-in, wonderfully silly, printer-friendly.", group: "Cousin Antics", emoji: "📜" },
  { id: "cousins-court", title: "Cousins Ki Adalat", tagline: "Family-friendly charges, gavel and all.", group: "Cousin Antics", emoji: "⚖️" },
  { id: "roast-generator", title: "Friendly Roast Generator", tagline: "Teasing that never actually hurts.", group: "Cousin Antics", emoji: "🎤" },
  { id: "reaction-storm", title: "Reaction Storm", tagline: "Tap an emoji and start a little weather system.", group: "Cousin Antics", emoji: "🌪️" },
  { id: "compliment-delivery", title: "Secret Compliments", tagline: "An anonymous envelope of kindness.", group: "Cousin Antics", emoji: "💌" },
  { id: "crystal-ball", title: "Crystal Ball", tagline: "Predictions from a very unreliable fortune teller.", group: "Mystery", emoji: "🔮" },
  { id: "secret-vault", title: "Secret Vault", tagline: "Find the hidden badges tucked around the room.", group: "Mystery", emoji: "🗝️" },
  { id: "midnight-message", title: "Midnight Message", tagline: "Sealed until the organizer sets it free.", group: "Mystery", emoji: "🕛" },
  { id: "surprise-reveal", title: "Surprise Reveal", tagline: "A curtain the organizer controls, live.", group: "Mystery", emoji: "🎭" },
  { id: "snowball-battle", title: "Snowball Battle", tagline: "Twenty seconds. Moving targets. Bragging rights.", group: "Playground", emoji: "❄️" },
  { id: "snow-race", title: "Cousins Snow Race", tagline: "Pick a racer and shout at the screen.", group: "Playground", emoji: "🛷" },
  { id: "dance-off", title: "Avatar Dance-Off", tagline: "Tap the beat and make your cartoon cousin move.", group: "Playground", emoji: "🕺" },
  { id: "prize-machine", title: "Prize Machine", tagline: "Spin the reels for a digital collectible.", group: "Playground", emoji: "🎰" },
  { id: "cousins-galaxy", title: "Cousins Galaxy", tagline: "A star for every cousin who opted in.", group: "World", emoji: "🌌" },
  { id: "winter-avatars", title: "Winter Avatars", tagline: "Build your own little cartoon cousin.", group: "World", emoji: "⛄" },
  { id: "reunion-village", title: "Reunion Village", tagline: "A tiny winter village with a secret in every house.", group: "World", emoji: "🏡" },
  { id: "penguin-guide", title: "Penguin Party Guide", tagline: "The fluffiest tour guide in the Arctic.", group: "World", emoji: "🐧" },
  { id: "grand-countdown", title: "Grand Countdown", tagline: "The big moment, with lights and confetti.", group: "Celebration", emoji: "🎉" },
  { id: "memory-wall", title: "Approved Memory Wall", tagline: "Only moderator-approved photos appear here.", group: "Celebration", emoji: "🖼️" },
  { id: "reunion-storybook", title: "Reunion Storybook", tagline: "A tiny illustrated story with page flips.", group: "Celebration", emoji: "📖" },
  { id: "magic-meter", title: "Community Magic Meter", tagline: "Every tap adds a little light to the reunion.", group: "Celebration", emoji: "✨" },
] as const;

export const EXPERIENCE_GROUPS: ExperienceGroup[] = ["Gateway", "Cousin Antics", "Mystery", "Playground", "World", "Celebration"];

export type UniverseReveal = {
  visible: boolean;
  title: string;
  message: string;
  unlockAt: string | null;
};

export type UniverseConfig = {
  enabled: boolean;
  experiences: Record<ExperienceId, boolean>;
  surprises: string[];
  reveal: UniverseReveal;
  magicGoal: number;
};

const allOn = Object.fromEntries(EXPERIENCE_IDS.map((id) => [id, true])) as Record<ExperienceId, boolean>;

export const DEFAULT_UNIVERSE_CONFIG: UniverseConfig = {
  enabled: true,
  experiences: allOn,
  surprises: [
    "A hot chocolate with extra marshmallows is in your future.",
    "Somewhere, a cousin is saving you the last samosa.",
    "Your winter playlist has excellent taste. We checked.",
    "A blanket fort has been reserved in your honour.",
    "You will be the reason someone laughs today.",
    "The group photo will somehow include everyone except the photographer.",
    "A tiny snowman has been quietly cheering you on.",
  ],
  reveal: {
    visible: false,
    title: "A surprise is being prepared",
    message: "The organizers are wrapping something special. Come back soon!",
    unlockAt: null,
  },
  magicGoal: 1000,
};

export const REPORT_REASONS = ["spoiler", "uncomfortable", "broken"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export type UniverseReport = {
  id: string;
  experienceId: ExperienceId;
  reason: ReportReason;
  createdAt: string;
  status: "OPEN" | "DISMISSED";
  /** A one-way hash of the visitor cookie — never the cookie itself. */
  visitorHash: string;
};

function isExperienceId(value: unknown): value is ExperienceId {
  return typeof value === "string" && (EXPERIENCE_IDS as readonly string[]).includes(value);
}

export function parseUniverseConfig(raw: string | undefined | null): UniverseConfig {
  const base = DEFAULT_UNIVERSE_CONFIG;
  if (!raw) return base;
  try {
    const parsed = JSON.parse(raw) as Partial<UniverseConfig>;
    const experiences = { ...allOn };
    if (parsed.experiences && typeof parsed.experiences === "object") {
      for (const id of EXPERIENCE_IDS) {
        const value = (parsed.experiences as Record<string, unknown>)[id];
        if (typeof value === "boolean") experiences[id] = value;
      }
    }
    const surprises = Array.isArray(parsed.surprises)
      ? parsed.surprises.filter((s): s is string => typeof s === "string").slice(0, 24).map((s) => s.slice(0, 160))
      : base.surprises;
    const reveal = parsed.reveal && typeof parsed.reveal === "object" ? parsed.reveal : base.reveal;
    const unlockAt = typeof reveal.unlockAt === "string" && !Number.isNaN(Date.parse(reveal.unlockAt)) ? reveal.unlockAt : null;
    const goal = Number(parsed.magicGoal);
    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : base.enabled,
      experiences,
      surprises: surprises.length ? surprises : base.surprises,
      reveal: {
        visible: Boolean(reveal.visible),
        title: String(reveal.title ?? base.reveal.title).slice(0, 100),
        message: String(reveal.message ?? base.reveal.message).slice(0, 400),
        unlockAt,
      },
      magicGoal: Number.isFinite(goal) ? Math.max(10, Math.min(100000, Math.round(goal))) : base.magicGoal,
    };
  } catch {
    return base;
  }
}

export function parseReports(raw: string | undefined | null): UniverseReport[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((r): r is UniverseReport =>
      Boolean(r) && typeof r === "object" && isExperienceId(r.experienceId) &&
      (REPORT_REASONS as readonly string[]).includes(r.reason) &&
      typeof r.createdAt === "string" && typeof r.visitorHash === "string",
    ).slice(0, 200);
  } catch {
    return [];
  }
}

export function isSafeCustomText(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= 160 && !/[<>[\]{}]/.test(trimmed) && !/(https?:\/\/|www\.|@)/i.test(trimmed);
}

/** Nicknames only — no names, ages, schools, contact details or free text. */
export function safeNickname(value: string | null | undefined, fallback = "Cousin"): string {
  const cleaned = (value ?? "").trim().replace(/[^\p{L}\p{N} _-]/gu, "").replace(/\s+/g, " ").slice(0, 24);
  return cleaned || fallback;
}

export function dailySeed(date = new Date()): number {
  return date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
}

export function pick<T>(pool: readonly T[], seed: number): T {
  return pool[Math.abs(Math.floor(seed)) % pool.length];
}

export function isUnlocked(reveal: UniverseReveal, now = new Date()): boolean {
  if (!reveal.unlockAt) return true;
  const at = Date.parse(reveal.unlockAt);
  return Number.isFinite(at) ? now.getTime() >= at : true;
}

// ---------------------------------------------------------------------------
// Curated content pools. Every line is written by the organizers: visitors only
// choose from these, so nothing unsafe can be submitted through these features.
// ---------------------------------------------------------------------------

export const GIFT_SURPRISES = [
  "A golden star with your name on it (invisible to non-cousins).",
  "A marshmallow that was specifically saved for you.",
  "A newspaper headline: 'COUSIN ARRIVES, ROOM GETS BRIGHTER'.",
  "A pocket-sized compliment you can keep forever.",
  "A certificate for one (1) extra slice of cake.",
  "A snowball with your name on it — the friendly kind.",
  "A tiny violin playing just for your dramatic entrance.",
  "A secret handshake that only you and the penguin know.",
  "A voucher for the best seat near the fireplace.",
  "A mysterious key that opens absolutely nothing, but looks important.",
] as const;

export const WANTED_DESCRIPTORS = [
  "Last seen guarding the last samosa",
  "Expert at turning 'one game' into six hours",
  "Known for dramatic birthday wishes",
  "Could start a dance-off in an empty room",
  "Responsible for 90% of the family group chat",
  "Has never met a blanket they didn't like",
  "Professional hot chocolate taste-tester",
  "Always first to say 'one more round!'",
  "Suspect in the Great Missing Sock Mystery",
  "Makes every group photo slightly funnier",
] as const;

export const COURT_CASES = [
  { charge: "Stealing the last samosa", defence: "It was looking lonely.", guilty: "Guilty — with flavour.", innocent: "Innocent — clearly a rescue mission." },
  { charge: "Turning a 10-minute game into three hours", defence: "Time is a social construct.", guilty: "Guilty — we are still playing.", innocent: "Innocent — commitment is a virtue." },
  { charge: "Laughing at their own joke before telling it", defence: "The joke was genuinely funny.", guilty: "Guilty — but relatable.", innocent: "Innocent — enthusiasm is not a crime." },
  { charge: " disappearing from the group photo", defence: "I was taking the photo.", guilty: "Guilty — classic move.", innocent: "Innocent — the camera needs a hero." },
  { charge: "Calling the snow 'a bit chilly'", defence: "Accuracy matters.", guilty: "Guilty — understatement of the year.", innocent: "Innocent — technically correct." },
  { charge: "Hiding the good blanket", defence: "It was cold. I was warm. Balance.", guilty: "Guilty — cozy hoarding.", innocent: "Innocent — survival." },
] as const;

export const SAFE_ROASTS = [
  "You bring a blanket to a bonfire. Respect the commitment.",
  "Your dance moves have their own weather system.",
  "You say 'five minutes' in the same language as 'forever'.",
  "You could turn a quiet room into a talent show in four seconds.",
  "Your hot chocolate order has a spreadsheet behind it.",
  "You find the snack table the way a compass finds north.",
  "You laugh at your own jokes because you know they're good.",
  "You make every group photo look like a movie poster.",
  "You have never met a story you couldn't make longer.",
  "You are the reason the family chat has notifications.",
] as const;

export const PREDICTIONS = [
  "Next winter, you will be the unofficial keeper of the hot chocolate recipe.",
  "A future reunion will feature a dance-off you didn't plan to join. You will win.",
  "You will accidentally become the family photographer and secretly love it.",
  "Someone will ask your advice about snacks. You will take it very seriously.",
  "Your famous laugh will be heard from the next room. Again.",
  "A snowman will be built in your honour. It will have excellent eyebrows.",
  "You will say 'just one more game' and the sun will come up.",
  "A new family tradition will be named after you. We're not saying which one.",
  "You will find the missing sock. It was under your own chair the whole time.",
] as const;

export const COMPLIMENTS = [
  "You make every room feel warmer just by walking in.",
  "Your laugh is the family's favourite sound.",
  "You remember the little things nobody else notices.",
  "You are extremely good at making people feel included.",
  "Your stories could make a snowman cry happy tears.",
  "You have the best kind of energy: the cozy kind.",
  "You turn ordinary evenings into core memories.",
  "You are brave, kind and suspiciously good at games.",
] as const;

export const BADGES = [
  { id: "snowflake", name: "Snowflake Finder", emoji: "❄️", hint: "Something cold and tiny is hiding near the top." },
  { id: "samosa", name: "Samosa Guardian", emoji: "🥟", hint: "The snack table has a secret." },
  { id: "chai", name: "Chai Detective", emoji: "☕", hint: "Look where the warm drinks live." },
  { id: "star", name: "Golden Star", emoji: "⭐", hint: "Look up. Then look up again." },
  { id: "penguin", name: "Penguin Friend", emoji: "🐧", hint: "A tiny tuxedo is watching you." },
  { id: "key", name: "Key Keeper", emoji: "🗝️", hint: "Every vault needs a tiny key." },
] as const;

export const PRIZES = [
  { name: "Golden Marshmallow", emoji: "🍡", rarity: "Common" },
  { name: "Arctic Chai Mug", emoji: "☕", rarity: "Common" },
  { name: "Snowflake Pin", emoji: "❄️", rarity: "Rare" },
  { name: "Penguin Badge", emoji: "🐧", rarity: "Rare" },
  { name: "Star of the Reunion", emoji: "⭐", rarity: "Legendary" },
  { name: "Samosa Crown", emoji: "👑", rarity: "Legendary" },
] as const;

export const STAR_LABELS = [
  "Professional hug distributor",
  "Keeper of the good playlist",
  "Human hot chocolate alert system",
  "Chief laugh officer",
  "Master of the cozy blanket",
  "Snack table visionary",
  "Group photo legend",
  "Winter wizard",
] as const;

export const VILLAGE_SPOTS = [
  { id: "bakery", name: "Hot Chocolate Cabin", emoji: "☕", secret: "The secret ingredient is an extra spoonful of love." },
  { id: "games", name: "Ludo Lodge", emoji: "🎲", secret: "Someone has been moving pieces when nobody looks." },
  { id: "music", name: "Carol Cottage", emoji: "🎶", secret: "The penguin is the real lead singer." },
  { id: "photos", name: "Memory Studio", emoji: "📸", secret: "There is always one more photo to take." },
  { id: "stars", name: "Star Observatory", emoji: "🔭", secret: "That bright one is the cousin who saved a seat for you." },
  { id: "fire", name: "Bonfire Barn", emoji: "🔥", secret: "The best stories start with 'remember that time...'" },
] as const;

export const STORY_PAGES = [
  { title: "A little snow, a lot of cousins", text: "It began with a message: 'Everyone free in winter?' Three seconds later, the family chat exploded.", emoji: "❄️" },
  { title: "The Great Snack Debate", text: "The menu was discussed with the seriousness of a royal summit. Samosas won by a dramatic margin.", emoji: "🥟" },
  { title: "The Night of the Dance-Off", text: "Nobody agreed to a dance-off. Everybody ended up in one. The penguin won, allegedly.", emoji: "🕺" },
  { title: "Photos, Photos, Photos", text: "One hundred photos were taken. Ninety-nine involved someone laughing mid-sentence.", emoji: "📸" },
  { title: "The Quiet Moment", text: "Between the games and the noise, everyone sat together, warm and a little sentimental.", emoji: "🕯️" },
  { title: "Until Next Winter", text: "The doors closed, the snow kept falling, and everybody already wanted to do it again.", emoji: "🏡" },
] as const;

export const REACTIONS = ["😂", "🥹", "😮", "👏", "🫶", "🔥", "❄️", "🐧"] as const;
