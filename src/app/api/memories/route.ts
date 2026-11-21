import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, getRegisteredParticipantId } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { blobConfigured, uploadPrivateImage } from "@/lib/blob";
import { badRequest, parseError, sameOrigin } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { photoMetaSchema, validateImage } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return badRequest("Invalid request origin", 403);
  const admin = await getAdminSession();
  const participantId = admin ? null : await getRegisteredParticipantId();
  if (!admin && !participantId) return badRequest("Please RSVP first to share a memory.", 403);
  const rate = await checkRateLimit(`memory:${clientIp(request)}`, 8, 60 * 60 * 1000);
  if (!rate.ok) return badRequest("Too many uploads. Please try again later.", 429);

  try {
    if (!admin) {
      const settings = await getSettings();
      if (settings.memorySubmissionsOpen !== "true") return badRequest("Memory uploads are not open to guests right now.", 403);
    }
    if (!blobConfigured()) return badRequest("Photo storage is not configured yet. Please ask the organizer to set up Vercel Blob.", 503);
    if (!prisma) return badRequest("Database is not configured.", 503);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return badRequest("Please choose an image.");
    const imageCheck = validateImage(file);
    if (!imageCheck.ok) return badRequest(imageCheck.error);

    const meta = photoMetaSchema.parse({
      caption: form.get("caption") ?? "",
      categoryId: form.get("categoryId") ?? "",
      uploader: form.get("uploader") ?? "",
    });

    const imageUrl = await uploadPrivateImage(file, "memories/pending");
    try {
      const photo = await prisma.memoryPhoto.create({
        data: {
          imageUrl,
          caption: meta.caption,
          uploader: admin ? "Organizer" : meta.uploader || "A cousin",
          categoryId: meta.categoryId || null,
          status: admin ? "APPROVED" : "PENDING",
        },
      });
      return NextResponse.json({ ok: true, id: photo.id, status: photo.status }, { status: 201 });
    } catch (error) {
      await uploadCleanup(imageUrl);
      throw error;
    }
  } catch (error) {
    return parseError(error);
  }
}

async function uploadCleanup(url: string) {
  try {
    const { removeImage } = await import("@/lib/blob");
    await removeImage(url);
  } catch { /* best effort */ }
}
