import type { Job } from "@/lib/types";
import { JobCard } from "./JobCard";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";

export function JobList({ jobs, loading = false }: { jobs: Job[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-white/40 bg-white/70 p-5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-3 h-7 w-3/4" />
            <Skeleton className="mt-4 h-20 w-full" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <EmptyState
        title="No jobs found"
        description="Try a broader keyword or clear the active filters to reveal more live roles."
        actionHref="/jobs"
        actionLabel="Reset search"
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {jobs.map((job) => (
        <JobCard key={`${job.source}:${job.source_id}`} job={job} />
      ))}
    </div>
  );
}
