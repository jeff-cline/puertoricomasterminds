-- supabase/migrations/0003_views.sql

-- Daily lead count by funnel
CREATE OR REPLACE VIEW v_daily_leads AS
  SELECT
    date_trunc('day', created_at)::date AS day,
    funnel,
    COUNT(*)::int AS lead_count
  FROM leads
  GROUP BY 1, 2;

-- Weekly lead count by funnel
CREATE OR REPLACE VIEW v_weekly_leads AS
  SELECT
    date_trunc('week', created_at)::date AS week_start,
    funnel,
    COUNT(*)::int AS lead_count
  FROM leads
  GROUP BY 1, 2;

-- Monthly lead count by funnel
CREATE OR REPLACE VIEW v_monthly_leads AS
  SELECT
    date_trunc('month', created_at)::date AS month_start,
    funnel,
    COUNT(*)::int AS lead_count
  FROM leads
  GROUP BY 1, 2;

-- Top-clicked real excursions, last 30 days
CREATE OR REPLACE VIEW v_top_excursions_30d AS
  SELECT
    e.id AS excursion_id,
    e.slug,
    e.title,
    COUNT(ev.id)::int AS clicks
  FROM excursions e
  LEFT JOIN events ev
    ON ev.event_type = 'card_click'
    AND ev.entity_type = 'excursion'
    AND ev.entity_id = e.id
    AND ev.created_at > now() - interval '30 days'
  WHERE e.is_active = true
  GROUP BY e.id, e.slug, e.title
  ORDER BY clicks DESC NULLS LAST;

-- Borda-weighted future-excursion leaderboard
CREATE OR REPLACE VIEW v_future_excursion_leaderboard AS
  SELECT
    fe.id,
    fe.slug,
    fe.title,
    COUNT(r.id)::int AS total_picks,
    COUNT(*) FILTER (WHERE r.rank_position = 1)::int AS first_place_count,
    COALESCE(SUM(11 - r.rank_position), 0)::int AS borda_score
  FROM future_excursions fe
  LEFT JOIN rankings r
    ON r.entity_type = 'future_excursion'
    AND r.entity_id = fe.id
  WHERE fe.is_active = true
  GROUP BY fe.id, fe.slug, fe.title
  ORDER BY borda_score DESC NULLS LAST;

-- Borda-weighted mastermind leaderboard
CREATE OR REPLACE VIEW v_mastermind_leaderboard AS
  SELECT
    m.id,
    m.slug,
    m.title,
    m.tier,
    COUNT(r.id)::int AS total_picks,
    COUNT(*) FILTER (WHERE r.rank_position = 1)::int AS first_place_count,
    COALESCE(SUM(11 - r.rank_position), 0)::int AS borda_score
  FROM masterminds m
  LEFT JOIN rankings r
    ON r.entity_type = 'mastermind'
    AND r.entity_id = m.id
  WHERE m.is_active = true
  GROUP BY m.id, m.slug, m.title, m.tier
  ORDER BY borda_score DESC NULLS LAST;

-- Gate yes/no conversion by origin
CREATE OR REPLACE VIEW v_gate_conversion AS
  SELECT
    payload->>'origin' AS origin,
    COUNT(*) FILTER (WHERE event_type = 'gate_view')::int AS views,
    COUNT(*) FILTER (WHERE event_type = 'gate_yes')::int AS yes_count,
    COUNT(*) FILTER (WHERE event_type = 'gate_no')::int AS no_count
  FROM events
  WHERE event_type IN ('gate_view','gate_yes','gate_no')
  GROUP BY 1;

-- Funnel impressions → completed (tourist)
CREATE OR REPLACE VIEW v_tourist_funnel AS
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'card_click' AND entity_type = 'excursion')::int AS card_clicks,
    COUNT(*) FILTER (WHERE event_type = 'gate_view' AND (payload->>'funnel' = 'tourist' OR payload->>'funnel' IS NULL))::int AS gate_views,
    COUNT(*) FILTER (WHERE event_type = 'gate_yes' AND (payload->>'funnel' = 'tourist' OR payload->>'funnel' IS NULL))::int AS gate_yes,
    COUNT(*) FILTER (WHERE event_type = 'gate_no' AND (payload->>'funnel' = 'tourist' OR payload->>'funnel' IS NULL))::int AS gate_no,
    COUNT(*) FILTER (WHERE event_type = 'rank_submit' AND payload->>'funnel' = 'tourist')::int AS rank_submits,
    COUNT(*) FILTER (WHERE event_type = 'book_button_click')::int AS book_clicks
  FROM events;

-- Lead segmentation by cruise demo
CREATE OR REPLACE VIEW v_leads_by_cruise_demo AS
  SELECT
    COALESCE(cruise_demo_segment, 'unknown') AS demo_segment,
    funnel,
    COUNT(*)::int AS lead_count
  FROM leads
  GROUP BY 1, 2;
