import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/dashboard";
import { getAdminSession } from "@/lib/auth";
import { dbReady } from "@/lib/db";

export const metadata: Metadata = { title: "Organizer dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!dbReady) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="glass max-w-lg rounded-2xl p-10">
          <h1 className="font-display text-2xl text-champagne">Database setup required</h1>
          <p className="mt-3 text-sm text-muted">Set DATABASE_URL and DIRECT_URL to a Neon database, run the migration, then reload this page.</p>
        </div>
      </main>
    );
  }
  return <AdminDashboard email={session.email} />;
}
