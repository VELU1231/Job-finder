import type { NormalizedJob } from "@/lib/types";
import { HimalayasJobSchema } from "@/lib/validators";
import { detectCategory, normalizeJobType } from "@/lib/utils";
import { fetchWithRetry, getFromRedis, setInRedis, type FetcherResult } from "./base";

const SOURCE = "himalayas";
const URL = "https://himalayas.app/jobs/api";

export async function fetchHimalayas(): Promise<FetcherResult<NormalizedJob>> {
  const cacheKey = `fetch:${SOURCE}:${new Date().toISOString().slice(0, 10)}`;
  const cached = await getFromRedis<NormalizedJob[]>(cacheKey);

  if (cached) {
    return { source: SOURCE, jobs: cached };
  }

  try {
    const response = await fetchWithRetry(URL, {
      headers: {
        "user-agent": "JobFinderBot/1.0"
      }
    });

    if (!response.ok) {
      return { source: SOURCE, jobs: [], error: `Himalayas responded ${response.status}` };
    }

    const payload = (await response.json()) as { jobs?: unknown[]; data?: unknown[]; results?: unknown[] } | unknown[];
    const rows = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as { jobs?: unknown[] }).jobs)
        ? (payload as { jobs?: unknown[] }).jobs ?? []
        : Array.isArray((payload as { results?: unknown[] }).results)
          ? (payload as { results?: unknown[] }).results ?? []
          : Array.isArray((payload as { data?: unknown[] }).data)
            ? (payload as { data?: unknown[] }).data ?? []
            : [];
    const normalized: NormalizedJob[] = [];

    for (const row of rows) {
      const parsed = HimalayasJobSchema.safeParse(row);
      if (!parsed.success) {
        continue;
      }

      const item = parsed.data;
      const tags = item.tags ?? [];
      normalized.push({
        title: item.title,
        company: item.companyName ?? null,
        logo_url: null,
        location: item.location ?? null,
        country: null,
        remote: Boolean(item.remote),
        job_type: normalizeJobType(`${item.title} ${tags.join(" ")}`),
        category: detectCategory(item.title, tags),
        description: item.description ?? null,
        apply_url: item.applyUrl ?? null,
        salary_min: null,
        salary_max: null,
        currency: "USD",
        source: SOURCE,
        source_id: String(item.id),
        tags,
        posted_at: item.postedAt ?? null
      });
    }

    await setInRedis(cacheKey, normalized, 21600);
    return { source: SOURCE, jobs: normalized };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Himalayas fetch error";
    return { source: SOURCE, jobs: [], error: message };
  }
}