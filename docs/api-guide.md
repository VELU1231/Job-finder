# API Guide

## RemoteOK

- URL: [remoteok.com/api](https://remoteok.com/api)
- Auth: None
- Notes: first item is metadata object; skip before mapping jobs.

## Arbeitnow

- URL: [www.arbeitnow.com/api/job-board-api](https://www.arbeitnow.com/api/job-board-api)
- Auth: None
- Notes: paginated endpoint but currently returns anti-bot challenge from server-side curl in this environment.

## Himalayas

- URL: [himalayas.app/jobs/api](https://himalayas.app/jobs/api)
- Auth: None
- Notes: supports API response updates and includes company/job metadata fields.

## Remotive

- URL: [remotive.com/api/remote-jobs](https://remotive.com/api/remote-jobs)
- Auth: None
- Notes: supports category filters; payload includes warning string about domain migration.

## Jobicy

- URL: [jobicy.com/api/v2/remote-jobs](https://jobicy.com/api/v2/remote-jobs)
- Auth: None
- Notes: supports count/geo/industry/tag filters.

## The Muse

- URL: [www.themuse.com/api/public/jobs](https://www.themuse.com/api/public/jobs)
- Auth: Key optional depending usage profile
- Notes: page-based pagination.

## JSearch

- URL: [jsearch.p.rapidapi.com/search](https://jsearch.p.rapidapi.com/search)
- Auth: RapidAPI key required
- Notes: enforce strict quota-aware retry handling.

## Adzuna

- URL: [api.adzuna.com/v1/api/jobs/{country}/search/1](https://api.adzuna.com/v1/api/jobs/{country}/search/1)
- Auth: app_id + app_key required
- Notes: query multiple countries in sync worker.
