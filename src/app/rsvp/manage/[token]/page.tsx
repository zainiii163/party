import type { Metadata } from "next";
import Link from "next/link";
import { Snowflake, LockKeyhole } from "lucide-react";
import { ManageRsvpForm } from "@/components/manage-rsvp-form";
import { hashToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Manage your RSVP", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const rsvp = prisma
    ? await prisma.rsvp.findUnique({ where: { manageTokenHash: hashToken(token) } }).catch(() => null)
    : null;

  return (
    <main className="relative min-h-screen px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 font-display text-lg text-champagne">
          <Snowflake className="size-5 text-gold" /> Cousins Winter Reunion 2026
        </Link>
        {rsvp ? (
          <>
            <h1 className="font-display text-3xl text-foreground sm:text-4xl">Your RSVP, <span className="gold-text">your way.</span></h1>
            <p className="mt-3 mb-8 text-sm text-muted">Hi {rsvp.nickname}! Change anything below and save. Your private link stays the same.</p>
            <ManageRsvpForm token={token} initial={{
              nickname: rsvp.nickname, attendance: rsvp.attendance, guests: rsvp.guests,
              favoriteFood: rsvp.favoriteFood, preferredActivity: rsvp.preferredActivity,
              message: rsvp.message, whatsapp: rsvp.whatsapp, consentPublic: rsvp.consentPublic,
            }} />
          </>
        ) : (
          <div className="glass rounded-2xl p-10 text-center">
            <LockKeyhole className="mx-auto mb-4 size-8 text-gold" />
            <h1 className="font-display text-2xl text-champagne">This link isn&apos;t valid</h1>
            <p className="mt-3 text-sm text-muted">The private management link may have changed, or the database is not configured yet.</p>
            <Link href="/" className="mt-6 inline-block text-sm text-gold hover:underline">Return home</Link>
          </div>
        )}
      </div>
    </main>
  );
}
