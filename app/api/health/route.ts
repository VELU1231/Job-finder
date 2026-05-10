import { jsonError, jsonSuccess } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const checks = {
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      cronSecret: Boolean(process.env.CRON_SECRET)
    };

    const supabase = createAdminClient();
    const { error } = await supabase.from("jobs").select("id", { count: "exact", head: true }).limit(1);

    if (error) {
      return jsonError(`Health check failed: ${error.message}`, 503);
    }

    return jsonSuccess({ ok: true, checks });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown health check error";
    return jsonError(message, 500);
  }
}
