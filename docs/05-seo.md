# PHASE 5 — SEO Architecture

**Status:** Redirect map crawled against the live legacy site and completed to the extent a
crawl can complete it (see §5.1). Robots written (`config/robots.txt`). Structured data
templates below.

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

Map in `data/redirects.csv`, generated into `config/redirects.js`: **12 redirects, 14 pages
to 410, 4 legacy endpoints blocked.**

The decision worth restating: the three WordPress demo posts and the fashion/music/
uncategorised archives return **410 Gone**, not a redirect. Redirecting removed junk to the
homepage is read as a soft 404 and dilutes the target page.

### 5.1 Live crawl — 2026-08-18

No Screaming Frog license in this environment, so the equivalent was done directly:
`curl` against `robots.txt`, `wp-sitemap.xml` and its four sub-sitemaps, plus link
extraction from the rendered homepage and manual probing of WordPress paths a sitemap
typically omits (author archives, pagination, feeds, `/id/*` mirrors). Steps 1, 3 and 4 of
the original four-step plan are done; step 2 could not be — see the callout below.

**What the sitemap actually contains** (`wp-sitemap.xml` → 4 sub-sitemaps, all fetched):

| Sub-sitemap | URLs |
|---|---|
| posts | `/hello-world/`, `/nulla-magna/`, `/be-my-guest/` — the 3 WordPress/theme demo posts |
| pages | `/`, `/news/`, `/contact-us/`, `/about-us/`, `/our-people/`, `/solutions/`, `/careers/` |
| categories | `/category/uncategorized/`, `/category/fashion/`, `/category/music/` |
| users | `/author/asplawyer/` |

That confirms the original map's 6 nav pages and 6 junk URLs were correct and complete —
but it also found **2 real gaps**, both now fixed in `data/redirects.csv`:

1. **`/author/asplawyer/` was missing entirely.** A WordPress author archive isn't in any
   nav menu, which is exactly why a sitemap fetch matters more than a nav crawl. Added as
   410 — it only ever archived the three demo posts.
2. **The legacy site runs TranslatePress**, confirmed from the `translatepress-id_ID` body
   class on `/id/`. It mirrors *every* URL — including the junk — under an `/id/` prefix
   automatically: `/id/hello-world/`, `/id/category/fashion/`, `/id/author/asplawyer/`, etc.
   all resolve 200 today. The original map only added `/id/*` rows for the 5 real nav pages
   and missed the `/id/` mirror of every 410 and the `/id/careers/` mirror of the one
   unchanged page. All 8 added.

**A crawl-trap finding, not a redirect-map gap:** `/news/page/2/` through at least
`/news/page/999/` all return `200`, not `404` — the legacy theme doesn't bound pagination to
the actual post count. This is exactly the kind of thing `docs/06-security.md` §5 already
argues against keeping the WordPress install running any longer than the DNS cutover
requires; it needs no redirect-map entry because the Next.js app simply has no route there,
so those inbound paths 404 correctly on the new site without any rule.

**What was checked and needed no action:** `/feed/`, `/comments/feed/`, `/home/feed/`
(RSS — not indexed as search results, no redirect needed), `/?s=` (WordPress search, same),
`/wp-json/` (already covered by the existing `BLOCK` rule).

**Step 2 — Search Console — could not be done here.** Exporting 16 months of pages and
queries needs authenticated access to ASP's Google Search Console property, which this
environment does not have. This is the same gap as `docs/content-requests.md` item 13
(Search Console access). Until ASP supplies it, the map above is complete relative to what a
crawl can see — not relative to what has impressions. A URL with real search traffic that
the current site doesn't link from anywhere crawlable (an orphan page) would still be
invisible to this method. Re-run the diff once access exists, before launch, not after.

## 6. Post-launch

Week 1: submit sitemap, verify property, confirm indexing of the 12 practice pages and 23
profiles. Weeks 1–8: monitor 404 log daily then weekly, watch rankings for `kepailitan`,
`PKPU`, `restrukturisasi utang`, and the firm name. Expect a 2–6 week dip; the old site has
so little indexable content that the downside is small and the upside is most of the site.
