"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Users, UserCheck, HelpCircle, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/misc";
import type { PublicRsvp } from "@/lib/data";
import { formatShortDate, initials, hashString } from "@/lib/utils";

type Stats = { total: number; yes: number; maybe: number; no: number; expectedGuests: number };
type Payload = { rsvps: PublicRsvp[]; stats: Stats; public: boolean };

const AVATAR_COLORS = [
  "from-[#d8ae63]/35 to-[#f2d7a0]/10",
  "from-[#72c7a1]/30 to-[#72c7a1]/5",
  "from-[#6a9bd8]/30 to-[#6a9bd8]/5",
  "from-[#c98fb8]/30 to-[#c98fb8]/5",
];

export function AttendanceBoard({ initial }: { initial: Payload }) {
  const [data, setData] = useState(initial);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "YES" | "MAYBE">("ALL");

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const res = await fetch("/api/public/board", { cache: "no-store" });
        if (res.ok) setData(await res.json());
      } catch { /* keep last good data */ }
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = useMemo(
    () => data.rsvps.filter((r) =>
      (filter === "ALL" || r.attendance === filter) &&
      r.displayName.toLowerCase().includes(query.toLowerCase())),
    [data.rsvps, filter, query],
  );

  const stats = [
    { icon: Users, label: "Registrations", value: data.stats.total },
    { icon: UserCheck, label: "Confirmed", value: data.stats.yes },
    { icon: HelpCircle, label: "Maybe", value: data.stats.maybe },
    { icon: Sparkles, label: "Expected guests", value: data.stats.expectedGuests },
  ];

  return (
    <div>
      {!data.public && (
        <p className="mb-6 rounded-xl border border-gold/20 bg-gold/5 p-4 text-center text-sm text-muted">
          The attendance board is currently private.
        </p>
      )}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass rounded-2xl p-4 text-center sm:p-5">
            <Icon className="mx-auto mb-2 size-4 text-gold" />
            <div className="font-display text-2xl text-champagne sm:text-3xl">{value}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a cousin..." className="pl-10" aria-label="Search cousins" />
        </div>
        <div className="flex gap-2">
          {(["ALL", "YES", "MAYBE"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full border px-4 py-2 text-xs transition ${filter === value ? "border-gold bg-gold/15 text-champagne" : "border-white/12 text-muted hover:border-gold/40"}`}
            >
              {value === "ALL" ? "Everyone" : value === "YES" ? "Coming" : "Maybe"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, index) => (
            <motion.article
              key={r.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(index * 0.04, 0.3) }}
              className="glass group rounded-2xl p-5 transition hover:-translate-y-1 hover:border-gold/40"
            >
              <div className="flex items-center gap-4">
                <div className={`grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br ${AVATAR_COLORS[parseInt(hashString(r.displayName).slice(0, 2), 16) % AVATAR_COLORS.length]} font-display text-lg text-champagne ring-1 ring-gold/30`}>
                  {initials(r.displayName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg text-foreground">{r.displayName}</p>
                  <Badge className={r.attendance === "YES" ? "!border-success/30 !bg-success/10 !text-success" : "!text-muted"}>
                    {r.attendance === "YES" ? "Coming" : "Maybe"}
                  </Badge>
                </div>
              </div>
              {r.message && <p className="mt-4 border-t border-white/8 pt-4 text-sm italic leading-relaxed text-muted">“{r.message}”</p>}
              <p className="mt-4 text-[10px] uppercase tracking-wider text-muted/60">Joined {formatShortDate(r.createdAt)}</p>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="font-display text-xl text-champagne">No cousins here yet</p>
          <p className="mt-2 text-sm text-muted">Once people RSVP and choose to appear publicly, their cards will glow here.</p>
        </div>
      )}
    </div>
  );
}
