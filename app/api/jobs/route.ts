import { NextRequest } from "next/server";
import { jsonError, jsonSuccess, cacheHeaders, clampLimit, csv, parseOffset } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const limit = clampLimit(searchParams.get("limit"), 20, 50);
    const offset = parseOffset(searchParams.get("cursor"));
    const q = searchParams.get("q")?.trim() ?? "";
    const categories = csv(searchParams.get("category"));
    const jobTypes = csv(searchParams.get("job_type"));
    const country = searchParams.get("country")?.trim();
    const remote = searchParams.get("remote");
    const minSalary = searchParams.get("minSalary");
    const maxSalary = searchParams.get("maxSalary");

    let query = supabase.from("jobs").select("*", { count: "exact" });

    if (q) {
      query = query.textSearch("search_vector", q, { config: "english" });
    }

    if (categories.length) {
      query = query.in("category", categories);
    }

    if (jobTypes.length) {
      query = query.in("job_type", jobTypes);
    }

    if (country) {
      query = query.eq("country", country);
    }

    if (remote === "true" || remote === "false") {
      query = query.eq("remote", remote === "true");
    }

    if (minSalary) {
      query = query.gte("salary_max", Number(minSalary));
    }

    if (maxSalary) {
      query = query.lte("salary_min", Number(maxSalary));
    }

    const { data, error, count } = await query
      .order("posted_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return jsonError(`Jobs lookup failed: ${error.message}`, 502);
    }

    const nextCursor = count !== null && offset + limit < count ? String(offset + limit) : null;

    return jsonSuccess(
      {
        jobs: data ?? [],
        total: count ?? 0,
        nextCursor
      },
      { headers: cacheHeaders(30) }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown jobs lookup error";
    return jsonError(message, 500);
  }
}
