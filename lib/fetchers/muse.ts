import type { NormalizedJob } from "@/lib/types";
import { MuseJobSchema } from "@/lib/validators";
import { detectCategory, normalizeJobType } from "@/lib/utils";
import { fetchWithRetry, getFromRedis, setInRedis, type FetcherResult } from "./base";

const SOURCE = "muse";
const URL = "https://www.themuse.com/api/public/jobs";
const API_KEY = process.env.MUSE_API_KEY;

export async function fetchMuse(): Promise<FetcherResult<NormalizedJob>> {
  const cacheKey = `fetch:${SOURCE}:${new Date().toISOString().slice(0, 10)}`;
  const cached = await getFromRedis<NormalizedJob[]>(cacheKey);

  if (cached) {
    return { source: SOURCE, jobs: cached };
  }

  if (!API_KEY) {
    return { source: SOURCE, jobs: [], error: "MUSE_API_KEY is required" };
  }

  try {
    const response = await fetchWithRetry(`${URL}?page=1`, {
      headers: {
        "user-agent": "JobFinderBot/1.0",
        Authorization: `Token ${API_KEY}`
      }
    });

    if (!response.ok) {
      return { source: SOURCE, jobs: [], error: `Muse responded ${response.status}` };
    }

    const payload = (await response.json()) as { results?: unknown[]; jobs?: unknown[]; data?: unknown[] };
    const rows = Array.isArray(payload.results)
      ? payload.results
      : Array.isArray(payload.jobs)
        ? payload.jobs
        : Array.isArray(payload.data)
          ? payload.data
          : [];
    const normalized: NormalizedJob[] = [];

    for (const row of rows) {
      const parsed = MuseJobSchema.safeParse(row);
      if (!parsed.success) {
        continue;
      }

      const item = parsed.data;
      const title = item.name;
      const tags = [
        ...(item.categories ?? []).map((category) => category.name ?? "").filter(Boolean),
        ...(item.levels ?? []).map((level) => level.name ?? "").filter(Boolean)
      ];
      normalized.push({
        title,
        company: item.company?.name ?? null,
        logo_url: null,
        location: item.locations?.map((location) => location.name ?? "").filter(Boolean).join(", ") || null,
        country: null,
        remote: tags.some((value) => value.toLowerCase().includes("remote")),
        job_type: normalizeJobType(tags.join(" ")),
        category: detectCategory(title, tags),
        description: item.contents ?? null,
        apply_url: item.refs?.landing_page ?? null,
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
    const message = error instanceof Error ? error.message : "Unknown Muse fetch error";
    return { source: SOURCE, jobs: [], error: message };
  }
}