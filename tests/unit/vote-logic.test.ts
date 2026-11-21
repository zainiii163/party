import { describe, expect, it } from "vitest";
import { awardWinner, resolvePollSelection, toggleVote } from "@/lib/vote-logic";

const poll = { status: "OPEN" as const, multiple: false, optionIds: ["a", "b", "c"] };

describe("voting rules", () => {
  it("enforces one choice for single-choice polls", () => {
    expect(resolvePollSelection(poll, [], ["a"])).toEqual(["a"]);
    expect(resolvePollSelection(poll, [], ["a", "b"])).toEqual({ error: "Please choose one option." });
  });

  it("allows changing a vote and multiple selections", () => {
    expect(resolvePollSelection(poll, ["a"], ["b"])).toEqual(["b"]);
    expect(resolvePollSelection({ ...poll, multiple: true }, ["a"], ["b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("rejects invalid options and closed polls", () => {
    expect(resolvePollSelection(poll, [], ["z"])).toEqual({ error: "Invalid option selected." });
    expect(resolvePollSelection({ ...poll, status: "CLOSED" as const }, [], ["a"])).toEqual({ error: "This poll is closed." });
  });

  it("toggles upvotes and handles ties", () => {
    expect(toggleVote(["x"], "y")).toEqual(["x", "y"]);
    expect(toggleVote(["x", "y"], "y")).toEqual(["x"]);
    expect(awardWinner([{ id: "a", votes: 2 }, { id: "b", votes: 2 }])).toBeNull();
    expect(awardWinner([{ id: "a", votes: 3 }, { id: "b", votes: 2 }])).toBe("a");
  });
});
