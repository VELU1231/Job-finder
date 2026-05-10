import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-600">404</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Page not found</h1>
      <p className="mt-4 text-slate-600">The page you were looking for does not exist or was moved.</p>
      <Link href="/" className="mt-8 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
        Go home
      </Link>
    </main>
  );
}
