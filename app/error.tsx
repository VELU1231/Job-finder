"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-300">Application error</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Something broke.</h1>
          <p className="mt-4 text-slate-300">{error.message}</p>
          <button
            onClick={() => reset()}
            className="mt-8 inline-flex w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
