-- =============================================================================
-- ASP Legal Intelligence Platform — PostgreSQL schema (Phase 4)
-- Target: PostgreSQL 15+
-- Locale strategy: content tables carry per-locale rows keyed by (entity, locale)
--                  where the text differs; structural rows are locale-neutral.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "citext";

CREATE TYPE locale          AS ENUM ('en', 'id');
CREATE TYPE lawyer_tier     AS ENUM ('managing-partner', 'founding-partner', 'partner', 'counsel', 'senior-associate', 'associate');
CREATE TYPE practice_tier   AS ENUM ('flagship', 'dispute', 'corporate');
CREATE TYPE content_status  AS ENUM ('draft', 'legal_review', 'editorial_review', 'seo_review', 'scheduled', 'published', 'archived');
CREATE TYPE case_role       AS ENUM ('receiver', 'administrator', 'counsel_debtor', 'counsel_creditor', 'counsel_other');
CREATE TYPE case_status      AS ENUM ('ongoing', 'completed', 'settled', 'withdrawn');
CREATE TYPE lead_status     AS ENUM ('new', 'conflict_check', 'contacted', 'engaged', 'declined', 'spam');
CREATE TYPE user_role       AS ENUM ('super_admin', 'managing_editor', 'author', 'reviewer', 'marketing', 'it_security');

-- ---------------------------------------------------------------- people ----

CREATE TABLE lawyers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  name            text NOT NULL,
  honorifics      text,
  tier            lawyer_tier NOT NULL,
  position_label  text NOT NULL,
  is_curator      boolean NOT NULL DEFAULT false,
  photo_id        uuid,
  email           citext,
  linkedin_url    text,
  sort_order      integer NOT NULL DEFAULT 100,
  is_published    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE lawyer_translations (
  lawyer_id   uuid REFERENCES lawyers(id) ON DELETE CASCADE,
  locale      locale NOT NULL,
  bio_short   text,
  bio_full    text,
  PRIMARY KEY (lawyer_id, locale)
);

CREATE TABLE lawyer_credentials (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id  uuid NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  kind       text NOT NULL CHECK (kind IN ('education','admission','membership','language','speaking','publication')),
  value      text NOT NULL,
  year       smallint,
  sort_order integer NOT NULL DEFAULT 100
);

-- ------------------------------------------------------------- practices ----

CREATE TABLE practice_areas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  tier         practice_tier NOT NULL,
  legacy_group text,
  sort_order   integer NOT NULL DEFAULT 100,
  is_published boolean NOT NULL DEFAULT false
);

CREATE TABLE practice_translations (
  practice_id  uuid REFERENCES practice_areas(id) ON DELETE CASCADE,
  locale       locale NOT NULL,
  name         text NOT NULL,
  summary      text,
  overview     text,
  capabilities jsonb NOT NULL DEFAULT '[]',
  faq          jsonb NOT NULL DEFAULT '[]',
  PRIMARY KEY (practice_id, locale)
);

CREATE TABLE lawyer_practices (
  lawyer_id   uuid REFERENCES lawyers(id) ON DELETE CASCADE,
  practice_id uuid REFERENCES practice_areas(id) ON DELETE CASCADE,
  is_lead     boolean NOT NULL DEFAULT false,
  PRIMARY KEY (lawyer_id, practice_id)
);

-- A practice page must never publish without a named lead lawyer.
CREATE OR REPLACE FUNCTION assert_practice_has_lead() RETURNS trigger AS $$
BEGIN
  IF NEW.is_published AND NOT EXISTS (
    SELECT 1 FROM lawyer_practices WHERE practice_id = NEW.id AND is_lead
  ) THEN
    RAISE EXCEPTION 'Practice % cannot be published without a lead lawyer', NEW.slug;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER practice_lead_guard
  BEFORE INSERT OR UPDATE ON practice_areas
  FOR EACH ROW EXECUTE FUNCTION assert_practice_has_lead();

-- ------------------------------------------------------------ taxonomies ----

CREATE TABLE industries (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug    text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_id text NOT NULL
);

CREATE TABLE article_categories (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug    text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_id text NOT NULL
);

-- --------------------------------------------------------------- content ----

CREATE TABLE articles (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text UNIQUE NOT NULL,
  category_id    uuid NOT NULL REFERENCES article_categories(id),
  hero_media_id  uuid,
  status         content_status NOT NULL DEFAULT 'draft',
  published_at   timestamptz,
  updated_content_at timestamptz,
  reading_minutes smallint,
  legal_reviewed_by uuid REFERENCES lawyers(id),
  legal_reviewed_at timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT published_needs_date  CHECK (status <> 'published' OR published_at IS NOT NULL),
  CONSTRAINT published_needs_review CHECK (status <> 'published' OR legal_reviewed_at IS NOT NULL)
);

