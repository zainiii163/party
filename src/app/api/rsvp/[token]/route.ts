import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken, setRsvpCookie } from "@/lib/auth";
import { badRequest, parseError, sameOrigin } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { rsvpUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(request: Request, { params }: Ctx) {
  const { token } = await params;
  if (!prisma) return badRequest("Database is not configured.", 503);
  const rsvp = await prisma.rsvp.findUnique({ where: { manageTokenHash: hashToken(token) } });
  if (!rsvp) return badRequest("This RSVP link is invalid.", 404);
  return NextResponse.json({
    rsvp: {
      nickname: rsvp.nickname,
      fullName: rsvp.fullName,
      attendance: rsvp.attendance,
      guests: rsvp.guests,
      favoriteFood: rsvp.favoriteFood,
      preferredActivity: rsvp.preferredActivity,
      message: rsvp.message,
      whatsapp: rsvp.whatsapp,
      consentPublic: rsvp.consentPublic,
      createdAt: rsvp.createdAt,
      updatedAt: rsvp.updatedAt,
    },
  });
}

export async function PATCH(request: Request, { params }: Ctx) {
  if (!sameOrigin(request)) return badRequest("Invalid request origin", 403);
  const { token } = await params;
  const rate = await checkRateLimit(`rsvp-update:${clientIp(request)}`, 15, 10 * 60 * 1000);
  if (!rate.ok) return badRequest("Too many updates. Please try again later.", 429);
  if (!prisma) return badRequest("Database is not configured.", 503);

  try {
    const body = rsvpUpdateSchema.parse(await request.json());
    const tokenHash = hashToken(token);
    const updated = await prisma.rsvp.update({
      where: { manageTokenHash: tokenHash },
      data: {
        nickname: body.nickname,
        attendance: body.attendance,
        guests: body.guests,
        favoriteFood: body.favoriteFood || null,
        preferredActivity: body.preferredActivity || null,
        message: body.message || null,
        whatsapp: body.whatsapp || null,
        consentPublic: body.consentPublic,
      },
    });
    await setRsvpCookie(updated.participantId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
