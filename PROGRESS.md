# PROGRESS — resume context

Read this first when picking this project back up, especially on a different machine.
Local Claude memory does not sync across machines; this file is the durable artifact.

## Next steps (as of 2026-08-24, end of session)

The "Classical" redesign is live at https://asp-legal-platform.vercel.app (branch
`redesign/classical` merged to `main`, pushed, deployed — see the two entries below for
the full story, including two real bugs found and fixed post-deploy: a WCAG contrast
regression + a broken image-optimizer/password-gate interaction).

Client asked what's left to close Phase 6 (Security) and Phase 7 (QA) that doesn't need
ASP-provided infrastructure. Agreed on 7 items, worked through in this order:

1. ✅ **Done** — Lighthouse + accessibility check (found and fixed 2 real contrast
   regressions + a broken hero image; see the two entries below).
2. ⏳ **Not started** — Wire the `/consultation` intake form to actually submit:
   Postgres for the record, Vercel Blob for the file upload (avoids needing
   S3+ClamAV/ASP-provided infra — Vercel Blob is self-serve via the same storage
   marketplace the Neon DB came from). Client said this is next.
3. ⏳ **Not started** — Identify the one remaining unhashed inline script blocking
   `middleware.ts`'s CSP from switching `Content-Security-Policy-Report-Only` →
   enforcing `Content-Security-Policy` (see `docs/06-security.md` §0 for the existing
   writeup of why it's still Report-Only).
4. ⏳ **Not started** — Check what Vercel's built-in Firewall (rate limiting, IP
   blocking) already offers on this project's plan and whether it's worth turning on.
5. ⏳ **Not started** — A basic automated security pass (security-headers checker,
   `npm audit`, an OWASP ZAP baseline scan) against the live site — not a substitute
   for a real third-party pentest, just a first-pass check. Note: `npm audit` was
   already run once this session (while installing `sharp`) and surfaced multiple
   known CVEs in `next@14.2.35` — the fix is a major-version bump to Next 16, a real
   breaking-change decision, not touched yet.
6. ⏳ **Not started** — Manual screen-reader (VoiceOver) + keyboard-nav check on the
   new theme/language toggles specifically — they're new interactive elements the
   existing a11y work never covered.
7. ⏳ **Not started, and the biggest one** — Install and set up Payload CMS with
   collections matching `db/schema.sql`. This is genuinely Phase 4 work, not Phase
   6/7, and is a separate project in its own right — don't try to fold it into a
   continuation of items 2–6.

Resume by picking up at item 2, or wherever the next session is asked to start.

## 2026-08-24 (even later same day) — hero text/photo clash, and the real bug it exposed

Client screenshotted the live Home hero: the headline sat directly over a face, hard to
read. Two real things came out of chasing this:

1. **The photo can't be "shifted"** — `founders.jpg` is portrait (1023×1537) inside a
   wide/short hero box, so `object-fit: cover` always scales to match the container's
   *width* exactly (portrait source is narrower than the landscape box, relatively) —
   there is no horizontal crop happening at all, the full source width is always shown,
   and `object-position`'s horizontal component is a no-op here. Only the vertical
   crop-window can move. Fixed the actual complaint with `.hero__scrim`: added a
   left-to-right gradient layer (text sits left, so darken left, fade out by ~90%
   width) stacked under the existing top/bottom vertical gradient, plus a `text-shadow`
   on the hero kicker/h1/sub as a second line of defence. First attempt overcorrected
   and hid the photo entirely (opacity too high, fade too far right) — dialled back
   until the right-hand figure reads clearly and the left-hand one (under the text) is
   legibly darkened rather than gone. See `app/main.css`'s `.hero__scrim` comment for
   the exact reasoning, not just the values.

