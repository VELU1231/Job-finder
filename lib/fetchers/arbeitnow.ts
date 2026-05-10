import type { NormalizedJob } from "@/lib/types";
import { ArbeitnowJobSchema } from "@/lib/validators";
import { detectCategory, normalizeJobType } from "@/lib/utils";
import { fetchWithRetry, getFromRedis, setInRedis, type FetcherResult } from "./base";

const SOURCE = "arbeitnow";
const URL = "https://www.arbeitnow.com/api/job-board-api";

export async function fetchArbeitnow(): Promise<FetcherResult<NormalizedJob>> {
  const cacheKey = `fetch:${SOURCE}:${new Date().toISOString().slice(0, 10)}`;
  const cached = await getFromRedis<NormalizedJob[]>(cacheKey);

  if (cached) {
    return { source: SOURCE, jobs: cached };
  }

  try {
    const response = await fetchWithRetry(`${URL}?page=1`, {
      headers: {
        "user-agent": "JobFinderBot/1.0"
      }
    });

    if (!response.ok) {
      return { source: SOURCE, jobs: [], error: `Arbeitnow responded ${response.status}` };
    }

    const payload = (await response.json()) as { data?: unknown[]; jobs?: unknown[] } | unknown[];
    const rows = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as { data?: unknown[] }).data)
        ? (payload as { data?: unknown[] }).data ?? []
        : Array.isArray((payload as { jobs?: unknown[] }).jobs)
          ? (payload as { jobs?: unknown[] }).jobs ?? []
          : [];
    const normalized: NormalizedJob[] = [];

    for (const row of rows) {
      const parsed = ArbeitnowJobSchema.safeParse(row);
      if (!parsed.success) {
        continue;
      }

      const item = parsed.data;
      normalized.push({
        title: item.title,
        company: item.company_name ?? null,
        logo_url: null,
        location: item.location ?? null,
        country: null,
        remote: Boolean(item.remote),
        job_type: normalizeJobType(item.tags?.join(" ") ?? item.title),
        category: detectCategory(item.title, item.tags ?? []),
        description: item.description ?? null,
        apply_url: item.url ?? null,
        salary_min: null,
        salary_max: null,
        currency: "EUR",
        source: SOURCE,
        source_id: item.slug,
        tags: item.tags ?? [],
        posted_at: item.created_at ?? null
      });
    }

    await setInRedis(cacheKey, normalized, 21600);
    return { source: SOURCE, jobs: normalized };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Arbeitnow fetch error";
    return { source: SOURCE, jobs: [], error: message };
  }
}