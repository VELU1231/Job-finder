import type { Metadata } from "next";
import { ResumeUploadForm } from "@/components/ResumeUploadForm";

export const metadata: Metadata = {
  title: "Upload Resume | JobFinder",
  description: "Create a signed Supabase upload URL for a resume file."
};

export default function UploadResumePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="space-y-6 rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Resume upload</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">Prepare your resume for upload</h1>
          <p className="max-w-2xl text-slate-600">
            This creates a signed upload URL for the Supabase resumes bucket so the client can upload directly.
          </p>
        </div>

        <ResumeUploadForm />
      </section>
    </main>
  );
}
