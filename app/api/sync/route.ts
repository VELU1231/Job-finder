import { NextRequest } from "next/server";
import type { NormalizedJob } from "@/lib/types";
import { runAllFetchers } from "@/lib/fetchers";
import { jsonError, jsonSuccess } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

function mapJobRecord(job: NormalizedJob) {
  return {
    title: job.title,
    company: job.company,
    logo_url: job.logo_url,
    location: job.location,
    country: job.country,
    remote: job.remote,
    job_type: job.job_type,
    category: job.category,
    description: job.description,
    apply_url: job.apply_url,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    currency: job.currency,
    source: job.source,
    source_id: job.source_id,
    tags: job.tags,
    posted_at: job.posted_at,
    fetched_at: new Date().toISOString(),
    is_active: true
  };
}

function mapCompanyRecord(job: NormalizedJob) {
  if (!job.company) {
    return null;
  }

  return {
    name: job.company,
    slug: slugify(job.company),
    logo_url: job.logo_url,
    website: null,
    description: null,
    country: job.country,
    size: null,
    industry: job.category
  };
}

export async function POST(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!expected || token !== expected) {
    return jsonError("Unauthorized", 401);
  }

  const startedAt = Date.now();

  try {
    const supabase = createAdminClient();
    const { jobs, reports } = await runAllFetchers();
    const mappedJobs = jobs.map(mapJobRecord);
    const companies = Array.from(
      new Map(
        jobs
          .map(mapCompanyRecord)
          .filter((company): company is NonNullable<ReturnType<typeof mapCompanyRecord>> => company !== null)
          .map((company) => [company.slug, company])
      ).values()
    );

    const jobsResult = mappedJobs.length
      ? await supabase.from("jobs").upsert(mappedJobs, { onConflict: "source,source_id" }).select("id")
      : { error: null };

    if (jobsResult.error) {
      return jsonError(`Jobs upsert failed: ${jobsResult.error.message}`, 502);
    }

    const companiesResult = companies.length
      ? await supabase.from("companies").upsert(companies, { onConflict: "slug" }).select("id")
      : { error: null };

    if (companiesResult.error) {
      return jsonError(`Companies upsert failed: ${companiesResult.error.message}`, 502);
    }

    const durationMs = Date.now() - startedAt;
    const syncLogs = reports.map((report) => ({
      source: report.source,
      jobs_fetched: report.fetched,
      jobs_upserted: report.failed ? 0 : report.fetched,
      jobs_failed: report.failed,
      jobs_expired: 0,
      error_message: report.error ?? null,
      duration_ms: durationMs
    }));

    const logsResult = syncLogs.length ? await supabase.from("sync_logs").insert(syncLogs) : { error: null };

    if (logsResult.error) {
      return jsonError(`Sync log insert failed: ${logsResult.error.message}`, 502);
    }

    return jsonSuccess({
      ok: true,
      jobsSynced: mappedJobs.length,
      companiesSynced: companies.length,
      sources: reports,
      durationMs
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    return jsonError(message, 500);
  }
}
