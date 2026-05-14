# Puerto Rico Masterminds (PRM) — Tourism Data Capture & Lead-Gen Platform

**Design document · 2026-05-14**

---

## 1. Overview

A two-sided web platform serving as both a Viator-affiliate excursion site for visitors to San Juan, Puerto Rico AND a community-discovery site for island residents. Every visitor interaction (card click, gate decision, survey pick, ranking, form submission) is captured to a clean schema that feeds a single admin dashboard. The dashboard turns this into a defensible, evidence-based answer to the question *"which excursions, experiences, and groups should we bring to the island next?"* — to be pitched to developers, investors, and city officials.

The public-facing site is styled after fliptourscozumel.com but rebuilt with a real excursion card grid, lead-capture interstitial, and affiliate-redirect funnel.

## 2. Goals & Success Criteria

**Primary goals:**
1. Capture qualified leads (email + name, optionally phone) from visitors browsing San Juan excursions
2. Generate Viator (and Expedia secondary) affiliate revenue on the booking redirect
3. Aggregate clickstream + ranking data into an analytical model of which Coming Soon experiences are most wanted
4. Provide a separate funnel for island residents discovering local masterminds/communities
5. Deliver an admin dashboard usable by you, developers, investors, and city officials

**Success criteria for v1:**
- Public site live on a `*.vercel.app` URL
- Two complete funnels (tourist + masterminds) capturing data end-to-end
- Admin login (jeff.cline@me.com, TEMP!234, forced password change on first login)
- Dashboard showing leads, clicks, gate yes/no rates, top-ranked Coming Soon concepts
- All Viator CTAs routing through correct affiliate URL with per-card `campaign=` tracking
- Expedia banner rendering in footer + coupon page
- Real estate / Act 60 footer form capturing leads to a dedicated inbox

## 3. Out of Scope (v1, deferred to phase 2+)

- Live cruise-ship calendar scraper (manual admin dropdown in v1)
- Automated email coupon delivery (on-page download in v1; Resend integration is fast follow)
- Spanish translation (English-only v1)
- Affiliate-program swap UI (Viator URL pattern is in env; Expedia widget is hardcoded; admin swap UI is fast follow)
- SMS / push notifications
- Mobile app
- Booking checkout on PRM (always hands off to Viator/Expedia)

## 4. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server Components for fast marketing pages, Server Actions for form submission, single repo |
| Language | TypeScript (strict) | Type safety across DB → API → UI |
| Styling | Tailwind CSS + shadcn/ui | Fast iteration, accessible primitives |
| Animation | Framer Motion (sparingly) | Card hover, gate transitions, ranking drag |
| Database | Supabase Postgres | Managed, with row-level security and built-in auth |
| Auth | Supabase Auth (email/password) + custom `force_password_change` flag | Simple, free tier sufficient |
| Storage | Supabase Storage | Vendor logos, featured-destination images, AI-gen card images |
| Hosting | Vercel | Free `*.vercel.app` on day one; point real domain when ready |
| Analytics events | Custom `events` table + Vercel Analytics | Custom for business analytics; Vercel for technical |
| Email (phase 2) | Resend | Transactional only, no marketing automation |
| Image stock | Unsplash (free, per-photo credit when required) | Sun-drenched lifestyle photos for excursion cards |
| AI image gen (when stock fails) | TBD — Runway / DALL-E / Midjourney (user to provide credentials) | Only for niche Coming Soon concepts with no stock match |

Repo structure (all in one Next.js app):
```
app/                    # Next.js App Router
  (public)/             # Public-facing routes
  (admin)/              # Admin dashboard (auth gated)
  api/                  # API routes for events, exports, etc.
components/             # Shared UI
lib/
  affiliate/            # Viator + Expedia URL builders
  analytics/            # Event tracking helpers
  cruise/               # Ship tagging logic
  supabase/             # Server + browser clients
db/
  migrations/           # SQL migrations (or Supabase migrations)
  seed/                 # Seed scripts for excursions, masterminds, future concepts
public/
  images/               # Static images (logo, etc.)
docs/superpowers/specs/ # This spec lives here
```

## 5. Information Architecture (Sitemap)

### Public routes

| Route | Purpose |
|---|---|
| `/` | Homepage. Hero + 10 featured excursions (split by mode toggle) + trust strip + founder section + footer |
| `/excursions` | Full grid (~40 excursions) with `cruise_day` / `multi_day` filter and category chips |
| `/excursions/[slug]` | Single excursion detail page with hero, description, what-to-expect, and big BOOK CTA |
| `/gate/[origin]` | Lead-capture gate after clicking any excursion card. `origin` = `excursions:<slug>` or `homepage:hero:<slug>` etc. |
| `/survey` | Yes-path step 1: pick top 5 of the 18 Coming Soon concepts (star to select) |
| `/rank` | Yes-path step 2: drag-rank the picks 1–10 (best first) |
| `/coupon` | Yes-path step 3: thank-you + downloadable Cataño ferry coupon + vendor redemption list + giant BOOK EXCURSIONS button |
| `/masterminds` | Resident-facing grid of the 20 masterminds with category chips (Act 60 / Web3 / Fitness / etc.) |
| `/masterminds/[slug]` | Single mastermind detail page |
| `/masterminds/gate/[origin]` | Resident lead-capture gate |
| `/masterminds/survey` | Pick top 5 of 20 masterminds |
| `/masterminds/rank` | Drag-rank 1–10 |
| `/masterminds/thanks` | Thank-you + redirect to chosen mastermind URL after a short countdown |
| `/real-estate-interest` | Act 60 / real estate lead form lands here on submit |
| `/coupon/redeem/[code]` | Public landing for vendors to validate a coupon code (read-only) |
| `/privacy` | Privacy policy (template, includes affiliate disclosure) |
| `/terms` | Terms of service |
| `/about` | Founder story + trust copy |
| `/contact` | Contact info (WhatsApp deep-link on phone) |

