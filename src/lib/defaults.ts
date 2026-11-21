export const SECTIONS = [
  { key: "home", label: "Home" },
  { key: "event", label: "Event" },
  { key: "rsvp", label: "RSVP" },
  { key: "cousins", label: "Cousins" },
  { key: "suggestions", label: "Suggestions" },
  { key: "polls", label: "Polls" },
  { key: "plan", label: "The Plan" },
  { key: "awards", label: "Awards" },
  { key: "fun", label: "Fun Zone" },
  { key: "memories", label: "Memories" },
  { key: "guestbook", label: "Guestbook" },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

export const DEFAULT_SETTINGS: Record<string, string> = {
  registrationsOpen: "true",
  attendancePublic: "true",
  suggestionsOpen: "true",
  guestbookOpen: "true",
  memorySubmissionsOpen: "false",
  pollsEnabled: "true",
  planEnabled: "true",
  awardsEnabled: "false",
  wheelEnabled: "true",
  galleryEnabled: "true",
  registrationLimit: "0",
  ...Object.fromEntries(SECTIONS.map((s) => [`section_${s.key}`, "true"])),
};

export const DEFAULT_WHEEL = [
  "Group Selfie",
  "Ludo Challenge",
  "Tell a Funny Story",
  "Dance Challenge",
  "Guess the Song",
  "Quick Trivia",
  "Truth or Dare — Family Friendly",
  "Best Dressed Cousin",
];

export const DEFAULT_SCHEDULE = [
  { id: "default-1", time: "4:00 PM", title: "Welcome Gathering", note: "Hugs, hot chocolate and catching up." },
  { id: "default-2", time: "5:00 PM", title: "Food & Refreshments", note: "The reunion feast begins." },
  { id: "default-3", time: "6:30 PM", title: "Games", note: "Ludo, cricket and friendly rivalries." },
  { id: "default-4", time: "8:00 PM", title: "Bonfire / Movie Night", note: "Stories under the winter sky." },
  { id: "default-5", time: "9:15 PM", title: "Group Photos", note: "One for the scrapbook." },
  { id: "default-6", time: "10:00 PM", title: "Closing Celebration", note: "Until we meet again." },
];

export const DEFAULT_DECISIONS = [
  { key: "menu", label: "Menu", value: null as string | null, status: "Under Discussion" },
  { key: "venue", label: "Venue", value: null as string | null, status: "Under Discussion" },
  { key: "games", label: "Games", value: null as string | null, status: "Voting Open" },
  { key: "date", label: "Date", value: null as string | null, status: "Pending" },
  { key: "activities", label: "Activities", value: null as string | null, status: "Under Discussion" },
];

export const DEFAULT_POLLS = [
  {
    id: "default-food-battle",
    question: "Food Battle",
    category: "Food & Menu",
    status: "OPEN",
    multiple: false,
    options: [
      { id: "food-bbq", label: "BBQ" },
      { id: "food-biryani", label: "Biryani" },
      { id: "food-karahi", label: "Karahi" },
      { id: "food-pizza", label: "Pizza" },
    ],
  },
  {
    id: "default-games",
    question: "Games",
    category: "Games",
    status: "OPEN",
    multiple: false,
    options: [
      { id: "game-cricket", label: "Cricket" },
      { id: "game-ludo", label: "Ludo" },
      { id: "game-uno", label: "UNO" },
      { id: "game-badminton", label: "Badminton" },
    ],
  },
  {
    id: "default-entertainment",
    question: "Evening Entertainment",
    category: "Activities",
    status: "OPEN",
    multiple: false,
    options: [
      { id: "ent-bonfire", label: "Bonfire" },
      { id: "ent-movie", label: "Movie Night" },
      { id: "ent-music", label: "Music & Games" },
      { id: "ent-stories", label: "Storytelling" },
    ],
  },
];

export const DEFAULT_GALLERY_CATEGORIES = [
  "Old Memories", "Funny Moments", "Family Gatherings", "Reunion 2026",
];

export const DEFAULT_EVENT = {
  id: "main",
  title: "Cousins Winter Reunion 2026",
  eventDate: null as string | null,
  startTime: "4:00 PM",
  endTime: "10:00 PM",
  venue: null as string | null,
  location: null as string | null,
  dressCode: "Cozy winter layers with a touch of gold",
  hostMessage: "We cannot wait to have everyone together under one roof. Bring your laughter, your appetite and your favourite stories!",
  description: "A warm winter celebration of family, food, games and memories that will stay with us for years.",
  heroLine: "The Winter Feels Warmer When We're Together.",
  subheading: "One Family. Endless Memories. One Unforgettable Winter Reunion.",
};
