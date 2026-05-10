import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FilterSidebar } from "@/components/FilterSidebar";
import { JobList } from "@/components/JobList";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Job } from "@/lib/types";

export const metadata: Metadata = {
  title: "Jobs | JobFinder",
  description: "Browse normalized jobs from live APIs, feeds, and company boards."
};

type SearchParams = {
  q?: string;
  category?: string;
  remote?: string;
  cursor?: string;
};

async function loadJobs(params: SearchParams): Promise<{ jobs: Job[]; total: number; nextCursor: string | null }> {
  try {
    const supabase = createAdminClient();
    const limit = 20;
    const offset = Number(params.cursor ?? 0) || 0;
    const categories = params.category ? [params.category] : [];
    const q = params.q?.trim() ?? "";

    let query = supabase.from("jobs").select("*", { count: "exact" }).eq("is_active", true);

    if (q) {
      query = query.textSearch("search_vector", q, { config: "english" });
    }

    if (categories.length) {
      query = query.in("category", categories);
    }

    if (params.remote === "true" || params.remote === "false") {
      query = query.eq("remote", params.remote === "true");
    }

    const { data, count } = await query.order("posted_at", { ascending: false, nullsFirst: false }).range(offset, offset + limit - 1);

    return {
      jobs: (data ?? []) as Job[],
      total: count ?? 0,
      nextCursor: count !== null && offset + limit < count ? String(offset + limit) : null
    };
  } catch {
    return { jobs: [], total: 0, nextCursor: null };
  }
}

export default async function JobsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const { jobs, nextCursor, total } = await loadJobs(params);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar currentCategory={params.category} currentRemote={params.remote === "true"} />

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-white/50 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Jobs</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Live opportunities</h1>
                </div>
                <p className="text-sm text-slate-600">{total} total matches</p>
              </div>
              <Suspense fallback={<div className="h-14 animate-pulse rounded-2xl bg-slate-200/80" />}>
                <SearchBar placeholder="Search by title, company, or location" />
              </Suspense>
            </div>
          </div>

          <JobList jobs={jobs} />
          <Pagination nextCursor={nextCursor} prevCursor={params.cursor && Number(params.cursor) > 0 ? String(Math.max(0, Number(params.cursor) - 20)) : null} queryString={`q=${encodeURIComponent(params.q ?? "")}&category=${encodeURIComponent(params.category ?? "")}&remote=${encodeURIComponent(params.remote ?? "")}`} />

          <div className="flex justify-end">
            <Link href="/api/jobs" className="text-sm font-medium text-violet-700 hover:text-violet-900">
              API response
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
