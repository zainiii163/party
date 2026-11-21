"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArrowUp, Search, Lightbulb, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/field";
import { Badge } from "@/components/ui/misc";
import { categories, suggestionSchema } from "@/lib/validation";
import { cn, formatShortDate } from "@/lib/utils";
import type { PublicSuggestion } from "@/lib/data";

type Payload = { suggestions: PublicSuggestion[]; myVotes: string[] };
type Sort = "newest" | "popular";

export function SuggestionsHub({ initial, open }: { initial: Payload; open: boolean }) {
  const [data, setData] = useState(initial);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<Sort>("newest");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingVote, setPendingVote] = useState<string | null>(null);
  const [form, setForm] = useState({ submitter: "", category: categories[0] as string, title: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const res = await fetch("/api/public/suggestions", { cache: "no-store" });
        if (res.ok) setData(await res.json());
      } catch { /* ignore */ }
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const visible = useMemo(() => {
    const list = data.suggestions.filter((s) =>
      (category === "All" || s.category === category) &&
      `${s.title} ${s.description} ${s.submitter}`.toLowerCase().includes(query.toLowerCase()));
    return [...list].sort((a, b) => sort === "popular" ? b.votes - a.votes : b.createdAt.localeCompare(a.createdAt));
  }, [data.suggestions, category, query, sort]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = suggestionSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(json.message ?? "Thank you for your idea!");
      setForm({ submitter: "", category: categories[0], title: "", description: "" });
      setShowForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your idea");
    } finally {
      setSubmitting(false);
    }
  }

  async function vote(id: string) {
    setPendingVote(id);
    try {
      const res = await fetch(`/api/suggestions/${id}/vote`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData((prev) => ({
        ...prev,
        myVotes: json.voted ? [...prev.myVotes, id] : prev.myVotes.filter((v) => v !== id),
        suggestions: prev.suggestions.map((s) => s.id === id ? { ...s, votes: json.votes } : s),
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not register your vote");
    } finally {
      setPendingVote(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Dream it up — the best reunion ideas come from the family itself. Every idea is reviewed by the organizer before it appears here.
        </p>
        {open && <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Close form" : <>Share an idea <Lightbulb className="size-4" /></>}</Button>}
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          onSubmit={submit} className="glass mb-8 grid gap-4 overflow-hidden rounded-2xl p-6 sm:grid-cols-2"
        >
          <div>
            <Label htmlFor="s-name">Your name or nickname</Label>
            <Input id="s-name" value={form.submitter} onChange={(e) => setForm({ ...form, submitter: e.target.value })} placeholder="e.g. Zain" />
            <FieldError>{errors.submitter}</FieldError>
          </div>
          <div>
            <Label htmlFor="s-category">Category</Label>
            <select id="s-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="flex h-11 w-full rounded-xl border border-white/12 bg-[#172840] px-4 text-sm text-foreground outline-none focus:border-gold/60">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="s-title">Idea title</Label>
            <Input id="s-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. A midnight hot chocolate bar" />
            <FieldError>{errors.title}</FieldError>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="s-description">Tell us more</Label>
            <Textarea id="s-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={800} placeholder="What would make this reunion extra special?" />
            <FieldError>{errors.description}</FieldError>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>{submitting ? <><Loader2 className="animate-spin" /> Sending...</> : "Send my idea"}</Button>
          </div>
        </motion.form>
      )}

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn("shrink-0 rounded-full border px-3.5 py-2 text-[11px] transition", category === c ? "border-gold bg-gold/15 text-champagne" : "border-white/12 text-muted hover:border-gold/40")}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-52">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ideas" className="pl-9" aria-label="Search suggestions" />
          </div>
          <div className="flex rounded-xl border border-white/12 p-1">
            {(["newest", "popular"] as const).map((s) => (
              <button key={s} onClick={() => setSort(s)} className={cn("rounded-lg px-2.5 py-1.5 text-[10px] capitalize transition", sort === s ? "bg-gold/15 text-champagne" : "text-muted")}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {visible.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((s, i) => {
            const voted = data.myVotes.includes(s.id);
            return (
              <motion.article key={s.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="glass flex flex-col rounded-2xl p-5 transition hover:-translate-y-1 hover:border-gold/40">
                <div className="flex items-start justify-between gap-2">
                  <Badge>{s.category}</Badge>
                  {s.selected && <Badge className="!border-success/30 !bg-success/10 !text-success"><Check className="size-3" /> Selected</Badge>}
                </div>
                <h3 className="mt-4 font-display text-lg leading-snug text-champagne">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                  <div>
                    <p className="text-xs text-foreground">{s.submitter}</p>
                    <p className="text-[10px] text-muted">{formatShortDate(s.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => vote(s.id)}
                    disabled={pendingVote === s.id}
                    aria-label={voted ? `Remove vote from ${s.title}` : `Upvote ${s.title}`}
                    className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition", voted ? "border-gold bg-gold/20 text-champagne" : "border-white/15 text-muted hover:border-gold/50 hover:text-champagne")}
                  >
                    {pendingVote === s.id ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowUp className="size-3.5" />}
                    {s.votes}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <Sparkles className="mx-auto mb-3 size-6 text-gold" />
          <p className="font-display text-xl text-champagne">No ideas here yet</p>
          <p className="mt-2 text-sm text-muted">Be the first to share something wonderful for the reunion.</p>
        </div>
      )}
      <p className="mt-6 text-center text-[11px] text-muted/70">Votes are tied to a private browser identifier. They discourage casual repeat voting, but they are not a guaranteed one-person-one-vote system.</p>
    </div>
  );
}
