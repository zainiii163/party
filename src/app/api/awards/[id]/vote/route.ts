import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRegisteredParticipantId } from "@/lib/auth";
import { badRequest, parseError, sameOrigin } from "@/lib/http";
import { awardVoteSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return badRequest("Invalid request origin", 403);
  const participantId = await getRegisteredParticipantId();
  if (!participantId) return badRequest("Please RSVP first to vote in the awards.", 403);
  const rate = await checkRateLimit(`award:${clientIp(request)}`, 40, 60 * 60 * 1000);
  if (!rate.ok) return badRequest("Too many votes. Please try again later.", 429);
  if (!prisma) return badRequest("Database is not configured.", 503);
  const { id } = await params;
  try {
    const nomineeId = String((await request.json()).nomineeId ?? "");
    awardVoteSchema.parse({ categoryId: id, nomineeId });
    const result = await prisma.$transaction(async (tx) => {
      const category = await tx.awardCategory.findUnique({ where: { id } });
      if (!category || !category.active) return { error: "This award is not open." };
      const nominee = await tx.awardNominee.findFirst({ where: { id: nomineeId, categoryId: id } });
      if (!nominee) return { error: "Nominee not found." };
      await tx.awardVote.upsert({
        where: { categoryId_participantId: { categoryId: id, participantId } },
        create: { categoryId: id, nomineeId, participantId },
        update: { nomineeId },
      });
      return { ok: true };
    });
    if ("error" in result) return badRequest(result.error ?? "Invalid vote", 400);
    const counts = await prisma.awardVote.groupBy({ by: ["nomineeId"], where: { categoryId: id }, _count: true });
    return NextResponse.json({
      ok: true,
      votes: Object.fromEntries(counts.map((c) => [c.nomineeId, c._count])),
      selected: nomineeId,
    });
  } catch (error) {
    return parseError(error);
  }
}
