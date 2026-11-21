import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