2. **While checking this in a real browser, found the hero photo (and the nav logo)
   were completely broken** — `naturalWidth: 0`, silently rendering as nothing, which
   is *why* the first "hide it more" gradient attempt looked like it worked (there was
   no photo to darken either way). Root cause, found by reading `next-server`'s own
   logs (`⨯ The requested resource isn't a valid image ... received null`) and
   confirming with a direct `curl` against an image URL while unauthenticated: **the
   password-gate middleware was gating `/images/*`**, and `next/image`'s server-side
   optimizer fetches its source via an internal request that carries no browser
   session cookie — that request was getting 307'd to `/login`, so Next received HTML
   instead of image bytes. This is only surfaced now because this app had no
   `next/image` usage (or any `public/` assets at all) before the redesign added them.
   Fixed by excluding `images/` in `middleware.ts`'s `config.matcher` (same negative
   lookahead that already excludes `_next/static`/`_next/image`), so the gate never
   runs on that path at all — not by adding it to `GATE_PUBLIC`, which would still let
   `gateCheck()` execute per-request for no reason. Also installed `sharp`
   (`npm i sharp`) as a devDependency, since it *was* genuinely missing and is what
   Next's built-in image optimizer needs for self-hosted (`next start`) runs — Vercel's
   platform normally provides this itself, but not having it locally made this bug
   much harder to isolate from the middleware issue while debugging, and it's the
   correct fix either way, per Next's own guidance.

