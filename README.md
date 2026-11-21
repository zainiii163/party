# Cousins Winter Reunion 2026

A premium, interactive winter family celebration website built with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style Radix components, Motion, Neon PostgreSQL and Prisma. Designed for mobile-first, Vercel deployment and a small family organizer team.

---

## 1. What is included

| Feature | Status | Notes |
| --- | --- | --- |
| Magical one-time invitation opening | ✅ | localStorage preference only; skippable; no forced replay on navigation |
| Cinematic homepage, countdown and nav | ✅ | Date/venue stay hidden until configured |
| Event details + editable timeline | ✅ | Admin editable, `Asia/Karachi` display |
| Multi-step RSVP + private management link | ✅ | Random token stored as SHA-256 hash; rate limited; no account required |
| Cousins attendance board | ✅ | Database-backed, consent-gated, search/filter, 30s refresh |
| Suggestion Hub + upvotes | ✅ | Moderation queue, category filters, search, sorting, visitor-based duplicate-vote prevention |
| Interactive polls | ✅ | Single/multiple choice, vote changes while open, live animated results |
| Final Reunion Plan | ✅ | Organizer-only confirmations and visual progress tracker |
| Cousins Awards | ✅ | Admin-managed categories/nominees, one vote per registered participant, hidden winners |
| Spin the Fun wheel | ✅ | Lightweight SVG wheel, accessible random-pick alternative, admin-editable options |
| Memories scrapbook | ✅ | Private Vercel Blob uploads, moderation, lightbox, swipe navigation, metadata stripping |
| Digital guestbook | ✅ | Registered cousins only, moderation, safe plain-text rendering |
| Personalised invitation cards | ✅ | Live preview, PNG export via canvas, WhatsApp/native share, copy link |
| Secure admin dashboard | ✅ | HttpOnly signed session + DB session record, bcrypt, login rate limiting, no public registration |
| SEO/social sharing | ✅ | Metadata, dynamic Open Graph image, favicon, noindex on admin/private routes |

No fake participants, RSVPs or votes are seeded. Default polls and wheel activities contain **no votes**.

---

## 2. Quick start

```bash
npm install
cp .env.example .env.local
# Fill DATABASE_URL, DIRECT_URL, SESSION_SECRET and admin credentials
npm run db:migrate
npm run db:seed
npm run admin:create
npm run dev
```

Open <http://localhost:3000>. The organizer dashboard is at `/admin/login`.

If `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` are set, the first successful login creates the organizer account automatically. You can also create it explicitly with `npm run admin:create`. **Change the initial password immediately after first login** by updating the account in the database or re-running `admin:create` with a new password.

The site runs without a database for UI review: public pages show elegant empty/setup states and mutations explain that configuration is required. Database-backed features only become fully functional once Neon is connected.

---

## 3. Environment variables

