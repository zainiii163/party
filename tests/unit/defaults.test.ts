import { describe, expect, it } from "vitest";
import { DEFAULT_POLLS, DEFAULT_SETTINGS, DEFAULT_WHEEL, SECTIONS } from "@/lib/defaults";
import { formatDate, initials, safeText } from "@/lib/utils";

describe("safe defaults and helpers", () => {
  it("never invents people or votes", () => {
    expect(JSON.stringify(DEFAULT_POLLS)).not.toMatch(/submitter|participant/);
    expect(DEFAULT_POLLS.every((poll) => poll.options.every((option) => !("votes" in option)))).toBe(true);
  });

  it("provides the requested activity wheel and sections", () => {
    expect(DEFAULT_WHEEL).toContain("Group Selfie");
    expect(DEFAULT_WHEEL).toContain("Ludo Challenge");
    expect(SECTIONS.map((s) => s.key)).toContain("guestbook");
    expect(DEFAULT_SETTINGS.registrationsOpen).toBe("true");
  });

  it("formats names and unconfirmed dates safely", () => {
    expect(initials("Ayesha Khan")).toBe("AK");
    expect(formatDate(null)).toBe("Date to Be Announced");
    expect(safeText("  hello  ", 3)).toBe("hel");
  });
});
