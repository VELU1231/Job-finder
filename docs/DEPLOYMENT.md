# JobFinder Deployment Guide

**Version:** 2026-05-10  
**Status:** Production Ready ✅  
**Target:** Vercel + Supabase + Upstash Redis

---

## Quick Start (5 minutes)

### 1. Clone & Install
```bash
git clone https://github.com/VELU1231/Job-finder.git
cd Job-finder
npm install
```

### 2. Set Up Supabase Project
1. Go to [supabase.com](https://supabase.com) → Create new project
2. Choose region (recommend: US East for latency)
3. Copy project URL and anon/service-role keys
4. Run schema: Go to SQL Editor → paste contents of `docs/schema.sql` → Execute

### 3. Set Up Redis Cache
1. Go to [upstash.com](https://upstash.com) → Create Redis database
2. Choose US region to match Supabase
3. Copy REST URL and token

### 4. Get API Keys
| API | Where | What |
|-----|-------|------|
| The Muse | [muse.com/api](https://www.themuse.com/api/public/companies) | API Key (free tier: 10 req/min) |
| RapidAPI | [rapidapi.com](https://rapidapi.com) | For JSearch (`Job Search API`) |
| Adzuna | [adzuna.com/api](https://developer.adzuna.com) | App ID + App Key |

### 5. Create `.env.local`
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # ⚠️ KEEP SECRET

# Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# APIs
MUSE_API_KEY=your-key
RAPIDAPI_KEY=your-key
ADZUNA_APP_ID=your-id
ADZUNA_APP_KEY=your-key

# Security (generate random 32+ chars)
CRON_SECRET=your-secret-key-here-min-32-chars

# App config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=JobFinder
```

### 6. Run Locally
```bash
npm run dev
# Open http://localhost:3000
```

### 7. Test Endpoints
```bash
# Without CRON_SECRET (should 401):
curl -X POST http://localhost:3000/api/sync

# With CRON_SECRET:
curl -X POST http://localhost:3000/api/sync \
  -H "Authorization: Bearer your-secret-key-here-min-32-chars"
```

---

## Production Deployment (Vercel)

### Step 1: Deploy to Vercel
```bash
npm install -g vercel
vercel
# Follow prompts, link to existing GitHub repo
```

### Step 2: Set Production Environment Variables
1. Go to Vercel Dashboard → Select "Job-finder" project
2. Click Settings → Environment Variables
3. Add all variables from `.env.local` (except NEXT_PUBLIC_APP_URL):

| Variable | Value | Scope |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase | Production only ⚠️ |
| `UPSTASH_REDIS_REST_URL` | From Upstash | Production only |
| `UPSTASH_REDIS_REST_TOKEN` | From Upstash | Production only |
| `MUSE_API_KEY` | From Muse | Production only |
| `RAPIDAPI_KEY` | From RapidAPI | Production only |
| `ADZUNA_APP_ID` | From Adzuna | Production only |
| `ADZUNA_APP_KEY` | From Adzuna | Production only |
| `CRON_SECRET` | Your random secret | Production only |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain | Production, Preview |

⚠️ **Important:** Service-role keys should ONLY be in Production environment, never Preview.

### Step 3: Enable Cron Sync
Each job board API has rate limits. Consider paid API tiers for production volume.

**Option A: Vercel Cron (Free with Hobby plan)**
1. Vercel automatically detects cron jobs in `vercel.json`
2. Current config: Every 6 hours
3. Edit `vercel.json` to adjust:
```json
{
  "crons": [
    {
      "path": "/api/sync",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Option B: External Service (e.g., EasyCron, AWS EventBridge)**
```bash
# EasyCron (free)
POST https://www.easycron.com/api/add?token=YOUR_TOKEN&cron_expression=0%200%20*%20*%20*&url=https://your-domain.com/api/sync
```

### Step 4: Enable Security Headers
Already configured in `next.config.ts`; Vercel applies automatically.

### Step 5: Test Production Build
```bash
npm run build
# Should complete in <2 minutes
```

---

## Monitoring & Troubleshooting

### Health Check Endpoint
```bash
# Should return {"success": true, "checks": {...}}
curl https://your-domain.com/api/health
```

### View Sync Logs
```sql
-- In Supabase SQL Editor
SELECT * FROM sync_logs 
WHERE synced_at > now() - interval '24 hours'
ORDER BY synced_at DESC;
```

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| `/api/sync` returns 401 | Missing CRON_SECRET | Check env var, ensure Bearer token matches |
| Build fails with "Turbopack" error | Webpack config mismatch | Already fixed in `next.config.ts` |
| Redis connection fails | Network/token issue | Check UPSTASH credentials, region mismatch |
| Supabase RLS error | Wrong auth method | Ensure using service-role key server-side |
| Rate limited on job APIs | Too many concurrent requests | Stagger fetchers or upgrade API tier |

### Monitor Performance
1. **Vercel Analytics**: Dashboard → Real-time → HTTP requests
2. **Supabase Logs**: Project → Logs → API routes
3. **Redis Stats**: Upstash console → Requests/Latency

---

## Scaling Recommendations

### At 1K MAU
- ✅ Current setup adequate
- Monitor error rates, add alerts

### At 10K MAU
- Enable **Supabase connection pooling** (Pro tier)
- Increase Redis tier to Standard
- Monitor query slow logs weekly

### At 100K+ MAU
- Add **Supabase read replicas**
- Use **pg-boss** for job queue (better than cron-based)
- Implement **database partitioning** by date
- Add **CDN caching** with Vercel Edge

---

## Rollback & Recovery

### Rollback to Previous Version
```bash
# Vercel keeps last 50 deployments
vercel deployments
vercel rollback deployment-id
```

### Database Backup
```bash
# Supabase auto-backups (daily), accessible under:
# Project Settings → Backups → Point-in-time recovery
```

### Restore from Backup
1. Supabase Dashboard → Settings → Backups
2. Click "Restore" next to backup timestamp
3. Choose restore scope (full DB or specific tables)

---

## Maintenance Tasks

### Daily (Automated)
- ✅ Job sync every 6 hours (Vercel Cron)
- ✅ Expired jobs auto-deactivated (DB trigger)

### Weekly
- [ ] Review error logs in Supabase
- [ ] Check API rate limit usage
- [ ] Verify Redis cache hit rate (target: >80%)

### Monthly
- [ ] Update dependencies: `npm update && npm audit`
- [ ] Review slow query logs: `docs/performance-queries.sql`
- [ ] Analyze top error types and fix root causes
- [ ] Review security headers: `curl -I https://your-domain.com`

### Quarterly
- [ ] Optimize database indexes based on query patterns
- [ ] Review third-party API rate limits and pricing
- [ ] Update documentation with any operational changes

---

## Contributing & Local Development

### Branch Strategy
```bash
# Feature development
git checkout -b feat/new-feature
# ... make changes ...
git commit -m "feat: add new feature"
git push origin feat/new-feature
# Create PR on GitHub

# Staging deployment
git checkout -b staging
git merge feat/new-feature
# Vercel auto-deploys Preview

# Production
git checkout main
git merge staging
# Vercel auto-deploys Production
```

### Testing Before Deployment
```bash
# 1. Lint
npm run lint

# 2. Build
npm run build

# 3. Type-check
npx tsc --noEmit

# 4. Manual test
npm run dev
# Visit http://localhost:3000/api/health
# Test search: http://localhost:3000/api/jobs?q=typescript
```

---

## Support & Resources

| Resource | Link |
|----------|------|
| **Vercel Docs** | https://vercel.com/docs |
| **Supabase Docs** | https://supabase.com/docs |
| **Upstash Redis** | https://upstash.com/docs |
| **Next.js Cron** | https://nextjs.org/docs/app/building-your-application/routing/route-handlers#crons |
| **SEO & Performance** | See `docs/api-guide.md` |

---

## Post-Deployment Checklist

- [ ] Vercel deployment successful
- [ ] All environment variables set (Production scope only for secrets)
- [ ] Health endpoint returns `{ "success": true }`
- [ ] At least one successful sync log entry
- [ ] HTTPS working (Vercel auto-enables)
- [ ] Security headers present in response
- [ ] SEO metadata generating (check `/robots.txt`, `/sitemap.xml`)
- [ ] PWA manifest accessible (`/manifest.webmanifest`)
- [ ] Analytics tracking active (Vercel Web Analytics)
- [ ] Error monitoring configured (optional: Sentry)
- [ ] Cron syncs working (check `/api/sync` returns 202)

---

**Next Review Date:** 2026-06-10  
**Last Updated:** 2026-05-10  
**Maintained By:** Engineering Team
