"use client";

import { useState, useTransition, type FormEvent } from "react";

export function ResumeUploadForm() {
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<"pdf" | "docx">("pdf");
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setUploadData(null);

    startTransition(async () => {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileName,
          fileType,
          sessionId: sessionId || undefined
        })
      });

      const payload = (await response.json()) as { success: boolean; error?: string; data?: unknown };

      if (!response.ok || !payload.success) {
        setMessage(payload.error ?? "Upload signing failed");
        return;
      }

      setMessage("Signed upload URL created successfully.");
      setUploadData(JSON.stringify(payload.data, null, 2));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg shadow-slate-200/60 backdrop-blur">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">File name</span>
          <input
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
            placeholder="resume"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">File type</span>
          <select
            value={fileType}
            onChange={(event) => setFileType(event.target.value as "pdf" | "docx")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          >
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
          </select>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Session ID</span>
        <input
          value={sessionId}
          onChange={(event) => setSessionId(event.target.value)}
          placeholder="optional session id"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Preparing upload..." : "Create signed upload URL"}
      </button>

      {message && <p className="text-sm text-slate-700">{message}</p>}

      {uploadData && (
        <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
          {JSON.stringify(uploadData, null, 2)}
        </pre>
      )}
    </form>
  );
}
