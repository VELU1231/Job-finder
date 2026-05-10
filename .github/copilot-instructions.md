# JobFinder Copilot Instructions (Compressed)

## Mission
Build JobFinder (Next.js App Router + TypeScript strict) as a global job discovery app with bold, colorful UI and mobile-first behavior.

## Always-on rules
- Always verify internet/package/API status before writing or updating core files.
- Never rely on stale package versions.
- Never leak raw upstream errors directly to clients.
- Keep source-specific failures isolated; sync must continue.
- Use normalized schema and dedupe by source + source_id.

## Stack decisions
- Next.js 16.2.6 + React 19.2.6
- Tailwind v4 style with @import "tailwindcss" and @tailwindcss/postcss
- Supabase via @supabase/supabase-js and @supabase/ssr
- Redis cache with @upstash/redis
- Validation via zod
- PWA via Serwist packages (@serwist/next, @serwist/precaching, @serwist/sw)
- Analytics via @vercel/analytics
- Error monitoring via @sentry/nextjs
- ESLint flat config (eslint.config.mjs)

## API source status
- Live: RemoteOK, Himalayas, Remotive, Jobicy, The Muse
- Restricted/challenged: Arbeitnow (direct 403 challenge)
- Key required: JSearch, Adzuna
- Additional source candidates: Greenhouse boards API, Lever postings API, WWR RSS

## Breaking-change reminders
- Tailwind v4: no legacy tailwind directives/config workflow from v3.
- ESLint: flat config.
- Next modern params/searchParams patterns require async-aware handling in app routes/pages.

## Build status pointer
- Canonical tracker: docs/BUILD_LOG.md
- Research baseline: docs/internet-research.md
- Repo mining notes: docs/repo-research.md
- Versions: docs/api-versions.md

## Work order
1. Internet/API verification
2. Repo mining
3. Scaffold
4. Supabase/types/validators/utils
5. Fetchers
6. API routes
7. UI components
8. Pages
9. SEO
10. PWA
11. Security pass
12. Performance pass

## Security baseline
- CRON_SECRET gate for sync endpoint.
- Security headers via middleware and next headers.
- RLS policies included from initial schema.
- Never expose service role key client-side.
