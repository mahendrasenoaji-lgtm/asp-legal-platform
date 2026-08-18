// Central data access. Every page reads through here, never the database
// directly — this is the seam docs/04-cms-backend.md §6 asked for. Every
// table in db/schema.sql is queried from here, including firm_settings.
//
// `cache()` memoises each query per request/build so the ~12-23 rows these
// tables hold aren't re-fetched once per static page during `next build`.

import { cache } from "react";
import { pool } from "./db";
import type { Award, Firm, Industry, InsightCategory, Lawyer, Practice } from "./types";

// Re-exported for server-side callers that want everything from one import;
// client components must import these from lib/constants directly instead
// (see the comment at the top of that file for why).
export { DISCLAIMER, NAV, SITE_READY, initials, isLeadershipTier } from "./constants";

export const getFirm = cache(async (): Promise<Firm> => {
  const { rows } = await pool.query(`SELECT * FROM firm_settings WHERE id = true`);
  const r = rows[0];
  if (!r) {
    throw new Error(
      "firm_settings has no row — run db/seed.py and reload it (see PROGRESS.md).",
    );
  }
  return {
    _source: "database: firm_settings (originally data/firm.json)",
    legal_name: r.legal_name,
    short_name: r.short_name,
    founded: r.founded.toISOString().slice(0, 10),
    founders: r.founders,
    core_values: r.core_values,
    office: {
      name: r.office_name,
      street: r.office_street,
      district: r.office_district,
      city: r.office_city,
      region: r.office_region,
      postal_code: r.office_postal_code,
      country: r.office_country,
      phone: r.office_phone,
      email: r.office_email,
      geo: r.office_geo_lat != null ? { lat: r.office_geo_lat, lng: r.office_geo_lng } : null,
      opening_hours: r.office_opening_hours,
      linkedin: r.office_linkedin_url,
    },
    claimed_metrics: {
      fee_earners: r.claimed_fee_earners,
      practice_areas: r.claimed_practice_areas,
      clients: r.claimed_clients,
      _warning: r.claimed_metrics_warning,
    },
  };
});

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

// sort_order preserves data/*.json's original array order (db/seed.py sets
// it from array position) rather than falling back to alphabetical, which
// is what happened here before the column existed.
export const getIndustries = cache(async (): Promise<Industry[]> => {
  const { rows } = await pool.query(
    `SELECT slug, name_en, name_id FROM industries ORDER BY sort_order`,
  );
  return rows as Industry[];
});

export const getCategories = cache(async (): Promise<InsightCategory[]> => {
  const { rows } = await pool.query(
    `SELECT slug, name_en, name_id FROM article_categories ORDER BY sort_order`,
  );
  return rows as InsightCategory[];
});
