import { NextResponse, type NextRequest } from "next/server";
import { CSP_COMMON_SCRIPT_HASHES, CSP_SCRIPT_HASHES } from "./lib/csp-hashes.generated";
import { verifyToken, COOKIE_NAME } from "./lib/auth";

// Password gate — pre-launch: seluruh situs terkunci di belakang satu
// password sampai siap dipublikasikan. Path di bawah ini yang boleh diakses
// tanpa login (halaman login itu sendiri + endpoint auth-nya).
const GATE_PUBLIC = ["/login", "/api/auth"];

// Fail-closed by design: kalau SESSION_SECRET belum diset di Vercel, situs
// TETAP terkunci (redirect ke /login) alih-alih otomatis terbuka ke publik.
// Ini kebalikan dari default template (fail-open) — dipilih karena situs ini
// memang belum siap publik (lihat commit "not for publication").
async function gateCheck(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (GATE_PUBLIC.some((p) => pathname.startsWith(p))) return null;

  const secret = process.env.SESSION_SECRET;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const ok = secret ? await verifyToken(secret, token) : false;
  if (ok) return null;

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

// Wires config/security-headers.js into the actual running app — that file
// was Phase 6 spec only until this pass, never applied to a real response.
//
// CSP here is hash-based, not nonce-based, and that choice is load-bearing,
// not stylistic: a nonce is generated fresh per request, but every page in
// this app is statically generated once at build time, so a per-request
// nonce can never match a script baked into HTML that was rendered long
// before that request existed. The first version of this file used a nonce
// and shipped; running it against a real browser (not just curl) showed
// Lighthouse reporting 8 blocked external chunk loads — React never
// hydrated, so the drawer, scroll-reveal and intake-form validation were
// all silently non-functional, while the page still looked fine because
// static HTML/CSS isn't affected by a blocked <script>. Hashes work
// because the HTML — and therefore every inline script's exact text — is
// fixed per build; see scripts/generate-csp-hashes.mjs, which computes them
// as a postbuild step into lib/csp-hashes.generated.ts.
//
// style-src carries 'unsafe-inline', which looks like giving up on CSP but
// is a real CSP3 spec limit, not laziness: hashes and nonces only cover
// <style> elements, never the style="" HTML attribute — and this codebase
// uses React's style={{...}} prop pervasively (spacing values throughout
// nearly every component). Satisfying strict style-src would mean
// migrating every one of those to a CSS class first; out of scope for this
// pass, and flagged rather than silently worked around.
//
// script-src is shipped as Content-Security-Policy-Report-Only, not an
// enforcing Content-Security-Policy, and that is deliberate, not a
// half-measure: testing the hash approach against a real browser (not just
// curl) found it fixes 7 of 8 previously-blocked inline scripts, but one
// residual violation remains — something Next's RSC hydration/streaming
// machinery injects that isn't present in the static HTML this script's
// postbuild step scans, so it can't be hashed ahead of time. Enforcing
// anyway risked shipping a CSP that intermittently breaks hydration for
// real visitors (confirmed: it triggered React error #423 — "switched to
// client rendering" — when that one script was blocked). Report-only is
// the standard, explicitly-recommended way to roll out a new CSP: it still
// sends the header and still lets you see real violations, without an
// unverified edge case taking down the site. Switch back to
// 'Content-Security-Policy' once that last inline-script source is
// identified and either hashed or reasoned about, and once there's a
// report-uri/report-to endpoint (Phase 6/8) to actually collect violations
// from real traffic rather than one local Lighthouse run.
//
// HSTS is skipped on localhost/127.0.0.1: Chrome caches HSTS per-host, and
// a stray forced-HTTPS redirect on localhost breaks `npm run dev`/`start`
// for the rest of the machine, not just this app. It still applies to
// every other host, matching config/security-headers.js's production value.

export async function middleware(request: NextRequest) {
  const gated = await gateCheck(request);
  if (gated) return gated;

  const isLocalhost = ["localhost", "127.0.0.1"].includes(request.nextUrl.hostname);
  const routeHashes = CSP_SCRIPT_HASHES[request.nextUrl.pathname] ?? CSP_COMMON_SCRIPT_HASHES;
  const scriptHashSources = routeHashes.map((h) => `'${h}'`).join(" ");

  const csp = [
    `default-src 'self'`,
    `script-src 'self' ${scriptHashSources}`.trim(),
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https://cdn.asplawyer.co.id`,
    `media-src 'self'`,
    `connect-src 'self' https://cdn.asplawyer.co.id`,
    `frame-src 'self' https://www.google.com`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy-Report-Only", csp);
  if (!isLocalhost) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");
  response.headers.set("X-DNS-Prefetch-Control", "off");

  return response;
}

export const config = {
  matcher: [
    // Everything except Next's static assets/image optimizer and
    // public/images/* — those are immutable/cached and don't need a
    // per-route CSP computed. images/ has to be excluded here (not just
    // handled as a GATE_PUBLIC path below) because next/image's server-side
    // optimizer fetches the source file via its own internal request,
    // which carries no browser session cookie — if the gate ran on that
    // request it would 307 it to /login and next/image would receive HTML
    // instead of image bytes, failing with "isn't a valid image". Found by
    // a real broken hero photo in production, not a hypothetical: the
    // matcher's negative lookahead is the only place that actually stops
    // middleware from running on the request at all.
    "/((?!_next/static|_next/image|images/|favicon.ico).*)",
  ],
};
