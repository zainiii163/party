import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getVisitorId, hashToken } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { badRequest, parseError, sameOrigin } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { universeActionSchema } from "@/lib/validation";
import {
  isUnlocked, parseReports, parseUniverseConfig,
  type UniverseReport,
} from "@/lib/universe";

export const runtime = "nodejs";

async function readSetting(key: string, fallback: string): Promise<string> {
  if (!prisma) return fallback;
  try {
    const row = await prisma.appSetting.findUnique({ where: { key }, select: { value: true } });
    return row?.value ?? fallback;
  } catch {
    return fallback;
  }
}

async function writeSetting(key: string, value: string): Promise<void> {
  if (!prisma) return;
  await prisma.appSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
}

/** Public, read-only state. No personal data and no moderation queue is exposed. */
export async function GET() {
  const settings = await getSettings();
  const config = parseUniverseConfig(settings.universeConfig);
  const count = Math.max(0, Number(settings.universeMagicCount) || 0);
  const unlocked = config.reveal.visible && isUnlocked(config.reveal);
  const publicConfig = {
    enabled: config.enabled && settings.universeEnabled !== "false" && settings.section_universe !== "false",
    experiences: config.experiences,
    surprises: config.surprises,
    magicGoal: config.magicGoal,
    reveal: unlocked ? config.reveal : null,
    revealPending: config.reveal.visible && !unlocked,
    revealUnlockAt: config.reveal.visible && !unlocked ? config.reveal.unlockAt : null,
  };

  return NextResponse.json(
    { config: publicConfig, magicCount: count, serverTime: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return badRequest("Invalid origin.", 403);
  if (!prisma) return badRequest("Database is not configured.", 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body.");
  }
  const parsed = universeActionSchema.safeParse(body);
  if (!parsed.success) return parseError(parsed.error);

  const visitorId = await getVisitorId();
  const visitorHash = hashToken(visitorId);
  const data = parsed.data;
  const limit = await checkRateLimit(`universe:${data.action}:${visitorHash}`, data.action === "magic" ? 12 : 6, 60 * 60 * 1000);
  if (!limit.ok) return badRequest("Too many taps for now. Come back in a little while.", 429);

  try {
    if (data.action === "magic") {
      const current = Math.max(0, Number(await readSetting("universeMagicCount", "0")) || 0);
      const next = Math.min(1000000, current + 1);
      await writeSetting("universeMagicCount", String(next));
      return NextResponse.json({ ok: true, magicCount: next, remaining: limit.remaining });
    }

    const reports = parseReports(await readSetting("universeReports", "[]"));
    const recentDuplicate = reports.some((r) =>
      r.visitorHash === visitorHash && r.experienceId === data.experienceId &&
      Date.now() - Date.parse(r.createdAt) < 24 * 60 * 60 * 1000,
    );
    if (recentDuplicate) return NextResponse.json({ ok: true, duplicate: true });

    const report: UniverseReport = {
      id: randomUUID(),
      experienceId: data.experienceId,
      reason: data.reason,
      createdAt: new Date().toISOString(),
      status: "OPEN",
      visitorHash,
    };
    await writeSetting("universeReports", JSON.stringify([...reports, report].slice(-200)));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
