import { z } from "zod";

export const attendanceSchema = z.enum(["YES", "MAYBE", "NO"]);
export const categories = [
  "Food & Menu", "Venue / Location", "Games", "Activities",
  "Budget / Contributions", "Decorations", "Date & Timing", "Other Ideas",
] as const;

export const rsvpSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(80),
  nickname: z.string().trim().min(1, "Please enter a nickname").max(40),
  attendance: attendanceSchema,
  guests: z.number().int().min(0).max(12),
  favoriteFood: z.string().trim().max(120).optional().or(z.literal("")),
  preferredActivity: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(500).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  consentPublic: z.boolean(),
});

export const rsvpUpdateSchema = rsvpSchema.omit({ fullName: true });

export const rsvpLookupSchema = z.object({ token: z.string().min(20).max(200) });

export const suggestionSchema = z.object({
  submitter: z.string().trim().min(1, "Please tell us your name").max(50),
  category: z.enum(categories),
  title: z.string().trim().min(3, "Give your idea a short title").max(100),
  description: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(800),
});

export const guestbookSchema = z.object({
  nickname: z.string().trim().min(1).max(40),
  message: z.string().trim().min(3, "Write a little something").max(500),
});

export const pollVoteSchema = z.object({
  pollId: z.string().min(1),
  optionIds: z.array(z.string().min(1)).min(1).max(10),
});

export const awardVoteSchema = z.object({
  categoryId: z.string().min(1),
  nomineeId: z.string().min(1),
});

export const photoMetaSchema = z.object({
  caption: z.string().trim().min(1).max(200),
  categoryId: z.string().optional().or(z.literal("")),
  uploader: z.string().trim().max(50).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
});

export const eventSchema = z.object({
  title: z.string().trim().min(2).max(120),
  eventDate: z.string().optional().or(z.literal("")),
  startTime: z.string().trim().max(30),
  endTime: z.string().trim().max(30),
  venue: z.string().trim().max(160).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  dressCode: z.string().trim().max(200),
  hostMessage: z.string().trim().max(1200),
  description: z.string().trim().max(1200),
});

/** HTML number inputs return strings; convert them before Zod validation. An empty field means zero guests. */
export function parseGuestCount(value: unknown): number {
  if (value === "" || value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return Number(value);
}

export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

export function validateImage(file: File): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { ok: false, error: "Only JPG, PNG, WebP or AVIF images are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Images must be smaller than 6 MB." };
  }
  if (file.size === 0) return { ok: false, error: "The image is empty." };
  return { ok: true };
}

type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

function matchesAscii(bytes: Uint8Array, offset: number, value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    if (bytes[offset + i] !== value.charCodeAt(i)) return false;
  }
  return true;
}

const IMAGE_SIGNATURES: Record<AllowedImageType, (bytes: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => matchesAscii(b, 1, "PNG") && b[0] === 0x89 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  "image/webp": (b) => matchesAscii(b, 0, "RIFF") && matchesAscii(b, 8, "WEBP"),
  "image/avif": (b) => matchesAscii(b, 4, "ftyp") && ["avif", "avis", "mif1", "msf1"].some((brand) => matchesAscii(b, 8, brand)),
};

/** Sniff the real bytes so a renamed script/HTML file cannot pass as an image. */
export async function validateImageContent(file: File): Promise<{ ok: true; contentType: AllowedImageType } | { ok: false; error: string }> {
  const contentType = file.type as AllowedImageType;
  const matches = IMAGE_SIGNATURES[contentType];
  if (!matches) return { ok: false, error: "Only JPG, PNG, WebP or AVIF images are allowed." };
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!matches(header)) return { ok: false, error: "The file contents do not match its image type." };
  return { ok: true, contentType };
}
