import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readPrivateImage } from "@/lib/blob";
import { getAdminSession } from "@/lib/auth";
import { checkMediaRateLimit } from "@/lib/in-memory-rate-limit";
import { canViewPhoto, mediaCacheHeaders } from "@/lib/photo-security";
import { clientIp } from "@/lib/request";

export const runtime = "nodejs";

/**
 * Only approved photos are ever streamed publicly (organizers may also preview
 * pending/rejected ones). Stored Blob URLs are never returned and nothing is
 * cached, so a rejected photo stops being served immediately.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const rate = checkMediaRateLimit(clientIp(request));
  if (!rate.ok) {
    return new NextResponse("Too many image requests", {
      status: 429,
      headers: { ...mediaCacheHeaders(true), "Retry-After": String(rate.retryAfter) },
    });
  }

  const { id } = await params;
  if (!prisma) return new NextResponse("Not configured", { status: 503, headers: mediaCacheHeaders(true) });

  const photo = await prisma.memoryPhoto.findUnique({ where: { id }, select: { status: true, imageUrl: true } });
  const admin = await getAdminSession();
  if (!photo || !canViewPhoto(photo.status, Boolean(admin))) {
    return new NextResponse("Not found", { status: 404, headers: mediaCacheHeaders(true) });
  }

  const blob = await readPrivateImage(photo.imageUrl);
  if (!blob) return new NextResponse("Image unavailable", { status: 404, headers: mediaCacheHeaders(true) });

  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType ?? "image/jpeg",
      ...mediaCacheHeaders(photo.status !== "APPROVED"),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
