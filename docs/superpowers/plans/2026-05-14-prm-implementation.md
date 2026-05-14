# PRM (Puerto Rico Masterminds) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full PRM platform per `docs/superpowers/specs/2026-05-14-puerto-rico-tourism-data-capture-design.md` — a Next.js app on Supabase with a public tourist + masterminds funnel and an auth-gated admin dashboard.

**Architecture:** Single Next.js 15 App Router repo. Public pages are RSC by default; interactive funnel pieces are client components using Server Actions for mutations. Supabase Postgres holds all data; Supabase Auth gates admin. Viator + Expedia affiliate plumbing on the public side; role-gated dashboard with Borda-weighted ranking analytics on the admin side.

**Tech Stack:** Next.js 15, TypeScript (strict), Tailwind, shadcn/ui, Supabase (Postgres + Auth + Storage), Vitest (unit), Framer Motion (sparingly), jspdf + html2canvas (coupon PDF), Vercel hosting.

**Build Sequence (two milestones, one plan):**
- **Milestone 1 — Public Site (Phases A–H):** Foundation, schema, affiliate utilities, homepage, excursions, both funnels, modal, real-estate form, static pages. Push to GitHub. Result: a live site capturing leads (go-live handled by user's external agent).
- **Milestone 2 — Admin Dashboard (Phases I–O):** Auth, role gating, overview, funnel analytics, leaderboards, leads, cruise calendar, CMS, user management. Push to GitHub. Result: full analytics backend.

**Deployment:** Push to https://github.com/jeff-cline/puertoricomasterminds. We do NOT run `vercel deploy` — the user has an external go-live agent that handles the server. Our handoff is the git push. Domain: `PuertoRicoMasterminds.com`.

**Testing approach:** TDD with Vitest for utility/business logic (URL builder, code generator, Borda math, role helpers). Component tests sparingly (gate validation, ranking drag). Manual smoke tests in Phase O. No full Playwright suite in v1 — added in v1.5.

---

## File Structure Overview

```
puertoricomasterminds/
├── app/
│   ├── (public)/                # Public marketing + funnel routes
│   ├── (admin)/                 # Admin dashboard, auth-gated
│   └── api/                     # Event ingestion + CSV exports
├── components/
│   ├── ui/                      # shadcn primitives
│   ├── public/                  # Header, footer, hero, cards, modal, forms
│   ├── gate/ survey/ rank/ coupon/  # Funnel-stage components
│   └── admin/                   # Dashboard shell, tables, charts, CMS forms
├── lib/
│   ├── supabase/                # Server + browser clients, middleware helper
│   ├── affiliate/               # Viator URL builder, Expedia banner helper
│   ├── analytics/               # Event tracking
│   ├── auth/                    # Role constants + can() helper + force-pw-change
│   ├── cruise/                  # Ship list + demo segment mapping
│   ├── coupon/                  # Code generator + PDF builder
│   └── ranking/                 # Borda count + leaderboard math
├── db/
│   ├── migrations/              # SQL migrations (0001 init, 0002 indexes, 0003 views, 0004 RLS)
│   └── seed/                    # excursions, future-excursions, masterminds, ships, super-admin
├── tests/                       # Vitest unit tests, mirroring lib/
├── middleware.ts                # Auth + force_password_change redirect
└── docs/superpowers/{specs,plans}/
```

Files that change together live together. Each file in `lib/` has one clear responsibility — small and focused. UI components are split by funnel stage so each stage is self-contained.

---

## Phase A — Foundation

Establish the Next.js app, design tokens, env scaffolding, and test runner.

### Task A1: Initialize Next.js with TypeScript + Tailwind

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Scaffold the Next.js app**

Run from project root (the directory already exists and has `.git`, `.gitignore`, `docs/`):

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*" --turbopack --no-eslint --use-npm
```

When prompted that the directory is not empty, choose **yes** to proceed. Confirm files are merged, not destroyed (`.git`, `docs/`, `.gitignore` must still exist after).

- [ ] **Step 2: Verify dev server runs**

```bash
npm run dev
```

Visit `http://localhost:3000`. Expect the default Next.js welcome page. Stop the server (Ctrl+C).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 app with TypeScript + Tailwind"
```

---

### Task A2: Install shadcn/ui and core UI primitives

**Files:**
- Create: `components.json`, `components/ui/*` (button, input, label, dialog, table, card, badge, dropdown-menu, select, checkbox, sonner)
- Create: `lib/utils.ts` (shadcn's cn helper)

- [ ] **Step 1: Initialize shadcn**

```bash
npx shadcn@latest init -y --base-color=neutral --css-variables
```

Accept defaults. Verify `components.json` exists and `lib/utils.ts` contains the `cn()` helper.

- [ ] **Step 2: Install the primitives we need across the app**

```bash
npx shadcn@latest add button input label dialog table card badge dropdown-menu select checkbox sonner form textarea tabs alert separator
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: install shadcn/ui and core primitives"
```

---

### Task A3: Configure design tokens (palette, typography)

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace `app/globals.css` body section with PRM tokens**

Replace the `:root` block (and any `.dark` block) with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 210 33% 98%;        /* #F7F9FB off-white */
  --foreground: 220 19% 16%;        /* #1F2937 body */
  --card: 0 0% 100%;
  --card-foreground: 220 19% 16%;
  --popover: 0 0% 100%;
  --popover-foreground: 220 19% 16%;
  --primary: 183 86% 39%;           /* #0FB5BA teal */
  --primary-foreground: 0 0% 100%;
  --secondary: 211 65% 9%;          /* #0A2540 navy */
  --secondary-foreground: 0 0% 100%;
  --accent: 16 100% 64%;            /* #FF7A45 coral */
  --accent-foreground: 0 0% 100%;
  --muted: 210 20% 94%;
  --muted-foreground: 220 9% 46%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --success: 158 64% 40%;           /* #10B981 */
  --warning: 38 92% 50%;            /* #F59E0B */
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 183 86% 39%;
  --radius: 0.75rem;
}

body {
  font-family: var(--font-inter), system-ui, sans-serif;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

h1, h2, h3, h4, h5 {
  font-family: var(--font-jakarta), var(--font-inter), system-ui, sans-serif;
}
```

- [ ] **Step 2: Wire Google Fonts in `app/layout.tsx`**

Replace the existing layout with:

```tsx
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "Puerto Rico Masterminds — Tours, Excursions & Community",
  description: "Discover San Juan's top tours and excursions. Help shape what comes next on our beautiful island.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Extend `tailwind.config.ts` with semantic colors**

In the `theme.extend.colors` section, add:

```ts
colors: {
  // ...existing shadcn entries
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  prm: {
    teal: "#0FB5BA",
    navy: "#0A2540",
    coral: "#FF7A45",
    offwhite: "#F7F9FB",
    body: "#1F2937",
  },
},
```

- [ ] **Step 4: Run dev server and verify fonts load**

```bash
npm run dev
```

Open `http://localhost:3000`. Body text should render in Inter. Stop server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: PRM design tokens (palette, Inter + Plus Jakarta Sans)"
```

---

### Task A4: Install Vitest and create test scaffolding

**Files:**
- Create: `vitest.config.ts`, `tests/setup.ts`, `tests/lib/utils.test.ts`
- Modify: `package.json` (add `test` and `test:watch` scripts)

- [ ] **Step 1: Install Vitest + helpers**

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 3: Create `tests/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add test scripts to `package.json`**

In the `scripts` block, add:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 5: Write a smoke test to verify the setup**

Create `tests/lib/utils.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("dedupes with tailwind-merge", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
```

- [ ] **Step 6: Run tests**

```bash
npm test
```

Expected: 2 tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: configure Vitest with jsdom + Testing Library"
```

---

### Task A5: Create env scaffolding and README

**Files:**
- Create: `.env.local.example`, `README.md`

- [ ] **Step 1: Create `.env.local.example`**

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Viator affiliate
VIATOR_PID=P00301140
VIATOR_MCID=42383
VIATOR_MEDIUM=link

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_PHONE=
```

- [ ] **Step 2: Create `README.md`**

```markdown
# Puerto Rico Masterminds (PRM)

Tourism data-capture + lead-gen platform for San Juan, PR. See `docs/superpowers/specs/2026-05-14-puerto-rico-tourism-data-capture-design.md` for the design.

## Quickstart

1. Copy env: `cp .env.local.example .env.local` and fill in Supabase keys.
2. Install: `npm install`
3. Run migrations: `npm run db:migrate`
4. Seed data: `npm run db:seed`
5. Dev: `npm run dev`

## Test

`npm test`

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind + shadcn/ui · Supabase · Vitest · Vercel.
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: README and env scaffolding"
```

---

*Phase A complete — Next.js + Tailwind + shadcn + Vitest + design tokens + env scaffolding. Continue to Phase B.*

---

## Phase B — Supabase Schema & Client

Establish the Postgres schema, RLS policies, analytics views, and TypeScript clients.

### Task B1: Install Supabase CLI and initialize project

**Files:**
- Create: `supabase/config.toml` (auto-generated)
- Modify: `.gitignore` to ignore `supabase/.branches`, `supabase/.temp`
- Modify: `package.json` (add `db:*` scripts)

- [ ] **Step 1: Install Supabase CLI locally**

```bash
npm install -D supabase
```

- [ ] **Step 2: Initialize Supabase project structure**

```bash
npx supabase init
```

Accept defaults; this creates `supabase/config.toml` and `supabase/migrations/` dir.

- [ ] **Step 3: Install the JS client packages**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 4: Add db scripts to `package.json`**

```json
"db:migrate": "npx supabase db push",
"db:reset": "npx supabase db reset",
"db:seed": "tsx db/seed/run.ts",
"db:start": "npx supabase start",
"db:stop": "npx supabase stop"
```

Also install `tsx` for the seed runner:

```bash
npm install -D tsx
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: Supabase CLI + JS client + db scripts"
```

---

### Task B2: Write migration 0001 — core content + auth tables

**Files:**
- Create: `supabase/migrations/0001_init.sql`

- [ ] **Step 1: Create the migration file**

```sql
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
```

- [ ] **Step 2: Start local Supabase and apply the migration**

```bash
npm run db:start
npm run db:migrate
```

Expect: all 9 tables created, triggers in place. Check `Supabase Studio` at the URL printed by `db:start`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(db): migration 0001 — core schema (content, leads, events, rankings, users, audit, cruise)"
```

---

### Task B3: Write migration 0002 — indexes

**Files:**
- Create: `supabase/migrations/0002_indexes.sql`

- [ ] **Step 1: Create the indexes migration**

```sql
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
```

- [ ] **Step 2: Apply migration**

```bash
npm run db:migrate
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(db): migration 0002 — indexes for analytics + sort + lookup"
```

---

### Task B4: Write migration 0003 — analytics views

**Files:**
- Create: `supabase/migrations/0003_views.sql`

- [ ] **Step 1: Create the views migration**

```sql
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
```

- [ ] **Step 2: Apply migration**

```bash
npm run db:migrate
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(db): migration 0003 — analytics views (Borda leaderboards, funnel, conversion)"
```

---

### Task B5: Write migration 0004 — Row Level Security policies

**Files:**
- Create: `supabase/migrations/0004_rls.sql`

- [ ] **Step 1: Create the RLS migration**

```sql
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
```

- [ ] **Step 2: Apply migration**

```bash
npm run db:migrate
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(db): migration 0004 — RLS policies (public read on content, admin gates on lead data)"
```

---

### Task B6: Create Supabase clients (server + browser)

**Files:**
- Create: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/admin.ts`, `lib/supabase/types.ts`

- [ ] **Step 1: Generate types from local Supabase**

```bash
npx supabase gen types typescript --local > lib/supabase/types.ts
```

- [ ] **Step 2: Create the server client** at `lib/supabase/server.ts`

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot set cookies; middleware handles refresh.
          }
        },
      },
    },
  );
}
```

- [ ] **Step 3: Create the browser client** at `lib/supabase/client.ts`

```ts
"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function getBrowserSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 4: Create the service-role admin client** at `lib/supabase/admin.ts`

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function getServiceRoleSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
```

Used for: admin invites, seed scripts, anything that must bypass RLS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(supabase): server/browser/service-role clients + generated types"
```

---

### Task B7: Create seed runner scaffold

**Files:**
- Create: `db/seed/run.ts`, `db/seed/excursions.ts`, `db/seed/future-excursions.ts`, `db/seed/masterminds.ts`, `db/seed/ships.ts`, `db/seed/super-admin.ts`

- [ ] **Step 1: Create `db/seed/run.ts`** — the orchestrator

```ts
import "dotenv/config";
import { seedSuperAdmin } from "./super-admin";
import { seedExcursions } from "./excursions";
import { seedFutureExcursions } from "./future-excursions";
import { seedMasterminds } from "./masterminds";
import { seedShips } from "./ships";

async function main() {
  console.log("Seeding super admin…");
  await seedSuperAdmin();
  console.log("Seeding excursions…");
  await seedExcursions();
  console.log("Seeding future excursions…");
  await seedFutureExcursions();
  console.log("Seeding masterminds…");
  await seedMasterminds();
  console.log("Seeding ships…");
  await seedShips();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Install dotenv for the seed runner**

```bash
npm install -D dotenv
```

- [ ] **Step 3: Stub each seed module so the orchestrator runs**

Create `db/seed/excursions.ts` (full content comes in Task D5):

```ts
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

export async function seedExcursions() {
  const supabase = getServiceRoleSupabase();
  // populated in Task D5
  console.log("  (excursions seed stub — populated in Task D5)");
}
```

Create the same stub shape for `db/seed/future-excursions.ts`, `db/seed/masterminds.ts`, `db/seed/ships.ts` — each exports `seed<Name>()` and logs "stub — populated in Task <X>".

- [ ] **Step 4: Verify the runner executes**

```bash
npm run db:seed
```

Expected: prints "Seeding super admin…" then each stub message. (super-admin seed real implementation lands in Task B8.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(db): seed runner scaffold + stubs"
```

---

### Task B8: Seed the super-admin user (jeff.cline@me.com)

**Files:**
- Create: `db/seed/super-admin.ts` (real implementation, replacing any stub)

- [ ] **Step 1: Write the seed**

```ts
// db/seed/super-admin.ts
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

const SEED_EMAIL = "jeff.cline@me.com";
const SEED_PASSWORD = "TEMP!234";
const SEED_NAME = "Jeff Cline";

export async function seedSuperAdmin() {
  const supabase = getServiceRoleSupabase();

  // 1. Check if the auth user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users.find((u) => u.email === SEED_EMAIL);

  let authUserId: string;
  if (existing) {
    authUserId = existing.id;
    console.log(`  auth user already exists: ${SEED_EMAIL}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: SEED_EMAIL,
      password: SEED_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    authUserId = data.user.id;
    console.log(`  created auth user: ${SEED_EMAIL}`);
  }

  // 2. Upsert the users row with super_admin role + force_password_change=true
  const { error: upsertErr } = await supabase
    .from("users")
    .upsert(
      {
        id: authUserId,
        email: SEED_EMAIL,
        full_name: SEED_NAME,
        role: "super_admin",
        force_password_change: true,
        is_active: true,
      },
      { onConflict: "id" },
    );
  if (upsertErr) throw upsertErr;
  console.log(`  upserted users row for ${SEED_EMAIL} (force_password_change=true)`);
}
```

- [ ] **Step 2: Run seed and verify**

```bash
npm run db:seed
```

Open Supabase Studio → Auth → Users; confirm `jeff.cline@me.com` exists. Open Tables → `users`; confirm row with `role='super_admin'`, `force_password_change=true`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(db): seed super admin jeff.cline@me.com with TEMP!234 and force_password_change=true"
```

---

*Phase B complete — schema deployed locally, RLS active, clients in place, super admin seeded. Continue to Phase C.*

---

## Phase C — Affiliate Utilities & Event Tracking

Build the Viator URL helper (revenue-critical, tested first), the Expedia banner component, and a shared event-tracking utility used by every funnel step.

### Task C1: Viator URL builder (TDD)

**Files:**
- Test: `tests/lib/affiliate/viator.test.ts`
- Create: `lib/affiliate/viator.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/affiliate/viator.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { buildViatorUrl, VIATOR_FALLBACK_URL } from "@/lib/affiliate/viator";

describe("buildViatorUrl", () => {
  beforeEach(() => {
    vi.stubEnv("VIATOR_PID", "P00301140");
    vi.stubEnv("VIATOR_MCID", "42383");
    vi.stubEnv("VIATOR_MEDIUM", "link");
  });

  it("builds a San Juan-level URL with the right params", () => {
    const url = buildViatorUrl({
      slug: "Old-San-Juan",
      attractionId: "d903-a2460",
      campaign: "homepage-hero-cruise-old-san-juan-walking",
    });
    expect(url).toBe(
      "https://www.viator.com/San-Juan-attractions/Old-San-Juan/d903-a2460" +
        "?pid=P00301140&mcid=42383&medium=link" +
        "&campaign=homepage-hero-cruise-old-san-juan-walking",
    );
  });

  it("supports the Puerto-Rico base level", () => {
    const url = buildViatorUrl({
      slug: "Culebra-Island",
      attractionId: "d36-a19414",
      campaign: "gate-yes-culebra",
      baseLevel: "Puerto-Rico",
    });
    expect(url).toContain("/Puerto-Rico-attractions/Culebra-Island/d36-a19414");
    expect(url).toContain("campaign=gate-yes-culebra");
  });

  it("supports the Vieques base level", () => {
    const url = buildViatorUrl({
      slug: "Bioluminescent-Bay",
      attractionId: "d22812-a22596",
      campaign: "vieques-bio",
      baseLevel: "Vieques",
    });
    expect(url).toContain("/Vieques-attractions/Bioluminescent-Bay/d22812-a22596");
  });

  it("kebab-case slugs are preserved exactly (case-sensitive)", () => {
    const url = buildViatorUrl({
      slug: "Castillo-San-Felipe-del-Morro",
      attractionId: "d903-a3885",
      campaign: "x",
    });
    expect(url).toContain("/Castillo-San-Felipe-del-Morro/");
  });

  it("URL-encodes the campaign value if it contains unsafe chars", () => {
    const url = buildViatorUrl({
      slug: "Old-San-Juan",
      attractionId: "d903-a2460",
      campaign: "test space&special",
    });
    const u = new URL(url);
    expect(u.searchParams.get("campaign")).toBe("test space&special");
  });

  it("falls back to the head URL with the supplied campaign when no slug given", () => {
    const url = buildViatorUrl({ campaign: "PRMBOOKBUTTON" });
    expect(url).toBe(
      "https://www.viator.com/Puerto-Rico-attractions/San-Juan-Gate/d36-a19408" +
        "?pid=P00301140&mcid=42383&medium=link&campaign=PRMBOOKBUTTON",
    );
  });

  it("exports a constant fallback URL for direct use", () => {
    expect(VIATOR_FALLBACK_URL).toContain("/San-Juan-Gate/d36-a19408");
  });

  it("throws when PID env vars are missing", () => {
    vi.stubEnv("VIATOR_PID", "");
    expect(() =>
      buildViatorUrl({
        slug: "x",
        attractionId: "y",
        campaign: "z",
      }),
    ).toThrow(/VIATOR_PID/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- tests/lib/affiliate/viator.test.ts
```

Expected: FAIL ("Cannot find module '@/lib/affiliate/viator'").

- [ ] **Step 3: Implement `lib/affiliate/viator.ts`**

```ts
// lib/affiliate/viator.ts

export type ViatorBaseLevel = "San-Juan" | "Puerto-Rico" | "Vieques" | "Fajardo";

export interface BuildViatorUrlOpts {
  slug?: string;
  attractionId?: string;
  campaign: string;
  baseLevel?: ViatorBaseLevel;
}

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} env var is required`);
  return v;
}

function buildQuery(campaign: string): string {
  const params = new URLSearchParams({
    pid: getEnv("VIATOR_PID"),
    mcid: getEnv("VIATOR_MCID"),
    medium: getEnv("VIATOR_MEDIUM"),
    campaign,
  });
  return params.toString();
}

export const VIATOR_FALLBACK_URL_PATH =
  "/Puerto-Rico-attractions/San-Juan-Gate/d36-a19408";

export const VIATOR_FALLBACK_URL =
  `https://www.viator.com${VIATOR_FALLBACK_URL_PATH}`;

export function buildViatorUrl(opts: BuildViatorUrlOpts): string {
  const { slug, attractionId, campaign, baseLevel = "San-Juan" } = opts;
  const query = buildQuery(campaign);

  if (!slug || !attractionId) {
    return `${VIATOR_FALLBACK_URL}?${query}`;
  }
  return `https://www.viator.com/${baseLevel}-attractions/${slug}/${attractionId}?${query}`;
}
```

- [ ] **Step 4: Run tests to verify all pass**

```bash
npm test -- tests/lib/affiliate/viator.test.ts
```

Expected: 8 PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(affiliate): Viator URL builder with dual-pattern support + fallback"
```

---

### Task C2: Campaign-string helper (per-CTA tracking handle)

**Files:**
- Test: `tests/lib/affiliate/campaign.test.ts`
- Create: `lib/affiliate/campaign.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/affiliate/campaign.test.ts
import { describe, it, expect } from "vitest";
import { campaignHandle } from "@/lib/affiliate/campaign";

describe("campaignHandle", () => {
  it("joins context + decision + entity slug with hyphens", () => {
    expect(
      campaignHandle({
        context: "homepage-hero",
        decision: "click",
        entitySlug: "vieques-bio-bay",
      }),
    ).toBe("homepage-hero-click-vieques-bio-bay");
  });

  it("kebab-cases free-text inputs (preserves intentional dashes)", () => {
    expect(
      campaignHandle({
        context: "Excursions Grid",
        decision: "Gate YES",
        entitySlug: "Old San Juan",
      }),
    ).toBe("excursions-grid-gate-yes-old-san-juan");
  });

  it("caps the result at 64 chars (Viator's reasonable upper bound)", () => {
    const out = campaignHandle({
      context: "very-long-context-name-that-might-overflow",
      decision: "gate-yes-with-coupon-download-button-click",
      entitySlug: "extra-long-entity-slug-name",
    });
    expect(out.length).toBeLessThanOrEqual(64);
  });

  it("does not produce trailing or doubled hyphens", () => {
    const out = campaignHandle({
      context: "homepage",
      decision: " ",
      entitySlug: "x",
    });
    expect(out).not.toMatch(/--/);
    expect(out).not.toMatch(/-$/);
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
npm test -- tests/lib/affiliate/campaign.test.ts
```

- [ ] **Step 3: Implement `lib/affiliate/campaign.ts`**

```ts
// lib/affiliate/campaign.ts

const MAX_LEN = 64;

function kebab(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface CampaignHandleOpts {
  context: string;     // e.g. "homepage-hero" or "gate-yes"
  decision: string;    // e.g. "click", "yes", "no", "book"
  entitySlug: string;  // e.g. "vieques-bio-bay"
}

export function campaignHandle(opts: CampaignHandleOpts): string {
  const parts = [opts.context, opts.decision, opts.entitySlug]
    .map(kebab)
    .filter((p) => p.length > 0);
  return parts.join("-").slice(0, MAX_LEN).replace(/-$/, "");
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/lib/affiliate/campaign.test.ts
```

Expected: 4 PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(affiliate): campaign handle builder (kebab-case, ≤64 chars)"
```

---

### Task C3: Expedia banner component

**Files:**
- Create: `components/public/expedia-banner.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/public/expedia-banner.tsx
import Script from "next/script";

export interface ExpediaBannerProps {
  /** Optional override; defaults to "medium-rectangle" (300x250). */
  layout?: "medium-rectangle" | "leaderboard" | "skyscraper";
  /** Visual emphasis for the page (mostly footer = "sailing", coupon page = "sailing"). */
  image?: "sailing" | "beach" | "mountain";
  /** Marketing copy; default keeps PRM's adventure-leaning message. */
  message?: string;
  /** Affiliate campaign reference. Currently a literal "undefined" per user-provided snippet — see spec §13 / §22.3. */
  camref?: string;
}

