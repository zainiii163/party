import { prisma } from "./db";
import {
  DEFAULT_DECISIONS, DEFAULT_EVENT, DEFAULT_POLLS, DEFAULT_SCHEDULE,
  DEFAULT_SETTINGS, DEFAULT_WHEEL, SECTIONS, type SectionKey,
} from "./defaults";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!prisma) return fallback;
  try {
    return await fn();
  } catch (error) {
    console.error("[data] query failed", error);
    return fallback;
  }
}

const iso = (value: Date | null | undefined) => value?.toISOString() ?? null;

export type PublicEvent = typeof DEFAULT_EVENT;
export type PublicRsvp = {
  id: string; displayName: string; attendance: "YES" | "MAYBE" | "NO";
  message: string | null; createdAt: string;
};
export type PublicSuggestion = {
  id: string; submitter: string; category: string; title: string; description: string;
  createdAt: string; votes: number; selected: boolean;
};
export type PublicPoll = {
  id: string; question: string; category: string | null; status: "OPEN" | "CLOSED"; multiple: boolean;
  options: { id: string; label: string; votes: number }[];
};
export type PublicAward = {
  id: string; title: string; emoji: string; description: string | null; active: boolean; revealed: boolean;
  nominees: { id: string; name: string; note: string | null; votes: number }[];
};
export type PublicPhoto = {
  id: string; imageUrl: string; caption: string; uploader: string | null;
  createdAt: string; categoryName: string; categoryId: string | null;
};
export type PublicGuestbook = {
  id: string; nickname: string; message: string; createdAt: string;
};
export type PublicDecision = { key: string; label: string; value: string | null; status: string };

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await safe(() => prisma!.appSetting.findMany(), []);
  return { ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
}

export function sectionEnabled(settings: Record<string, string>, key: SectionKey): boolean {
  return settings[`section_${key}`] !== "false";
}

export async function getEvent(): Promise<PublicEvent> {
  const event = await safe(() => prisma!.event.findUnique({ where: { id: "main" } }), null);
  if (!event) return DEFAULT_EVENT;
  return {
    ...DEFAULT_EVENT,
    title: event.title,
    eventDate: iso(event.eventDate),
    startTime: event.startTime,
    endTime: event.endTime,
    venue: event.venue,
    location: event.location,
    dressCode: event.dressCode,
    hostMessage: event.hostMessage,
    description: event.description,
    heroLine: event.heroLine,
    subheading: event.subheading,
  };
}

export async function getSchedule() {
  const rows = await safe(
    () => prisma!.eventScheduleItem.findMany({ where: { eventId: "main" }, orderBy: { order: "asc" } }),
    [],
  );
  return rows.length ? rows.map((r) => ({ id: r.id, time: r.time, title: r.title, note: r.note })) : DEFAULT_SCHEDULE;
}

export async function getPublicRsvps(): Promise<PublicRsvp[]> {
  const rows = await safe(
    () => prisma!.rsvp.findMany({
      where: { consentPublic: true, attendance: { in: ["YES", "MAYBE"] } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    [],
  );
  return rows.map((r) => ({
    id: r.id,
    displayName: r.nickname,
    attendance: r.attendance,
    message: r.message,
    createdAt: iso(r.createdAt)!,
  }));
}

export async function getStats() {
  const rows = await safe(() => prisma!.rsvp.findMany({ select: { attendance: true, guests: true } }), []);
  const yes = rows.filter((r) => r.attendance === "YES");
  const maybe = rows.filter((r) => r.attendance === "MAYBE");
  return {
    total: rows.length,
    yes: yes.length,
    maybe: maybe.length,
    no: rows.filter((r) => r.attendance === "NO").length,
    expectedGuests: yes.reduce((sum, r) => sum + r.guests, 0) + yes.length,
  };
}

export async function getPendingCounts() {
  const counts = { suggestions: 0, photos: 0, guestbook: 0 };
  if (!prisma) return counts;
  const [s, p, g] = await Promise.all([
    safe(() => prisma!.suggestion.count({ where: { status: "PENDING" } }), 0),
    safe(() => prisma!.memoryPhoto.count({ where: { status: "PENDING" } }), 0),
    safe(() => prisma!.guestbookMessage.count({ where: { status: "PENDING" } }), 0),
  ]);
  return { suggestions: s, photos: p, guestbook: g };
}

export async function getSuggestions(): Promise<PublicSuggestion[]> {
  const rows = await safe(
    () => prisma!.suggestion.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { votes: true } } },
      take: 200,
    }),
    [],
  );
  return rows.map((s) => ({
    id: s.id, submitter: s.submitter, category: s.category, title: s.title,
    description: s.description, createdAt: iso(s.createdAt)!, votes: s._count.votes, selected: s.selected,
  }));
}

