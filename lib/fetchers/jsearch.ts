import type { NormalizedJob } from "@/lib/types";
import { JSearchJobSchema } from "@/lib/validators";
import { detectCategory, normalizeJobType } from "@/lib/utils";
import { fetchWithRetry, getFromRedis, setInRedis, type FetcherResult } from "./base";

const SOURCE = "jsearch";
const URL = "https://jsearch.p.rapidapi.com/search";
const API_KEY = process.env.RAPIDAPI_KEY;

export async function fetchJSearch(): Promise<FetcherResult<NormalizedJob>> {
  const cacheKey = `fetch:${SOURCE}:${new Date().toISOString().slice(0, 10)}`;
  const cached = await getFromRedis<NormalizedJob[]>(cacheKey);

  if (cached) {
    return { source: SOURCE, jobs: cached };
  }

  if (!API_KEY) {
    return { source: SOURCE, jobs: [], error: "RAPIDAPI_KEY is required" };
  }

  try {
    const response = await fetchWithRetry(`${URL}?query=software%20engineer&page=1&num_pages=1`, {
      headers: {
        "user-agent": "JobFinderBot/1.0",
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
      }
    });

    if (!response.ok) {
      return { source: SOURCE, jobs: [], error: `JSearch responded ${response.status}` };
    }

    const payload = (await response.json()) as { data?: unknown[]; jobs?: unknown[] };
    const rows = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.jobs)
        ? payload.jobs
        : [];
    const normalized: NormalizedJob[] = [];

    for (const row of rows) {
      const parsed = JSearchJobSchema.safeParse(row);
      if (!parsed.success) {
        continue;
      }

      const item = parsed.data;
      const location = [item.job_city, item.job_country].filter(Boolean).join(", ") || null;
      normalized.push({
        title: item.job_title,
        company: item.employer_name ?? null,
        logo_url: item.employer_logo ?? null,
        location,
        country: item.job_country ?? null,
        remote: [item.job_employment_type, item.job_description].some((value) =>
          (value ?? "").toLowerCase().includes("remote")
        ),
        job_type: normalizeJobType(item.job_employment_type ?? item.job_description ?? null),
        category: detectCategory(item.job_title, [item.job_employment_type ?? ""]),
        description: item.job_description ?? null,
        apply_url: item.job_apply_link ?? null,
        salary_min: null,
        salary_max: null,
        currency: "USD",
        source: SOURCE,
        source_id: item.job_id,
        tags: [item.job_employment_type ?? ""].filter(Boolean),
        posted_at: item.job_posted_at_datetime_utc ?? null
      });
    }

    await setInRedis(cacheKey, normalized, 21600);
    return { source: SOURCE, jobs: normalized };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown JSearch fetch error";
    return { source: SOURCE, jobs: [], error: message };
  }
}