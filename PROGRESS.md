# PROGRESS — resume context

Read this first when picking this project back up, especially on a different machine.
Local Claude memory does not sync across machines; this file is the durable artifact.

## Next steps (as of 2026-08-25, end of session — items 1–6 done, item 7 scoped/blocked)

The "Classical" redesign is live at https://asp-legal-platform.vercel.app (branch
`redesign/classical` merged to `main`, pushed, deployed — see the two entries below for
the full story, including two real bugs found and fixed post-deploy: a WCAG contrast
regression + a broken image-optimizer/password-gate interaction).

Client asked what's left to close Phase 6 (Security) and Phase 7 (QA) that doesn't need
ASP-provided infrastructure. Agreed on 7 items, worked through in this order:

1. ✅ **Done** — Lighthouse + accessibility check (found and fixed 2 real contrast
   regressions + a broken hero image; see the two entries below).
2. ✅ **Done (2026-08-25)** — `/consultation` intake form wired to a real endpoint;
   see the dated entry below for detail.
3. 🔶 **Root-caused, not resolved (2026-08-25)** — the CSP stays Report-Only, on
   purpose, not by default. Full investigation in `middleware.ts`'s comment and the
   dated entry below: the postbuild pipeline's second `next build` produces
   HTML that isn't byte-identical to the first build's (for any page with
   DB-driven content — buildId is now pinned and fixed, but RSC streaming-chunk
   order/IDs still drift with Postgres query timing), so the hash file middleware
   ships with doesn't always match what's actually served. **Confirmed this would
   have broken `/login` completely (blank page, no fallback) if enforced.** Needs
   either query-timing determinism, a build pipeline that doesn't require a second
   `next build`, or a Next version with Node.js middleware (reads the hash file at
   request time instead of bundling it) — none of those fit in one session. Do not
   flip this to enforcing without addressing the cause; see the entry below first.
4. ✅ **Done (2026-08-25)** — Vercel Firewall: published a rate-limit rule on
   `/api/auth/login` (10 req/5min per IP, deny 15min over) — this is the site's
   *only* gate (one shared password), so brute-force protection there matters most.
   A second rule for `/api/consultation` (spam protection) hit a real plan limit —
   Hobby allows exactly 1 active custom rate-limit rule — confirmed by the API
   erroring specifically on the second `firewall rules add`, not a guess. Client
   chose to accept that gap for now rather than build an app-level limiter (would
   need Vercel KV/Upstash — new infra, more scope) or upgrade the plan. Automatic
   DDoS/system-level mitigation is on by default regardless of plan (confirmed via
   `vercel firewall system-mitigations` — only exposes pause/resume, meaning it's
   already active).
