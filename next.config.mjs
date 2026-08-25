import { execSync } from "node:child_process";

// Root cause of a real bug found 2026-08-25 while trying to promote the CSP
// from Report-Only to enforcing: `npm run build`'s "postbuild" script runs
// `next build` a SECOND time (see scripts/generate-csp-hashes.mjs's header
// comment for why — the hash file has to exist before middleware can be
// compiled against it, which needs a first build's output). Next's default
// generateBuildId returns a fresh random string on every invocation, and
// that buildId is embedded in every route's `self.__next_f.push(...)` RSC
// hydration bootstrap script (`"buildId":"..."` in the flight payload).
// So the hash computed from build #1's output never matches what build #2
// actually serves — every route's hydration script fails its CSP hash
// check. Silent on most pages (React falls back to client rendering, the
// static HTML still shows something), catastrophic on /login specifically
// (its Suspense fallback is `null` — the page goes completely blank,
// which would have locked visitors out of a password-gated site). Found
// via a direct hash-diff between served HTML and the served CSP header,
// not guessed — see PROGRESS.md's 2026-08-25 CSP entry.
//
// Fix: pin buildId to the git commit so both `next build` invocations in
// the same postbuild chain produce byte-identical output. This is also
// just a reasonable thing to do independent of the CSP bug (reproducible
// builds), so it's not a narrow workaround.
function stableBuildId() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA;
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return "local-build";
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The English site stays at the existing indexed root; /id/* is future
  // work once Indonesian copy actually exists (see docs/03-frontend.md §4
  // and CLAUDE.md — bilingual). Do not add an empty /id tree ahead of it.
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  generateBuildId: async () => stableBuildId(),
};

export default nextConfig;
