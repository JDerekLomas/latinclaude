import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const UPLOAD_BUCKET = process.env.SUPABASE_DIGITIZER_BUCKET || "digitizer-uploads";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.DIGITIZER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "DIGITIZER_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const pdf = formData.get("pdf");

    if (!(pdf instanceof Blob)) {
      return NextResponse.json({ error: "PDF file is required." }, { status: 400 });
    }

    const promptsRaw = formData.get("prompts");
    const scriptPath = (formData.get("scriptPath") as string) ?? "";
    const notes = (formData.get("notes") as string) ?? "";

    let prompts: Record<string, string> = {};
    if (typeof promptsRaw === "string" && promptsRaw.trim().length > 0) {
      try {
        prompts = JSON.parse(promptsRaw);
      } catch {
        return NextResponse.json(
          { error: "Unable to parse prompt configuration." },
          { status: 400 }
        );
      }
    }

    const supabase = createServerClient();

    const file = pdf as File;
    const originalName = sanitizeFileName(file.name || "upload.pdf");
    const timestamp = Date.now();
    const storagePath = `jobs/${timestamp}/${originalName}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(storagePath, fileBuffer, { contentType: "application/pdf" });

    if (uploadError) {
      console.error("Upload error", uploadError);
      return NextResponse.json({ error: "Unable to store PDF in Supabase." }, { status: 500 });
    }

    const { data: jobRecord, error: insertError } = await supabase
      .from("digitizer_jobs")
      .insert({
        original_name: originalName,
        storage_path: storagePath,
        script_command: scriptPath,
        notes,
        prompts,
        status: "queued",
      })
      .select()
      .single();

    if (insertError || !jobRecord) {
      console.error("Insert error", insertError);
      return NextResponse.json({ error: "Unable to create job record." }, { status: 500 });
    }

    return NextResponse.json({
      message: "Upload captured. Worker can poll Supabase to continue processing.",
      jobId: jobRecord.id,
      originalName,
      storedPath: storagePath,
      scriptPath,
      notes,
      prompts,
    });
  } catch (error) {
    console.error("Digitizer API error", error);
    return NextResponse.json(
      { error: "Failed to start digitization job. Check server logs." },
      { status: 500 }
    );
  }
}
