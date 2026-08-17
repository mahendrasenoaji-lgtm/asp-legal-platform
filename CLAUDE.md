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

**Phase 1 (Information Architecture) is complete and awaiting client sign-off.**
Read `docs/01-information-architecture.md` in full before starting Phase 2. It contains the
legacy site audit, final sitemap, content model, navigation model, and the 301/410 redirect map.

Phase order — do not skip, and produce something testable at the end of each:

1. Information Architecture — DONE (pending sign-off)
2. UI Design System — NEXT
3. Frontend
4. CMS / Backend
5. SEO
6. Security
7. QA
8. Deployment

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
