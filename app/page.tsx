import Link from "next/link";
import { Suspense } from "react";
import { JobList } from "@/components/JobList";
import { SearchBar } from "@/components/SearchBar";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Job } from "@/lib/types";

async function getFeaturedJobs(): Promise<Job[]> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("posted_at", { ascending: false, nullsFirst: false })
      .limit(6);

    return (data ?? []) as Job[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const jobs = await getFeaturedJobs();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="grid gap-6 rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-2xl shadow-violet-200/40 backdrop-blur lg:grid-cols-[1.3fr_0.7fr] lg:p-12">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-violet-700">
            Global jobs, normalized
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Find live roles across the web in one fast, colorful feed.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              JobFinder combines multiple public APIs and feeds into one searchable experience with a resilient sync engine, mobile-first UI, and production-ready data normalization.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse jobs
            </Link>
            <Link
              href="/post-job"
              className="rounded-full bg-gradient-to-r from-violet-600 via-emerald-500 to-amber-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:scale-[1.01]"
            >
              Post a job
            </Link>
            <Link
              href="/upload-resume"
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-violet-300 hover:text-violet-700"
            >
              Upload resume
            </Link>
          </div>
        </div>

        <div className="space-y-4 rounded-[1.75rem] bg-gradient-to-br from-violet-600 via-emerald-500 to-amber-400 p-6 text-white shadow-xl shadow-violet-300/40">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">Live baseline</p>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
              <p className="text-3xl font-black">8</p>
              <p className="mt-1 text-sm text-white/80">sources in sync</p>
            </div>
            <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
              <p className="text-3xl font-black">1 schema</p>
              <p className="mt-1 text-sm text-white/80">normalized job model</p>
            </div>
            <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
              <p className="text-3xl font-black">2026</p>
              <p className="mt-1 text-sm text-white/80">verified research baseline</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <Suspense
          fallback={
            <div className="rounded-3xl border border-surface-border bg-surface-0 p-4 shadow-card">
              <div className="skeleton-shimmer h-14 w-full rounded-2xl" />
            </div>
          }
        >
          <SearchBar />
        </Suspense>
        <JobList jobs={jobs} />
      </section>
    </main>
  );
}