### Admin routes (all under `/admin/*`, auth-gated)

| Route | Purpose |
|---|---|
| `/admin/login` | Login form |
| `/admin/change-password` | Forced first-login password change |
| `/admin` | Overview dashboard |
| `/admin/funnel/tourist` | Tourist funnel analytics |
| `/admin/funnel/masterminds` | Masterminds funnel analytics |
| `/admin/leaderboard/future-excursions` | Coming Soon ranking leaderboard |
| `/admin/leaderboard/masterminds` | Mastermind ranking leaderboard |
| `/admin/leads` | Searchable lead table + CSV export |
| `/admin/cruise-calendar` | Daily port-call dropdown + lead segmentation by ship |
| `/admin/cms/excursions` | CMS for real excursions on homepage |
| `/admin/cms/future-excursions` | CMS for the 18 Coming Soon concepts |
| `/admin/cms/masterminds` | CMS for the 20 masterminds |
| `/admin/cms/featured` | Manual featured destinations |
| `/admin/cms/vendors` | Vendor / ferry redemption partner CMS |
| `/admin/real-estate-leads` | Inbox for Act 60 / real estate leads |
| `/admin/users` | Invite + manage admin users and roles |
| `/admin/affiliate` | View affiliate URL config (Viator + Expedia); future swap UI |

## 6. Visual Direction

Source-of-truth aesthetic: **fliptourscozumel.com adapted for Puerto Rico, but with a real card grid that the source site lacks.**

**Palette:**
- Primary teal: `#0FB5BA` (Caribbean water)
- Navy: `#0A2540` (headers, body text on light surfaces)
- Coral accent (CTAs): `#FF7A45`
- Off-white surface: `#F7F9FB`
- Body text: `#1F2937`
- Success green: `#10B981`
- Warning amber: `#F59E0B`

**Typography:** Modern geometric sans throughout (Inter for body, Plus Jakarta Sans for headlines). No serif. Large all-caps headlines, sentence-case body.

**Photography style:** Sun-drenched lifestyle, people-doing-the-activity (snorkeling, kayaking, walking Old San Juan), saturated blues and turquoise. Not drone-heavy. Not flat-stock. Where Unsplash doesn't have a fitting photo, generate with AI (requires user credentials, see §19).

**UI patterns:**
- Sticky header with high-contrast coral "Book a Tour" button top-right
- TripAdvisor 5-star badge in header above the fold (**v1 ships with a static placeholder badge image; will swap to a real TripAdvisor widget once user has a live TripAdvisor business listing — see open question §22.7**)
- 3-column desktop / 2-column tablet / 1-column mobile card grid
- Card content: 4:3 hero image, title (2 lines max), duration pill, "From $XX" price, star rating + review count placeholder, primary CTA "Book Now" (which routes to /gate)
- Card hover: image zoom (scale 1.05, 300ms), elevated shadow
- Badges on cards: "Top Rated", "Best Seller", "Cruise Day OK", "Multi-Day", "Coming Soon"
- Buttons: pill-shaped, solid fill, coral primary
- Footer: privacy, terms, FTC affiliate disclosure, Expedia banner, newsletter signup

## 7. Funnel A — Tourist (Excursions)

### Flow

```
Homepage / /excursions / /excursions/[slug]
         │
         │ User clicks "Book Now" on a card
         ▼
/gate/excursions:<slug>
  ┌─────────────────────────────────────────┐
  │ "Welcome to beautiful Puerto Rico,      │
  │  we need your help…"                    │
  │                                         │
  │ [Yes, get my free coupon]   [No thanks] │
  └─────────────────────────────────────────┘
         │                              │
   YES   │                              │   NO
         ▼                              ▼
/survey                          Redirect to Viator
  (pick top 5 of 18              (campaign=<slug>-no)
   Coming Soon concepts)
         │
         ▼
/rank
  (drag-rank picks 1–10,
   best first)
         │
         ▼
/coupon
  (thank-you page,
   downloadable Cataño ferry coupon,
   vendor redemption list,
   giant BOOK EXCURSIONS button)
         │
         ▼
Redirect to Viator
(campaign=<slug>-yes)
```

### Gate UI specifics

- Full-screen takeover with light-teal background and a hero image of San Juan
- Big copy: *"Welcome to beautiful Puerto Rico — we need your help."*
- Subcopy: *"We're growing and expanding as one of the most popular destinations in the Caribbean. Help us shape what comes next by taking a brief survey, and we'll give you a free transportation ticket as our thank-you before sending you to your excursion booking."*
- **Email + first name + last name fields appear above the buttons. Both buttons require valid name + email to activate** — this is how we always capture a lead regardless of yes/no choice. Form validation is real-time; buttons are disabled until valid.
- Two buttons:
  - **PRIMARY (large, coral):** "Yes — receive my free Transportation Coupon"
  - **SECONDARY (small, text-link below primary):** "No thanks, take me to my excursion"
- Below buttons: small print FTC affiliate disclosure + privacy link
- On submit (either button): create `leads` row with `funnel='tourist'`, fire `gate_yes` or `gate_no` event tied to the same `session_id` and `lead_id`, then route to next step

