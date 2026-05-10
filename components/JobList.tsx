import type { Job } from "@/lib/types";
import { JobCard } from "./JobCard";
import { EmptyState } from "./EmptyState";

export function JobList({ jobs }: { jobs: Job[] }) {
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
