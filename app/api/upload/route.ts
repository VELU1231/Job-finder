import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

const UploadRequestSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.enum(["pdf", "docx"]),
  fileSize: z.number().int().nonnegative().optional(),
  sessionId: z.string().min(1).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = UploadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid upload request", 400);
    }

    const supabase = createAdminClient();
    const safeName = slugify(parsed.data.fileName).slice(0, 80) || "resume";
    const path = `${parsed.data.sessionId ?? "public"}/${Date.now()}-${safeName}.${parsed.data.fileType}`;
    const { data, error } = await supabase.storage.from("resumes").createSignedUploadUrl(path);

    if (error) {
      return jsonError(`Upload signing failed: ${error.message}`, 502);
    }

    return jsonSuccess({
      bucket: "resumes",
      path,
      fileName: parsed.data.fileName,
      fileType: parsed.data.fileType,
      fileSize: parsed.data.fileSize ?? null,
      sessionId: parsed.data.sessionId ?? null,
      upload: data
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload signing error";
    return jsonError(message, 500);
  }
}
