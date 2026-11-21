"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Check, Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/field";
import { parseGuestCount, rsvpUpdateSchema } from "@/lib/validation";

type Values = z.infer<typeof rsvpUpdateSchema>;

type Initial = {
  nickname: string; attendance: "YES" | "MAYBE" | "NO"; guests: number;
  favoriteFood: string | null; preferredActivity: string | null;
  message: string | null; whatsapp: string | null; consentPublic: boolean;
};

export function ManageRsvpForm({ token, initial }: { token: string; initial: Initial }) {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(rsvpUpdateSchema),
    defaultValues: {
      nickname: initial.nickname, attendance: initial.attendance, guests: initial.guests,
      favoriteFood: initial.favoriteFood ?? "", preferredActivity: initial.preferredActivity ?? "",
      message: initial.message ?? "", whatsapp: initial.whatsapp ?? "", consentPublic: initial.consentPublic,
    },
  });
  const attendance = watch("attendance");

  const submit = handleSubmit(async (values) => {
    try {
      const res = await fetch(`/api/rsvp/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSaved(true);
      toast.success("Your RSVP has been updated!");
      window.setTimeout(() => setSaved(false), 4000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your RSVP");
    }
  });

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-success/20 bg-success/5 p-3 text-xs text-success">
        <LockKeyhole className="size-4" /> This private link belongs to you. Please do not share it.
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="m-nickname">Nickname</Label>
          <Input id="m-nickname" {...register("nickname")} />
          <FieldError>{errors.nickname?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="m-guests">Accompanying guests</Label>
          <Input id="m-guests" type="number" min={0} max={12} {...register("guests", { setValueAs: parseGuestCount })} />
          <FieldError>{errors.guests?.message}</FieldError>
        </div>
        <div className="sm:col-span-2">
          <Label>Attendance</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["YES", "MAYBE", "NO"] as const).map((value) => (
              <button
                key={value} type="button"
                onClick={() => setValue("attendance", value, { shouldValidate: true })}
                className={`rounded-xl border px-2 py-3 text-xs transition ${attendance === value ? "border-gold bg-gold/15 text-champagne" : "border-white/12 text-muted"}`}
              >
                {value === "YES" ? "Yes!" : value === "MAYBE" ? "Maybe" : "Can't make it"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="m-food">Favourite food</Label>
          <Input id="m-food" {...register("favoriteFood")} />
        </div>
        <div>
          <Label htmlFor="m-activity">Favourite activity</Label>
          <Input id="m-activity" {...register("preferredActivity")} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="m-message">Note for the family</Label>
          <Textarea id="m-message" maxLength={500} {...register("message")} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="m-whatsapp">WhatsApp (private)</Label>
          <Input id="m-whatsapp" type="tel" {...register("whatsapp")} />
        </div>
        <label className="flex items-start gap-3 rounded-xl border border-white/10 p-4 sm:col-span-2">
          <input type="checkbox" className="mt-0.5 size-4 accent-[#d8ae63]" {...register("consentPublic")} />
          <span className="text-xs leading-relaxed text-muted">Show my nickname and note on the public Cousins Board.</span>
        </label>
      </div>
      <div className="mt-7 flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="animate-spin" /> Saving...</> : saved ? <><Check /> Saved!</> : "Save changes"}
        </Button>
        <Link href="/" className="text-xs text-muted hover:text-champagne">Back to the reunion</Link>
      </div>
    </form>
  );
}
