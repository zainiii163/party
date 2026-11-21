import { NextResponse } from "next/server";
import { getMyVotes, getSuggestions } from "@/lib/data";
import { getVisitorId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const [suggestions, visitorId] = await Promise.all([getSuggestions(), getVisitorId(true)]);
  const myVotes = await getMyVotes(visitorId);
  return NextResponse.json({ suggestions, myVotes });
}
