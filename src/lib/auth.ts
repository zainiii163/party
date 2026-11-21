import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./db";
import { sessionSecret } from "./env";

const ADMIN_COOKIE = "cwr_admin";
const PARTICIPANT_COOKIE = "cwr_pid";
const RSVP_COOKIE = "cwr_rsvp";
const SEVEN_DAYS = 60 * 60 * 24 * 7;
const ONE_YEAR = 60 * 60 * 24 * 365;

const key = new TextEncoder().encode(sessionSecret());

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

async function sign(payload: Record<string, unknown>, maxAge: number): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(key);
}

async function verify<T extends Record<string, unknown>>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload as T;
  } catch {
    return null;
  }
}

export async function setAdminSession(adminId: string, email: string) {
  const token = await sign({ adminId, email, kind: "admin" }, SEVEN_DAYS);
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS,
  });
  if (prisma) {
    await prisma.adminSession.create({
      data: { adminId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + SEVEN_DAYS * 1000) },
    });
  }
}

export async function setParticipantCookie(participantId: string) {
  const token = await sign({ participantId, kind: "participant" }, ONE_YEAR);
  const store = await cookies();
  store.set(PARTICIPANT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
}

export async function setRsvpCookie(participantId: string) {
  const token = await sign({ participantId, kind: "rsvp" }, ONE_YEAR);
  const store = await cookies();
  store.set(RSVP_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  const current = store.get(ADMIN_COOKIE)?.value;
  const payload = await verify<{ adminId: string }>(current);
  if (prisma && current) {
    await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(current) } });
  }
  store.delete(ADMIN_COOKIE);
  return payload?.adminId ?? null;
}

export async function getParticipantId(): Promise<string | null> {
  const store = await cookies();
  const payload = await verify<{ participantId: string }>(store.get(PARTICIPANT_COOKIE)?.value);
  return payload?.participantId ?? null;
}

export async function getRegisteredParticipantId(): Promise<string | null> {
  const store = await cookies();
  const payload = await verify<{ participantId: string }>(store.get(RSVP_COOKIE)?.value);
  return payload?.participantId ?? null;
}

export async function getAdminSession(): Promise<{ adminId: string; email: string; token: string } | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  const payload = await verify<{ adminId: string; email: string }>(token);
  if (!payload || !token) return null;
  if (prisma) {
    const session = await prisma.adminSession.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!session || session.expiresAt < new Date()) return null;
  }
  return { adminId: payload.adminId, email: payload.email, token };
}

/** For visitor-scoped, non-account actions such as suggestion upvotes. */
export async function getVisitorId(persist = false): Promise<string> {
  const store = await cookies();
  const existing = store.get("cwr_vid")?.value;
  const verified = await verify<{ visitorId: string }>(existing);
  if (verified?.visitorId) return verified.visitorId;
  const visitorId = randomBytes(16).toString("base64url");
  // Cookies may only be written in Route Handlers / Server Actions, never during SSR.
  if (persist) {
    const token = await sign({ visitorId, kind: "visitor" }, ONE_YEAR);
    store.set("cwr_vid", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ONE_YEAR,
    });
  }
  return visitorId;
}
