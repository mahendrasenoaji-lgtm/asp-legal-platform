# CLAUDE.md — ASP Legal Intelligence Platform

Context file for Claude Code. Read this before doing anything in this repo.

## What this project is

A ground-up rebuild of the website for **Arifudin Susanto Partnership (ASP)**, an Indonesian
law firm specializing in bankruptcy, PKPU (suspension of debt payment obligations),
debt restructuring, litigation and arbitration.

Legacy site: https://asplawyer.co.id/ (WordPress + Salient theme, still live, still contains
WordPress demo content on the news page).

The rebuild is not a visual redesign. It is a platform: premium firm site + legal knowledge
center + lawyer profiles + case intelligence + newsroom + lead generation, with a data
architecture ready for a later RAG-based legal assistant.

## Where we are

All eight phases have a deliverable in `docs/`. What exists is real but uneven, and the
difference matters:

| Phase | Deliverable | Actually verified? |
|---|---|---|
| 1 Information Architecture | `docs/01-...` | Yes — built from a crawl of the live site |
| 2 UI Design System | `app/tokens.css`, `/styleguide` | Contrast computed at build time; screenshotted in Chrome, matches prototype pixel-for-pixel |
| 3 Frontend | `app/` — Next.js 14 App Router, 59 routes | `npm run build` passes; dynamic routes for lawyers/practices/awards verified in-browser (nav, breadcrumbs, drawer, intake-form validation all checked) |
| 4 CMS / Backend | `db/schema.sql`, `db/seed.py`, `db/verify_guards.sql` | Migrated + seeded on Postgres 16; found and fixed 2 real bugs (a `STABLE`-function index that didn't build, and a search view that hid 21 of 23 published lawyers); all 4 integrity guards proven to reject bad rows. CMS editor and app wiring (`lib/data.ts`) still not done |
| 5 SEO | `docs/05-...`, `config/redirects.js` | Live site actually crawled (sitemap + link extraction + manual probing) — found the site runs TranslatePress (every URL, including junk, mirrored under `/id/`) and a missing author-archive redirect; both fixed. Search Console diff still needs ASP's own access (content request 13) |
| 6 Security | `config/security-headers.js` | Configured, never tested against an origin |
| 7 QA | `docs/07-...` | Plan only, plus the checks already run |
| 8 Deployment | `docs/08-...` | Runbook only |

Phase 3 is now the Next.js app in `app/`, not the static prototype (kept in `prototype/` for
reference — see `docs/03-frontend.md` §0 for what changed and what was deliberately
deferred: bilingual `/id/` routes, CMS wiring, and the intake form's server side). The honest
next step is Phase 4 (wire `lib/data.ts` to a real CMS/DB) or closing the four open decisions
below so the remaining empty states can be filled — not more documents.
Read `docs/01-information-architecture.md` and `docs/02-design-system.md` before writing
components — the token system and the empty-state pattern are load-bearing.

## Hard rules

These come from the client brief and override convenience:

- **Never invent** a lawyer, client, case, award, statistic, testimonial, office, quote or
  legal statement. If data is missing, render an empty state or leave the field null and
  add it to `docs/content-requests.md`.
- Mock data is allowed **only** in staging, must be visibly labelled `DEMO DATA`, and must
  be `noindex`.
- Never publish case data unless `is_public: true` **and** a verified public source URL exists.
- No AI feature ships in this build. Prepare the data shape only (§33 of the brief).
- Do not claim the system is production-ready before Phases 6 and 7 are finished.

## Open decisions blocking work

Four items are unresolved and must be answered by ASP. Do not paper over them:

1. Homepage claims **40 fee earners**; the People page lists **23**. Which number is real?
2. Brief asks for a **Corporate Legal Services** practice that does not exist on the legacy
   site. Include only on confirmation.
3. Legacy tier is **"Leaders"**; the brief says **"Counsel"**. These are real job titles.
4. Only 2 of 23 lawyers have a biography. The other 21 profiles cannot be built without input.

Article authorship is assigned in `docs/editorial-calendar.md`. Only the two partners have
published expertise, so only they are named; every other slot is TBD and must be filled by
ASP, not guessed.

## Verified data

`data/` holds only facts scraped from the live ASP site on 2026-08-18, with source URLs:

- `firm.json` — founding date, founders, address, phone, email, claimed metrics
- `lawyers.json` — 23 names, honorifics, tiers. Everything else is `null` by design.
- `practice-areas.json` — 12 practices (10 legacy, with bankruptcy/PKPU/restructuring split)
- `awards.json` — 10 Hukumonline recognitions, each with a source URL
- `industries.json` — 16 sectors
- `insight-categories.json` — 9 categories replacing legacy Fashion/Music/Uncategorized
- `redirects.csv` — baseline redirect map

Treat null as "not yet supplied", never as "fill it in yourself".

## Intended stack (Phase 3+)

Next.js (App Router) · TypeScript · Tailwind · Framer Motion · headless CMS
(Sanity / Payload — decide in Phase 4) · PostgreSQL · S3-compatible storage · Cloudflare CDN.

Bilingual: English at root, Indonesian under `/id/`. English stays at root to preserve the
existing indexed URLs; `/en/*` 301s to root.

## Design tokens (from brief, to be validated in Phase 2)

```
--charcoal: #111315   /* primary   */
--forest:   #16352B   /* secondary */
--gold:     #B89B5E   /* accent — sparingly */
--ivory:    #F7F5EF   /* background */
--ink:      #1C1C1C   /* text */
```

Gold on ivory fails WCAG AA for small text. Use gold for borders, dividers, icons and
active states only — never body copy. Verify every pair in Phase 2.

Headings: editorial serif (Cormorant Garamond / Playfair Display / Libre Baskerville).
Body: Inter / Manrope / Source Sans 3.

Target: WCAG 2.2 AA, Lighthouse 90+/95/95/95, LCP < 2.5s, INP < 200ms, CLS < 0.1.
The legacy site sets `user-scalable=0` — do not carry that over, it is an accessibility failure.

## Working agreement

- Ask before inventing content. Missing content is a client task, not a coding task.
- End each phase with something the client can actually click, run or read.
- Keep `docs/` as the source of truth; update it when a decision changes.
