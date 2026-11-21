import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Organizer login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <AdminLoginForm />;
}
