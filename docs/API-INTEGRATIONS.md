# API Integration Reference

**Version:** 2026-05-10  
**Purpose:** Document all integrations: job boards, cache, database, auth

---

## Job Board APIs

### 1. RemoteOK ✅ Live
```
Endpoint: https://remoteok.io/api/v0/remote_jobs
Method: GET
Auth: None
Rate Limit: ~1000 req/day
Response: Array of jobs
```

**Schema Mapping:**
```typescript
{
  id: job.id,                      // RemoteOK unique ID
  title: job.title,
  company: job.company,
  location: job.location,
  remote: job.remote === true,
  description: job.description,
  apply_url: job.url,
  posted_at: new Date(job.date * 1000),
  salary_min: job.salary_min,
  salary_max: job.salary_max,
  currency: job.salary_currency || 'USD',
  job_type: 'full-time',
  category: detectCategory(job.title)
}
```

### 2. Himalayas ✅ Live
```
Endpoint: https://www.himalayas.app/api/v1/jobs/search
Method: GET
Auth: None
Rate Limit: ~500 req/day
Query: ?q=remote&isremote=true
```

**Schema Mapping:**
```typescript
{
  id: job.id,
  title: job.job_title,
  company: job.employer_name,
  location: job.location,
  remote: job.remote !== false,
  description: job.description,
  apply_url: job.url,
  posted_at: new Date(job.publish_date),
  salary_min: job.salary_min,
  salary_max: job.salary_max,
  currency: job.salary_currency,
  tags: job.tags || []
}
```

### 3. Remotive ✅ Live
```
Endpoint: https://remotive.io/api/remote-jobs
Method: GET
Auth: None
Rate Limit: ~300 req/day
```

**Schema Mapping:**
```typescript
{
  id: job.id,
  title: job.title,
  company: job.company_name,
  location: job.candidate_required_location,
  remote: true,  // Remotive is 100% remote
  description: job.description,
  apply_url: job.url,
  posted_at: new Date(job.published_at),
  category: job.category || detectCategory(job.title),
  job_type: normalizeJobType(job.job_type)
}
```

### 4. Jobicy ✅ Live
```
Endpoint: https://jobicy.com/api/v2/remote-jobs
Method: GET
Auth: None
Rate Limit: ~400 req/day
Query: ?count=100
```

**Schema Mapping:**
```typescript
{
  id: job.id,
  title: job.jobTitle,
  company: job.companyName,
  location: job.jobLocation,
  remote: job.jobType === 'remote',
  description: job.jobDescription,
  apply_url: job.jobApplyLink || job.seo_friendly_url,
  posted_at: new Date(job.publishedAt),
  tags: job.jobTags || []
}
```

### 5. The Muse ✅ Live
```
Endpoint: https://www.themuse.com/api/public/jobs
Method: GET
Auth: API Key
Rate Limit: 10 req/min (free tier)
Query: ?key=YOUR_KEY&level=entry&location=remote
```

**Headers:**
```javascript
{
  'Authorization': `Bearer ${MUSE_API_KEY}`
}
```

**Schema Mapping:**
```typescript
{
  id: job.id,
  title: job.name,
  company: job.company?.name,
  location: job.locations?.[0]?.name,
  remote: job.locations?.some(l => l.name.includes('Remote')),
  description: job.contents,
  apply_url: job.refs?.landing_page,
  posted_at: new Date(job.published_at),
  salary_min: job.salary_min,
  salary_max: job.salary_max
}
```

### 6. JSearch (RapidAPI) ✅ Live
```
Endpoint: https://jsearch.p.rapidapi.com/search
Method: GET
Auth: X-RapidAPI-Key header
Rate Limit: 100 req/day (free), 100K+ req/day (paid)
Query: ?query=remote OR work from home&date_posted=week
```

**Headers:**
```javascript
{
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'User-Agent': 'JobFinder/2026',
}
```