5. ✅ **Done (2026-08-25)** — Basic security pass against production. **OWASP ZAP
   itself couldn't run** (no Docker on this machine, and installing it is its own
   decision — flagging honestly rather than skipping silently); substituted a manual
   pass covering what ZAP's baseline scan checks for:
   - `npm audit`: 2 high-severity advisories, both resolving to the same root cause
     (`next@14.2.35` — fix is `next@16`, a major-version breaking change, not made).
     Triaged real exposure instead of treating the list as flat: this app has no
     Server Actions, no `rewrites()`/`redirects()` in `next.config.mjs`, no
     `images.remotePatterns`, no WebSocket usage, and uses hash-based CSP (not
     nonce-based) — which rules out most of the listed CVEs' actual attack surface.
     The one still worth weighing when the Next-16 decision happens:
     GHSA-3g8h-86w9-wvmq (middleware/proxy redirect cache-poisoning) — this app's
     `middleware.ts` does issue redirects (the password gate).
   - Headers: confirmed `Secure; HttpOnly; SameSite=lax` on the session cookie; TLS
     1.3 with a valid Vercel-managed cert; no `X-Powered-By` leak; `noindex,
     nofollow` still correctly present.
   - Real (low-risk) finding: statically-prerendered pages carry
     `Access-Control-Allow-Origin: *` — confirmed this is Vercel's own CDN-edge
     default for cached static HTML (not our code — dynamic routes like
     `/api/consultation` don't have it), and confirmed it's not exploitable for
     credentialed reads (no matching `Access-Control-Allow-Credentials`, and this
     app's own `Cross-Origin-Resource-Policy: same-site` header — set in
     `middleware.ts` — blocks cross-origin `fetch` reads regardless). Documented
     rather than "fixed" because there's nothing to fix — it's expected platform
     behavior for public static assets.
   - Probed common sensitive paths (`.env`, `.git/config`, `db/schema.sql`,
     source maps, etc.) — all correctly blocked by the password gate or 403/404,
     nothing exposed. 404 and malformed-JSON-to-login responses don't leak stack
     traces.
6. ✅ **Done (2026-08-25)** — Couldn't literally drive macOS VoiceOver from this
   environment, so substituted a rigorous keyboard-only + accessibility-tree pass
   against production instead (same "substitute honestly, don't skip" approach as
   item 5's ZAP gap). Tested both toggle instances (desktop header + mobile drawer,
   390px viewport):
   - Keyboard-only reachable via Tab, in the expected order after the nav links.
   - Visible `:focus-visible` outline on every state (confirmed via zoomed
     screenshots, not just reading the CSS).
   - Both **Enter and Space** correctly activate the buttons (native `<button>`
     behavior — no custom keydown handler to get wrong).
   - `aria-current="true"/"false"` correctly flips per button and renders as a
     literal string in the DOM (checked via JS, not assumed) — this is the
     mechanism a screen reader relies on to announce the new state, and it updates
     on the very element that already has focus, which VoiceOver/NVDA reliably
     re-announce without needing a separate `aria-live` region.
   - Mobile drawer: opened via keyboard (Enter on the Menu button), focus lands on
     the first drawer link (existing focus-trap behavior), Tab reaches the drawer's
     own Light/Dark/EN/ID instance correctly, Escape closes and returns focus to
     the Menu button — confirmed the new toggles didn't regress the drawer's
     pre-existing focus-trap/return-focus behavior.
   No real defects found. Minor, non-blocking note: state changes rely on
   AT re-announcing the focused element's own attribute change rather than an
   explicit `aria-live` region — standard behavior, not flagged as a bug, but
   worth a real VoiceOver/NVDA pass if this ever gets budget for one.
7. 🔴 **Checked, genuinely blocked (2026-08-25), not a soft "biggest item" anymore**
   — confirmed via Payload's own docs before touching anything: **Payload CMS
   requires Next.js 15.2.9+ (or 16.2.6+)**. This app runs **Next 14.2.35**. Payload
   cannot be installed at all until that upgrade happens — not a preference, a hard
   peer-dependency floor. This isn't a new, separate task from item 5's flagged
   `npm audit` finding (Next 14.2.35 CVEs, fix = major bump) — it's the same
   decision, and item 7 is the strongest reason yet to actually make it, not just
   another item pointing at it.
   Other things confirmed while scoping (so the next session can start executing,
   not re-research): Payload 3.x embeds directly *inside* the Next.js app (shares
   routes/build, no separate admin-panel hosting to stand up — simpler than the
   original plan assumed). Its Postgres adapter is Drizzle-based and, by default,
   wants to *manage* the schema/migrations itself — using it against this app's
   already-live, hand-crafted `db/schema.sql` (custom ENUMs, the
   `assert_practice_has_lead()` trigger, the `firm_settings` singleton pattern, 4
   integrity guards) needs a deliberate mapping strategy, not the default flow;
   that's a real design decision for that future session, not this one.
   **Recommendation, unchanged from the original agreement**: do the Next 14→15/16
   upgrade and Payload install together, as their own dedicated session — bumping
   Next blind (for CVEs alone) and then hitting this same Payload requirement later
   would mean redoing verification twice. Not attempted here; forcing it through
   today risks breaking the live site for a task that was never going to finish in
   one sitting anyway.

Resume by picking up at item 7 (Next.js major-version upgrade + Payload CMS, see
above — this is the one substantive item left), or wherever the next session is
asked to start. Items 1–6 are genuinely done.

## 2026-08-25 — CSP enforcement attempt: found and root-caused a real bug (item 3)

Tried to flip `middleware.ts`'s CSP from Report-Only to enforcing. Verified first with
two independent live methods against production (a `securitypolicyviolation` event
listener clicked through every top-level route, a dynamic detail page, both toggles,
and several client-side navigations; separately, Lighthouse's `csp-xss`/
`errors-in-console` audits against six routes) — both found **zero** violations, so
flipped the header and rebuilt locally to double-check before deploying.

**Good thing it was checked locally first.** `/login` rendered as a completely blank,
unusable page under enforcing CSP. Root-caused it properly rather than reverting blind:

1. Extracted every inline `<script>` from the actual served HTML, hashed each one,
   and diffed against the CSP header's own allow-list — found one hydration script
   (`self.__next_f.push(...)`, React's RSC bootstrap payload) whose hash didn't
   match. `/login`'s form is `<Suspense fallback={null}>` (it uses `useSearchParams`,
   which forces client-only rendering for that boundary) — with no static fallback
   content and that one script blocked, the page had literally nothing to show.
2. Traced this back to `scripts/generate-csp-hashes.mjs`'s postbuild pipeline, which
   runs `next build` **twice** (build #1 to get real HTML to hash from, build #2 so
   middleware — Edge Runtime, no `fs`, must statically import the hash file — actually
   bundles the fresh hashes). The two builds are assumed to produce identical HTML.
   They don't:
   - **Fixed**: Next's default `generateBuildId` returns a new random string per
     invocation, and that buildId is embedded in the RSC bootstrap script on every
     route. `next.config.mjs` now pins it to the git commit
     (`VERCEL_GIT_COMMIT_SHA` in prod, `git rev-parse HEAD` locally) — confirmed via
     `.next/BUILD_ID` that both builds now agree, and confirmed by hash-diffing that
     this specific mismatch class is gone.
   - **Not fixed, deeper**: even with buildId pinned, pages with DB-driven content
     (`/people/[slug]`, `/practices/[slug]`, `/recognition/[slug]`, and list pages —
     effectively most of the site) still showed different RSC client-reference IDs
     and different streaming-chunk ordering between the two builds, for identical
     source and identical database rows. Confirmed by snapshotting both builds'
     `.next/server/app` output separately and diffing script content directly (not
     inferred): e.g. the same chunk file got labelled `I[4561,...]` in build #1 and
     `I[2972,...]` in build #2. Root cause: React's Flight streaming writer numbers
     chunks as their backing promises resolve, and this app queries a *remote*
     Postgres (Neon), so resolution order/timing isn't guaranteed identical between
     two separate build runs. Tested disabling webpack's persistent cache
     (`config.cache = false`) as a candidate fix — made it *worse* (more mismatched
     routes, not fewer), which rules out build-tooling caching as the cause.
3. Reverted the CSP header to Report-Only (kept the buildId pin — genuine
   reproducible-builds improvement independent of this). Wrote the full diagnosis
   into `middleware.ts`'s comment so the next session doesn't have to re-derive it.

**What would actually fix this**, none of which fits in a single session: make Postgres
query resolution deterministic/cached during SSG builds; restructure the build so
middleware doesn't need a second `next build` to see fresh hashes (Node.js middleware
runtime would let it `fs.readFileSync` the hash file at request time instead of
bundling it — not available in this app's Next 14.2.35, ties into the already-tracked
Next-major-version-bump decision under item 5); or a different CSP strategy for
DB-dependent routes specifically. This is a real, previously-undiagnosed bug (the
original comment only described a symptom, "one residual violation," without knowing
why) — worth treating as its own follow-up, not a quick fix to force through.

