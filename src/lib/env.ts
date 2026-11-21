import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(16).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_INITIAL_PASSWORD: z.string().min(8).optional(),
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
  BLOB_STORE_ID: z.string().min(1).optional(),
  VERCEL_OIDC_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NODE_ENV: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

export const env = parsed.success ? parsed.data : {
  DATABASE_URL: undefined,
  DIRECT_URL: undefined,
  SESSION_SECRET: undefined,
  ADMIN_EMAIL: undefined,
  ADMIN_INITIAL_PASSWORD: undefined,
  BLOB_READ_WRITE_TOKEN: undefined,
  BLOB_STORE_ID: undefined,
  VERCEL_OIDC_TOKEN: undefined,
  NEXT_PUBLIC_SITE_URL: undefined,
  NODE_ENV: process.env.NODE_ENV,
};

export const hasDatabase = Boolean(env.DATABASE_URL);

/**
 * @vercel/blob 2.x accepts either a read/write token or Vercel OIDC plus a store
 * id. Both paths stay private; there is deliberately no public-storage fallback.
 */
export const hasBlobOidc = Boolean(env.BLOB_STORE_ID && env.VERCEL_OIDC_TOKEN);
export const hasBlobToken = Boolean(env.BLOB_READ_WRITE_TOKEN);
export const hasBlobStorage = hasBlobToken || hasBlobOidc;
export const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

let ephemeralSecret: string | undefined;

export function sessionSecret(): string {
  if (env.SESSION_SECRET) return env.SESSION_SECRET;
  // Convenient, clearly-labelled fallback for local development and previews only.
  if (process.env.NODE_ENV !== "production") {
    return "cousins-winter-reunion-2026-local-development-secret-change-me";
  }
  // Never ship a publicly known signing key. A misconfigured production
  // deployment gets a random per-instance key instead: cookies cannot be
  // forged, though sessions reset when the instance restarts.
  if (!ephemeralSecret) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    ephemeralSecret = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return ephemeralSecret;
}
