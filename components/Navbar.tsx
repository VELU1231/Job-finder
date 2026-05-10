import Link from "next/link";

const navItems = [
  { href: "/jobs", label: "Jobs" },
  { href: "/post-job", label: "Post a Job" },
  { href: "/upload-resume", label: "Upload Resume" }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group inline-flex items-center gap-3 font-semibold text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-emerald-500 to-amber-400 text-white shadow-lg shadow-violet-500/25 transition group-hover:scale-105">
              JF
            </span>
            <span>
              <span className="block text-lg leading-none">JobFinder</span>
              <span className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                Global discovery
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  item.href === "/post-job"
                    ? "bg-gradient-to-r from-violet-600 via-emerald-500 to-amber-400 text-white shadow-lg shadow-violet-200 hover:scale-[1.02]"
                    : "text-slate-700 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                item.href === "/post-job"
                  ? "bg-gradient-to-r from-violet-600 via-emerald-500 to-amber-400 text-white shadow-lg shadow-violet-200 hover:scale-[1.02]"
                  : "text-slate-700 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
