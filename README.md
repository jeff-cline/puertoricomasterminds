# Puerto Rico Masterminds (PRM)

Tourism data-capture + lead-gen platform for San Juan, PR.

- **Spec:** `docs/superpowers/specs/2026-05-14-puerto-rico-tourism-data-capture-design.md`
- **Plan:** `docs/superpowers/plans/2026-05-14-prm-implementation.md`
- **Production domain:** `PuertoRicoMasterminds.com`
- **Repo:** https://github.com/jeff-cline/puertoricomasterminds

## Quickstart (local)

1. `cp .env.local.example .env.local` and fill in the three Supabase values:
   - `NEXT_PUBLIC_SUPABASE_URL` — project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public/publishable key
   - `SUPABASE_SERVICE_ROLE_KEY` — service_role / secret key (required for admin operations + seeds)
2. Apply migrations to your Supabase project. We do NOT use the Supabase CLI / Docker. Instead, open Supabase Dashboard → SQL Editor and run the files in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_indexes.sql`
   - `supabase/migrations/0003_views.sql`
   - `supabase/migrations/0004_rls.sql`
   - `supabase/migrations/0005_storage.sql`
3. `npm install`
4. `npm run db:seed` — creates the super-admin auth user (jeff.cline@me.com / TEMP!234) + populates 40 excursions, 18 Coming Soon concepts, and 20 masterminds.
5. `npm run dev` — site on http://localhost:3000

## Test

`npm test`

## Deployment

This repo's go-live to `PuertoRicoMasterminds.com` is handled by an external agent. Our handoff is `git push` to https://github.com/jeff-cline/puertoricomasterminds. Do not run `vercel deploy` from here.

## Admin

Visit `/admin`. First login:

- Email: `jeff.cline@me.com`
- Temp password: `TEMP!234`
- You will be forced to change the password on first login.

Invite additional admins from `/admin/users`.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 + shadcn/ui · Supabase (Postgres + Auth + Storage) · Vitest · @dnd-kit · jsPDF.
