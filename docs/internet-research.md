# Internet Research (2026-05-10)

## Scope and method

- Ran live endpoint probes for core job APIs using curl with explicit user-agent and timeouts.
- Queried npm registry/npm view for latest package versions required by Phase 1 scaffold.
- Queried GitHub search for job board/scraper/API repositories with stars >= 50 and pushed >= 2023-01-01.

## Required query findings (Section 0)

1. next.js latest stable version npm 2026

- Result: next 16.2.6 (latest at time of check).

1. tailwind css v4 next.js setup 2026

- Result: tailwindcss 4.3.0 and @tailwindcss/postcss 4.3.0 are current.
- Note: v4 flow uses @import "tailwindcss" and PostCSS plugin @tailwindcss/postcss.

1. shadcn ui install next.js 2026 latest

- Result: install path still centered around shadcn CLI init flow.
- Decision: include shadcn initialization steps in docs; do not pin as runtime dependency.

1. supabase js v2 next.js app router 2026

- Result: @supabase/supabase-js 2.105.4 and @supabase/ssr 0.10.3 current.
- Decision: use @supabase/ssr for server/browser split clients.

1. serwist next.js pwa setup 2026

- Result: @serwist/next, @serwist/precaching, @serwist/sw all current at 9.5.11.
- Decision: use Serwist stack, avoid next-pwa.

1. eslint 9 flat config next.js 2026

- Result: eslint 10.3.0 current; flat config remains required.
- Decision: use eslint.config.mjs format.

1. remoteok api working 2026

- Live check: HTTP 200 and JSON returned.

1. arbeitnow api docs 2026

- Live check: HTTP 403 from direct curl (Cloudflare challenge page) without browser-like/session handling.
- Decision: keep source enabled but implement guarded fetch with fallback and error logging.

1. himalayas jobs api free 2026

- Live check: HTTP 200 and JSON returned; response includes comment text noting API updates.

1. remotive api free jobs 2026

- Live check: HTTP 200 and JSON returned with warning indicating canonical domain remotive.com.

## API availability snapshot

- RemoteOK
  - URL: [remoteok.com/api](https://remoteok.com/api)
  - Status: Live (200)
  - Notes: Metadata element first, then jobs list
- Arbeitnow
  - URL: [www.arbeitnow.com/api/job-board-api](https://www.arbeitnow.com/api/job-board-api)
  - Status: Restricted (403)
  - Notes: Cloudflare challenge in direct server-side curl
- Himalayas
  - URL: [himalayas.app/jobs/api](https://himalayas.app/jobs/api)
  - Status: Live (200)
  - Notes: Public JSON API
- Remotive
  - URL: [remotive.com/api/remote-jobs](https://remotive.com/api/remote-jobs)
  - Status: Live (200)
  - Notes: Domain migration warning present in payload
- Jobicy
  - URL: [jobicy.com/api/v2/remote-jobs](https://jobicy.com/api/v2/remote-jobs)
  - Status: Live (200)
  - Notes: docs URL included in payload
- The Muse
  - URL: [www.themuse.com/api/public/jobs](https://www.themuse.com/api/public/jobs)
  - Status: Live (200)
  - Notes: Public endpoint; key optional or conditional by usage level
- JSearch
  - URL: [jsearch.p.rapidapi.com/search](https://jsearch.p.rapidapi.com/search)
  - Status: Needs key (401)
  - Notes: RapidAPI key required
- Adzuna
  - URL: [api.adzuna.com/v1/api/jobs/us/search/1](https://api.adzuna.com/v1/api/jobs/us/search/1)
  - Status: Needs keys (400)
  - Notes: app_id and app_key required

## Additional free sources identified

- Greenhouse Jobs Board API style endpoint per company:
  - [boards-api.greenhouse.io/v1/boards/{board_token}/jobs](https://boards-api.greenhouse.io/v1/boards/%7Bboard_token%7D/jobs)
- Lever postings endpoint per company:
  - [api.lever.co/v0/postings/{company}?mode=json](https://api.lever.co/v0/postings/%7Bcompany%7D?mode=json)
- We Work Remotely RSS:
  - [weworkremotely.com/categories/remote-jobs.rss](https://weworkremotely.com/categories/remote-jobs.rss)
- USAJobs API (free with key registration):
  - [developer.usajobs.gov](https://developer.usajobs.gov/)

## Risk notes

- Scraper/source reliability varies by anti-bot policies; always isolate each source failure so sync continues.
- For challenged endpoints (example: Arbeitnow), keep retries and capture status/error payload snippets in sync logs.
