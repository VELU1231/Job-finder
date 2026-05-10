import { NextRequest } from "next/server";
import { jsonError, jsonSuccess, cacheHeaders, clampLimit } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const limit = clampLimit(searchParams.get("limit"), 20, 100);
    const q = searchParams.get("q")?.trim() ?? "";

    let query = supabase.from("companies").select("*");

    if (q) {
      query = query.ilike("name", `%${q}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);

    if (error) {
      return jsonError(`Companies lookup failed: ${error.message}`, 502);
    }

    return jsonSuccess(
      {
        companies: data ?? []
      },
      { headers: cacheHeaders(120) }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown companies lookup error";
    return jsonError(message, 500);
  }
}
