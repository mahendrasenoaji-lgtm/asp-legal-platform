// Central data access. Every page reads through here, never the database or
// data/*.json directly — this is the seam docs/04-cms-backend.md §6 asked
// for. As of this pass it reads the seeded Postgres database (db/schema.sql,
// db/seed.py) for everything that has a table; firm.json stays the source
// for firm-wide settings because the schema has no table for those yet (no
// `firm`/`organization` table exists in db/schema.sql — a real gap, not an
// oversight here; flagged rather than worked around silently).
//
// `cache()` memoises each query per request/build so the ~12-23 rows these
// tables hold aren't re-fetched once per static page during `next build`.

import { cache } from "react";
import firmData from "../data/firm.json";
import { pool } from "./db";
import type { Award, Firm, Industry, InsightCategory, Lawyer, Practice } from "./types";

// Re-exported for server-side callers that want everything from one import;
// client components must import these from lib/constants directly instead
// (see the comment at the top of that file for why).
export { DISCLAIMER, NAV, SITE_READY, initials, isLeadershipTier } from "./constants";

export const FIRM = firmData as Firm;

export const getLawyers = cache(async (): Promise<Lawyer[]> => {
  const { rows } = await pool.query(`
    SELECT
      l.slug, l.name, l.honorifics, l.tier::text AS tier, l.position_label AS position,
      l.is_curator, l.email, t.bio_full,
      coalesce(array_agg(lc.value) FILTER (WHERE lc.kind = 'education'), '{}')  AS education,
      coalesce(array_agg(lc.value) FILTER (WHERE lc.kind = 'admission'),  '{}') AS admissions,
      coalesce(array_agg(lc.value) FILTER (WHERE lc.kind = 'membership'), '{}') AS memberships,
      coalesce(array_agg(lc.value) FILTER (WHERE lc.kind = 'language'),  '{}') AS languages
    FROM lawyers l
    LEFT JOIN lawyer_translations t  ON t.lawyer_id = l.id AND t.locale = 'en'
    LEFT JOIN lawyer_credentials lc  ON lc.lawyer_id = l.id
    WHERE l.is_published
    GROUP BY l.id, t.bio_full
    ORDER BY l.sort_order
  `);
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    honorifics: r.honorifics,
    tier: r.tier,
    position: r.position,
    is_curator: r.is_curator,
    photo: null,
    bio_short: null,
    bio_full: r.bio_full,
    practice_areas: [],
    industries: [],
    education: r.education,
    admissions: r.admissions,
    memberships: r.memberships,
    languages: r.languages,
    email: r.email,
    linkedin: null,
  }));
});

export const getLawyer = async (slug: string): Promise<Lawyer | undefined> =>
  (await getLawyers()).find((l) => l.slug === slug);

// practice_areas.is_published gates the *publish workflow* (a practice
// cannot be marked published without a lead lawyer — practice_lead_guard in
// db/schema.sql). It does not gate whether the structural page exists on
// this site: every practice renders with an empty-state overview until ASP
// supplies one (content request 3), same as the static prototype. Filtering
// this list to is_published would currently make all 12 practice pages
// disappear, since data/lawyers.json has no lawyer -> practice links yet.
// Revisit this once there's an admin UI actually using is_published.
export const getPractices = cache(async (): Promise<Practice[]> => {
  const { rows } = await pool.query(`
    SELECT p.slug, p.tier::text AS tier, p.legacy_group,
           en.name AS name_en, id_.name AS name_id
    FROM practice_areas p
    LEFT JOIN practice_translations en  ON en.practice_id = p.id AND en.locale = 'en'
    LEFT JOIN practice_translations id_ ON id_.practice_id = p.id AND id_.locale = 'id'
    ORDER BY p.sort_order
  `);
  return rows.map((r) => ({
    slug: r.slug,
    name_en: r.name_en,
    name_id: r.name_id,
    tier: r.tier,
    legacy_group: r.legacy_group,
    overview: null,
  }));
});

export const getPractice = async (slug: string): Promise<Practice | undefined> =>
  (await getPractices()).find((p) => p.slug === slug);

export const getAwards = cache(async (): Promise<Award[]> => {
  const { rows } = await pool.query(`
    SELECT slug, title, year, organization, source_url
    FROM awards
    WHERE is_published
    ORDER BY year DESC, title
  `);
  return rows as Award[];
});

export const getAward = async (slug: string): Promise<Award | undefined> =>
  (await getAwards()).find((a) => a.slug === slug);

// industries and article_categories have no sort_order column in the schema
// (db/schema.sql) — the curated order data/*.json shipped with is lost once
// seeded. Ordering alphabetically here is a real, visible consequence of
// that gap, not a stylistic choice; add sort_order to both tables if the
// original order matters before this goes further than a local database.
export const getIndustries = cache(async (): Promise<Industry[]> => {
  const { rows } = await pool.query(
    `SELECT slug, name_en, name_id FROM industries ORDER BY name_en`,
  );
  return rows as Industry[];
});

export const getCategories = cache(async (): Promise<InsightCategory[]> => {
  const { rows } = await pool.query(
    `SELECT slug, name_en, name_id FROM article_categories ORDER BY name_en`,
  );
  return rows as InsightCategory[];
});
