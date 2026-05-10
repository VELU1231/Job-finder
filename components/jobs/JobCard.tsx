import Link from "next/link";
import type { Job } from "@/lib/types";
import { formatSalary, truncateText } from "@/lib/utils";

const categoryColorClasses = [
  "bg-category-tech/15 text-category-tech",
  "bg-category-design/15 text-category-design",
  "bg-category-finance/15 text-category-finance",
  "bg-category-health/15 text-category-health",
  "bg-category-marketing/15 text-category-marketing",
  "bg-category-legal/15 text-category-legal",
  "bg-category-hr/15 text-category-hr",
  "bg-category-ai/15 text-category-ai"
];

function initials(input: string): string {
  const words = input.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "JF";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function hashCompanyColor(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return categoryColorClasses[Math.abs(hash) % categoryColorClasses.length] ?? categoryColorClasses[0];
}

function relativeTime(dateString: string | null): string {
  if (!dateString) {
    return "recently";
  }

  const posted = new Date(dateString).getTime();
  if (Number.isNaN(posted)) {
    return "recently";
  }

  const diffMs = Date.now() - posted;
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;
  const month = 30 * day;

  if (diffMs < hour) {
    const mins = Math.max(1, Math.floor(diffMs / (60 * 1000)));
    return `${mins}m ago`;
  }

  if (diffMs < day) {
    return `${Math.max(1, Math.floor(diffMs / hour))}h ago`;
  }

  if (diffMs < month) {
    return `${Math.max(1, Math.floor(diffMs / day))}d ago`;
  }

  return `${Math.max(1, Math.floor(diffMs / month))}mo ago`;
}

function isNewJob(dateString: string | null): boolean {
  if (!dateString) {
    return false;
  }

  const posted = new Date(dateString).getTime();
  if (Number.isNaN(posted)) {
    return false;
  }

  return Date.now() - posted < 24 * 60 * 60 * 1000;
}

export function JobCard({ job }: { job: Job }) {
  const companyName = job.company ?? "Independent";
  const slug = (job as Job & { slug?: string }).slug ?? job.id;
  const salary = formatSalary(job.salary_min, job.salary_max, job.currency);
  const showNotDisclosed = !job.salary_min && !job.salary_max;
  const logoColor = hashCompanyColor(companyName);

  return (
    <article aria-label={`${job.title} at ${companyName}`} className="group">
      <Link
        href={`/jobs/${slug}`}
        className="relative block rounded-3xl border border-surface-border bg-surface-0 p-5 shadow-card transition-all duration-base ease-smooth hover:-translate-y-[2px] hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {job.logo_url ? (
              <img
                src={job.logo_url}
                alt={`${companyName} logo`}
                className="h-10 w-10 rounded-full border border-surface-border object-cover"
              />
            ) : (
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${logoColor}`}>
                {initials(companyName)}
              </div>
            )}

            <div className="min-w-0">
              <p className="font-display line-clamp-2 text-lg font-semibold leading-tight text-surface-foreground">
                {job.title}
              </p>
              <p className="mt-1 text-sm text-surface-muted">{companyName}</p>
            </div>
          </div>

          {isNewJob(job.posted_at) ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-[11px] font-semibold text-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              NEW
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.category ? (
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">{job.category}</span>
          ) : null}
          {job.remote ? (
            <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">Remote</span>
          ) : null}
          {job.job_type ? (
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-surface-foreground/80">{job.job_type}</span>
          ) : null}
        </div>

        <p className={`mt-4 text-sm font-semibold ${showNotDisclosed ? "text-surface-muted" : "text-success"}`}>
          {showNotDisclosed ? "Not disclosed" : salary}
        </p>

        <div className="relative mt-3">
          <p className="line-clamp-2 text-sm leading-6 text-surface-foreground/85">
            {truncateText(job.description ?? "No description available.", 180)}
          </p>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-surface-0 to-transparent"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="rounded-full bg-surface-2 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-surface-muted">
            {job.source}
          </span>
          <span className="text-sm font-medium text-brand-600">View Job →</span>
        </div>

        <p className="mt-2 text-xs text-surface-muted">{relativeTime(job.posted_at)}</p>
      </Link>
    </article>
  );
}

export default JobCard;

export function JobCardSkeleton() {
  return (
    <article className="rounded-3xl border border-surface-border bg-surface-0 p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="skeleton-shimmer h-10 w-10 rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="skeleton-shimmer h-5 w-4/5 rounded-md" />
            <div className="skeleton-shimmer mt-2 h-4 w-1/2 rounded-md" />
          </div>
        </div>
        <div className="skeleton-shimmer h-6 w-14 rounded-full" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="skeleton-shimmer h-6 w-24 rounded-full" />
        <div className="skeleton-shimmer h-6 w-20 rounded-full" />
        <div className="skeleton-shimmer h-6 w-16 rounded-full" />
      </div>

      <div className="skeleton-shimmer mt-4 h-4 w-32 rounded-md" />

      <div className="mt-3 space-y-2">
        <div className="skeleton-shimmer h-4 w-full rounded-md" />
        <div className="skeleton-shimmer h-4 w-11/12 rounded-md" />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="skeleton-shimmer h-5 w-20 rounded-full" />
        <div className="skeleton-shimmer h-4 w-20 rounded-md" />
      </div>

      <div className="skeleton-shimmer mt-2 h-3 w-16 rounded-md" />
    </article>
  );
}