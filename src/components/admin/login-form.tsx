"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Snowflake, LockKeyhole, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      router.push("/admin");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 flex items-center justify-center gap-2 font-display text-xl text-champagne">
          <Snowflake className="size-5 text-gold" /> Cousins Winter Reunion
        </Link>
        <form onSubmit={submit} className="glass glow-gold rounded-2xl p-8">
          <div className="mb-6 grid size-12 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-gold"><LockKeyhole className="size-5" /></div>
          <p className="eyebrow">Organizer only</p>
          <h1 className="mt-2 font-display text-3xl text-foreground">Welcome back.</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage the reunion.</p>
          <div className="mt-7 space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="username" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          <Button type="submit" className="mt-8 w-full" disabled={loading}>
            {loading ? <><Loader2 className="animate-spin" /> Signing in...</> : "Sign in securely"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted"><Link href="/" className="hover:text-gold">← Back to the celebration</Link></p>
      </div>
    </main>
  );
}
