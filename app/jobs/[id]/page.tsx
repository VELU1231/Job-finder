import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Job } from "@/lib/types";

async function getJob(id: string): Promise<Job | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
    return (data as Job | null) ?? null;
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

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="space-y-6">
        <Link href="/jobs" className="text-sm font-medium text-violet-700 hover:text-violet-900">
          Back to jobs
        </Link>
        <JobCard job={job} />
        <article className="rounded-[2rem] border border-white/50 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
          <h2 className="text-xl font-semibold text-slate-950">Description</h2>
          <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">
            {job.description ?? "No description provided by the source."}
          </p>
        </article>
      </div>
    </main>
  );
}
