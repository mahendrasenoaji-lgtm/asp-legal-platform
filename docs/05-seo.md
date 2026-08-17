# PHASE 5 — SEO Architecture

**Status:** Specified. Redirect config generated (`config/redirects.js`), robots written
(`config/robots.txt`). Structured data templates below.

---

## 1. Metadata rules

Every page carries a unique title, description, canonical, Open Graph and X card. Templates:

| Template | Title pattern | Notes |
|---|---|---|
| Home | `Bankruptcy, PKPU & Restructuring Lawyers Jakarta — ASP` | Lead with the practice, not the firm name; nobody searches "ASP" |
| Practice | `{Practice} Lawyers in Indonesia — ASP` | |
| Lawyer | `{Name} — {Position} — ASP` | |
| Article | `{Title} — ASP Insights` | |
| Award | `{Award}, {Year} — ASP Recognition` | |
| Case | `{Type} — {Court}, {Year} — ASP` | Only published matters |

Descriptions are written by hand, 140–160 characters, never generated from the first
paragraph. Titles stay under 60 characters. No keyword stuffing — for a firm ranked by
Hukumonline, thin over-optimised pages do more reputational damage than ranking good.

## 2. Structured data

| Page | Schema |
|---|---|
| All | `Organization` + `LegalService` (sitewide, in layout) |
| All except home | `BreadcrumbList` |
| Lawyer profile | `Person` with `worksFor`, `jobTitle`, `knowsAbout`, `alumniOf` |
| Article | `Article` with `author` → `Person`, `datePublished`, `dateModified` |
| Award | `Award` referenced from `Organization.award`, with `url` to the awarding body |
| Practice | `Service` with `provider` and `areaServed: Indonesia` |
| Event | `Event` |
| Contact | `LocalBusiness` with `address`, `geo`, `openingHours` |

`Person` markup on 23 profiles is the highest-leverage structured data on the site: it is
what lets Google associate named lawyers with the firm and with the Hukumonline listings
that already exist elsewhere on the web.

Sample, lawyer profile:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Muhamad Arifudin",
  "honorificSuffix": "S.H., M.H.",
  "jobTitle": "Managing Partner",
  "worksFor": { "@type": "LegalService", "name": "Arifudin Susanto Partnership" },
  "knowsAbout": ["Bankruptcy", "PKPU", "Debt restructuring"],
  "url": "https://asplawyer.co.id/people/muhamad-arifudin/"
}
```

## 3. Bilingual

- English at root, Indonesian under `/id/`. English stays at root to preserve the indexed
  URLs; `/en/*` 301s to root.
- `hreflang` pairs on every page plus `x-default` → English.
- Metadata is translated, not machine-mirrored. An Indonesian description that reads like a
  translation ranks like one.

## 4. SEO landing pages

Six Indonesian-language pages targeting the actual search intent:

```
/id/kepailitan/                /id/litigasi-komersial/
/id/pkpu/                      /id/arbitrase/
/id/restrukturisasi-utang/     /id/kurator-pengurus/
```

Each is unique content, not a duplicate of the practice page, self-canonical, and paired by
`hreflang` with its English counterpart. `/id/kurator-pengurus/` matters most: ASP acts as
court-appointed receiver, and that is a search nobody else at this level is answering well.

## 5. Migration

Baseline map in `data/redirects.csv`, generated into `config/redirects.js`:
11 redirects, 6 pages to 410, 4 legacy endpoints blocked.

The decision worth restating: the three WordPress demo posts and the fashion/music/
uncategorised archives return **410 Gone**, not a redirect. Redirecting removed junk to the
homepage is read as a soft 404 and dilutes the target page.

**The map is incomplete and known to be.** The legacy navigation exposes seven pages; a
WordPress install typically carries attachment pages, tag archives and pagination that the
menu never shows. Before launch:

1. Crawl the live site (Screaming Frog) and fetch `wp-sitemap.xml`.
2. Export 16 months of Search Console pages and queries.
3. Diff both against the map; anything with impressions gets a destination.
4. Anything with no impressions and no value gets 410, not a redirect.

## 6. Post-launch

Week 1: submit sitemap, verify property, confirm indexing of the 12 practice pages and 23
profiles. Weeks 1–8: monitor 404 log daily then weekly, watch rankings for `kepailitan`,
`PKPU`, `restrukturisasi utang`, and the firm name. Expect a 2–6 week dip; the old site has
so little indexable content that the downside is small and the upside is most of the site.
