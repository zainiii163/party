import { NextResponse } from "next/server";
import { getPublicRsvps, getSettings, getStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  if (settings.attendancePublic === "false") {
    return NextResponse.json({ rsvps: [], stats: { total: 0, yes: 0, maybe: 0, no: 0, expectedGuests: 0 }, public: false });
  }
  const [rsvps, stats] = await Promise.all([getPublicRsvps(), getStats()]);
  return NextResponse.json({ rsvps, stats, public: true });
}
