import { describe, expect, it } from "vitest";
import {
  DEFAULT_UNIVERSE_CONFIG, EXPERIENCES, EXPERIENCE_IDS, GIFT_SURPRISES,
  isSafeCustomText, isUnlocked, parseReports, parseUniverseConfig,
  pick, safeNickname,
} from "@/lib/universe";
import { universeActionSchema, universeAdminSchema } from "@/lib/validation";

describe("Cousins Universe registry", () => {
  it("registers 25 unique, real experiences", () => {
    expect(EXPERIENCES).toHaveLength(25);
    expect(new Set(EXPERIENCES.map((e) => e.id)).size).toBe(25);
    expect(EXPERIENCE_IDS).toHaveLength(25);
    for (const experience of EXPERIENCES) {
      expect(experience.title.length).toBeGreaterThan(3);
      expect(experience.tagline.length).toBeGreaterThan(10);
    }
  });
});

describe("universe configuration", () => {
  it("falls back safely to defaults for missing or corrupt settings", () => {
    expect(parseUniverseConfig(undefined)).toEqual(DEFAULT_UNIVERSE_CONFIG);
    expect(parseUniverseConfig("not json")).toEqual(DEFAULT_UNIVERSE_CONFIG);
  });

  it("keeps only boolean flags, bounded numbers and safe surprise lines", () => {
    const config = parseUniverseConfig(JSON.stringify({
      enabled: false,
      experiences: { "snow-globe": false, "magic-meter": false, nonsense: false },
      surprises: ["<script>alert(1)</script>", "A kind surprise", 42],
      magicGoal: 99999999,
      reveal: { visible: true, title: "Hi", message: "Hello", unlockAt: "nope" },
    }));
    expect(config.enabled).toBe(false);
    expect(config.experiences["snow-globe"]).toBe(false);
    expect(config.experiences["magic-meter"]).toBe(false);
    expect(config.experiences["winter-portal"]).toBe(true);
    expect(config.surprises).toEqual(["<script>alert(1)</script>", "A kind surprise"]);
    expect(config.magicGoal).toBe(100000);
    expect(config.reveal.unlockAt).toBeNull();
  });

  it("only unlocks scheduled reveals once time has passed", () => {
    const now = new Date("2026-12-25T00:00:00.000Z");
    expect(isUnlocked({ visible: true, title: "x", message: "y", unlockAt: null }, now)).toBe(true);
    expect(isUnlocked({ visible: true, title: "x", message: "y", unlockAt: "2026-12-26T00:00:00.000Z" }, now)).toBe(false);
    expect(isUnlocked({ visible: true, title: "x", message: "y", unlockAt: "2026-12-24T00:00:00.000Z" }, now)).toBe(true);
  });

  it("drops malformed reports and accepts only curated reasons", () => {
    const reports = parseReports(JSON.stringify([
      { id: "r1", experienceId: "crystal-ball", reason: "spoiler", createdAt: "2026-01-01T00:00:00.000Z", status: "OPEN", visitorHash: "abc" },
      { id: "r2", experienceId: "not-an-experience", reason: "spoiler", createdAt: "2026-01-01T00:00:00.000Z", status: "OPEN", visitorHash: "abc" },
      { id: "r3", experienceId: "crystal-ball", reason: "free-text-attack", createdAt: "2026-01-01T00:00:00.000Z", status: "OPEN", visitorHash: "abc" },
    ]));
    expect(reports).toHaveLength(1);
    expect(reports[0].visitorHash).toBe("abc");
    expect(JSON.stringify(reports)).not.toContain("cookie");
  });
});

describe("privacy and safe content", () => {
  it("accepts nicknames only and strips markup, links and contact details", () => {
    expect(safeNickname("  Ayesh  ")).toBe("Ayesh");
    expect(safeNickname("<b>Ayesh</b>")).toBe("bAyeshb");
    expect(safeNickname("Ayesh khan@example.com")).toBe("Ayesh khanexamplecom");
    expect(safeNickname("", "Cousin")).toBe("Cousin");
    expect(safeNickname("x".repeat(80)).length).toBe(24);
  });

  it("rejects unsafe organizer text before it reaches visitors", () => {
    expect(isSafeCustomText("A warm surprise")).toBe(true);
    expect(isSafeCustomText("<img src=x onerror=alert(1)>")).toBe(false);
    expect(isSafeCustomText("Visit https://example.com")).toBe(false);
    expect(isSafeCustomText("email me at cousin@example.com")).toBe(false);
    expect(isSafeCustomText("x".repeat(200))).toBe(false);
  });

  it("picks deterministic, curated content", () => {
    expect(pick(GIFT_SURPRISES, 7)).toBe(GIFT_SURPRISES[7 % GIFT_SURPRISES.length]);
    expect(pick(GIFT_SURPRISES, 7)).toBe(pick(GIFT_SURPRISES, 7));
    expect(GIFT_SURPRISES.every((gift) => gift.length > 10 && !/[<>]/.test(gift))).toBe(true);
  });
});

describe("API validation", () => {
  it("rejects unknown actions, IDs and free text from visitors", () => {
    expect(universeActionSchema.safeParse({ action: "magic", source: "magic-meter" }).success).toBe(true);
    expect(universeActionSchema.safeParse({ action: "report", experienceId: "crystal-ball", reason: "spoiler" }).success).toBe(true);
    expect(universeActionSchema.safeParse({ action: "report", experienceId: "anything", reason: "spoiler" }).success).toBe(false);
    expect(universeActionSchema.safeParse({ action: "report", experienceId: "crystal-ball", reason: "someone said a mean thing" }).success).toBe(false);
    expect(universeActionSchema.safeParse({ action: "sql", source: "magic-meter" }).success).toBe(false);
  });

  it("validates organizer-only configuration changes", () => {
    expect(universeAdminSchema.safeParse({ action: "toggle", id: "snow-globe", enabled: false }).success).toBe(true);
    expect(universeAdminSchema.safeParse({ action: "surprises", surprises: ["Kind note", "Visit http://bad"] }).success).toBe(false);
    expect(universeAdminSchema.safeParse({ action: "reveal", visible: true, title: "Hi", message: "<script>", unlockAt: null }).success).toBe(false);
    expect(universeAdminSchema.safeParse({ action: "goal", magicGoal: -5 }).success).toBe(false);
  });
});
