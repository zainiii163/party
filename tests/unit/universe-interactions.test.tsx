import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SnowGlobe, MagicalPortal } from "@/components/universe/gateway";
import { CrystalBall, SecretVault } from "@/components/universe/mystery";
import { ComplimentDelivery } from "@/components/universe/antics";
import { MagicMeter } from "@/components/universe/celebration";
import { COMPLIMENTS } from "@/lib/universe";

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

function setReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches, media: query, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => {
  window.localStorage.clear();
  Object.defineProperty(window, "IntersectionObserver", { writable: true, value: MockIntersectionObserver });
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false;
    HTMLElement.prototype.setPointerCapture = () => {};
    HTMLElement.prototype.releasePointerCapture = () => {};
  }
  setReducedMotion(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Universe interactions", () => {
  it("shakeable snow globe updates its world", () => {
    render(<SnowGlobe />);
    fireEvent.click(screen.getByRole("button", { name: /Shake it!/i }));
    expect(screen.getByText(/Shakes: 1/)).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole("button", { name: /Shake the snow globe/i }));
    expect(screen.getByText(/Shakes: 2/)).toBeInTheDocument();
  });

  it("a golden door reveals an organizer-written surprise", async () => {
    render(<MagicalPortal surprises={["A very kind winter surprise"]} />);
    fireEvent.click(screen.getByRole("button", { name: "Open golden door 1" }));
    await waitFor(() => expect(screen.getByText("A very kind winter surprise")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Try another door/i })).toBeInTheDocument();
  });

  it("crystal ball reveals a curated prediction", async () => {
    render(<CrystalBall />);
    fireEvent.click(screen.getByRole("button", { name: /Ask again/i }));
    await waitFor(() => expect(screen.getByText("The ball says")).toBeInTheDocument());
  });

  it("secret vault badges are collected locally, without accounts", () => {
    render(<SecretVault />);
    expect(screen.getByText(/0 \/ 6 badges found/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Inspect tile 1/ }));
    expect(screen.getByText(/1 \/ 6 badges found/)).toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem("universe.vault.badges") ?? "[]");
    expect(stored).toHaveLength(1);
  });

  it("compliments use only pre-written kind lines and opt-in nicknames", async () => {
    render(<ComplimentDelivery cousins={[{ id: "c1", nickname: "Ayesh" }]} />);
    fireEvent.change(screen.getByLabelText("Choose a recipient"), { target: { value: "Ayesh" } });
    fireEvent.click(screen.getByRole("button", { name: /Deliver compliment/i }));
    await waitFor(() => {
      const delivered = screen.getByText((_, node) =>
        Boolean(node?.textContent?.startsWith("Ayesh:") && COMPLIMENTS.some((c) => node.textContent?.includes(c))));
      expect(delivered).toBeInTheDocument();
    });
  });

  it("magic meter posts an allow-listed action and updates from the server count", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, magicCount: 11 }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<MagicMeter initialCount={10} goal={100} />);
    fireEvent.click(screen.getByRole("button", { name: /Add a sparkle/i }));
    await waitFor(() => expect(screen.getByText("11")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith("/api/universe", expect.objectContaining({ method: "POST" }));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({ action: "magic", source: "magic-meter" });
  });

  it("experiences still work when reduced motion is requested", () => {
    setReducedMotion(true);
    render(<SnowGlobe />);
    fireEvent.click(screen.getByRole("button", { name: /Shake it!/i }));
    expect(screen.getByText(/Shakes: 1/)).toBeInTheDocument();
  });
});
