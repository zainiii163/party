/**
 * Shared privacy rules for gallery photos. Kept free of DB/SDK imports so the
 * rules can be unit-tested directly.
 */

/** Only approved photos are public; pending/rejected are visible to organizers only. */
export function canViewPhoto(status: string, isAdmin: boolean): boolean {
  return status === "APPROVED" || isAdmin;
}

/** The only image URL ever handed to a browser — never a raw Blob URL. */
export function photoMediaPath(id: string): string {
  return `/api/media/${encodeURIComponent(id)}`;
}

/** No caching: a rejected photo must disappear immediately, with no CDN/browser copy. */
export function mediaCacheHeaders(isPrivatePreview: boolean): Record<string, string> {
  return {
    "Cache-Control": "private, no-store, must-revalidate",
    ...(isPrivatePreview ? { "X-Robots-Tag": "noindex, nofollow" } : {}),
  };
}

/** Allow-list admin photo fields and replace the stored private URL with the controlled route. */
export function sanitizeAdminPhoto(photo: {
  id: string;
  caption: string;
  uploader: string | null;
  status: string;
  createdAt: Date | string;
  categoryId: string | null;
  category: unknown;
  imageUrl: string;
  blurUrl?: string | null;
  [key: string]: unknown;
}) {
  return {
    id: photo.id,
    caption: photo.caption,
    uploader: photo.uploader,
    status: photo.status,
    createdAt: photo.createdAt,
    categoryId: photo.categoryId,
    category: photo.category,
    imageUrl: photoMediaPath(photo.id),
  };
}
