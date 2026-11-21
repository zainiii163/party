/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { badRequest, parseError, sameOrigin } from "@/lib/http";
import { eventSchema, photoMetaSchema } from "@/lib/validation";
import { getPendingCounts, getStats } from "@/lib/data";
import { removeImage } from "@/lib/blob";
import { sanitizeAdminPhoto } from "@/lib/photo-security";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ resource: string }> };
type Body = Record<string, any>;

function unauthorized() {
  return badRequest("You must be signed in as organizer.", 401);
}

export async function GET(request: Request, { params }: Ctx) {
  if (!(await getAdminSession())) return unauthorized();
  const { resource } = await params;
  if (!prisma) return badRequest("Database is not configured.", 503);
  try {
    switch (resource) {
      case "overview": {
        const [stats, pending, rsvps, suggestions, polls, guestbook] = await Promise.all([
          getStats(), getPendingCounts(),
          prisma.rsvp.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { nickname: true, attendance: true, createdAt: true } }),
          prisma.suggestion.count(), prisma.poll.count(), prisma.guestbookMessage.count(),
        ]);
        const participation = await prisma.poll.groupBy({ by: ["id"], _count: { _all: true } });
        return NextResponse.json({ stats, pending, recent: rsvps, totals: { suggestions, polls, guestbook }, participation });
      }
      case "event": {
        const [event, schedule, decisions] = await Promise.all([
          prisma.event.findUnique({ where: { id: "main" } }),
          prisma.eventScheduleItem.findMany({ orderBy: { order: "asc" } }),
          prisma.planningDecision.findMany({ where: { eventId: "main" }, orderBy: { order: "asc" } }),
        ]);
        return NextResponse.json({ event, schedule, decisions });
      }
      case "rsvps":
        return NextResponse.json({ items: await prisma.rsvp.findMany({ orderBy: { createdAt: "desc" } }) });
      case "suggestions":
        return NextResponse.json({ items: await prisma.suggestion.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { votes: true } } } }) });
      case "polls":
        return NextResponse.json({ items: await prisma.poll.findMany({ orderBy: { createdAt: "desc" }, include: { options: { include: { _count: { select: { votes: true } } } } } }) });
      case "awards":
        return NextResponse.json({ items: await prisma.awardCategory.findMany({ orderBy: { order: "asc" }, include: { nominees: true, _count: { select: { votes: true } } } }) });
      case "photos": {
        const items = await prisma.memoryPhoto.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } });
        return NextResponse.json(
          { items: items.map(sanitizeAdminPhoto) },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      }
      case "guestbook":
        return NextResponse.json({ items: await prisma.guestbookMessage.findMany({ orderBy: { createdAt: "desc" } }) });
      case "settings":
        return NextResponse.json({ items: await prisma.appSetting.findMany() });
      case "wheel":
        return NextResponse.json({ items: await prisma.wheelActivity.findMany({ orderBy: { order: "asc" } }) });
      default:
        return badRequest("Unknown resource", 404);
    }
  } catch (error) {
    return parseError(error);
  }
}

