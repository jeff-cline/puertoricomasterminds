-- supabase/migrations/0001_init.sql

-- Content tables ----------------------------------------------------

CREATE TABLE excursions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  text UNIQUE NOT NULL,
  title                 text NOT NULL,
  short_description     text NOT NULL,
  long_description      text,
  image_url             text NOT NULL,
  image_credit          text,
  price_from_usd        integer NOT NULL,
  duration_min          integer NOT NULL,
  duration_max          integer,
  type                  text NOT NULL CHECK (type IN ('cruise_day','multi_day','both')),
  viator_slug           text NOT NULL,
  viator_attraction_id  text NOT NULL,
  viator_base_level     text NOT NULL DEFAULT 'San-Juan' CHECK (viator_base_level IN ('San-Juan','Puerto-Rico','Vieques','Fajardo')),
  category              text,
  tags                  text[] NOT NULL DEFAULT '{}',
  is_hero               boolean NOT NULL DEFAULT false,
  sort_order            integer NOT NULL DEFAULT 0,
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE future_excursions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  description     text NOT NULL,
  image_url       text NOT NULL,
  image_source    text NOT NULL CHECK (image_source IN ('unsplash','manual','ai_generated')),
  image_credit    text,
  category        text,
  is_sensitive    boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE masterminds (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  one_line        text NOT NULL,
  description     text,
  image_url       text NOT NULL,
  destination_url text NOT NULL,
  tier            text NOT NULL CHECK (tier IN ('paid_t1','local_t2')),
  category        text,
  tags            text[] NOT NULL DEFAULT '{}',
  location        text,
  verified        boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE featured_destinations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text NOT NULL,
  image_url       text NOT NULL,
  target_url      text NOT NULL,
  click_count     integer NOT NULL DEFAULT 0,
  sort_order      integer NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  starts_at       timestamptz,
  ends_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vendors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  logo_url        text NOT NULL,
  address         text NOT NULL,
  description     text NOT NULL,
  website_url     text,
  phone           text,
  sort_order      integer NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Lead, event, ranking tables --------------------------------------

CREATE TABLE leads (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                       text NOT NULL,
  first_name                  text,
  last_name                   text,
  phone                       text,
  funnel                      text NOT NULL CHECK (funnel IN ('tourist','masterminds','real_estate')),
  source_origin               text,
  utm_source                  text,
  utm_medium                  text,
  utm_campaign                text,
  utm_term                    text,
  utm_content                 text,
  cruise_ship                 text,
  cruise_line                 text,
  cruise_call_type            text CHECK (cruise_call_type IN ('homeport_turnaround','transit')),
  cruise_demo_segment         text CHECK (cruise_demo_segment IN ('mega_family','premium_mainstream','luxury','fun_ships')),
  consent_marketing           boolean NOT NULL DEFAULT false,
  coupon_code                 text UNIQUE,
  coupon_redeemed_at          timestamptz,
  coupon_redeemed_vendor_id   uuid REFERENCES vendors(id),
  payload                     jsonb NOT NULL DEFAULT '{}',
  ip                          text,
  user_agent                  text,
  session_id                  text,
  created_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         uuid REFERENCES leads(id),
  session_id      text NOT NULL,
  event_type      text NOT NULL,
  entity_type     text,
  entity_id       uuid,
  payload         jsonb NOT NULL DEFAULT '{}',
  page_path       text,
  referrer        text,
  ip              text,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rankings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         uuid NOT NULL REFERENCES leads(id),
  funnel          text NOT NULL CHECK (funnel IN ('tourist','masterminds')),
  entity_type     text NOT NULL CHECK (entity_type IN ('future_excursion','mastermind')),
  entity_id       uuid NOT NULL,
  rank_position   integer NOT NULL CHECK (rank_position BETWEEN 1 AND 10),
  was_starred     boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Admin tables -----------------------------------------------------

CREATE TABLE users (
  id                      uuid PRIMARY KEY,                       -- mirrors auth.users.id
  email                   text UNIQUE NOT NULL,
  full_name               text,
  role                    text NOT NULL CHECK (role IN (
                            'super_admin','developer_real_estate','developer_excursion',
                            'investor','official','view_only'
                          )),
  force_password_change   boolean NOT NULL DEFAULT false,
  invited_by              uuid REFERENCES users(id),
  invited_at              timestamptz,
  last_login_at           timestamptz,
  is_active               boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id   uuid REFERENCES users(id),
  action          text NOT NULL,
  entity_type     text,
  entity_id       text,
  before_value    jsonb,
  after_value     jsonb,
  ip              text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Cruise calendar (manual admin tagging, v1) -----------------------

CREATE TABLE daily_port_calls (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_date       date NOT NULL,
  ship_name       text NOT NULL,
  cruise_line     text NOT NULL,
  call_type       text NOT NULL CHECK (call_type IN ('homeport_turnaround','transit')),
  demo_segment    text NOT NULL CHECK (demo_segment IN ('mega_family','premium_mainstream','luxury','fun_ships')),
  note            text,
  added_by        uuid REFERENCES users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (call_date, ship_name)
);

-- updated_at trigger helper ---------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_excursions_updated BEFORE UPDATE ON excursions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_future_excursions_updated BEFORE UPDATE ON future_excursions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_masterminds_updated BEFORE UPDATE ON masterminds
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_featured_destinations_updated BEFORE UPDATE ON featured_destinations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_vendors_updated BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
