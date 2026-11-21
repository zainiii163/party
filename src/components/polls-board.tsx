"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { BarChart3, Check, Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { Confetti } from "@/components/effects/confetti";
import { cn } from "@/lib/utils";
import type { PublicPoll } from "@/lib/data";
import { RSVP_SUCCESS_EVENT } from "@/lib/events";

type VoteMap = Record<string, string[]>;

export function PollsBoard({ initial, myVotes, canVote }: { initial: PublicPoll[]; myVotes: VoteMap; canVote: boolean }) {
  const [polls, setPolls] = useState(initial);
  const [selected, setSelected] = useState<VoteMap>(myVotes);
  const [pending, setPending] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{ pollId: string; key: number } | null>(null);
  // The server value is captured at page load; a successful RSVP on the same
  // page sets the cookie but cannot re-render this component on its own.
  const [voteEligible, setVoteEligible] = useState(canVote);

  useEffect(() => {
    setVoteEligible(canVote);
    const unlock = () => setVoteEligible(true);
    window.addEventListener(RSVP_SUCCESS_EVENT, unlock);
    return () => window.removeEventListener(RSVP_SUCCESS_EVENT, unlock);
  }, [canVote]);

  async function vote(poll: PublicPoll) {
    const optionIds = selected[poll.id] ?? [];
    if (!optionIds.length) { toast.error("Choose an option first"); return; }
    setPending(poll.id);
    try {
      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPolls((prev) => prev.map((p) => p.id === poll.id
        ? { ...p, options: p.options.map((o) => ({ ...o, votes: json.votes[o.id] ?? o.votes })) }
        : p));
      setSelected((prev) => ({ ...prev, [poll.id]: json.selected }));
      setCelebration({ pollId: poll.id, key: Date.now() });
      toast.success("Your vote has been counted!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your vote");
    } finally {
      setPending(null);
    }
  }

  if (!polls.length) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <BarChart3 className="mx-auto mb-3 size-6 text-gold" />
        <p className="font-display text-xl text-champagne">The polls are being prepared</p>
        <p className="mt-2 text-sm text-muted">Your organizer will publish them here soon.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {polls.map((poll, pollIndex) => {
        const total = poll.options.reduce((sum, o) => sum + o.votes, 0);
        const chosen = selected[poll.id] ?? [];
        const max = Math.max(...poll.options.map((o) => o.votes), 0);
        return (
          <motion.article key={poll.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: pollIndex * 0.08 }}
            className="glass relative flex flex-col overflow-hidden rounded-2xl p-6">
            {celebration?.pollId === poll.id && <Confetti key={celebration.key} pieces={18} />}
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{poll.category ?? "Family poll"}</p>
                <h3 className="mt-2 font-display text-xl text-champagne">{poll.question}</h3>
              </div>
              <Badge className={poll.status === "OPEN" ? "!border-success/30 !bg-success/10 !text-success" : ""}>{poll.status === "OPEN" ? "Open" : "Closed"}</Badge>
            </div>

            <div className="space-y-2.5">
              {poll.options.map((option) => {
                const pct = total ? Math.round((option.votes / total) * 100) : 0;
                const isChosen = chosen.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={poll.status !== "OPEN" || !voteEligible}
                    onClick={() => setSelected((prev) => ({
                      ...prev,
                      [poll.id]: poll.multiple
                        ? (isChosen ? chosen.filter((id) => id !== option.id) : [...chosen, option.id])
                        : [option.id],
                    }))}
                    className={cn(
                      "relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left text-sm transition disabled:cursor-not-allowed",
                      isChosen ? "border-gold/60 bg-gold/10 text-champagne" : "border-white/10 text-muted hover:border-gold/35",
                    )}
                  >
                    <span className="absolute inset-y-0 left-0 bg-gold/10 transition-all duration-700" style={{ width: `${pct}%` }} />
                    <span className="relative flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 truncate">
                        {isChosen && <Check className="size-3.5 shrink-0 text-gold" />}
                        <span className="truncate">{option.label}</span>
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-foreground">{pct}%</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-[11px] text-muted">{total} total vote{total === 1 ? "" : "s"}{!max && " · no votes yet"}</p>
            <div className="mt-auto pt-5">
              {voteEligible ? (
                <Button className="w-full" size="sm" disabled={poll.status !== "OPEN" || pending === poll.id || !chosen.length} onClick={() => vote(poll)}>
                  {pending === poll.id ? <><Loader2 className="animate-spin" /> Saving...</> : chosen.length ? "Cast my vote" : "Pick an option"}
                </Button>
              ) : (
                <p className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-[11px] text-muted"><LockKeyhole className="size-3.5" /> RSVP to vote in polls</p>
              )}
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