### Survey (pick top 5) UI

- All 18 Coming Soon cards in a grid
- Each card: image, title, one-sentence "what this would be" description, "Coming Soon / Under Review" badge
- Star icon in top-right of each card; tap to star
- **User stars at least 5 and up to 10 cards** (5 is the minimum the user explicitly asked for; 10 is the rank-step ceiling). Counter at top: "Pick at least 5 — starred X of up-to-10"
- Submit button activates when ≥5 are starred; pressing it advances to the rank step
- Skip button (small, secondary): "Skip ranking — just send my coupon" → goes straight to /coupon with empty ranking
- Star/un-star events fire `survey_pick` / `survey_unpick` events

### Rank UI

- The starred cards (5–10 of them) shown vertically
- Drag-handle on the left of each card; user drags into rank order
- Position labels: **1 (Most Want To See First) … N (Last)** where N = number starred (5–10)
- "Submit Rankings" button creates `rankings` rows (one per card with `rank_position` 1..N, `was_starred=true`)
- After submit: redirect to /coupon

### Coupon page

- Header: *"Great — we appreciate your support and hope you enjoy your time on the beautiful island of Puerto Rico."*
- Sub-header: *"We'll communicate with you when these excursions are open for your next visit. Thank you for helping all future visitors to the beautiful island of Puerto Rico."*
- Coupon block: visually styled like a paper ticket
  - "1 Free Ferry Ride · Cataño Round Trip"
  - Unique 8-char alphanumeric code (e.g. `PR4XK2A9`)
  - Issued-to: visitor's name and email
  - "Download Coupon (PDF)" button (client-side PDF gen via `jspdf` + `html2canvas` in v1; emailed in phase 2)
  - "Get Directions to the Ferry Terminal" button (deep links to Google Maps for the AcuaExpreso Cataño ferry terminal in Old San Juan)
- Vendor redemption section:
  - Header: *"Redeem on the Cataño side at any of our fine vendors. Make a purchase and get your ferry fare back as a thank-you for helping make our beautiful island better for the millions to come."*
  - Grid of vendor cards (logo, name, address, description)
  - Each vendor pulled from `vendors` table; user uploads via admin
- **GIANT primary CTA at the bottom:** "BOOK EXCURSIONS" button (full-width, coral, 2× standard button height) → Viator with `campaign=<origin-slug>-yes`
- Expedia banner widget (medium rectangle) sits below the BOOK EXCURSIONS button
- Footer with global Expedia banner does not double-render here; the inline banner replaces it for this page

## 8. Funnel B — Resident (Masterminds)

Same machinery, different audience and copy.

### Flow

```
/masterminds (grid of 20 masterminds)
         │
         │ User clicks card
         ▼
/masterminds/[slug] (detail page) OR direct to gate
         │
         ▼
/masterminds/gate/masterminds:<slug>
  ┌─────────────────────────────────────────┐
  │ "Help us understand what our growing    │
  │  island community is looking for."      │
  │ [Yes, take the survey]   [No thanks]    │
  └─────────────────────────────────────────┘
         │                              │
   YES   ▼                              ▼   NO
/masterminds/survey              Redirect to mastermind URL
  (pick top 5 of 20)
         │
         ▼
/masterminds/rank
  (drag-rank picks 1–10)
         │
         ▼
/masterminds/thanks
  (thank-you message + 5-sec countdown + redirect to chosen mastermind URL)
```

### Notable differences from Funnel A

- No free coupon offered (community/mastermind audience is different)
- Survey is on the 20 masterminds themselves, not on a separate Coming Soon list
- Thanks page displays the chosen mastermind one more time before redirecting (consent + brand impression)
- Data feeds the **Masterminds** admin tab, segregated from tourist data

## 9. Pop-up "We Need Your Help" Modal

- Triggers on first visit to `/` after 12 seconds OR on exit intent (mouse leaves viewport top)
- Cookie `prm_modal_shown` set to suppress for 30 days
- Modal copy: *"Our beautiful island is growing, with millions of tourists a year. We need your help figuring out what excursions and events visitors want while they're here. If you're willing to take a quick survey, we'll give you a free transportation coupon."*
- Same two buttons as the gate: "Yes — take the survey" → `/gate/modal:homepage` | "No thanks" → close modal
- Tracked as event `modal_view`, `modal_yes`, `modal_no`

## 10. Real Estate / Act 60 Footer Form

- Permanent block in the public footer of every page (above legal links)
- Section header: *"Interested in real estate on our beautiful island?"* + *"Interested in Act 60 tax benefits for relocating your company?"*
- Two-checkbox form: Real Estate / Act 60 (multi-select, at least one required)
- Fields: First name, Last name, Email, Phone (optional), Free-text "Tell us more"
- Submit → `/real-estate-interest` confirmation page
- Lead stored to `leads` with `funnel='real_estate'` and `payload.interests=['real_estate','act_60']`
- Visible in admin under `/admin/real-estate-leads`

## 11. Coupon Code & Vendor Redemption

- Coupon code generated on first survey/rank submit; format `PR` + 6 alphanumeric chars
- Stored on `leads.coupon_code` (unique constraint)
- Vendor partner can validate at `/coupon/redeem/[code]` (read-only public page)
  - Shows: visitor name, issued date, redeemed status, redeemed-by vendor (if any)
  - Vendor with redemption admin access can mark redeemed via `/admin/coupons` (phase 2; v1 is read-only validation only)
