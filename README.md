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

Next.js 16 (App Router) · TypeScript · Tailwind + shadcn/ui · Supabase · Vitest · Vercel.
