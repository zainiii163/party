# Vercel production deployment checklist

Status: **prepared, not deployed**. No Vercel deployment, push, or production environment change has been made. Awaiting explicit approval.

## Verified baseline

- Neon production branch is linked (`party` / `production`); `neon deploy` reported no policy changes.
- Prisma migration `20260101000000_init` is applied to the production branch; default, non-fake content is seeded; one organizer account exists; zero RSVPs/suggestions/votes were seeded.
- `npm run typecheck`, `npm run lint`, `npm test` (27 tests, including 13 gallery security tests), `npm run test:e2e` (7 tests) and `npm run build` all pass.
- `.env`, `.env.local` and `.neon` are git-ignored; no credential-like literals exist in Git-visible files.
- App uses pooled `DATABASE_URL` via `PrismaNeon`; Prisma migrations use direct `DIRECT_URL`.
- `SESSION_SECRET` is configured locally with a length of at least 32 characters (value not recorded here).
- Blob credentials (`BLOB_READ_WRITE_TOKEN` / OIDC pair) are **not** configured locally. Photo uploads degrade to a setup-required state; all other features work.
- The gallery uses private Blob objects only, with a controlled media route; no public-storage fallback exists.

## 1. Vercel environment variables

Set these under **Project → Settings → Environment Variables** using the production Neon branch values — do not copy the local development values verbatim.

| Variable | Required | Scope | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Production (and preview if used) | Neon **pooled** connection string; all app/serverless traffic |
| `DIRECT_URL` | Yes (migration step) | Production | Neon **direct** connection string; used only by `prisma migrate deploy` |
| `SESSION_SECRET` | **Yes in production** | Production | Signing key for admin/participant cookies. Generate with `openssl rand -base64 48` (≥ 32 chars). If omitted, the app falls back to a random per-instance key: cookies cannot be forged, but sessions reset on restart/instance change |
| `NEXT_PUBLIC_SITE_URL` | **Yes in production** | Production | Final public HTTPS origin, no trailing slash (e.g. `https://your-project.vercel.app`). Source fallbacks use `http://localhost:3000`, so this must be set |
| `BLOB_READ_WRITE_TOKEN` | Option A for photo uploads | Production | Read/write token for a **private** Vercel Blob store. Without either auth option the gallery shows a setup-required state |
| `BLOB_STORE_ID` | Option B (OIDC) for photo uploads | Production | Store id for Vercel Blob OIDC auth. Normally injected automatically when a Blob store is connected to the Vercel project |
| `VERCEL_OIDC_TOKEN` | Option B (OIDC) for photo uploads | Production | Short-lived Vercel OIDC token, injected automatically at runtime. Do **not** create this manually; it is issued by Vercel |
| `ADMIN_EMAIL` | No | First-run only | Organizer bootstrap. The organizer already exists in the database, so this should not be set permanently |
| `ADMIN_INITIAL_PASSWORD` | No | First-run only | Temporary bootstrap password. Remove after first login; rotate the organizer password if these are ever used |

Not required by the application runtime: `NEON_BRANCH`, `NEON_BRANCH_ID`, `NEON_FUNCTION_HOST_SUFFIX` (local Neon CLI/branch context only).

Only `NEXT_PUBLIC_SITE_URL` is public by design; every other variable is a server-side secret.

### Vercel Blob authentication (installed `@vercel/blob` 2.9.0)

The SDK supports exactly two server-side auth paths, both verified from its installed type definitions:

1. **Token** — `BLOB_READ_WRITE_TOKEN` (the SDK default). Works locally and on Vercel.
2. **OIDC** — `VERCEL_OIDC_TOKEN` + `BLOB_STORE_ID`. Vercel injects these when a Blob store is connected to the project; no token needs to be copied. When both OIDC values are present the SDK uses them and ignores `BLOB_READ_WRITE_TOKEN`.

`src/lib/blob.ts` selects one path and always calls `put`/`get` with `access: "private"` and `del` with the same credentials. There is no code path that creates public blobs or returns a raw Blob URL to a browser. OIDC-only deployments are supported; no token needs to be invented.

## 2. Build and data steps

1. Build command: `npm run build` (runs `prisma generate` then `next build`).
2. Migrations are **never** run automatically at startup. After the production env vars are in place, run `npm run db:migrate` once against the production Neon branch and confirm `_prisma_migrations` shows `20260101000000_init` applied. It has already been applied from this workspace; do not re-apply blindly if the ledger already shows it.
3. Do **not** re-run `npm run db:seed` or `npm run admin:create` unless intentionally resetting content. Default content and the organizer account already exist.
4. Never use a reset, force-push, or destructive SQL against the production branch.

## 3. Pre-deploy security checks

- [x] Secret files excluded from Git (`.env`, `.env.local`, `.neon`)
- [x] Pooled/direct database split verified in `prisma/schema.prisma` and `src/lib/db.ts`
- [x] `SESSION_SECRET` explicitly configured for production in the checklist above
- [x] No development URLs in `next.config.ts`; `NEXT_PUBLIC_SITE_URL` marked required
- [x] Blob storage credential gap identified (photos only); token and OIDC paths documented
- [x] Gallery privacy checks: private Blob only, controlled media route, no-store headers, raw URL stripping from admin responses, magic-byte image validation, participant DB check, media rate limiting
- [x] Full test suite and production build pass
- [ ] Remaining npm advisories reviewed and accepted (see below)

Remaining advisories after the compatible same-major overrides (`postcss` 8.5.33, `zod` 4.6.7):

- 2 critical, development/test-only: `vitest`, `tinypool` (fix requires Vitest 5 major).
- 4 high, build-time only: `prisma`, `@prisma/config`, `deepmerge-ts`, `effect` (fix requires Prisma downgrade or `deepmerge-ts` major).
- 1 moderate, development/test-only: `@vitest/mocker` (fix requires major).
- No remaining production-runtime advisories after the overrides.

One non-blocking build warning remains: an edge-runtime page disables static generation for that page.

## 4. Post-deploy verification

1. Homepage, countdown and section navigation render with the premium winter design.
2. RSVP submission and private management link work against Neon.
3. Attendance board, suggestions, polls, awards and guestbook write real records.
4. Organizer login succeeds and `/api/admin/overview` and `/api/admin/event` return 200.
5. `sitemap.xml` and `robots.txt` use the production origin, not localhost.
6. If Blob auth is configured (token or OIDC), upload an image as an organizer (auto-approved) and as a registered cousin (pending), then confirm: the public gallery shows only the approved one, `/api/media/<pending-id>` returns 404 to a signed-out browser, organizer preview works, and no raw Blob URL appears in page HTML or `/api/admin/photos`.
7. Confirm media responses include `Cache-Control: private, no-store` and that a rejected photo disappears immediately.
8. Confirm no unexpected rows were added during verification and clean up any test records.

## 5. Rollback

Revert the Vercel deployment if needed. The applied migration is additive; do not reset or delete production data as part of a rollback.

## Approval

Pushing, deploying and setting production environment variables require explicit approval and have not been performed.
