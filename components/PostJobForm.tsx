"use client";

import Link from "next/link";
import { BriefcaseBusiness, Building2, Globe2, MapPin, Sparkles } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";

type PostJobPayload = {
  title: string;
  company: string;
  location: string;
  country: string;
  description: string;
  applyUrl: string;
  jobType: "full-time" | "part-time" | "contract" | "internship" | "freelance";
  category: string;
  remote: boolean;
  salaryMin: string;
  salaryMax: string;
};

const initialState: PostJobPayload = {
  title: "",
  company: "",
  location: "",
  country: "",
  description: "",
  applyUrl: "",
  jobType: "full-time",
  category: "",
  remote: true,
  salaryMin: "",
  salaryMax: ""
};

export function PostJobForm() {
  const [form, setForm] = useState<PostJobPayload>(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<Key extends keyof PostJobPayload>(key: Key, value: PostJobPayload[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setCreatedJobId(null);

    startTransition(async () => {
      const response = await fetch("/api/post-job", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined
        })
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: string;
        data?: { id: string; detailUrl: string; company: string };
      };

      if (!response.ok || !payload.success || !payload.data) {
        setMessage(payload.error ?? "Job posting failed. Check the fields and try again.");
        return;
      }

      setMessage(`Job posted for ${payload.data.company}.`);
      setCreatedJobId(payload.data.id);
      setForm(initialState);
    });
  }

  const filledClass = "data-[filled=true]:border-violet-300 data-[filled=true]:bg-violet-50/40";
  const inputClass = `w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 ${filledClass}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur sm:p-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Post a job</p>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Bring your role into the feed.</h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
                <Sparkles className="h-3.5 w-3.5" />
                Live-ready
              </span>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Add the essentials once. JobFinder will generate a polished detail page, searchable metadata, and direct apply routing.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Job title</span>
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Senior Product Designer"
                data-filled={Boolean(form.title)}
                className={inputClass}
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Company</span>
              <input
                value={form.company}
                onChange={(event) => updateField("company", event.target.value)}
                placeholder="Northstar Labs"
                data-filled={Boolean(form.company)}
                className={inputClass}
                required
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Location</span>
              <input
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="Berlin or Remote"
                data-filled={Boolean(form.location)}
                className={inputClass}
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Country</span>
              <input
                value={form.country}
                onChange={(event) => updateField("country", event.target.value)}
                placeholder="Germany"
                data-filled={Boolean(form.country)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 sm:col-span-1">
              <span className="text-sm font-medium text-slate-700">Job type</span>
              <select
                value={form.jobType}
                onChange={(event) => updateField("jobType", event.target.value as PostJobPayload["jobType"])}
                className={inputClass}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Category</span>
              <input
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                placeholder="Design & Creative"
                data-filled={Boolean(form.category)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Job description</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Tell candidates what they will own, how the team works, and what makes the role worth their time."
              data-filled={Boolean(form.description)}
              className={`${inputClass} min-h-40 resize-y py-4`}
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Apply URL</span>
              <input
                type="url"
                value={form.applyUrl}
                onChange={(event) => updateField("applyUrl", event.target.value)}
                placeholder="https://company.com/jobs/senior-product-designer"
                data-filled={Boolean(form.applyUrl)}
                className={inputClass}
                required
              />
            </label>

            <label className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.remote}
                onChange={(event) => updateField("remote", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-400"
              />
              Remote friendly
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Salary min</span>
              <input
                type="number"
                min="0"
                value={form.salaryMin}
                onChange={(event) => updateField("salaryMin", event.target.value)}
                placeholder="90000"
                data-filled={Boolean(form.salaryMin)}
                className={inputClass}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Salary max</span>
              <input
                type="number"
                min="0"
                value={form.salaryMax}
                onChange={(event) => updateField("salaryMax", event.target.value)}
                placeholder="130000"
                data-filled={Boolean(form.salaryMax)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-gradient-to-r from-violet-600 via-emerald-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Publishing job..." : "Publish listing"}
            </button>
            <Link
              href="/jobs"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-violet-300 hover:text-violet-700"
            >
              Browse live jobs
            </Link>
          </div>

          {message && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <p>{message}</p>
              {createdJobId ? (
                <Link href={`/jobs/${createdJobId}`} className="mt-2 inline-flex font-semibold text-emerald-800 underline underline-offset-4">
                  View the job detail page
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </form>

      <aside className="space-y-4">
        <section className="rounded-[2rem] bg-gradient-to-br from-violet-600 via-emerald-500 to-amber-400 p-6 text-white shadow-2xl shadow-violet-300/40">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">UI builder mode</p>
          <h3 className="mt-3 text-2xl font-black tracking-tight">A hiring funnel that feels premium on first touch.</h3>
          <p className="mt-3 text-sm leading-6 text-white/85">
            The form keeps only the fields that candidates and aggregators actually need, then styles them with the same bold rhythm as the rest of JobFinder.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 text-violet-600" />
              <div>
                <p className="font-semibold text-slate-900">Company-first storytelling</p>
                <p className="mt-1">Strong company naming and location fields make each detail page more credible and easier to scan.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BriefcaseBusiness className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-900">Structured listing metadata</p>
                <p className="mt-1">Remote status, category, and job type are captured upfront so the listing works across search, filters, and cards.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold text-slate-900">Mobile-first completion</p>
                <p className="mt-1">The grid collapses cleanly on small screens, and every input keeps the same focus and fill feedback pattern.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe2 className="mt-0.5 h-5 w-5 text-slate-700" />
              <div>
                <p className="font-semibold text-slate-900">Direct apply routing</p>
                <p className="mt-1">A clean apply URL is enough to generate a proper CTA on cards and the full job page.</p>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}