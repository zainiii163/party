"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Crown, LockKeyhole, Loader2, PartyPopper } from "lucide-react";
import { Confetti } from "@/components/effects/confetti";
import { cn } from "@/lib/utils";
import type { PublicAward } from "@/lib/data";

export function AwardsBoard({ initial, myVotes, canVote }: { initial: PublicAward[]; myVotes: Record<string, string>; canVote: boolean }) {
  const [awards, setAwards] = useState(initial);
  const [votes, setVotes] = useState(myVotes);
  const [pending, setPending] = useState<string | null>(null);

  async function vote(categoryId: string, nomineeId: string) {
    setPending(categoryId);
    try {
      const res = await fetch(`/api/awards/${categoryId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomineeId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAwards((prev) => prev.map((a) => a.id === categoryId
        ? { ...a, nominees: a.nominees.map((n) => ({ ...n, votes: json.votes[n.id] ?? n.votes })) }
        : a));
      setVotes((prev) => ({ ...prev, [categoryId]: json.selected }));
      toast.success("Vote saved — may the best cousin win!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your vote");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {awards.map((award) => {
        const total = award.nominees.reduce((s, n) => s + n.votes, 0);
        const winner = award.revealed
          ? [...award.nominees].sort((a, b) => b.votes - a.votes)[0]
          : null;
        return (
          <motion.article key={award.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass relative overflow-hidden rounded-2xl p-6">
            {award.revealed && winner && <Confetti pieces={20} />}
            <div className="relative flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-2xl">{award.emoji}</span>
              <div>
                <h3 className="font-display text-xl text-champagne">{award.title}</h3>
                {award.description && <p className="text-xs text-muted">{award.description}</p>}
              </div>
            </div>
            <div className="relative mt-5 grid gap-2.5 sm:grid-cols-2">
              {award.nominees.map((nominee) => {
                const isWinner = winner?.id === nominee.id;
                const isVoted = votes[award.id] === nominee.id;
                const pct = total ? Math.round((nominee.votes / total) * 100) : 0;
                return (
                  <button
                    key={nominee.id}
                    type="button"
                    disabled={!canVote || award.revealed}
                    onClick={() => vote(award.id, nominee.id)}
                    className={cn(
                      "relative overflow-hidden rounded-xl border p-4 text-left transition",
                      isWinner ? "border-gold bg-gold/15" : isVoted ? "border-gold/50 bg-gold/8" : "border-white/10 hover:border-gold/40",
                      !canVote && "cursor-not-allowed",
                    )}
                  >
                    <span className="absolute inset-y-0 left-0 bg-gold/8 transition-all duration-700" style={{ width: `${pct}%` }} />
                    <span className="relative flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 truncate text-sm text-foreground">
                        {isWinner && <Crown className="size-4 shrink-0 text-gold" />}
                        <span className="truncate">{nominee.name}</span>
                      </span>
                      <span className="text-[10px] tabular-nums text-muted">{pct}%</span>
                    </span>
                    {nominee.note && <span className="relative mt-1 block text-[11px] text-muted">{nominee.note}</span>}
                    {isWinner && <span className="relative mt-2 flex items-center gap-1 text-[10px] uppercase tracking-wider text-gold"><PartyPopper className="size-3" /> Winner</span>}
                  </button>
                );
              })}
            </div>
            <p className="relative mt-4 flex items-center gap-2 text-[11px] text-muted">
              {canVote ? (pending === award.id ? <Loader2 className="size-3.5 animate-spin" /> : "Tap a nominee to vote. You can change your mind.") : <><LockKeyhole className="size-3.5" /> RSVP to vote in the awards</>}
            </p>
            {award.revealed && <p className="relative mt-1 text-[10px] uppercase tracking-widest text-gold">Winner revealed</p>}
          </motion.article>
        );
      })}
    </div>
  );
}
