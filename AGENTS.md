# JobFinder Agent Skills Registry

## SKILL: REPO_MINER
When activated, search GitHub for open-source job repos.
Extract: API endpoints, schema designs, scraper patterns, job board URLs.
Safe to use if license is MIT, Apache 2.0, or ISC.
Never copy code directly — extract patterns and reimplement.

Activation: "Use REPO_MINER skill to find [topic]"

## SKILL: API_BUILDER  
Build complete API route files for Next.js App Router.
Always include: error handling, retry logic (3 attempts), rate limit headers, TypeScript types.
Never return raw API errors to client.

Activation: "Use API_BUILDER to create [route]"

## SKILL: UI_BUILDER
Build bold, colorful Glassdoor-inspired components.
Always: mobile-first, Tailwind + shadcn/ui, accessible, skeleton loaders included.
Color palette: violet, emerald, amber, rose — never plain gray UI.

Activation: "Use UI_BUILDER to create [component]"

## SKILL: DB_ARCHITECT
Design and write Supabase SQL migrations.
Always include: RLS policies (even if disabled for now), indexes on searchable columns, 
uuid primary keys, created_at/updated_at timestamps.

Activation: "Use DB_ARCHITECT to create [table/migration]"

## SKILL: SYNC_ENGINE
Build Vercel Cron jobs that fetch from all job APIs.
Always: upsert (not duplicate), normalize to unified schema, 
log results, handle API failures gracefully.

Activation: "Use SYNC_ENGINE to build [fetcher]"

## SKILL: DEPLOY_HELPER
Guide mobile-only user through Vercel + Supabase setup.
Give numbered steps with exact button names and field labels.
Never assume user can run terminal commands.

Activation: "Use DEPLOY_HELPER for [task]"
