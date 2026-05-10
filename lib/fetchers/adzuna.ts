import type { NormalizedJob } from "@/lib/types";
import { AdzunaJobSchema } from "@/lib/validators";
import { detectCategory, normalizeJobType } from "@/lib/utils";
import { fetchWithRetry, getFromRedis, setInRedis, type FetcherResult } from "./base";

const SOURCE = "adzuna";
const COUNTRY = "us";
const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;

export async function fetchAdzuna(): Promise<FetcherResult<NormalizedJob>> {
  const cacheKey = `fetch:${SOURCE}:${new Date().toISOString().slice(0, 10)}`;
  const cached = await getFromRedis<NormalizedJob[]>(cacheKey);

  if (cached) {
    return { source: SOURCE, jobs: cached };
  }

  if (!APP_ID || !APP_KEY) {
    return { source: SOURCE, jobs: [], error: "ADZUNA_APP_ID and ADZUNA_APP_KEY are required" };
  }

  try {
    const response = await fetchWithRetry(
      `https://api.adzuna.com/v1/api/jobs/${COUNTRY}/search/1?app_id=${encodeURIComponent(APP_ID)}&app_key=${encodeURIComponent(APP_KEY)}&results_per_page=50&what=software`,
      {
        headers: {
          "user-agent": "JobFinderBot/1.0"
        }
      }
    );

    if (!response.ok) {
      return { source: SOURCE, jobs: [], error: `Adzuna responded ${response.status}` };
    }

    const payload = (await response.json()) as { results?: unknown[] };
    const rows = Array.isArray(payload.results) ? payload.results : [];
    const normalized: NormalizedJob[] = [];

    for (const row of rows) {
      const parsed = AdzunaJobSchema.safeParse(row);
      if (!parsed.success) {
        continue;
      }

      const item = parsed.data;
      const tags = [item.contract_type ?? ""].filter(Boolean);
      normalized.push({
        title: item.title,
        company: item.company?.display_name ?? null,
        logo_url: null,
        location: item.location?.display_name ?? null,
        country: COUNTRY,
        remote: (item.location?.display_name ?? "").toLowerCase().includes("remote"),
        job_type: normalizeJobType(item.contract_type ?? item.title),
        category: detectCategory(item.title, tags),
        description: item.description ?? null,
        apply_url: item.redirect_url ?? null,
        salary_min: item.salary_min ?? null,
        salary_max: item.salary_max ?? null,
        currency: "USD",
        source: SOURCE,
        source_id: item.id,
        tags,
        posted_at: item.created ?? null
      });
    }

    await setInRedis(cacheKey, normalized, 21600);
    return { source: SOURCE, jobs: normalized };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Adzuna fetch error";
    return { source: SOURCE, jobs: [], error: message };
  }
}