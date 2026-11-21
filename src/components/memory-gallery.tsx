"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { X, ChevronLeft, ChevronRight, ImagePlus, Loader2, LockKeyhole, Camera } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { cn, formatShortDate } from "@/lib/utils";
import type { PublicPhoto } from "@/lib/data";

export function MemoryGallery({
  photos, categories, canUpload, hasStorage,
}: { photos: PublicPhoto[]; categories: { id: string; name: string }[]; canUpload: boolean; hasStorage: boolean }) {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const touchX = useRef<number | null>(null);

  const visible = useMemo(() => photos.filter((p) => filter === "All" || p.categoryName === filter), [photos, filter]);

  function move(direction: number) {
    if (active === null || !visible.length) return;
    setActive((active + direction + visible.length) % visible.length);
  }

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("file") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) { toast.error("Please choose a photo"); return; }
    setUploading(true);
    try {
      const cleaned = await stripMetadata(file);
      const body = new FormData();
      body.append("file", cleaned, cleaned.name);
      body.append("caption", (form.elements.namedItem("caption") as HTMLInputElement).value);
      body.append("categoryId", (form.elements.namedItem("categoryId") as HTMLSelectElement).value);
      body.append("uploader", (form.elements.namedItem("uploader") as HTMLInputElement).value);
      const res = await fetch("/api/memories", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Thank you! Your photo is waiting for approval.");
      form.reset();
      setShowUpload(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {["All", ...categories.map((c) => c.name)].map((name) => (
            <button key={name} onClick={() => setFilter(name)} className={cn("shrink-0 rounded-full border px-4 py-2 text-xs transition", filter === name ? "border-gold bg-gold/15 text-champagne" : "border-white/12 text-muted hover:border-gold/40")}>
              {name}
            </button>
          ))}
        </div>
        {canUpload && hasStorage && <Button variant="outline" size="sm" onClick={() => setShowUpload((v) => !v)}><ImagePlus className="size-4" /> Share a memory</Button>}
      </div>

      {canUpload && !hasStorage && (
        <p className="mb-6 rounded-xl border border-gold/20 bg-gold/5 p-4 text-center text-xs text-muted">
          Photo uploads need a private Vercel Blob store. Ask the organizer to connect one.
        </p>
      )}
      {canUpload && hasStorage && showUpload && (
        <form onSubmit={upload} className="glass mb-8 grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="photo-file">Choose a photo (JPG, PNG, WebP or AVIF, max 6 MB)</Label>
            <Input id="photo-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="pt-2" />
          </div>
          <div>
            <Label htmlFor="photo-caption">Caption</Label>
            <Input id="photo-caption" name="caption" required maxLength={200} placeholder="That one lazy winter afternoon..." />
          </div>
          <div>
            <Label htmlFor="photo-category">Category</Label>
            <select id="photo-category" name="categoryId" className="h-11 w-full rounded-xl border border-white/12 bg-[#172840] px-4 text-sm text-foreground outline-none">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="photo-uploader">Your nickname</Label>
            <Input id="photo-uploader" name="uploader" maxLength={50} />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={uploading}>{uploading ? <><Loader2 className="animate-spin" /> Uploading...</> : "Send for approval"}</Button>
          </div>
          <p className="text-[11px] text-muted sm:col-span-2">Approved photos become publicly visible to anyone with the website link. Please only share images you have permission to share.</p>
        </form>
      )}

      {visible.length ? (
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {visible.map((photo, i) => (
            <motion.button
              key={photo.id}
              type="button"
              onClick={() => setActive(i)}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg border-4 border-[#f3ede1] bg-[#f3ede1] p-1.5 pb-8 text-left shadow-[0_12px_30px_-16px_rgba(0,0,0,0.9)] transition hover:-translate-y-1.5 hover:rotate-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.imageUrl} alt={photo.caption} loading="lazy" className="w-full rounded-sm object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute bottom-2 left-3 right-3 truncate font-display text-[11px] text-[#25344a]">{photo.caption}</span>
              <span className="absolute bottom-0.5 left-3 text-[8px] uppercase tracking-wider text-[#25344a]/60">{formatShortDate(photo.createdAt)}</span>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <Camera className="mx-auto mb-3 size-6 text-gold" />
          <p className="font-display text-xl text-champagne">The scrapbook is waiting</p>
          <p className="mt-2 text-sm text-muted">Approved memories will appear here, Polaroid style.</p>
        </div>
      )}

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        {active !== null && visible[active] && (
          <DialogContent className="max-w-3xl !border-gold/30 !bg-[#081426]/95 p-4 sm:p-6">
            <DialogTitle className="sr-only">{visible[active].caption}</DialogTitle>
            <div
              className="relative"
              onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }}
              onTouchEnd={(e) => {
                if (touchX.current === null) return;
                const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
                if (Math.abs(dx) > 50) move(dx > 0 ? -1 : 1);
                touchX.current = null;
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div key={visible[active].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={visible[active].imageUrl} alt={visible[active].caption} className="mx-auto max-h-[70vh] w-auto rounded-xl object-contain" />
                  <p className="mt-4 text-center font-display text-lg text-champagne">{visible[active].caption}</p>
                  <p className="text-center text-[11px] text-muted">{visible[active].categoryName} · {formatShortDate(visible[active].createdAt)}</p>
                </motion.div>
              </AnimatePresence>
              <button onClick={() => move(-1)} aria-label="Previous photo" className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-[#081426]/80 text-champagne transition hover:bg-gold/25"><ChevronLeft className="size-5" /></button>
              <button onClick={() => move(1)} aria-label="Next photo" className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-[#081426]/80 text-champagne transition hover:bg-gold/25"><ChevronRight className="size-5" /></button>
              <button onClick={() => setActive(null)} aria-label="Close gallery" className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-[#081426]/80 text-champagne"><X className="size-5" /></button>
            </div>
          </DialogContent>
        )}
      </Dialog>
      {!canUpload && <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-muted"><LockKeyhole className="size-3.5" /> Only registered cousins can submit memories.</p>}
    </div>
  );
}

/** Re-encoding in the browser strips EXIF and other embedded metadata. */
async function stripMetadata(file: File): Promise<File> {
  if (typeof createImageBitmap === "undefined") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const max = 1800;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file;
  }
}
