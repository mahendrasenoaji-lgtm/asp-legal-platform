# PHASE 4 — CMS & Backend

**Status:** Migrated and seeded against a real PostgreSQL 16 instance. All four integrity
guards verified to actually reject bad rows, not just documented to. CMS itself (Payload,
§1) is still unselected/unbuilt — this phase closed the database, not the editor.

## 0. What actually got tested (not just written)

```bash
psql -d asp_legal_dev -v ON_ERROR_STOP=1 -f db/schema.sql   # migrate
python3 db/seed.py > db/seed.sql                            # regenerate from data/*.json
psql -d asp_legal_dev -v ON_ERROR_STOP=1 -f db/seed.sql     # seed
psql -d asp_legal_dev -f db/verify_guards.sql               # prove the guards bite
```

Running the real migration surfaced two bugs the schema-as-written hid:

1. **`search_index_fts` failed to build at all.** `unaccent()` is `STABLE`, not
   `IMMUTABLE`, and Postgres refuses `STABLE` functions in an index expression. Fixed with
   the standard `immutable_unaccent()` wrapper (`db/schema.sql`, just above the index).
2. **21 of 23 lawyers were invisible to search — not just bio-less, unfindable by name.**
   The `search_index` view inner-joined `lawyer_translations`; a lawyer with no bio row
   (content request 1) produced zero search rows instead of one row with an empty body.
   Fixed with a `LEFT JOIN` and a fixed `'en'` locale, so a published name is always
   searchable regardless of whether the bio has arrived yet.

Seeding `data/*.json` also surfaced a data/schema mismatch: `data/redirects.csv` carries 5
rows that don't fit the `redirects` table's `CHECK (status IN (301, 302, 410))` — one
`status=200` row (`/careers/` unchanged, not a redirect at all) and four `status=BLOCK` rows
(legacy WordPress paths — `/wp-admin/*`, `/wp-login.php`, `/xmlrpc.php`, `/wp-json/*`). Those
four are a WAF/robots rule, not an HTTP redirect; they belong in
`config/security-headers.js` + Cloudflare (Phase 6), not this table. `db/seed.py` skips all
5 on purpose and says so in a comment, rather than failing or silently coercing them.

Guard verification results (`db/verify_guards.sql`, each check in a rolled-back savepoint):

| Guard | Result |
|---|---|
| Practice publish without a lead lawyer | ❌ rejected — `assert_practice_has_lead()` fired |
| Article publish without an author | ❌ rejected — `assert_article_has_author()` fired |
| Public matter without source + clearance | ❌ rejected — `public_case_needs_provenance` fired |
| Award without a source URL | ❌ rejected — `NOT NULL` on `source_url` fired |
| Public matter *with* source + clearance | ✅ inserted, as it should |

Seeded row counts: 23 lawyers (all published — names/tiers are verified; 21 render an
empty-state bio in the app, same as the prototype, rather than being hidden), 2 bios, 3
credentials, 12 practices (**0 published** — correctly blocked, no practice has a lead lawyer
in `data/`), 16 industries, 9 article categories, 10 awards, 17 redirects, 0 cases, 0
articles. The zeros are the point, not a gap: nothing here was invented to make a bigger
number.

---

## 1. CMS choice

**Recommendation: Payload CMS**, self-hosted alongside the Next.js app on the same
PostgreSQL instance.

| | Sanity | Strapi | **Payload** |
|---|---|---|---|
| Data residency | Vendor cloud | Self-host | **Self-host** |
| Content in the same Postgres as the app | No | Optional | **Yes** |
| Access control granularity | Good | Moderate | **Field-level** |
| Cost at this size | Free tier, then per seat | Free | **Free** |
| Editor experience for non-technical staff | Excellent | Good | **Good** |

Sanity has the better editing experience. Payload wins here because a law firm's draft
content — unpublished case notes, lawyer bios, intake follow-ups — sits in the same database
as everything else, under the firm's own backup and access policy, with no third party
holding a copy. For this client that outweighs editor polish. If ASP prefers Sanity, the
schema below still holds; only the persistence layer changes.

