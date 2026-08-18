# PROGRESS — resume context

Read this first when picking this project back up, especially on a different machine.
Local Claude memory does not sync across machines; this file is the durable artifact.

## Where things stand (as of 2026-08-18)

Repo: https://github.com/mahendrasenoaji-lgtm/asp-legal-platform (public)
Local path: `~/Documents/asp-law/files/asp-legal-platform/asp-legal-platform`
**Live site: https://asp-legal-platform.vercel.app** (Vercel, auto-deploys from `main`)

| Phase | State |
|---|---|
| 1 Information Architecture | Complete — awaiting client sign-off |
| 2 UI Design System | Built and testable (`/styleguide` on the live site) |
| 3 Frontend | **Done** — Next.js 14 App Router + TypeScript, 59 static routes, reads live from Postgres. Static HTML prototype in `prototype/` kept only for reference |
| 4 CMS / Backend | **Done, on production too** — `db/schema.sql` migrated + seeded against both local Postgres and Neon (production), all 4 integrity guards verified on both. `lib/data.ts` queries the DB directly. CMS editor (Payload) still not installed — no admin UI exists |
| 5 SEO | **Done to the extent possible** — live-crawled `asplawyer.co.id`, found it runs TranslatePress (every URL incl. junk mirrored under `/id/`), fixed the redirect map (31 rows). Search Console diff still blocked on ASP's own account access |
| 6 Security | **Headers wired in + verified with a real browser**, live in production (`middleware.ts`) — found and fixed a CSP bug that silently broke all client hydration. Pentest, uploads, admin/MFA, WAF still need real infra ASP would provide |
| 7 QA | **Real Lighthouse runs**: Accessibility 100, Performance 91, Best Practices 92. Found + fixed 2 real a11y bugs. Cross-browser, screen readers, real devices still pending |
| 8 Deployment | **Live.** Vercel project `asp-legal-platform` (team `alwayslearn`), auto-deploys on push to `main`. Neon Postgres production DB provisioned via Vercel's storage marketplace, migrated + seeded (found and fixed a Neon-specific migration bug — see below). `DATABASE_URL` set across Production/Preview/Development in Vercel project settings automatically |

## What's actually left

1. **Nothing further can happen on lawyer bios, practice overviews, articles, etc. until
   ASP supplies them** — 13 content items owed, see `docs/content-requests.md`. Inventing
   them is explicitly against the brief (`CLAUDE.md` "Hard rules").
2. **4 open architecture decisions** block real progress on People/Practices content: fee-earner
   count 40 vs 23, "Corporate Legal Services" practice, "Leaders" vs "Counsel" tier naming,
   whether the Herlin/Muhamad bios need review before going live. See `CLAUDE.md`.
