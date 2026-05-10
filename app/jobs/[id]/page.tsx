import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Company, Job } from "@/lib/types";
import { formatDate, formatSalary } from "@/lib/utils";

async function getJob(id: string): Promise<Job | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
    return (data as Job | null) ?? null;
  } catch {
    return null;
  }
}

async function getCompany(name: string | null): Promise<Company | null> {
  if (!name) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("companies")
      .select("*")
      .ilike("name", name)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return (data as Company | null) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    return { title: "Job not found | JobFinder" };
  }

  return {
    title: `${job.title} at ${job.company ?? "Unknown company"} | JobFinder`,
    description: job.description?.slice(0, 160) ?? `Apply for ${job.title} on JobFinder.`
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    notFound();
  }

  const company = await getCompany(job.company);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="space-y-6">
        <Link href="/jobs" className="text-sm font-medium text-violet-700 hover:text-violet-900">
          Back to jobs
        </Link>

        <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
                  {job.source}
                </span>
                {job.category ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{job.category}</span>
                ) : null}
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {job.remote ? "Remote friendly" : job.location ?? "On-site"}
                </span>
              </div>

              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{job.title}</h1>
                <p className="mt-3 text-lg text-slate-600">
                  {job.company ?? "Independent team"} · {job.location ?? "Flexible location"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {job.job_type ? (
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{job.job_type}</span>
                ) : null}
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  Posted {job.posted_at ? formatDate(job.posted_at) : "recently"}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {formatSalary(job.salary_min, job.salary_max, job.currency)}
                </span>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[1.75rem] bg-gradient-to-br from-violet-600 via-emerald-500 to-amber-400 p-5 text-white shadow-xl shadow-violet-300/40">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">Next step</p>
              <p className="mt-3 text-2xl font-black tracking-tight">Move from discovery to decision.</p>
              <p className="mt-3 text-sm leading-6 text-white/85">
                Review the role details, check the company context, then head straight to the original application flow.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="#role-overview"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  View Job
                </Link>
                <Link
                  href={job.apply_url ?? `/jobs/${job.id}`}
                  className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article id="role-overview" className="rounded-[2rem] border border-white/50 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
            <h2 className="text-xl font-semibold text-slate-950">Role overview</h2>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">
              {job.description ?? "No description provided by the source."}
            </p>
          </article>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/50 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
              <h2 className="text-xl font-semibold text-slate-950">Company Info</h2>
              <dl className="mt-4 space-y-4 text-sm text-slate-600">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Company</dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">{company?.name ?? job.company ?? "Independent team"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Location</dt>
                  <dd className="mt-1 text-slate-700">{job.location ?? company?.country ?? "Flexible"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Industry</dt>
                  <dd className="mt-1 text-slate-700">{company?.industry ?? job.category ?? "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Company size</dt>
                  <dd className="mt-1 text-slate-700">{company?.size ?? "Not listed"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Website</dt>
                  <dd className="mt-1">
                    {company?.website ? (
                      <Link href={company.website} className="font-medium text-violet-700 hover:text-violet-900">
                        {company.website}
                      </Link>
                    ) : (
                      <span className="text-slate-700">Available through the apply flow</span>
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-[2rem] border border-white/50 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
              <h2 className="text-xl font-semibold text-slate-950">Job snapshot</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Source</p>
                  <p className="mt-1 font-semibold text-slate-900">{job.source}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Views</p>
                  <p className="mt-1 font-semibold text-slate-900">{job.views}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Country</p>
                  <p className="mt-1 font-semibold text-slate-900">{job.country ?? company?.country ?? "Global"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Added</p>
                  <p className="mt-1 font-semibold text-slate-900">{formatDate(job.created_at)}</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
