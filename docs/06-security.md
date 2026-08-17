# PHASE 6 — Security Architecture

**Status:** Configuration written (`config/security-headers.js`). Not yet penetration-tested.

---

## 1. Headers

Defined in `config/security-headers.js`, applied in `next.config.js` and mirrored at
Cloudflare so a bad application deploy cannot silently drop them.

- **CSP with a per-request nonce** and `strict-dynamic`. No `unsafe-inline` in production —
  which is the reason to self-host fonts and to render analytics through a nonced script.
- HSTS `max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `frame-ancestors 'none'`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: camera, microphone, geolocation, payment all denied
- COOP `same-origin`, CORP `same-site`

## 2. The intake form is the attack surface

It is the only unauthenticated endpoint that accepts a file, from people who are often in
distress and sometimes adversarial. Controls, in order:

1. Rate limit: 5 submissions per hour per IP+email; 100/min on other API routes.
2. Zod validation server-side. Client validation is convenience, never a control.
3. File constraints: 10 MB, PDF/DOC/DOCX only, **validated by magic bytes** rather than by
   the declared MIME type or the extension.
4. Upload straight to a private S3 bucket under a generated key. Never the web root, never
   a predictable name, never public-read.
5. ClamAV scan before the application will read the object. Infected files are quarantined
   and the submitter is told the file could not be accepted, not why.
6. Signed URLs with a 5-minute TTL, issued only to authenticated staff.
7. Store a hashed IP, not a raw one. `purge_after` defaults to 24 months.

The disclaimer — no attorney-client relationship, do not send privileged material — appears
adjacent to the submit control on the form itself, not only in the footer.

## 3. Admin

- MFA required for every role that can write. No exceptions for convenience.
- RBAC per the six roles in Phase 4; least privilege by default.
- Login rate limit: 5 attempts per 15 minutes, then lockout.
- Session cookies: `Secure`, `HttpOnly`, `SameSite=Lax`, short idle timeout.
- CSRF tokens on every state-changing request.
- `audit_logs` captures actor, action, before, after, hashed IP for every content and user
  change. Immutable in the application; only `it_security` can read it.

## 4. Infrastructure

- Cloudflare WAF and bot protection in front of the origin.
- TLS 1.2+, HSTS preload submitted after 30 days of clean operation.
- Secrets in the platform's secret store, never in the repository. `.env.example` documents
  the names only.
- Dependency scanning in CI (`npm audit`, Dependabot). Build fails on a high or critical.
- Backups: database nightly plus point-in-time recovery, object storage versioned, both
  encrypted at rest, retained 30 days, **restore tested quarterly**. An untested backup is
  not a backup.

## 5. What the legacy site teaches

The current install runs Slider Revolution — historically one of the most exploited WordPress
plugins — and exposes `wp-json`, `xmlrpc.php` and `wp-login.php`. None of that surface exists
in a Next.js build, which is a material part of the security argument for the migration.
Keep the old install patched until DNS cuts over, then decommission it rather than leaving
it running quietly on a subdomain.

## 6. Not done

No penetration test, no dependency scan, no header verification against a live origin. The
brief is explicit and so is this document: **nothing here may be described as
production-ready until Phase 6 and Phase 7 are executed against real infrastructure.**
