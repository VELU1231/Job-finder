import Link from "next/link";
import type { Job } from "@/lib/types";
import { formatDate, formatSalary, truncateText } from "@/lib/utils";

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="group rounded-3xl border border-white/50 bg-white/80 p-5 shadow-lg shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-200/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">{job.source}</p>
          <h3 className="mt-1 truncate text-xl font-semibold text-slate-950">{job.title}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {job.company ?? "Independent"} · {job.location ?? "Remote-friendly"}
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-100 via-emerald-50 to-amber-50 px-3 py-2 text-right text-xs font-semibold text-slate-700">
          {job.remote ? "Remote" : job.country ?? "Hybrid"}
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
        {truncateText(job.description ?? "No description available.", 180)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.category && (
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
            {job.category}
          </span>
        )}
        {job.job_type && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            {job.job_type}
          </span>
        )}
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
          {formatSalary(job.salary_min, job.salary_max, job.currency)}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Posted {job.posted_at ? formatDate(job.posted_at) : "recently"}</p>
        <Link
          href={job.apply_url ?? `/jobs/${job.id}`}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          View role
        </Link>
      </div>
    </article>
  );
}
