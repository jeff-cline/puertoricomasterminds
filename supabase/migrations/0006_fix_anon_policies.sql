-- supabase/migrations/0006_fix_anon_policies.sql
--
-- Fix anonymous-funnel INSERT policies: `TO anon, authenticated` was not
-- matching the role assigned to requests authenticated with the new
-- `sb_publishable_*` key format. Switching to `TO public` covers every
-- role (including any future ones) without changing the access shape
-- — the funnel is intentionally open to anonymous lead/event/ranking
-- writes, and admin reads remain gated by the unchanged SELECT policies.

DROP POLICY IF EXISTS anon_insert_leads ON leads;
DROP POLICY IF EXISTS anon_insert_events ON events;
DROP POLICY IF EXISTS anon_insert_rankings ON rankings;

CREATE POLICY anon_insert_leads ON leads
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY anon_insert_events ON events
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY anon_insert_rankings ON rankings
  FOR INSERT TO public
  WITH CHECK (true);
