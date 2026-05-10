import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectCategory, normalizeJobType, slugify } from "@/lib/utils";

const PostJobSchema = z
  .object({
    title: z.string().min(3).max(140),
    company: z.string().min(2).max(120),
    location: z.string().min(2).max(120),
    country: z.string().max(80).optional().or(z.literal("")),
    description: z.string().min(40).max(12000),
    applyUrl: z.url(),
    jobType: z.enum(["full-time", "part-time", "contract", "internship", "freelance"]),
    category: z.string().max(80).optional().or(z.literal("")),
    remote: z.boolean().default(true),
    salaryMin: z.number().int().nonnegative().optional(),
    salaryMax: z.number().int().nonnegative().optional()
  })
  .refine((value) => !value.salaryMin || !value.salaryMax || value.salaryMax >= value.salaryMin, {
    message: "Salary max must be greater than or equal to salary min"
  });

function getCompanyWebsite(applyUrl: string) {
  try {
    const url = new URL(applyUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PostJobSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid job post payload", 400);
    }

    const input = parsed.data;
    const supabase = createAdminClient();
    const sourceId = `${slugify(input.company)}-${Date.now()}`;
    const category = input.category?.trim() || detectCategory(input.title);
    const companySlug = slugify(input.company);
    const website = getCompanyWebsite(input.applyUrl);

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        title: input.title.trim(),
        company: input.company.trim(),
        location: input.location.trim(),
        country: input.country?.trim() || null,
        remote: input.remote,
        job_type: normalizeJobType(input.jobType),
        category,
        description: input.description.trim(),
        apply_url: input.applyUrl,
        salary_min: input.salaryMin ?? null,
        salary_max: input.salaryMax ?? null,
        currency: "USD",
        source: "manual",
        source_id: sourceId,
        tags: [category, input.jobType, input.remote ? "remote" : "on-site"],
        posted_at: new Date().toISOString(),
        is_active: true
      })
      .select("id, company")
      .single();

    if (error || !data) {
      return jsonError(error?.message ?? "Job posting failed", 502);
    }

    const { error: companyError } = await supabase.from("companies").upsert(
      {
        name: input.company.trim(),
        slug: companySlug,
        website,
        country: input.country?.trim() || null
      },
      { onConflict: "slug" }
    );

    if (companyError) {
      return jsonError(companyError.message, 502);
    }

    return jsonSuccess({
      id: data.id,
      company: data.company,
      detailUrl: `/jobs/${data.id}`
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown job posting error";
    return jsonError(message, 500);
  }
}