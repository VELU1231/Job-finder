# JobFinder

Global job discovery platform built with Next.js App Router, TypeScript, Supabase, and multi-source job ingestion.

## Current Status

- Phase 1 is in progress.
- Internet/API/package research has been completed and documented.
- Project scaffold files are created.

See current progress in docs/BUILD_LOG.md.

## Project Goals

- Aggregate jobs from multiple APIs and feeds into one normalized schema.
- Provide fast search, filtering, and mobile-first browsing UX.
- Run resilient daily sync with per-source failure isolation.
- Ship production baseline security, observability, and performance hygiene.

## Stack

- Next.js 16.2.6
- React 19.2.6
- TypeScript 6.0.3 (strict)
- Tailwind CSS v4
- Supabase (Postgres + Storage)
- Upstash Redis
- Zod
- Serwist (PWA)
- Vercel Analytics
- Sentry

Exact versions: docs/api-versions.md

## Key Documentation

- docs/BUILD_LOG.md: canonical build progress tracker
- docs/internet-research.md: latest research and API checks
- docs/repo-research.md: REPO_MINER findings
- docs/api-guide.md: source-by-source API notes
- docs/schema.sql: Supabase schema
- guide.md: mobile-friendly setup/deployment guide

## Repository Structure

- app/: Next.js App Router files
- docs/: architecture, research, build logs, schema
- .github/copilot-instructions.md: compressed project memory for Copilot
- AGENTS.md: skill registry and execution rules

## Quick Start

1. Install dependencies:

```bash
npm install
```

1. Copy environment template:

```bash
cp .env.example .env.local
```

1. Fill required keys in .env.local.
1. Run development server:

```bash
npm run dev
```

For full mobile-friendly setup steps, use guide.md.

## Security Baseline

- CRON_SECRET must protect /api/sync.
- Never expose SUPABASE_SERVICE_ROLE_KEY client-side.
- RLS policies are included in schema and enabled from Phase 1.

## License

No project license file is set yet.