export async function POST(request: Request, { params }: Ctx) {
  if (!sameOrigin(request) || !(await getAdminSession())) return unauthorized();
  const { resource } = await params;
  if (!prisma) return badRequest("Database is not configured.", 503);
  try {
    const body: Body = await request.json();
    switch (resource) {
      case "polls": {
        const options: string[] = (body.options ?? []).map((o: string) => String(o).trim()).filter(Boolean);
        if (!String(body.question ?? "").trim() || options.length < 2) return badRequest("A question and at least two options are required.");
        const poll = await prisma.poll.create({
          data: {
            question: String(body.question).trim(),
            category: body.category ? String(body.category) : null,
            multiple: Boolean(body.multiple),
            options: { create: options.map((label, i) => ({ label, order: i })) },
          },
        });
        return NextResponse.json({ ok: true, id: poll.id }, { status: 201 });
      }
      case "awards": {
        if (!String(body.title ?? "").trim()) return badRequest("A title is required.");
        const nominees: string[] = (body.nominees ?? []).map((n: string) => String(n).trim()).filter(Boolean);
        const award = await prisma.awardCategory.create({
          data: {
            title: String(body.title).trim(), emoji: String(body.emoji || "✨"),
            description: body.description ? String(body.description) : null,
            active: Boolean(body.active),
            order: Number(body.order ?? 0),
            nominees: { create: nominees.map((name) => ({ name })) },
          },
        });
        return NextResponse.json({ ok: true, id: award.id }, { status: 201 });
      }
      case "wheel": {
        if (!String(body.label ?? "").trim()) return badRequest("An activity is required.");
        const item = await prisma.wheelActivity.create({ data: { label: String(body.label).trim(), enabled: body.enabled !== false } });
        return NextResponse.json({ ok: true, id: item.id }, { status: 201 });
      }
      case "rsvps": {
        if (!String(body.fullName ?? "").trim() || !String(body.nickname ?? "").trim()) return badRequest("Name is required.");
        const { newToken, hashToken } = await import("@/lib/auth");
        const token = newToken();
        const participant = await prisma.participant.create({ data: {} });
        const item = await prisma.rsvp.create({
          data: {
            participantId: participant.id,
            fullName: String(body.fullName).trim(), nickname: String(body.nickname).trim(),
            attendance: ["YES", "MAYBE", "NO"].includes(body.attendance) ? body.attendance : "YES",
            guests: Number(body.guests ?? 0), consentPublic: Boolean(body.consentPublic),
            manageTokenHash: hashToken(token),
          },
        });
        return NextResponse.json({ ok: true, id: item.id, manageToken: token }, { status: 201 });
      }
      default:
        return badRequest("Creation is not supported for this resource.", 404);
    }
  } catch (error) {
    return parseError(error);
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  if (!sameOrigin(request) || !(await getAdminSession())) return unauthorized();
  const { resource } = await params;
  if (!prisma) return badRequest("Database is not configured.", 503);
  try {
    const body: Body = await request.json();
    const id = body.id ? String(body.id) : null;
    const action = body.action ? String(body.action) : null;

    switch (resource) {
      case "event": {
        const parsed = eventSchema.parse({
          title: body.title, eventDate: body.eventDate, startTime: body.startTime, endTime: body.endTime,
          venue: body.venue, location: body.location, dressCode: body.dressCode,
          hostMessage: body.hostMessage, description: body.description,
        });
        const karachiDate = parsed.eventDate
          ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(parsed.eventDate) ? `${parsed.eventDate}T00:00:00+05:00` : parsed.eventDate)
          : null;
        await prisma.event.upsert({
          where: { id: "main" },
          create: {
            id: "main", ...parsed,
            eventDate: karachiDate,
            venue: parsed.venue || null, location: parsed.location || null,
          },
          update: {
            ...parsed,
            eventDate: karachiDate,
            venue: parsed.venue || null, location: parsed.location || null,
          },
        });
        if (Array.isArray(body.schedule)) {
          const client = prisma!;
          await client.$transaction([
            client.eventScheduleItem.deleteMany({ where: { eventId: "main" } }),
            ...body.schedule.map((item: Body, index: number) => client.eventScheduleItem.create({
              data: { eventId: "main", time: String(item.time ?? ""), title: String(item.title ?? ""), note: item.note ? String(item.note) : null, order: index },
            })),
          ]);
        }
        if (Array.isArray(body.decisions)) {
          for (const decision of body.decisions) {
            await prisma.planningDecision.upsert({
              where: { eventId_key: { eventId: "main", key: String(decision.key) } },
              create: { eventId: "main", key: String(decision.key), label: String(decision.label), value: decision.value ? String(decision.value) : null, status: String(decision.status ?? "Pending"), order: Number(decision.order ?? 0) },
              update: { label: String(decision.label), value: decision.value ? String(decision.value) : null, status: String(decision.status ?? "Pending") },
            });
          }
        }
        return NextResponse.json({ ok: true });
      }
      case "rsvps": {
        if (!id) return badRequest("Missing id");
        if (action === "delete") { await prisma.rsvp.delete({ where: { id } }); return NextResponse.json({ ok: true }); }
        await prisma.rsvp.update({
          where: { id },
          data: {
            attendance: ["YES", "MAYBE", "NO"].includes(body.attendance) ? body.attendance : undefined,
            guests: body.guests !== undefined ? Number(body.guests) : undefined,
            nickname: body.nickname !== undefined ? String(body.nickname) : undefined,
            consentPublic: body.consentPublic !== undefined ? Boolean(body.consentPublic) : undefined,
          },
        });
        return NextResponse.json({ ok: true });
      }
      case "suggestions": {
        if (!id) return badRequest("Missing id");
        const data: Body = {};
        if (action === "approve") data.status = "APPROVED";
        if (action === "reject") data.status = "REJECTED";
        if (action === "select") { data.selected = true; data.status = "APPROVED"; }
        if (action === "unselect") data.selected = false;
        if (body.title !== undefined) data.title = String(body.title).trim();
        if (body.description !== undefined) data.description = String(body.description).trim();
        if (body.category !== undefined) data.category = String(body.category);
        const updated = await prisma.suggestion.update({ where: { id }, data });
        return NextResponse.json({ ok: true, item: updated });
      }
      case "polls": {
        if (!id) return badRequest("Missing id");
        if (action === "open" || action === "close") {
          await prisma.poll.update({ where: { id }, data: { status: action === "open" ? "OPEN" : "CLOSED" } });
          return NextResponse.json({ ok: true });
        }
        if (action === "renameOption" && body.optionId) {
          await prisma.pollOption.update({ where: { id: String(body.optionId) }, data: { label: String(body.label) } });
          return NextResponse.json({ ok: true });
        }
        await prisma.poll.update({
          where: { id },
          data: {
            question: body.question !== undefined ? String(body.question) : undefined,
            category: body.category !== undefined ? (body.category ? String(body.category) : null) : undefined,
            multiple: body.multiple !== undefined ? Boolean(body.multiple) : undefined,
          },
        });
        return NextResponse.json({ ok: true });
      }
      case "awards": {
        if (!id) return badRequest("Missing id");
        if (action === "reveal" || action === "hide") {
          await prisma.awardCategory.update({ where: { id }, data: { revealed: action === "reveal" } });
          return NextResponse.json({ ok: true });
        }
        if (action === "activate" || action === "deactivate") {
          await prisma.awardCategory.update({ where: { id }, data: { active: action === "activate" } });
          return NextResponse.json({ ok: true });
        }
        if (action === "addNominee") {
          if (!String(body.name ?? "").trim()) return badRequest("Nominee name is required.");
          await prisma.awardNominee.create({ data: { categoryId: id, name: String(body.name).trim(), note: body.note ? String(body.note) : null } });
          return NextResponse.json({ ok: true });
        }
        if (action === "removeNominee" && body.nomineeId) {
          await prisma.awardNominee.delete({ where: { id: String(body.nomineeId) } });
          return NextResponse.json({ ok: true });
        }
        await prisma.awardCategory.update({
          where: { id },
          data: {
            title: body.title !== undefined ? String(body.title) : undefined,
            emoji: body.emoji !== undefined ? String(body.emoji) : undefined,
            description: body.description !== undefined ? String(body.description) : undefined,
          },
        });
        return NextResponse.json({ ok: true });
      }
      case "photos": {
        if (!id) return badRequest("Missing id");
        if (action === "approve") { await prisma.memoryPhoto.update({ where: { id }, data: { status: "APPROVED" } }); return NextResponse.json({ ok: true }); }
        if (action === "reject") { await prisma.memoryPhoto.update({ where: { id }, data: { status: "REJECTED" } }); return NextResponse.json({ ok: true }); }
        const meta = photoMetaSchema.parse({ caption: body.caption ?? "", categoryId: body.categoryId ?? "", uploader: body.uploader ?? "" });
        await prisma.memoryPhoto.update({ where: { id }, data: { caption: meta.caption, categoryId: meta.categoryId || null, uploader: meta.uploader || null } });
        return NextResponse.json({ ok: true });
      }
      case "guestbook": {
        if (!id) return badRequest("Missing id");
        if (action !== "approve" && action !== "reject") return badRequest("Unknown action");
        await prisma.guestbookMessage.update({ where: { id }, data: { status: action === "approve" ? "APPROVED" : "REJECTED" } });
        return NextResponse.json({ ok: true });
      }
      case "settings": {
        const entries: { key: string; value: string }[] = Array.isArray(body.settings) ? body.settings : [{ key: String(body.key), value: String(body.value) }];
        for (const entry of entries) {
          if (!entry.key) continue;
          await prisma.appSetting.upsert({ where: { key: entry.key }, create: entry, update: { value: entry.value } });
        }
        return NextResponse.json({ ok: true });
      }
      case "wheel": {
        if (!id) return badRequest("Missing id");
        if (action === "enable" || action === "disable") {
          await prisma.wheelActivity.update({ where: { id }, data: { enabled: action === "enable" } });
        } else {
          await prisma.wheelActivity.update({ where: { id }, data: { label: String(body.label), enabled: Boolean(body.enabled) } });
        }
        return NextResponse.json({ ok: true });
      }
      default:
        return badRequest("Unknown resource", 404);
    }
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  if (!sameOrigin(request) || !(await getAdminSession())) return unauthorized();
  const { resource } = await params;
  if (!prisma) return badRequest("Database is not configured.", 503);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return badRequest("Missing id");
  try {
    switch (resource) {
      case "rsvps": {
        const rsvp = await prisma.rsvp.findUnique({ where: { id }, select: { participantId: true } });
        await prisma.rsvp.delete({ where: { id } });
        if (rsvp) await prisma.participant.delete({ where: { id: rsvp.participantId } }).catch(() => undefined);
        break;
      }
      case "suggestions": await prisma.suggestion.delete({ where: { id } }); break;
      case "polls": await prisma.poll.delete({ where: { id } }); break;
      case "awards": await prisma.awardCategory.delete({ where: { id } }); break;
      case "guestbook": await prisma.guestbookMessage.delete({ where: { id } }); break;
      case "wheel": await prisma.wheelActivity.delete({ where: { id } }); break;
      case "photos": {
        const photo = await prisma.memoryPhoto.findUnique({ where: { id } });
        if (photo) {
          await prisma.memoryPhoto.delete({ where: { id } });
          await removeImage(photo.imageUrl).catch(() => undefined);
        }
        break;
      }
      default: return badRequest("Deletion is not supported for this resource.", 404);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
