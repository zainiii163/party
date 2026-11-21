import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { badRequest, parseError, sameOrigin } from "@/lib/http";
import { clientIp } from "@/lib/request";
import { checkRateLimit } from "@/lib/rate-limit";
import { suggestionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return badRequest("Invalid request origin", 403);
  const rate = await checkRateLimit(`suggestion:${clientIp(request)}`, 8, 60 * 60 * 1000);
  if (!rate.ok) return badRequest("You have shared plenty of ideas! Please try again later.", 429);
  try {
    const body = suggestionSchema.parse(await request.json());
    const settings = await getSettings();
    if (settings.suggestionsOpen === "false") return badRequest("The suggestion box is closed right now.", 403);
    if (!prisma) return badRequest("Suggestions will open once the website database is configured.", 503);
    await prisma.suggestion.create({ data: body });
    return NextResponse.json({ ok: true, message: "Your idea is in the moderation queue. Thank you!" }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
