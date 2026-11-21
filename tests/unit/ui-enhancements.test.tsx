import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryGallery } from "@/components/memory-gallery";
import type { PublicPhoto } from "@/lib/data";

// framer-motion whileInView and Radix both need these browser APIs in jsdom.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}
Object.defineProperty(window, "IntersectionObserver", { writable: true, value: MockIntersectionObserver });
if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
}

const photos: PublicPhoto[] = [
  { id: "p1", imageUrl: "/media/1", caption: "First memory", uploader: "Ayesh", categoryId: "c1", categoryName: "Old Memories", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "p2", imageUrl: "/media/2", caption: "Second memory", uploader: "Zain", categoryId: "c1", categoryName: "Old Memories", createdAt: "2026-01-02T00:00:00.000Z" },
];

describe("memory gallery lightbox", () => {
  it("shows a counter and navigates with arrow keys", () => {
    render(
      <MemoryGallery
        photos={photos}
        categories={[{ id: "c1", name: "Old Memories" }]}
        canUpload={false}
        hasStorage={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /First memory/ }));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getAllByText("Second memory").length).toBeGreaterThan(0);

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("toggles zoom with the Z key and the zoom button", () => {
    render(
      <MemoryGallery
        photos={photos}
        categories={[{ id: "c1", name: "Old Memories" }]}
        canUpload={false}
        hasStorage={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /First memory/ }));
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "z" });
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
  });
});
