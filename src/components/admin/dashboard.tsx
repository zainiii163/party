"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LogOut, Plus, Trash2, Check, X, Save, Crown, Eye, EyeOff, RefreshCw, Upload } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button, Input, Textarea, Label, Switch, Badge } from "@/components/ui/misc-client";
import { SECTIONS, DEFAULT_SETTINGS } from "@/lib/defaults";
import { DEFAULT_UNIVERSE_CONFIG, EXPERIENCES, EXPERIENCE_GROUPS } from "@/lib/universe";

type Row = Record<string, any>;
const TABS = ["overview", "event", "rsvps", "suggestions", "polls", "awards", "photos", "guestbook", "wheel", "universe", "settings"] as const;
type Tab = (typeof TABS)[number];

async function adminFetch(resource: string, init?: RequestInit) {
  const res = await fetch(`/api/admin/${resource}`, init);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}
const jsonInit = (method: string, body: unknown): RequestInit => ({
  method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

export function AdminDashboard({ email }: { email: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const keys = ["overview", "event", "rsvps", "suggestions", "polls", "awards", "photos", "guestbook", "wheel", "universe", "settings"];
      const results = await Promise.all(keys.map((key) => adminFetch(key).catch((error) => ({ error: error.message }))));
      setData(Object.fromEntries(keys.map((key, i) => [key, results[i]])));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function mutate(resource: string, method: string, body: unknown, message = "Saved") {
    try {
      await adminFetch(resource, jsonInit(method, body));
      toast.success(message);
      await reload();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      return false;
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Organizer control room</p>
            <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">The Reunion <span className="gold-text">Dashboard</span></h1>
            <p className="mt-1 text-xs text-muted">Signed in as {email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={reload}><RefreshCw className={loading ? "animate-spin" : ""} /> Refresh</Button>
            <Button variant="outline" size="sm" onClick={logout}><LogOut /> Logout</Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="mb-6">
            {TABS.map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t === "rsvps" ? "RSVPs" : t}</TabsTrigger>)}
          </TabsList>

          <TabsContent value="overview"><Overview data={data.overview} loading={loading} onTab={setTab} /></TabsContent>
          <TabsContent value="event"><EventPanel data={data.event} mutate={mutate} /></TabsContent>
          <TabsContent value="rsvps"><RsvpPanel rows={data.rsvps?.items} mutate={mutate} /></TabsContent>
          <TabsContent value="suggestions"><SuggestionPanel rows={data.suggestions?.items} mutate={mutate} /></TabsContent>
          <TabsContent value="polls"><PollPanel rows={data.polls?.items} mutate={mutate} /></TabsContent>
          <TabsContent value="awards"><AwardPanel rows={data.awards?.items} mutate={mutate} /></TabsContent>
          <TabsContent value="photos"><PhotoPanel rows={data.photos?.items} mutate={mutate} onUploaded={reload} /></TabsContent>
          <TabsContent value="guestbook"><GuestbookPanel rows={data.guestbook?.items} mutate={mutate} /></TabsContent>
          <TabsContent value="wheel"><WheelPanel rows={data.wheel?.items} mutate={mutate} /></TabsContent>
          <TabsContent value="universe"><UniversePanel data={data.universe} mutate={mutate} /></TabsContent>
          <TabsContent value="settings"><SettingsPanel rows={data.settings?.items} mutate={mutate} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

type Mutate = (resource: string, method: string, body: unknown, message?: string) => Promise<boolean>;

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5 sm:p-7">
      <h2 className="font-display text-2xl text-champagne">{title}</h2>
      {description && <p className="mt-1 mb-6 text-xs text-muted">{description}</p>}
      {!description && <div className="my-4 h-px bg-gold/15" />}
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl border border-white/8 p-8 text-center text-sm text-muted">{text}</p>;
}

function Overview({ data, loading, onTab }: { data: any; loading: boolean; onTab: (t: Tab) => void }) {
  if (loading || !data?.stats) return <div className="skeleton h-96 rounded-2xl" />;
  const attendance = [
    { name: "Coming", value: data.stats.yes },
    { name: "Maybe", value: data.stats.maybe },
    { name: "Can't make it", value: data.stats.no },
  ];
  const cards = [
    { label: "RSVPs", value: data.stats.total, tab: "rsvps" as Tab },
    { label: "Expected guests", value: data.stats.expectedGuests, tab: "rsvps" as Tab },
    { label: "Pending ideas", value: data.pending.suggestions, tab: "suggestions" as Tab },
    { label: "Pending photos", value: data.pending.photos, tab: "photos" as Tab },
    { label: "Pending notes", value: data.pending.guestbook, tab: "guestbook" as Tab },
    { label: "Polls", value: data.totals.polls, tab: "polls" as Tab },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <button key={card.label} onClick={() => onTab(card.tab)} className="glass rounded-2xl p-4 text-left transition hover:border-gold/40">
            <p className="font-display text-3xl text-champagne">{card.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-muted">{card.label}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Attendance breakdown">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendance} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                  {["#72c7a1", "#d8ae63", "#a8b5c8"].map((color) => <Cell key={color} fill={color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#101f35", border: "1px solid rgba(216,174,99,0.3)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex justify-center gap-4 text-xs text-muted">
            {attendance.map((a) => <span key={a.name}>• {a.name}: <strong className="text-foreground">{a.value}</strong></span>)}
          </div>
        </Panel>
        <Panel title="Poll participation">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.participation.map((p: Row) => ({ name: `Poll ${p.id.slice(0, 6)}`, votes: p._count._all }))}>
                <XAxis dataKey="name" tick={{ fill: "#a8b5c8", fontSize: 10 }} />
                <YAxis tick={{ fill: "#a8b5c8", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#101f35", border: "1px solid rgba(216,174,99,0.3)", borderRadius: 12 }} />
                <Bar dataKey="votes" fill="#d8ae63" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <Panel title="Recent registrations" description="The latest cousins who joined the celebration.">
        {data.recent.length ? (
          <div className="space-y-2">
            {data.recent.map((r: Row) => (
              <div key={`${r.nickname}-${r.createdAt}`} className="flex items-center justify-between rounded-xl border border-white/8 px-4 py-3 text-sm">
                <span className="text-foreground">{r.nickname}</span>
                <Badge className={r.attendance === "YES" ? "!border-success/30 !bg-success/10 !text-success" : ""}>{r.attendance}</Badge>
              </div>
            ))}
          </div>
        ) : <Empty text="No registrations yet." />}
      </Panel>
    </div>
  );
}

function EventPanel({ data, mutate }: { data: any; mutate: Mutate }) {
  const [form, setForm] = useState<Row | null>(null);
  useEffect(() => { if (data?.event) setForm({ ...data.event, eventDate: data.event.eventDate ? data.event.eventDate.slice(0, 10) : "", schedule: data.schedule ?? [], decisions: data.decisions ?? [] }); }, [data]);
  if (!form) return <div className="skeleton h-96 rounded-2xl" />;
  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev!, [key]: value }));
  const setRow = (key: "schedule" | "decisions", index: number, field: string, value: string) => {
    setForm((prev) => ({ ...prev!, [key]: prev![key].map((row: Row, i: number) => i === index ? { ...row, [field]: value } : row) }));
  };

  return (
    <Panel title="Event details" description="Date, venue, story and the day's schedule.">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["title", "Event title"], ["eventDate", "Event date (YYYY-MM-DD)"], ["startTime", "Start time"], ["endTime", "End time"],
          ["venue", "Venue"], ["location", "Location"], ["dressCode", "Dress code"],
        ].map(([key, label]) => (
          <div key={key}>
            <Label>{label}</Label>
            <Input type={key === "eventDate" ? "date" : "text"} value={form[key] ?? ""} onChange={(e) => set(key, e.target.value)} />
          </div>
        ))}
        <div className="sm:col-span-2">
          <Label>Description</Label>
          <Textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label>Host message</Label>
          <Textarea value={form.hostMessage ?? ""} onChange={(e) => set("hostMessage", e.target.value)} />
        </div>
      </div>

      <h3 className="mt-8 mb-3 font-display text-xl text-champagne">Schedule</h3>
      <div className="space-y-2">
        {form.schedule.map((item: Row, i: number) => (
          <div key={i} className="grid gap-2 rounded-xl border border-white/8 p-3 sm:grid-cols-[110px_1fr_1fr_40px]">
            <Input value={item.time ?? ""} onChange={(e) => setRow("schedule", i, "time", e.target.value)} placeholder="4:00 PM" />
            <Input value={item.title ?? ""} onChange={(e) => setRow("schedule", i, "title", e.target.value)} placeholder="Activity" />
            <Input value={item.note ?? ""} onChange={(e) => setRow("schedule", i, "note", e.target.value)} placeholder="Note" />
            <button onClick={() => set("schedule", form.schedule.filter((_: Row, j: number) => j !== i))} className="text-destructive"><Trash2 className="size-4" /></button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => set("schedule", [...form.schedule, { time: "", title: "", note: "" }])}><Plus /> Add item</Button>
      </div>

      <h3 className="mt-8 mb-3 font-display text-xl text-champagne">Planning status</h3>
      <div className="space-y-2">
        {form.decisions.map((item: Row, i: number) => (
          <div key={i} className="grid gap-2 rounded-xl border border-white/8 p-3 sm:grid-cols-[1fr_1fr_1.4fr]">
            <Input value={item.label ?? ""} onChange={(e) => setRow("decisions", i, "label", e.target.value)} />
            <select value={item.status ?? "Pending"} onChange={(e) => setRow("decisions", i, "status", e.target.value)} className="h-11 rounded-xl border border-white/12 bg-[#172840] px-3 text-sm">
              {["Confirmed", "Under Discussion", "Voting Open", "Pending"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <Input value={item.value ?? ""} onChange={(e) => setRow("decisions", i, "value", e.target.value)} placeholder="Final value (optional)" />
          </div>
        ))}
      </div>

      <Button className="mt-8" onClick={() => mutate("event", "PATCH", form, "Event details saved")}><Save /> Save event details</Button>
    </Panel>
  );
}

function RsvpPanel({ rows, mutate }: { rows?: Row[]; mutate: Mutate }) {
  const [query, setQuery] = useState("");
  if (!rows) return <div className="skeleton h-64 rounded-2xl" />;
  const filtered = rows.filter((r) => `${r.nickname} ${r.fullName}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <Panel title="RSVP management" description={`${rows.length} registrations. Contact details are private and shown only here.`}>
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search registrations" className="mb-5 max-w-sm" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted"><tr><th className="pb-3">Name</th><th className="pb-3">Status</th><th className="pb-3">Guests</th><th className="pb-3">Contact</th><th className="pb-3">Public</th><th className="pb-3"></th></tr></thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-white/8">
                <td className="py-3"><span className="text-foreground">{r.nickname}</span><span className="block text-[11px] text-muted">{r.fullName}</span></td>
                <td className="py-3">
                  <select value={r.attendance} onChange={async (e) => { await mutate("rsvps", "PATCH", { id: r.id, attendance: e.target.value }, "RSVP updated"); }} className="rounded-lg border border-white/12 bg-[#172840] px-2 py-1.5 text-xs">
                    {["YES", "MAYBE", "NO"].map((a) => <option key={a}>{a}</option>)}
                  </select>
                </td>
                <td className="py-3 text-muted">{r.guests}</td>
                <td className="py-3 text-muted">{r.whatsapp || "—"}</td>
                <td className="py-3"><Switch checked={r.consentPublic} onCheckedChange={(v) => mutate("rsvps", "PATCH", { id: r.id, consentPublic: v }, "Visibility updated")} /></td>
                <td className="py-3 text-right"><button onClick={() => mutate("rsvps", "DELETE", { id: r.id }, "RSVP deleted").then((ok) => ok && undefined)} className="text-destructive hover:text-red-300"><Trash2 className="size-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length && <Empty text="No registrations found." />}
      <Button className="mt-6" variant="secondary" onClick={() => exportCsv(filtered)}><Upload /> Export visible rows as CSV</Button>
    </Panel>
  );
}

function exportCsv(rows: Row[]) {
  const columns = ["fullName", "nickname", "attendance", "guests", "favoriteFood", "preferredActivity", "message", "whatsapp", "consentPublic"];
  const csv = [columns.join(","), ...rows.map((r) => columns.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url; link.download = "reunion-rsvps.csv"; link.click();
  URL.revokeObjectURL(url);
}

function SuggestionPanel({ rows, mutate }: { rows?: Row[]; mutate: Mutate }) {
  if (!rows) return <div className="skeleton h-64 rounded-2xl" />;
  return (
    <Panel title="Suggestion moderation" description="Approve, edit, select or remove family ideas.">
      {rows.length ? <div className="space-y-3">{rows.map((s) => (
        <div key={s.id} className="rounded-xl border border-white/8 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2"><Badge>{s.category}</Badge><Badge className={s.status === "APPROVED" ? "!border-success/30 !bg-success/10 !text-success" : s.status === "PENDING" ? "" : "!border-destructive/30 !bg-destructive/10 !text-destructive"}>{s.status}</Badge>{s.selected && <Badge><Crown className="size-3" /> Selected</Badge>}</div>
              <p className="mt-2 font-display text-lg text-foreground">{s.title}</p>
              <p className="mt-1 text-xs text-muted">{s.description}</p>
              <p className="mt-2 text-[11px] text-muted">By {s.submitter} · {s._count.votes} votes</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => mutate("suggestions", "PATCH", { id: s.id, action: "approve" }, "Approved")}><Check /> Approve</Button>
              <Button size="sm" variant="destructive" onClick={() => mutate("suggestions", "PATCH", { id: s.id, action: "reject" }, "Rejected")}><X /> Reject</Button>
              <Button size="sm" variant="outline" onClick={() => mutate("suggestions", "PATCH", { id: s.id, action: s.selected ? "unselect" : "select" }, "Updated")}>{s.selected ? "Unselect" : "Select"}</Button>
              <button onClick={() => {
                const title = window.prompt("Edit title", s.title);
                if (title === null) return;
                const description = window.prompt("Edit description", s.description) ?? s.description;
                mutate("suggestions", "PATCH", { id: s.id, title, description }, "Suggestion updated");
              }} className="text-xs text-gold hover:underline">Edit</button>
              <button onClick={() => mutate("suggestions", "DELETE", { id: s.id }, "Deleted")} className="text-destructive"><Trash2 className="size-4" /></button>
            </div>
          </div>
        </div>
      ))}</div> : <Empty text="No suggestions yet." />}
    </Panel>
  );
}

function PollPanel({ rows, mutate }: { rows?: Row[]; mutate: Mutate }) {
  const [form, setForm] = useState({ question: "", category: "", multiple: false, options: ["", ""] });
  if (!rows) return <div className="skeleton h-64 rounded-2xl" />;
  return (
    <div className="space-y-6">
      <Panel title="Create a poll" description="Single or multiple choice — results appear publicly right away.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Poll question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          <Input placeholder="Category (optional)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div className="mt-3 space-y-2">
          {form.options.map((option, i) => (
            <div key={i} className="flex gap-2">
              <Input value={option} placeholder={`Option ${i + 1}`} onChange={(e) => setForm({ ...form, options: form.options.map((o, j) => j === i ? e.target.value : o) })} />
              {form.options.length > 2 && <button onClick={() => setForm({ ...form, options: form.options.filter((_, j) => j !== i) })} className="text-destructive"><X className="size-4" /></button>}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-muted"><Switch checked={form.multiple} onCheckedChange={(v) => setForm({ ...form, multiple: v })} /> Allow multiple choices</label>
          <Button size="sm" onClick={async () => {
            const ok = await mutate("polls", "POST", form, "Poll created");
            if (ok) setForm({ question: "", category: "", multiple: false, options: ["", ""] });
          }}><Plus /> Create poll</Button>
        </div>
      </Panel>
      <Panel title="Existing polls" description="Open, close or delete polls and watch the results.">
        {rows.length ? <div className="space-y-4">{rows.map((p) => {
          const total = p.options.reduce((sum: number, o: Row) => sum + o._count.votes, 0);
          return (
            <div key={p.id} className="rounded-xl border border-white/8 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-display text-lg text-foreground">{p.question}</p><p className="text-[11px] text-muted">{total} votes · {p.status} · {p.multiple ? "Multiple choice" : "Single choice"}</p></div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => mutate("polls", "PATCH", { id: p.id, action: p.status === "OPEN" ? "close" : "open" }, "Poll updated")}>{p.status === "OPEN" ? "Close" : "Open"}</Button>
                  <button onClick={() => mutate("polls", "DELETE", { id: p.id }, "Poll deleted")} className="text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {p.options.map((o: Row) => (
                  <div key={o.id} className="flex items-center gap-3 text-xs">
                    <span className="w-32 truncate text-muted">{o.label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8"><div className="h-full bg-gold" style={{ width: `${total ? (o._count.votes / total) * 100 : 0}%` }} /></div>
                    <span className="w-10 text-right text-foreground">{o._count.votes}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}</div> : <Empty text="No polls created yet." />}
      </Panel>
    </div>
  );
}

function AwardPanel({ rows, mutate }: { rows?: Row[]; mutate: Mutate }) {
  const [form, setForm] = useState({ title: "", emoji: "✨", description: "", active: false, nominees: ["", ""] });
  if (!rows) return <div className="skeleton h-64 rounded-2xl" />;
  return (
    <div className="space-y-6">
      <Panel title="Create an award category" description="Keep it playful and kind. Winners stay hidden until you reveal them.">
        <div className="grid gap-3 sm:grid-cols-[1fr_80px_1fr]">
          <Input placeholder="Category title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="✨" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
          <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        {form.nominees.map((n, i) => (
          <div key={i} className="mt-2 flex gap-2">
            <Input value={n} placeholder={`Nominee ${i + 1}`} onChange={(e) => setForm({ ...form, nominees: form.nominees.map((x, j) => j === i ? e.target.value : x) })} />
            {form.nominees.length > 1 && <button onClick={() => setForm({ ...form, nominees: form.nominees.filter((_, j) => j !== i) })} className="text-destructive"><X className="size-4" /></button>}
          </div>
        ))}
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, nominees: [...form.nominees, ""] })}><Plus /> Add nominee</Button>
          <label className="flex items-center gap-2 text-xs text-muted"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> Active</label>
          <Button size="sm" onClick={async () => {
            const ok = await mutate("awards", "POST", form, "Award created");
            if (ok) setForm({ title: "", emoji: "✨", description: "", active: false, nominees: ["", ""] });
          }}><Plus /> Create category</Button>
        </div>
      </Panel>
      <Panel title="Award categories" description="Activate, reveal and manage nominees.">
        {rows.length ? <div className="space-y-4">{rows.map((a) => (
          <div key={a.id} className="rounded-xl border border-white/8 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-display text-lg text-foreground">{a.emoji} {a.title}</p><p className="text-[11px] text-muted">{a._count.votes} votes · {a.active ? "Active" : "Hidden"} · {a.revealed ? "Winner revealed" : "Winner hidden"}</p></div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => mutate("awards", "PATCH", { id: a.id, action: a.active ? "deactivate" : "activate" }, "Updated")}>{a.active ? "Hide" : "Activate"}</Button>
                <Button size="sm" variant="outline" onClick={() => mutate("awards", "PATCH", { id: a.id, action: a.revealed ? "hide" : "reveal" }, "Updated")}>{a.revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}{a.revealed ? "Hide winner" : "Reveal winner"}</Button>
                <button onClick={() => mutate("awards", "DELETE", { id: a.id }, "Deleted")} className="text-destructive"><Trash2 className="size-4" /></button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {a.nominees.map((n: Row) => (
                <span key={n.id} className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted">
                  {n.name} <button onClick={() => mutate("awards", "PATCH", { id: a.id, action: "removeNominee", nomineeId: n.id }, "Nominee removed")} className="text-destructive"><X className="size-3" /></button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input placeholder="Add nominee" id={`nominee-${a.id}`} className="max-w-xs" />
              <Button size="sm" variant="ghost" onClick={() => {
                const input = document.getElementById(`nominee-${a.id}`) as HTMLInputElement;
                if (input.value.trim()) mutate("awards", "PATCH", { id: a.id, action: "addNominee", name: input.value }, "Nominee added").then((ok) => ok && (input.value = ""));
              }}><Plus /> Add</Button>
            </div>
          </div>
        ))}</div> : <Empty text="No award categories yet." />}
      </Panel>
    </div>
  );
}

function PhotoPanel({ rows, mutate, onUploaded }: { rows?: Row[]; mutate: Mutate; onUploaded: () => void }) {
  if (!rows) return <div className="skeleton h-64 rounded-2xl" />;
  return (
    <Panel title="Memories & gallery" description="Photos are stored privately; only approved images can be viewed publicly.">
      <form onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const body = new FormData(form);
        try {
          const res = await fetch("/api/memories", { method: "POST", body });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error);
          toast.success("Photo uploaded and published");
          form.reset(); onUploaded();
        } catch (error) { toast.error(error instanceof Error ? error.message : "Upload failed"); }
      }} className="mb-6 grid gap-3 rounded-xl border border-gold/20 p-4 sm:grid-cols-[1fr_1fr_auto]">
        <Input name="file" type="file" accept="image/*" required />
        <Input name="caption" placeholder="Caption" required maxLength={200} />
        <Button type="submit" size="sm"><Upload /> Upload</Button>
      </form>
      {rows.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rows.map((p) => (
        <div key={p.id} className="rounded-xl border border-white/8 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/media/${p.id}`} alt={p.caption} className="h-36 w-full rounded-lg object-cover" />
          <p className="mt-2 text-sm text-foreground">{p.caption}</p>
          <p className="text-[10px] text-muted">{p.status} · {p.category?.name ?? "Uncategorised"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.status !== "APPROVED" && <Button size="sm" variant="secondary" onClick={() => mutate("photos", "PATCH", { id: p.id, action: "approve" }, "Photo approved")}><Check /> Approve</Button>}
            {p.status !== "REJECTED" && <Button size="sm" variant="destructive" onClick={() => mutate("photos", "PATCH", { id: p.id, action: "reject" }, "Photo rejected")}><X /> Reject</Button>}
            <button onClick={() => mutate("photos", "DELETE", { id: p.id }, "Photo deleted")} className="text-destructive"><Trash2 className="size-4" /></button>
          </div>
        </div>
      ))}</div> : <Empty text="No memories uploaded yet." />}
    </Panel>
  );
}

function GuestbookPanel({ rows, mutate }: { rows?: Row[]; mutate: Mutate }) {
  if (!rows) return <div className="skeleton h-64 rounded-2xl" />;
  return (
    <Panel title="Guestbook moderation" description="Approve the warmth, keep out the spam.">
      {rows.length ? <div className="space-y-3">{rows.map((m) => (
        <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 p-4">
          <div><p className="text-sm text-foreground">“{m.message}”</p><p className="mt-1 text-[11px] text-muted">— {m.nickname} · {m.status}</p></div>
          <div className="flex gap-2">
            {m.status !== "APPROVED" && <Button size="sm" variant="secondary" onClick={() => mutate("guestbook", "PATCH", { id: m.id, action: "approve" }, "Note approved")}><Check /> Approve</Button>}
            {m.status !== "REJECTED" && <Button size="sm" variant="destructive" onClick={() => mutate("guestbook", "PATCH", { id: m.id, action: "reject" }, "Note rejected")}><X /> Reject</Button>}
            <button onClick={() => mutate("guestbook", "DELETE", { id: m.id }, "Note deleted")} className="text-destructive"><Trash2 className="size-4" /></button>
          </div>
        </div>
      ))}</div> : <Empty text="No guestbook messages yet." />}
    </Panel>
  );
}

function WheelPanel({ rows, mutate }: { rows?: Row[]; mutate: Mutate }) {
  const [label, setLabel] = useState("");
  if (!rows) return <div className="skeleton h-64 rounded-2xl" />;
  return (
    <Panel title="Fun wheel settings" description="Edit the activities or switch the whole wheel off.">
      <div className="mb-6 flex gap-2">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="New activity" />
        <Button onClick={async () => { const ok = await mutate("wheel", "POST", { label }, "Activity added"); if (ok) setLabel(""); }}><Plus /> Add</Button>
      </div>
      {rows.length ? <div className="space-y-2">{rows.map((w) => (
        <div key={w.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 p-3">
          <Input value={w.label} onChange={(e) => mutate("wheel", "PATCH", { id: w.id, label: e.target.value, enabled: w.enabled }, "Activity updated")} className="flex-1" />
          <Switch checked={w.enabled} onCheckedChange={(v) => mutate("wheel", "PATCH", { id: w.id, label: w.label, enabled: v }, "Updated")} />
          <button onClick={() => mutate("wheel", "DELETE", { id: w.id }, "Activity removed")} className="text-destructive"><Trash2 className="size-4" /></button>
        </div>
      ))}</div> : <Empty text="No activities yet." />}
    </Panel>
  );
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function UniversePanel({ data, mutate }: { data: any; mutate: Mutate }) {
  const config = data?.config ?? DEFAULT_UNIVERSE_CONFIG;
  const [surprises, setSurprises] = useState("");
  const [reveal, setReveal] = useState({ visible: false, title: "", message: "", unlockAt: "" });
  const [goal, setGoal] = useState(config.magicGoal ?? DEFAULT_UNIVERSE_CONFIG.magicGoal);

  useEffect(() => {
    const current = data?.config ?? DEFAULT_UNIVERSE_CONFIG;
    setSurprises((current.surprises ?? DEFAULT_UNIVERSE_CONFIG.surprises).join("\n"));
    setReveal({
      visible: Boolean(current.reveal?.visible),
      title: current.reveal?.title ?? "",
      message: current.reveal?.message ?? "",
      unlockAt: toLocalInput(current.reveal?.unlockAt ?? null),
    });
    setGoal(current.magicGoal ?? DEFAULT_UNIVERSE_CONFIG.magicGoal);
  }, [data]);

  if (!data) return <div className="skeleton h-96 rounded-2xl" />;

  return (
    <div className="space-y-5">
      <Panel title="Cousins Universe" description="Switch the whole universe on, or hide individual experiences instantly.">
        <div className="mb-6 flex items-center justify-between rounded-xl border border-gold/20 bg-gold/5 p-4">
          <div><p className="text-sm font-medium text-champagne">Universe visible to family</p><p className="text-xs text-muted">Turning this off hides the section without touching any other feature.</p></div>
          <Switch checked={config.enabled !== false} onCheckedChange={(v) => mutate("universe", "PATCH", { action: "global", enabled: v }, "Universe visibility updated")} />
        </div>
        <div className="space-y-5">
          {EXPERIENCE_GROUPS.map((group) => (
            <div key={group}>
              <p className="eyebrow mb-2">{group}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {EXPERIENCES.filter((e) => e.group === group).map((experience) => (
                  <label key={experience.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
                    <span className="min-w-0 text-xs text-foreground"><span className="mr-2">{experience.emoji}</span>{experience.title}</span>
                    <Switch checked={config.experiences?.[experience.id] !== false}
                      onCheckedChange={(v) => mutate("universe", "PATCH", { action: "toggle", id: experience.id, enabled: v }, "Experience updated")} />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Daily surprises" description="One line per surprise. Plain text only — links and markup are rejected.">
        <Textarea value={surprises} onChange={(e) => setSurprises(e.target.value)} rows={7} className="font-mono text-xs" />
        <Button className="mt-4" onClick={() => mutate("universe", "PATCH", {
          action: "surprises", surprises: surprises.split("\n").map((s) => s.trim()).filter(Boolean),
        }, "Surprises saved")}><Save /> Save surprises</Button>
      </Panel>

      <Panel title="Surprise reveal & midnight message" description="Control what appears when the family reaches the big reveal.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Visible to everyone</Label><Switch checked={reveal.visible}
            onCheckedChange={(v) => setReveal((prev) => ({ ...prev, visible: v }))} /></div>
          <div className="sm:col-span-2"><Label>Reveal title</Label><Input value={reveal.title} maxLength={100}
            onChange={(e) => setReveal((prev) => ({ ...prev, title: e.target.value }))} /></div>
          <div className="sm:col-span-2"><Label>Reveal message</Label><Textarea value={reveal.message} maxLength={400} rows={3}
            onChange={(e) => setReveal((prev) => ({ ...prev, message: e.target.value }))} /></div>
          <div><Label>Unlock date & time (optional)</Label><Input type="datetime-local" value={reveal.unlockAt}
            onChange={(e) => setReveal((prev) => ({ ...prev, unlockAt: e.target.value }))} /></div>
        </div>
        <Button className="mt-5" onClick={() => mutate("universe", "PATCH", {
          action: "reveal", ...reveal,
          unlockAt: reveal.unlockAt ? new Date(reveal.unlockAt).toISOString() : null,
        }, "Reveal updated")}><Save /> Save reveal</Button>
      </Panel>

      <Panel title="Community magic meter" description="Taps from cousins who are present add a point. One tap per visitor per hour.">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{data.magicCount ?? 0} magic points</Badge>
          <Input type="number" min={10} max={100000} value={goal} className="w-36"
            onChange={(e) => setGoal(Number(e.target.value))} aria-label="Magic goal" />
          <Button onClick={() => mutate("universe", "PATCH", { action: "goal", magicGoal: goal }, "Goal updated")}><Save /> Save goal</Button>
          <Button variant="outline" onClick={() => mutate("universe", "PATCH", { action: "resetMagic" }, "Magic meter reset")}>Reset meter</Button>
        </div>
      </Panel>

      <Panel title="Reported content" description="Reports are anonymous counts with a reason only — no free text or personal details.">
        {(data.reports ?? []).length ? <div className="space-y-2">{(data.reports as Row[]).map((report) => (
          <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 p-3">
            <div className="text-xs text-muted"><Badge>{report.reason}</Badge> <span className="ml-2">{report.experienceId}</span>
              <span className="ml-2">{new Date(report.createdAt).toLocaleString()}</span>
              {report.status === "DISMISSED" && <span className="ml-2 text-success">Dismissed</span>}
            </div>
            {report.status === "OPEN" && <Button size="sm" variant="ghost" onClick={() => mutate("universe", "PATCH", { action: "dismissReport", id: report.id }, "Report dismissed")}><Check /> Dismiss</Button>}
          </div>
        ))}</div> : <Empty text="No reports. The universe is behaving itself." />}
      </Panel>
    </div>
  );
}

function SettingsPanel({ rows, mutate }: { rows?: Row[]; mutate: Mutate }) {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => { if (rows) setValues({ ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((r: Row) => [r.key, r.value])) }); }, [rows]);
  const toggles = [
    ["registrationsOpen", "Registrations open"], ["attendancePublic", "Public attendance board"], ["suggestionsOpen", "Suggestion submissions"],
    ["pollsEnabled", "Show polls"], ["planEnabled", "Show reunion plan"], ["awardsEnabled", "Show awards"],
    ["wheelEnabled", "Fun wheel"], ["galleryEnabled", "Memory gallery"], ["guestbookOpen", "Guestbook writing"],
    ["memorySubmissionsOpen", "Allow guest photo uploads"],
  ];
  return (
    <Panel title="Website settings" description="Control what your family can see and do.">
      <div className="grid gap-3 sm:grid-cols-2">
        {toggles.map(([key, label]) => (
          <div key={key} className="flex items-center justify-between rounded-xl border border-white/8 p-3">
            <span className="text-sm text-foreground">{label}</span>
            <Switch checked={values[key] === "true"} onCheckedChange={(v) => setValues((prev) => ({ ...prev, [key]: String(v) }))} />
          </div>
        ))}
      </div>
      <div className="mt-4 max-w-xs">
        <Label>Registration limit (0 = unlimited)</Label>
        <Input type="number" min={0} value={values.registrationLimit ?? "0"} onChange={(e) => setValues({ ...values, registrationLimit: e.target.value })} />
      </div>
      <h3 className="mt-8 mb-3 font-display text-xl text-champagne">Visible sections</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <label key={section.key} className="flex items-center justify-between rounded-xl border border-white/8 p-3 text-sm">
            {section.label}
            <Switch checked={values[`section_${section.key}`] !== "false"} onCheckedChange={(v) => setValues((prev) => ({ ...prev, [`section_${section.key}`]: String(v) }))} />
          </label>
        ))}
      </div>
      <Button className="mt-8" onClick={() => mutate("settings", "PATCH", { settings: Object.entries(values).map(([key, value]) => ({ key, value })) }, "Settings saved")}><Save /> Save settings</Button>
    </Panel>
  );
}

export function AdminLoading() {
  return <div className="mx-auto max-w-7xl space-y-4 p-8"><div className="skeleton h-16 rounded-2xl" /><div className="skeleton h-96 rounded-2xl" /></div>;
}

export function AdminError({ message }: { message: string }) {
  return <div className="mx-auto max-w-lg p-12 text-center"><p className="font-display text-xl text-destructive">{message}</p><Button className="mt-6" asChild><a href="/admin/login">Sign in</a></Button></div>;
}
