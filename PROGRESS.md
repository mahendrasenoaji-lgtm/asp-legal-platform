# PROGRESS — resume context

Read this first when picking this project back up, especially on a different machine.
Local Claude memory does not sync across machines; this file is the durable artifact.

## Where things stand (as of 2026-08-18)

Repo: https://github.com/mahendrasenoaji-lgtm/asp-legal-platform (public)
Local path: `~/Documents/asp-law/files/asp-legal-platform/asp-legal-platform`

| Phase | State |
|---|---|
| 1 Information Architecture | Complete — awaiting client sign-off |
| 2 UI Design System | Built and testable (`/styleguide` in the Next.js app) |
| 3 Frontend | **Done** — real Next.js 14 App Router + TypeScript app in `app/`, 59 static routes, `npm run build` passes **reading live from Postgres**. Static HTML prototype in `prototype/` kept only for reference |
| 4 CMS / Backend | **Done (locally)** — `db/schema.sql` migrated + seeded against a local Postgres 16 (`asp_legal_dev`), all 4 integrity guards verified to actually reject bad rows, and **`lib/data.ts` now queries it directly** (`lib/db.ts`) instead of `data/*.json`. CMS editor (Payload) still not installed — no admin UI exists, every DB row got there via `db/seed.py` |
| 5 SEO | **Done to the extent possible** — live-crawled `asplawyer.co.id` (sitemap, links, manual probing), found the legacy site runs TranslatePress (every URL incl. junk mirrored under `/id/`) and a missing author-archive redirect, fixed both. `data/redirects.csv` now 31 rows. Search Console diff still blocked on ASP's own account access |
| 6 Security | Not started against real infra — config only |
| 7 QA | Not started — plan only, plus the link check that already passes |
| 8 Deployment | Not started — runbook only, nothing deployed |

## What to do next, in order

1. **Phase 6/7/8 all need real infrastructure** (a server, a domain, a hosting account) that
   didn't exist in this session — none of them can progress further on a laptop alone.
2. ~~Wire the database into the app~~ — **done.** `lib/data.ts` now queries Postgres via
   `lib/db.ts`. Remaining DB-related gaps: no `firm_settings` table yet (firm.json still
   used for that), `industries`/`article_categories` have no `sort_order` column so their
   curated JSON order doesn't survive seeding, and there's still no CMS editor UI — every
   row in the database got there via `db/seed.py`, not a person filling a form.
3. **13 content items are still owed by ASP**, not by development — see
   `docs/content-requests.md`. Nothing further can be built for lawyer bios, practice
   overviews, articles, etc. until those arrive; inventing them is explicitly against the
   brief (`CLAUDE.md` "Hard rules").
4. Four open architecture decisions (fee-earner count 40 vs 23, "Corporate Legal Services"
   practice, "Leaders" vs "Counsel" tier naming, tier naming for Herlin/Muhamad) also block
   real progress on People/Practices content — see `CLAUDE.md`.

## Local dev environment notes

- Next.js app: **needs the database running first** — `lib/data.ts` queries Postgres at
  build/request time now. `cp config/.env.example .env.local`, set `DATABASE_URL` to the
  `asp_legal_dev` database below, then `npm install && npm run dev` (or `npm run build` to
  check the 59-route static generation still passes).
- Database: a local Postgres 16 exists at `asp_legal_dev` (Homebrew, data dir
  `/usr/local/var/postgresql@16`, started via `brew services start postgresql@16`). To
  rebuild from scratch: `dropdb asp_legal_dev && createdb asp_legal_dev && psql -d
  asp_legal_dev -v ON_ERROR_STOP=1 -f db/schema.sql && python3 db/seed.py > db/seed.sql &&
  psql -d asp_legal_dev -v ON_ERROR_STOP=1 -f db/seed.sql`. Guard tests:
  `psql -d asp_legal_dev -f db/verify_guards.sql`.
- This database only exists on this machine — it is not part of the git repo (only
  `db/schema.sql`, `db/seed.py` and the generated `db/seed.sql` are committed) and won't
  follow to another computer. Recreate it there with the commands above.

## Two real bugs found and fixed this session (not just written, actually run)

- `search_index_fts` didn't build: `unaccent()` is `STABLE`, not `IMMUTABLE` — fixed with an
  `immutable_unaccent()` wrapper.
- `search_index`'s lawyer branch used an inner join to `lawyer_translations`, so 21 of 23
  published lawyers (everyone without a bio yet) were entirely unfindable by name in search,
  not just bio-less. Fixed with a `LEFT JOIN`.

Both are in `db/schema.sql`; see `docs/04-cms-backend.md` §0 for the full writeup.
