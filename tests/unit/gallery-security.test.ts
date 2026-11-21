import { File as NodeFile } from "node:buffer";
import { describe, expect, it } from "vitest";
import { checkInMemoryRateLimit } from "@/lib/in-memory-rate-limit";
import { canViewPhoto, mediaCacheHeaders, photoMediaPath, sanitizeAdminPhoto } from "@/lib/photo-security";
import { photoMetaSchema, validateImageContent } from "@/lib/validation";

function ascii(value: string): number[] {
  return Array.from(value, (char) => char.charCodeAt(0));
}

const jpegHeader = [0xff, 0xd8, 0xff, 0xe0, ...ascii("JFIF"), 0, 1];
const pngHeader = [0x89, ...ascii("PNG"), 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13];
const webpHeader = [...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")];
const avifHeader = [0, 0, 0, 24, ...ascii("ftyp"), ...ascii("avif"), ...ascii("mif1")];

// jsdom's File lacks Blob.arrayBuffer(); Node's native File matches the upload runtime.
function imageFile(bytes: number[], type: string) {
  return new NodeFile([new Uint8Array(bytes)], "photo.bin", { type }) as unknown as File;
}

describe("gallery privacy rules", () => {
  it("only exposes approved photos to the public", () => {
    expect(canViewPhoto("APPROVED", false)).toBe(true);
    expect(canViewPhoto("PENDING", false)).toBe(false);
    expect(canViewPhoto("REJECTED", false)).toBe(false);
    expect(canViewPhoto("PENDING", true)).toBe(true);
  });

  it("builds only a controlled media path and never a storage URL", () => {
    expect(photoMediaPath("abc123")).toBe("/api/media/abc123");
    expect(photoMediaPath("a/b")).toBe("/api/media/a%2Fb");
    expect(photoMediaPath("abc123")).not.toContain("http");
  });

  it("strips raw private URLs from admin photo responses", () => {
    const result = sanitizeAdminPhoto({
      id: "photo-1",
      caption: "Winter walk",
      uploader: "Sara",
      status: "PENDING",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      categoryId: "cat-1",
      category: { name: "Family" },
      imageUrl: "https://private.example/blob/secret",
      blurUrl: "https://private.example/blob/blur",
      secretInternalField: "must not leak",
    });
    expect(result.imageUrl).toBe("/api/media/photo-1");
    expect(JSON.stringify(result)).not.toContain("private.example");
    expect(JSON.stringify(result)).not.toContain("secretInternalField");
    expect(result.caption).toBe("Winter walk");
  });

  it("disables caching for every media response", () => {
    expect(mediaCacheHeaders(false)["Cache-Control"]).toContain("no-store");
    expect(mediaCacheHeaders(true)["Cache-Control"]).toContain("no-store");
    expect(mediaCacheHeaders(true)["X-Robots-Tag"]).toContain("noindex");
  });
});

describe("image content validation", () => {
  const supported: [string, number[]][] = [
    ["image/jpeg", jpegHeader],
    ["image/png", pngHeader],
    ["image/webp", webpHeader],
    ["image/avif", avifHeader],
  ];

  for (const [type, bytes] of supported) {
    it(`accepts a real ${type} header`, async () => {
      expect(await validateImageContent(imageFile(bytes, type))).toEqual({ ok: true, contentType: type });
    });
  }

  it("rejects HTML disguised as a JPEG", async () => {
    const result = await validateImageContent(imageFile(ascii("<html><script>alert(1)</script>"), "image/jpeg"));
    expect(result.ok).toBe(false);
  });

  it("rejects a truncated image header", async () => {
    expect((await validateImageContent(imageFile([0xff, 0xd8], "image/jpeg"))).ok).toBe(false);
    expect((await validateImageContent(imageFile([0x89, ...ascii("PN")], "image/png"))).ok).toBe(false);
  });

  it("rejects an unsupported declared type", async () => {
    expect((await validateImageContent(imageFile(ascii("<svg></svg>"), "image/svg+xml"))).ok).toBe(false);
  });
});

describe("media rate limiting and metadata", () => {
  it("blocks requests after the configured burst", () => {
    const key = `test-media-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      expect(checkInMemoryRateLimit(key, 3, 60_000).ok).toBe(true);
    }
    const blocked = checkInMemoryRateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("requires a caption and bounds uploader metadata", () => {
    expect(photoMetaSchema.safeParse({ caption: "   ", categoryId: "", uploader: "" }).success).toBe(false);
    expect(photoMetaSchema.safeParse({ caption: "Family", uploader: "x".repeat(51) }).success).toBe(false);
    expect(photoMetaSchema.safeParse({ caption: "Family", uploader: "Sara" }).success).toBe(true);
  });
});
