# API Guide (Phase 1 baseline)

## RemoteOK
- URL: https://remoteok.com/api
- Auth: None
- Notes: first item is metadata object; skip before mapping jobs.

## Arbeitnow
- URL: https://www.arbeitnow.com/api/job-board-api
- Auth: None
- Notes: paginated endpoint but currently returns anti-bot challenge from server-side curl in this environment.

## Himalayas
- URL: https://himalayas.app/jobs/api
- Auth: None
- Notes: supports API response updates and includes company/job metadata fields.

## Remotive
- URL: https://remotive.com/api/remote-jobs
- Auth: None
- Notes: supports category filters; payload includes warning string about domain migration.

## Jobicy
- URL: https://jobicy.com/api/v2/remote-jobs
- Auth: None
- Notes: supports count/geo/industry/tag filters.

## The Muse
- URL: https://www.themuse.com/api/public/jobs
- Auth: Key optional depending usage profile
- Notes: page-based pagination.

## JSearch
- URL: https://jsearch.p.rapidapi.com/search
- Auth: RapidAPI key required
- Notes: enforce strict quota-aware retry handling.

## Adzuna
- URL: https://api.adzuna.com/v1/api/jobs/{country}/search/1
- Auth: app_id + app_key required
- Notes: query multiple countries in sync worker.