CREATE TABLE article_translations (
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  locale     locale NOT NULL,
  title      text NOT NULL,
  excerpt    text,
  body       text NOT NULL,
  PRIMARY KEY (article_id, locale)
);

CREATE TABLE article_authors (
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  lawyer_id  uuid REFERENCES lawyers(id) ON DELETE RESTRICT,
  sort_order integer NOT NULL DEFAULT 1,
  PRIMARY KEY (article_id, lawyer_id)
);

CREATE TABLE article_practices (
  article_id  uuid REFERENCES articles(id) ON DELETE CASCADE,
  practice_id uuid REFERENCES practice_areas(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, practice_id)
);

-- No house bylines: an article cannot publish without at least one real author.
CREATE OR REPLACE FUNCTION assert_article_has_author() RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'published' AND NOT EXISTS (
    SELECT 1 FROM article_authors WHERE article_id = NEW.id
  ) THEN
    RAISE EXCEPTION 'Article % cannot be published without an author', NEW.slug;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER article_author_guard
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION assert_article_has_author();

-- ----------------------------------------------------------------- cases ----

CREATE TABLE cases (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text UNIQUE NOT NULL,
  case_type      text NOT NULL,
  court          text NOT NULL,
  decision_year  smallint NOT NULL,
  industry_id    uuid REFERENCES industries(id),
  firm_role      case_role NOT NULL,
  status         case_status NOT NULL,
  is_public      boolean NOT NULL DEFAULT false,
  public_source_url text,
  cleared_by     text,
  cleared_at     timestamptz,
  is_demo        boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  -- A matter is publishable only if it is on the public record, carries the
  -- source, and has been signed off by a named person at the firm.
  CONSTRAINT public_case_needs_provenance
    CHECK (NOT is_public OR (public_source_url IS NOT NULL AND cleared_by IS NOT NULL AND cleared_at IS NOT NULL))
);

CREATE TABLE case_translations (
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  locale  locale NOT NULL,
  title   text NOT NULL,
  summary text,
  PRIMARY KEY (case_id, locale)
);

CREATE TABLE case_practices (
  case_id     uuid REFERENCES cases(id) ON DELETE CASCADE,
  practice_id uuid REFERENCES practice_areas(id) ON DELETE CASCADE,
  PRIMARY KEY (case_id, practice_id)
);

CREATE TABLE case_lawyers (
  case_id   uuid REFERENCES cases(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES lawyers(id) ON DELETE CASCADE,
  PRIMARY KEY (case_id, lawyer_id)
);

-- ---------------------------------------------------------------- awards ----

CREATE TABLE awards (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  title        text NOT NULL,
  year         smallint NOT NULL,
  organization text NOT NULL,
  source_url   text NOT NULL,          -- self-declared awards are not published
  media_id     uuid,
  description  text,
  is_published boolean NOT NULL DEFAULT true
);

CREATE TABLE award_lawyers (
  award_id  uuid REFERENCES awards(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES lawyers(id) ON DELETE CASCADE,
  PRIMARY KEY (award_id, lawyer_id)
);

CREATE TABLE award_practices (
  award_id    uuid REFERENCES awards(id) ON DELETE CASCADE,
  practice_id uuid REFERENCES practice_areas(id) ON DELETE CASCADE,
  PRIMARY KEY (award_id, practice_id)
);

-- ------------------------------------------------- events, jobs, knowledge ---

CREATE TABLE events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  title       text NOT NULL,
  kind        text NOT NULL,
  starts_at   timestamptz NOT NULL,
  ends_at     timestamptz,
  venue       text,
  registration_url text,
  is_published boolean NOT NULL DEFAULT false
);

CREATE TABLE jobs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  title        text NOT NULL,
  tier         lawyer_tier,
  location     text NOT NULL DEFAULT 'Jakarta',
  employment_type text NOT NULL,
  description  text,
  requirements jsonb NOT NULL DEFAULT '[]',
  is_open      boolean NOT NULL DEFAULT false,
  closes_at    date
);

CREATE TABLE knowledge_topics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  practice_id uuid REFERENCES practice_areas(id),
  sort_order  integer NOT NULL DEFAULT 100
);

CREATE TABLE knowledge_translations (
  topic_id uuid REFERENCES knowledge_topics(id) ON DELETE CASCADE,
  locale   locale NOT NULL,
  title    text NOT NULL,
  overview text,
  PRIMARY KEY (topic_id, locale)
);

