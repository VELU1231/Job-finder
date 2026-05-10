import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-sm backdrop-blur">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-slate-600">{description}</p>
      <Link
        href={actionHref}
        className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        {actionLabel}
      </Link>
    </section>
  );
}
