import type { NormalizedJob } from "@/lib/types";
import { RemoteOKJobSchema } from "@/lib/validators";
import { detectCategory, normalizeJobType } from "@/lib/utils";
import { fetchWithRetry, getFromRedis, setInRedis, type FetcherResult } from "./base";

const SOURCE = "remoteok";
const URL = "https://remoteok.com/api";

export async function fetchRemoteOK(): Promise<FetcherResult<NormalizedJob>> {
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
      return { source: SOURCE, jobs: [], error: `RemoteOK responded ${response.status}` };
    }

    const payload = (await response.json()) as unknown[];
    const rows = payload.slice(1);
    const normalized: NormalizedJob[] = [];

    for (const row of rows) {
      const parsed = RemoteOKJobSchema.safeParse(row);
      if (!parsed.success) {
        continue;
      }

      const item = parsed.data;
      const title = item.position ?? "Untitled role";
      const tags = item.tags ?? [];
      const sourceId = item.slug ?? String(item.id ?? "");

      if (!sourceId) {
        continue;
      }

      normalized.push({
        title,
        company: item.company ?? null,
        logo_url: item.logo ?? null,
        location: item.location ?? null,
        country: null,
        remote: true,
        job_type: normalizeJobType(tags.join(" ")),
        category: detectCategory(title, tags),
        description: item.description ?? null,
        apply_url: item.url ?? null,
        salary_min: item.salary_min ?? null,
        salary_max: item.salary_max ?? null,
        currency: "USD",
        source: SOURCE,
        source_id: sourceId,
        tags,
        posted_at: item.date ?? null
      });
    }

    await setInRedis(cacheKey, normalized, 21600);
    return { source: SOURCE, jobs: normalized };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown RemoteOK fetch error";
    return { source: SOURCE, jobs: [], error: message };
  }
}
