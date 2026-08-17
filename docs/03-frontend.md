# PHASE 3 — Frontend

**Status:** Working prototype of 57 pages. Open `prototype/index.html` in a browser.
**Nature:** Static HTML/CSS/JS generated from the verified data files. This is not the
production Next.js application; it is the thing that proves the architecture and the design
system work together before anyone writes a React component.

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

## 4. Porting to Next.js

Order of work in the real application:

1. `app/[locale]/layout.tsx` — header, drawer, footer, skip link, font loading (self-hosted).
2. Copy `tokens.css` unchanged; map the token names into `tailwind.config.ts` so utilities and
   custom properties agree instead of competing.
3. Routes in the order of the table above; practice and lawyer pages as dynamic segments with
   `generateStaticParams`.
4. Replace `build.py` data loading with CMS queries — the shapes are already the shapes.
5. Intake form: server action, Zod validation, rate limit, virus scan, then persist.

Rendering strategy: static generation for everything content-driven, revalidated on CMS
webhook. Only search and intake need a server at request time.
