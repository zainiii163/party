"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { PenLine, Send, Loader2, LockKeyhole, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/field";
import { guestbookSchema } from "@/lib/validation";
import { formatShortDate } from "@/lib/utils";
import type { PublicGuestbook } from "@/lib/data";

const NOTE_COLORS = ["bg-[#f2d7a0]/8", "bg-[#72c7a1]/7", "bg-[#7fb0e8]/7", "bg-[#c98fb8]/7"];

export function GuestbookBoard({ initial, canWrite, open }: { initial: PublicGuestbook[]; canWrite: boolean; open: boolean }) {
  const [messages] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nickname: "", message: "" });
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = guestbookSchema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your message"); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(json.message);
      setForm({ nickname: "", message: "" });
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send your note");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm leading-relaxed text-muted">Leave a wish, a joke or a memory. Approved notes will be pinned here for everyone to read.</p>
        {open && canWrite && <Button onClick={() => setShowForm((v) => !v)}><PenLine className="size-4" /> Write a note</Button>}
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass mb-8 grid gap-4 rounded-2xl p-6 sm:grid-cols-[200px_1fr]">
          <div>
            <Label htmlFor="g-nickname">Nickname</Label>
            <Input id="g-nickname" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} maxLength={40} placeholder="Your name" />
          </div>
          <div>
            <Label htmlFor="g-message">Your message</Label>
            <Textarea id="g-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={500} placeholder="Can't wait for the biryani and the Ludo rematch!" />
          </div>
          <FieldError>{error}</FieldError>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>{submitting ? <><Loader2 className="animate-spin" /> Sending...</> : <><Send className="size-4" /> Send with love</>}</Button>
          </div>
        </form>
      )}

      {!canWrite && <p className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-xs text-muted"><LockKeyhole className="size-3.5" /> RSVP first to leave a note in the guestbook.</p>}

      {messages.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {messages.map((message, i) => (
            <motion.article key={message.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
              className={`relative rounded-2xl border border-gold/15 p-5 shadow-[0_14px_35px_-22px_rgba(0,0,0,0.9)] ${NOTE_COLORS[i % NOTE_COLORS.length]}`}>
              <Heart className="mb-3 size-4 text-gold" />
              <p className="whitespace-pre-wrap font-display text-[15px] leading-relaxed text-foreground">{message.message}</p>
              <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-3">
                <span className="text-xs font-semibold text-champagne">— {message.nickname}</span>
                <span className="text-[10px] text-muted">{formatShortDate(message.createdAt)}</span>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="font-display text-xl text-champagne">No notes yet</p>
          <p className="mt-2 text-sm text-muted">Be the first to leave a little love for the family.</p>
        </div>
      )}
    </div>
  );
}