3. **Phase 6/7's remainder needs infrastructure ASP would provide, not this laptop**:
   penetration testing against the live URL, the intake form's actual upload pipeline (S3 +
   ClamAV), an admin UI with real MFA/RBAC (Payload CMS isn't installed), a custom domain
   (currently on the free `*.vercel.app` subdomain), WAF, and cross-browser/real-device QA.
4. **CMS editor**: Payload is recommended (`docs/04-cms-backend.md` §1) but not installed —
   every row in the database got there via `db/seed.py`, not a person filling a form. This
   is the natural next *build* step once the open decisions above are resolved.
5. A proposal document comparing legacy vs rebuild exists: `docs/proposal/rebuild-proposal.html`
   (pushed) and `~/Desktop/ASP-Rebuild-Proposal.docx` (local only, not committed per the
   user's request) — both ready to share with ASP, still private.

## Local dev environment notes

- Next.js app: `cp config/.env.example .env.local`, set `DATABASE_URL` (local Postgres or
  the Neon production string — ask before pointing local dev at production data), then
  `npm install && npm run dev`. `npm run build` runs a postbuild step
  (`scripts/generate-csp-hashes.mjs`) that needs a **second** `next build` internally — this
  is intentional (see the CSP section of `docs/06-security.md` §0), not a hang.
- Local Postgres 16 at `asp_legal_dev` (Homebrew, `brew services start postgresql@16`). To
  rebuild from scratch: `dropdb asp_legal_dev && createdb asp_legal_dev && psql -d
  asp_legal_dev -v ON_ERROR_STOP=1 -f db/schema.sql && python3 db/seed.py > db/seed.sql &&
  psql -d asp_legal_dev -v ON_ERROR_STOP=1 -f db/seed.sql`. Guard tests:
  `psql -d asp_legal_dev -f db/verify_guards.sql`.
- **Production database is Neon**, connected to the Vercel project. Get its connection
  string via `vercel env pull` (needs `vercel login` + project already linked — it is, via
  `.vercel/` locally, which is gitignored) or the Vercel dashboard → Storage. Re-running
  `db/schema.sql` / `db/seed.sql` against it is safe — both are idempotent
  (`CREATE OR REPLACE` / `IF NOT EXISTS` / `ON CONFLICT` throughout).
- Vercel CLI: `npx vercel` (authenticated as `mahendrasenoaji-6835`, team `alwayslearn`).
  `npx vercel ls` for deployment status, `npx vercel env ls production` for env vars.

## Real bugs found and fixed this session (not just written, actually run)

Phase 3/DB wiring:
- `search_index_fts` didn't build: `unaccent()` is `STABLE`, not `IMMUTABLE`.
- `search_index`'s lawyer branch used an inner join, so 21 of 23 published lawyers were
  unfindable by search, not just bio-less. Fixed with a `LEFT JOIN`.
- No `firm_settings` table existed; `lib/data.ts` read `firm.json` directly as a workaround.
  Added a singleton table (`id boolean PRIMARY KEY DEFAULT true` + `CHECK (id)`), seeded,
  wired up.
- `industries`/`article_categories` had no `sort_order`, so seeding silently re-sorted both
  alphabetically instead of preserving the curated JSON order. Added the column.

Phase 6 (security headers):
- First CSP attempt used a per-request nonce. Looked correct via `curl`, even rendered
  visually — but Lighthouse against a real browser showed it blocking every script,
  silently breaking all client-side hydration (drawer, form validation, scroll-reveal).
  Root cause: every page is statically generated once at build time, so a nonce generated
  fresh per request can never match a nonce baked into build-time HTML. Fixed with
  per-route SHA-256 hashes computed from the actual build output
  (`scripts/generate-csp-hashes.mjs`), shipped as `Content-Security-Policy-Report-Only`
  rather than enforcing, since one inline-script source Next's hydration injects still
  isn't captured by the static-HTML scan.
- Drawer's `aria-hidden="true"` when closed didn't stop keyboard focus into its links
  (`inert` attribute doesn't render under React 18's server renderer — confirmed absent
  from output HTML). Fixed with explicit `tabIndex={-1}`.
- Footer's `<h4>` column labels broke heading order on sparse pages (h1 straight to h4).
  Changed to a styled `<p>` — footer nav groupings aren't part of the content outline.

Phase 8 (production database):
- `immutable_unaccent()` (the Phase 3 fix above) migrates clean on local Postgres 16 but
  intermittently fails to define on Neon — "text search dictionary unaccent does not
  exist" — hundreds of statements after `CREATE EXTENSION "unaccent"` ran earlier in the
  same script, despite the dictionary being immediately queryable from a separate
  connection. Tested multiple fixes directly against production (not guessed): isolated
  repros never failed, `\connect` right before the statement didn't reliably fix the real
  script, `\connect` + `pg_sleep(2)` still didn't either. Concluded this is Neon-side
  propagation lag, not controllable from the SQL side, and since search isn't wired to the
  app yet, dropped the `unaccent` dependency entirely — `search_index_fts` now indexes
  `to_tsvector('simple', title || ' ' || body)` directly. Full writeup:
  `docs/04-cms-backend.md` §0.

All fixes are in `db/schema.sql`, `middleware.ts`, `components/MobileDrawer.tsx`,
`components/Footer.tsx`. Docs: `docs/04-cms-backend.md` §0, `docs/06-security.md` §0.
