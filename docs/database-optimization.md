# Database Optimization Guide

## Current Indexing Strategy

The JobFinder schema includes comprehensive indexes optimized for common query patterns:

### Jobs Table Indexes
| Index | Type | Purpose | Query Pattern |
|-------|------|---------|---|
| `idx_jobs_search` | GIN tsvector | Full-text search | `search_vector @@ query` |
| `idx_jobs_category` | B-tree | Category filtering | `WHERE category = ?` |
| `idx_jobs_remote` | B-tree | Remote toggle | `WHERE remote = true/false` |
| `idx_jobs_posted_at` | B-tree DESC | Recent jobs | `ORDER BY posted_at DESC` |
| `idx_jobs_country` | B-tree | Geo filtering | `WHERE country = ?` |
| `idx_jobs_job_type` | B-tree | Job type filtering | `WHERE job_type = ?` |
| `idx_jobs_is_active` | B-tree | Active status | `WHERE is_active = true` |
| `idx_jobs_company` | B-tree | Company lookup | `WHERE company = ?` |
| `idx_jobs_expires_at` | B-tree | Expiration cleanup | `WHERE expires_at < now()` |

### Companies Table Indexes
| Index | Type | Purpose | Query Pattern |
|-------|------|---------|---|
| `idx_companies_slug` | B-tree UNIQUE | Company dedup | `WHERE slug = ?` |

### Composite Queries (Use Multiple Indexes)
```sql
-- Most common query: search + filter + paginate
SELECT * FROM jobs 
WHERE 
  is_active = true 
  AND (search_vector @@ to_tsquery('english', 'typescript'))
  AND category = 'engineering'
  AND remote = true
ORDER BY posted_at DESC
LIMIT 20 OFFSET 0;
-- Uses: idx_jobs_search + idx_jobs_category + idx_jobs_remote + idx_jobs_is_active + idx_jobs_posted_at
```

## Query Performance Tips

### 1. Always filter by `is_active` first
- Reduces scan size immediately (GiST on jobs: ~10K rows vs 150K+)
- Essential for consistent performance

### 2. Use search_vector for text queries, not LIKE
```sql
-- ❌ SLOW: Full table scan
SELECT * FROM jobs WHERE description ILIKE '%typescript%';

-- ✅ FAST: GIN index scan (50-100x faster)
SELECT * FROM jobs WHERE search_vector @@ to_tsquery('english', 'typescript');
```

### 3. Limit pagination early
- Default to LIMIT 20, max LIMIT 100
- Cursor-based pagination (offset/limit) OK for <1M rows
- Consider keyset pagination for 10M+ jobs (use primary key offset)

### 4. Aggregate counts with materialized views (future)
```sql
-- Current: O(n) scan
SELECT COUNT(*) FROM jobs WHERE category = 'engineering';

-- Recommended (Phase 2):
CREATE MATERIALIZED VIEW category_counts AS
  SELECT category, COUNT(*) as count 
  FROM jobs 
  WHERE is_active = true 
  GROUP BY category;

CREATE INDEX idx_category_counts_category ON category_counts(category);
```

## Cache Strategy

| Layer | TTL | Invalidation |
|-------|-----|---|
| Redis (Fetcher dedup) | 6 hours | Auto-expire |
| API response (Cache-Control) | 30 seconds | Time-based |
| Browser (SWR) | 30 seconds | Time-based |
| DB query (prepared statements) | Instant | None (RLS) |

## Monitoring & Logging

### Track slow queries (Supabase)
```sql
-- Settings > Query Performance > Enable Slow Query Log
-- Threshold: 1000ms for production
SELECT 
  query, 
  mean_exec_time, 
  calls, 
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Monitor sync performance
- Check `sync_logs` table for per-source duration trends
- Alert if any source > 30 seconds

### Sample aggregation query
```sql
SELECT 
  source,
  DATE(synced_at) as date,
  AVG(duration_ms) as avg_duration,
  MAX(duration_ms) as max_duration,
  SUM(jobs_fetched) as total_fetched,
  SUM(jobs_upserted) as total_upserted,
  COUNT(CASE WHEN error_message IS NOT NULL THEN 1 END) as error_count
FROM sync_logs
WHERE synced_at > now() - interval '7 days'
GROUP BY source, DATE(synced_at)
ORDER BY date DESC;
```

## Optimization Roadmap

### Phase 1 (Current ✅)
- Basic indexes on filter columns
- Full-text search with tsvector
- RLS policies (open, will lock down in auth phase)

### Phase 2 (Recommended)
- Materialized views for category/type/country counts
- Add indexes on composite queries (category + remote)
- Enable pgBouncer connection pooling (Supabase Pro)
- Monitor slow query log and adjust

### Phase 3 (Advanced)
- Partitioning by posted_at month (>10M rows)
- Columnar storage for analytics (pg_partman)
- ReadReplicas for reporting queries (Supabase Enterprise)

## Verifying Index Usage

```sql
-- Check actual index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('jobs', 'companies', 'resumes', 'sync_logs')
ORDER BY idx_scan DESC;

-- Unused indexes (candidates for deletion)
SELECT 
  schemaname,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE 'idx_%_pkey'
ORDER BY idx_scan;
```

## Next Steps

1. **Deploy current schema** to Supabase (phase 2 requirement)
2. **Monitor query logs** for 1 week to identify slow patterns
3. **Add composite indexes** if common filters appear together
4. **Enable connection pooling** once at 1K+ concurrent users
5. **Consider partitioning** if jobs table exceeds 50M rows

---

**Last Updated:** 2026-05-10 | **Next Review:** 2026-06-10