- v1 vendor list seeded empty; user adds via `/admin/cms/vendors`

## 12. Data Model

All tables in the `public` schema. Supabase row-level security policies gate access:
- Public anonymous: insert into `leads`, `events`, `rankings`, `survey_responses`
- Admin authenticated (super_admin role): full read on all tables; write on CMS tables
- Other roles: scoped read on relevant tables (see §16)

### Core content tables

```sql
-- Real excursions shown on / and /excursions
CREATE TABLE excursions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  short_description text NOT NULL,
  long_description text,
  image_url       text NOT NULL,
  image_credit    text,
  price_from_usd  integer NOT NULL,
  duration_min    integer NOT NULL,
  duration_max    integer,
  type            text NOT NULL CHECK (type IN ('cruise_day','multi_day','both')),
  viator_slug     text NOT NULL,         -- e.g. "Old-San-Juan"
  viator_attraction_id text NOT NULL,     -- e.g. "d903-a2460"
  category        text,                   -- 'culinary', 'water', 'history', 'adventure', etc.
  tags            text[] DEFAULT '{}',
  is_hero         boolean DEFAULT false, -- show on homepage hero section
  sort_order      integer DEFAULT 0,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- The 18 Coming Soon concepts shown in the survey
CREATE TABLE future_excursions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  description     text NOT NULL,
  image_url       text NOT NULL,
  image_source    text NOT NULL CHECK (image_source IN ('unsplash','manual','ai_generated')),
  image_credit    text,
  category        text,
  is_sensitive    boolean DEFAULT false, -- e.g. cock fighting; flagged in admin
  is_active       boolean DEFAULT true,
  sort_order      integer DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- The 20 masterminds shown on /masterminds and in the masterminds survey
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
  tags            text[] DEFAULT '{}',
  location        text, -- 'San Juan', 'Dorado', 'Rincón', 'Island-wide'
  verified        boolean DEFAULT false,
  is_active       boolean DEFAULT true,
  sort_order      integer DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Admin-managed featured destinations (top-of-page promos)
CREATE TABLE featured_destinations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text NOT NULL,
  image_url       text NOT NULL,
  target_url      text NOT NULL,
  click_count     integer DEFAULT 0,
  sort_order      integer DEFAULT 0,
  is_active       boolean DEFAULT true,
  starts_at       timestamptz,
  ends_at         timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Ferry coupon vendor partners (Cataño side)
CREATE TABLE vendors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  logo_url        text NOT NULL,
  address         text NOT NULL,
  description     text NOT NULL,
  website_url     text,
  phone           text,
  sort_order      integer DEFAULT 0,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

### Lead, event, and ranking tables

```sql
-- Every form submission lands here
CREATE TABLE leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL,
  first_name      text,
  last_name       text,
  phone           text,
  funnel          text NOT NULL CHECK (funnel IN ('tourist','masterminds','real_estate')),
  source_origin   text,                  -- e.g. 'excursions:vieques-bio-bay'
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_term        text,
  utm_content     text,
  cruise_ship     text,                  -- admin-tagged or scraper-populated
  cruise_line     text,
  cruise_call_type text CHECK (cruise_call_type IN ('homeport_turnaround','transit') OR cruise_call_type IS NULL),
  cruise_demo_segment text CHECK (cruise_demo_segment IN ('mega_family','premium_mainstream','luxury','fun_ships') OR cruise_demo_segment IS NULL),
  consent_marketing boolean DEFAULT false,
  coupon_code     text UNIQUE,
  coupon_redeemed_at timestamptz,
  coupon_redeemed_vendor_id uuid REFERENCES vendors(id),
  payload         jsonb DEFAULT '{}',    -- e.g. real-estate interests
  ip              text,
  user_agent      text,
  session_id      text,                  -- ties to events
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_leads_funnel_created ON leads (funnel, created_at DESC);
CREATE INDEX idx_leads_email ON leads (email);
CREATE INDEX idx_leads_cruise_ship_created ON leads (cruise_ship, created_at DESC);

-- Every click + decision + view captured here
CREATE TABLE events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         uuid REFERENCES leads(id),
  session_id      text NOT NULL,
  event_type      text NOT NULL,         -- card_click | gate_view | gate_yes | gate_no | survey_pick | survey_unpick | rank_submit | coupon_view | coupon_download | book_button_click | featured_click | modal_view | modal_yes | modal_no | real_estate_submit
  entity_type     text,                  -- excursion | future_excursion | mastermind | featured_destination | vendor | masterminds_funnel
  entity_id       uuid,
  payload         jsonb DEFAULT '{}',
  page_path       text,
  referrer        text,
  ip              text,
  user_agent      text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_events_type_created ON events (event_type, created_at DESC);
CREATE INDEX idx_events_entity ON events (entity_type, entity_id, created_at DESC);
CREATE INDEX idx_events_session ON events (session_id);
CREATE INDEX idx_events_lead ON events (lead_id);

-- A single "rank submission" creates 1–10 rows here
CREATE TABLE rankings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         uuid NOT NULL REFERENCES leads(id),
  funnel          text NOT NULL CHECK (funnel IN ('tourist','masterminds')),
  entity_type     text NOT NULL CHECK (entity_type IN ('future_excursion','mastermind')),
  entity_id       uuid NOT NULL,
  rank_position   integer NOT NULL CHECK (rank_position BETWEEN 1 AND 10),
  was_starred     boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_rankings_entity ON rankings (entity_type, entity_id);
