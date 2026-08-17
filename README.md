# ASP Legal Intelligence Platform

Rebuild of the Arifudin Susanto Partnership (ASP) website — a premium Indonesian law firm
site with a legal knowledge center, lawyer profiles, case intelligence and lead generation.

Legacy site: https://asplawyer.co.id/

## Status

| Phase | Stage | State |
|---|---|---|
| 1 | Information Architecture | Complete — awaiting client sign-off |
| 2 | UI Design System | Not started |
| 3 | Frontend | Not started |
| 4 | CMS / Backend | Not started |
| 5 | SEO | Not started |
| 6 | Security | Not started |
| 7 | QA | Not started |
| 8 | Deployment | Not started |

No application code exists yet. This repository currently holds architecture documents
and verified seed data.

## Layout

```
CLAUDE.md                             project context for Claude Code
docs/
  01-information-architecture.md      Phase 1 deliverable (audit, sitemap, content model, redirects)
  content-requests.md                 what ASP still needs to supply
data/
  firm.json                           firm profile, office, claimed metrics
  lawyers.json                        23 verified people (names/tiers only)
  practice-areas.json                 12 practice areas
  awards.json                         10 Hukumonline recognitions with source URLs
  industries.json                     16 sectors
  insight-categories.json             9 editorial categories
  redirects.csv                       301 / 410 / block map
```

## Data integrity

Everything in `data/` was taken from the live ASP site on 2026-08-18 and carries a source
reference. Fields that ASP has not supplied are `null` on purpose. Nothing here is invented —
see the hard rules in `CLAUDE.md` before adding content.

## Next step

Client sign-off on the eight architecture decisions in §2 of the Phase 1 document, then
Phase 2 — UI Design System.
