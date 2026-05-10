# REPO_MINER Findings (2026-05-10)

## Selection criteria

- GitHub repositories with stars >= 50
- Active after 2022 (queried pushed >= 2023-01-01)
- Preferred licenses for pattern extraction: MIT, Apache-2.0, ISC
- No direct code copying; only architecture and schema patterns reimplemented

## High-value repositories reviewed

### speedyapply/JobSpy (MIT)

- Stars/activity: 3k+, active in 2026.
- Useful patterns:
  - Multi-source scraper abstraction with per-source adapter classes and shared model.
  - Source-specific pagination cursors (for example nextCursor style data flows).
  - Dedup strategy using seen URLs/IDs before expensive detail fetch.
  - Structured normalized job schema with extensible source-specific fields.
  - Retry/delay controls and anti-rate-limit practices.
- Endpoint/pattern examples extracted:
  - LinkedIn guest search endpoint pattern with query params and offsets.
  - Indeed GraphQL-style payload parsing and normalized conversion flow.
- Schema cues to reimplement:
  - Core fields: id/source/source_id/title/company/location/description/job_url/date_posted/remote/job_type/compensation.
  - Optional enrichment fields: company metadata, direct apply URL, extracted emails.

### PaulMcInnis/JobFunnel (MIT)

- Stars/activity: 2k+, active post-2022.
- Useful patterns:
  - Base scraper with required-field contract enforcement.
  - Distinct get() and set() phases for staged field extraction.
  - Delayed execution for expensive/detail fetches only.
  - Central duplicate filtering and key prefixing by provider.
  - Threaded scraping with per-source failure isolation.
- Schema cues to reimplement:
  - Standardized output headers for provider/query/remoteness/tags/wage/post date.
  - Strongly typed enum-style field system to reduce parser drift.

### spinlud/py-linkedin-jobs-scraper (MIT)

- Stars/activity: 475+, active post-2022.
- Useful patterns:
  - URL-driven filter mapping (time, type, experience, onsite/remote, salary bands).
  - Anonymous vs authenticated modes with different capabilities.
  - Controlled throttling knobs (slow_mo, max_workers) to reduce 429s.
  - Event-driven pipeline callbacks for data, metrics, and errors.
- Schema cues to reimplement:
  - Fields: job_id, link, apply_link, title, company, company_link, place, description, date, insights.

## Additional repo scan summary

- Query sets run:
  - job board stars>=50 pushed>=2023-01-01
  - remote jobs stars>=50 pushed>=2023-01-01
  - job scraper stars>=50 pushed>=2023-01-01
- Not all results are directly usable job APIs; many are curation lists or unrelated noise terms.
- License filtering is essential before using repo patterns.

## Reimplementable architecture patterns for JobFinder

1. Source adapter interface

- Each source returns { source, jobs, error? } with same normalized output type.

1. Two-stage extraction

- Stage A: cheap list fetch/parse.
- Stage B: optional detail enrichment only when needed.

1. Provider-safe dedupe

- Dedupe key format: source + source_id.
- Keep in-memory set during sync and enforce DB unique(source, source_id).

1. Failure isolation

- Promise.allSettled for all fetchers.
- One source failure must not block the daily sync.

1. Respectful throttling

- Retry with exponential backoff (1s/2s/4s).
- Per-source delays when challenged.

1. Validation-first writes

- Validate source payloads with Zod before normalization.
- Skip invalid records, log structured validation errors.

## Candidate source endpoints collected from mining

- Greenhouse boards API: [boards-api.greenhouse.io/v1/boards/{board_token}/jobs](https://boards-api.greenhouse.io/v1/boards/%7Bboard_token%7D/jobs)
- Lever postings API: [api.lever.co/v0/postings/{company}?mode=json](https://api.lever.co/v0/postings/%7Bcompany%7D?mode=json)
- We Work Remotely RSS: [weworkremotely.com/categories/remote-jobs.rss](https://weworkremotely.com/categories/remote-jobs.rss)

## Decision notes

- Better option chosen: adapter-based fetchers over one giant parser.
- Reason: easier isolation of provider breakages and cleaner long-term maintenance.
