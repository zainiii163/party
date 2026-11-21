import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { hashToken, newToken, setParticipantCookie, setRsvpCookie } from "@/lib/auth";
import { badRequest, parseError, sameOrigin } from "@/lib/http";
import { clientIp } from "@/lib/request";
import { checkRateLimit } from "@/lib/rate-limit";
import { rsvpSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return badRequest("Invalid request origin", 403);
  const limit = await checkRateLimit(`rsvp:${clientIp(request)}`, 6, 10 * 60 * 1000);
  if (!limit.ok) return badRequest("Too many attempts. Please wait a few minutes and try again.", 429);

  try {
    const body = rsvpSchema.parse(await request.json());
    const settings = await getSettings();
    if (settings.registrationsOpen === "false") return badRequest("Registrations are currently closed.", 403);
    const max = Number(settings.registrationLimit ?? 0);
    if (prisma) {
      // Prevent accidental double taps without blocking relatives who share a name later.
      const recentDuplicate = await prisma.rsvp.findFirst({
        where: {
          fullName: { equals: body.fullName, mode: "insensitive" },
          nickname: { equals: body.nickname, mode: "insensitive" },
          createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
        },
        select: { id: true },
      });
      if (recentDuplicate) return badRequest("We just received an RSVP for this name. Please use your private link to update it.", 409);
      if (max > 0) {
        const count = await prisma.rsvp.count();
        if (count >= max) return badRequest("We have reached the registration limit.", 403);
      }
      const token = newToken();
      const result = await prisma.$transaction(async (tx) => {
        const participant = await tx.participant.create({ data: {} });
        const rsvp = await tx.rsvp.create({
          data: {
            participantId: participant.id,
            fullName: body.fullName,
            nickname: body.nickname,
            attendance: body.attendance,
            guests: body.guests,
            favoriteFood: body.favoriteFood || null,
            preferredActivity: body.preferredActivity || null,
            message: body.message || null,
            whatsapp: body.whatsapp || null,
            consentPublic: body.consentPublic,
            manageTokenHash: hashToken(token),
          },
        });
        return { participantId: participant.id, rsvpId: rsvp.id };
      });
      await setParticipantCookie(result.participantId);
      await setRsvpCookie(result.participantId);
      return NextResponse.json({ token, participantId: result.participantId, rsvpId: result.rsvpId });
    }
    return badRequest("Registrations will open once the website database is configured.", 503);
  } catch (error) {
    return parseError(error);
  }
}
