import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { PollsBoard } from "@/components/polls-board";
import { RSVP_SUCCESS_EVENT } from "@/lib/events";
import type { PublicPoll } from "@/lib/data";

// framer-motion's whileInView needs this in jsdom; the animation itself is
// irrelevant to vote eligibility.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

const polls: PublicPoll[] = [
  {
    id: "poll-1",
    question: "Food Battle",
    category: "Food & Menu",
    status: "OPEN",
    multiple: false,
    options: [
      { id: "opt-1", label: "BBQ", votes: 0 },
      { id: "opt-2", label: "Biryani", votes: 0 },
    ],
  },
];

describe("PollsBoard vote eligibility", () => {
  it("stays locked until the RSVP success event fires", () => {
    render(<PollsBoard initial={polls} myVotes={{}} canVote={false} />);

    expect(screen.getByText("RSVP to vote in polls")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /BBQ/ })).toBeDisabled();

    act(() => {
      window.dispatchEvent(new Event(RSVP_SUCCESS_EVENT));
    });

    expect(screen.queryByText("RSVP to vote in polls")).toBeNull();
    expect(screen.getByRole("button", { name: /BBQ/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Pick an option" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Biryani/ }));
    expect(screen.getByRole("button", { name: "Cast my vote" })).toBeEnabled();
  });

  it("is already unlocked when the server reports a registered participant", () => {
    render(<PollsBoard initial={polls} myVotes={{}} canVote />);

    expect(screen.queryByText("RSVP to vote in polls")).toBeNull();
    expect(screen.getByRole("button", { name: /BBQ/ })).toBeEnabled();
  });

  it("keeps closed polls disabled even after the unlock event", () => {
    const closed = [{ ...polls[0], status: "CLOSED" }] as PublicPoll[];
    render(<PollsBoard initial={closed} myVotes={{}} canVote={false} />);

    act(() => {
      window.dispatchEvent(new Event(RSVP_SUCCESS_EVENT));
    });

    expect(screen.getByText("Closed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /BBQ/ })).toBeDisabled();
  });
});