export async function getMyVotes(visitorId: string): Promise<string[]> {
  const rows = await safe(
    () => prisma!.suggestionVote.findMany({ where: { visitorId }, select: { suggestionId: true } }),
    [],
  );
  return rows.map((r) => r.suggestionId);
}

export async function getPolls(): Promise<PublicPoll[]> {
  const rows = await safe(
    () => prisma!.poll.findMany({
      orderBy: { createdAt: "asc" },
      include: { options: { orderBy: { order: "asc" }, include: { _count: { select: { votes: true } } } } },
    }),
    [],
  );
  if (!rows.length) return prisma ? [] : (DEFAULT_POLLS as PublicPoll[]);
  return rows.map((p) => ({
    id: p.id, question: p.question, category: p.category, status: p.status, multiple: p.multiple,
    options: p.options.map((o) => ({ id: o.id, label: o.label, votes: o._count.votes })),
  }));
}

export async function getMyPollVotes(participantId: string | null): Promise<Record<string, string[]>> {
  if (!participantId) return {};
  const rows = await safe(
    () => prisma!.pollVote.findMany({ where: { participantId }, select: { pollId: true, optionId: true } }),
    [],
  );
  const result: Record<string, string[]> = {};
  for (const row of rows) (result[row.pollId] ??= []).push(row.optionId);
  return result;
}

export async function getAwards(): Promise<PublicAward[]> {
  const rows = await safe(
    () => prisma!.awardCategory.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: { nominees: { include: { _count: { select: { votes: true } } } } },
    }),
    [],
  );
  return rows.map((a) => ({
    id: a.id, title: a.title, emoji: a.emoji, description: a.description,
    active: a.active, revealed: a.revealed,
    nominees: a.nominees.map((n) => ({ id: n.id, name: n.name, note: n.note, votes: n._count.votes })),
  }));
}

export async function getMyAwardVotes(participantId: string | null): Promise<Record<string, string>> {
  if (!participantId) return {};
  const rows = await safe(
    () => prisma!.awardVote.findMany({ where: { participantId }, select: { categoryId: true, nomineeId: true } }),
    [],
  );
  return Object.fromEntries(rows.map((r) => [r.categoryId, r.nomineeId]));
}

export async function getPhotos(): Promise<PublicPhoto[]> {
  const rows = await safe(
    () => prisma!.memoryPhoto.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: { category: true },
      take: 200,
    }),
    [],
  );
  return rows.map((p) => ({
    id: p.id, imageUrl: `/api/media/${p.id}`, caption: p.caption, uploader: p.uploader,
    createdAt: iso(p.createdAt)!, categoryName: p.category?.name ?? "Memories", categoryId: p.categoryId,
  }));
}

export async function getGalleryCategories(): Promise<{ id: string; name: string }[]> {
  const rows = await safe(() => prisma!.memoryCategory.findMany({ orderBy: { order: "asc" } }), []);
  return rows.map((r) => ({ id: r.id, name: r.name }));
}

export async function getGuestbook(): Promise<PublicGuestbook[]> {
  const rows = await safe(
    () => prisma!.guestbookMessage.findMany({
      where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 100,
    }),
    [],
  );
  return rows.map((m) => ({ id: m.id, nickname: m.nickname, message: m.message, createdAt: iso(m.createdAt)! }));
}

export async function getDecisions(): Promise<PublicDecision[]> {
  const rows = await safe(
    () => prisma!.planningDecision.findMany({ where: { eventId: "main" }, orderBy: { order: "asc" } }),
    [],
  );
  return rows.length ? rows.map((d) => ({ key: d.key, label: d.label, value: d.value, status: d.status })) : DEFAULT_DECISIONS;
}

export async function getWheelActivities(): Promise<string[]> {
  const rows = await safe(
    () => prisma!.wheelActivity.findMany({ where: { enabled: true }, orderBy: { order: "asc" } }),
    [],
  );
  return rows.length ? rows.map((r) => r.label) : DEFAULT_WHEEL;
}

export async function getNavSections(settings: Record<string, string>) {
  return SECTIONS.filter((s) => sectionEnabled(settings, s.key));
}
