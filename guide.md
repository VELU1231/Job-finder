# JobFinder Setup Guide (Mobile-Friendly)

## 1. Create Supabase project
1. Open https://supabase.com/dashboard.
2. Tap New project.
3. Enter Project name: JobFinder.
4. Set Database Password and Region, then tap Create new project.
5. Open SQL Editor > New query, paste docs/schema.sql, then tap Run.
6. Open Storage > New bucket, create bucket named resumes.

## 2. Collect Supabase keys
1. Open Project Settings > API.
2. Copy Project URL into NEXT_PUBLIC_SUPABASE_URL.
3. Copy anon key into NEXT_PUBLIC_SUPABASE_ANON_KEY.
4. Copy service_role key into SUPABASE_SERVICE_ROLE_KEY.

## 3. Create Upstash Redis
1. Open https://console.upstash.com/.
2. Tap Create Database.
3. Choose a name and region, then create.
4. Open REST API tab.
5. Copy REST URL into UPSTASH_REDIS_REST_URL.
6. Copy REST TOKEN into UPSTASH_REDIS_REST_TOKEN.

## 4. Create API keys
1. Muse: https://www.themuse.com/developers -> generate key -> MUSE_API_KEY.
2. RapidAPI: https://rapidapi.com/ -> account keys -> RAPIDAPI_KEY.
3. Adzuna: https://developer.adzuna.com/ -> app id/key -> ADZUNA_APP_ID and ADZUNA_APP_KEY.

## 5. Create security and monitoring values
1. CRON_SECRET: create any random 32+ char string.
2. Sentry: https://sentry.io/ -> create Next.js project -> set NEXT_PUBLIC_SENTRY_DSN and SENTRY_AUTH_TOKEN.

## 6. Configure Vercel
1. Open https://vercel.com/new.
2. Import your GitHub repository.
3. In Environment Variables, add all keys from .env.example.
4. Deploy.
5. In Project Settings > Cron Jobs, confirm /api/sync daily schedule exists from vercel.json.

## 7. Verify deployment health
1. Open /api/health endpoint in your deployed URL.
2. Trigger a manual POST to /api/sync with header Authorization: Bearer CRON_SECRET (via API client).
3. Confirm sync logs are inserted in Supabase sync_logs table.
4. Open home page and verify UI renders.