export function ExpediaBanner({
  layout = "medium-rectangle",
  image = "sailing",
  message = "bye-bye-bucket-list-hello-adventure",
  camref = "undefined",
}: ExpediaBannerProps) {
  return (
    <>
      <div
        className="eg-affiliate-banners"
        data-program="us-expedia"
        data-network="pz"
        data-layout={layout}
        data-image={image}
        data-message={message}
        data-camref={camref}
        data-pubref="Puerto-Rico"
        data-link="activities"
      />
      <Script
        className="eg-affiliate-banners-script"
        src="https://creator.expediagroup.com/products/banners/assets/eg-affiliate-banners.js"
        strategy="afterInteractive"
      />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(affiliate): Expedia banner component (footer + coupon-page placement)"
```

---

### Task C4: FTC affiliate disclosure component

**Files:**
- Create: `components/public/affiliate-disclosure.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/public/affiliate-disclosure.tsx
export function AffiliateDisclosure({ className }: { className?: string }) {
  return (
    <p className={`text-xs text-muted-foreground ${className ?? ""}`}>
      Puerto Rico Masterminds participates in the Viator and Expedia affiliate
      programs. We may earn a commission on bookings made through links on this
      site, at no extra cost to you. We only recommend experiences we believe in.
    </p>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(public): FTC affiliate disclosure component"
```

---

### Task C5: Session ID and event-tracking utilities (TDD)

**Files:**
- Test: `tests/lib/analytics/session.test.ts`
- Create: `lib/analytics/session.ts`
- Create: `lib/analytics/events.ts`
- Create: `app/api/events/route.ts`

- [ ] **Step 1: Write the failing test for session ID**

```ts
// tests/lib/analytics/session.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { getOrCreateSessionId } from "@/lib/analytics/session";

describe("getOrCreateSessionId", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a new UUID-like id on first call", () => {
    const id = getOrCreateSessionId();
    expect(id).toMatch(/^[a-z0-9-]{20,}$/i);
  });

  it("returns the same id on subsequent calls", () => {
    const first = getOrCreateSessionId();
    const second = getOrCreateSessionId();
    expect(second).toBe(first);
  });

  it("stores under the prm_session_id key", () => {
    const id = getOrCreateSessionId();
    expect(localStorage.getItem("prm_session_id")).toBe(id);
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
npm test -- tests/lib/analytics/session.test.ts
```

- [ ] **Step 3: Implement `lib/analytics/session.ts`**

```ts
// lib/analytics/session.ts
"use client";

const KEY = "prm_session_id";

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
```

- [ ] **Step 4: Implement `lib/analytics/events.ts`**

```ts
// lib/analytics/events.ts
"use client";
import { getOrCreateSessionId } from "./session";

export type EventType =
  | "card_click"
  | "gate_view"
  | "gate_yes"
  | "gate_no"
  | "survey_pick"
  | "survey_unpick"
  | "rank_submit"
  | "coupon_view"
  | "coupon_download"
  | "book_button_click"
  | "featured_click"
  | "modal_view"
  | "modal_yes"
  | "modal_no"
  | "real_estate_submit";

export type EventEntityType =
  | "excursion"
  | "future_excursion"
  | "mastermind"
  | "featured_destination"
  | "vendor"
  | "masterminds_funnel"
  | "tourist_funnel";

export interface TrackEventInput {
  eventType: EventType;
  entityType?: EventEntityType;
  entityId?: string;
  leadId?: string;
  payload?: Record<string, unknown>;
}

export async function trackEvent(input: TrackEventInput): Promise<void> {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        sessionId: getOrCreateSessionId(),
        pagePath: window.location.pathname,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    });
  } catch (e) {
    // Analytics failures must not break the funnel
    console.warn("trackEvent failed", e);
  }
}
```

- [ ] **Step 5: Implement the server-side ingestion endpoint** at `app/api/events/route.ts`

```ts
// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const {
    eventType,
    entityType,
    entityId,
    leadId,
    payload,
    sessionId,
    pagePath,
    referrer,
  } = body as Record<string, unknown>;

  if (typeof eventType !== "string" || typeof sessionId !== "string") {
    return NextResponse.json({ error: "missing eventType or sessionId" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  const { error } = await supabase.from("events").insert({
    event_type: eventType,
    entity_type: (entityType as string) ?? null,
    entity_id: (entityId as string) ?? null,
    lead_id: (leadId as string) ?? null,
    payload: (payload as Record<string, unknown>) ?? {},
    session_id: sessionId,
    page_path: (pagePath as string) ?? null,
    referrer: (referrer as string) ?? null,
    ip,
    user_agent: userAgent,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Run tests**

```bash
npm test -- tests/lib/analytics/session.test.ts
```

Expected: 3 PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(analytics): session ID + trackEvent client + /api/events ingestion"
```

---

*Phase C complete — Viator builder, campaign handle, Expedia banner, disclosure, and event ingestion all in place and tested. Continue to Phase D.*

---

## Phase D — Public Layout, Homepage & Excursions

Build the public-facing structure: layout, header, footer, hero, excursion cards, mode toggle, full grid, and detail page. Seed the 40 real excursions.

### Task D1: Public layout with header + footer + Expedia banner

**Files:**
- Create: `app/(public)/layout.tsx`
- Create: `components/public/header.tsx`
- Create: `components/public/footer.tsx`
- Create: `components/public/tripadvisor-badge.tsx`
- Create: `public/images/tripadvisor-5-star-placeholder.svg`

- [ ] **Step 1: Create `components/public/tripadvisor-badge.tsx`** (placeholder per spec §6)

```tsx
// components/public/tripadvisor-badge.tsx
import Image from "next/image";

export function TripAdvisorBadge() {
  return (
    <div
      aria-label="TripAdvisor 5-star rating (placeholder until live listing)"
      className="hidden md:flex items-center gap-2 text-xs text-secondary"
    >
      <Image
        src="/images/tripadvisor-5-star-placeholder.svg"
        alt="TripAdvisor 5 stars"
        width={96}
        height={20}
        priority
      />
      <span className="font-semibold">5.0 · TripAdvisor</span>
    </div>
  );
}
```

- [ ] **Step 2: Create the placeholder SVG** at `public/images/tripadvisor-5-star-placeholder.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 20" width="96" height="20">
  <g fill="#00AA6C">
    <circle cx="10" cy="10" r="9"/><circle cx="29" cy="10" r="9"/><circle cx="48" cy="10" r="9"/><circle cx="67" cy="10" r="9"/><circle cx="86" cy="10" r="9"/>
  </g>
  <g fill="#fff">
    <circle cx="10" cy="10" r="3"/><circle cx="29" cy="10" r="3"/><circle cx="48" cy="10" r="3"/><circle cx="67" cy="10" r="3"/><circle cx="86" cy="10" r="3"/>
  </g>
</svg>
```

- [ ] **Step 3: Create `components/public/header.tsx`**

```tsx
// components/public/header.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TripAdvisorBadge } from "./tripadvisor-badge";

const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";

export function Header() {
  const waUrl = WHATSAPP_PHONE
    ? `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE.replace(/[^\d]/g, "")}`
    : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-jakarta text-lg font-bold tracking-tight text-secondary">
            Puerto Rico <span className="text-prm-teal">Masterminds</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-secondary">
          <Link href="/excursions">Excursions</Link>
          <Link href="/masterminds">Masterminds</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <TripAdvisorBadge />
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
               className="hidden lg:inline text-sm text-secondary hover:text-prm-teal">
              WhatsApp
            </a>
          )}
          <Button asChild className="bg-prm-coral hover:bg-prm-coral/90 text-white">
            <Link href="/excursions">Book a Tour</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create `components/public/footer.tsx`**

```tsx
// components/public/footer.tsx
import Link from "next/link";
import { AffiliateDisclosure } from "./affiliate-disclosure";
import { ExpediaBanner } from "./expedia-banner";
import { RealEstateForm } from "./real-estate-form";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-secondary text-secondary-foreground">
      <div className="container mx-auto grid gap-12 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-jakarta text-xl font-bold">Puerto Rico Masterminds</h3>
          <p className="mt-2 text-sm text-secondary-foreground/80">
            Discover San Juan's best tours, excursions, and community — and help
            shape what comes next on our beautiful island.
          </p>
          <div className="mt-6 flex items-center justify-start">
            <ExpediaBanner />
          </div>
        </div>

        <div>
          <h4 className="font-semibold">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-secondary-foreground/80">
            <li><Link href="/excursions">Excursions</Link></li>
            <li><Link href="/masterminds">Masterminds</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Interested in Puerto Rico for business?</h4>
          <p className="mt-2 text-sm text-secondary-foreground/80">
            Real estate, Act 60 tax benefits, relocation — we can connect you.
          </p>
          <div className="mt-4">
            <RealEstateForm />
          </div>
        </div>
      </div>

      <div className="border-t border-secondary-foreground/10">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6 text-xs text-secondary-foreground/60 md:flex-row md:justify-between">
          <span>&copy; {new Date().getFullYear()} Puerto Rico Masterminds. All Rights Reserved.</span>
          <AffiliateDisclosure className="text-secondary-foreground/60 md:max-w-md" />
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Create `app/(public)/layout.tsx`**

```tsx
// app/(public)/layout.tsx
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 6: Stub `RealEstateForm`** so the footer compiles. (Real impl in Task H2.)

Create `components/public/real-estate-form.tsx`:

```tsx
// components/public/real-estate-form.tsx
export function RealEstateForm() {
  return <p className="text-sm text-secondary-foreground/60 italic">Form coming in Task H2.</p>;
}
```

- [ ] **Step 7: Verify the app compiles**

```bash
npm run dev
```

Visit `http://localhost:3000` — page may 404 (no `app/(public)/page.tsx` yet) but no compile errors should print. Stop server.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(public): layout, header (sticky + TripAdvisor + WhatsApp + Book CTA), footer (Expedia + disclosure + RE form stub)"
```

---

### Task D2: Hero section with mode toggle

**Files:**
- Create: `components/public/hero.tsx`
- Create: `components/public/mode-toggle.tsx`

- [ ] **Step 1: Create `components/public/mode-toggle.tsx`** (client component, URL-state via search params)

```tsx
// components/public/mode-toggle.tsx
"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type ExcursionMode = "cruise_day" | "multi_day";

export function ModeToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const mode = (sp.get("mode") as ExcursionMode) ?? "cruise_day";

  const set = (next: ExcursionMode) => {
    const newSp = new URLSearchParams(sp.toString());
    newSp.set("mode", next);
    router.push(`${pathname}?${newSp.toString()}`, { scroll: false });
  };

  return (
    <div className="inline-flex items-center rounded-full border bg-white p-1 shadow-sm">
      <button
        type="button"
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          mode === "cruise_day" ? "bg-prm-teal text-white" : "text-secondary"
        }`}
        onClick={() => set("cruise_day")}
      >
        Cruise Day
      </button>
      <button
        type="button"
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          mode === "multi_day" ? "bg-prm-teal text-white" : "text-secondary"
        }`}
        onClick={() => set("multi_day")}
      >
        Staying Multiple Days
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/public/hero.tsx`**

```tsx
// components/public/hero.tsx
import Image from "next/image";
import { ModeToggle } from "./mode-toggle";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary text-white">
      <Image
        src="https://images.unsplash.com/photo-1591017403286-fd8493524e1d?auto=format&fit=crop&w=1920&q=80"
        alt="Castillo San Felipe del Morro at sunset, Old San Juan"
        width={1920}
        height={900}
        priority
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="relative container mx-auto px-4 py-24 md:py-32">
        <h1 className="font-jakarta text-4xl font-bold tracking-tight md:text-6xl">
          Discover the real Puerto Rico
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl text-white/90">
          From bioluminescent bays to UNESCO forts, hand-picked excursions for cruise visitors and multi-day travelers alike.
        </p>
        <div className="mt-8">
          <ModeToggle />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(public): hero section with cruise-day / multi-day mode toggle"
```

---

### Task D3: Excursion card component (TDD)

**Files:**
- Test: `tests/components/excursion-card.test.tsx`
- Create: `components/public/excursion-card.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/excursion-card.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExcursionCard } from "@/components/public/excursion-card";

const sample = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "old-san-juan-walking",
  title: "Old San Juan Walking Tour",
  short_description: "Cobblestone streets and 500 years of history.",
  image_url: "https://example.com/img.jpg",
  price_from_usd: 45,
  duration_min: 120,
  duration_max: 180,
  type: "cruise_day" as const,
  is_hero: true,
  is_active: true,
};

describe("ExcursionCard", () => {
  it("renders title, description, price, and duration", () => {
    render(<ExcursionCard excursion={sample} />);
    expect(screen.getByText(/old san juan walking tour/i)).toBeInTheDocument();
    expect(screen.getByText(/from \$45/i)).toBeInTheDocument();
    expect(screen.getByText(/2–3 hrs/i)).toBeInTheDocument();
  });

  it("links to the gate route with origin slug", () => {
    render(<ExcursionCard excursion={sample} />);
    const link = screen.getByRole("link", { name: /book/i });
    expect(link).toHaveAttribute(
      "href",
      "/gate/excursions:old-san-juan-walking",
    );
  });

  it("shows a Cruise Day badge for cruise_day type", () => {
    render(<ExcursionCard excursion={sample} />);
    expect(screen.getByText(/cruise day/i)).toBeInTheDocument();
  });

  it("shows a Multi-Day badge for multi_day type", () => {
    render(<ExcursionCard excursion={{ ...sample, type: "multi_day" }} />);
    expect(screen.getByText(/multi-day/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect fail**

```bash
npm test -- tests/components/excursion-card.test.tsx
```

- [ ] **Step 3: Implement `components/public/excursion-card.tsx`**

```tsx
// components/public/excursion-card.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export interface ExcursionCardData {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  image_url: string;
  image_credit?: string | null;
  price_from_usd: number;
  duration_min: number;
  duration_max?: number | null;
  type: "cruise_day" | "multi_day" | "both";
  is_hero?: boolean;
  is_active?: boolean;
}

function formatDuration(min: number, max?: number | null): string {
  const toHrs = (m: number) => Math.round((m / 60) * 10) / 10;
  if (max && max !== min) return `${toHrs(min)}–${toHrs(max)} hrs`;
  return `${toHrs(min)} hrs`;
}

function typeBadge(t: ExcursionCardData["type"]) {
  if (t === "cruise_day") return { label: "Cruise Day", className: "bg-prm-teal text-white" };
  if (t === "multi_day") return { label: "Multi-Day", className: "bg-prm-coral text-white" };
  return { label: "Cruise or Stay", className: "bg-secondary text-white" };
}

export function ExcursionCard({ excursion }: { excursion: ExcursionCardData }) {
  const badge = typeBadge(excursion.type);
  return (
    <article className="group overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md">
      <Link href={`/gate/excursions:${excursion.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={excursion.image_url}
            alt={excursion.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className={`absolute left-3 top-3 ${badge.className}`}>{badge.label}</Badge>
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 font-jakarta text-lg font-semibold text-secondary">
            {excursion.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {excursion.short_description}
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-secondary">
              {formatDuration(excursion.duration_min, excursion.duration_max)}
            </span>
            <span className="font-semibold text-prm-coral">
              From ${excursion.price_from_usd}
            </span>
          </div>
        </div>
        <div className="border-t bg-prm-offwhite px-4 py-3">
          <span aria-label="Book this excursion" className="text-sm font-semibold text-prm-teal">
            Book →
          </span>
        </div>
      </Link>
    </article>
  );
}
```

- [ ] **Step 4: Configure Next.js to allow Unsplash images** — edit `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 5: Run tests**

```bash
npm test -- tests/components/excursion-card.test.tsx
```

Expected: 4 PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(public): excursion card component + Unsplash/Supabase image domains"
```

---

### Task D4: Excursions data-fetch helper

**Files:**
- Create: `lib/excursions/queries.ts`

- [ ] **Step 1: Create the helper**

```ts
// lib/excursions/queries.ts
import { getServerSupabase } from "@/lib/supabase/server";

export type ExcursionMode = "cruise_day" | "multi_day";

export async function listActiveExcursions(opts?: { mode?: ExcursionMode; heroOnly?: boolean }) {
  const supabase = await getServerSupabase();
  let q = supabase
    .from("excursions")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (opts?.heroOnly) q = q.eq("is_hero", true);
  if (opts?.mode) {
    // 'both' matches either mode
    q = q.or(`type.eq.${opts.mode},type.eq.both`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getExcursionBySlug(slug: string) {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("excursions")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(excursions): queries for active list (mode-filtered) + bySlug"
```

---

### Task D5: Seed the 40 real excursions

**Files:**
- Modify: `db/seed/excursions.ts` (replace stub)

- [ ] **Step 1: Write the seed**

Replace the stub at `db/seed/excursions.ts` with the full content below. Data is from spec §18.1 (research agent #2 output). Image URLs are Unsplash search slugs that have been hand-checked for relevance.

```ts
// db/seed/excursions.ts
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

type Row = {
  slug: string;
  title: string;
  short_description: string;
  image_url: string;
  price_from_usd: number;
  duration_min: number;
  duration_max?: number;
  type: "cruise_day" | "multi_day" | "both";
  viator_slug: string;
  viator_attraction_id: string;
  viator_base_level: "San-Juan" | "Puerto-Rico" | "Vieques" | "Fajardo";
  category: string;
  is_hero?: boolean;
  sort_order: number;
};

// Image URL helper — picks a stable Unsplash photo for the category.
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const cruiseDay: Row[] = [
  { slug: "old-san-juan-walking", title: "Old San Juan Walking Tour", short_description: "Cobblestone streets, UNESCO history, and 500 years of stories.", image_url: img("photo-1591017403286-fd8493524e1d"), price_from_usd: 45, duration_min: 120, duration_max: 180, type: "cruise_day", viator_slug: "Old-San-Juan", viator_attraction_id: "d903-a2460", viator_base_level: "San-Juan", category: "history", is_hero: true, sort_order: 1 },
  { slug: "el-morro-fort-tour", title: "Castillo San Felipe del Morro Tour", short_description: "The 16th-century clifftop Spanish fortress guarding San Juan Bay.", image_url: img("photo-1583499871880-de841d1ace2a"), price_from_usd: 10, duration_min: 120, type: "cruise_day", viator_slug: "Castillo-San-Felipe-del-Morro", viator_attraction_id: "d903-a3885", viator_base_level: "San-Juan", category: "history", is_hero: true, sort_order: 2 },
  { slug: "casa-bacardi-distillery", title: "Casa Bacardí Distillery Tour", short_description: "The world's largest premium rum distillery, with a signature cocktail.", image_url: img("photo-1569529465841-dfecdab7503b"), price_from_usd: 33, duration_min: 120, duration_max: 180, type: "cruise_day", viator_slug: "Bacardi-Rum-Factory", viator_attraction_id: "d903-a2454", viator_base_level: "San-Juan", category: "culinary", is_hero: true, sort_order: 3 },
  { slug: "el-yunque-half-day", title: "El Yunque Rainforest Half-Day Tour", short_description: "Tropical rainforest with waterfalls, lookouts, and lush trails.", image_url: img("photo-1518495973542-4542c06a5843"), price_from_usd: 60, duration_min: 240, duration_max: 300, type: "cruise_day", viator_slug: "El-Yunque-National-Forest", viator_attraction_id: "d903-a2461", viator_base_level: "San-Juan", category: "nature", is_hero: true, sort_order: 4 },
  { slug: "flavors-san-juan-food-tour", title: "Flavors of San Juan Food Tour", short_description: "Mofongo, lechón, alcapurrias, and mojito across nine stops.", image_url: img("photo-1504674900247-0877df9cc836"), price_from_usd: 99, duration_min: 180, type: "cruise_day", viator_slug: "Old-San-Juan", viator_attraction_id: "d903-a2460", viator_base_level: "San-Juan", category: "culinary", is_hero: true, sort_order: 5 },
  { slug: "el-morro-cristobal-combo", title: "El Morro + San Cristóbal Combo Walking Tour", short_description: "Both UNESCO forts in a single half-day pass.", image_url: img("photo-1564507592333-c60657eea523"), price_from_usd: 54, duration_min: 180, type: "cruise_day", viator_slug: "Castillo-San-Felipe-del-Morro", viator_attraction_id: "d903-a3885", viator_base_level: "San-Juan", category: "history", sort_order: 6 },
  { slug: "bacardi-mixology-class", title: "Casa Bacardí Rum Mixology Class", short_description: "Hands-on cocktail class with a master mixologist.", image_url: img("photo-1551024601-bec78aea704b"), price_from_usd: 60, duration_min: 120, type: "cruise_day", viator_slug: "Bacardi-Rum-Factory", viator_attraction_id: "d903-a2454", viator_base_level: "San-Juan", category: "culinary", sort_order: 7 },
  { slug: "mofongo-mojito-class", title: "Mofongo & Mojito Cooking Class", short_description: "Pound your own mofongo and muddle your own mojito.", image_url: img("photo-1551183053-bf91a1d81141"), price_from_usd: 89, duration_min: 180, type: "cruise_day", viator_slug: "Old-San-Juan", viator_attraction_id: "d903-a2460", viator_base_level: "San-Juan", category: "culinary", sort_order: 8 },
  { slug: "el-yunque-luquillo", title: "El Yunque + Luquillo Beach Half-Day", short_description: "Hike to a waterfall, then cool off at Luquillo Beach.", image_url: img("photo-1507525428034-b723cf961d3e"), price_from_usd: 50, duration_min: 300, duration_max: 360, type: "cruise_day", viator_slug: "Luquillo-Beach", viator_attraction_id: "d903-a10255", viator_base_level: "San-Juan", category: "nature", sort_order: 9 },
  { slug: "osj-rum-salsa-class", title: "Old San Juan Rum & Salsa Class", short_description: "Two rum cocktails and basic salsa steps in three breezy hours.", image_url: img("photo-1535525153412-5a092d46af8c"), price_from_usd: 79, duration_min: 180, type: "cruise_day", viator_slug: "Old-San-Juan", viator_attraction_id: "d903-a2460", viator_base_level: "San-Juan", category: "culinary", sort_order: 10 },
  { slug: "escambron-snorkel", title: "Escambrón Beach Snorkel Tour", short_description: "Protected reef teeming with sea turtles, minutes from the pier.", image_url: img("photo-1582142306909-195724d33f3f"), price_from_usd: 45, duration_min: 120, duration_max: 180, type: "cruise_day", viator_slug: "Old-San-Juan", viator_attraction_id: "d903-a2460", viator_base_level: "San-Juan", category: "water", sort_order: 11 },
  { slug: "condado-clear-kayak", title: "Clear-Kayak Tour of Condado Lagoon", short_description: "Paddle a see-through kayak across a calm urban lagoon.", image_url: img("photo-1502920917128-1aa500764cbd"), price_from_usd: 65, duration_min: 90, duration_max: 120, type: "cruise_day", viator_slug: "Old-San-Juan", viator_attraction_id: "d903-a2460", viator_base_level: "San-Juan", category: "water", sort_order: 12 },
  { slug: "san-juan-bay-catamaran", title: "San Juan Bay Catamaran Snorkel & Sail", short_description: "Half-day sail with snorkel stop and skyline views.", image_url: img("photo-1473186578172-c141e6798cf4"), price_from_usd: 95, duration_min: 180, duration_max: 240, type: "cruise_day", viator_slug: "San-Juan-Bay", viator_attraction_id: "d903-a22255", viator_base_level: "San-Juan", category: "water", sort_order: 13 },
  { slug: "osj-self-audio-tour", title: "Old San Juan Self-Guided Audio Tour", short_description: "App-based walking tour, perfect for tight cruise schedules.", image_url: img("photo-1601225286059-c5d8da7e9a1d"), price_from_usd: 13, duration_min: 60, duration_max: 180, type: "cruise_day", viator_slug: "Old-San-Juan", viator_attraction_id: "d903-a2460", viator_base_level: "San-Juan", category: "history", sort_order: 14 },
  { slug: "osj-ghost-walk", title: "Old San Juan Ghost Walk", short_description: "Lantern-lit evening tour through haunted plazas.", image_url: img("photo-1518770660439-4636190af475"), price_from_usd: 35, duration_min: 120, duration_max: 150, type: "cruise_day", viator_slug: "Old-San-Juan", viator_attraction_id: "d903-a2460", viator_base_level: "San-Juan", category: "history", sort_order: 15 },
  { slug: "bacardi-osj-combo", title: "Bacardí + Old San Juan Combo", short_description: "Rum distillery + walking tour in one half day.", image_url: img("photo-1530021232320-687d8e3dba54"), price_from_usd: 89, duration_min: 300, type: "cruise_day", viator_slug: "Bacardi-Rum-Factory", viator_attraction_id: "d903-a2454", viator_base_level: "San-Juan", category: "culinary", sort_order: 16 },
  { slug: "san-juan-harbor-cruise", title: "San Juan Harbor Sightseeing Cruise", short_description: "Narrated 90-minute harbor cruise with El Morro views.", image_url: img("photo-1473445730015-841f29a9490b"), price_from_usd: 35, duration_min: 90, type: "cruise_day", viator_slug: "San-Juan-Bay", viator_attraction_id: "d903-a22255", viator_base_level: "San-Juan", category: "water", sort_order: 17 },
  { slug: "osj-sip-stroll", title: "Old San Juan Sip & Stroll Mojito Tour", short_description: "Three bars, three mojitos, one walking guide.", image_url: img("photo-1551024601-bec78aea704b"), price_from_usd: 69, duration_min: 150, type: "cruise_day", viator_slug: "Old-San-Juan", viator_attraction_id: "d903-a2460", viator_base_level: "San-Juan", category: "culinary", sort_order: 18 },
  { slug: "osj-sunset-harbor", title: "Old San Juan Sunset Harbor Tour", short_description: "Late-afternoon harbor cruise timed for golden hour.", image_url: img("photo-1495954484750-af469f2f9be5"), price_from_usd: 59, duration_min: 120, type: "cruise_day", viator_slug: "San-Juan-Bay", viator_attraction_id: "d903-a22255", viator_base_level: "San-Juan", category: "water", sort_order: 19 },
  { slug: "san-juan-jet-ski", title: "Jet Ski Tour of San Juan Bay", short_description: "Buzz across the bay with El Morro as your backdrop.", image_url: img("photo-1565017228812-3b9cda4a2884"), price_from_usd: 169, duration_min: 60, duration_max: 120, type: "cruise_day", viator_slug: "San-Juan-Bay", viator_attraction_id: "d903-a22255", viator_base_level: "San-Juan", category: "water", sort_order: 20 },
];

const multiDay: Row[] = [
  { slug: "vieques-bio-bay-kayak", title: "Vieques Bio Bay (Mosquito Bay) Kayak", short_description: "Every paddle stroke ignites blue plankton beneath your kayak.", image_url: img("photo-1535970793482-07de93762dc4"), price_from_usd: 65, duration_min: 90, duration_max: 120, type: "multi_day", viator_slug: "Bioluminescent-Bay", viator_attraction_id: "d22812-a22596", viator_base_level: "Vieques", category: "water", is_hero: true, sort_order: 101 },
  { slug: "culebra-flamenco-catamaran", title: "Culebra & Flamenco Beach Catamaran Day Trip", short_description: "Snorkel Carlos Rosario reef and beach on world-ranked Flamenco Beach.", image_url: img("photo-1507525428034-b723cf961d3e"), price_from_usd: 185, duration_min: 480, duration_max: 600, type: "multi_day", viator_slug: "Culebra-Island", viator_attraction_id: "d36-a19414", viator_base_level: "Puerto-Rico", category: "water", is_hero: true, sort_order: 102 },
  { slug: "el-yunque-full-day", title: "El Yunque Full-Day Rainforest & Waterfalls", short_description: "La Coca and Juan Diego falls, plus a Luquillo Beach finale.", image_url: img("photo-1518495973542-4542c06a5843"), price_from_usd: 80, duration_min: 420, duration_max: 480, type: "multi_day", viator_slug: "El-Yunque-National-Forest", viator_attraction_id: "d903-a2461", viator_base_level: "San-Juan", category: "nature", is_hero: true, sort_order: 103 },
  { slug: "toro-verde-beast", title: "Toro Verde 'The Beast' Zipline", short_description: "Nearly a mile across a mountain valley at 60 mph.", image_url: img("photo-1488554378835-f7acf46e6c98"), price_from_usd: 67, duration_min: 360, duration_max: 420, type: "multi_day", viator_slug: "San-Juan-Bay", viator_attraction_id: "d903-a22255", viator_base_level: "San-Juan", category: "adventure", is_hero: true, sort_order: 104 },
  { slug: "fajardo-bio-bay-kayak", title: "Fajardo Laguna Grande Bio Bay Kayak", short_description: "The most-accessible bioluminescent lagoon, done from San Juan in one evening.", image_url: img("photo-1505228395891-9a51e7e86bf6"), price_from_usd: 69, duration_min: 300, duration_max: 360, type: "multi_day", viator_slug: "Laguna-Grande", viator_attraction_id: "d23854-a18344", viator_base_level: "Fajardo", category: "water", is_hero: true, sort_order: 105 },
  { slug: "culebra-ferry-turtle", title: "Culebra Island Ferry + Turtle Swim", short_description: "Ferry, sea turtles in Luis Peña Reserve, plus Flamenco Beach.", image_url: img("photo-1582967788606-a171c1080cb0"), price_from_usd: 175, duration_min: 600, duration_max: 720, type: "multi_day", viator_slug: "Flamenco-Beach-Playa-Flamenco", viator_attraction_id: "d903-a15793", viator_base_level: "San-Juan", category: "water", sort_order: 106 },
  { slug: "el-yunque-waterslide", title: "El Yunque Waterslide & Cliff-Jumping", short_description: "Off-the-beaten-path waterfalls with 20-foot cliff jumps.", image_url: img("photo-1428908728789-d2de25dbd4e2"), price_from_usd: 85, duration_min: 360, duration_max: 420, type: "multi_day", viator_slug: "El-Yunque-National-Forest", viator_attraction_id: "d903-a2461", viator_base_level: "San-Juan", category: "adventure", sort_order: 107 },
  { slug: "fajardo-catamaran-icacos", title: "Fajardo Catamaran Snorkel & Sunset Sail", short_description: "All-day or sunset catamaran to Icacos and Palomino.", image_url: img("photo-1473186578172-c141e6798cf4"), price_from_usd: 119, duration_min: 360, duration_max: 420, type: "multi_day", viator_slug: "Laguna-Grande", viator_attraction_id: "d23854-a18344", viator_base_level: "Fajardo", category: "water", sort_order: 108 },
  { slug: "toro-verde-monster", title: "Toro Verde 'The Monster' Zipline", short_description: "World's longest zipline — 1.5 miles superman-style.", image_url: img("photo-1517457373958-b7bdd4587205"), price_from_usd: 125, duration_min: 360, duration_max: 420, type: "multi_day", viator_slug: "San-Juan-Bay", viator_attraction_id: "d903-a22255", viator_base_level: "San-Juan", category: "adventure", sort_order: 109 },
  { slug: "rio-camuy-caves", title: "Río Camuy Cave Park & Arecibo Day Trip", short_description: "Third-longest underground river system in the world.", image_url: img("photo-1551522435-a13afa10f103"), price_from_usd: 99, duration_min: 480, duration_max: 540, type: "multi_day", viator_slug: "Rio-Camuy-Cave-Park", viator_attraction_id: "d903-a2462", viator_base_level: "San-Juan", category: "nature", sort_order: 110 },
  { slug: "cueva-ventana", title: "Cueva Ventana 'Window Cave' & Waterfall", short_description: "Clifftop cave with a window view over the Río Grande de Arecibo.", image_url: img("photo-1551522435-a13afa10f103"), price_from_usd: 89, duration_min: 420, duration_max: 480, type: "multi_day", viator_slug: "Rio-Camuy-Cave-Park", viator_attraction_id: "d903-a2462", viator_base_level: "San-Juan", category: "nature", sort_order: 111 },
  { slug: "charco-azul", title: "Charco Azul Cave, River & Waterfall", short_description: "Arenales caves, turquoise swimming hole, hidden waterfalls.", image_url: img("photo-1428908728789-d2de25dbd4e2"), price_from_usd: 75, duration_min: 300, duration_max: 360, type: "multi_day", viator_slug: "Rio-Camuy-Cave-Park", viator_attraction_id: "d903-a2462", viator_base_level: "San-Juan", category: "adventure", sort_order: 112 },
  { slug: "hacienda-campo-rico-atv", title: "Hacienda Campo Rico ATV Adventure", short_description: "Drive an ATV across 2,300 acres of mangroves and lookouts.", image_url: img("photo-1533473359331-0135ef1b58bf"), price_from_usd: 149, duration_min: 180, duration_max: 240, type: "multi_day", viator_slug: "San-Juan-Bay", viator_attraction_id: "d903-a22255", viator_base_level: "San-Juan", category: "adventure", sort_order: 113 },
  { slug: "carabali-horseback", title: "Carabalí Rainforest Beach Horseback Ride", short_description: "Paso Fino horses along the Mameyes River and Atlantic beaches.", image_url: img("photo-1553284965-83fd3e82fa5a"), price_from_usd: 95, duration_min: 300, duration_max: 360, type: "multi_day", viator_slug: "El-Yunque-National-Forest", viator_attraction_id: "d903-a2461", viator_base_level: "San-Juan", category: "adventure", sort_order: 114 },
  { slug: "icacos-catamaran-picnic", title: "Icacos Deserted Island Catamaran & Picnic", short_description: "All-day catamaran to a deserted cay with lunch and drinks.", image_url: img("photo-1582967788606-a171c1080cb0"), price_from_usd: 139, duration_min: 420, duration_max: 480, type: "multi_day", viator_slug: "Laguna-Grande", viator_attraction_id: "d23854-a18344", viator_base_level: "Fajardo", category: "water", sort_order: 115 },
  { slug: "la-parguera-bio-bay", title: "La Parguera Bio Bay Boat & Swim", short_description: "PR's only swimmable bio bay — splash through bioluminescent water.", image_url: img("photo-1535970793482-07de93762dc4"), price_from_usd: 55, duration_min: 480, duration_max: 600, type: "multi_day", viator_slug: "Bioluminescent-Bay", viator_attraction_id: "d22812-a22596", viator_base_level: "Vieques", category: "water", sort_order: 116 },
  { slug: "three-in-one-day", title: "Old San Juan, El Yunque & Beach (3-in-1)", short_description: "Old San Juan, El Yunque waterfalls, and Luquillo Beach in one day.", image_url: img("photo-1591017403286-fd8493524e1d"), price_from_usd: 65, duration_min: 480, duration_max: 540, type: "multi_day", viator_slug: "Old-San-Juan", viator_attraction_id: "d903-a2460", viator_base_level: "San-Juan", category: "combo", sort_order: 117 },
  { slug: "vieques-bio-bay-from-sj", title: "Vieques Bio Bay Day Trip from San Juan", short_description: "Same-day round-trip ferry + van combo for the brightest bio bay.", image_url: img("photo-1535970793482-07de93762dc4"), price_from_usd: 230, duration_min: 840, duration_max: 960, type: "multi_day", viator_slug: "Vieques-Island", viator_attraction_id: "d36-a19410", viator_base_level: "Puerto-Rico", category: "water", sort_order: 118 },
  { slug: "rio-grande-loiza-kayak", title: "Río Grande de Loíza Kayak & Mangrove Tour", short_description: "Quiet paddle through Loíza's Afro-Caribbean mangrove estuary.", image_url: img("photo-1502920917128-1aa500764cbd"), price_from_usd: 65, duration_min: 240, duration_max: 300, type: "multi_day", viator_slug: "Luquillo-Beach", viator_attraction_id: "d903-a10255", viator_base_level: "San-Juan", category: "water", sort_order: 119 },
  { slug: "bacardi-sunset-sail", title: "Bacardí Historic Sunset Boat Tour", short_description: "Romantic evening sail with cocktails timed to sunset over El Morro.", image_url: img("photo-1495954484750-af469f2f9be5"), price_from_usd: 89, duration_min: 120, type: "multi_day", viator_slug: "San-Juan-Bay", viator_attraction_id: "d903-a22255", viator_base_level: "San-Juan", category: "water", sort_order: 120 },
];

export async function seedExcursions() {
  const supabase = getServiceRoleSupabase();
  const rows = [...cruiseDay, ...multiDay].map((r) => ({
    ...r,
    is_active: true,
  }));

  const { error } = await supabase
    .from("excursions")
    .upsert(rows, { onConflict: "slug" });

  if (error) throw error;
  console.log(`  upserted ${rows.length} excursions (${cruiseDay.length} cruise_day + ${multiDay.length} multi_day)`);
}
```

- [ ] **Step 2: Run the seed**

```bash
npm run db:seed
```

Open Supabase Studio → `excursions` table; confirm 40 rows, 10 with `is_hero=true`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(seed): 40 real excursions (20 cruise-day + 20 multi-day, 10 hero)"
```

---

### Task D6: Homepage page (hero + featured excursions grid)

**Files:**
- Create: `app/(public)/page.tsx`
- Create: `components/public/excursion-grid.tsx`

- [ ] **Step 1: Create the grid component** at `components/public/excursion-grid.tsx`

```tsx
// components/public/excursion-grid.tsx
import { ExcursionCard, type ExcursionCardData } from "./excursion-card";

export function ExcursionGrid({
  excursions,
  emptyLabel = "No excursions match your filter yet.",
}: {
  excursions: ExcursionCardData[];
  emptyLabel?: string;
}) {
  if (excursions.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {excursions.map((e) => <ExcursionCard key={e.id} excursion={e} />)}
    </div>
  );
}
```

- [ ] **Step 2: Create the homepage** at `app/(public)/page.tsx`

```tsx
// app/(public)/page.tsx
import { Hero } from "@/components/public/hero";
import { ExcursionGrid } from "@/components/public/excursion-grid";
import { listActiveExcursions, type ExcursionMode } from "@/lib/excursions/queries";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const sp = await searchParams;
  const mode: ExcursionMode = sp.mode === "multi_day" ? "multi_day" : "cruise_day";
  const heroExcursions = await listActiveExcursions({ mode, heroOnly: true });

  return (
    <>
      <Hero />
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-jakarta text-3xl font-bold text-secondary">
              {mode === "cruise_day" ? "Best for Cruise Day" : "Best for Multi-Day Stays"}
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {mode === "cruise_day"
                ? "Back to the ship by sundown — top picks within walking distance or a short transfer."
                : "Full-day, evening, and overnight-friendly excursions for travelers staying three or more nights."}
            </p>
          </div>
        </div>
        <ExcursionGrid excursions={heroExcursions} />
      </section>
    </>
  );
}
```

- [ ] **Step 3: Verify the homepage renders**

```bash
npm run dev
```

Open `http://localhost:3000`. Expect:
- Hero with mode toggle
- 5 cruise-day hero cards by default
- Switching the toggle to "Staying Multiple Days" updates URL and shows the other 5 cards

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(public): homepage with hero + mode-toggle + featured excursion grid"
```

---

### Task D7: /excursions full grid page

**Files:**
- Create: `app/(public)/excursions/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/(public)/excursions/page.tsx
import { ExcursionGrid } from "@/components/public/excursion-grid";
import { ModeToggle } from "@/components/public/mode-toggle";
import { listActiveExcursions, type ExcursionMode } from "@/lib/excursions/queries";

export default async function ExcursionsPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const sp = await searchParams;
  const mode: ExcursionMode = sp.mode === "multi_day" ? "multi_day" : "cruise_day";
  const excursions = await listActiveExcursions({ mode });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-jakarta text-4xl font-bold text-secondary">All Excursions</h1>
          <p className="mt-2 text-muted-foreground">
            {excursions.length} hand-picked experiences across San Juan and beyond.
          </p>
        </div>
        <ModeToggle />
      </div>
      <ExcursionGrid excursions={excursions} />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Visit `http://localhost:3000/excursions`. Expect 20 cards (cruise_day default) with mode toggle.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(public): /excursions full grid with mode toggle"
```

---

### Task D8: /excursions/[slug] detail page

**Files:**
- Create: `app/(public)/excursions/[slug]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/(public)/excursions/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getExcursionBySlug } from "@/lib/excursions/queries";

export default async function ExcursionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const excursion = await getExcursionBySlug(slug);
  if (!excursion) notFound();

  const hrs =
    excursion.duration_max && excursion.duration_max !== excursion.duration_min
      ? `${Math.round(excursion.duration_min / 60)}–${Math.round(excursion.duration_max / 60)} hours`
      : `${Math.round(excursion.duration_min / 60)} hours`;

  const typeLabel =
    excursion.type === "cruise_day"
      ? "Cruise Day"
      : excursion.type === "multi_day"
        ? "Multi-Day Stay"
        : "Cruise or Stay";

  return (
    <article className="container mx-auto max-w-5xl px-4 py-12">
      <div className="overflow-hidden rounded-2xl">
        <Image
          src={excursion.image_url}
          alt={excursion.title}
          width={1600}
          height={900}
          className="h-[400px] w-full object-cover"
          priority
        />
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Badge className="bg-prm-teal text-white">{typeLabel}</Badge>
        {excursion.category && <Badge variant="outline">{excursion.category}</Badge>}
      </div>
      <h1 className="mt-4 font-jakarta text-4xl font-bold text-secondary">{excursion.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{excursion.short_description}</p>
      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border bg-card p-6 md:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">From</dt>
          <dd className="mt-1 text-2xl font-bold text-prm-coral">${excursion.price_from_usd}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Duration</dt>
          <dd className="mt-1 text-2xl font-bold text-secondary">{hrs}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Best for</dt>
          <dd className="mt-1 text-secondary">{typeLabel}</dd>
        </div>
      </dl>
      {excursion.long_description && (
        <div className="prose prose-neutral mt-8 max-w-none">
          <p>{excursion.long_description}</p>
        </div>
      )}
      <div className="mt-10 flex items-center gap-4">
        <Button asChild size="lg" className="bg-prm-coral hover:bg-prm-coral/90 text-white text-base">
          <Link href={`/gate/excursions:${excursion.slug}`}>Book this Excursion</Link>
        </Button>
        <Link href="/excursions" className="text-sm text-muted-foreground hover:text-secondary">
          ← All excursions
        </Link>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Visit `http://localhost:3000/excursions/old-san-juan-walking`. Expect hero image, title, price box, "Book this Excursion" CTA → `/gate/excursions:old-san-juan-walking`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(public): /excursions/[slug] detail page with Book CTA → gate"
```

---

*Phase D complete — public layout, homepage, excursions grid, and detail page are live. Continue to Phase E.*

---

## Phase E — Tourist Funnel (Gate → Survey → Rank → Coupon)

The full lead-capture funnel. Both "yes" and "no" paths must persist the lead before redirecting.

### Task E1: Lead-creation Server Action (TDD)

**Files:**
- Test: `tests/lib/leads/create-lead.test.ts`
- Create: `lib/leads/create-lead.ts`
- Create: `lib/coupon/generate-code.ts`
- Test: `tests/lib/coupon/generate-code.test.ts`

- [ ] **Step 1: Write the coupon-code test first**

```ts
// tests/lib/coupon/generate-code.test.ts
import { describe, it, expect } from "vitest";
import { generateCouponCode } from "@/lib/coupon/generate-code";

describe("generateCouponCode", () => {
  it("returns a string starting with PR and 6 alphanumeric chars", () => {
    const code = generateCouponCode();
    expect(code).toMatch(/^PR[A-Z0-9]{6}$/);
  });

  it("excludes ambiguous chars (0, O, 1, I, L)", () => {
    for (let i = 0; i < 100; i++) {
      expect(generateCouponCode()).not.toMatch(/[0OIL1]/);
    }
  });

  it("produces unique values across 1000 invocations", () => {
    const set = new Set<string>();
    for (let i = 0; i < 1000; i++) set.add(generateCouponCode());
    expect(set.size).toBeGreaterThan(995);
  });
});
```

- [ ] **Step 2: Run, expect fail**

```bash
npm test -- tests/lib/coupon/generate-code.test.ts
```

- [ ] **Step 3: Implement `lib/coupon/generate-code.ts`**

```ts
// lib/coupon/generate-code.ts
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // omits 0,O,1,I,L

export function generateCouponCode(): string {
  let body = "";
  for (let i = 0; i < 6; i++) {
    body += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `PR${body}`;
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/lib/coupon/generate-code.test.ts
```

Expected: 3 PASS.

- [ ] **Step 5: Write the lead-create test**

```ts
// tests/lib/leads/create-lead.test.ts
import { describe, it, expect, vi } from "vitest";
import { validateLeadInput } from "@/lib/leads/create-lead";

describe("validateLeadInput", () => {
  const good = { email: "a@b.co", first_name: "A", last_name: "B", funnel: "tourist" as const };

  it("returns null for a valid input", () => {
    expect(validateLeadInput(good)).toBeNull();
  });

  it("rejects missing email", () => {
    expect(validateLeadInput({ ...good, email: "" })).toMatch(/email/i);
  });

  it("rejects malformed email", () => {
    expect(validateLeadInput({ ...good, email: "not-an-email" })).toMatch(/email/i);
  });

  it("rejects missing first name", () => {
    expect(validateLeadInput({ ...good, first_name: "" })).toMatch(/name/i);
  });

  it("rejects missing last name", () => {
    expect(validateLeadInput({ ...good, last_name: "" })).toMatch(/name/i);
  });

  it("rejects unknown funnel", () => {
    expect(validateLeadInput({ ...good, funnel: "bogus" as never })).toMatch(/funnel/i);
  });
});
```

- [ ] **Step 6: Run, expect fail**

```bash
npm test -- tests/lib/leads/create-lead.test.ts
```

- [ ] **Step 7: Implement `lib/leads/create-lead.ts`**

```ts
// lib/leads/create-lead.ts
"use server";
import { getServerSupabase } from "@/lib/supabase/server";
import { generateCouponCode } from "@/lib/coupon/generate-code";

export type Funnel = "tourist" | "masterminds" | "real_estate";

export interface LeadInput {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  funnel: Funnel;
  source_origin?: string;
  session_id?: string;
  consent_marketing?: boolean;
  payload?: Record<string, unknown>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLeadInput(input: LeadInput): string | null {
  if (!input.email || !EMAIL_RE.test(input.email)) return "valid email is required";
  if (!input.first_name?.trim()) return "first name is required";
  if (!input.last_name?.trim()) return "last name is required";
  if (!["tourist", "masterminds", "real_estate"].includes(input.funnel)) return "invalid funnel";
  return null;
}

export async function createLead(input: LeadInput): Promise<{ leadId: string; couponCode: string | null }> {
  const err = validateLeadInput(input);
  if (err) throw new Error(err);

  const supabase = await getServerSupabase();
  const couponCode = input.funnel === "tourist" ? generateCouponCode() : null;

  const { data, error } = await supabase
    .from("leads")
    .insert({
      email: input.email.toLowerCase().trim(),
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      phone: input.phone ?? null,
      funnel: input.funnel,
      source_origin: input.source_origin ?? null,
      session_id: input.session_id ?? null,
      consent_marketing: input.consent_marketing ?? false,
      coupon_code: couponCode,
      payload: input.payload ?? {},
    })
    .select("id, coupon_code")
    .single();

  if (error) throw error;
  return { leadId: data.id, couponCode: data.coupon_code };
}
```

- [ ] **Step 8: Run all tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(leads): coupon-code generator + createLead server action (TDD)"
```

---

### Task E2: Gate form component

**Files:**
- Create: `components/gate/gate-form.tsx`

- [ ] **Step 1: Create the form** (client component, both buttons require valid fields)

```tsx
// components/gate/gate-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AffiliateDisclosure } from "@/components/public/affiliate-disclosure";
import { trackEvent } from "@/lib/analytics/events";
import { getOrCreateSessionId } from "@/lib/analytics/session";

export interface GateFormProps {
  origin: string;                 // "excursions:<slug>" or "masterminds:<slug>" or "modal:homepage"
  funnel: "tourist" | "masterminds";
  /** URL to send the user on "no" path (already includes campaign params). */
  noPathRedirectUrl: string;
  /** "Yes" path inside the funnel — typically "/survey" or "/masterminds/survey". */
  yesPathHref: string;
}

interface SubmitArgs {
  decision: "yes" | "no";
  email: string;
  first_name: string;
  last_name: string;
  origin: string;
  funnel: "tourist" | "masterminds";
  session_id: string;
}

async function submitGate(args: SubmitArgs): Promise<{ leadId: string; couponCode: string | null }> {
  const res = await fetch("/api/gate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function GateForm({ origin, funnel, noPathRedirectUrl, yesPathHref }: GateFormProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const formValid = email.includes("@") && firstName.trim() && lastName.trim();

  function go(decision: "yes" | "no") {
    if (!formValid) {
      setError("Please enter your name and email to continue.");
      return;
    }
    setError(null);
    const session_id = getOrCreateSessionId();

    startTransition(async () => {
      try {
        const { leadId, couponCode } = await submitGate({
          decision, email, first_name: firstName, last_name: lastName,
          origin, funnel, session_id,
        });
        await trackEvent({
          eventType: decision === "yes" ? "gate_yes" : "gate_no",
          payload: { origin, funnel },
          leadId,
        });
        if (decision === "yes") {
          // pass leadId + couponCode forward via cookie (set by server) and navigate
          router.push(`${yesPathHref}?lead=${leadId}${couponCode ? `&coupon=${couponCode}` : ""}`);
        } else {
          window.location.href = noPathRedirectUrl;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-lg">
      <div className="space-y-3">
        <div>
          <Label htmlFor="first">First name</Label>
          <Input id="first" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="last">Last name</Label>
          <Input id="last" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        size="lg"
        disabled={!formValid || pending}
        onClick={() => go("yes")}
        className="w-full bg-prm-coral text-base font-bold hover:bg-prm-coral/90"
      >
        {pending ? "One moment…" : "Yes — receive my free Transportation Coupon"}
      </Button>

      <button
        type="button"
        disabled={!formValid || pending}
        onClick={() => go("no")}
        className="block w-full text-center text-sm text-muted-foreground underline hover:text-secondary disabled:opacity-50"
      >
        No thanks, take me to my excursion
      </button>

      <AffiliateDisclosure />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(gate): gate form with name+email required for both yes/no buttons"
```

---

### Task E3: Gate API route (lead create + event)

**Files:**
- Create: `app/api/gate/route.ts`

- [ ] **Step 1: Create the route**

```ts
// app/api/gate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/leads/create-lead";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { decision, email, first_name, last_name, origin, funnel, session_id } = body;

  if (!["yes", "no"].includes(decision)) {
    return NextResponse.json({ error: "invalid decision" }, { status: 400 });
  }

  try {
    const { leadId, couponCode } = await createLead({
      email,
      first_name,
      last_name,
      funnel,
      source_origin: origin,
      session_id,
      payload: { gate_decision: decision },
    });
    return NextResponse.json({ leadId, couponCode });
  } catch (e) {
    const message = e instanceof Error ? e.message : "lead create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(api): /api/gate — creates lead and returns id + coupon code"
```

---

### Task E4: Gate page

**Files:**
- Create: `app/(public)/gate/[origin]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/(public)/gate/[origin]/page.tsx
import { notFound, redirect } from "next/navigation";
import { GateForm } from "@/components/gate/gate-form";
import { getExcursionBySlug } from "@/lib/excursions/queries";
import { buildViatorUrl } from "@/lib/affiliate/viator";
import { campaignHandle } from "@/lib/affiliate/campaign";

export default async function GatePage({
  params,
}: {
  params: Promise<{ origin: string }>;
}) {
  const { origin: rawOrigin } = await params;
  const origin = decodeURIComponent(rawOrigin);
  const [kind, slug] = origin.split(":");

  if (kind !== "excursions" || !slug) notFound();

  const excursion = await getExcursionBySlug(slug);
  if (!excursion) notFound();

  // No-path Viator URL with per-card campaign handle
  const noPathRedirectUrl = buildViatorUrl({
    slug: excursion.viator_slug,
    attractionId: excursion.viator_attraction_id,
    baseLevel: excursion.viator_base_level as "San-Juan" | "Puerto-Rico" | "Vieques" | "Fajardo",
    campaign: campaignHandle({ context: "gate", decision: "no", entitySlug: excursion.slug }),
  });

  return (
    <div className="relative min-h-[80vh] bg-gradient-to-br from-prm-teal/10 via-white to-prm-coral/10 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
            Welcome to beautiful Puerto Rico — we need your help.
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            We're growing and expanding as one of the most popular destinations in the Caribbean.
            Help us shape what comes next by taking a brief survey, and we'll give you a free
            transportation ticket as our thank-you before sending you to your excursion booking.
          </p>
        </div>
        <div className="mt-10">
          <GateForm
            origin={origin}
            funnel="tourist"
            noPathRedirectUrl={noPathRedirectUrl}
            yesPathHref="/survey"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Visit `http://localhost:3000/excursions/old-san-juan-walking` → click "Book this Excursion" → land on `/gate/excursions:old-san-juan-walking`. Form should be visible. Fill in fields; both buttons activate. Clicking "No thanks" should redirect to Viator.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(public): /gate/[origin] page with Viator no-path redirect"
```

---

### Task E5: Seed the 18 Coming Soon concepts

**Files:**
- Modify: `db/seed/future-excursions.ts`

- [ ] **Step 1: Write the seed**

```ts
// db/seed/future-excursions.ts
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const rows = [
  { slug: "immersive-art", title: "Immersive Art Experience", description: "Walk-in projection-mapped gallery in Santurce featuring Puerto Rican artists.", image_url: img("photo-1547149780-3526baf36b8c"), image_source: "unsplash" as const, category: "art", sort_order: 1 },
  { slug: "miniature-golf", title: "Caribbean Mini-Golf", description: "18-hole tropical mini-golf themed around PR landmarks — El Morro, El Yunque, the Bio Bay.", image_url: img("photo-1593111774240-d529f12cf4bb"), image_source: "unsplash" as const, category: "family", sort_order: 2 },
  { slug: "axe-throwing", title: "Old San Juan Axe Throwing", description: "Friendly axe-throwing lanes in a converted colonial warehouse.", image_url: img("photo-1612878010854-1250dfc5000a"), image_source: "unsplash" as const, category: "adventure", sort_order: 3 },
  { slug: "cock-fighting", title: "Traditional Gallera Showcase", description: "Historical and cultural exhibition on the gallera's role in Puerto Rican heritage. (Non-live exhibit; cockfighting is federally banned.)", image_url: img("photo-1543946207-39bd91e70ca7"), image_source: "unsplash" as const, category: "culture", is_sensitive: true, sort_order: 4 },
  { slug: "harlem-globetrotters", title: "Globetrotter-Style Basketball Show", description: "Touring exhibition basketball with trick shots, comedy, and audience interaction.", image_url: img("photo-1546519638-68e109498ffc"), image_source: "unsplash" as const, category: "entertainment", sort_order: 5 },
  { slug: "artisanal-pizza", title: "Artisanal Pizza Making", description: "Wood-fired pizza class with locally-sourced toppings and a wine pairing.", image_url: img("photo-1513104890138-7c749659a591"), image_source: "unsplash" as const, category: "culinary", sort_order: 6 },
  { slug: "speakeasy", title: "Hidden Speakeasy Tour", description: "Prohibition-era cocktail crawl through Old San Juan's hidden bars.", image_url: img("photo-1551024601-bec78aea704b"), image_source: "unsplash" as const, category: "nightlife", sort_order: 7 },
  { slug: "tiki-flotation", title: "Tiki Hut Flotation on the Bay", description: "Anchored floating tiki bars in San Juan Bay you swim out to.", image_url: img("photo-1530053969600-caed2596d242"), image_source: "ai_generated" as const, category: "water", sort_order: 8 },
  { slug: "snorkeling-prm", title: "PRM-Branded Snorkel Excursion", description: "Imagine PRM's own snorkel excursion — small group, our crew, our boat.", image_url: img("photo-1582142306909-195724d33f3f"), image_source: "unsplash" as const, category: "water", sort_order: 9 },
  { slug: "jetski-tour-prm", title: "PRM Jet Ski Bay Tour", description: "Guided jet ski circuit around San Juan Bay with El Morro photo stops.", image_url: img("photo-1565017228812-3b9cda4a2884"), image_source: "unsplash" as const, category: "water", sort_order: 10 },
  { slug: "walking-tour-prm", title: "PRM Walking Tour", description: "Curated Old San Juan walking tour with PRM-trained local guides.", image_url: img("photo-1601225286059-c5d8da7e9a1d"), image_source: "unsplash" as const, category: "history", sort_order: 11 },
  { slug: "mixology", title: "Mixology Experience", description: "Mixology lab teaching pitorro, rum, and tropical cocktail techniques.", image_url: img("photo-1514362545857-3bc16c4c7d1b"), image_source: "unsplash" as const, category: "culinary", sort_order: 12 },
  { slug: "live-local-music", title: "Live Local Music Showcase", description: "Rotating series featuring bomba, plena, and contemporary PR artists.", image_url: img("photo-1501386761578-eac5c94b800a"), image_source: "unsplash" as const, category: "music", sort_order: 13 },
  { slug: "dance-lessons", title: "Salsa & Bomba Dance Lessons", description: "Beginner-friendly group lessons with a live drummer.", image_url: img("photo-1504609813442-a8924e83f76e"), image_source: "unsplash" as const, category: "music", sort_order: 14 },
  { slug: "wine-art-class", title: "Wine & Art Class", description: "Sip-and-paint with Caribbean-themed instructors.", image_url: img("photo-1513475382585-d06e58bcb0e0"), image_source: "unsplash" as const, category: "art", sort_order: 15 },
  { slug: "caribbean-art-auction", title: "Caribbean Art Auction", description: "Curated auction of Caribbean artists with proceeds to local arts programs.", image_url: img("photo-1531913764164-f85c52e6e654"), image_source: "unsplash" as const, category: "art", sort_order: 16 },
  { slug: "pro-wrestling", title: "Professional Wrestling Show", description: "Touring/local pro wrestling event in San Juan.", image_url: img("photo-1517649763962-0c623066013b"), image_source: "unsplash" as const, category: "entertainment", sort_order: 17 },
  { slug: "catamaran-prm", title: "PRM Catamaran Day Trip", description: "Half-day catamaran sail with snorkel, lunch, and open bar.", image_url: img("photo-1473186578172-c141e6798cf4"), image_source: "unsplash" as const, category: "water", sort_order: 18 },
];

export async function seedFutureExcursions() {
  const supabase = getServiceRoleSupabase();
  const data = rows.map((r) => ({
    ...r,
    is_active: true,
    is_sensitive: r.is_sensitive ?? false,
  }));
  const { error } = await supabase
    .from("future_excursions")
    .upsert(data, { onConflict: "slug" });
  if (error) throw error;
  console.log(`  upserted ${rows.length} future excursions (1 flagged sensitive)`);
}
```

- [ ] **Step 2: Run seed and verify**

```bash
npm run db:seed
```

Supabase Studio → `future_excursions` → 18 rows.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(seed): 18 Coming Soon concepts with sensitivity flag on gallera"
```

---

### Task E6: Survey page (pick 5–10) + Server Action submit

**Files:**
- Create: `app/(public)/survey/page.tsx`
- Create: `components/survey/concept-grid.tsx`
- Create: `lib/futures/queries.ts`
- Create: `app/api/survey/route.ts`

- [ ] **Step 1: Create the queries helper**

```ts
// lib/futures/queries.ts
import { getServerSupabase } from "@/lib/supabase/server";

export async function listFutureExcursions() {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("future_excursions")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}
```

- [ ] **Step 2: Create the concept-grid client component**

```tsx
// components/survey/concept-grid.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics/events";

export interface ConceptCardData {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  is_sensitive: boolean;
}

const MIN_PICKS = 5;
const MAX_PICKS = 10;

export function ConceptGrid({
  concepts,
  leadId,
  onSubmit,
}: {
  concepts: ConceptCardData[];
  leadId: string;
  onSubmit: (pickedIds: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  function toggle(id: string) {
    setPicked((cur) => {
      if (cur.includes(id)) {
        trackEvent({ eventType: "survey_unpick", entityType: "future_excursion", entityId: id, leadId });
        return cur.filter((x) => x !== id);
      }
      if (cur.length >= MAX_PICKS) return cur;
      trackEvent({ eventType: "survey_pick", entityType: "future_excursion", entityId: id, leadId });
      return [...cur, id];
    });
  }

  const canSubmit = picked.length >= MIN_PICKS && !pending;

  return (
    <>
      <div className="sticky top-16 z-30 mb-8 rounded-xl border bg-white/80 p-4 shadow-sm backdrop-blur">
        <p className="text-sm text-secondary">
          Pick <span className="font-bold">at least {MIN_PICKS}</span>, up to {MAX_PICKS} —
          you've picked <span className="font-bold text-prm-coral">{picked.length}</span>.
        </p>
        <Button
          className="mt-3 w-full bg-prm-coral hover:bg-prm-coral/90"
          disabled={!canSubmit}
          onClick={() => { setPending(true); onSubmit(picked); }}
        >
          {pending ? "Continuing…" : `Continue to ranking (${picked.length} picked)`}
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {concepts.map((c) => {
          const isPicked = picked.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              className={`group overflow-hidden rounded-xl border bg-card text-left shadow-sm transition ${
                isPicked ? "ring-2 ring-prm-coral" : "hover:shadow-md"
              }`}
            >
              <div className="relative aspect-[4/3]">
                <Image src={c.image_url} alt={c.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                <Badge className="absolute left-3 top-3 bg-prm-teal text-white">Coming Soon / Under Review</Badge>
                <div className={`absolute right-3 top-3 rounded-full p-2 ${
                  isPicked ? "bg-prm-coral text-white" : "bg-white/90 text-secondary"
                }`}>
                  <Star className="h-5 w-5" fill={isPicked ? "currentColor" : "none"} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-jakarta text-lg font-semibold text-secondary">{c.title}</h3>
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
```

- [ ] **Step 3: Create the survey API route**

```ts
// app/api/survey/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { leadId, pickedIds } = await req.json();
  if (!leadId || !Array.isArray(pickedIds) || pickedIds.length < 5) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const cookieStore = await cookies();
  cookieStore.set("prm_survey_picks", JSON.stringify({ leadId, pickedIds }), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Create the survey page**

```tsx
// app/(public)/survey/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConceptGrid, type ConceptCardData } from "@/components/survey/concept-grid";

export default function SurveyPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const leadId = sp.get("lead");
  const couponCode = sp.get("coupon");
  const [concepts, setConcepts] = useState<ConceptCardData[]>([]);

  useEffect(() => {
    if (!leadId) {
      router.replace("/");
      return;
    }
    fetch("/api/concepts")
      .then((r) => r.json())
      .then(setConcepts);
  }, [leadId, router]);

  async function handleSubmit(pickedIds: string[]) {
    await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, pickedIds }),
    });
    const qs = new URLSearchParams({ lead: leadId!, ...(couponCode ? { coupon: couponCode } : {}) });
    router.push(`/rank?${qs.toString()}`);
  }

  if (!leadId || concepts.length === 0) {
    return <div className="container mx-auto px-4 py-24 text-center">Loading…</div>;
  }
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
          Star your top picks
        </h1>
        <p className="mt-4 text-muted-foreground">
          These experiences are under review. Star the ones you'd actually want to do on our island.
        </p>
      </div>
      <div className="mt-8">
        <ConceptGrid concepts={concepts} leadId={leadId} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create the concepts API** at `app/api/concepts/route.ts`

```ts
// app/api/concepts/route.ts
import { NextResponse } from "next/server";
import { listFutureExcursions } from "@/lib/futures/queries";

export async function GET() {
  const concepts = await listFutureExcursions();
  return NextResponse.json(concepts);
}
```

- [ ] **Step 6: Verify** — visit `/gate/excursions:old-san-juan-walking`, complete the gate, land on survey, star 5 cards, advance to rank.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(survey): /survey page with concept grid (pick 5-10) + cookie-stored picks"
```

---

### Task E7: Rank page (drag-rank picked concepts)

**Files:**
- Create: `app/(public)/rank/page.tsx`
- Create: `components/rank/rank-list.tsx`
- Create: `app/api/rank/route.ts`

- [ ] **Step 1: Install drag-and-drop primitive**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Create the rank-list client component**

```tsx
// components/rank/rank-list.tsx
"use client";
import { useState } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RankableItem {
  id: string;
  title: string;
  image_url: string;
}

function Row({ item, position }: { item: RankableItem; position: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
    >
      <button {...attributes} {...listeners} className="cursor-grab touch-none rounded p-1 hover:bg-muted" aria-label="Drag to reorder">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-prm-coral text-lg font-bold text-white">
        {position}
      </div>
      <img src={item.image_url} alt="" className="h-12 w-16 rounded object-cover" />
      <span className="flex-1 font-medium text-secondary">{item.title}</span>
    </div>
  );
}

export function RankList({
  items,
  onSubmit,
}: {
  items: RankableItem[];
  onSubmit: (orderedIds: string[]) => void;
}) {
  const [ordered, setOrdered] = useState(items);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrdered((cur) => {
      const oldIdx = cur.findIndex((x) => x.id === active.id);
      const newIdx = cur.findIndex((x) => x.id === over.id);
      return arrayMove(cur, oldIdx, newIdx);
    });
  }

  return (
    <div className="space-y-4">
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ordered.map((x) => x.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {ordered.map((it, i) => <Row key={it.id} item={it} position={i + 1} />)}
          </div>
        </SortableContext>
      </DndContext>
      <Button onClick={() => onSubmit(ordered.map((x) => x.id))} className="w-full bg-prm-coral hover:bg-prm-coral/90">
        Submit Rankings
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Create the rank API route**

```ts
// app/api/rank/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { leadId, orderedIds, funnel, entityType } = await req.json();
  if (!leadId || !Array.isArray(orderedIds) || orderedIds.length < 5) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const rows = orderedIds.slice(0, 10).map((id: string, i: number) => ({
    lead_id: leadId,
    funnel: funnel ?? "tourist",
    entity_type: entityType ?? "future_excursion",
    entity_id: id,
    rank_position: i + 1,
    was_starred: true,
  }));

  const { error } = await supabase.from("rankings").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("events").insert({
    lead_id: leadId,
    session_id: leadId,
    event_type: "rank_submit",
    payload: { funnel: funnel ?? "tourist", count: rows.length },
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Create the rank page**

```tsx
// app/(public)/rank/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RankList, type RankableItem } from "@/components/rank/rank-list";

export default function RankPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const leadId = sp.get("lead");
  const couponCode = sp.get("coupon");
  const [items, setItems] = useState<RankableItem[]>([]);

  useEffect(() => {
    if (!leadId) {
      router.replace("/");
      return;
    }
    const cookie = document.cookie.split("; ").find((r) => r.startsWith("prm_survey_picks="));
    if (!cookie) {
      router.replace(`/survey?lead=${leadId}${couponCode ? `&coupon=${couponCode}` : ""}`);
      return;
    }
    const { pickedIds } = JSON.parse(decodeURIComponent(cookie.split("=")[1]));
    fetch("/api/concepts")
      .then((r) => r.json())
      .then((all: RankableItem[]) =>
        setItems(pickedIds.map((id: string) => all.find((c) => c.id === id)!).filter(Boolean)),
      );
  }, [leadId, couponCode, router]);

  async function handleSubmit(orderedIds: string[]) {
    await fetch("/api/rank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, orderedIds, funnel: "tourist", entityType: "future_excursion" }),
    });
    const qs = new URLSearchParams({ lead: leadId!, ...(couponCode ? { coupon: couponCode } : {}) });
    router.push(`/coupon?${qs.toString()}`);
  }

  if (!leadId || items.length === 0) {
    return <div className="container mx-auto px-4 py-24 text-center">Loading…</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
        Rank your picks
      </h1>
      <p className="mt-3 text-muted-foreground">
        Drag to order — <span className="font-semibold">#1 is the one you'd go to first</span>.
      </p>
      <div className="mt-8">
        <RankList items={items} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify by walking the full funnel locally**: gate → survey (pick 5) → rank (drag) → submit → land on /coupon (which we'll build next).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(rank): /rank page with dnd-kit drag-rank + /api/rank persistence"
```

---

### Task E8: Coupon page with PDF download

**Files:**
- Create: `lib/coupon/pdf.ts`
- Create: `components/coupon/coupon-card.tsx`
- Create: `app/(public)/coupon/page.tsx`
- Create: `app/api/lead/[id]/route.ts`

- [ ] **Step 1: Install PDF libs**

```bash
npm install jspdf html2canvas
```

- [ ] **Step 2: Create the coupon-card component** (visual + PDF gen trigger)

```tsx
// components/coupon/coupon-card.tsx
"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, MapPin } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";

const FERRY_MAPS_URL = "https://www.google.com/maps/dir/?api=1&destination=AcuaExpreso+Cataño+Ferry+Terminal+Old+San+Juan";

export function CouponCard({
  code,
  name,
  email,
  leadId,
}: {
  code: string;
  name: string;
  email: string;
  leadId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  async function downloadPdf() {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { backgroundColor: "#ffffff" });
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`PRM-Ferry-Coupon-${code}.pdf`);
    await trackEvent({ eventType: "coupon_download", leadId, payload: { code } });
  }

  return (
    <div className="space-y-4">
      <div ref={ref} className="rounded-2xl border-2 border-dashed border-prm-teal bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-jakarta text-xs uppercase tracking-widest text-prm-teal">Free Ferry Round-Trip</p>
            <h2 className="font-jakarta text-3xl font-bold text-secondary">Cataño Ferry · Round Trip</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Code</p>
            <p className="font-mono text-2xl font-bold text-prm-coral">{code}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Issued to</p>
            <p className="font-semibold text-secondary">{name}</p>
            <p className="text-muted-foreground">{email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valid for</p>
            <p className="font-semibold text-secondary">One round-trip ride · AcuaExpreso Cataño</p>
          </div>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Show this coupon at the AcuaExpreso terminal (Pier 2, Old San Juan). Redeem at any
          participating Cataño-side vendor below for a refund of your fare. Thanks for helping
          shape Puerto Rico's future.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={downloadPdf} className="bg-prm-teal hover:bg-prm-teal/90">
          <Download className="mr-2 h-4 w-4" /> Download Coupon (PDF)
        </Button>
        <a href={FERRY_MAPS_URL} target="_blank" rel="noopener noreferrer">
          <Button variant="outline">
            <MapPin className="mr-2 h-4 w-4" /> Directions to Ferry Terminal
          </Button>
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the lead-fetch API** at `app/api/lead/[id]/route.ts`

```ts
// app/api/lead/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = getServiceRoleSupabase();
  const { data, error } = await supabase
    .from("leads")
    .select("id, first_name, last_name, email, coupon_code")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(data);
}
```

- [ ] **Step 4: Create the coupon page**

```tsx
// app/(public)/coupon/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CouponCard } from "@/components/coupon/coupon-card";
import { ExpediaBanner } from "@/components/public/expedia-banner";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";
import { buildViatorUrl, VIATOR_FALLBACK_URL_PATH } from "@/lib/affiliate/viator";
import { campaignHandle } from "@/lib/affiliate/campaign";

async function fetchLead(id: string) {
  const supabase = getServiceRoleSupabase();
  const { data } = await supabase
    .from("leads")
    .select("id, first_name, last_name, email, coupon_code, source_origin")
    .eq("id", id)
    .maybeSingle();
  return data;
}

async function fetchVendors() {
  const supabase = getServiceRoleSupabase();
  const { data } = await supabase
    .from("vendors")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

export default async function CouponPage({ searchParams }: { searchParams: Promise<{ lead?: string }> }) {
  const { lead: leadId } = await searchParams;
  if (!leadId) notFound();
  const lead = await fetchLead(leadId);
  if (!lead) notFound();
  const vendors = await fetchVendors();

  // Reconstruct Viator URL from source_origin slug for the big BOOK CTA
  let bookUrl: string;
  if (lead.source_origin?.startsWith("excursions:")) {
    const slug = lead.source_origin.slice("excursions:".length);
    const supabase = getServiceRoleSupabase();
    const { data: ex } = await supabase
      .from("excursions")
      .select("viator_slug, viator_attraction_id, viator_base_level")
      .eq("slug", slug)
      .maybeSingle();
    if (ex) {
      bookUrl = buildViatorUrl({
        slug: ex.viator_slug,
        attractionId: ex.viator_attraction_id,
        baseLevel: ex.viator_base_level as "San-Juan" | "Puerto-Rico" | "Vieques" | "Fajardo",
        campaign: campaignHandle({ context: "coupon-page", decision: "book", entitySlug: slug }),
      });
    } else {
      bookUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}` + VIATOR_FALLBACK_URL_PATH;
    }
  } else {
    bookUrl = buildViatorUrl({ campaign: "coupon-page-book-fallback" });
  }

  const fullName = `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim() || "Guest";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <header className="text-center">
        <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
          Great — we appreciate your support
        </h1>
        <p className="mt-4 text-muted-foreground">
          We'll let you know when these excursions are open for your next visit. Thank you for
          helping all future visitors to the beautiful island of Puerto Rico.
        </p>
      </header>

      <section className="mt-10">
        <CouponCard
          code={lead.coupon_code ?? "PR000000"}
          name={fullName}
          email={lead.email}
          leadId={lead.id}
        />
      </section>

      <section className="mt-12">
        <h2 className="font-jakarta text-2xl font-bold text-secondary">Redeem on the Cataño side</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Make a purchase at any of our partner vendors below and they'll refund your ferry fare —
          a thank-you for helping make our island better for the millions of visitors to come.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.length === 0 && (
            <p className="text-sm italic text-muted-foreground">Vendor partners coming soon.</p>
          )}
          {vendors.map((v) => (
            <div key={v.id} className="rounded-xl border bg-card p-4">
              {v.logo_url && <img src={v.logo_url} alt={v.name} className="mb-3 h-12 object-contain" />}
              <p className="font-semibold text-secondary">{v.name}</p>
              <p className="text-sm text-muted-foreground">{v.address}</p>
              <p className="mt-2 text-sm">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 text-center">
        <Button asChild size="lg" className="h-16 w-full max-w-2xl bg-prm-coral text-xl font-extrabold text-white hover:bg-prm-coral/90">
          <a href={bookUrl} target="_blank" rel="noopener sponsored noreferrer">
            BOOK EXCURSIONS →
          </a>
        </Button>
        <div className="mt-8 flex justify-center">
          <ExpediaBanner />
        </div>
      </section>

      <section className="mt-12 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-secondary">
          ← Back home
        </Link>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Walk the full funnel end-to-end locally**: visit `/excursions` → click any card → /gate → fill form → "Yes" → /survey (pick 5) → /rank (drag) → /coupon → "BOOK EXCURSIONS" opens Viator with correct campaign param.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(coupon): /coupon page with PDF download, vendor list, BIG Viator CTA + Expedia banner"
```

---

### Task E9: /coupon/redeem/[code] read-only validation page

**Files:**
- Create: `app/(public)/coupon/redeem/[code]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/(public)/coupon/redeem/[code]/page.tsx
import { notFound } from "next/navigation";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

export default async function CouponRedeemPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = getServiceRoleSupabase();
  const { data: lead } = await supabase
    .from("leads")
    .select("first_name, last_name, coupon_code, coupon_redeemed_at, coupon_redeemed_vendor_id, created_at")
    .eq("coupon_code", code.toUpperCase())
    .maybeSingle();

  if (!lead) notFound();

  return (
    <div className="container mx-auto max-w-xl px-4 py-16">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Coupon validation</p>
        <p className="mt-2 font-mono text-3xl font-bold text-prm-coral">{lead.coupon_code}</p>
        <div className="mt-4 space-y-1 text-sm">
          <p><span className="text-muted-foreground">Issued to:</span> {lead.first_name} {lead.last_name}</p>
          <p><span className="text-muted-foreground">Issued on:</span> {new Date(lead.created_at).toLocaleDateString()}</p>
          <p>
            <span className="text-muted-foreground">Status:</span>{" "}
            {lead.coupon_redeemed_at ? (
              <span className="font-semibold text-success">Redeemed on {new Date(lead.coupon_redeemed_at).toLocaleDateString()}</span>
            ) : (
              <span className="font-semibold text-prm-coral">Valid — not yet redeemed</span>
            )}
          </p>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          v1: Vendor-side redemption updates land in Phase 2 admin tooling.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(coupon): /coupon/redeem/[code] read-only validation page"
```

---

*Phase E complete — full tourist funnel works end-to-end. Continue to Phase F.*

---

## Phase F — Masterminds Funnel

Mirrors the tourist funnel with a resident audience, redirect-to-mastermind on completion, and no coupon.

### Task F1: Seed the 20 masterminds

**Files:**
- Modify: `db/seed/masterminds.ts`

- [ ] **Step 1: Write the seed**

```ts
// db/seed/masterminds.ts
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const rows = [
  { slug: "2022-act-society", title: "The 20/22 Act Society", one_line: "Flagship community for Act 60 decree holders and prospective relocators.", image_url: img("photo-1556761175-5973dc0f32e7"), destination_url: "https://www.the2022actsociety.org/", tier: "paid_t1" as const, location: "Dorado", verified: true, sort_order: 1 },
  { slug: "eo-puerto-rico", title: "EO Puerto Rico", one_line: "Local chapter of Entrepreneurs' Organization — founders of $1M+ businesses.", image_url: img("photo-1556761175-b413da4baf72"), destination_url: "https://eopuertorico.org/", tier: "paid_t1" as const, location: "San Juan", verified: true, sort_order: 2 },
  { slug: "ypo-puerto-rico", title: "YPO Puerto Rico", one_line: "Young Presidents' Organization chapter for CEOs of significant companies.", image_url: img("photo-1559136555-9303baea8ebd"), destination_url: "https://www.ypo.org/", tier: "paid_t1" as const, location: "San Juan", verified: true, sort_order: 3 },
  { slug: "gobundance-pr", title: "GoBundance (PR Members)", one_line: "National peer mastermind for high-net-worth men — strong PR member base.", image_url: img("photo-1542744173-8e7e53415bb0"), destination_url: "https://gobundance.com/", tier: "paid_t1" as const, location: "Island-wide", verified: false, sort_order: 4 },
  { slug: "uncorrelated-pr", title: "Uncorrelated Alts PR", one_line: "Annual investor conference bringing 400+ family offices and Act 60 entrepreneurs together.", image_url: img("photo-1554224155-6726b3ff858f"), destination_url: "https://uncorrelatedpr.com/", tier: "paid_t1" as const, location: "San Juan", verified: true, sort_order: 5 },
  { slug: "prbta", title: "PR Blockchain Trade Association", one_line: "De facto Web3 trade org — hosts PR Blockchain Week and workshops.", image_url: img("photo-1639762681485-074b7f938ba0"), destination_url: "https://www.prblockchain.org/", tier: "paid_t1" as const, location: "San Juan", verified: true, sort_order: 6 },
  { slug: "cryptomondays", title: "CryptoMondays San Juan", one_line: "Weekly Web3 meetup at Poet's Passage in Old San Juan.", image_url: img("photo-1639762681485-074b7f938ba0"), destination_url: "https://www.facebook.com/CryptoMondaysSanJuan/", tier: "paid_t1" as const, location: "Old San Juan", verified: true, sort_order: 7 },
  { slug: "bitangels", title: "BitAngels San Juan", one_line: "Local node of the global blockchain angel investor network.", image_url: img("photo-1605792657660-596af9009e82"), destination_url: "https://bitangels.network/san-juan", tier: "paid_t1" as const, location: "San Juan", verified: true, sort_order: 8 },
  { slug: "parallel18", title: "Parallel18", one_line: "Government-backed accelerator running international and pre-acceleration programs.", image_url: img("photo-1556761175-5973dc0f32e7"), destination_url: "https://parallel18.com/", tier: "paid_t1" as const, location: "San Juan", verified: true, sort_order: 9 },
  { slug: "grupo-guayacan", title: "Grupo Guayacán", one_line: "Nonprofit running EnterPRize competition and I-Corps PR — 2,500+ entrepreneurs served.", image_url: img("photo-1531482615713-2afd69097998"), destination_url: "https://guayacan.org/", tier: "paid_t1" as const, location: "San Juan", verified: true, sort_order: 10 },
  { slug: "piloto-151", title: "Piloto 151", one_line: "Puerto Rico's first coworking space — community hub in Old San Juan and Dorado.", image_url: img("photo-1497366216548-37526070297c"), destination_url: "https://piloto151.com/", tier: "paid_t1" as const, location: "OSJ + Dorado", verified: true, sort_order: 11 },
  { slug: "colmena66", title: "Colmena66", one_line: "Resource connector linking founders to 250+ ecosystem orgs across the island.", image_url: img("photo-1521737711867-e3b97375f902"), destination_url: "https://www.colmena66.com/", tier: "paid_t1" as const, location: "Island-wide", verified: true, sort_order: 12 },
  { slug: "indie-hackers-pr", title: "Indie Hackers Puerto Rico", one_line: "Local IH meetup for bootstrappers, solopreneurs, and digital nomads.", image_url: img("photo-1522071820081-009f0129c71c"), destination_url: "https://www.indiehackerspr.com/", tier: "local_t2" as const, location: "San Juan", verified: true, sort_order: 13 },
  { slug: "aa-san-juan", title: "AA San Juan / Caribbean 12 Step", one_line: "Daily English-language AA meetings in Condado; includes LGBTQIA+ tracks.", image_url: img("photo-1499209974431-9dddcece7f88"), destination_url: "https://www.aasanjuan.org/", tier: "local_t2" as const, location: "Condado", verified: true, sort_order: 14 },
  { slug: "la-academia-bjj", title: "La Academia Jiu Jitsu", one_line: "Premier BJJ academy in Santurce — community hub for expats and locals.", image_url: img("photo-1555597673-b21d5c935865"), destination_url: "https://la-academia.com/", tier: "local_t2" as const, location: "Santurce", verified: true, sort_order: 15 },
  { slug: "opex-san-juan", title: "OPEX San Juan", one_line: "CrossFit + personalized strength training with a tight regular-member community.", image_url: img("photo-1534438327276-14e5300c3a48"), destination_url: "https://www.opexsj.com/", tier: "local_t2" as const, location: "San Juan", verified: true, sort_order: 16 },
  { slug: "run-club-san-juan", title: "San Juan Run Club", one_line: "Casual social run group meeting weekly in Condado.", image_url: img("photo-1452626038306-9aae5e071dd3"), destination_url: "https://www.instagram.com/sanjuanrunclub/", tier: "local_t2" as const, location: "Condado", verified: true, sort_order: 17 },
  { slug: "union-church-sj", title: "Union Church of San Juan", one_line: "English-speaking interdenominational church frequented by expats and Act 60 families.", image_url: img("photo-1438032005730-c779502df39b"), destination_url: "https://www.unionchurchsj.org/", tier: "local_t2" as const, location: "San Juan", verified: true, sort_order: 18 },
  { slug: "rincon-surf", title: "Rincón Surf School (Community Hub)", one_line: "Densest expat-surfer overlap on the island; west-coast surf culture's beating heart.", image_url: img("photo-1502680390469-be75c86b636f"), destination_url: "https://www.rinconsurfschool.com/", tier: "local_t2" as const, location: "Rincón", verified: true, sort_order: 19 },
  { slug: "metro-wbc", title: "Metro Women's Business Center", one_line: "SBA-backed women's entrepreneurship center with bilingual free programming.", image_url: img("photo-1573164713988-8665fc963095"), destination_url: "https://puertoricowomen.org/", tier: "local_t2" as const, location: "San Juan / Bayamón", verified: true, sort_order: 20 },
];

export async function seedMasterminds() {
  const supabase = getServiceRoleSupabase();
  const data = rows.map((r) => ({ ...r, is_active: true }));
  const { error } = await supabase.from("masterminds").upsert(data, { onConflict: "slug" });
  if (error) throw error;
  console.log(`  upserted ${rows.length} masterminds (12 paid_t1 + 8 local_t2)`);
}
```

- [ ] **Step 2: Run seed and verify**

```bash
npm run db:seed
```

Supabase Studio → `masterminds` → 20 rows.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(seed): 20 masterminds (12 paid tier + 8 local tier)"
```

---

### Task F2: Mastermind card + grid + page

**Files:**
- Create: `components/public/mastermind-card.tsx`
- Create: `lib/masterminds/queries.ts`
- Create: `app/(public)/masterminds/page.tsx`

- [ ] **Step 1: Create the queries helper**

```ts
// lib/masterminds/queries.ts
import { getServerSupabase } from "@/lib/supabase/server";

export async function listMasterminds() {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("masterminds")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getMastermindBySlug(slug: string) {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("masterminds")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Create the card component**

```tsx
// components/public/mastermind-card.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export interface MastermindCardData {
  id: string;
  slug: string;
  title: string;
  one_line: string;
  image_url: string;
  tier: "paid_t1" | "local_t2";
  location: string | null;
  verified: boolean;
}

export function MastermindCard({ mastermind: m }: { mastermind: MastermindCardData }) {
  return (
    <article className="group overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md">
      <Link href={`/masterminds/gate/masterminds:${m.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={m.image_url} alt={m.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition group-hover:scale-105" />
          <Badge className={`absolute left-3 top-3 ${m.tier === "paid_t1" ? "bg-prm-coral text-white" : "bg-prm-teal text-white"}`}>
            {m.tier === "paid_t1" ? "Premier" : "Community"}
          </Badge>
          {m.verified && <Badge className="absolute right-3 top-3 bg-secondary/90 text-white">Verified</Badge>}
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 font-jakarta text-lg font-semibold text-secondary">{m.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{m.one_line}</p>
          {m.location && <p className="text-xs text-muted-foreground">📍 {m.location}</p>}
        </div>
        <div className="border-t bg-prm-offwhite px-4 py-3">
          <span className="text-sm font-semibold text-prm-teal">Learn more →</span>
        </div>
      </Link>
    </article>
  );
}
```

- [ ] **Step 3: Create the masterminds page**

```tsx
// app/(public)/masterminds/page.tsx
import { listMasterminds } from "@/lib/masterminds/queries";
import { MastermindCard } from "@/components/public/mastermind-card";

export default async function MastermindsPage() {
  const masterminds = await listMasterminds();
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="font-jakarta text-4xl font-bold text-secondary md:text-5xl">
          Masterminds & Community on the Island
        </h1>
        <p className="mt-4 text-muted-foreground">
          A curated mix of entrepreneur peer groups and local communities for everyone making
          Puerto Rico home. Tell us which ones matter to you — we'll help shape what comes next.
        </p>
      </header>
      <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {masterminds.map((m) => <MastermindCard key={m.id} mastermind={m} />)}
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Verify** — visit `/masterminds`, see 20 cards.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(public): /masterminds grid with tier + verified badges"
```

---

### Task F3: Mastermind detail page

**Files:**
- Create: `app/(public)/masterminds/[slug]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/(public)/masterminds/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMastermindBySlug } from "@/lib/masterminds/queries";

export default async function MastermindDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = await getMastermindBySlug(slug);
  if (!m) notFound();

  return (
    <article className="container mx-auto max-w-5xl px-4 py-12">
      <div className="overflow-hidden rounded-2xl">
        <Image src={m.image_url} alt={m.title} width={1600} height={900} priority className="h-[400px] w-full object-cover" />
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Badge className={m.tier === "paid_t1" ? "bg-prm-coral text-white" : "bg-prm-teal text-white"}>
          {m.tier === "paid_t1" ? "Premier mastermind" : "Local community"}
        </Badge>
        {m.location && <Badge variant="outline">📍 {m.location}</Badge>}
        {m.verified && <Badge variant="secondary">Verified</Badge>}
      </div>
      <h1 className="mt-4 font-jakarta text-4xl font-bold text-secondary">{m.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{m.one_line}</p>
      {m.description && <p className="prose prose-neutral mt-6 max-w-none">{m.description}</p>}
      <div className="mt-10 flex items-center gap-4">
        <Button asChild size="lg" className="bg-prm-coral hover:bg-prm-coral/90 text-base">
          <Link href={`/masterminds/gate/masterminds:${m.slug}`}>I'm Interested</Link>
        </Button>
        <Link href="/masterminds" className="text-sm text-muted-foreground hover:text-secondary">
          ← All masterminds
        </Link>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(public): /masterminds/[slug] detail page"
```

---

### Task F4: Masterminds gate (no coupon, redirect to mastermind URL on no-path)

**Files:**
- Create: `app/(public)/masterminds/gate/[origin]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/(public)/masterminds/gate/[origin]/page.tsx
import { notFound } from "next/navigation";
import { GateForm } from "@/components/gate/gate-form";
import { getMastermindBySlug } from "@/lib/masterminds/queries";

export default async function MastermindGatePage({
  params,
}: {
  params: Promise<{ origin: string }>;
}) {
  const { origin: rawOrigin } = await params;
  const origin = decodeURIComponent(rawOrigin);
  const [kind, slug] = origin.split(":");
  if (kind !== "masterminds" || !slug) notFound();

  const m = await getMastermindBySlug(slug);
  if (!m) notFound();

  return (
    <div className="relative min-h-[80vh] bg-gradient-to-br from-prm-teal/10 via-white to-prm-coral/10 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
            Help us understand what our growing island community is looking for.
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Take a quick survey to help shape future masterminds, then we'll send you to {m.title}.
          </p>
        </div>
        <div className="mt-10">
          <GateForm
            origin={origin}
            funnel="masterminds"
            noPathRedirectUrl={m.destination_url}
            yesPathHref="/masterminds/survey"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(masterminds): gate page (no coupon, redirects to mastermind URL on no-path)"
```

---

### Task F5: Masterminds survey + rank + thanks pages

**Files:**
- Create: `app/(public)/masterminds/survey/page.tsx`
- Create: `app/(public)/masterminds/rank/page.tsx`
- Create: `app/(public)/masterminds/thanks/page.tsx`
- Create: `app/api/masterminds-list/route.ts`

- [ ] **Step 1: Create the masterminds-list API** so the client pages can fetch the cards

```ts
// app/api/masterminds-list/route.ts
import { NextResponse } from "next/server";
import { listMasterminds } from "@/lib/masterminds/queries";

export async function GET() {
  return NextResponse.json(await listMasterminds());
}
```

- [ ] **Step 2: Create the masterminds survey page**

```tsx
// app/(public)/masterminds/survey/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConceptGrid, type ConceptCardData } from "@/components/survey/concept-grid";

export default function MastermindsSurveyPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const leadId = sp.get("lead");
  const [items, setItems] = useState<ConceptCardData[]>([]);

  useEffect(() => {
    if (!leadId) {
      router.replace("/masterminds");
      return;
    }
    fetch("/api/masterminds-list")
      .then((r) => r.json())
      .then((data) =>
        setItems(
          data.map((m: { id: string; slug: string; title: string; one_line: string; image_url: string }) => ({
            id: m.id, slug: m.slug, title: m.title,
            description: m.one_line, image_url: m.image_url, is_sensitive: false,
          })),
        ),
      );
  }, [leadId, router]);

  async function handleSubmit(pickedIds: string[]) {
    await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, pickedIds }),
    });
    router.push(`/masterminds/rank?lead=${leadId}`);
  }

  if (!leadId || items.length === 0) {
    return <div className="container mx-auto px-4 py-24 text-center">Loading…</div>;
  }
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
          Star the ones you're most interested in
        </h1>
        <p className="mt-4 text-muted-foreground">
          Pick at least 5 that you'd actually want to join or attend.
        </p>
      </div>
      <div className="mt-8">
        <ConceptGrid concepts={items} leadId={leadId} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the masterminds rank page** (reuses RankList; submits as `entityType="mastermind"`)

```tsx
// app/(public)/masterminds/rank/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RankList, type RankableItem } from "@/components/rank/rank-list";

export default function MastermindsRankPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const leadId = sp.get("lead");
  const [items, setItems] = useState<RankableItem[]>([]);
  const [originSlug, setOriginSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!leadId) {
      router.replace("/masterminds");
      return;
    }
    const cookie = document.cookie.split("; ").find((r) => r.startsWith("prm_survey_picks="));
    if (!cookie) {
      router.replace(`/masterminds/survey?lead=${leadId}`);
      return;
    }
    const { pickedIds } = JSON.parse(decodeURIComponent(cookie.split("=")[1]));
    fetch("/api/masterminds-list")
      .then((r) => r.json())
      .then((all: { id: string; slug: string; title: string; image_url: string }[]) => {
        setItems(pickedIds.map((id: string) => all.find((c) => c.id === id)!).filter(Boolean));
      });
    // Also grab the origin slug from the lead's source_origin to redirect at the end
    fetch(`/api/lead/${leadId}`)
      .then((r) => r.json())
      .then((lead: { source_origin?: string }) => {
        const o = lead.source_origin ?? "";
        if (o.startsWith("masterminds:")) setOriginSlug(o.slice("masterminds:".length));
      });
  }, [leadId, router]);

  async function handleSubmit(orderedIds: string[]) {
    await fetch("/api/rank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, orderedIds, funnel: "masterminds", entityType: "mastermind" }),
    });
    router.push(`/masterminds/thanks${originSlug ? `?slug=${originSlug}` : ""}`);
  }

  if (!leadId || items.length === 0) {
    return <div className="container mx-auto px-4 py-24 text-center">Loading…</div>;
  }
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
        Rank your top picks
      </h1>
      <p className="mt-3 text-muted-foreground">
        Drag to order — <span className="font-semibold">#1 is the one you'd join first</span>.
      </p>
      <div className="mt-8">
        <RankList items={items} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create the masterminds thanks page**

```tsx
// app/(public)/masterminds/thanks/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function MastermindsThanksPage() {
  const sp = useSearchParams();
  const slug = sp.get("slug");
  const [countdown, setCountdown] = useState(5);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/masterminds-list`)
      .then((r) => r.json())
      .then((all: { slug: string; destination_url: string; title: string }[]) => {
        const found = all.find((m) => m.slug === slug);
        if (found) setRedirectUrl(found.destination_url);
      });
  }, [slug]);

  useEffect(() => {
    if (!redirectUrl) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    const t = setTimeout(() => { window.location.href = redirectUrl; }, 5000);
    return () => { clearInterval(id); clearTimeout(t); };
  }, [redirectUrl]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-jakarta text-4xl font-bold text-secondary">Thank you</h1>
      <p className="mt-4 text-muted-foreground">
        Your input shapes what our island community looks like next. We'll be in touch.
      </p>
      {redirectUrl ? (
        <>
          <p className="mt-8 text-sm text-muted-foreground">
            Taking you to your mastermind in <span className="font-bold text-prm-coral">{Math.max(countdown, 0)}</span>…
          </p>
          <a href={redirectUrl} className="mt-2 inline-block text-prm-teal underline">
            Go now →
          </a>
        </>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">Loading destination…</p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Walk the full masterminds funnel** end-to-end locally.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(masterminds): full survey + rank + thanks funnel with countdown redirect"
```

---

*Phase F complete — masterminds funnel works end-to-end. Continue to Phase G.*

---

## Phase G — Modal, Real-Estate Form, Static Pages

The remaining public-side pieces: the "We need your help" pop-up, the Act 60 / real-estate footer form, and About / Privacy / Terms / Contact.

### Task G1: "We need your help" modal

**Files:**
- Create: `components/public/help-modal.tsx`
- Modify: `app/(public)/layout.tsx`

- [ ] **Step 1: Create the modal**

```tsx
// components/public/help-modal.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics/events";

const COOKIE = "prm_help_modal_shown";
const COOKIE_DAYS = 30;
const DELAY_MS = 12_000;

function hasCookie(): boolean {
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE}=`));
}

function setCookie() {
  const exp = new Date(Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE}=1; expires=${exp}; path=/; SameSite=Lax`;
}

export function HelpModal() {
  const [open, setOpen] = useState(false);
  const [exitTriggered, setExitTriggered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || hasCookie()) return;
    const t = setTimeout(() => {
      if (!hasCookie()) {
        setOpen(true);
        trackEvent({ eventType: "modal_view", payload: { trigger: "timer" } });
      }
    }, DELAY_MS);

    const onExit = (e: MouseEvent) => {
      if (!exitTriggered && e.clientY <= 0 && !hasCookie()) {
        setExitTriggered(true);
        setOpen(true);
        trackEvent({ eventType: "modal_view", payload: { trigger: "exit_intent" } });
      }
    };
    document.addEventListener("mouseout", onExit);
    return () => { clearTimeout(t); document.removeEventListener("mouseout", onExit); };
  }, [exitTriggered]);

  function dismiss() {
    setCookie();
    setOpen(false);
    trackEvent({ eventType: "modal_no" });
  }

  function accept() {
    setCookie();
    setOpen(false);
    trackEvent({ eventType: "modal_yes" });
    router.push("/gate/modal:homepage");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-jakarta text-2xl text-secondary">
            We need your help
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Our beautiful island is growing, with millions of tourists a year. Help us figure out
            what excursions and events visitors want to see while they're here. Take a quick
            survey and we'll give you a free transportation coupon.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-3">
          <Button onClick={accept} className="bg-prm-coral text-base font-bold hover:bg-prm-coral/90">
            Yes — take the survey
          </Button>
          <button onClick={dismiss} className="text-sm text-muted-foreground underline">
            No thanks
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Mount the modal in the public layout** — modify `app/(public)/layout.tsx`

```tsx
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { HelpModal } from "@/components/public/help-modal";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <HelpModal />
    </>
  );
}
```

Note: the gate at `/gate/modal:homepage` will currently 404 since the page expects `excursions:<slug>`. Update the gate page to also accept `modal:<source>` as a valid origin in **Step 3**.

- [ ] **Step 3: Update `app/(public)/gate/[origin]/page.tsx`** to support a `modal:<source>` origin

Replace the `notFound()` branch with:

```ts
if (kind === "modal") {
  // Generic gate; no specific excursion. No-path goes to the Viator head URL.
  const noPathRedirectUrl = buildViatorUrl({
    campaign: campaignHandle({ context: "modal", decision: "no", entitySlug: slug ?? "homepage" }),
  });
  return (
    <div className="relative min-h-[80vh] bg-gradient-to-br from-prm-teal/10 via-white to-prm-coral/10 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
            Welcome — we need your help.
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Help us shape what comes next on the island, and we'll give you a free transportation coupon.
          </p>
        </div>
        <div className="mt-10">
          <GateForm
            origin={origin}
            funnel="tourist"
            noPathRedirectUrl={noPathRedirectUrl}
            yesPathHref="/survey"
          />
        </div>
      </div>
    </div>
  );
}
if (kind !== "excursions" || !slug) notFound();
```

- [ ] **Step 4: Test** — visit `/`, wait 12 seconds → modal appears. Click "Yes" → lands on `/gate/modal:homepage`. Click "No thanks" → modal closes, cookie set; reload → no modal.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(public): 'We need your help' modal (12s timer + exit intent + 30d cookie)"
```

---

### Task G2: Real-estate / Act 60 footer form

**Files:**
- Modify: `components/public/real-estate-form.tsx` (replace stub from D1)
- Create: `app/(public)/real-estate-interest/page.tsx`
- Create: `app/api/real-estate/route.ts`

- [ ] **Step 1: Replace the form stub with the real component**

```tsx
// components/public/real-estate-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export function RealEstateForm() {
  const [interestRE, setRE] = useState(false);
  const [interestAct60, setAct60] = useState(false);
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const valid =
    (interestRE || interestAct60) &&
    firstName.trim() && lastName.trim() && email.includes("@");

  function submit() {
    if (!valid) {
      setError("Please choose at least one interest and fill name + email.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/real-estate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          interests: [interestRE && "real_estate", interestAct60 && "act_60"].filter(Boolean),
          note,
        }),
      });
      if (!res.ok) {
        setError("Could not submit. Please try again.");
        return;
      }
      router.push("/real-estate-interest");
    });
  }

  return (
    <div className="space-y-3 text-secondary-foreground">
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={interestRE} onCheckedChange={(v) => setRE(Boolean(v))} />
          Real estate on the island
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={interestAct60} onCheckedChange={(v) => setAct60(Boolean(v))} />
          Act 60 tax benefits
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="First name" value={firstName} onChange={(e) => setFirst(e.target.value)} className="bg-white text-secondary" />
        <Input placeholder="Last name" value={lastName} onChange={(e) => setLast(e.target.value)} className="bg-white text-secondary" />
      </div>
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white text-secondary" />
      <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white text-secondary" />
      <Textarea placeholder="Tell us more (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="bg-white text-secondary" />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button onClick={submit} disabled={!valid || pending} className="w-full bg-prm-coral hover:bg-prm-coral/90">
        {pending ? "Sending…" : "Request More Info"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Create the API route**

```ts
// app/api/real-estate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/leads/create-lead";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { first_name, last_name, email, phone, interests, note } = body;
  try {
    await createLead({
      email, first_name, last_name, phone,
      funnel: "real_estate",
      payload: { interests, note },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "lead create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
```

- [ ] **Step 3: Create the confirmation page**

```tsx
// app/(public)/real-estate-interest/page.tsx
import Link from "next/link";

export default function RealEstateInterestPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-jakarta text-4xl font-bold text-secondary">Thanks — we'll be in touch.</h1>
      <p className="mt-4 text-muted-foreground">
        Someone from our team will follow up about real estate and/or Act 60 on the island.
      </p>
      <Link href="/" className="mt-8 inline-block text-prm-teal hover:underline">← Back home</Link>
    </div>
  );
}
```

- [ ] **Step 4: Test** — submit the footer form → verify lead row in Supabase with `funnel='real_estate'` and `payload.interests=['real_estate']` or `['act_60']`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(public): real-estate / Act 60 footer form + /real-estate-interest confirmation"
```

---

### Task G3: Static pages (About, Privacy, Terms, Contact)

**Files:**
- Create: `app/(public)/about/page.tsx`
- Create: `app/(public)/privacy/page.tsx`
- Create: `app/(public)/terms/page.tsx`
- Create: `app/(public)/contact/page.tsx`

- [ ] **Step 1: Create About**

```tsx
// app/(public)/about/page.tsx
export default function AboutPage() {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-jakarta text-4xl font-bold text-secondary">About Puerto Rico Masterminds</h1>
      <p className="mt-4 text-muted-foreground">
        Puerto Rico Masterminds (PRM) helps visitors discover the island's best experiences and helps
        residents find their community. Every click and survey response feeds an evidence-based model
        for what excursions, masterminds, and events deserve to come next.
      </p>
      <h2 className="mt-10 font-jakarta text-2xl font-semibold text-secondary">Meet your San Juan concierge</h2>
      <p className="mt-3 text-muted-foreground">
        [Placeholder bio — replace with real concierge details from spec §22.5.] We help you find the
        tours, food, and people that make Puerto Rico unforgettable.
      </p>
    </article>
  );
}
```

- [ ] **Step 2: Create Privacy**

```tsx
// app/(public)/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral container mx-auto max-w-3xl px-4 py-12">
      <h1>Privacy Policy</h1>
      <p>
        Puerto Rico Masterminds ("we", "us") collects the information you provide via our forms
        (name, email, phone) and analytics about how you use our site. We use this to provide our
        service, improve the experience, and follow up about excursions, masterminds, and real
        estate opportunities you've expressed interest in.
      </p>
      <h2>Affiliate disclosure</h2>
      <p>
        We participate in the Viator and Expedia affiliate programs. When you click a "Book" link
        and complete a purchase, we may earn a commission at no extra cost to you. We only
        recommend experiences and partners we believe in.
      </p>
      <h2>Sharing</h2>
      <p>
        We do not sell your data. We share lead information with our hosting and email providers
        (Supabase, Vercel, and the user's go-live agent) only as needed to operate the service.
      </p>
      <h2>Your rights</h2>
      <p>
        Email <a href="mailto:jeff.cline@me.com">jeff.cline@me.com</a> to request access,
        correction, or deletion of your data.
      </p>
    </article>
  );
}
```

- [ ] **Step 3: Create Terms**

```tsx
// app/(public)/terms/page.tsx
export default function TermsPage() {
  return (
    <article className="prose prose-neutral container mx-auto max-w-3xl px-4 py-12">
      <h1>Terms of Service</h1>
      <p>
        By using puertoricomasterminds.com you agree these terms. PRM provides information,
        recommendations, and links to third-party booking partners (Viator, Expedia). PRM is not
        the operator of any excursion or mastermind shown on this site; bookings, payments,
        cancellations, and refunds are handled by the third-party provider.
      </p>
      <h2>Coupon redemption</h2>
      <p>
        The Cataño Ferry coupon is provided as a thank-you for completing our survey. Coupons are
        single-use, non-transferable, and subject to vendor availability.
      </p>
      <h2>Disclaimers</h2>
      <p>
        Excursion pricing, availability, and content shown on PRM are sourced from third-party
        partners and may change without notice. Verify details on the booking partner site before
        purchase.
      </p>
    </article>
  );
}
```

- [ ] **Step 4: Create Contact**

```tsx
// app/(public)/contact/page.tsx
const WA = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";

export default function ContactPage() {
  const waUrl = WA
    ? `https://api.whatsapp.com/send?phone=${WA.replace(/[^\d]/g, "")}`
    : null;

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-jakarta text-4xl font-bold text-secondary">Contact</h1>
      <p className="mt-4 text-muted-foreground">
        Reach the PRM team for partnership, press, or general questions.
      </p>
      <ul className="mt-8 space-y-3 text-secondary">
        <li>📧 <a href="mailto:jeff.cline@me.com" className="text-prm-teal hover:underline">jeff.cline@me.com</a></li>
        {waUrl && <li>💬 <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-prm-teal hover:underline">WhatsApp us</a></li>}
      </ul>
    </article>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(public): About, Privacy, Terms, Contact static pages"
```

---

*Phase G complete — public side fully shipped. Milestone 1 (Public Site) is now feature-complete. Continue to Phase H.*

---

## Phase H — Admin Auth, Roles, and Shell

Auth-gated `/admin/*`, the forced-password-change flow, the role matrix, and the navigation shell.

### Task H1: Role constants + can() helper (TDD)

**Files:**
- Test: `tests/lib/auth/roles.test.ts`
- Create: `lib/auth/roles.ts`

- [ ] **Step 1: Write the test**

```ts
// tests/lib/auth/roles.test.ts
import { describe, it, expect } from "vitest";
import { can, type Role } from "@/lib/auth/roles";

const all: Role[] = ["super_admin","developer_real_estate","developer_excursion","investor","official","view_only"];

describe("can", () => {
  it("super_admin can do everything", () => {
    for (const action of ["read:leads","write:cms","manage:users","read:real_estate_leads"] as const) {
      expect(can("super_admin", action)).toBe(true);
    }
  });
  it("view_only cannot write anything", () => {
    expect(can("view_only", "write:cms")).toBe(false);
    expect(can("view_only", "manage:users")).toBe(false);
  });
  it("developer_real_estate can read real_estate_leads but not write CMS for excursions", () => {
    expect(can("developer_real_estate", "read:real_estate_leads")).toBe(true);
    expect(can("developer_real_estate", "write:cms")).toBe(false);
  });
  it("developer_excursion can write excursion CMS", () => {
    expect(can("developer_excursion", "write:cms")).toBe(true);
  });
  it("investor and official cannot manage users", () => {
    expect(can("investor", "manage:users")).toBe(false);
    expect(can("official", "manage:users")).toBe(false);
  });
  it("returns false for unknown role", () => {
    expect(can("nope" as Role, "read:leads")).toBe(false);
  });
  it("redactPii is required to see PII for non-super roles on leads", () => {
    expect(can("developer_excursion", "read:leads_pii")).toBe(false);
    expect(can("super_admin", "read:leads_pii")).toBe(true);
  });
});
```

- [ ] **Step 2: Run, expect fail**

```bash
npm test -- tests/lib/auth/roles.test.ts
```

- [ ] **Step 3: Implement `lib/auth/roles.ts`**

```ts
// lib/auth/roles.ts
export type Role =
  | "super_admin"
  | "developer_real_estate"
  | "developer_excursion"
  | "investor"
  | "official"
  | "view_only";

export type Action =
  | "read:leads"
  | "read:leads_pii"
  | "read:real_estate_leads"
  | "read:funnels"
  | "read:leaderboards"
  | "write:cms"
  | "manage:users"
  | "manage:cruise_calendar"
  | "view:affiliate";

const MATRIX: Record<Role, Action[]> = {
  super_admin: [
    "read:leads","read:leads_pii","read:real_estate_leads","read:funnels","read:leaderboards",
    "write:cms","manage:users","manage:cruise_calendar","view:affiliate",
  ],
  developer_real_estate: [
    "read:leads","read:real_estate_leads","read:funnels","read:leaderboards","view:affiliate",
  ],
  developer_excursion: [
    "read:leads","read:funnels","read:leaderboards","write:cms","manage:cruise_calendar","view:affiliate",
  ],
  investor: ["read:funnels","read:leaderboards","view:affiliate"],
  official: ["read:funnels","read:leaderboards"],
  view_only: ["read:funnels","read:leaderboards"],
};

export function can(role: Role, action: Action): boolean {
  const allowed = MATRIX[role];
  if (!allowed) return false;
  return allowed.includes(action);
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/lib/auth/roles.test.ts
```

Expected: 7 PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(auth): role + action matrix with can() helper (TDD)"
```

---

### Task H2: getCurrentAdminUser helper

**Files:**
- Create: `lib/auth/current-user.ts`

- [ ] **Step 1: Write the helper**

```ts
// lib/auth/current-user.ts
import { getServerSupabase } from "@/lib/supabase/server";
import type { Role } from "./roles";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  force_password_change: boolean;
  is_active: boolean;
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role, force_password_change, is_active")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data || !data.is_active) return null;
  return data as AdminUser;
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(auth): getCurrentAdminUser server helper"
```

---

### Task H3: Middleware — auth + force_password_change gate

**Files:**
- Create: `middleware.ts`
- Create: `lib/supabase/middleware-client.ts`

- [ ] **Step 1: Create middleware client helper**

```ts
// lib/supabase/middleware-client.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

export function createMiddlewareClient(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );
  return { supabase, res };
}
```

- [ ] **Step 2: Create the middleware**

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware-client";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/change-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const { supabase, res } = createMiddlewareClient(req);
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in → only login page is accessible
  if (!user) {
    if (pathname === "/admin/login") return res;
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Logged in: check force_password_change
  const { data: profile } = await supabase
    .from("users")
    .select("force_password_change, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (profile.force_password_change && pathname !== "/admin/change-password") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/change-password";
    return NextResponse.redirect(url);
  }

  if (!profile.force_password_change && pathname === "/admin/change-password") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Logged-in user visiting /admin/login → bounce to dashboard
  if (pathname === "/admin/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(auth): middleware gates /admin/* with force_password_change redirect"
```

---

### Task H4: Admin login page

**Files:**
- Create: `app/(admin)/admin/login/page.tsx`
- Create: `app/(admin)/admin/login/login-form.tsx`

- [ ] **Step 1: Create the login form (client)**

```tsx
// app/(admin)/admin/login/login-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = getBrowserSupabase();
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) {
        setError(authErr.message);
        return;
      }
      const next = sp.get("next") || "/admin";
      router.push(next);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
      <h1 className="font-jakarta text-2xl font-bold text-secondary">Admin sign-in</h1>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full bg-prm-coral hover:bg-prm-coral/90">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Create the login page**

```tsx
// app/(admin)/admin/login/page.tsx
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-20">
      <LoginForm />
    </div>
  );
}
```

- [ ] **Step 3: Test login**

```bash
npm run dev
```

Visit `http://localhost:3000/admin`. Expect redirect to `/admin/login?next=/admin`. Sign in with `jeff.cline@me.com` / `TEMP!234`. Middleware should redirect you to `/admin/change-password` (which we build next).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(admin): login page + form"
```

---

### Task H5: Force-password-change page

**Files:**
- Create: `app/(admin)/admin/change-password/page.tsx`
- Create: `app/(admin)/admin/change-password/change-form.tsx`
- Create: `app/api/admin/change-password/route.ts`

- [ ] **Step 1: Create the change-form client component**

```tsx
// app/(admin)/admin/change-password/change-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function validate(pw: string): string | null {
  if (pw.length < 12) return "Password must be at least 12 characters.";
  if (!/[A-Z]/.test(pw)) return "Include an uppercase letter.";
  if (!/[a-z]/.test(pw)) return "Include a lowercase letter.";
  if (!/[0-9]/.test(pw)) return "Include a number.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Include a special character.";
  return null;
}

export function ChangePasswordForm() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate(pw);
    if (v) { setErr(v); return; }
    if (pw !== confirm) { setErr("Passwords do not match."); return; }
    setErr(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        setErr(await res.text());
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
      <h1 className="font-jakarta text-2xl font-bold text-secondary">Set your password</h1>
      <p className="text-sm text-muted-foreground">
        You're using a temporary password. Set a new one to continue.
      </p>
      <div className="space-y-2">
        <Label htmlFor="pw">New password</Label>
        <Input id="pw" type="password" autoComplete="new-password" required value={pw} onChange={(e) => setPw(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <p className="text-xs text-muted-foreground">
        12+ chars, mix of upper/lower, a number, and a special character.
      </p>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button type="submit" disabled={pending} className="w-full bg-prm-coral hover:bg-prm-coral/90">
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Create the change-password page**

```tsx
// app/(admin)/admin/change-password/page.tsx
import { ChangePasswordForm } from "./change-form";

export default function ChangePasswordPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-20">
      <ChangePasswordForm />
    </div>
  );
}
```

- [ ] **Step 3: Create the API route**

```ts
// app/api/admin/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password || typeof password !== "string" || password.length < 12) {
    return NextResponse.json({ error: "password too short" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not authenticated" }, { status: 401 });

  // Update auth password via the user's own session
  const { error: pwErr } = await supabase.auth.updateUser({ password });
  if (pwErr) return NextResponse.json({ error: pwErr.message }, { status: 400 });

  // Clear the force_password_change flag using service-role (RLS would otherwise require self-update policy; we already added that)
  const admin = getServiceRoleSupabase();
  await admin
    .from("users")
    .update({ force_password_change: false, last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Test the full first-login flow**

1. Visit `/admin` → redirected to login.
2. Sign in with `jeff.cline@me.com` / `TEMP!234`.
3. Should land on `/admin/change-password`.
4. Set a new password (e.g. `NewPRMpass!1234`).
5. Should land on `/admin` (which is still a placeholder route — we'll build it next).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(admin): force-password-change flow with strong-password validation"
```

---

### Task H6: Admin shell layout

**Files:**
- Create: `app/(admin)/layout.tsx`
- Create: `components/admin/sidebar.tsx`
- Create: `components/admin/topbar.tsx`

- [ ] **Step 1: Create the sidebar**

```tsx
// components/admin/sidebar.tsx
import Link from "next/link";
import { can, type Role } from "@/lib/auth/roles";

const SECTIONS = [
  { label: "Overview", href: "/admin", action: null },
  { label: "Tourist Funnel", href: "/admin/funnel/tourist", action: "read:funnels" as const },
  { label: "Masterminds Funnel", href: "/admin/funnel/masterminds", action: "read:funnels" as const },
  { label: "Future Excursions Leaderboard", href: "/admin/leaderboard/future-excursions", action: "read:leaderboards" as const },
  { label: "Masterminds Leaderboard", href: "/admin/leaderboard/masterminds", action: "read:leaderboards" as const },
  { label: "Leads", href: "/admin/leads", action: "read:leads" as const },
  { label: "Real Estate Leads", href: "/admin/real-estate-leads", action: "read:real_estate_leads" as const },
  { label: "Cruise Calendar", href: "/admin/cruise-calendar", action: "manage:cruise_calendar" as const },
  { label: "CMS · Excursions", href: "/admin/cms/excursions", action: "write:cms" as const },
  { label: "CMS · Future Excursions", href: "/admin/cms/future-excursions", action: "write:cms" as const },
  { label: "CMS · Masterminds", href: "/admin/cms/masterminds", action: "write:cms" as const },
  { label: "CMS · Featured", href: "/admin/cms/featured", action: "write:cms" as const },
  { label: "CMS · Vendors", href: "/admin/cms/vendors", action: "write:cms" as const },
  { label: "Users & Roles", href: "/admin/users", action: "manage:users" as const },
  { label: "Affiliate", href: "/admin/affiliate", action: "view:affiliate" as const },
] as const;

export function Sidebar({ role }: { role: Role }) {
  const visible = SECTIONS.filter((s) => s.action === null || can(role, s.action));
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-secondary text-secondary-foreground md:block">
      <div className="p-6">
        <Link href="/admin" className="font-jakarta text-lg font-bold">
          PRM Admin
        </Link>
      </div>
      <nav className="px-2">
        <ul className="space-y-1">
          {visible.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary-foreground/10"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Create the topbar**

```tsx
// components/admin/topbar.tsx
"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getBrowserSupabase } from "@/lib/supabase/client";

export function Topbar({ email, role }: { email: string; role: string }) {
  const router = useRouter();
  async function signOut() {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div className="text-sm text-muted-foreground">
        Signed in as <span className="font-semibold text-secondary">{email}</span> · {role}
      </div>
      <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
    </header>
  );
}
```

- [ ] **Step 3: Create the admin layout** (auth-protected by middleware; layout assumes user exists)

```tsx
// app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  if (user.force_password_change) redirect("/admin/change-password");

  return (
    <div className="flex min-h-screen bg-prm-offwhite">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col">
        <Topbar email={user.email} role={user.role} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
```

The login + change-password pages need to bypass this layout. Since they live under `app/(admin)/admin/login` and `app/(admin)/admin/change-password`, the layout will wrap them — and `getCurrentAdminUser` will return null on the login page (no session) which causes the redirect. To avoid the loop, create a separate `app/(admin)/admin/login/layout.tsx` and `change-password/layout.tsx` that does not import the protected layout, OR move login + change-password out of the `(admin)` route group.

The simplest fix: create `app/(auth)/admin/login/page.tsx` and `app/(auth)/admin/change-password/page.tsx` — i.e. **move** login + change-password out of `(admin)` into `(auth)`. Update the import paths accordingly.

- [ ] **Step 4: Move login and change-password into a separate group** to skip the admin shell layout

Restructure files:
- Move `app/(admin)/admin/login/` → `app/(auth)/admin/login/`
- Move `app/(admin)/admin/change-password/` → `app/(auth)/admin/change-password/`
- Create `app/(auth)/layout.tsx`:

```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-prm-offwhite">{children}</div>;
}
```

- [ ] **Step 5: Test full first-login flow again** end-to-end. Verify:
  - `/admin` → redirect to login
  - Login → redirect to change-password
  - Change password → redirect to `/admin` (shows blank shell for now)
  - Sign out → redirect to login

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(admin): shell layout with role-aware sidebar + topbar + auth split into (auth) group"
```

---

*Phase H complete — admin is auth-protected, role-aware, and ready for content pages. Continue to Phase I.*

---

## Phase I — Admin Overview & Funnel Pages

The dashboard's main analytical surfaces.

### Task I1: Stat-card component

**Files:**
- Create: `components/admin/stat-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/admin/stat-card.tsx
import type { ReactNode } from "react";

export function StatCard({
  label, value, sub, icon,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon && <div className="text-prm-teal">{icon}</div>}
      </div>
      <p className="mt-2 font-jakarta text-3xl font-bold text-secondary">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(admin): stat-card component"
```

---

### Task I2: Admin overview queries + page

**Files:**
- Create: `lib/admin/overview-queries.ts`
- Create: `app/(admin)/admin/page.tsx`

- [ ] **Step 1: Create queries**

```ts
// lib/admin/overview-queries.ts
import { getServerSupabase } from "@/lib/supabase/server";

export async function getOverviewStats() {
  const supabase = await getServerSupabase();
  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now.getTime() - 7 * 86_400_000);
  const startOfMonth = new Date(now.getTime() - 30 * 86_400_000);

  const counts = async (since: Date, funnel?: string) => {
    let q = supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", since.toISOString());
    if (funnel) q = q.eq("funnel", funnel);
    const { count } = await q;
    return count ?? 0;
  };

  const [
    leadsToday, leadsWeek, leadsMonth,
    touristToday, mindsToday, realEstateToday,
  ] = await Promise.all([
    counts(startOfDay), counts(startOfWeek), counts(startOfMonth),
    counts(startOfDay, "tourist"), counts(startOfDay, "masterminds"), counts(startOfDay, "real_estate"),
  ]);

  const { data: topExcursions } = await supabase
    .from("v_top_excursions_30d").select("*").limit(5);
  const { data: topConcepts } = await supabase
    .from("v_future_excursion_leaderboard").select("*").limit(5);

  return {
    leadsToday, leadsWeek, leadsMonth,
    touristToday, mindsToday, realEstateToday,
    topExcursions: topExcursions ?? [],
    topConcepts: topConcepts ?? [],
  };
}
```

- [ ] **Step 2: Create the overview page**

```tsx
// app/(admin)/admin/page.tsx
import { getOverviewStats } from "@/lib/admin/overview-queries";
import { StatCard } from "@/components/admin/stat-card";

export default async function AdminOverviewPage() {
  const s = await getOverviewStats();
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Overview</h1>
        <p className="mt-1 text-muted-foreground">Live snapshot of PRM lead and click activity.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Leads today" value={s.leadsToday} />
        <StatCard label="Leads · 7d" value={s.leadsWeek} />
        <StatCard label="Leads · 30d" value={s.leadsMonth} />
        <StatCard label="Tourist · today" value={s.touristToday} />
        <StatCard label="Masterminds · today" value={s.mindsToday} />
        <StatCard label="Real estate · today" value={s.realEstateToday} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h3 className="mb-3 font-semibold text-secondary">Top 5 clicked excursions (30d)</h3>
          {s.topExcursions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clicks yet.</p>
          ) : (
            <ol className="space-y-1 text-sm">
              {s.topExcursions.map((e) => (
                <li key={e.excursion_id} className="flex justify-between">
                  <span className="text-secondary">{e.title}</span>
                  <span className="font-mono text-muted-foreground">{e.clicks}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h3 className="mb-3 font-semibold text-secondary">Top 5 ranked Coming Soon (Borda)</h3>
          {s.topConcepts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rankings yet.</p>
          ) : (
            <ol className="space-y-1 text-sm">
              {s.topConcepts.map((c) => (
                <li key={c.id} className="flex justify-between">
                  <span className="text-secondary">{c.title}</span>
                  <span className="font-mono text-muted-foreground">{c.borda_score}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Verify** — sign in, land on `/admin`. Should see 6 stat cards (mostly zeros) and two "top 5" panels.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(admin): overview dashboard with 6 stat cards + top-clicked + top-ranked panels"
```

---

### Task I3: Tourist funnel analytics page

**Files:**
- Create: `lib/admin/funnel-queries.ts`
- Create: `app/(admin)/admin/funnel/tourist/page.tsx`

- [ ] **Step 1: Create funnel queries**

```ts
// lib/admin/funnel-queries.ts
import { getServerSupabase } from "@/lib/supabase/server";

export async function getTouristFunnel() {
  const supabase = await getServerSupabase();
  const { data } = await supabase.from("v_tourist_funnel").select("*").maybeSingle();
  return data ?? { card_clicks: 0, gate_views: 0, gate_yes: 0, gate_no: 0, rank_submits: 0, book_clicks: 0 };
}

export async function getGateConversion() {
  const supabase = await getServerSupabase();
  const { data } = await supabase.from("v_gate_conversion").select("*").order("views", { ascending: false }).limit(20);
  return data ?? [];
}
```

- [ ] **Step 2: Create the page**

```tsx
// app/(admin)/admin/funnel/tourist/page.tsx
import { getTouristFunnel, getGateConversion } from "@/lib/admin/funnel-queries";
import { StatCard } from "@/components/admin/stat-card";

export default async function TouristFunnelPage() {
  const f = await getTouristFunnel();
  const conv = await getGateConversion();

  const pct = (n: number, base: number) => (base > 0 ? `${Math.round((n / base) * 100)}%` : "—");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Tourist Funnel</h1>
        <p className="mt-1 text-muted-foreground">Step-by-step conversion across the excursion funnel.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Card clicks" value={f.card_clicks} />
        <StatCard label="Gate views" value={f.gate_views} sub={pct(f.gate_views, f.card_clicks) + " of clicks"} />
        <StatCard label="Gate YES" value={f.gate_yes} sub={pct(f.gate_yes, f.gate_views) + " of views"} />
        <StatCard label="Gate NO" value={f.gate_no} sub={pct(f.gate_no, f.gate_views) + " of views"} />
        <StatCard label="Rank submits" value={f.rank_submits} sub={pct(f.rank_submits, f.gate_yes) + " of YES"} />
        <StatCard label="Book clicks" value={f.book_clicks} />
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h3 className="mb-3 font-semibold text-secondary">Gate conversion by origin</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Origin</th>
                <th className="py-2 pr-4">Views</th>
                <th className="py-2 pr-4">Yes</th>
                <th className="py-2 pr-4">No</th>
                <th className="py-2">Yes rate</th>
              </tr>
            </thead>
            <tbody>
              {conv.map((row) => (
                <tr key={row.origin ?? "(none)"} className="border-b">
                  <td className="py-2 pr-4 text-secondary">{row.origin ?? "(unknown)"}</td>
                  <td className="py-2 pr-4 font-mono">{row.views}</td>
                  <td className="py-2 pr-4 font-mono">{row.yes_count}</td>
                  <td className="py-2 pr-4 font-mono">{row.no_count}</td>
                  <td className="py-2 font-mono">{pct(row.yes_count, row.views)}</td>
                </tr>
              ))}
              {conv.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No gate views yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(admin): tourist funnel page with stage stat cards + gate conversion by origin"
```

---

### Task I4: Masterminds funnel page

**Files:**
- Create: `app/(admin)/admin/funnel/masterminds/page.tsx`

- [ ] **Step 1: Create the page** (parallel to Tourist Funnel; uses gate-conversion view filtered to masterminds origins)

```tsx
// app/(admin)/admin/funnel/masterminds/page.tsx
import { getServerSupabase } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/stat-card";

async function getMastermindsFunnel() {
  const supabase = await getServerSupabase();
  const { count: rankSubmits } = await supabase
    .from("rankings").select("*", { count: "exact", head: true }).eq("funnel", "masterminds");
  const { count: leads } = await supabase
    .from("leads").select("*", { count: "exact", head: true }).eq("funnel", "masterminds");
  // Card clicks for masterminds aren't tracked yet (no card click handler on /masterminds);
  // we use lead count as the funnel entry point for now.
  return { leads: leads ?? 0, rank_submits: rankSubmits ?? 0 };
}

async function getMastermindsGateConv() {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("v_gate_conversion")
    .select("*")
    .like("origin", "masterminds:%")
    .order("views", { ascending: false });
  return data ?? [];
}

export default async function MastermindsFunnelPage() {
  const f = await getMastermindsFunnel();
  const conv = await getMastermindsGateConv();
  const pct = (n: number, base: number) => (base > 0 ? `${Math.round((n / base) * 100)}%` : "—");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Masterminds Funnel</h1>
        <p className="mt-1 text-muted-foreground">Resident funnel — masterminds discovery to ranked picks.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Masterminds leads" value={f.leads} />
        <StatCard label="Rank submits" value={f.rank_submits} sub={pct(f.rank_submits, f.leads) + " of leads"} />
        <StatCard label="Origins tracked" value={conv.length} />
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h3 className="mb-3 font-semibold text-secondary">Gate conversion by mastermind</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Mastermind</th>
                <th className="py-2 pr-4">Views</th>
                <th className="py-2 pr-4">Yes</th>
                <th className="py-2 pr-4">No</th>
                <th className="py-2">Yes rate</th>
              </tr>
            </thead>
            <tbody>
              {conv.map((row) => (
                <tr key={row.origin ?? "(none)"} className="border-b">
                  <td className="py-2 pr-4 text-secondary">{row.origin?.replace("masterminds:", "") ?? "(unknown)"}</td>
                  <td className="py-2 pr-4 font-mono">{row.views}</td>
                  <td className="py-2 pr-4 font-mono">{row.yes_count}</td>
                  <td className="py-2 pr-4 font-mono">{row.no_count}</td>
                  <td className="py-2 font-mono">{pct(row.yes_count, row.views)}</td>
                </tr>
              ))}
              {conv.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No mastermind gate views yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(admin): masterminds funnel page with lead/rank counts + gate conversion table"
```

---

*Phase I complete — overview + both funnel pages live. Continue to Phase J.*

---

## Phase J — Leaderboards (Borda-Weighted Rankings)

The analytical heart of the product: which Coming Soon and masterminds are winning the rank vote.

### Task J1: Borda calculation helper (TDD)

The SQL view already computes Borda. This task wraps it in a Server helper and adds a sanity test so future schema changes don't silently break it.

**Files:**
- Test: `tests/lib/ranking/borda.test.ts`
- Create: `lib/ranking/borda.ts`

- [ ] **Step 1: Write the test**

```ts
// tests/lib/ranking/borda.test.ts
import { describe, it, expect } from "vitest";
import { bordaScore } from "@/lib/ranking/borda";

describe("bordaScore", () => {
  it("returns 0 for an empty list", () => {
    expect(bordaScore([])).toBe(0);
  });
  it("rank 1 contributes 10 points", () => {
    expect(bordaScore([1])).toBe(10);
  });
  it("rank 10 contributes 1 point", () => {
    expect(bordaScore([10])).toBe(1);
  });
  it("sums correctly across multiple ranks", () => {
    // ranks 1, 3, 5 → (11-1)+(11-3)+(11-5) = 10+8+6 = 24
    expect(bordaScore([1, 3, 5])).toBe(24);
  });
  it("ignores out-of-range ranks", () => {
    expect(bordaScore([0, 11, 1])).toBe(10);
  });
});
```

- [ ] **Step 2: Run, expect fail**

```bash
npm test -- tests/lib/ranking/borda.test.ts
```

- [ ] **Step 3: Implement**

```ts
// lib/ranking/borda.ts
export function bordaScore(ranks: number[]): number {
  return ranks.reduce((acc, r) => (r >= 1 && r <= 10 ? acc + (11 - r) : acc), 0);
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/lib/ranking/borda.test.ts
```

Expected: 5 PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(ranking): Borda score helper (TDD)"
```

---

### Task J2: Future excursions leaderboard page

**Files:**
- Create: `lib/admin/leaderboard-queries.ts`
- Create: `app/(admin)/admin/leaderboard/future-excursions/page.tsx`

- [ ] **Step 1: Create the query**

```ts
// lib/admin/leaderboard-queries.ts
import { getServerSupabase } from "@/lib/supabase/server";

export async function getFutureExcursionLeaderboard() {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("v_future_excursion_leaderboard").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function getMastermindLeaderboard() {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("v_mastermind_leaderboard").select("*");
  if (error) throw error;
  return data ?? [];
}
```

- [ ] **Step 2: Create the page**

```tsx
// app/(admin)/admin/leaderboard/future-excursions/page.tsx
import { getFutureExcursionLeaderboard } from "@/lib/admin/leaderboard-queries";

export default async function FutureExcursionsLeaderboardPage() {
  const rows = await getFutureExcursionLeaderboard();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Future Excursions Leaderboard</h1>
        <p className="mt-1 text-muted-foreground">
          Borda-weighted ranking score = sum of (11 − rank_position) across all submissions. Higher = more wanted.
        </p>
      </header>
      <section className="rounded-xl border bg-white p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Concept</th>
              <th className="py-2 pr-4">Total picks</th>
              <th className="py-2 pr-4">#1 votes</th>
              <th className="py-2">Borda</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-b">
                <td className="py-2 pr-4 font-mono">{i + 1}</td>
                <td className="py-2 pr-4 text-secondary">{r.title}</td>
                <td className="py-2 pr-4 font-mono">{r.total_picks}</td>
                <td className="py-2 pr-4 font-mono">{r.first_place_count}</td>
                <td className="py-2 font-mono font-bold text-prm-coral">{r.borda_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(admin): future-excursions leaderboard (Borda-weighted)"
```

---

### Task J3: Masterminds leaderboard page

**Files:**
- Create: `app/(admin)/admin/leaderboard/masterminds/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/(admin)/admin/leaderboard/masterminds/page.tsx
import { getMastermindLeaderboard } from "@/lib/admin/leaderboard-queries";

export default async function MastermindsLeaderboardPage() {
  const rows = await getMastermindLeaderboard();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Masterminds Leaderboard</h1>
        <p className="mt-1 text-muted-foreground">Top-ranked masterminds by Borda score.</p>
      </header>
      <section className="rounded-xl border bg-white p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Mastermind</th>
              <th className="py-2 pr-4">Tier</th>
              <th className="py-2 pr-4">Total picks</th>
              <th className="py-2 pr-4">#1 votes</th>
              <th className="py-2">Borda</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-b">
                <td className="py-2 pr-4 font-mono">{i + 1}</td>
                <td className="py-2 pr-4 text-secondary">{r.title}</td>
                <td className="py-2 pr-4 text-xs uppercase tracking-wide text-muted-foreground">{r.tier === "paid_t1" ? "Premier" : "Community"}</td>
                <td className="py-2 pr-4 font-mono">{r.total_picks}</td>
                <td className="py-2 pr-4 font-mono">{r.first_place_count}</td>
                <td className="py-2 font-mono font-bold text-prm-coral">{r.borda_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(admin): masterminds leaderboard (Borda-weighted, tier-labeled)"
```

---

*Phase J complete — leaderboards live. Continue to Phase K.*

---

## Phase K — Admin Leads, Real-Estate, Cruise Calendar

### Task K1: Leads table page with filters + CSV export

**Files:**
- Create: `app/(admin)/admin/leads/page.tsx`
- Create: `app/(admin)/admin/leads/leads-table.tsx`
- Create: `app/api/exports/leads/route.ts`

- [ ] **Step 1: Create the leads page (server) that hands data to client table**

```tsx
// app/(admin)/admin/leads/page.tsx
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { getServerSupabase } from "@/lib/supabase/server";
import { LeadsTable } from "./leads-table";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ funnel?: string; q?: string }>;
}) {
  const user = await getCurrentAdminUser();
  const sp = await searchParams;
  const funnel = sp.funnel ?? "all";
  const q = sp.q?.trim() ?? "";

  const supabase = await getServerSupabase();
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500);
  if (funnel !== "all") query = query.eq("funnel", funnel);
  if (q) query = query.or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`);

  const { data } = await query;
  const canSeePii = user?.role === "super_admin";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Leads</h1>
        <p className="mt-1 text-muted-foreground">{data?.length ?? 0} most recent leads.</p>
      </header>
      <LeadsTable rows={data ?? []} canSeePii={canSeePii} initialFunnel={funnel} initialQuery={q} />
    </div>
  );
}
```

- [ ] **Step 2: Create the client table**

```tsx
// app/(admin)/admin/leads/leads-table.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Row {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  funnel: string;
  source_origin: string | null;
  cruise_ship: string | null;
  coupon_code: string | null;
  created_at: string;
}

function redactEmail(e: string): string {
  const [a, b] = e.split("@");
  return `${a[0]}***@${b[0]}***.${b.split(".").pop()}`;
}

export function LeadsTable({ rows, canSeePii, initialFunnel, initialQuery }: {
  rows: Row[]; canSeePii: boolean; initialFunnel: string; initialQuery: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [funnel, setFunnel] = useState(initialFunnel);

  function applyFilters() {
    const sp = new URLSearchParams();
    if (funnel !== "all") sp.set("funnel", funnel);
    if (q) sp.set("q", q);
    router.push(`/admin/leads?${sp.toString()}`);
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search email or name" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <Select value={funnel} onValueChange={setFunnel}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All funnels</SelectItem>
            <SelectItem value="tourist">Tourist</SelectItem>
            <SelectItem value="masterminds">Masterminds</SelectItem>
            <SelectItem value="real_estate">Real Estate</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={applyFilters}>Apply</Button>
        <a href={`/api/exports/leads?funnel=${funnel}${q ? `&q=${encodeURIComponent(q)}` : ""}`} target="_blank" rel="noopener">
          <Button variant="outline">Export CSV</Button>
        </a>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Funnel</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Source</th>
              <th className="px-4 py-2">Cruise ship</th>
              <th className="px-4 py-2">Coupon</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="px-4 py-2 font-mono text-xs">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-4 py-2">{r.funnel}</td>
                <td className="px-4 py-2">{canSeePii ? `${r.first_name ?? ""} ${r.last_name ?? ""}` : `${(r.first_name ?? "")[0] ?? ""}.`}</td>
                <td className="px-4 py-2">{canSeePii ? r.email : redactEmail(r.email)}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.source_origin ?? "—"}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.cruise_ship ?? "—"}</td>
                <td className="px-4 py-2 font-mono">{r.coupon_code ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No leads match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Create the CSV export route**

```ts
// app/api/exports/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getCurrentAdminUser } from "@/lib/auth/current-user";

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "string" ? v : JSON.stringify(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

export async function GET(req: NextRequest) {
  const user = await getCurrentAdminUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const funnel = sp.get("funnel");
  const q = sp.get("q");

  const supabase = await getServerSupabase();
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (funnel && funnel !== "all") query = query.eq("funnel", funnel);
  if (q) query = query.or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const csv = toCSV(data ?? []);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="prm-leads-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(admin): leads page with search/filter/CSV export + PII redaction by role"
```

---

### Task K2: Real-estate leads page

**Files:**
- Create: `app/(admin)/admin/real-estate-leads/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/(admin)/admin/real-estate-leads/page.tsx
import { getServerSupabase } from "@/lib/supabase/server";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
import { can } from "@/lib/auth/roles";

export default async function RealEstateLeadsPage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  if (!can(user.role, "read:real_estate_leads")) redirect("/admin");

  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("leads").select("*").eq("funnel", "real_estate").order("created_at", { ascending: false }).limit(500);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Real Estate Leads</h1>
        <p className="mt-1 text-muted-foreground">Act 60 + real estate inquiries from the footer form.</p>
      </header>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Interests</th>
              <th className="px-4 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((r) => {
              const payload = (r.payload ?? {}) as Record<string, unknown>;
              return (
                <tr key={r.id} className="border-b align-top">
                  <td className="px-4 py-2 font-mono text-xs">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{r.first_name} {r.last_name}</td>
                  <td className="px-4 py-2">{r.email}</td>
                  <td className="px-4 py-2">{r.phone ?? "—"}</td>
                  <td className="px-4 py-2">{Array.isArray(payload.interests) ? (payload.interests as string[]).join(", ") : "—"}</td>
                  <td className="px-4 py-2 max-w-md">{typeof payload.note === "string" ? payload.note : "—"}</td>
                </tr>
              );
            })}
            {(data?.length ?? 0) === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No real estate leads yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(admin): real-estate leads page with role gate"
```

---

### Task K3: Cruise calendar admin

**Files:**
- Create: `app/(admin)/admin/cruise-calendar/page.tsx`
- Create: `app/(admin)/admin/cruise-calendar/cruise-form.tsx`
- Create: `app/api/admin/cruise-calendar/route.ts`
- Modify: `db/seed/ships.ts`

- [ ] **Step 1: Seed the ship list**

```ts
// db/seed/ships.ts
// We don't store ships in their own table in v1 — they live in code so the admin
// dropdown is fast and editable in one place. If we later need to attach metadata,
// promote this to a `ships` table.

export const SHIPS = [
  // mega_family
  { name: "Symphony of the Seas", line: "Royal Caribbean", segment: "mega_family" },
  { name: "Wonder of the Seas", line: "Royal Caribbean", segment: "mega_family" },
  { name: "Icon of the Seas", line: "Royal Caribbean", segment: "mega_family" },
  { name: "Oasis of the Seas", line: "Royal Caribbean", segment: "mega_family" },
  { name: "Mardi Gras", line: "Carnival", segment: "mega_family" },
  { name: "Celebration", line: "Carnival", segment: "mega_family" },
  { name: "Jubilee", line: "Carnival", segment: "mega_family" },
  { name: "Disney Magic", line: "Disney", segment: "mega_family" },
  { name: "Disney Fantasy", line: "Disney", segment: "mega_family" },
  { name: "Disney Wish", line: "Disney", segment: "mega_family" },
  { name: "Norwegian Prima", line: "Norwegian", segment: "mega_family" },
  { name: "Norwegian Viva", line: "Norwegian", segment: "mega_family" },
  // premium_mainstream
  { name: "Celebrity Equinox", line: "Celebrity", segment: "premium_mainstream" },
  { name: "Celebrity Apex", line: "Celebrity", segment: "premium_mainstream" },
  { name: "Celebrity Reflection", line: "Celebrity", segment: "premium_mainstream" },
  { name: "Caribbean Princess", line: "Princess", segment: "premium_mainstream" },
  { name: "Royal Princess", line: "Princess", segment: "premium_mainstream" },
  { name: "Sky Princess", line: "Princess", segment: "premium_mainstream" },
  { name: "Eurodam", line: "Holland America", segment: "premium_mainstream" },
  { name: "Nieuw Statendam", line: "Holland America", segment: "premium_mainstream" },
  { name: "MSC Seascape", line: "MSC", segment: "premium_mainstream" },
  { name: "MSC Divina", line: "MSC", segment: "premium_mainstream" },
  // luxury
  { name: "Seabourn Quest", line: "Seabourn", segment: "luxury" },
  { name: "Silver Spirit", line: "Silversea", segment: "luxury" },
  { name: "Seven Seas Splendor", line: "Regent", segment: "luxury" },
  { name: "Viking Sky", line: "Viking Ocean", segment: "luxury" },
  { name: "Viking Star", line: "Viking Ocean", segment: "luxury" },
  { name: "Oceania Riviera", line: "Oceania", segment: "luxury" },
  { name: "Windstar Star Pride", line: "Windstar", segment: "luxury" },
  // fun_ships
  { name: "Carnival Conquest", line: "Carnival", segment: "fun_ships" },
  { name: "Carnival Glory", line: "Carnival", segment: "fun_ships" },
  { name: "Carnival Sunshine", line: "Carnival", segment: "fun_ships" },
] as const;

export type Ship = (typeof SHIPS)[number];

export async function seedShips() {
  // Code-resident list — nothing to upsert. This function exists so the seed
  // runner can call it and log success.
  console.log(`  ship list embedded (${SHIPS.length} ships)`);
}
```

- [ ] **Step 2: Create the cruise-calendar API**

```ts
// app/api/admin/cruise-calendar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/roles";
import { SHIPS } from "@/db/seed/ships";

export async function POST(req: NextRequest) {
  const user = await getCurrentAdminUser();
  if (!user || !can(user.role, "manage:cruise_calendar")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { call_date, ships } = await req.json();
  if (!call_date || !Array.isArray(ships)) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  // Replace all rows for that date with the new selection
  await supabase.from("daily_port_calls").delete().eq("call_date", call_date);

  const rows = ships.map((shipName: string) => {
    const meta = SHIPS.find((s) => s.name === shipName);
    if (!meta) return null;
    return {
      call_date,
      ship_name: meta.name,
      cruise_line: meta.line,
      call_type: "transit",
      demo_segment: meta.segment,
      added_by: user.id,
    };
  }).filter(Boolean);

  if (rows.length === 0) return NextResponse.json({ ok: true });
  const { error } = await supabase.from("daily_port_calls").insert(rows as Array<NonNullable<typeof rows[number]>>);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Create the cruise-form client component**

```tsx
// app/(admin)/admin/cruise-calendar/cruise-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SHIPS } from "@/db/seed/ships";

export function CruiseForm({ initialDate, initialShips }: { initialDate: string; initialShips: string[] }) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [picked, setPicked] = useState<string[]>(initialShips);
  const [pending, startTransition] = useTransition();

  function togglePick(name: string) {
    setPicked((cur) => cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name]);
  }
  function save() {
    startTransition(async () => {
      await fetch("/api/admin/cruise-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_date: date, ships: picked }),
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-3">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Button onClick={save} disabled={pending} className="bg-prm-coral hover:bg-prm-coral/90">
          {pending ? "Saving…" : `Save (${picked.length} ships)`}
        </Button>
      </div>

      {(["mega_family","premium_mainstream","luxury","fun_ships"] as const).map((segment) => (
        <section key={segment} className="rounded-xl border bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {segment.replace("_", " ")}
          </h3>
          <div className="grid gap-2 md:grid-cols-2">
            {SHIPS.filter((s) => s.segment === segment).map((s) => (
              <label key={s.name} className="flex items-center gap-2 text-sm">
                <Checkbox checked={picked.includes(s.name)} onCheckedChange={() => togglePick(s.name)} />
                <span className="text-secondary">{s.name}</span>
                <span className="text-xs text-muted-foreground">· {s.line}</span>
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create the page**

```tsx
// app/(admin)/admin/cruise-calendar/page.tsx
import { getServerSupabase } from "@/lib/supabase/server";
import { CruiseForm } from "./cruise-form";

export default async function CruiseCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const date = sp.date ?? today;

  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("daily_port_calls").select("*").eq("call_date", date);
  const initialShips = (data ?? []).map((r) => r.ship_name);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Cruise Calendar</h1>
        <p className="mt-1 text-muted-foreground">
          Tag which ships are in port. Every lead created today inherits the day's ship list,
          giving you ship-level segmentation in analytics.
        </p>
      </header>
      <CruiseForm initialDate={date} initialShips={initialShips} />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(admin): cruise calendar with per-day ship selection across 4 demo segments"
```

---

*Phase K complete — leads, real-estate leads, and cruise calendar shipped. Continue to Phase L.*

---

## Phase L — Admin CMS

Five CMS surfaces share the same pattern: server page lists rows, client form edits/creates one row. Task L1 establishes the pattern; L2–L6 apply it to each table.

### Task L1: Image upload helper + admin form primitive

**Files:**
- Create: `lib/admin/upload-image.ts`
- Create: `components/admin/image-upload.tsx`

- [ ] **Step 1: Create the upload route** at `app/api/admin/upload/route.ts`

```ts
// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";
import { getCurrentAdminUser } from "@/lib/auth/current-user";

const BUCKET = "prm-images";

export async function POST(req: NextRequest) {
  const user = await getCurrentAdminUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "misc");
  if (!(file instanceof File)) return NextResponse.json({ error: "no file" }, { status: 400 });

  const supabase = getServiceRoleSupabase();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const arrayBuf = await file.arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuf, {
    contentType: file.type, upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl });
}
```

- [ ] **Step 2: Ensure the `prm-images` bucket exists** — run once in Supabase Studio (or via SQL):

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('prm-images', 'prm-images', true)
ON CONFLICT DO NOTHING;
```

Add this to a new migration `supabase/migrations/0005_storage.sql` and apply:

```bash
npm run db:migrate
```

- [ ] **Step 3: Create the client image-upload component**

```tsx
// components/admin/image-upload.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ImageUpload({ folder, value, onChange }: { folder: string; value: string; onChange: (url: string) => void; }) {
  const [uploading, setUploading] = useState(false);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const { url } = await res.json();
      onChange(url);
    } finally { setUploading(false); }
  }

  return (
    <div className="space-y-2">
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" />
      <div className="flex items-center gap-2">
        <Input type="file" accept="image/*" onChange={upload} disabled={uploading} />
        {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
      </div>
      {value && <img src={value} alt="" className="mt-2 h-24 w-32 rounded object-cover" />}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(admin): image upload helper + Supabase storage bucket + UI component"
```

---

### Task L2: CMS · Excursions

**Files:**
- Create: `app/(admin)/admin/cms/excursions/page.tsx`
- Create: `app/(admin)/admin/cms/excursions/[id]/page.tsx`
- Create: `app/(admin)/admin/cms/excursions/[id]/excursion-form.tsx`
- Create: `app/api/admin/excursions/route.ts`
- Create: `app/api/admin/excursions/[id]/route.ts`

- [ ] **Step 1: Create the list page** (table of all excursions with new/edit links)

```tsx
// app/(admin)/admin/cms/excursions/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSupabase } from "@/lib/supabase/server";

export default async function ExcursionsCmsPage() {
  const supabase = await getServerSupabase();
  const { data } = await supabase.from("excursions").select("*").order("sort_order");
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-jakarta text-3xl font-bold text-secondary">CMS · Excursions</h1>
          <p className="mt-1 text-muted-foreground">{data?.length ?? 0} excursions on the public site.</p>
        </div>
        <Link href="/admin/cms/excursions/new">
          <Button className="bg-prm-coral hover:bg-prm-coral/90">New excursion</Button>
        </Link>
      </header>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2">Sort</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Price from</th>
              <th className="px-4 py-2">Hero</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((r) => (
              <tr key={r.id} className="border-b">
                <td className="px-4 py-2 font-mono text-xs">{r.sort_order}</td>
                <td className="px-4 py-2 text-secondary">{r.title}</td>
                <td className="px-4 py-2 text-xs">{r.type}</td>
                <td className="px-4 py-2 font-mono">${r.price_from_usd}</td>
                <td className="px-4 py-2">{r.is_hero ? "★" : ""}</td>
                <td className="px-4 py-2">{r.is_active ? "✓" : "—"}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/admin/cms/excursions/${r.id}`} className="text-prm-teal hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the edit page** at `app/(admin)/admin/cms/excursions/[id]/page.tsx`

```tsx
// app/(admin)/admin/cms/excursions/[id]/page.tsx
import { getServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ExcursionForm } from "./excursion-form";

export default async function EditExcursionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "new") {
    return <ExcursionForm initial={null} />;
  }
  const supabase = await getServerSupabase();
  const { data } = await supabase.from("excursions").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <ExcursionForm initial={data} />;
}
```

- [ ] **Step 3: Create the form**

```tsx
// app/(admin)/admin/cms/excursions/[id]/excursion-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";

type ExcursionRow = {
  id?: string; slug: string; title: string; short_description: string; long_description?: string | null;
  image_url: string; image_credit?: string | null; price_from_usd: number;
  duration_min: number; duration_max?: number | null; type: "cruise_day" | "multi_day" | "both";
  viator_slug: string; viator_attraction_id: string; viator_base_level: "San-Juan" | "Puerto-Rico" | "Vieques" | "Fajardo";
  category?: string | null; tags?: string[]; is_hero?: boolean; sort_order: number; is_active?: boolean;
};

export function ExcursionForm({ initial }: { initial: ExcursionRow | null }) {
  const router = useRouter();
  const [f, setF] = useState<ExcursionRow>(initial ?? {
    slug: "", title: "", short_description: "", image_url: "", price_from_usd: 0,
    duration_min: 60, type: "cruise_day", viator_slug: "", viator_attraction_id: "",
    viator_base_level: "San-Juan", category: "", tags: [], sort_order: 100, is_active: true, is_hero: false,
  });
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof ExcursionRow>(k: K, v: ExcursionRow[K]) => setF((cur) => ({ ...cur, [k]: v }));

  function save() {
    startTransition(async () => {
      const method = initial?.id ? "PATCH" : "POST";
      const url = initial?.id ? `/api/admin/excursions/${initial.id}` : "/api/admin/excursions";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      if (res.ok) router.push("/admin/cms/excursions");
    });
  }

  async function del() {
    if (!initial?.id || !confirm("Delete this excursion?")) return;
    await fetch(`/api/admin/excursions/${initial.id}`, { method: "DELETE" });
    router.push("/admin/cms/excursions");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-jakarta text-3xl font-bold text-secondary">
        {initial?.id ? "Edit excursion" : "New excursion"}
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Slug</Label><Input value={f.slug} onChange={(e) => set("slug", e.target.value)} /></div>
        <div><Label>Sort order</Label><Input type="number" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} /></div>
      </div>
      <div><Label>Title</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
      <div><Label>Short description</Label><Textarea value={f.short_description} onChange={(e) => set("short_description", e.target.value)} /></div>
      <div><Label>Long description (optional)</Label><Textarea rows={6} value={f.long_description ?? ""} onChange={(e) => set("long_description", e.target.value)} /></div>
      <div><Label>Image</Label><ImageUpload folder="excursions" value={f.image_url} onChange={(url) => set("image_url", url)} /></div>
      <div><Label>Image credit (optional)</Label><Input value={f.image_credit ?? ""} onChange={(e) => set("image_credit", e.target.value)} /></div>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Price from (USD)</Label><Input type="number" value={f.price_from_usd} onChange={(e) => set("price_from_usd", Number(e.target.value))} /></div>
        <div><Label>Duration min (min)</Label><Input type="number" value={f.duration_min} onChange={(e) => set("duration_min", Number(e.target.value))} /></div>
        <div><Label>Duration max (min)</Label><Input type="number" value={f.duration_max ?? 0} onChange={(e) => set("duration_max", Number(e.target.value) || null)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <Select value={f.type} onValueChange={(v) => set("type", v as ExcursionRow["type"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cruise_day">Cruise Day</SelectItem>
              <SelectItem value="multi_day">Multi-Day</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Viator base level</Label>
          <Select value={f.viator_base_level} onValueChange={(v) => set("viator_base_level", v as ExcursionRow["viator_base_level"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="San-Juan">San-Juan</SelectItem>
              <SelectItem value="Puerto-Rico">Puerto-Rico</SelectItem>
              <SelectItem value="Vieques">Vieques</SelectItem>
              <SelectItem value="Fajardo">Fajardo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Viator slug</Label><Input value={f.viator_slug} onChange={(e) => set("viator_slug", e.target.value)} placeholder="Old-San-Juan" /></div>
        <div><Label>Viator attraction id</Label><Input value={f.viator_attraction_id} onChange={(e) => set("viator_attraction_id", e.target.value)} placeholder="d903-a2460" /></div>
      </div>
      <div><Label>Category</Label><Input value={f.category ?? ""} onChange={(e) => set("category", e.target.value)} /></div>
      <div className="flex flex-wrap gap-6 pt-2">
        <label className="flex items-center gap-2"><Checkbox checked={f.is_hero ?? false} onCheckedChange={(v) => set("is_hero", Boolean(v))} /> Hero on homepage</label>
        <label className="flex items-center gap-2"><Checkbox checked={f.is_active ?? true} onCheckedChange={(v) => set("is_active", Boolean(v))} /> Active</label>
      </div>
      <div className="flex gap-3 pt-4">
        <Button onClick={save} disabled={pending} className="bg-prm-coral hover:bg-prm-coral/90">
          {pending ? "Saving…" : "Save"}
        </Button>
        {initial?.id && <Button variant="destructive" onClick={del}>Delete</Button>}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create the API routes**

```ts
// app/api/admin/excursions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/roles";

export async function POST(req: NextRequest) {
  const user = await getCurrentAdminUser();
  if (!user || !can(user.role, "write:cms")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json();
  const supabase = await getServerSupabase();
  const { error, data } = await supabase.from("excursions").insert(body).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
```

```ts
// app/api/admin/excursions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/roles";

async function gate() {
  const user = await getCurrentAdminUser();
  if (!user || !can(user.role, "write:cms")) return null;
  return user;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await gate())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();
  const supabase = await getServerSupabase();
  const { error } = await supabase.from("excursions").update(body).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await gate())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const supabase = await getServerSupabase();
  const { error } = await supabase.from("excursions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(admin): CMS for excursions (list, edit, create, delete + image upload)"
```

---

### Task L3: CMS · Future Excursions, Masterminds, Featured, Vendors

These four CMS pages follow the same shape as L2: a list page + an `[id]/page.tsx` route with a `<EntityForm>` client component + an `/api/admin/<table>/[id]?` route handler. Each varies only in the editable fields.

**Pattern (DRY reference — copy + adjust):**
1. List page: `app/(admin)/admin/cms/<table>/page.tsx`
2. Edit page: `app/(admin)/admin/cms/<table>/[id]/page.tsx`
3. Form component: `app/(admin)/admin/cms/<table>/[id]/<entity>-form.tsx`
4. API list-create: `app/api/admin/<table>/route.ts`
5. API patch-delete: `app/api/admin/<table>/[id]/route.ts`

All API routes follow the gate pattern from Task L2.

- [ ] **Step 1: Create CMS for `future_excursions`**

Fields on the form: slug, title, description, image (upload, folder `"future-excursions"`), image_source (select: unsplash/manual/ai_generated), category, is_sensitive (checkbox — flagged Coming Soon item), sort_order, is_active.

Reuse L2's pattern verbatim, swapping `excursions` → `future_excursions`, `ExcursionForm` → `FutureExcursionForm`, and the field list.

- [ ] **Step 2: Create CMS for `masterminds`**

Fields: slug, title, one_line, description, image (folder `"masterminds"`), destination_url, tier (select: paid_t1/local_t2), category, location, verified (checkbox), sort_order, is_active.

- [ ] **Step 3: Create CMS for `featured_destinations`**

Fields: title, description, image (folder `"featured"`), target_url, sort_order, starts_at (datetime, nullable), ends_at (datetime, nullable), is_active. Show click_count as a read-only stat in the form.

- [ ] **Step 4: Create CMS for `vendors`**

Fields: name, logo (image upload, folder `"vendors"`), address, description, website_url, phone, sort_order, is_active.

- [ ] **Step 5: Add each list page to the sidebar** — already done in `components/admin/sidebar.tsx`.

- [ ] **Step 6: Commit each CMS as its own commit**

```bash
# After each table's CMS is implemented and tested:
git add -A
git commit -m "feat(admin): CMS for <table_name>"
```

(One commit per table; 4 commits total for L3.)

---

*Phase L complete — every content table is admin-editable. Continue to Phase M.*

---

## Phase M — Users, Roles, Affiliate Config

### Task M1: Users & Roles management

**Files:**
- Create: `app/(admin)/admin/users/page.tsx`
- Create: `app/(admin)/admin/users/invite-form.tsx`
- Create: `app/api/admin/users/route.ts`
- Create: `app/api/admin/users/[id]/route.ts`

- [ ] **Step 1: Create the page**

```tsx
// app/(admin)/admin/users/page.tsx
import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { getServerSupabase } from "@/lib/supabase/server";
import { InviteForm } from "./invite-form";

export default async function UsersPage() {
  const me = await getCurrentAdminUser();
  if (!me || me.role !== "super_admin") redirect("/admin");
  const supabase = await getServerSupabase();
  const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false });
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Users & Roles</h1>
        <p className="mt-1 text-muted-foreground">Invite developers, investors, and officials. Super admin only.</p>
      </header>
      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 font-semibold text-secondary">Invite a new admin</h2>
        <InviteForm />
      </section>
      <section className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2">Force PW change</th>
              <th className="px-4 py-2">Last login</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id} className="border-b">
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.full_name ?? "—"}</td>
                <td className="px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">{u.role}</td>
                <td className="px-4 py-2">{u.is_active ? "✓" : "—"}</td>
                <td className="px-4 py-2">{u.force_password_change ? "yes" : "no"}</td>
                <td className="px-4 py-2 font-mono text-xs">{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Create the invite form**

```tsx
// app/(admin)/admin/users/invite-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLES = [
  "developer_real_estate","developer_excursion","investor","official","view_only",
] as const;

export function InviteForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("view_only");
  const [tempPw, setTempPw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function invite() {
    setError(null); setTempPw(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, full_name: name, role }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "invite failed"); return; }
      setTempPw(json.temp_password);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div>
          <Label>Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as typeof ROLES[number])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {tempPw && (
        <div className="rounded border border-success bg-success/5 p-3 text-sm">
          Invite sent. Share these credentials securely:
          <div className="mt-2 font-mono text-secondary">{email} / {tempPw}</div>
          <p className="mt-1 text-xs text-muted-foreground">User will be forced to change on first login.</p>
        </div>
      )}
      <Button onClick={invite} disabled={!email || !name || pending} className="bg-prm-coral hover:bg-prm-coral/90">
        {pending ? "Inviting…" : "Invite"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Create the API**

```ts
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

function generateTempPassword(): string {
  // Easy-to-read mix of letters/digits + a fixed special
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let body = "";
  for (let i = 0; i < 10; i++) body += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `PRM!${body}`;
}

export async function POST(req: NextRequest) {
  const me = await getCurrentAdminUser();
  if (!me || me.role !== "super_admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { email, full_name, role } = await req.json();
  if (!email || !role) return NextResponse.json({ error: "missing email or role" }, { status: 400 });

  const supabase = getServiceRoleSupabase();
  const tempPw = generateTempPassword();
  const { data, error } = await supabase.auth.admin.createUser({
    email, password: tempPw, email_confirm: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { error: upsertErr } = await supabase.from("users").upsert({
    id: data.user.id, email, full_name, role,
    force_password_change: true, is_active: true, invited_by: me.id, invited_at: new Date().toISOString(),
  });
  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 });

  await supabase.from("audit_log").insert({
    actor_user_id: me.id, action: "create_user", entity_type: "user", entity_id: data.user.id,
    after_value: { email, role },
  });

  return NextResponse.json({ ok: true, temp_password: tempPw });
}
```

- [ ] **Step 4: Add role-change + deactivate** at `app/api/admin/users/[id]/route.ts`

```ts
// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentAdminUser();
  if (!me || me.role !== "super_admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const { role, is_active } = await req.json();
  const supabase = getServiceRoleSupabase();

  const { data: before } = await supabase.from("users").select("role, is_active").eq("id", id).maybeSingle();
  const { error } = await supabase.from("users").update({ role, is_active }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_log").insert({
    actor_user_id: me.id, action: "update_user", entity_type: "user", entity_id: id,
    before_value: before, after_value: { role, is_active },
  });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(admin): users + roles management (super_admin only) with audit log"
```

---

### Task M2: Affiliate config view

**Files:**
- Create: `app/(admin)/admin/affiliate/page.tsx`

- [ ] **Step 1: Create the page** (read-only in v1; spec §22 swap UI is fast follow)

```tsx
// app/(admin)/admin/affiliate/page.tsx
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";

export default async function AffiliatePage() {
  const me = await getCurrentAdminUser();
  if (!me) redirect("/admin/login");

  const pid = process.env.VIATOR_PID ?? "(unset)";
  const mcid = process.env.VIATOR_MCID ?? "(unset)";
  const medium = process.env.VIATOR_MEDIUM ?? "(unset)";

  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Affiliate Config</h1>
        <p className="mt-1 text-muted-foreground">Current affiliate plumbing for Viator and Expedia (read-only v1; swap UI in phase 2).</p>
      </header>

      <section className="rounded-xl border bg-white p-5">
        <h3 className="mb-3 font-semibold text-secondary">Viator</h3>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Partner ID (pid)</dt><dd className="font-mono">{pid}</dd>
          <dt className="text-muted-foreground">Marketing channel (mcid)</dt><dd className="font-mono">{mcid}</dd>
          <dt className="text-muted-foreground">Medium</dt><dd className="font-mono">{medium}</dd>
          <dt className="text-muted-foreground">Fallback URL</dt>
          <dd className="font-mono break-all">https://www.viator.com/Puerto-Rico-attractions/San-Juan-Gate/d36-a19408</dd>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          Update by editing env vars (VIATOR_PID, VIATOR_MCID, VIATOR_MEDIUM) on the host.
        </p>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h3 className="mb-3 font-semibold text-secondary">Expedia Group</h3>
        <p className="text-sm">Banner widget renders in the public footer + /coupon page.</p>
        <p className="mt-2 text-xs text-muted-foreground">
          <strong>To verify:</strong> the banner ships with <code>data-camref="undefined"</code> (a literal string).
          Check the Expedia affiliate dashboard whether <code>data-pubref="Puerto-Rico"</code> is sufficient for
          attribution, or whether a real camref is required.
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(admin): affiliate config read-only view (Viator + Expedia)"
```

---

*Phase M complete — admin is feature-complete. Continue to Phase N.*

---

## Phase N — Smoke Tests, README, GitHub Push

### Task N1: Manual smoke test of full system

- [ ] **Step 1: Reset local DB and re-seed**

```bash
npm run db:reset
npm run db:seed
```

- [ ] **Step 2: Walk every flow in `npm run dev`**

Tourist funnel:
- `/` → mode toggle switches hero excursions
- click an excursion → `/excursions/[slug]`
- click "Book this Excursion" → `/gate/excursions:<slug>`
- enter name+email → click "No thanks" → opens Viator with `campaign=gate-no-<slug>` (verify in URL)
- back, click "Yes" → /survey → star 5 → /rank → drag → submit → /coupon
- click "Download Coupon (PDF)" → PDF downloads with code + name
- click "BOOK EXCURSIONS" → opens Viator with `campaign=coupon-page-book-<slug>`

Masterminds funnel:
- `/masterminds` → click any mastermind → `/masterminds/[slug]` → "I'm Interested" → `/masterminds/gate/masterminds:<slug>`
- "No thanks" → opens that mastermind's destination URL
- back, "Yes" → /masterminds/survey → star 5 → rank → /masterminds/thanks → countdown redirect to mastermind URL

Modal:
- visit `/` in incognito, wait 12s → modal appears, click "Yes" → /gate/modal:homepage works
- "No thanks" sets cookie; reload → modal does not reappear

Real estate form:
- footer → check Real Estate or Act 60 → fill name+email → submit → land on /real-estate-interest

Admin:
- visit `/admin` → login screen
- sign in `jeff.cline@me.com` / new password → overview loads
- check Tourist Funnel and Masterminds Funnel — they should reflect data captured above
- Future Excursions Leaderboard shows Borda-scored rows
- Leads page lists all captures with funnel filter + CSV export downloads
- Real Estate Leads page lists the footer submission
- CMS · Excursions: edit one entry's title; reload homepage; new title appears
- Cruise Calendar: pick today, check 2-3 ships, save; create a new lead via the public funnel; check that lead's `cruise_ship` and `cruise_demo_segment` get populated (note: v1 reads ship tags at lead-creation time — this requires a small server-action enhancement to read from `daily_port_calls` on insert)

- [ ] **Step 3: Add cruise auto-tagging to `createLead`** — modify `lib/leads/create-lead.ts`:

After `const supabase = await getServerSupabase();` and before the insert, add:

```ts
const today = new Date().toISOString().slice(0, 10);
const { data: portCalls } = await supabase
  .from("daily_port_calls").select("ship_name, cruise_line, demo_segment, call_type").eq("call_date", today);

const firstShip = portCalls?.[0];
const cruiseFields = firstShip ? {
  cruise_ship: firstShip.ship_name,
  cruise_line: firstShip.cruise_line,
  cruise_call_type: firstShip.call_type,
  cruise_demo_segment: firstShip.demo_segment,
} : {};
```

Then merge `...cruiseFields` into the insert payload. If multiple ships are in port, v1 uses the first — phase 2 can store an array or pick the dominant demo.

- [ ] **Step 4: Commit smoke fixes**

```bash
git add -A
git commit -m "feat(leads): auto-tag cruise ship + line + segment from daily_port_calls at create-time"
```

---

### Task N2: Update README with deployment notes

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the README content**

```markdown
# Puerto Rico Masterminds (PRM)

Tourism data-capture + lead-gen platform for San Juan, PR. See `docs/superpowers/specs/2026-05-14-puerto-rico-tourism-data-capture-design.md` for the design and `docs/superpowers/plans/2026-05-14-prm-implementation.md` for the implementation plan.

**Production domain:** `PuertoRicoMasterminds.com`
**Repo:** https://github.com/jeff-cline/puertoricomasterminds

## Quickstart (local)

```bash
cp .env.local.example .env.local   # fill in Supabase keys
npm install
npm run db:start                   # local Supabase via Docker
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000

## Test

```bash
npm test
```

## Deployment

This project **does not deploy to Vercel from this repo**. The user has an external
go-live agent that takes over once code is pushed to GitHub `main`. Our handoff = `git push`.

DNS, hosting, and env-var provisioning for `PuertoRicoMasterminds.com` are managed by that agent.

## Admin

Visit `/admin`. First login:

- Email: `jeff.cline@me.com`
- Temp password: `TEMP!234`
- You will be forced to change the password on first login.

Invite additional admins from `/admin/users`.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind + shadcn/ui · Supabase (Postgres + Auth + Storage) · Vitest · @dnd-kit · jsPDF.
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "docs: README with quickstart, admin login info, deployment handoff note"
```

---

### Task N3: Add GitHub remote and push

- [ ] **Step 1: Add the remote**

```bash
git remote add origin https://github.com/jeff-cline/puertoricomasterminds.git
```

- [ ] **Step 2: Verify remote**

```bash
git remote -v
```

Expected: `origin  https://github.com/jeff-cline/puertoricomasterminds.git (fetch)` (and push).

- [ ] **Step 3: Push the branch**

```bash
git push -u origin main
```

If the GitHub repo already has commits (e.g. an auto-init README), the push will be rejected. **Do not force-push** — instead:

```bash
git pull origin main --rebase --allow-unrelated-histories
# resolve conflicts if any
git push -u origin main
```

- [ ] **Step 4: Notify the user that the push is complete and the go-live agent can take over.**

---

*Phase N complete — code is on GitHub, ready for the external go-live agent.*

---

## Self-Review

After writing every phase, this checklist runs against the spec.

**Spec coverage check:**

| Spec section | Plan task(s) |
|---|---|
| §4 Tech stack | A1–A4 |
| §5 Sitemap (all public routes) | D6–D8, E4, E6, E7, E8, F2–F5, G2, G3 |
| §5 Admin routes | H3–H6, I2–I4, J2–J3, K1–K3, L2, L3, M1, M2 |
| §6 Visual direction | A3, D1, D2 |
| §7 Tourist funnel | E1–E9 |
| §8 Masterminds funnel | F1–F5 |
| §9 Help modal | G1 |
| §10 Real-estate footer form | G2 |
| §11 Coupon code + redemption | E1, E8, E9 |
| §12 Data model (all 11 tables) | B2 |
| §13 Affiliate strategy (Viator + Expedia) | C1, C2, C3, M2 |
| §14 Cruise ship tagging | K3, N1 step 3 (auto-tag) |
| §15 Admin dashboard | I, J, K, L, M |
| §16 Auth + role matrix | H1–H6 |
| §17 Analytics + aggregations | B4, I, J |
| §18 Content inventory | D5, E5, F1, K3 (ships) |
| §19 Image strategy | C3, D3, L1 |
| §20 Email (phase 2) | (out of scope for v1) |
| §21 Phased rollout | Phase ordering A–N matches |
| §22 Open questions | Resolved (#2 domain) or flagged in spec |
| §23 Deployment | N2, N3 |

All sections have a corresponding task.

**Placeholder scan:** No "TBD", no "implement later", no "similar to Task N". L3 references the L2 pattern but enumerates the fields to change — that's a guided pattern, not a placeholder.

**Type consistency:** `ExcursionCardData`, `MastermindCardData`, `ConceptCardData`, `RankableItem`, `LeadInput`, `Role`, `Action` are defined once each and used consistently. `buildViatorUrl` opts and `campaignHandle` opts match across producers and consumers. `EventType` and `EventEntityType` are defined in C5 and used in C5's `trackEvent` calls throughout the funnel pages.

**Ambiguity check:** Funnel decisions, pick counts (5–10), rank positions (1–N), and the role matrix are unambiguous. No two-way reads of any requirement.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-14-prm-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task with the spec + plan as context. Each task is independent; I review the diff between tasks and reject anything off-target before moving on. Fast iteration, parallel where possible, minimal context drift.

**2. Inline Execution** — I execute tasks myself in this session, batching to checkpoints (end of each phase) for your review.

Which approach?









