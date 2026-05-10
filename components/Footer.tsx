import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/40 bg-white/55">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">
        <p>JobFinder builds a unified job view from multiple public APIs and feeds.</p>
        <Link href="/jobs" className="w-fit transition hover:text-slate-900">
          Browse jobs
        </Link>
      </div>
    </footer>
  );
}
