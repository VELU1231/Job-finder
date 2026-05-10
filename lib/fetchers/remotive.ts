import type { NormalizedJob } from "@/lib/types";
import { RemotiveJobSchema } from "@/lib/validators";
import { detectCategory, normalizeJobType } from "@/lib/utils";
import { fetchWithRetry, getFromRedis, setInRedis, type FetcherResult } from "./base";

const SOURCE = "remotive";
const URL = "https://remotive.com/api/remote-jobs";

export async function fetchRemotive(): Promise<FetcherResult<NormalizedJob>> {
  const cacheKey = `fetch:${SOURCE}:${new Date().toISOString().slice(0, 10)}`;
  const cached = await getFromRedis<NormalizedJob[]>(cacheKey);

  if (cached) {
    return { source: SOURCE, jobs: cached };
  }

  try {
    const response = await fetchWithRetry(`${URL}?limit=100`, {
      headers: {
        "user-agent": "JobFinderBot/1.0"
      }
    });

    if (!response.ok) {
      return { source: SOURCE, jobs: [], error: `Remotive responded ${response.status}` };
    }

    const payload = (await response.json()) as { jobs?: unknown[] };
    const rows = Array.isArray(payload.jobs) ? payload.jobs : [];
    const normalized: NormalizedJob[] = [];

    for (const row of rows) {
      const parsed = RemotiveJobSchema.safeParse(row);
      if (!parsed.success) {
        continue;
      }

      const item = parsed.data;
      const tags = item.tags ?? [];
      normalized.push({
        title: item.title,
        company: item.company_name ?? null,
        logo_url: null,
        location: item.candidate_required_location ?? null,
        country: null,
        remote: true,
        job_type: normalizeJobType(`${item.category ?? ""} ${tags.join(" ")}`),
        category: detectCategory(item.title, tags),
        description: item.description ?? null,
        apply_url: item.url ?? null,
        salary_min: null,
        salary_max: null,
        currency: "USD",
        source: SOURCE,
        source_id: String(item.id),
        tags,
        posted_at: item.publication_date ?? null
      });
    }

    await setInRedis(cacheKey, normalized, 21600);
    return { source: SOURCE, jobs: normalized };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Remotive fetch error";
    return { source: SOURCE, jobs: [], error: message };
  }
}