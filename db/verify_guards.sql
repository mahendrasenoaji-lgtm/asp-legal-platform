-- Verifies the four integrity guards docs/04-cms-backend.md §2 claims actually reject bad
-- rows. Each check runs in its own SAVEPOINT and rolls back, so this script is safe to run
-- against a seeded database repeatedly without leaving bad or leftover rows behind.
-- Usage: psql -d asp_legal_dev -f db/verify_guards.sql

\set ON_ERROR_STOP off
\pset pager off

\echo '=== Guard 1: practice cannot publish without a lead lawyer ==='
BEGIN;
SAVEPOINT g1;
UPDATE practice_areas SET is_published = true WHERE slug = 'bankruptcy';
ROLLBACK TO g1;
ROLLBACK;

\echo ''
\echo '=== Guard 2: article cannot publish without an author ==='
BEGIN;
SAVEPOINT g2;
INSERT INTO article_categories (slug, name_en, name_id)
  VALUES ('_test-cat', 'Test', 'Uji') ON CONFLICT DO NOTHING;
INSERT INTO articles (slug, category_id, status, published_at, legal_reviewed_at)
  SELECT '_test-article', id, 'published', now(), now() FROM article_categories WHERE slug = '_test-cat';
ROLLBACK TO g2;
ROLLBACK;

\echo ''
\echo '=== Guard 3: a public matter needs a source URL and a named clearance ==='
BEGIN;
SAVEPOINT g3;
INSERT INTO cases (slug, case_type, court, decision_year, firm_role, status, is_public)
  VALUES ('_test-case', 'Bankruptcy', 'Commercial Court Jakarta', 2026, 'receiver', 'completed', true);
ROLLBACK TO g3;
ROLLBACK;

\echo ''
\echo '=== Guard 4: an award cannot exist without the awarding body''s own source URL ==='
BEGIN;
SAVEPOINT g4;
INSERT INTO awards (slug, title, year, organization)
  VALUES ('_test-award', 'Invented Award', 2026, 'Nobody');
ROLLBACK TO g4;
ROLLBACK;

\echo ''
\echo '=== Control: the same public matter DOES insert once source + clearance are given ==='
BEGIN;
SAVEPOINT g3ok;
INSERT INTO cases (slug, case_type, court, decision_year, firm_role, status, is_public,
                    public_source_url, cleared_by, cleared_at)
  VALUES ('_test-case-ok', 'Bankruptcy', 'Commercial Court Jakarta', 2026, 'receiver', 'completed', true,
          'https://example.court.go.id/putusan/12345', 'Herlin Susanto', now());
SELECT slug, is_public FROM cases WHERE slug = '_test-case-ok';
ROLLBACK TO g3ok;
ROLLBACK;

\echo ''
\echo '=== Cleanup check: no _test rows survive (every guard test rolled back) ==='
SELECT count(*) AS leftover_test_rows FROM (
  SELECT slug FROM cases WHERE slug LIKE '\_test%'
  UNION ALL SELECT slug FROM articles WHERE slug LIKE '\_test%'
  UNION ALL SELECT slug FROM awards WHERE slug LIKE '\_test%'
  UNION ALL SELECT slug FROM article_categories WHERE slug LIKE '\_test%'
) t;
