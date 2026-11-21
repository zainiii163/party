import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readPrivateImage } from "@/lib/blob";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

/** Only approved photos are ever streamed publicly. Private blob URLs are never returned. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!prisma) return new NextResponse("Not configured", { status: 503 });
  const photo = await prisma.memoryPhoto.findUnique({ where: { id }, select: { status: true, imageUrl: true } });
  const admin = await getAdminSession();
  if (!photo || (photo.status !== "APPROVED" && !admin)) return new NextResponse("Not found", { status: 404 });
  const blob = await readPrivateImage(photo.imageUrl);
  if (!blob) return new NextResponse("Image unavailable", { status: 404 });
  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType ?? "image/jpeg",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
