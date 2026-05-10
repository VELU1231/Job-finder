import type { NormalizedJob } from "@/lib/types";
import { fetchRemoteOK } from "./remoteok";

export interface SyncSourceReport {
  source: string;
  fetched: number;
  failed: number;
  error?: string;
}

export interface SyncResult {
  jobs: NormalizedJob[];
  reports: SyncSourceReport[];
}

export async function runAllFetchers(): Promise<SyncResult> {
  const tasks = [fetchRemoteOK()];
  const settled = await Promise.allSettled(tasks);
  const jobs: NormalizedJob[] = [];
  const dedupe = new Set<string>();
  const reports: SyncSourceReport[] = [];

  for (const result of settled) {
    if (result.status === "rejected") {
      reports.push({ source: "unknown", fetched: 0, failed: 1, error: String(result.reason) });
      continue;
    }

    const value = result.value;
    for (const job of value.jobs) {
      const key = `${job.source}:${job.source_id}`;
      if (dedupe.has(key)) {
        continue;
      }
      dedupe.add(key);
      jobs.push(job);
    }

    reports.push({
      source: value.source,
      fetched: value.jobs.length,
      failed: value.error ? 1 : 0,
      error: value.error
    });
  }

  return { jobs, reports };
}