Verified post-fix: `naturalWidth`/`naturalHeight` on both images now report real
dimensions (checked via `claude-in-chrome`'s `javascript_tool` against a live tab, not
assumed from a screenshot), unauthenticated `curl` to `/images/founders.jpg` returns
200 (was 307), server log has zero image errors on a fresh build, and a repeat
Lighthouse pass held Accessibility 100 with Performance in the same 72–90 range as
before (this fix didn't change page weight, only whether the image loads at all).

**Process note for next time**: after switching to `next/image` for the earlier
Lighthouse-driven fix, a Lighthouse *score* improvement was trusted as confirmation
without a visual screenshot check — an image that fails to load entirely can still
score well (nothing large to download), which is exactly what happened. Score deltas
aren't sufficient evidence something visual actually renders; check the rendered page.

## 2026-08-24 (later same day) — redesign merged, deployed, and a post-deploy Lighthouse pass

The redesign below (see the entry right under this one) was merged to `main` and pushed
— live at https://asp-legal-platform.vercel.app. Push initially failed
(`RPC failed; HTTP 400`, `send-pack: unexpected disconnect`) on the ~2MB image commit;
fixed with `git config http.postBuffer 524288000`, not a real server-side problem.

Client corrected an assumption from the redesign entry below: the Home/People hero
photo is the **real** founders photo (touched up in ChatGPT), not an AI-generated
placeholder as the handoff's own README implied. Renamed
`public/images/hero-founders-placeholder.png` → `founders.png`, updated the two code
comments that had it wrong.

Then ran a real Lighthouse pass post-redesign (`npm run build && npm run start`, logged
in via `/api/auth/login` for a session cookie, `npx lighthouse` with that cookie in
`--extra-headers`, 3 consecutive runs per docs/07-qa.md's own pattern) — found and fixed
two real regressions the redesign introduced, both verified by computing the actual WCAG
contrast ratio by hand (relative-luminance formula), not just trusting the Lighthouse
score:

- `--fg-muted` (kickers, statcard labels, header's "Est. 2017", inactive toggle text) was
  a `color-mix(... 55%, transparent)` — measured 3.63:1 against `--bg`, fails AA's 4.5:1
  for that small text. Fixed by reusing the old Phase 2 system's already-verified
  `#5B5F62` (5.77:1) as a solid value instead.
- `.btn--gold`'s text colour (`--asp-neutral-900` on `--accent`) measured 4.18:1, just
  under 4.5:1. Fixed by switching to `--asp-text` (4.89:1); happens to also clear the
  dark-theme/on-photo gold variant (8.13:1) since `--asp-text` is a fixed dark colour.

Also found the 1.8MB `founders.png` (served via a plain `<img>`, no `next/image`
anywhere in this app before now) was dragging the homepage's Lighthouse Performance
score as low as 57 in one run. Fixed two ways: converted the source to a compressed JPEG
(1.8MB → 247KB, `sips -s format jpeg -s formatOptions 82`) and switched it plus the nav
logo to `next/image` (`fill`+`priority` for the hero since it's the LCP element, explicit
`width`/`height` for the logo and the People-page plate) — this is the first use of
`next/image` in the app. Performance runs after: 86–99 across repeated local passes
(noisy — see below — but frequently matching/exceeding the pre-redesign 91 baseline).

**A real debugging lesson, not just a fix**: partway through, a `.person` PersonCard
link measured at 18px tall in a Lighthouse `target-size` finding (WCAG 2.5.8), which led
to CSS padding fixes on `.nav a`/`.link-arrow`/`.footer a` too. Investigated with the
`claude-in-chrome` MCP tools directly against a running tab — `.person`'s *actual*
rendered height was 427px; the 18px reading was a stale `next-server` process serving
HTML that referenced a CSS bundle hash from a build already overwritten on disk
(`pkill -f "next start"` doesn't reliably kill the detached `next-server` child — use
`pkill -9 -f "next-server"`). Confirmed via `curl` that the referenced
`_next/static/css/*.css` was 400ing. A clean rebuild+restart then scored **Accessibility
100** with zero `target-size` findings. The `.nav a`/`.link-arrow`/`.footer a` padding
increases were kept anyway — real, if smaller, touch-target headroom the redesign had
reduced (nav especially: old `padding: var(--s-2) 0` → new `padding-bottom: 3px` only —
a genuine reduction even though it happened to still clear 24px) — but they were not,
in the end, fixing the finding that surfaced them.

**Performance is still noisy locally** (72–99 across otherwise-identical runs) — Total
Blocking Time is the volatile metric, consistent with CPU contention from this being a
dev machine running several concurrent tool sessions during the test, not a code issue
(CLS was a perfect 0 in every run; Speed Index/FCP were consistently good). Production's
`SITE_PASSWORD`/`SESSION_SECRET` are marked **Sensitive** in Vercel (`vercel env pull`
returns `[SENSITIVE]`, by design, not retrievable via CLI) so a same-session pass against
the live URL wasn't possible — **worth a clean Lighthouse run against
https://asp-legal-platform.vercel.app on a quiet machine** to get a trustworthy number,
next time this is picked up.

Not done this pass: `best-practices` (92) and `seo` (58, expected pre-launch/noindex)
weren't investigated — only performance and accessibility were the client's stated
priority. Pages other than the homepage got one Lighthouse pass each (`/practices`,
a lawyer detail page, `/contact`) to spot-check, not the full 3-run treatment.

## 2026-08-24 — "Classical" redesign implemented (branch `redesign/classical`)

A separate design handoff bundle (`ASP Legal Platform redesign.zip`, a Claude Design
canvas export covering all 9 public marketing screens) was recreated inside this
codebase, per that bundle's own README ("recreate this design inside the existing
Next.js app, reusing its components/routing/data — not production code to paste in").
Not merged to `main` yet — on branch `redesign/classical`, build-verified and
browser-verified locally (Chrome, both themes, both languages), not yet pushed/deployed.

- **Visual system replaced**: `app/tokens.css`/`app/main.css` now carry the "Classical"
  palette (warm neutral bg #F3F2F2, gold accent #B68235) and type system (Cormorant
  Garamond + Lora, replacing Cormorant Garamond + Inter + IBM Plex Mono). The old
  "docket" mono-register CSS var names (`--font-docket` etc.) are kept as **aliases**
  pointing at the new serif "kicker" values, specifically so ~20 component/page files
  didn't need a mechanical class-name rename — same trick used for `--s-*` spacing
  aliases. `.btn--gold/--primary/--ghost`, `.card--practice/--flagship` class *names*
  are unchanged; only what they resolve to changed.
- **Real dark/light theme toggle added** (new: `lib/theme.ts`, `components/ThemeToggle.tsx`)
  — didn't exist before. `[data-theme="dark"]` block in tokens.css, applied by an inline
  boot script in `app/layout.tsx` before first paint (no flash). That script's hash lands
  automatically in `CSP_COMMON_SCRIPT_HASHES` via the existing postbuild step — verified
  by computing its sha256 by hand and diffing against `lib/csp-hashes.generated.ts`, not
  assumed.
- **Real EN/ID toggle added, client-side/static-copy only** (new: `lib/i18n.ts`,
  `components/LanguageProvider.tsx`/`LanguageToggle.tsx`) — the old EN/ID header links
  were `href="#"` stubs. Deliberately **not** a `/id` route tree — CLAUDE.md and
  `next.config.mjs` both guard against adding one before ASP supplies official
  Indonesian content. `lib/i18n.ts`'s dictionary is copied verbatim from the redesign
  handoff's own `DICT.en`/`DICT.id` (real deliverable copy, not invented) and covers
  chrome only — nav, hero, section kickers/titles/intros, CTA, footer, About's "values"
  cards, Insights' "workflow" cards. Lawyer names, award titles/orgs, and the firm
  address stay DB-sourced and untranslated (proper nouns/facts, not prose); `Practice`
  already had `name_en`/`name_id` and now the language toggle actually uses it.
  Un-dictionaried strings (a couple of pre-existing paragraphs, form field labels,
  `DISCLAIMER`) stay in English in both language states rather than getting a guessed
  translation — documented inline where that happens (see `app/about/page.tsx`).
- **Content decisions** (both flagged, not silent): Home's old hardcoded "PKPU
  proceeding steps" dark-forest band is dropped (not in the new design); Cases page's
  labelled `DEMO DATA` table is dropped in favour of the redesign's single empty-state
  card, which is simpler and *is* exactly production behaviour with zero cleared
  matters (both were already noindex/labelled placeholders, not real firm data — see
  `db/content-requests.md` item 6 for the underlying constraint, unchanged).
  Home/About/People/Practices/Insights/Cases/Recognition/Careers/Contact — the 9
  screens the prototype covered — got a full section-by-section reskin; the 3 detail
  page templates (`people/practices/recognition/[slug]`) and 2 utility pages
  (`consultation`, `styleguide`) weren't in the prototype, so only got the token/CSS
  system applied to their existing layout, no new structure. `app/styleguide` (the
  living token reference) had its swatch/contrast-pair/specimen data updated to the
  new values so it stays accurate.
- **Assets**: `public/images/` created (didn't exist before) with the two images the
  handoff actually references — `logo-asp.png` and `founders.png`. The handoff's own
  README called the founders photo an AI-generated placeholder; the client corrected
  that in this session — it's the real founders photo, touched up in ChatGPT — so the
  file was renamed off "…-placeholder.png" and the code comments at both of its use
  sites (Home hero, People page's group-portrait plate) updated to match.
- **Verified, not just written**: `npm run typecheck` and `npm run build` (which runs
  the CSP-hash postbuild step + a second `next build`, per the existing script) both
  pass. Walked all 9 redesigned screens plus a lawyer detail page in a real Chrome tab
  via `claude-in-chrome`, logged in through the local password gate
  (`.env.local`'s `SITE_PASSWORD`) — confirmed: dark mode via system
  `prefers-color-scheme` on first load with no flash, the Light/Dark toggle switching
  correctly, the EN/ID toggle switching nav/hero/section copy and DB-sourced
  `name_id` fields (practice names in the footer, practice group labels) while
  leaving lawyer names/awards untouched, and dark mode rendering correctly on an
  inner content page.
- **Not done this session**: pushing/deploying (still local-only on the feature
  branch), any content the client hasn't supplied (unchanged, still blocked per the
  four open decisions), a fresh Lighthouse run, and `middleware.ts`'s CSP
  enforcement mode (still `Report-Only`, untouched).

## Where things stand (as of 2026-08-18)

Repo: https://github.com/mahendrasenoaji-lgtm/asp-legal-platform (public)
Local path: `~/Documents/asp-law/files/asp-legal-platform/asp-legal-platform`
**Live site: https://asp-legal-platform.vercel.app** (Vercel, auto-deploys from `main`)

| Phase | State |
|---|---|
| 1 Information Architecture | Complete — awaiting client sign-off |
| 2 UI Design System | Built and testable (`/styleguide` on the live site) |
| 3 Frontend | **Done** — Next.js 14 App Router + TypeScript, 59 static routes, reads live from Postgres. Static HTML prototype in `prototype/` kept only for reference |
| 4 CMS / Backend | **Done, on production too** — `db/schema.sql` migrated + seeded against both local Postgres and Neon (production), all 4 integrity guards verified on both. `lib/data.ts` queries the DB directly. CMS editor (Payload) still not installed — no admin UI exists |
| 5 SEO | **Done to the extent possible** — live-crawled `asplawyer.co.id`, found it runs TranslatePress (every URL incl. junk mirrored under `/id/`), fixed the redirect map (31 rows). Search Console diff still blocked on ASP's own account access |
| 6 Security | **Headers wired in + verified with a real browser**, live in production (`middleware.ts`) — found and fixed a CSP bug that silently broke all client hydration. Pentest, uploads, admin/MFA, WAF still need real infra ASP would provide |
| 7 QA | **Real Lighthouse runs**: Accessibility 100, Performance 91, Best Practices 92. Found + fixed 2 real a11y bugs. Cross-browser, screen readers, real devices still pending |
| 8 Deployment | **Live.** Vercel project `asp-legal-platform` (team `alwayslearn`), auto-deploys on push to `main`. Neon Postgres production DB provisioned via Vercel's storage marketplace, migrated + seeded (found and fixed a Neon-specific migration bug — see below). `DATABASE_URL` set across Production/Preview/Development in Vercel project settings automatically |

## What's actually left

1. **Nothing further can happen on lawyer bios, practice overviews, articles, etc. until
   ASP supplies them** — 13 content items owed, see `docs/content-requests.md`. Inventing
   them is explicitly against the brief (`CLAUDE.md` "Hard rules").
2. **4 open architecture decisions** block real progress on People/Practices content: fee-earner
   count 40 vs 23, "Corporate Legal Services" practice, "Leaders" vs "Counsel" tier naming,
   whether the Herlin/Muhamad bios need review before going live. See `CLAUDE.md`.
3. **Phase 6/7's remainder needs infrastructure ASP would provide, not this laptop**:
   penetration testing against the live URL, the intake form's actual upload pipeline (S3 +
   ClamAV), an admin UI with real MFA/RBAC (Payload CMS isn't installed), a custom domain
   (currently on the free `*.vercel.app` subdomain), WAF, and cross-browser/real-device QA.
4. **CMS editor**: Payload is recommended (`docs/04-cms-backend.md` §1) but not installed —
   every row in the database got there via `db/seed.py`, not a person filling a form. This
   is the natural next *build* step once the open decisions above are resolved.
5. A proposal document comparing legacy vs rebuild exists: `docs/proposal/rebuild-proposal.html`
   (pushed) and `~/Desktop/ASP-Rebuild-Proposal.docx` (local only, not committed per the
   user's request) — both ready to share with ASP, still private.

## Local dev environment notes

- Next.js app: `cp config/.env.example .env.local`, set `DATABASE_URL` (local Postgres or
  the Neon production string — ask before pointing local dev at production data), then
  `npm install && npm run dev`. `npm run build` runs a postbuild step
  (`scripts/generate-csp-hashes.mjs`) that needs a **second** `next build` internally — this
  is intentional (see the CSP section of `docs/06-security.md` §0), not a hang.
- Local Postgres 16 at `asp_legal_dev` (Homebrew, `brew services start postgresql@16`). To
  rebuild from scratch: `dropdb asp_legal_dev && createdb asp_legal_dev && psql -d
  asp_legal_dev -v ON_ERROR_STOP=1 -f db/schema.sql && python3 db/seed.py > db/seed.sql &&
  psql -d asp_legal_dev -v ON_ERROR_STOP=1 -f db/seed.sql`. Guard tests:
  `psql -d asp_legal_dev -f db/verify_guards.sql`.
- **Production database is Neon**, connected to the Vercel project. Get its connection
  string via `vercel env pull` (needs `vercel login` + project already linked — it is, via
  `.vercel/` locally, which is gitignored) or the Vercel dashboard → Storage. Re-running
  `db/schema.sql` / `db/seed.sql` against it is safe — both are idempotent
  (`CREATE OR REPLACE` / `IF NOT EXISTS` / `ON CONFLICT` throughout).
- Vercel CLI: `npx vercel` (authenticated as `mahendrasenoaji-6835`, team `alwayslearn`).
  `npx vercel ls` for deployment status, `npx vercel env ls production` for env vars.

## Real bugs found and fixed this session (not just written, actually run)

Phase 3/DB wiring:
- `search_index_fts` didn't build: `unaccent()` is `STABLE`, not `IMMUTABLE`.
- `search_index`'s lawyer branch used an inner join, so 21 of 23 published lawyers were
  unfindable by search, not just bio-less. Fixed with a `LEFT JOIN`.
- No `firm_settings` table existed; `lib/data.ts` read `firm.json` directly as a workaround.
  Added a singleton table (`id boolean PRIMARY KEY DEFAULT true` + `CHECK (id)`), seeded,
  wired up.
- `industries`/`article_categories` had no `sort_order`, so seeding silently re-sorted both
  alphabetically instead of preserving the curated JSON order. Added the column.

Phase 6 (security headers):
- First CSP attempt used a per-request nonce. Looked correct via `curl`, even rendered
  visually — but Lighthouse against a real browser showed it blocking every script,
  silently breaking all client-side hydration (drawer, form validation, scroll-reveal).
  Root cause: every page is statically generated once at build time, so a nonce generated
  fresh per request can never match a nonce baked into build-time HTML. Fixed with
  per-route SHA-256 hashes computed from the actual build output
  (`scripts/generate-csp-hashes.mjs`), shipped as `Content-Security-Policy-Report-Only`
  rather than enforcing, since one inline-script source Next's hydration injects still
  isn't captured by the static-HTML scan.
- Drawer's `aria-hidden="true"` when closed didn't stop keyboard focus into its links
  (`inert` attribute doesn't render under React 18's server renderer — confirmed absent
  from output HTML). Fixed with explicit `tabIndex={-1}`.
- Footer's `<h4>` column labels broke heading order on sparse pages (h1 straight to h4).
  Changed to a styled `<p>` — footer nav groupings aren't part of the content outline.

Phase 8 (production database):
- `immutable_unaccent()` (the Phase 3 fix above) migrates clean on local Postgres 16 but
  intermittently fails to define on Neon — "text search dictionary unaccent does not
  exist" — hundreds of statements after `CREATE EXTENSION "unaccent"` ran earlier in the
  same script, despite the dictionary being immediately queryable from a separate
  connection. Tested multiple fixes directly against production (not guessed): isolated
  repros never failed, `\connect` right before the statement didn't reliably fix the real
  script, `\connect` + `pg_sleep(2)` still didn't either. Concluded this is Neon-side
  propagation lag, not controllable from the SQL side, and since search isn't wired to the
  app yet, dropped the `unaccent` dependency entirely — `search_index_fts` now indexes
  `to_tsvector('simple', title || ' ' || body)` directly. Full writeup:
  `docs/04-cms-backend.md` §0.

All fixes are in `db/schema.sql`, `middleware.ts`, `components/MobileDrawer.tsx`,
`components/Footer.tsx`. Docs: `docs/04-cms-backend.md` §0, `docs/06-security.md` §0.
