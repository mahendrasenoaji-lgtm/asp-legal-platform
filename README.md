# ASP Legal Intelligence Platform

Rebuild of the Arifudin Susanto Partnership (ASP) website — an Indonesian law firm
concentrated on bankruptcy, PKPU, debt restructuring, litigation and arbitration.

Legacy site: https://asplawyer.co.id/ (WordPress, still live, still carrying WordPress demo
posts and categories for fashion and music on its news page).

## Status

| Phase | Stage | State |
|---|---|---|
| 1 | Information Architecture | Complete — awaiting client sign-off |
| 2 | UI Design System | Built and testable (`prototype/styleguide.html`, `/styleguide`) |
| 3 | Frontend | **Next.js port live** — 59 routes (`app/`), **now reading from Postgres** (`lib/data.ts`), static prototype kept for reference |
| 4 | CMS / Backend | **Migrated, seeded, and wired into the app** — schema runs clean on Postgres 16, all 4 integrity guards verified to actually reject bad rows (see `docs/04-cms-backend.md` §0), `lib/data.ts` queries it directly. CMS editor (Payload) itself still unbuilt |
| 5 | SEO | **Redirect map crawled against the live site** (`docs/05-seo.md` §5.1) — 2 real gaps found and fixed; Search Console diff still blocked on ASP's own access (content request 13) |
| 6 | Security | **Headers wired in and verified against a real browser** (`middleware.ts`, `docs/06-security.md` §0) — caught and fixed a CSP bug that silently broke all client-side hydration. Pentest, uploads, admin/MFA, WAF, backups still need real infra |
| 7 | QA | **Lighthouse actually run** against the app — Accessibility 100, Performance 91 (`docs/07-qa.md` §1). Cross-browser, screen readers, real devices still pending |
| 8 | Deployment | Runbook written; nothing deployed |

**Not production-ready.** Phases 6 and 7 require real infrastructure and have not been
executed. Four content decisions are still open — see `docs/content-requests.md`.

## Quick start

**Next.js app (Phase 3) — needs the database (Phase 4) running first:**

```bash
# 1. database — see the Database section below if asp_legal_dev doesn't exist yet
cp config/.env.example .env.local   # then set DATABASE_URL to your local asp_legal_dev
npm install
npm run dev      # http://localhost:3000
npm run build    # static generation check — 59 routes, queries the DB at build time
```

TypeScript + Tailwind, but component styling is `app/tokens.css` and `app/main.css`
carried over unchanged from the prototype (already measured for contrast) rather than
rewritten as utilities — see `tailwind.config.ts` for why. Data is read through
`lib/data.ts`, which queries Postgres directly (`lib/db.ts`) — this was the actual Phase 4
CMS-swap step. Client components (`Header`, `MobileDrawer`, `IntakeForm`) import shared
constants from `lib/constants.ts` instead, not `lib/data.ts` — that file pulls in `pg`,
which cannot be bundled for the browser. Bilingual `/id/` routes are deliberately not
scaffolded yet — there is no Indonesian copy to put in them.

**Database (Phase 4):**

```bash
createdb asp_legal_dev
psql -d asp_legal_dev -v ON_ERROR_STOP=1 -f db/schema.sql
python3 db/seed.py > db/seed.sql && psql -d asp_legal_dev -v ON_ERROR_STOP=1 -f db/seed.sql
psql -d asp_legal_dev -f db/verify_guards.sql   # proves the 4 integrity guards actually bite
```

Needs PostgreSQL 15+ locally (`brew install postgresql@16`). The Next.js app reads from
this database via `lib/data.ts` / `lib/db.ts` — see `docs/04-cms-backend.md` §6 for what
still isn't wired up (the CMS editor itself, the intake API).

**Static prototype (Phase 2/3, kept for reference):**

```bash
python3 prototype/build.py       # regenerate the 57-page prototype
open prototype/index.html        # homepage
open prototype/styleguide.html   # design system, with measured contrast
python3 config/gen-redirects.py  # rebuild config/redirects.js from the CSV
```

No dependencies. The prototype is plain HTML, CSS and vanilla JS.

## Layout

```
CLAUDE.md                    project context for Claude Code
app/                          Next.js App Router — Phase 3, real build
components/                   shared React components for app/
lib/                          typed data access (data.ts) + contrast.ts
docs/
  01-information-architecture.md   audit, sitemap, content model, redirect map
  02-design-system.md              tokens, type, measured contrast, components
  03-frontend.md                   what the prototype is and how it ports to Next.js
  04-cms-backend.md                CMS choice, schema decisions, roles, API
  05-seo.md                        metadata, structured data, bilingual, migration
  06-security.md                   headers, upload controls, admin, infrastructure
  07-qa.md                         test plan and launch gate
  08-deployment.md                 topology, cutover runbook, rollback, backups
  editorial-calendar.md            6-month publishing plan + outline for article 1
  content-requests.md              13 items ASP still owes
data/                        verified facts only, each with a source
db/schema.sql                PostgreSQL schema with integrity guards
config/                      redirects, security headers, robots, env example
prototype/                   build.py + generated HTML + assets
```

## Data integrity

Everything in `data/` came from the live ASP site on 2026-08-18 and carries a source
reference. Fields ASP has not supplied are `null` on purpose, and the prototype renders an
empty state rather than inventing copy. Four integrity rules are enforced in the database
itself: a practice cannot publish without a lead lawyer, an article cannot publish without a
real author, a matter cannot publish without a public source and a named clearance, and an
award cannot exist without the awarding body's own listing.

## Next step

Client sign-off on the eight architecture decisions in §2 of the Phase 1 document, and
answers to the four open questions. Then the Next.js port.
