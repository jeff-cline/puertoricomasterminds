-- supabase/migrations/0004_rls.sql

-- Enable RLS on every table
ALTER TABLE excursions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_excursions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE masterminds            ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_destinations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors                ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_port_calls       ENABLE ROW LEVEL SECURITY;

-- Helper: is the current authenticated user an admin role?
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN (
        'super_admin','developer_real_estate','developer_excursion',
        'investor','official','view_only'
      )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION current_role_name() RETURNS text AS $$
  SELECT role FROM users WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Public-readable content (anyone can SELECT active rows) ---------

CREATE POLICY public_read_excursions ON excursions
  FOR SELECT USING (is_active = true);

CREATE POLICY public_read_future_excursions ON future_excursions
  FOR SELECT USING (is_active = true);

CREATE POLICY public_read_masterminds ON masterminds
  FOR SELECT USING (is_active = true);

CREATE POLICY public_read_featured ON featured_destinations
  FOR SELECT USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));

CREATE POLICY public_read_vendors ON vendors
  FOR SELECT USING (is_active = true);

-- Admin write on content tables (super_admin + developer_excursion) -

CREATE POLICY admin_write_excursions ON excursions
  FOR ALL TO authenticated
  USING (current_role_name() IN ('super_admin','developer_excursion'))
  WITH CHECK (current_role_name() IN ('super_admin','developer_excursion'));

CREATE POLICY admin_write_future_excursions ON future_excursions
  FOR ALL TO authenticated
  USING (current_role_name() IN ('super_admin','developer_excursion'))
  WITH CHECK (current_role_name() IN ('super_admin','developer_excursion'));

CREATE POLICY admin_write_masterminds ON masterminds
  FOR ALL TO authenticated
  USING (current_role_name() IN ('super_admin','developer_excursion'))
  WITH CHECK (current_role_name() IN ('super_admin','developer_excursion'));

CREATE POLICY admin_write_featured ON featured_destinations
  FOR ALL TO authenticated
  USING (current_role_name() IN ('super_admin','developer_excursion'))
  WITH CHECK (current_role_name() IN ('super_admin','developer_excursion'));

CREATE POLICY admin_write_vendors ON vendors
  FOR ALL TO authenticated
  USING (current_role_name() IN ('super_admin','developer_excursion'))
  WITH CHECK (current_role_name() IN ('super_admin','developer_excursion'));

-- Anonymous insert on lead/event/ranking tables (the funnel writes) -

CREATE POLICY anon_insert_leads ON leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY anon_insert_events ON events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY anon_insert_rankings ON rankings
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Public coupon validation read (single row by code) --------------
-- (We restrict select on leads to admins, except for a coupon-validate
-- route. The route uses the service-role key on the server, so no RLS
-- needed for that path. No public SELECT on leads.)

-- Admin read on leads/events/rankings -----------------------------

CREATE POLICY admin_read_leads ON leads
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY admin_read_events ON events
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY admin_read_rankings ON rankings
  FOR SELECT TO authenticated
  USING (is_admin());

-- Coupon redemption update (super_admin only, v1; vendor-side coupon
-- redemption UI is phase 2 and will get its own policy when added)
CREATE POLICY super_admin_update_leads ON leads
  FOR UPDATE TO authenticated
  USING (current_role_name() = 'super_admin')
  WITH CHECK (current_role_name() = 'super_admin');

-- Users table: super_admin manages everyone; everyone reads self ---

CREATE POLICY users_read_self ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR current_role_name() = 'super_admin');

CREATE POLICY users_super_admin_write ON users
  FOR ALL TO authenticated
  USING (current_role_name() = 'super_admin')
  WITH CHECK (current_role_name() = 'super_admin');

-- Allow an authenticated user to update only their own force_password_change flag
CREATE POLICY users_update_self_pw_flag ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Audit log: super_admin read-only; insert via service role only ---
CREATE POLICY audit_super_admin_read ON audit_log
  FOR SELECT TO authenticated
  USING (current_role_name() = 'super_admin');

-- Daily port calls: admin write (super_admin + dev_excursion); admin read
CREATE POLICY port_calls_admin_read ON daily_port_calls
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY port_calls_admin_write ON daily_port_calls
  FOR ALL TO authenticated
  USING (current_role_name() IN ('super_admin','developer_excursion'))
  WITH CHECK (current_role_name() IN ('super_admin','developer_excursion'));
