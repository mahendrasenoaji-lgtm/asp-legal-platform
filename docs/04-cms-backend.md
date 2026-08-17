# PHASE 4 — CMS & Backend

**Status:** Schema written and reviewable (`db/schema.sql`, 394 lines). Not yet migrated
against a live database.

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

Migrations have not been run — there is no database in this environment. Before Phase 8:
apply against a scratch instance, load `data/*.json` as the seed, and confirm the four
integrity guards actually reject bad rows.
