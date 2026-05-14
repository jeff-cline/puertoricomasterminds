-- supabase/migrations/0002_indexes.sql

-- leads: common filters
CREATE INDEX idx_leads_funnel_created          ON leads (funnel, created_at DESC);
CREATE INDEX idx_leads_email                   ON leads (email);
CREATE INDEX idx_leads_cruise_ship_created     ON leads (cruise_ship, created_at DESC) WHERE cruise_ship IS NOT NULL;
CREATE INDEX idx_leads_session                 ON leads (session_id);

-- events: ingestion is high-volume; filter by type and entity often
CREATE INDEX idx_events_type_created           ON events (event_type, created_at DESC);
CREATE INDEX idx_events_entity                 ON events (entity_type, entity_id, created_at DESC);
CREATE INDEX idx_events_session                ON events (session_id);
CREATE INDEX idx_events_lead                   ON events (lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_events_created                ON events (created_at DESC);

-- rankings: leaderboards aggregate by (entity_type, entity_id)
CREATE INDEX idx_rankings_entity               ON rankings (entity_type, entity_id);
CREATE INDEX idx_rankings_lead                 ON rankings (lead_id);
CREATE INDEX idx_rankings_funnel_created       ON rankings (funnel, created_at DESC);

-- content sort
CREATE INDEX idx_excursions_active_sort        ON excursions (is_active, sort_order);
CREATE INDEX idx_excursions_type               ON excursions (type) WHERE is_active = true;
CREATE INDEX idx_future_excursions_active_sort ON future_excursions (is_active, sort_order);
CREATE INDEX idx_masterminds_active_sort       ON masterminds (is_active, sort_order);
CREATE INDEX idx_featured_active_sort          ON featured_destinations (is_active, sort_order);
CREATE INDEX idx_vendors_active_sort           ON vendors (is_active, sort_order);

-- daily port calls: lookup by date is the only access pattern
CREATE INDEX idx_daily_port_calls_date         ON daily_port_calls (call_date);