CREATE INDEX idx_rankings_lead ON rankings (lead_id);
```

### Auth and admin tables

```sql
CREATE TABLE users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text UNIQUE NOT NULL,
  full_name       text,
  role            text NOT NULL CHECK (role IN (
                    'super_admin',
                    'developer_real_estate',
                    'developer_excursion',
                    'investor',
                    'official',
                    'view_only'
                  )),
  force_password_change boolean DEFAULT false,
  invited_by      uuid REFERENCES users(id),
  invited_at      timestamptz,
  last_login_at   timestamptz,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id   uuid REFERENCES users(id),
  action          text NOT NULL,         -- e.g. 'create_user', 'delete_excursion', 'change_affiliate_config'
  entity_type     text,
  entity_id       text,
  before_value    jsonb,
  after_value     jsonb,
  ip              text,
  created_at      timestamptz DEFAULT now()
);
```

### Seeded admin user

```sql
INSERT INTO users (email, full_name, role, force_password_change)
VALUES ('jeff.cline@me.com', 'Jeff Cline', 'super_admin', true);
-- Initial password TEMP!234 set via Supabase Auth API, with auth user metadata
-- linked to this row by email.
```

## 13. Affiliate URL Strategy

### Viator

Per-CTA `campaign=` tracking string format (kebab-case, ≤64 chars):

```
<source-context>-<funnel-decision>-<entity-slug>

Examples:
- homepage-hero-cruise-old-san-juan-walking
- excursions-grid-yes-vieques-bio-bay
- excursions-grid-no-vieques-bio-bay
- gate-yes-coupon-page-book-button
- gate-no-direct-redirect-bacardi-tour
- modal-yes-survey-completed
```

URL helper in `lib/affiliate/viator.ts`:

```typescript
function buildViatorUrl(opts: {
  slug: string,
  attractionId: string,
  campaign: string,
  baseLevel?: 'San-Juan' | 'Puerto-Rico' | 'Vieques' | 'Fajardo'
}): string
```

Falls back to the head URL (`Puerto-Rico-attractions/San-Juan-Gate/d36-a19408`) if the slug+id lookup fails — the link still works, the user just lands on the broad PR landing page rather than a specific attraction.

Environment variables (so swap-ability is one config edit):
```
VIATOR_PID=P00301140
VIATOR_MCID=42383
VIATOR_MEDIUM=link
```

### Expedia

Server-rendered widget div with the exact snippet you provided. The script tag loads via Next.js `<Script strategy="afterInteractive" />` once per page.

`<Script>` injected in:
- `app/(public)/layout.tsx` (footer)
- `app/(public)/coupon/page.tsx` (inline below BOOK EXCURSIONS button)

**Flagged for user before launch:** the `data-camref="undefined"` value is a literal string. Verify with Expedia's affiliate dashboard whether this is acceptable (pubref-only attribution) or whether a real camref is required.

## 14. Cruise Ship Tagging

**v1 (manual):** `/admin/cruise-calendar` shows a date picker + dropdown of ships in port that day. Admin marks ships before/after the day. Lead-creation hooks read the day's tagged ships and attach `cruise_ship`, `cruise_line`, `cruise_call_type`, `cruise_demo_segment` to the lead.

**Predefined ship list (seeded):** 30 most-common ships across the four demo segments:
- `mega_family`: Royal Caribbean Oasis/Icon/Symphony/Wonder, Carnival Mardi Gras/Celebration/Jubilee, Disney Magic/Fantasy/Wish, Norwegian Prima/Viva
- `premium_mainstream`: Celebrity Equinox/Reflection/Apex, Princess Caribbean/Royal/Sky, Holland America Eurodam/Nieuw Statendam, MSC Seascape/Divina
- `luxury`: Seabourn Quest, Silversea Silver Spirit, Regent Seven Seas Splendor, Viking Sky/Star, Oceania Riviera, Windstar Star Pride
- `fun_ships`: Carnival Conquest/Glory/Sunshine (Conquest-class, distinct from Excel-class megaships)

**Phase 2 (auto-scraper):** Nightly cron at 3am AST scrapes `sanjuancruiseport.com/schedule/` and `cruisetimetables.com`, writes to `daily_port_calls` table. Admin override UI preserved for weather diversions.

## 15. Admin Dashboard

### Overview tab `/admin`

Cards (responsive grid):
1. Leads today / week / month (with sparkline)
2. Top 5 clicked real excursions (last 30 days)
3. Top 5 ranked Coming Soon concepts (weighted Borda count — see §17)
4. Conversion funnel (impression → card click → gate view → yes → completed survey → rank submit → BOOK click)
5. Cruise: ship in port today, lead count by ship
6. Masterminds funnel mini-overview (parallel to tourist)

### Tourist funnel tab `/admin/funnel/tourist`

Full sankey:
```
excursion impressions
  → card clicks (% CTR per card)
    → gate views
      → yes / no split
        → survey completes (yes path only)
          → rank submits
            → coupon page views
              → BOOK EXCURSIONS clicks
