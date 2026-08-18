// Pure constants and helpers with zero dependency on lib/db.ts (pg). Client
// components (Header, MobileDrawer, IntakeForm — anything "use client")
// must import from here, not from lib/data.ts: pg needs Node core modules
// (fs, net, tls, dns) that don't exist in a browser bundle, and Next.js
// bundles a client component's *entire* import graph, not just the names it
// actually uses — importing lib/data.ts from a client component drags pg
// along and fails the webpack build with "Module not found: Can't resolve
// 'fs'" etc. lib/data.ts re-exports these for server-side convenience.

export function initials(name: string): string {
  const parts = name.split(" ").filter((p) => /^[A-Za-z]/.test(p));
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// data/lawyers.json used "leader" for this tier; the schema's lawyer_tier
// enum has no such value, so db/seed.py mapped it to 'counsel' — the
// brief's proposed name, but a technical mapping, not a resolution of
// CLAUDE.md decision D-03 ("Leaders" vs "Counsel" is still ASP's call).
export const isLeadershipTier = (tier: string) => tier === "counsel";

export const DISCLAIMER =
  "Submission of information through this website does not create an attorney-client " +
  "relationship. Do not submit confidential or privileged information until such a " +
  "relationship has been established.";

export const NAV: [string, string][] = [
  ["About", "/about"],
  ["People", "/people"],
  ["Practices", "/practices"],
  ["Insights", "/insights"],
  ["Cases", "/cases"],
  ["Recognition", "/recognition"],
  ["Careers", "/careers"],
];

// Flip when Phases 6 and 7 actually close (see CLAUDE.md, docs/07-qa.md §8).
// Until then every page stays noindex and carries the status bar, same rule
// the static prototype enforced.
export const SITE_READY = false;