**Schema Mapping:**
```typescript
{
  id: job.job_id,
  title: job.job_title,
  company: job.employer_name,
  location: job.job_city,
  country: job.job_country,
  remote: job.job_is_remote,
  description: job.job_description,
  apply_url: job.job_apply_link,
  posted_at: new Date(job.job_posted_at_datetime_utc),
  job_type: job.job_employment_type,
  salary_min: parseFloat(job.job_salary_currency_code_usd_salary_min),
  salary_max: parseFloat(job.job_salary_currency_code_usd_salary_max),
  currency: 'USD'
}
```

### 7. Adzuna ✅ Live
```
Endpoint: https://api.adzuna.com/v1/api/jobs/us/search/1
Method: GET
Auth: Query parameters (app_id, app_key)
Rate Limit: 100 req/day (free), 10K+ req/day (paid)
Query: ?app_id=YOUR_ID&app_key=YOUR_KEY&results_per_page=50&sort_by=date&sort_direction=decreasing
```

**Schema Mapping:**
```typescript
{
  id: job.id,
  title: job.title,
  company: job.company?.display_name,
  location: job.location?.display_name,
  country: 'US',  // Currently US-only in sync
  remote: job.description?.includes('remote'),
  description: job.description,
  apply_url: job.redirect_url,
  posted_at: new Date(job.created),
  job_type: normalizeJobType(job.contract_type),
  salary_min: job.salary_min,
  salary_max: job.salary_max,
  currency: job.salary_currency_code
}
```

### 8. Arbeitnow ⚠️ Blocked
```
Endpoint: https://www.arbeitnow.com/api/v2/remote-jobs
Method: GET
Auth: None
Rate Limit: N/A
Status: HTTP 403 Cloudflare Challenge
Workaround: Client-side browser only (not server-side)
```

---

## Upstash Redis API

**Purpose:** Cache job listings to avoid re-fetching from slow APIs

```
Endpoint: https://your-rest-url.upstash.io/rest/
Auth: Authorization: Bearer {token}
Rate Limit: Based on plan (typically 100K req/day on starter)
```

### Fetcher Cache Pattern
```typescript
// 1. Check Redis
GET /rest/v1/get/jobfinder:remoteok:jobs
// Returns: Cached JSON or $-1 (nil)

// 2. If miss, fetch from API, then cache
POST /rest/v1/set/jobfinder:remoteok:jobs
body: { value: JSON.stringify(jobs), ex: 21600 }  // 6 hour TTL

// 3. On sync, increment counters
INCR /rest/v1/incrby/jobfinder:stats:synced 
```

### Cache Keys
| Key | TTL | Purpose |
|-----|-----|---------|
| `jobfinder:{source}:jobs` | 6 hours | Fetched jobs |
| `jobfinder:stats:synced` | 24 hours | Total synced this day |
| `jobfinder:stats:errors` | 24 hours | Total errors this day |

---

## Supabase (PostgreSQL + RLS)

### Authentication
**Server-side (API routes, cron jobs):**
```typescript
// Use service-role key for full permissions
const admin = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,  // ⚠️ Server-side only
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Query with full permissions (bypasses RLS)
const { data, error } = await admin
  .from('jobs')
  .insert([normalizedJob]);
```

**Client-side (browsers):**
```typescript
// Use anon key with RLS enforcement
const client = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY  // ✅ Publishable, RLS enforced
);

// Query respects RLS policies
const { data } = await client
  .from('jobs')
  .select('*')
  .eq('is_active', true);
```

### Key Tables & Operations

| Table | Operation | API | Permission |
|-------|-----------|-----|-----------|
| `jobs` | INSERT (sync) | POST /rest/v1/jobs | service-role |
| `jobs` | SELECT (search) | /api/jobs?q=... | public (anon) |
| `companies` | UPSERT (sync) | /api/sync | service-role |
| `resumes` | INSERT (upload) | /api/upload | public (unauthenticated + Supabase signed URL) |
| `sync_logs` | INSERT (tracking) | /api/sync | service-role |