```

Filters: date range, excursion slug, cruise demo segment, source origin.

### Masterminds funnel tab `/admin/funnel/masterminds`

Same shape, masterminds entities.

### Future Excursions Leaderboard `/admin/leaderboard/future-excursions`

Table:
| Concept | Total picks | Times ranked #1 | Borda score | Trend (Δ vs prior period) |
|---|---|---|---|---|
| (each of 18 rows) | … | … | … | … |

- "Borda score" sums `(11 − rank_position) × is_starred` across all submissions. Standard rank-aggregation method.
- Click any row to see the per-card sub-page: who picked it, demographic segmentation, cruise-ship segmentation
- Export to CSV

### Masterminds Leaderboard `/admin/leaderboard/masterminds`

Same shape, 20 masterminds.

### Leads `/admin/leads`

- Searchable table (email, name, phone, source_origin, cruise_ship)
- Filters: funnel, date range, has-coupon, has-rank, has-redeemed-coupon
- Bulk CSV export
- Click a lead → detail panel with all events (timeline) and rankings

### Cruise Calendar `/admin/cruise-calendar`

- Calendar grid (current + next month)
- Click a day → modal: dropdown of ships, multi-select, save
- Side panel: lead count for that day, segmented by ship

### CMS tabs

Standard table → row-edit pattern for each of:
- Excursions (40 real + admin can add)
- Future Excursions (18 seeded)
- Masterminds (20 seeded)
- Featured Destinations (empty, admin adds)
- Vendors (empty, admin adds)

Each row: image upload (Supabase Storage), title, description, sort order, active toggle, type-specific fields.

### Real Estate Leads `/admin/real-estate-leads`

Same shape as Leads but pre-filtered to `funnel='real_estate'`. Visible to `super_admin` and `developer_real_estate` roles only.

### Users & Roles `/admin/users`

- Table of admins
- Invite new admin: email + role + auto-generated TEMP password
- Role change auditing in `audit_log`
- Deactivate (soft delete) admin
- Visible to `super_admin` only

### Affiliate Config `/admin/affiliate`

- Read-only view of current Viator IDs (pid, mcid, medium)
- Editable on phase 2 — the swap UI mentioned by user
- Expedia widget snippet shown verbatim

## 16. Authentication & Role-Based Access

### Login flow

1. `/admin/login` — Supabase Auth email+password
2. After auth, server middleware reads `users.force_password_change` for the logged-in email
3. If `true`, redirect to `/admin/change-password` (no other admin route accessible)
4. After password change, `force_password_change → false`; redirect to `/admin`

### Seeded super admin

```
email: jeff.cline@me.com
password: TEMP!234
force_password_change: true
```

### Role matrix

| Role | Overview | Tourist Funnel | Masterminds Funnel | Leads (PII) | Real Estate Leads | Cruise Calendar | CMS (Excursions/Future/Masterminds) | CMS (Featured/Vendors) | Users & Roles | Affiliate |
|---|---|---|---|---|---|---|---|---|---|---|
| `super_admin` (Jeff) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `developer_real_estate` | ✓ | partial (no PII) | partial (no PII) | redacted | ✓ | view | view | view | — | view |
| `developer_excursion` | ✓ | ✓ | partial (no PII) | redacted | — | ✓ | ✓ | ✓ | — | view |
| `investor` | ✓ (aggregates only) | ✓ (aggregates only) | ✓ (aggregates only) | — | — | view | view | view | — | view |
| `official` | ✓ (aggregates only) | ✓ (aggregates only) | ✓ (aggregates only) | — | — | view | view | view | — | — |
| `view_only` | ✓ (aggregates only) | ✓ (aggregates only) | — | — | — | — | view | view | — | — |

"Redacted" = email shown as `j***@m***.com`, name shown as `J. C***`, phone masked.

## 17. Analytics & Aggregations

Server-side aggregations via Supabase SQL views, refreshed on dashboard load (or via materialized views with 15-min refresh for performance).

Key views:

```sql
-- daily lead count by funnel
CREATE VIEW v_daily_leads AS
  SELECT date_trunc('day', created_at) AS day, funnel, count(*)
  FROM leads GROUP BY 1,2;

-- top-clicked real excursions, last 30d
CREATE VIEW v_top_excursions_30d AS
  SELECT entity_id, count(*) AS clicks
  FROM events
  WHERE event_type = 'card_click'
    AND entity_type = 'excursion'
    AND created_at > now() - interval '30 days'
  GROUP BY entity_id
  ORDER BY clicks DESC
  LIMIT 20;

-- Borda-weighted future excursion leaderboard
CREATE VIEW v_future_excursion_leaderboard AS
  SELECT
    fe.id,
    fe.title,
    COUNT(r.id) AS total_picks,
    COUNT(*) FILTER (WHERE r.rank_position = 1) AS first_place_count,
    SUM((11 - r.rank_position)) AS borda_score
  FROM future_excursions fe
  LEFT JOIN rankings r
    ON r.entity_type = 'future_excursion'
    AND r.entity_id = fe.id
  WHERE fe.is_active = true
  GROUP BY fe.id, fe.title
  ORDER BY borda_score DESC NULLS LAST;

-- gate yes/no conversion rate by source origin
CREATE VIEW v_gate_conversion AS
  SELECT
    payload->>'origin' AS origin,
    COUNT(*) FILTER (WHERE event_type = 'gate_view') AS views,
    COUNT(*) FILTER (WHERE event_type = 'gate_yes') AS yes,
    COUNT(*) FILTER (WHERE event_type = 'gate_no') AS no
  FROM events
  WHERE event_type IN ('gate_view','gate_yes','gate_no')
  GROUP BY 1;