See `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | For live data | Neon **pooled** connection string (pgbouncer) used by the serverless adapter |
| `DIRECT_URL` | For migrations | Neon direct connection string for DDL/migrations |
| `SESSION_SECRET` | Yes in production | HMAC key for signed session/participant cookies (≥ 16 chars, use ≥ 32) |
| `ADMIN_EMAIL` | First-run | Organizer email bootstrap |
| `ADMIN_INITIAL_PASSWORD` | First-run | Temporary organizer password bootstrap (≥ 8 chars) |
| `BLOB_READ_WRITE_TOKEN` | For photos (option A) | Vercel Blob private store read/write token |
| `BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN` | For photos (option B) | Injected by Vercel when a Blob store is connected; OIDC takes precedence over the token. See `DEPLOYMENT_CHECKLIST.md` |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | Public origin for metadata and sharing |

Secrets are never sent to the browser. Only `NEXT_PUBLIC_SITE_URL` is public by design.

---

## 4. Neon PostgreSQL setup

1. Create a Neon project and a `cousins` database.
2. Copy the **pooled** connection string into `DATABASE_URL` and the **direct** string into `DIRECT_URL`.
3. Apply the checked-in migration (safe, explicit — never automatic at startup):

   ```bash
   npm run db:migrate
   ```

4. Load default content (schedule, decisions, example polls, wheel activities, gallery categories):

   ```bash
   npm run db:seed
   ```

5. Create the organizer account:

   ```bash
   npm run admin:create
   ```

The Prisma schema contains all indexes, unique constraints, moderation statuses and relations. `Rsvp.manageTokenHash`, `AdminSession.tokenHash`, `SuggestionVote(suggestionId, visitorId)`, `PollVote(pollId, optionId, participantId)` and `AwardVote(categoryId, participantId)` enforce the important invariants at the database level.

---

## 5. Vercel deployment

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project into Vercel; framework auto-detection should select Next.js.
3. Add every variable from `.env.example` under **Project → Settings → Environment Variables**.
4. Use Neon's pooled URL for `DATABASE_URL`; use the direct URL for `DIRECT_URL`.
5. Create a private Vercel Blob store if you want photo uploads. Connect it to the Vercel project for OIDC auth, or set `BLOB_READ_WRITE_TOKEN` (details in `DEPLOYMENT_CHECKLIST.md`).
6. Set `NEXT_PUBLIC_SITE_URL` to the final deployment origin (no trailing slash).
7. Deploy. After the first deployment, run `npm run db:migrate`, `npm run db:seed` and `npm run admin:create locally against the same Neon database` (or use Vercel's terminal/CLI with the same env vars).
8. Verify the live URL and the organizer login before sharing the invitation.

No VPS, Docker, Redis, Firebase, Supabase or separate Express server is required. No deployment is performed automatically by this repository.

---

## 6. Security model

- **Admin**: signed HS256 cookie (HttpOnly, SameSite=Lax, Secure in production), matching DB session row, server-side authorization on every admin API, bcrypt password hashing, login rate limiting, expiration and logout revocation. No public registration. Set a strong `SESSION_SECRET` (16+ characters) in production; if it is missing, production generates a random per-instance key so cookies cannot be forged, but sessions will reset on restart/instance change — configure it explicitly for stable sessions.
- **RSVP**: private random management token in the URL; only its SHA-256 hash is stored. Updates require the exact token. Contact fields are never rendered publicly.
- **Registered actions**: RSVP submission sets a signed participant cookie used for polls, awards and guestbook. Poll/award votes use DB unique constraints and transactions.
- **Suggestions/upvotes**: a signed, HttpOnly visitor cookie plus a DB unique constraint prevent casual repeat voting. **Anonymous voting cannot be perfectly one-person-one-vote** (clearing cookies or changing browsers can bypass it); this limitation is shown in the UI and documented here rather than overstated.
- **Rate limiting**: durable Neon-backed counter table with an in-memory fallback for local preview. Suggestions, votes, guestbook, uploads, RSVP and login endpoints are limited.
- **CSRF**: same-origin checks on JSON mutation route handlers; Next.js Server Actions would provide their own origin checks. Cookies are SameSite=Lax.
- **Photos**: uploaded as **private** Vercel Blob objects (token or Vercel OIDC auth; no public-storage fallback). Only `/api/media/[id]` streams images — approved photos to everyone, pending/rejected only to organizers. Raw Blob URLs are stripped from admin API responses, media responses are `no-store`, and reads are rate limited. Browser-side re-encoding strips EXIF; file type, size and magic bytes are revalidated server-side. Uploads require an admin session or an existing registered participant and same-origin request.
- **Text**: all user content is rendered as plain text; no HTML is accepted or executed. Zod validates every mutation server-side.
- **Headers**: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`; `noindex` on admin and private RSVP routes.

---

## 7. Commands

```bash
npm run dev          # development server
npm run build        # prisma generate + production build
npm run start        # production server
npm run lint         # ESLint
npm run typecheck    # strict TypeScript check
npm test             # Vitest unit tests
npm run test:e2e     # Playwright (requires browsers: npx playwright install chromium)
npm run db:generate  # regenerate Prisma client
npm run db:migrate   # apply checked-in migration with Prisma Migrate Deploy
npm run db:dev       # create a new migration during development
npm run db:seed      # default, non-fake content
npm run admin:create # organizer account from env
```

---

## 8. Verified results

During implementation the following were run locally:

- `npm run typecheck` — passed
- `npm run lint` — passed (no errors)
- `npm test` — 14 unit tests passed across 4 files
- `npm run build` — passed (Prisma client generated, all 12 routes compiled, static pages generated; no type or lint errors)
- `npm run test:e2e` — 7 Playwright tests passed in Chromium

Playwright specs live in `tests/e2e/public.spec.ts` and cover navigation, the invitation gate, RSVP validation, the fun wheel, invitation card download, admin protection and mobile overflow. The config uses `channel: "chromium"` so it runs with the full Chromium binary (new headless mode) instead of the separate headless-shell download. Run with `npx playwright install chromium && npm run test:e2e`.

---

## 9. Current external blockers

The Neon production database is connected, migrated, seeded and has an organizer account. Remaining items before going live:

- Set the Vercel production environment variables (see `DEPLOYMENT_CHECKLIST.md`), especially `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL` and the pooled/direct Neon URLs.
- Create a private Vercel Blob store and configure either the token or Vercel OIDC auth if photo uploads are required.
- Push and deploy only after explicit approval; no live URL is claimed yet.

---

## 10. Architecture

```text
src/app/                 App Router pages, route handlers, metadata, OG image
src/app/api/             RSVP, suggestions, polls, awards, guestbook, media, admin APIs
src/components/ui/       shadcn-style Radix + Tailwind primitives
src/components/sections/ homepage feature sections
src/lib/                 Prisma client, auth, data access, validation, rate limiting, defaults
prisma/schema.prisma     full relational schema
prisma/migrations/       checked-in initial migration
tests/unit/              Vitest logic tests
tests/e2e/               Playwright browser tests
```
