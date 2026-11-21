"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2, Copy, Sparkles, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/field";
import { Confetti } from "@/components/effects/confetti";
import { parseGuestCount, rsvpSchema } from "@/lib/validation";
import { RSVP_SUCCESS_EVENT } from "@/lib/events";

type FormValues = z.infer<typeof rsvpSchema>;
const STEPS = ["Your details", "Attendance", "Preferences", "Confirm"];

export function RsvpForm({ open }: { open: boolean }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ token: string; name: string } | null>(null);
  const [attendance, setAttendance] = useState<"YES" | "MAYBE" | "NO">("YES");

  const form = useForm<FormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      fullName: "", nickname: "", attendance: "YES", guests: 0,
      favoriteFood: "", preferredActivity: "", message: "", whatsapp: "", consentPublic: false,
    },
    mode: "onTouched",
  });
  const { register, formState: { errors }, trigger, handleSubmit, watch, setValue } = form;

  async function next() {
    const fields: (keyof FormValues)[][] = [
      ["fullName", "nickname"],
      ["attendance", "guests"],
      ["favoriteFood", "preferredActivity", "message", "whatsapp"],
      ["consentPublic"],
    ];
    const valid = await trigger(fields[step], { shouldFocus: true });
    if (valid) setStep((s) => Math.min(s + 1, 3));
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit your RSVP");
      setDone({ token: data.token, name: values.nickname });
      // The API has set the signed participant cookie. Unlock on-page polls
      // without requiring the visitor to reload the homepage.
      window.dispatchEvent(new Event(RSVP_SUCCESS_EVENT));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  });

  if (!open) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="font-display text-xl text-champagne">Registrations are closed for now.</p>
        <p className="mt-2 text-sm text-muted">Please check back a little later — we would love to have you with us.</p>
      </div>
    );
  }

  if (done) {
    const manageUrl = `${window.location.origin}/rsvp/manage/${done.token}`;
    return (
      <div className="glass glow-gold relative overflow-hidden rounded-2xl p-8 text-center">
        <Confetti />
        <div className="relative">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/15 text-success ring-1 ring-success/30">
            <PartyPopper className="size-7" />
          </div>
          <h3 className="mt-6 font-display text-3xl text-champagne">You&apos;re on the list, {done.name}!</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Your RSVP has been saved. Keep this private link safe — it is the only way to change your answers later.
          </p>
          <div className="mx-auto mt-6 flex max-w-lg items-center gap-2 rounded-xl border border-gold/25 bg-[#0b1a2e]/70 p-2">
            <input readOnly value={manageUrl} aria-label="Private RSVP link" className="min-w-0 flex-1 bg-transparent px-2 text-xs text-muted outline-none" />
            <Button size="sm" type="button" onClick={() => { navigator.clipboard?.writeText(manageUrl); toast.success("Private link copied"); }}>
              <Copy className="size-3.5" /> Copy
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild><a href={`/rsvp/manage/${done.token}`}>Open my RSVP</a></Button>
            <Button variant="outline" asChild><a href="#invite-card">Make my invitation card <Sparkles className="size-4" /></a></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass rounded-2xl p-6 sm:p-8" noValidate>
      <div className="mb-7 flex items-center justify-between gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-2">
            <div className={`grid size-8 place-items-center rounded-full border text-xs font-semibold transition ${i <= step ? "border-gold bg-gold text-[#081426]" : "border-white/15 text-muted"}`}>
              {i < step ? <Check className="size-4" /> : i + 1}
            </div>
            <span className={`hidden text-[9px] uppercase tracking-wider sm:block ${i === step ? "text-champagne" : "text-muted"}`}>{label}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.25 }}
          className="min-h-52 space-y-5"
        >
          {step === 0 && (
            <>
              <div>
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" autoComplete="name" placeholder="e.g. Ayesha Khan" {...register("fullName")} />
                <FieldError>{errors.fullName?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor="nickname">What should we call you?</Label>
                <Input id="nickname" placeholder="e.g. Ayesh" {...register("nickname")} />
                <FieldError>{errors.nickname?.message}</FieldError>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <fieldset>
                <legend className="mb-3 text-xs font-medium text-champagne/90">Will you be joining us?</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(["YES", "MAYBE", "NO"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setAttendance(value); setValue("attendance", value, { shouldValidate: true }); }}
                      className={`rounded-xl border px-2 py-4 text-sm font-medium transition ${attendance === value ? "border-gold bg-gold/15 text-champagne" : "border-white/12 text-muted hover:border-gold/40"}`}
                    >
                      {value === "YES" ? "Yes!" : value === "MAYBE" ? "Maybe" : "Can't make it"}
                    </button>
                  ))}
                </div>
                <FieldError>{errors.attendance?.message}</FieldError>
              </fieldset>
              <div>
                <Label htmlFor="guests">How many guests will accompany you?</Label>
                <Input id="guests" type="number" min={0} max={12} {...register("guests", { setValueAs: parseGuestCount })} />
                <FieldError>{errors.guests?.message}</FieldError>
                <p className="mt-1.5 text-[11px] text-muted">Children and partners count as guests.</p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label htmlFor="favoriteFood">Favourite food</Label>
                <Input id="favoriteFood" placeholder="Biryani, karahi, dessert..." {...register("favoriteFood")} />
                <FieldError>{errors.favoriteFood?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor="preferredActivity">Favourite activity</Label>
                <Input id="preferredActivity" placeholder="Ludo, cricket, storytelling..." {...register("preferredActivity")} />
              </div>
              <div>
                <Label htmlFor="message">A note for the family (optional)</Label>
                <Textarea id="message" maxLength={500} placeholder="What are you most excited about?" {...register("message")} />
                <FieldError>{errors.message?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp number (private — never displayed publicly)</Label>
                <Input id="whatsapp" type="tel" placeholder="+92 300 1234567" {...register("whatsapp")} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm">
                <p className="text-champagne"><span className="text-muted">Name:</span> {watch("fullName")} ({watch("nickname")})</p>
                <p className="mt-1 text-champagne"><span className="text-muted">Attendance:</span> {watch("attendance")} · {watch("guests")} guest(s)</p>
                <p className="mt-1 text-champagne"><span className="text-muted">Favourite:</span> {watch("favoriteFood") || "Not specified"}</p>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-4">
                <input type="checkbox" className="mt-0.5 size-4 accent-[#d8ae63]" {...register("consentPublic")} />
                <span className="text-xs leading-relaxed text-muted">
                  I agree that my <strong className="text-foreground">nickname</strong> and optional note may appear on the public Cousins Board.
                  My phone number and full name will never be published.
                </span>
              </label>
              <FieldError>{errors.consentPublic?.message}</FieldError>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft /> Back
        </Button>
        {step < 3 ? (
          <Button type="button" onClick={next}>Continue <ArrowRight /></Button>
        ) : (
          <Button type="submit" disabled={submitting}>
            {submitting ? <><Loader2 className="animate-spin" /> Sending...</> : <>Send my RSVP <Check /></>}
          </Button>
        )}
      </div>
    </form>
  );
}
