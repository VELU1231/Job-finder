import type { Metadata } from "next";
import { PostJobForm } from "@/components/PostJobForm";

export const metadata: Metadata = {
  title: "Post a Job",
  description: "Publish a bold, high-signal job listing into the JobFinder feed."
};

export default function PostJobPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-2xl shadow-violet-200/30 backdrop-blur lg:p-10">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Hiring</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Post a role that actually feels worth clicking.</h1>
          <p className="text-lg leading-8 text-slate-600">
            Use the same bright, fast JobFinder surface to publish your opening, route candidates to the right apply link, and keep the listing visible across search and detail views.
          </p>
        </div>
      </section>

      <PostJobForm />
    </main>
  );
}