### Signed Upload URLs
For resume uploads without exposing bucket credentials:

```typescript
// Generate signed URL server-side
const { data, error } = await admin.storage
  .from('resumes')
  .createSignedUrl(`${sessionId}/resume.pdf`, 3600);  // 1 hour valid

// Return URL to client
// Client uploads directly: PUT signed-url with file
```

---

## Vercel Cron Jobs

**Configuration:** `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/sync",
      "schedule": "0 */6 * * *"  // Every 6 hours UTC
    }
  ]
}
```

**Execution:**
- Vercel calls POST /api/sync with `Authorization: Bearer {CRON_SECRET}`
- Runs in isolated function (~900 second timeout)
- Logs available in Vercel dashboard

**Monitoring:**
```bash
# Check cron invocations
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v1/crons/deployments/prod/sync"
```

---

## Authentication & Security

### CRON_SECRET Pattern
```
Header: Authorization: Bearer {CRON_SECRET}
Check: const token = req.headers.authorization?.replace('Bearer ', '');
if (token !== process.env.CRON_SECRET) return new NextResponse(..., { status: 401 });
```

### Service-Role Key Protection
- ✅ Never expose in client code
- ✅ Only in server-side `.env` (not `.env.local`)
- ✅ Rotate quarterly
- ⚠️ If leaked, regenerate immediately in Supabase dashboard

### Rate Limiting
- **Per-IP:** 100 req/min (enforced by Vercel)
- **Per-API:** Check individual docs above
- **Redis:** Upstash enforces per plan

---

## Error Handling Patterns

### Per-Source Isolation
```typescript
// Arbeitnow fails → others continue
const results = await Promise.allSettled([
  fetchRemoteOK(),
  fetchHimalayas(),
  fetchArbeitnow()  // Throws 403, but Promise.allSettled catches
]);

// Log both successes and failures
results.forEach((r, i) => {
  if (r.status === 'fulfilled') {
    logEvent('fetcher_success', { source, count: r.value.length });
  } else {
    logEvent('fetcher_error', { source, error: r.reason });
  }
});
```

### Graceful Degradation
```typescript
// If Redis fails, fall back to live fetching
let jobs = await redis.get(`jobfinder:${source}:jobs`);
if (!jobs) {
  jobs = await fetchSourceAPI(source);
  try {
    await redis.set(`jobfinder:${source}:jobs`, jobs, 21600);
  } catch (e) {
    logEvent('cache_error', { error: e.message });
    // Continue anyway — cache is optional
  }
}
```

---

## Testing Integrations Locally

### Test RemoteOK
```bash
curl -s 'https://remoteok.io/api/v0/remote_jobs' | jq '.[:2]'
```

### Test Muse
```bash
curl -s 'https://www.themuse.com/api/public/jobs?api_key=YOUR_KEY&level=entry' | jq '.results[:2]'
```

### Test Adzuna
```bash
curl -s 'https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=YOUR_ID&app_key=YOUR_KEY' | jq '.results[:2]'
```

### Test Redis
```bash
curl -s "https://your-url.upstash.io/rest/v1/set/test?Authorization=Bearer%20YOUR_TOKEN" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"value": "hello"}'
```

### Test Supabase
```typescript
// From Node.js or browser console
const { data, error } = await supabase
  .from('jobs')
  .select('count', { count: 'exact', head: true });
console.log(data);  // Should show job count
```

---

## API Change Log

| Date | API | Change | Impact |
|------|-----|--------|--------|
| 2026-05-10 | Muse | Rate limit 10 req/min | Fetcher uses cached results |
| 2026-05-10 | Arbeitnow | Cloudflare 403 | Isolated error, other sources unaffected |
| 2026-04-01 | JSearch | Moved to RapidAPI | Now requires API key, 100 req/day free |

---

**Next Update:** 2026-06-10  
**Maintained By:** Engineering Team
