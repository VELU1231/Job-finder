-- =============================================
-- JobFinder - Supabase Schema v2 (2026)
-- Run in: Supabase Dashboard > SQL Editor > New Query
-- =============================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- JOBS TABLE
create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  company text,
  logo_url text,
  location text,
  country text,
  remote boolean default false,
  job_type text check (job_type in
    ('full-time','part-time','contract','internship','freelance')),
  category text,
  description text,
  apply_url text,
  salary_min int,
  salary_max int,
  currency text default 'USD',
  source text not null,
  source_id text,
  tags text[],
  posted_at timestamptz,
  fetched_at timestamptz default now(),
  expires_at timestamptz,
  is_active boolean default true,
  search_vector tsvector,
  created_at timestamptz default now(),
  views int default 0,
  unique(source, source_id)
);

-- Compatibility: if an older schema created expires_at as a generated column,
-- convert it to a normal column so trigger-based updates work.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'jobs'
      and column_name = 'expires_at'
      and is_generated = 'ALWAYS'
  ) then
    execute 'alter table jobs alter column expires_at drop expression';
  end if;
end
$$;

-- INDEXES
create index if not exists idx_jobs_search on jobs using gin(search_vector);
create index if not exists idx_jobs_category on jobs(category);
create index if not exists idx_jobs_remote on jobs(remote);
create index if not exists idx_jobs_posted_at on jobs(posted_at desc);
create index if not exists idx_jobs_country on jobs(country);
create index if not exists idx_jobs_job_type on jobs(job_type);
create index if not exists idx_jobs_is_active on jobs(is_active);
create index if not exists idx_jobs_company on jobs(company);
create index if not exists idx_jobs_expires_at on jobs(expires_at);

-- FULL-TEXT SEARCH AUTO-UPDATE TRIGGER
create or replace function jobs_search_update() returns trigger as $$
begin
  new.expires_at := case
    when new.posted_at is null then null
    else new.posted_at + interval '60 days'
  end;

  new.search_vector :=
    to_tsvector('english',
      coalesce(new.title,'') || ' ' ||
      coalesce(new.company,'') || ' ' ||
      coalesce(new.description,'') || ' ' ||
      coalesce(new.category,'') || ' ' ||
      coalesce(new.location,'') || ' ' ||
      coalesce(array_to_string(new.tags,' '),''));
  return new;
end;
$$ language plpgsql;

drop trigger if exists jobs_search_trigger on jobs;
create trigger jobs_search_trigger
before insert or update on jobs
for each row execute function jobs_search_update();

-- AUTO-EXPIRE OLD JOBS (called by cron)
create or replace function deactivate_old_jobs() returns int as $$
declare
  affected int;
begin
  update jobs set is_active = false
  where expires_at < now() and is_active = true;
  get diagnostics affected = row_count;
  return affected;
end;
$$ language plpgsql;

-- COMPANIES TABLE
create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique,
  logo_url text,
  website text,
  description text,
  country text,
  size text,
  industry text,
  created_at timestamptz default now()
);

create index if not exists idx_companies_slug on companies(slug);

-- RESUMES TABLE
create table if not exists resumes (
  id uuid primary key default uuid_generate_v4(),
  file_url text not null,
  file_name text,
  file_size int,
  file_type text check (file_type in ('pdf','docx')),
  session_id text,
  uploaded_at timestamptz default now()
);

-- SYNC LOG TABLE (track daily syncs)
create table if not exists sync_logs (
  id uuid primary key default uuid_generate_v4(),
  source text not null,
  jobs_fetched int default 0,
  jobs_upserted int default 0,
  jobs_failed int default 0,
  jobs_expired int default 0,
  error_message text,
  duration_ms int,
  synced_at timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table jobs enable row level security;
alter table companies enable row level security;
alter table resumes enable row level security;
alter table sync_logs enable row level security;

-- POLICIES (open for Phase 1, lock down in Phase 2 with auth)
-- Drop first so the script can be safely re-run.
drop policy if exists "Public read jobs" on jobs;
drop policy if exists "Public insert jobs" on jobs;
drop policy if exists "Public update jobs" on jobs;
drop policy if exists "Public read companies" on companies;
drop policy if exists "Public insert companies" on companies;
drop policy if exists "Public insert resumes" on resumes;
drop policy if exists "Service read sync logs" on sync_logs;
drop policy if exists "Service insert sync logs" on sync_logs;

create policy "Public read jobs" on jobs for select using (true);
create policy "Public insert jobs" on jobs for insert with check (true);
create policy "Public update jobs" on jobs for update using (true);
create policy "Public read companies" on companies for select using (true);
create policy "Public insert companies" on companies for insert with check (true);
create policy "Public insert resumes" on resumes for insert with check (true);
create policy "Service read sync logs" on sync_logs for select using (true);
create policy "Service insert sync logs" on sync_logs for insert with check (true);
