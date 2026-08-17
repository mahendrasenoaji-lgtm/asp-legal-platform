# PHASE 8 — Deployment

**Status:** Runbook written. Nothing deployed.

---

## 1. Topology

```
Cloudflare (DNS, CDN, WAF, bot protection)
        │
        ├── Vercel — Next.js app + Payload admin
        │
        ├── Neon / RDS — PostgreSQL 15, PITR enabled
        │
        └── S3-compatible storage
              ├── asp-media          public read, CDN-fronted
              └── asp-intake-private private, encrypted, scanned
```

Vercel is the recommendation on effort rather than ideology: preview deployments per pull
request are worth a great deal when a law firm reviews content changes, and the operational
burden on ASP is close to zero. A single VPS behind Cloudflare is a legitimate alternative if
data residency in Indonesia becomes a requirement — decide before the CMS is populated,
because migrating content is far more painful than migrating a runtime.

## 2. Environments

| Environment | URL | Data | Indexed |
|---|---|---|---|
| Development | localhost | seeded from `data/` | no |
| Preview | per-branch | staging database | no — `noindex` enforced at the edge |
| Production | asplawyer.co.id | live | yes |

Preview must be `noindex` and behind HTTP auth. A crawlable staging copy of a law firm site
is a duplicate-content and confidentiality problem at once.

## 3. Cutover runbook

**T-14 days**
1. Full crawl of the legacy site; reconcile the redirect map against it and against Search
   Console. Update `data/redirects.csv`, regenerate `config/redirects.js`.
2. Freeze content changes on the legacy site.
3. Lower legacy DNS TTL to 300s.

**T-7**
4. Content load complete; QA gate (Phase 7) signed off.
5. Full backup of the legacy WordPress install — database and `wp-content` — stored offline.
6. Rehearse the cutover against a staging domain, including redirects.

**T-0**
7. Deploy production build; smoke test on the Vercel URL before DNS moves.
8. Switch DNS. Verify TLS, HSTS and the header set against the live origin.
9. Walk the redirect map with a crawler: expect zero unexpected 404s and correct 410s.
10. Submit `sitemap.xml`; request indexing for the homepage, practice index and profiles.
11. Watch error rates and 404 logs for 24 hours.

**T+7 to T+30**
12. Weekly Search Console review: coverage, 404s, ranking movement.
13. Restore the legacy backup into a sandbox once, to prove the backup is real.
14. Decommission the WordPress host. Do not leave it running on a subdomain.
15. Submit HSTS preload after 30 clean days.

## 4. Rollback

DNS TTL stays at 300s for 72 hours after cutover, and the legacy host stays online but frozen
for 30 days. Rollback is a DNS change plus removing the redirect layer — under 10 minutes,
with no data loss, because the legacy site is read-only from T-7.

The one-way door is the intake form: any lead submitted after cutover exists only in the new
database. Back it up from day one.

## 5. Backup and recovery

| Asset | Method | Retention | Test |
|---|---|---|---|
| PostgreSQL | Nightly snapshot + PITR | 30 days | Quarterly restore to scratch |
| Object storage | Versioning + cross-region replication | 30 days | Quarterly fetch |
| Repository | GitHub + one offline clone | Indefinite | — |
| Secrets | Platform secret store, sealed offline copy | — | Annual rotation |

Recovery targets: RPO 24 hours, RTO 4 hours. Both are assertions until a restore has actually
been rehearsed.

## 6. Handover to ASP

Deliver: admin accounts with MFA enrolled, a one-page editor guide for publishing an article
and adding a lawyer, the content governance workflow, an escalation contact, and this
repository. Schedule a 30-day review covering indexing, leads received, and the content
backlog from `docs/content-requests.md`.
