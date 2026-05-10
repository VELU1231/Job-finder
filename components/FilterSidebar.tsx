import Link from "next/link";

const categoryLinks = [
  "Tech & Engineering",
  "AI & Data Science",
  "DevOps & Cloud",
  "Design & Creative",
  "Marketing & Growth",
  "Product & Management"
];

export function FilterSidebar({
  currentCategory,
  currentRemote
}: {
  currentCategory?: string;
  currentRemote?: boolean;
}) {
  return (
    <aside className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-lg shadow-slate-200/60 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">Filters</h2>
        <Link href="/jobs" className="text-sm font-medium text-violet-700 hover:text-violet-900">
          Clear
        </Link>
      </div>

      <div className="mt-5 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Category</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categoryLinks.map((category) => (
              <Link
                key={category}
                href={`/jobs?category=${encodeURIComponent(category)}`}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  currentCategory === category
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-violet-100 hover:text-violet-900"
                }`}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Remote</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/jobs?remote=true"
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                currentRemote ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Remote only
            </Link>
            <Link
              href="/jobs"
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              All jobs
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
