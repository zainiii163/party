import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setAdminSession } from "@/lib/auth";
import { badRequest, parseError, sameOrigin } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { loginSchema } from "@/lib/validation";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return badRequest("Invalid request origin", 403);
  const rate = await checkRateLimit(`admin-login:${clientIp(request)}`, 8, 15 * 60 * 1000);
  if (!rate.ok) return badRequest("Too many login attempts. Please try again in a few minutes.", 429);
  try {
    const { email, password } = loginSchema.parse(await request.json());
    if (!prisma) return badRequest("The database must be configured before organizer login.", 503);

    let admin = await prisma.adminUser.findUnique({ where: { email } });
    // First-run bootstrap: only when the operator has explicitly provided env credentials.
    if (!admin && env.ADMIN_EMAIL && env.ADMIN_INITIAL_PASSWORD &&
        email === env.ADMIN_EMAIL.toLowerCase() && password === env.ADMIN_INITIAL_PASSWORD) {
      admin = await prisma.adminUser.create({
        data: { email, passwordHash: await bcrypt.hash(password, 12) },
      });
    }
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return badRequest("Incorrect email or password.", 401);
    }
    await setAdminSession(admin.id, admin.email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
