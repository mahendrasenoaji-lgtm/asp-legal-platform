#!/usr/bin/env node
// Postbuild step. Run after `next build`, before `next start`.
//
// Why this exists: a nonce-based CSP (the first thing tried here) is
// fundamentally incompatible with this app's rendering strategy. Every page
// is statically generated at build time — the HTML, including Next's inline
// `self.__next_f.push(...)` RSC-hydration bootstrap scripts, is fixed once
// and reused for every request. A nonce generated fresh per request in
// middleware can never match a nonce baked into HTML that was rendered
// once, at build time. Running this app with that CSP live confirmed it:
// Lighthouse showed 8 blocked external chunk loads (React never hydrates —
// the drawer, scroll-reveal and intake-form validation all silently stop
// working) plus 8 blocked inline scripts, even though the page *looked*
// fine, because static HTML/CSS isn't affected, only script execution is.
//
// The fix that actually works for static output: hash-based CSP. Since the
// HTML is fixed per build, so is the exact text of every inline script, so
// its SHA-256 hash is fixed too — unlike a nonce, a hash needs no
// per-request generation. This script scans every generated static page,
// hashes its inline scripts, and writes a per-route map so each response
// only carries the handful of hashes that page actually needs (a
// site-wide union came to 233 distinct hashes / ~12KB of header, which
// risks truncation behind proxies with an 8KB header-size default —
// per-route keeps each response to roughly 7-9 hashes).
//
// This runs as the "postbuild" npm script, which itself invokes `next
// build` a second time after writing the hashes — not a typo. Next.js
// bundles middleware.ts's static imports (including this generated file)
// at build time, so a single `next build` compiles middleware against
// whatever this file already contained (the checked-in empty placeholder,
// the first time). The hashes computed here come from that same build's
// HTML output, which doesn't exist until the build finishes — a genuine
// bootstrapping order problem, not an oversight. Confirmed by testing:
// skipping the second build left every route's script-src empty and every
// inline script blocked again. Rebuilding after writing this file is what
// makes middleware pick up real hashes instead of the placeholder's.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const APP_DIR = path.join(ROOT, ".next/server/app");
const OUT_FILE = path.join(ROOT, "lib/csp-hashes.generated.ts");

function findHtmlFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith(".html")) out.push(full);
    }
  }
  return out;
}

function routeFromFile(file, baseDir, suffix = ".html") {
  let rel = path.relative(baseDir, file).replace(/\\/g, "/");
  rel = rel.slice(0, -suffix.length);
  if (rel === "index" || rel === "") return "/";
  rel = rel.replace(/\/index$/, "");
  return "/" + rel;
}

const inlineScriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;

if (!existsSync(APP_DIR)) {
  console.error(`generate-csp-hashes: ${APP_DIR} not found — run "next build" first.`);
  process.exit(1);
}

// Where the prerendered HTML lives. Locally (and on Next 14) it is
// .next/server/app/<route>.html. On Vercel with Next 16, the Vercel build
// adapter (onBuildComplete) moves it into the Build Output API tree before
// postbuild runs: .vercel/output/functions/<route>.prerender-fallback.html
// and .vercel/output/static/<route>.html. Read every location; the first
// one that has a route wins.
const SOURCES = [
  { dir: APP_DIR, suffix: ".html" },
  { dir: path.join(ROOT, ".vercel/output/functions"), suffix: ".prerender-fallback.html" },
  { dir: path.join(ROOT, ".vercel/output/static"), suffix: ".html" },
];
const IGNORED_ROUTES = new Set(["/_global-error", "/404", "/500"]);

const routeFiles = new Map(); // route -> file
for (const { dir, suffix } of SOURCES) {
  let found = 0;
  for (const file of findHtmlFiles(dir)) {
    if (!file.endsWith(suffix)) continue;
    const route = routeFromFile(file, dir, suffix);
    if (IGNORED_ROUTES.has(route) || routeFiles.has(route)) continue;
    routeFiles.set(route, file);
    found++;
  }
  console.log(`generate-csp-hashes: ${found} routes from ${path.relative(ROOT, dir)}`);
}
const files = [...routeFiles.values()];
const routeOf = new Map([...routeFiles].map(([route, file]) => [file, route]));
const routeHashes = {};
const countAll = new Map(); // hash -> how many routes use it (for the fallback set)

for (const file of files) {
  const html = readFileSync(file, "utf-8");
  const hashes = new Set();
  let m;
  while ((m = inlineScriptRe.exec(html))) {
    const content = m[1];
    if (!content.trim()) continue;
    const hash = "sha256-" + createHash("sha256").update(content, "utf-8").digest("base64");
    hashes.add(hash);
    countAll.set(hash, (countAll.get(hash) ?? 0) + 1);
  }
  routeHashes[routeOf.get(file)] = [...hashes];
}

// Fallback for routes not in the static map (e.g. Next's own error overlay
// paths at request time): hashes common to most pages, which in practice is
// the shared framework bootstrap, not page-specific RSC payload data.
const threshold = files.length * 0.5;
const commonHashes = [...countAll.entries()]
  .filter(([, count]) => count >= threshold)
  .map(([hash]) => hash);

const body =
  "// Generated by scripts/generate-csp-hashes.mjs after `next build` — do not hand-edit.\n" +
  "// See that script's header comment for why this exists (nonce-based CSP cannot work\n" +
  "// against statically generated output; this is the hash-based replacement).\n\n" +
  `export const CSP_SCRIPT_HASHES: Record<string, string[]> = ${JSON.stringify(routeHashes, null, 2)};\n\n` +
  `export const CSP_COMMON_SCRIPT_HASHES: string[] = ${JSON.stringify(commonHashes, null, 2)};\n`;

writeFileSync(OUT_FILE, body);
console.log(
  `generate-csp-hashes: wrote ${Object.keys(routeHashes).length} routes, ` +
    `${commonHashes.length} common fallback hashes, to ${path.relative(ROOT, OUT_FILE)}`,
);
