# JobFinder Agent Skills Registry

## SKILL: INTERNET_SEARCHER

Before ANY file, search for current versions, docs, and breaking changes.
Document findings in docs/internet-research.md.
Never rely on training data for package versions.

Activation: always active

## SKILL: REPO_MINER

Search GitHub for open-source job repos, extract APIs, schemas, scraper patterns.
Queries: "job board" typescript stars:>100, "remote jobs api" stars:>50.
Use only MIT/Apache-2.0/ISC code patterns.
Never copy code directly; reimplement patterns.

Activation: "Use REPO_MINER to find [topic]"

## SKILL: API_BUILDER

Build complete Next.js App Router route handlers.
Always include: TypeScript, zod validation, error handling, retry logic,
rate-limit headers, async-safe patterns, cache headers.
Never return raw upstream errors.

Activation: "Use API_BUILDER to create [route]"

## SKILL: UI_BUILDER

Build bold colorful Glassdoor-style components.
Always: mobile-first, Tailwind v4 classes, shadcn/ui, skeleton loaders,
error states, empty states, dark mode.

Activation: "Use UI_BUILDER to create [component]"

## SKILL: DB_ARCHITECT

Design Supabase SQL with RLS, indexes, triggers, generated columns.
Always use uuid PKs, timestamptz, and if-not-exists guards.

Activation: "Use DB_ARCHITECT to create [table]"

## SKILL: SYNC_ENGINE

Build Vercel Cron fetchers with Upstash Redis caching.
Always use upsert, normalization, sync_logs reporting, Promise.allSettled,
and resilient per-source failure handling.

Activation: "Use SYNC_ENGINE to build [fetcher]"

## SKILL: SEO_BUILDER

Add generateMetadata, OG tags, Twitter cards, canonical URLs,
JSON-LD JobPosting, sitemap and robots entries.

Activation: "Use SEO_BUILDER for [page]"

## SKILL: DEPLOY_HELPER

Guide mobile-only setup with numbered steps and exact button names.
Do not assume user can run terminal commands.

Activation: "Use DEPLOY_HELPER for [task]"

## SKILL: PERF_AUDITOR

Audit for image optimization, list rendering efficiency, cache correctness,
unused imports, missing loading states, and Suspense/error boundaries.

Activation: "Use PERF_AUDITOR on [feature]"

## SKILL: SECURITY_CHECKER

Audit for exposed secrets, missing CRON_SECRET checks, weak API protection,
missing security headers, XSS/CORS issues, and RLS gaps.

Activation: "Use SECURITY_CHECKER on [file]"