-- ----------------------------------------------------------------- leads ----

CREATE TABLE leads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text NOT NULL,
  company       text,
  position      text,
  email         citext NOT NULL,
  phone         text,
  matter_type   text NOT NULL,
  party_role    text,
  urgency       text,
  description   text NOT NULL,
  file_key      text,                  -- object storage key; never a public URL
  file_scan_status text CHECK (file_scan_status IN ('pending','clean','infected','failed')),
  source_page   text,
  utm           jsonb,
  ip_hash       text,                  -- hashed, not raw: personal data minimisation
  status        lead_status NOT NULL DEFAULT 'new',
  assigned_to   uuid,
  conflict_checked_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  purge_after   date NOT NULL DEFAULT (current_date + interval '24 months')
);

CREATE INDEX leads_status_created_idx ON leads (status, created_at DESC);

-- ----------------------------------------------------- users, media, audit ---

CREATE TABLE users (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        citext UNIQUE NOT NULL,
  display_name text NOT NULL,
  role         user_role NOT NULL,
  lawyer_id    uuid REFERENCES lawyers(id),
  mfa_enabled  boolean NOT NULL DEFAULT false,
  is_active    boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key text NOT NULL,
  mime_type   text NOT NULL,
  width       integer,
  height      integer,
  bytes       bigint,
  alt_en      text,
  alt_id      text,
  credit      text,
  uploaded_by uuid REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE seo_metadata (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id   uuid NOT NULL,
  locale      locale NOT NULL,
  title       text,
  description text,
  canonical   text,
  og_image_id uuid REFERENCES media(id),
  noindex     boolean NOT NULL DEFAULT false,
  UNIQUE (entity_type, entity_id, locale)
);

CREATE TABLE redirects (
  id         serial PRIMARY KEY,
  from_path  text UNIQUE NOT NULL,
  to_path    text,
  status     smallint NOT NULL DEFAULT 301 CHECK (status IN (301, 302, 410)),
  note       text,
  CONSTRAINT gone_has_no_target CHECK (status <> 410 OR to_path IS NULL)
);

CREATE TABLE audit_logs (
  id         bigserial PRIMARY KEY,
  actor_id   uuid REFERENCES users(id),
  action     text NOT NULL,
  entity_type text NOT NULL,
  entity_id  uuid,
  before     jsonb,
  after      jsonb,
  ip_hash    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_entity_idx ON audit_logs (entity_type, entity_id, created_at DESC);

-- ---------------------------------------------------------------- search ----

-- lawyer uses a LEFT JOIN and a fixed 'en' locale, not an inner join over
-- lawyer_translations: a published lawyer with no bio yet (21 of 23 today
-- — content request 1) must still be findable by name. An inner join here
-- made those 21 people invisible to the site's own search, not just
-- bio-less, which is a correctness bug independent of the missing-content
-- one: the name is known and published, so search should find it.
CREATE MATERIALIZED VIEW search_index AS
  SELECT 'lawyer'::text AS kind, l.id, l.slug, 'en'::locale AS locale,
         l.name AS title, coalesce(t.bio_short, '') AS body
    FROM lawyers l LEFT JOIN lawyer_translations t
      ON t.lawyer_id = l.id AND t.locale = 'en'
   WHERE l.is_published
  UNION ALL
  SELECT 'practice', p.id, p.slug, t.locale, t.name, coalesce(t.overview, '')
    FROM practice_areas p JOIN practice_translations t ON t.practice_id = p.id
   WHERE p.is_published
  UNION ALL
  SELECT 'article', a.id, a.slug, t.locale, t.title, coalesce(t.excerpt, '')
    FROM articles a JOIN article_translations t ON t.article_id = a.id
   WHERE a.status = 'published'
  UNION ALL
  SELECT 'award', w.id, w.slug, 'en'::locale, w.title, coalesce(w.description, '')
    FROM awards w WHERE w.is_published;

-- unaccent() is STABLE, not IMMUTABLE, so Postgres refuses it directly in a
-- functional index expression ("functions in index expression must be
-- marked IMMUTABLE"). The standard fix: wrap it as IMMUTABLE. This is safe
-- here because the unaccent dictionary this app uses is fixed at deploy
-- time, not data-dependent.
CREATE OR REPLACE FUNCTION immutable_unaccent(text) RETURNS text AS $$
  SELECT unaccent('unaccent', $1)
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

CREATE INDEX search_index_fts ON search_index
  USING gin (to_tsvector('simple', immutable_unaccent(title || ' ' || body)));
