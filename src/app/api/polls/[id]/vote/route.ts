import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRegisteredParticipantId } from "@/lib/auth";
import { badRequest, parseError, sameOrigin } from "@/lib/http";
import { pollVoteSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return badRequest("Invalid request origin", 403);
  const participantId = await getRegisteredParticipantId();
  if (!participantId) return badRequest("Please RSVP first — poll voting is for registered cousins.", 403);
  if (!prisma) return badRequest("Database is not configured.", 503);
  const { id } = await params;
  try {
    const body = await request.json();
    const optionIds: string[] = Array.isArray(body.optionIds) ? body.optionIds.map(String) : [];
    pollVoteSchema.parse({ pollId: id, optionIds });
    const result = await prisma.$transaction(async (tx) => {
      const poll = await tx.poll.findUnique({
        where: { id }, include: { options: { select: { id: true } } },
      });
      if (!poll) return { error: "Poll not found." };
      if (poll.status !== "OPEN") return { error: "This poll is closed." };
      const valid = new Set(poll.options.map((o) => o.id));
      if (!optionIds.every((optionId) => valid.has(optionId))) return { error: "Invalid option selected." };
      if (!poll.multiple && optionIds.length > 1) return { error: "Please choose one option." };
      if (!poll.multiple) {
        await tx.pollVote.deleteMany({ where: { pollId: id, participantId } });
      } else {
        await tx.pollVote.deleteMany({ where: { pollId: id, participantId, optionId: { notIn: optionIds } } });
      }
      for (const optionId of optionIds) {
        await tx.pollVote.upsert({
          where: { pollId_optionId_participantId: { pollId: id, optionId, participantId } },
          create: { pollId: id, optionId, participantId },
          update: { updatedAt: new Date() },
        });
      }
      return { ok: true };
    });
    if ("error" in result) return badRequest(result.error ?? "Invalid vote", 400);
    const options = await prisma.pollOption.findMany({
      where: { pollId: id },
      include: { _count: { select: { votes: true } } },
    });
    return NextResponse.json({
      ok: true,
      votes: Object.fromEntries(options.map((o) => [o.id, o._count.votes])),
      selected: optionIds,
    });
  } catch (error) {
    return parseError(error);
  }
}
