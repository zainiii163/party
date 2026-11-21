import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getVisitorId } from "@/lib/auth";
import { badRequest, parseError, sameOrigin } from "@/lib/http";
import { clientIp } from "@/lib/request";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return badRequest("Invalid request origin", 403);
  const rate = await checkRateLimit(`vote:${clientIp(request)}`, 60, 60 * 60 * 1000);
  if (!rate.ok) return badRequest("Slow down a little and try again soon.", 429);
  if (!prisma) return badRequest("Database is not configured.", 503);
  const { id } = await params;
  try {
    const visitorId = await getVisitorId(true);
    const result = await prisma.$transaction(async (tx) => {
      const suggestion = await tx.suggestion.findUnique({ where: { id }, select: { status: true } });
      if (!suggestion || suggestion.status !== "APPROVED") return { error: "This idea is not available for voting." };
      const existing = await tx.suggestionVote.findUnique({ where: { suggestionId_visitorId: { suggestionId: id, visitorId } } });
      if (existing) {
        await tx.suggestionVote.delete({ where: { id: existing.id! } });
        return { voted: false };
      }
      await tx.suggestionVote.create({ data: { suggestionId: id, visitorId } });
      return { voted: true };
    });
    if ("error" in result) return badRequest(result.error ?? "This idea is not available", 404);
    const votes = await prisma.suggestionVote.count({ where: { suggestionId: id } });
    return NextResponse.json({ ...result, votes });
  } catch (error) {
    return parseError(error);
  }
}