## 2026-08-25 — intake form wired for real (item 2)

`components/IntakeForm.tsx` previously did client-side-only validation and always
showed "Prototype only — no data was sent." Wired it to a real backend:

- **`db/schema.sql` already had a `leads` table shaped exactly for this** (`file_key`,
  `file_scan_status`, `ip_hash`, `lead_status` enum, `purge_after`) — confirmed live in
  Neon via `psql \d leads` before writing anything. This wasn't new schema work, just
  the first thing to actually write to it.
- **New**: `app/api/consultation/route.ts` (Node runtime, not Edge — needs `pg` +
  `node:crypto`). Re-validates every required field server-side (client `required` is
  UX only), hashes the requester IP before storing it (`ip_hash`, never raw), and
  inserts into `leads`.
- **File upload**: chose **Vercel Blob (private access)** over S3+ClamAV specifically
  to avoid needing ASP-provided infra — same self-serve storage marketplace the Neon DB
  came from. Created via `npx vercel blob create-store asp-legal-platform-uploads
  --access private --yes`, which auto-linked `BLOB_READ_WRITE_TOKEN` into Production/
  Preview/Development env vars. `@vercel/blob@2.8.0` added as a real dependency.
- **Honesty fix, not a feature**: there is no malware-scanning pipeline (that was the
  ClamAV part of the S3 plan, deliberately skipped). `file_scan_status` is set to
  `'pending'` and *stays* pending — it means "stored, never scanned," not "scan in
  progress." More importantly, `IntakeForm.tsx`'s hint text used to claim **"Files are
  scanned for malware"** — that was already false before this session (nothing ever
  scanned anything) and would have stayed a real, live lie on the production site if
  not caught here. Changed the copy to "Encrypted in transit and storage" instead,
  which is actually true (Blob private access + TLS).
- Added `role="status" aria-live="polite"` on the result message and disabled the
  fieldset while submitting/after success, so screen-reader users and repeat-click
  users both get correct behavior — small, but new interactive states deserve it same
  as the theme/language toggles did.
- **Verified end-to-end against production infra, not mocked**: built (`npm run
  build`, passes), ran `next start` locally against the real Neon DB, logged in via
  `/api/auth/login`, then POSTed a real multipart request through
  `/api/consultation` with a test PDF attached — confirmed `200 {"ok":true}`, confirmed
  the row landed in Postgres (`psql` SELECT) with the correct `file_key`/
  `file_scan_status`, confirmed a missing-fields request correctly 400s. Deleted the
  test lead row and the test blob file afterward (`vercel blob del`) — no test data
  left in production.
- **Not done, flagging honestly**: no rate limiting on this endpoint yet (a spam bot
  could flood `leads` right now) — that's item 4 (Vercel Firewall) territory, tracked
  separately, not silently skipped.

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
