import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "Date to Be Announced";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Date to Be Announced";
  return new Intl.DateTimeFormat("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(date);
}

export function formatShortDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Karachi",
  }).format(date);
}

export function hashString(value: string): string {
  // Simple deterministic hash for avatar colours; not security sensitive.
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash << 5) - hash + value.charCodeAt(i);
  return Math.abs(hash).toString(16);
}

export function safeText(value: string, max = 500): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}
