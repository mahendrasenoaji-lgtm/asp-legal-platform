# PHASE 3 — Frontend

**Status:** Next.js port built and building clean (`npm run build` — 59 static routes). The
static HTML prototype (57 pages, `prototype/`) is kept as a reference; it is what proved the
architecture and the design system worked together before any React was written, and its
generator functions mapped one-to-one onto the components below.

## 0. What changed from the prototype

- `app/` — Next.js 14 App Router, TypeScript. Routes match the table in §1 below; the 23
  lawyer, 12 practice, and 10 award pages are dynamic segments with `generateStaticParams`,
  not hand-written files.
- `lib/data.ts` — the single place the app reads data from. **Now queries Postgres directly**
  (`lib/db.ts`, a pooled `pg` client) for lawyers, practices, awards, industries and article
  categories; `firm.json` remains the source only for firm-wide settings, because
  `db/schema.sql` has no table for those yet (see `docs/04-cms-backend.md` §0). Swapping this
  for a CMS's query layer later still shouldn't require touching a page or component — the
  exported shapes didn't change, only where they come from.
- `lib/constants.ts` — pure constants/helpers (`NAV`, `DISCLAIMER`, `SITE_READY`,
  `initials`, `isLeadershipTier`) with zero dependency on `lib/db.ts`. Client components
  (`Header`, `MobileDrawer`, `IntakeForm`) **must** import from here, not `lib/data.ts`:
  Next.js bundles a client component's whole import graph for the browser, and `pg` needs
  Node core modules (`fs`, `net`, `tls`, `dns`) that don't exist there — importing
  `lib/data.ts` from a client component fails the webpack build outright, not silently.
  `lib/data.ts` re-exports the same names for server-side convenience.
- `components/` — `Header`, `MobileDrawer`, `Footer`, `Breadcrumbs`, `EmptyState`,
  `CtaBand`, `StatusBar`, `PersonCard`, `PracticeCard`, `AwardRow`, `Reveal`, `FilterChips`,
  `IntakeForm` — this is the component list `build.py`'s functions predicted.
- **Styling call:** `app/tokens.css` and `app/main.css` are the prototype's files, copied
  unchanged. Tailwind is installed and its tokens are mapped in `tailwind.config.ts` (per §4
  below) but styling itself was not rewritten as utilities — that CSS is already
  token-driven and already measured for contrast; redoing it as Tailwind classes would spend
  time on a rewrite, not on architecture, and risks a visual regression the prototype had
  already avoided. `corePlugins.preflight` is off so Tailwind doesn't fight `main.css`'s own
  reset.
- **Bilingual routing:** not scaffolded. CLAUDE.md calls for `/id/*`, but there is no
  Indonesian copy to put there yet (see the editorial calendar's own rule — half-hearted
  translation ruins both). Building an empty `/id` tree ahead of real content would be
  scaffolding with nothing behind it. Do this once Indonesian copy exists, not before.
- **Fonts:** still loaded from `fonts.googleapis.com`, same as the prototype. Self-hosting
  with a nonced nonce is a Phase 6 CSP concern (`docs/06-security.md` §1) — do it there.
- **What did not change:** no CMS, no server action on the intake form (still client-side
  validation only, same boundary the prototype drew), no database. Those stay Phase 4 and 6.

## Original prototype notes

---

## 1. What was built

| Template | Pages | Data source |
|---|---|---|
| Homepage | 1 | firm.json, practice-areas.json, awards.json, lawyers.json |
| Design system | 1 | tokens.css (contrast computed at build) |
| About | 1 | firm.json, industries.json |
| People index | 1 | lawyers.json |
| Lawyer profile | 23 | lawyers.json |
| Practice index | 1 | practice-areas.json |
| Practice detail | 12 | practice-areas.json |
| Recognition index | 1 | awards.json |
| Award detail | 10 | awards.json |
| Insights | 1 | insight-categories.json |
| Case intelligence | 1 | labelled demo rows |
| Legal intake | 1 | — |
| Contact | 1 | firm.json |
| Careers | 1 | — |
| 404 | 1 | — |

Rebuild with `python3 prototype/build.py`. Every page regenerates from `data/`, so
correcting a fact in JSON corrects it everywhere.

## 2. Why a generator and not 57 hand-written files

Three reasons, all of which carry into the Next.js port:

1. It proves the content model. If a page cannot be built from `data/`, the model is wrong.
2. It makes the missing content visible. Empty states are generated wherever a field is
   `null`, so the gaps are countable rather than papered over with placeholder prose.
3. `build.py` maps one-to-one onto the eventual React components — the functions
   `header()`, `crumbs()`, `empty_state()`, `cta_band()`, `footer()` are the component list.

## 3. Deliberate omissions

- **No invented copy.** Practice overviews, biographies for 21 of 23 lawyers, articles and
  matters are all empty states naming what is missing and who owns it.
- **No fake matters.** The case register shows three clearly flagged structural rows with no
  party names, plus a panel describing what the page does in production when nothing is cleared.
- **No chatbot.** Per the brief, the AI assistant is data preparation only.
- **`noindex` on every prototype page.** These files must never be crawled.

## 4. Porting to Next.js — done, with one deferral

1. ~~`app/[locale]/layout.tsx`~~ → `app/layout.tsx` — header, drawer, footer, skip link done.
   `[locale]` deferred: see §0, bilingual routing.
2. Done — `tokens.css` copied unchanged; tokens mapped into `tailwind.config.ts`.
3. Done — routes in the order of the table above; practice, lawyer and award pages are
   dynamic segments with `generateStaticParams`.
4. Not yet — `lib/data.ts` reads `data/*.json` directly today. It is the one file Phase 4
   needs to change; the shapes it exports are already the CMS shapes.
5. Not yet — intake form is still client-side validation only, no server action. Phase 6
   work (`docs/06-security.md` §2): server action, Zod validation, rate limit, virus scan,
   then persist.

Rendering strategy: static generation for everything content-driven, revalidated on CMS
webhook once Phase 4 lands. Only search and intake will need a server at request time.