```

Similar views for masterminds, daily/weekly/monthly rollups, cruise-ship segmentation.

## 18. Content Inventory

### 18.1 Real excursions (40 total, seeded via `db/seed/excursions.ts`)

Top 10 hero picks (homepage above-the-fold split by mode toggle):

**Cruise Day mode:**
1. Old San Juan Walking Tour
2. Casa Bacardí Distillery Tour
3. El Yunque Half-Day Rainforest
4. Castillo San Felipe del Morro (El Morro) Tour
5. Flavors of San Juan Food Tour

**Multi-Day mode:**
6. Vieques Bio Bay (Mosquito Bay) Kayak
7. Culebra / Flamenco Beach Catamaran Day Trip
8. El Yunque Full-Day Waterfalls
9. Toro Verde "The Beast" Zipline
10. Fajardo Laguna Grande Bio Bay Kayak

Full list (20 cruise-day + 20 multi-day) seeded with name, description, duration, price, viator slug, viator attraction id, type, category. Source: research agent #2 (May 2026 catalog).

### 18.2 The 18 "Coming Soon" concepts (seeded via `db/seed/future_excursions.ts`)

> **Note on the 5 overlapping titles** (Snorkeling, Jet Ski tour, Walking Tour, Mixology experience, Catamaran): real third-party versions of these exist today and are listed on the homepage / `/excursions` as Viator-affiliate excursions. The Coming Soon variants here are framed as **PRM-managed/branded experiences** under our own operations — a different product. The slug suffix `-prm` distinguishes them in the data layer; the survey copy says e.g. *"Imagine PRM's own snorkel excursion — small group, our crew, our boat."*


| Slug | Title | One-line | Sensitive? |
|---|---|---|---|
| immersive-art | Immersive Art Experience | A walk-in projection-mapped art gallery in Santurce featuring Puerto Rican artists | no |
| miniature-golf | Caribbean Mini-Golf | 18-hole tropical mini-golf themed around PR landmarks (El Morro, El Yunque, the Bio Bay) | no |
| axe-throwing | Old San Juan Axe Throwing | Friendly axe-throwing lanes in a converted colonial warehouse | no |
| cock-fighting | Traditional Gallera Showcase | Historical/cultural exhibition on the role of the gallera in Puerto Rican heritage *(non-live exhibit; cockfighting is federally banned)* | **yes** |
| harlem-globetrotters | Globetrotter-Style Basketball Show | Touring exhibition basketball game with trick shots, comedy, and audience interaction | no |
| artisanal-pizza | Artisanal Pizza Making | Wood-fired pizza class with locally-sourced toppings | no |
| speakeasy | Hidden Speakeasy Tour | Prohibition-era cocktail crawl through Old San Juan's hidden bars | no |
| tiki-flotation | Tiki Hut Flotation on the Bay | Anchored floating tiki bars in San Juan Bay you swim out to | no |
| snorkeling-prm | PRM-Branded Snorkel Excursion | Small-group snorkel at Escambrón reef, PRM-managed | no |
| jetski-tour-prm | PRM Jet Ski Bay Tour | Guided jet ski circuit around San Juan Bay with El Morro photo stops | no |
| walking-tour-prm | PRM Walking Tour | Curated Old San Juan walking tour with PRM-trained local guides | no |
| mixology | Mixology Experience | Mixology lab teaching pitorro, rum, and tropical cocktail techniques | no |
| live-local-music | Live Local Music Showcase | Rotating series featuring bomba, plena, and contemporary PR artists | no |
| dance-lessons | Salsa & Bomba Dance Lessons | Beginner-friendly group lessons with a live drummer | no |
| wine-art-class | Wine & Art Class | Sip-and-paint with Caribbean-themed instructors | no |
| caribbean-art-auction | Caribbean Art Auction | Curated auction of Caribbean artists with proceeds to local arts | no |
| pro-wrestling | Professional Wrestling Show | Touring/local pro wrestling event in San Juan | no |
| catamaran-prm | PRM Catamaran Day Trip | Half-day catamaran sail with snorkel, lunch, and open bar | no |

Each concept gets an image (Unsplash where possible; AI gen for ones with no good stock match like "tiki hut flotation" or "gallera"). The `is_sensitive=true` flag on cock fighting surfaces an admin warning but doesn't change visitor UX — the data point is valuable.

### 18.3 The 20 masterminds (seeded via `db/seed/masterminds.ts`)

Final 20 from research agent #4 (verified URLs):

| Slug | Title | Tier | Location | URL |
|---|---|---|---|---|
| 2022-act-society | The 20/22 Act Society | paid_t1 | Dorado | https://www.the2022actsociety.org/ |
| eo-puerto-rico | EO Puerto Rico | paid_t1 | San Juan | https://eopuertorico.org/ |
| ypo-puerto-rico | YPO Puerto Rico | paid_t1 | San Juan | https://www.ypo.org/ |
| gobundance-pr | GoBundance (PR Members) | paid_t1 | Island-wide | https://gobundance.com/ |
| uncorrelated-pr | Uncorrelated Alts PR | paid_t1 | San Juan | https://uncorrelatedpr.com/ |
| prbta | PR Blockchain Trade Association | paid_t1 | San Juan | https://www.prblockchain.org/ |
| cryptomondays | CryptoMondays San Juan | paid_t1 | Old San Juan | https://www.facebook.com/CryptoMondaysSanJuan/ |
| bitangels | BitAngels San Juan | paid_t1 | San Juan | https://bitangels.network/san-juan |
| parallel18 | Parallel18 | paid_t1 | San Juan | https://parallel18.com/ |
| grupo-guayacan | Grupo Guayacán | paid_t1 | San Juan | https://guayacan.org/ |
| piloto-151 | Piloto 151 | paid_t1 | OSJ + Dorado | https://piloto151.com/ |
| colmena66 | Colmena66 | paid_t1 | Island-wide | https://www.colmena66.com/ |
| indie-hackers-pr | Indie Hackers Puerto Rico | local_t2 | San Juan | https://www.indiehackerspr.com/ |
| aa-san-juan | AA San Juan / Caribbean 12 Step | local_t2 | Condado | https://www.aasanjuan.org/ |
| la-academia-bjj | La Academia Jiu Jitsu | local_t2 | Santurce | https://la-academia.com/ |
| opex-san-juan | OPEX San Juan | local_t2 | San Juan | https://www.opexsj.com/ |
| run-club-san-juan | San Juan Run Club | local_t2 | Condado | https://www.instagram.com/sanjuanrunclub/ |
| union-church-sj | Union Church of San Juan | local_t2 | San Juan | https://www.unionchurchsj.org/ |
| rincon-surf | Rincón Surf School (Community Hub) | local_t2 | Rincón | https://www.rinconsurfschool.com/ |
| metro-wbc | Metro Women's Business Center | local_t2 | San Juan / Bayamón | https://puertoricowomen.org/ |

Each gets one-line copy, image, tier+category badges. `verified` flag set per research agent's notes.

### 18.4 Vendors (seeded empty; admin adds)

CMS-only. User uploads logo, address, description for each Cataño-side redemption partner.

### 18.5 Featured Destinations (seeded empty; admin adds)

CMS-only. Manual top-of-page promo blocks with click tracking.

## 19. Image Strategy

- **Real excursions:** Unsplash (PR/Caribbean tagged) with per-image credit displayed in alt text and small caption on detail pages
- **Coming Soon concepts:** Mixed — Unsplash for ones with good stock match (snorkeling, jet ski, mixology, dance lessons, walking tour, catamaran, pizza making, art classes); AI-generated for niche ones with no stock (tiki hut flotation, gallera exhibit, axe throwing in San Juan, Globetrotter-style basketball)
- **Masterminds:** Unsplash for category-appropriate imagery (people-in-meetings, founder dinners, surf, jiu-jitsu, etc.); AI-generated only where stock fails
- **Vendor logos:** uploaded by user via admin
- **Featured destinations:** uploaded by user via admin

**AI image generation:** Requires user credentials. Open question (§22): which service (Runway, DALL-E, Midjourney)? Will ask before implementation.

**File handling:** All images uploaded to Supabase Storage in the `prm-images` bucket with subfolders `excursions/`, `future-excursions/`, `masterminds/`, `vendors/`, `featured/`. Public read, authenticated write. Image URLs stored as full Supabase public URLs.

## 20. Email & Notifications (Phase 2)

- Resend integration for:
  - Coupon delivery (PDF attached, sent on /coupon completion)
  - Admin invite email with TEMP password
  - Weekly digest to super_admin
  - Daily/weekly/monthly scheduled reports (per user's request)

v1 has on-page coupon download instead of email. Admin invites use copy-the-link UI instead of email. Reports are dashboard-only in v1.

## 21. Phased Rollout

**v1 (this build):**
- All public pages
- Both funnels
- Lead capture
- Survey + Rank
- Coupon (on-page download)
- Admin dashboard + all CMS tabs
- Auth + role matrix
- Cruise calendar manual dropdown
- Viator + Expedia affiliate plumbing
- Real estate footer form
- Seeded content (40 excursions, 18 Coming Soon, 20 masterminds)

**v1.5 (immediately after launch):**
- Resend email integration
- Coupon vendor-side redemption UI
- Cruise calendar nightly scraper
- Spanish translation

**v2 (post-launch optimization):**
- Affiliate-program swap UI
- A/B testing for gate copy and CTA placement
- More AI-generated imagery
- Affiliate revenue analytics

## 22. Open Questions for User (must resolve before or during build)

1. **AI image gen credentials:** Which service (Runway / DALL-E / Midjourney / Leonardo)? Need API key when we reach the seed-data step.
2. ~~**Domain name:** Do you own one yet (e.g. `puertoricomasterminds.com`)? If yes, share it so I can configure Vercel DNS at launch.~~ **RESOLVED:** Domain is `PuertoRicoMasterminds.com`. GitHub repo: https://github.com/jeff-cline/puertoricomasterminds. User has an external agent managing go-live on the server — our handoff is `git push` to that repo.
3. **Expedia camref:** Should `data-camref="undefined"` be replaced with a real value? Verify with Expedia's affiliate dashboard before launch.
4. **WhatsApp number** for the header phone CTA: do you want a real number (yours) or placeholder?
5. **Founder/concierge persona** on the About page: real person you'll name, or fictional placeholder (e.g. "Meet Luis, your San Juan concierge")?
6. **Cataño ferry departure point** for the coupon's Google Maps deep-link: the AcuaExpreso terminal at Pier 2 in Old San Juan — confirm this is the right point.
7. **TripAdvisor 5-star badge in header:** real listing or placeholder? (You'll need an actual TripAdvisor business page for it to link out properly.)

## 23. Deployment Plan

1. **Local dev:** `npm install` → `.env.local` with Supabase URL/anon key + Viator IDs → `npm run dev` on `localhost:3000`
2. **Supabase project setup:** Create free Supabase project; run migrations from `db/migrations/`; run seed scripts.
3. **GitHub push:** Push to https://github.com/jeff-cline/puertoricomasterminds. **We do not deploy to Vercel.** The user has an external agent that manages go-live on the server — our handoff is the git push.
4. **Domain:** `PuertoRicoMasterminds.com` — DNS + hosting handled by the user's go-live agent.

---

**End of design document.**
