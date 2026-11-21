import { describe, expect, it } from "vitest";
import { getTimeLeft, isDateConfirmed } from "@/lib/countdown";

describe("countdown", () => {
  const now = new Date("2026-01-01T00:00:00.000Z").getTime();

  it("returns zeroes for an unconfirmed date", () => {
    expect(getTimeLeft(null, now)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: false });
    expect(isDateConfirmed(null)).toBe(false);
    expect(isDateConfirmed("not-a-date")).toBe(false);
  });

  it("calculates days, hours, minutes and seconds", () => {
    const target = new Date(now + 2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5_000).toISOString();
    expect(getTimeLeft(target, now)).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5, done: false });
  });

  it("marks past dates as done", () => {
    expect(getTimeLeft(new Date(now - 1000).toISOString(), now).done).toBe(true);
  });
});