## 2. Schema highlights

Full DDL in `db/schema.sql`. Four constraints deserve attention because they encode the
brief's integrity rules in the database rather than in a code review:

```sql
-- A practice page cannot publish without a named lead lawyer.
CREATE TRIGGER practice_lead_guard ...

-- An article cannot publish without a real author. No house bylines.
CREATE TRIGGER article_author_guard ...

-- A matter is publishable only with a public source and a named clearance.
CONSTRAINT public_case_needs_provenance
  CHECK (NOT is_public OR (public_source_url IS NOT NULL
         AND cleared_by IS NOT NULL AND cleared_at IS NOT NULL))

-- Awards require the awarding body's own published listing.
source_url text NOT NULL
```

The rule "never invent a case, an author or an award" is not a policy anyone can forget at
2am before a launch — it fails the insert.

Other decisions:

- Translations live in `*_translations` tables keyed by `(entity_id, locale)`. Structural
  fields stay locale-neutral, so adding a third language later adds rows, not columns.
- `leads` stores a hashed IP rather than a raw one, and carries `purge_after` defaulting to
  24 months. Uploads are referenced by storage key and gated on `file_scan_status = 'clean'`.
- `redirects` is a table, so marketing can add a redirect without a deploy, with a check
  constraint preventing a 410 from carrying a target.
- Search is a materialised view over published content with a GIN index. Meilisearch only
  becomes worth its operational cost past roughly 500 documents.

## 3. Content governance

Status enum enforces the workflow from the brief:

`draft → legal_review → editorial_review → seo_review → scheduled → published → archived`

Publishing requires `legal_reviewed_at` to be set. Every transition writes to `audit_logs`
with actor, before, after.

## 4. Roles

| Role | Can |
|---|---|
| `super_admin` | Everything, including user management |
| `managing_editor` | Publish, schedule, edit all content |
| `author` | Create and edit own drafts; cannot publish |
| `reviewer` | Legal review sign-off; cannot publish |
| `marketing` | SEO metadata, analytics, redirects |
| `it_security` | Users, audit logs, system settings; no content |

No account gets full admin by default. MFA required for every role that can write.

## 5. API surface

```
POST /api/intake          rate-limited, Zod-validated, scanned upload, no auth
GET  /api/search          rate-limited, published content only
POST /api/revalidate      CMS webhook, HMAC-verified
GET  /admin/*             authenticated, MFA, RBAC
```

## 6. Not yet done

- **Done since the above was written:** `lib/data.ts` in the Next.js app (Phase 3) now
  queries this database directly (`lib/db.ts`, pooled `pg`, `DATABASE_URL` from
  `.env.local`) instead of reading `data/*.json`. That was the actual CMS-swap work this
  section used to flag as outstanding.
- **Also done:** the two gaps that first version of this list found are closed.
  `firm_settings` is now a real table (a singleton — `id boolean PRIMARY KEY DEFAULT true`
  + `CHECK (id)`, verified to reject a second row two different ways) seeded from
  `firm.json` by `db/seed.py`, and `getFirm()` in `lib/data.ts` reads it. `industries` and
  `article_categories` both got a `sort_order` column, seeded from each JSON array's own
  order — `getIndustries()`/`getCategories()` now order by it instead of alphabetically.
- **Practices are not filtered by `is_published`** in `getPractices()` — every practice
  renders its structural page with an empty-state overview regardless, matching the
  prototype's "always show the page, never invent the content" pattern. `is_published`
  still gates the *publish workflow* via `practice_lead_guard`; it just isn't wired to
  "does this route exist" yet. Revisit once there's an admin UI actually setting it.
- CMS itself: Payload is recommended (§1) but not installed — there is no editor UI, so
  every row currently in the database got there via `db/seed.py`, not a human filling a form.
- API surface (§5): none of `/api/intake`, `/api/search`, `/api/revalidate`, `/admin/*` exist.
- This was run against a local scratch database (`asp_legal_dev`), not the staging/production
  infrastructure Phase 8 will actually deploy to — running it there again, with real
  credentials and backups configured, is still required before launch.
