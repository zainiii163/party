import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRegisteredParticipantId } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { badRequest, parseError, sameOrigin } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { guestbookSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return badRequest("Invalid request origin", 403);
  const participantId = await getRegisteredParticipantId();
  if (!participantId) return badRequest("Please RSVP first to sign the guestbook.", 403);
  const rate = await checkRateLimit(`guestbook:${participantId}`, 6, 60 * 60 * 1000);
  if (!rate.ok) return badRequest("Please leave a little space between messages.", 429);
  try {
    const settings = await getSettings();
    if (settings.guestbookOpen === "false") return badRequest("The guestbook is closed right now.", 403);
    const body = guestbookSchema.parse(await request.json());
    if (!prisma) return badRequest("Database is not configured.", 503);
    await prisma.guestbookMessage.create({
      data: { participantId, nickname: body.nickname, message: body.message },
    });
    return NextResponse.json({ ok: true, message: "Your note is waiting for approval. Thank you!" }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
