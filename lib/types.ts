// Shapes mirror data/*.json exactly on purpose (see CLAUDE.md — "Verified
// data"). When Phase 4's CMS is wired up, these are the shapes the API
// should return; nothing here should need to change for that swap.

export interface Firm {
  _source: string;
  legal_name: string;
  short_name: string;
  founded: string;
  founders: string[];
  core_values: string[];
  office: {
    name: string;
    street: string;
    district: string;
    city: string;
    region: string;
    postal_code: string;
    country: string;
    phone: string;
    email: string;
    geo: { lat: number; lng: number } | null;
    opening_hours: string | null;
    linkedin: string | null;
  };
  claimed_metrics: {
    fee_earners: number;
    practice_areas: number;
    clients: number;
    _warning: string;
  };
}

export type LawyerTier = "managing-partner" | "partner" | "leader" | "associate" | string;

export interface Lawyer {
  slug: string;
  name: string;
  honorifics: string;
  tier: LawyerTier;
  position: string;
  is_curator: boolean;
  photo: string | null;
  bio_short: string | null;
  bio_full: string | null;
  practice_areas: string[];
  industries: string[];
  education: string[];
  admissions: string[];
  memberships: string[];
  languages: string[];
  email: string | null;
  linkedin: string | null;
  _status?: string;
}

export type PracticeTier = "flagship" | "dispute" | "corporate" | string;

export interface Practice {
  slug: string;
  name_en: string;
  name_id: string;
  tier: PracticeTier;
  legacy_group: string;
  overview: string | null;
}

export interface Award {
  slug: string;
  title: string;
  organization: string;
  year: number;
  source_url: string;
}

export interface Industry {
  slug: string;
  name_en: string;
  name_id: string;
}

export interface InsightCategory {
  slug: string;
  name_en: string;
  name_id: string;
}
