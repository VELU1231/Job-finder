"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";

export function SearchBar({ placeholder = "Search jobs, companies, or locations" }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }

    params.delete("cursor");

    startTransition(() => {
      router.push(`/jobs?${params.toString()}`);
    });
  }

  return (
    <form
      onSubmit={submitSearch}
      className="flex flex-col gap-3 rounded-3xl border border-white/50 bg-white/80 p-4 shadow-lg shadow-slate-200/60 backdrop-blur sm:flex-row"
    >
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-2xl bg-gradient-to-r from-violet-600 via-emerald-500 to-amber-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
