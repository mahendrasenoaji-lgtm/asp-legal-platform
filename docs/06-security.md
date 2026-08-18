# PHASE 6 — Security Architecture

**Status:** Headers actually wired into the running app (`middleware.ts`) and verified against
a real browser, not just curl — not merely specified in `config/security-headers.js` anymore.
Still not penetration-tested, and most of §2–§4 below (upload handling, admin/MFA, WAF,
backups) needs real infrastructure this environment doesn't have.

## 0. What actually got wired up and tested

`config/security-headers.js` was Phase 6 *spec* only until this pass — never applied to a
real response. `middleware.ts` now sets every header from it on every request, verified with
`curl -sD -` locally and, more importantly, with a real headless-Chrome Lighthouse run
(`npx lighthouse`), not just header presence.

**The first attempt shipped broken and the only reason that's known is it was actually
tested in a browser, not just curled.** A nonce-based CSP (following the CSP header, curl
looked fine, page rendered) turned out to be fundamentally incompatible with this app: every
page is statically generated once at build time, so a nonce generated fresh per request in
middleware can never match a nonce baked into HTML rendered long before that request existed.
Lighthouse caught it immediately — 8 blocked external chunk loads, meaning React never
hydrated, meaning the drawer, scroll-reveal and intake-form validation were all silently
non-functional, while the page *looked* fine because static HTML/CSS isn't affected by a
blocked `<script>`.

**The fix:** hash-based CSP instead of nonce-based. Since the HTML is fixed per build, every
inline script's exact text — and therefore its SHA-256 hash — is fixed too.
`scripts/generate-csp-hashes.mjs` runs as a `postbuild` step, scans every generated static
page, and writes a per-route hash map (`lib/csp-hashes.generated.ts`) that `middleware.ts`
looks up by pathname. Per-route rather than one site-wide list: the union across all 57 pages
is 233 distinct hashes (~12KB of header, real risk of truncation behind an 8KB-default proxy);
per-route keeps each response to about 7–9 hashes. The `postbuild` script itself runs `next
build` a *second* time after writing the hashes — not a typo. Next.js bundles middleware's
static imports at build time, so a single build compiles middleware against whatever the
hashes file already contained (the empty placeholder, on a fresh build); the real hashes
computed from that same build's HTML output don't exist until the build finishes, so the
second build is what lets middleware pick them up.

Even with hashes, one inline script (something Next's RSC hydration/streaming machinery
injects that isn't present in the static HTML the postbuild step scans) still triggered a
real React hydration failure (`error #423`) in one Lighthouse run. Rather than ship an
enforcing policy with a known, unexplained edge case, `script-src` is delivered as
`Content-Security-Policy-Report-Only`, not `Content-Security-Policy` — the standard,
explicitly-recommended way to roll out a new CSP. It still sends the real header and
would still surface real violations; it just can't take the site down over the one
unidentified source. Switch to enforcing once that source is found and a
report-uri/report-to endpoint exists (Phase 8) to collect violations from real traffic.

`style-src` carries `'unsafe-inline'` deliberately, not as a shortcut: hashes and nonces only
cover `<style>` elements per the CSP3 spec, never the `style=""` HTML attribute, and this
codebase uses React's `style={{...}}` prop pervasively for spacing values across nearly every
component. Closing that gap means migrating every one of those to a CSS class first — out of
scope for this pass.

Two accessibility bugs surfaced by the same Lighthouse runs, unrelated to CSP, both fixed:
- The mobile drawer's `aria-hidden="true"` when closed didn't stop its links from being
  keyboard-focusable — a screen reader/keyboard user could tab into "invisible" content. The
  standard fix (the HTML `inert` attribute) doesn't render at all under React 18's server
  renderer (confirmed: absent from the output HTML; `inert` boolean-attribute support landed
  in React 19). Fixed with explicit `tabIndex={-1}` on every interactive element inside when
  closed instead.
- The footer's `<h4>` column labels ("Practices", "Firm", "Contact") broke heading order on
  any page with little content above the footer (careers, cases) — h1 straight to h4, no
  h2/h3 between. Footer nav groupings aren't part of a page's content outline; changed to a
  styled `<p>`, same look, not a heading.

Verified end to end with three consecutive `npx lighthouse` runs against `npm run start`:
final scores **Performance 91, Accessibility 100, Best Practices 92, SEO 60** (SEO is
correctly low — every route is still `noindex` per `SITE_READY` in `lib/constants.ts`, and
Phase 6/7 haven't closed). The two remaining Best Practices points are a missing favicon
(no logo file exists yet — `docs/content-requests.md` item 12, not invented here) and the
CSP report-only informational note, both expected.

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

**Done since the above sections were written:** headers verified against a real running
instance (§0) — not a live origin (no such thing exists yet), but no longer curl-only either.
`npm audit` has been run and acted on (Next.js pinned to 14.2.35 to clear the advisories it
found — see the Phase 3 commit history).

Still not done: no penetration test, no header verification against an actual live origin
(TLS termination, CDN, WAF — none of it exists), no upload pipeline (§2 — no S3, no ClamAV),
no admin/MFA/RBAC (§3 — there's no admin UI at all yet, per `docs/04-cms-backend.md`), no WAF,
no backups. The brief is explicit and so is this document: **nothing here may be described as
production-ready until Phase 6 and Phase 7 are executed against real infrastructure.**
