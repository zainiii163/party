import { describe, expect, it } from "vitest";
import { guestbookSchema, MAX_IMAGE_BYTES, parseGuestCount, rsvpSchema, suggestionSchema, validateImage } from "@/lib/validation";

describe("validation schemas", () => {
  it("accepts a complete RSVP and rejects bad attendance", () => {
    const valid = {
      fullName: "Ayesha Khan", nickname: "Ayesh", attendance: "YES", guests: 2,
      favoriteFood: "Biryani", preferredActivity: "Ludo", message: "Excited!",
      whatsapp: "+92 300 1234567", consentPublic: true,
    };
    expect(rsvpSchema.parse(valid)).toMatchObject({ attendance: "YES", guests: 2, consentPublic: true });
    expect(rsvpSchema.safeParse({ ...valid, attendance: "ALWAYS" }).success).toBe(false);
    expect(rsvpSchema.safeParse({ ...valid, guests: 99 }).success).toBe(false);
  });

  it("enforces suggestion category and length limits", () => {
    const idea = { submitter: "Zain", category: "Games", title: "Ludo tournament", description: "A friendly bracket for everyone." };
    expect(suggestionSchema.safeParse(idea).success).toBe(true);
    expect(suggestionSchema.safeParse({ ...idea, category: "Unknown" }).success).toBe(false);
    expect(suggestionSchema.safeParse({ ...idea, description: "short" }).success).toBe(false);
  });

  it("limits guestbook messages and rejects empty text", () => {
    expect(guestbookSchema.safeParse({ nickname: "A", message: "Love you all!" }).success).toBe(true);
    expect(guestbookSchema.safeParse({ nickname: "A", message: "   " }).success).toBe(false);
    expect(guestbookSchema.safeParse({ nickname: "A", message: "x".repeat(501) }).success).toBe(false);
  });

  it("converts HTML number input values before RSVP validation", () => {
    expect(parseGuestCount("1")).toBe(1);
    expect(parseGuestCount("12")).toBe(12);
    expect(parseGuestCount("")).toBe(0);
    expect(rsvpSchema.safeParse({
      fullName: "Ayesha Khan", nickname: "Ayesh", attendance: "YES", guests: parseGuestCount("1"), consentPublic: true,
    }).success).toBe(true);
  });

  it("validates image type and size", () => {
    expect(validateImage(new File(["x"], "a.jpg", { type: "image/jpeg" })).ok).toBe(true);
    expect(validateImage(new File(["x"], "a.svg", { type: "image/svg+xml" })).ok).toBe(false);
    expect(validateImage(new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "a.png", { type: "image/png" })).ok).toBe(false);
  });
});
