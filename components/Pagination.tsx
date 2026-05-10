import Link from "next/link";

export function Pagination({
  nextCursor,
  prevCursor,
  basePath = "/jobs",
  queryString = ""
}: {
  nextCursor: string | null;
  prevCursor: string | null;
  basePath?: string;
  queryString?: string;
}) {
  const params = queryString ? `&${queryString}` : "";

  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      <Link
        href={prevCursor ? `${basePath}?cursor=${prevCursor}${params}` : basePath}
        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
      >
        Previous
      </Link>
      <Link
        href={nextCursor ? `${basePath}?cursor=${nextCursor}${params}` : basePath}
        className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
          nextCursor ? "bg-slate-900 hover:bg-slate-700" : "cursor-not-allowed bg-slate-400"
        }`}
      >
        Next
      </Link>
    </div>
  );
}
