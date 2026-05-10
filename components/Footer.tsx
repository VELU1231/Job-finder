import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/40 bg-white/55">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>JobFinder builds a unified job view from multiple public APIs and feeds.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/jobs" className="transition hover:text-slate-900">
            Browse jobs
          </Link>
          <Link href="/api/health" className="transition hover:text-slate-900">
            API health
          </Link>
        </div>
      </div>
    </footer>
  );
}
