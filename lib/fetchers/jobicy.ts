import type { NormalizedJob } from "@/lib/types";
import { JobicyJobSchema } from "@/lib/validators";
import { detectCategory, normalizeJobType } from "@/lib/utils";
import { fetchWithRetry, getFromRedis, setInRedis, type FetcherResult } from "./base";

const SOURCE = "jobicy";
const URL = "https://jobicy.com/api/v2/remote-jobs";

export async function fetchJobicy(): Promise<FetcherResult<NormalizedJob>> {
  const cacheKey = `fetch:${SOURCE}:${new Date().toISOString().slice(0, 10)}`;
  const cached = await getFromRedis<NormalizedJob[]>(cacheKey);

  if (cached) {
    return { source: SOURCE, jobs: cached };
  }

  try {
    const response = await fetchWithRetry(`${URL}?count=100`, {
      headers: {
        "user-agent": "JobFinderBot/1.0"
      }
    });

    if (!response.ok) {
      return { source: SOURCE, jobs: [], error: `Jobicy responded ${response.status}` };
    }

    const payload = (await response.json()) as { jobs?: unknown[]; data?: unknown[] };
    const rows = Array.isArray(payload.jobs) ? payload.jobs : Array.isArray(payload.data) ? payload.data : [];
    const normalized: NormalizedJob[] = [];

    for (const row of rows) {
      const parsed = JobicyJobSchema.safeParse(row);
      if (!parsed.success) {
        continue;
      }

      const item = parsed.data;
      const title = item.jobTitle ?? item.title ?? "Untitled role";
      const tags = item.jobTags ?? [];
      normalized.push({
        title,
        company: item.companyName ?? null,
        logo_url: item.companyLogo ?? null,
        location: item.jobGeo ?? null,
        country: null,
        remote: Boolean(item.jobType?.toLowerCase().includes("remote") || item.jobGeo?.toLowerCase().includes("remote")),
        job_type: normalizeJobType(`${item.jobLevel ?? ""} ${item.jobType ?? ""} ${tags.join(" ")}`),
        category: detectCategory(title, tags),
        description: item.jobDescription ?? null,
        apply_url: item.url ?? null,
        salary_min: null,
        salary_max: null,
        currency: "USD",
        source: SOURCE,
        source_id: String(item.id),
        tags,
        posted_at: item.pubDate ?? null
      });
    }

    await setInRedis(cacheKey, normalized, 21600);
    return { source: SOURCE, jobs: normalized };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Jobicy fetch error";
    return { source: SOURCE, jobs: [], error: message };
  }
}