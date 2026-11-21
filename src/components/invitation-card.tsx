"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Share2, Copy, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import type { PublicEvent } from "@/lib/data";
import { formatDate, isDateConfirmed } from "@/lib/countdown-helpers";
import { siteUrl } from "@/lib/env-client";

export function InvitationCard({ event }: { event: PublicEvent }) {
  const [name, setName] = useState("");
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const displayName = name.trim() || "A Very Special Cousin";
  const dateText = isDateConfirmed(event.eventDate) ? formatDate(event.eventDate) : "Date to Be Announced";
  const venueText = event.venue || "Venue to Be Announced";

  useEffect(() => {
    let cancelled = false;
    async function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (document.fonts?.ready) await document.fonts.ready;
      if (cancelled) return;

      const w = 1080, h = 1350;
      canvas.width = w; canvas.height = h;
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#081426"); bg.addColorStop(0.55, "#172840"); bg.addColorStop(1, "#081426");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(w / 2, 320, 20, w / 2, 320, 620);
      glow.addColorStop(0, "rgba(216,174,99,0.18)"); glow.addColorStop(1, "rgba(216,174,99,0)");
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(216,174,99,0.75)"; ctx.lineWidth = 3;
      ctx.strokeRect(48, 48, w - 96, h - 96);
      ctx.strokeStyle = "rgba(216,174,99,0.3)"; ctx.lineWidth = 1.5;
      ctx.strokeRect(66, 66, w - 132, h - 132);

      // Snowfall
      for (let i = 0; i < 70; i++) {
        const x = (i * 137.5) % w;
        const y = (i * 211.3) % h;
        ctx.beginPath();
        ctx.fillStyle = `rgba(248,245,239,${0.15 + (i % 5) * 0.09})`;
        ctx.arc(x, y, 1.5 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }

      const displayFont = getComputedStyle(document.documentElement).getPropertyValue("--font-playfair").trim() || "Georgia, serif";
      const bodyFont = getComputedStyle(document.documentElement).getPropertyValue("--font-inter").trim() || "Arial, sans-serif";

      ctx.textAlign = "center";
      ctx.fillStyle = "#d8ae63";
      ctx.font = `600 26px ${bodyFont}`;
      ctx.letterSpacing = "10px";
      ctx.fillText("YOU ARE CORDIALLY INVITED", w / 2, 175);
      ctx.letterSpacing = "0px";

      ctx.fillStyle = "#f2d7a0";
      ctx.font = `700 76px ${displayFont}`;
      wrapText(ctx, event.title, w / 2, 330, w - 200, 90);

      ctx.strokeStyle = "rgba(216,174,99,0.6)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(w / 2 - 160, 470); ctx.lineTo(w / 2 + 160, 470); ctx.stroke();

      ctx.fillStyle = "#a8b5c8";
      ctx.font = `400 28px ${bodyFont}`;
      ctx.fillText("Celebrating with", w / 2, 545);
      ctx.fillStyle = "#f8f5ef";
      ctx.font = `700 60px ${displayFont}`;
      fillTextMaxWidth(ctx, displayName, w / 2, 630, w - 180);

      ctx.fillStyle = "#d8ae63";
      ctx.font = `500 30px ${bodyFont}`;
      ctx.fillText(dateText, w / 2, 740);
      ctx.fillStyle = "#f8f5ef";
      ctx.font = `400 28px ${bodyFont}`;
      ctx.fillText(venueText, w / 2, 795);
      ctx.fillStyle = "#a8b5c8";
      ctx.font = `400 24px ${bodyFont}`;
      ctx.fillText(`${event.startTime} – ${event.endTime} · Pakistan Standard Time`, w / 2, 840);

      ctx.fillStyle = "#f2d7a0";
      ctx.font = `italic 34px ${displayFont}`;
      wrapText(ctx, "Come ready for warm hugs, long laughs and a winter we will never forget.", w / 2, 960, w - 220, 52);

      ctx.strokeStyle = "rgba(216,174,99,0.6)";
      ctx.beginPath(); ctx.moveTo(w / 2 - 160, 1110); ctx.lineTo(w / 2 + 160, 1110); ctx.stroke();
      ctx.fillStyle = "#a8b5c8";
      ctx.font = `500 24px ${bodyFont}`;
      ctx.fillText("With love, your cousins", w / 2, 1170);
      ctx.fillStyle = "#d8ae63";
      ctx.font = `400 20px ${bodyFont}`;
      ctx.fillText(siteUrl.replace(/^https?:\/\//, ""), w / 2, 1235);
    }
    draw();
    return () => { cancelled = true; };
  }, [name, displayName, dateText, venueText, event]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setExporting(true);
    canvas.toBlob((blob) => {
      if (!blob) { toast.error("Could not create the image"); setExporting(false); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cousins-winter-reunion-${displayName.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
      toast.success("Invitation card downloaded!");
    }, "image/png");
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toast.success("Invitation link copied");
    } catch { toast.error("Could not copy the link"); }
  }

  async function share() {
    const text = `You're invited to ${event.title}! ${dateText} · ${venueText}. See you there!`;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, text, url: siteUrl }); return; } catch { /* fall through */ }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${siteUrl}`)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="space-y-5">
        <div>
          <Label htmlFor="card-name">Name for the card</Label>
          <Input id="card-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="e.g. Ayesha" />
        </div>
        <div className="glass rounded-2xl p-5 text-sm">
          <p className="eyebrow mb-3">Card details</p>
          <p className="text-foreground">{dateText}</p>
          <p className="mt-1 text-muted">{venueText}</p>
          <p className="mt-1 text-muted">{event.startTime} – {event.endTime} (PKT)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={download} disabled={exporting}><Download className="size-4" /> {exporting ? "Preparing..." : "Download PNG"}</Button>
          <Button variant="outline" onClick={share}><Share2 className="size-4" /> Share</Button>
          <Button variant="ghost" onClick={copyUrl}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy link"}</Button>
        </div>
        <a href={`https://wa.me/?text=${encodeURIComponent(`You're invited to ${event.title}! ${siteUrl}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-success hover:underline">
          <Sparkles className="size-3.5" /> Share on WhatsApp
        </a>
        <p className="text-[11px] leading-relaxed text-muted">Your card never includes private RSVP links or phone numbers.</p>
      </div>

      <div className="flex justify-center">
        <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border-2 border-gold/60 bg-gradient-to-br from-[#081426] via-[#172840] to-[#081426] p-3 shadow-[0_25px_70px_-25px_rgba(216,174,99,0.4)]">
          <div className="relative flex aspect-[4/5] flex-col items-center justify-center rounded-xl border border-gold/30 px-6 text-center">
            <div aria-hidden className="absolute inset-0">
              {Array.from({ length: 20 }, (_, i) => (
                <span key={i} className="absolute size-1 rounded-full bg-white/50" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 61) % 100}%` }} />
              ))}
            </div>
            <p className="relative text-[9px] uppercase tracking-[0.3em] text-gold">You are cordially invited</p>
            <h3 className="relative mt-4 font-display text-2xl leading-tight text-champagne">{event.title}</h3>
            <div className="relative my-4 h-px w-24 bg-gold/60" />
            <p className="relative text-xs text-muted">Celebrating with</p>
            <p className="relative mt-2 font-display text-3xl text-foreground">{displayName}</p>
            <p className="relative mt-6 text-xs text-gold">{dateText}</p>
            <p className="relative mt-1 text-xs text-muted">{venueText}</p>
            <p className="relative mt-6 font-display text-sm italic text-champagne">Warm hugs, long laughs & a winter to remember.</p>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" aria-hidden />
    </div>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, currentY);
}

function fillTextMaxWidth(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number) {
  let size = 60;
  const font = ctx.font;
  while (size > 30 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = font.replace(/\d+px/, `${size}px`);
  }
  ctx.fillText(text, x, y);
}
