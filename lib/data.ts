// Central data access. Every page reads through here, never `data/*.json`
// directly — so that swapping this module for Phase 4 CMS queries (the
// shapes are already the shapes, per CLAUDE.md) touches one file, not fifty.

import firmData from "../data/firm.json";
import lawyersData from "../data/lawyers.json";
import practicesData from "../data/practice-areas.json";
import awardsData from "../data/awards.json";
import industriesData from "../data/industries.json";
import categoriesData from "../data/insight-categories.json";

import type { Award, Firm, Industry, InsightCategory, Lawyer, Practice } from "./types";

export const FIRM = firmData as Firm;
export const LAWYERS = lawyersData.lawyers as Lawyer[];
export const PRACTICES = practicesData.practice_areas as Practice[];
export const AWARDS = awardsData.awards as Award[];
export const INDUSTRIES = industriesData.industries as Industry[];
export const CATEGORIES = categoriesData.insight_categories as InsightCategory[];

export function getLawyer(slug: string): Lawyer | undefined {
  return LAWYERS.find((l) => l.slug === slug);
}

export function getPractice(slug: string): Practice | undefined {
  return PRACTICES.find((p) => p.slug === slug);
}

export function getAward(slug: string): Award | undefined {
  return AWARDS.find((a) => a.slug === slug);
}

export function initials(name: string): string {
  const parts = name.split(" ").filter((p) => /^[A-Za-z]/.test(p));
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// Author availability for the editorial calendar (docs/editorial-calendar.md):
// only the two founding partners have publishable expertise today.
export const BIO_SUMMARY: Record<string, string> = {
  "muhamad-arifudin":
    "Lawyer and court-appointed bankruptcy receiver, and managing partner of the firm. " +
    "More than fifteen years of practice in bankruptcy and debt restructuring, across energy, " +
    "oil and gas, aviation, plantations and palm oil processing, investment companies, cooperatives, " +
    "property, warehousing, tobacco, manufacturing, textiles, herbal medicine production, shipping, " +
    "mobile dealerships and individual debtor matters. Has acted for state-owned enterprises both as " +
    "court-appointed receiver and as counsel.",
  "herlin-susanto":
    "Co-founder and partner. Law degree from Universitas Gadjah Mada and a master's in law from " +
    "Universitas Sriwijaya. More than fifteen years in bankruptcy, PKPU, litigation and arbitration, " +
    "representing national companies in business disputes and corporate restructuring. Serves as " +
    "treasurer of the honorary board of the Indonesian Association of Curators and Administrators (AKPI) " +
    "for the 2025–2028 term.",
};

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
