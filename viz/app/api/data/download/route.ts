import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newsletter, dataset } = body;

    if (!email || !dataset) {
      return NextResponse.json(
        { error: "Email and dataset are required" },
        { status: 400 }
      );
    }

    // Record the download in Supabase
    // Table: data_downloads (create if doesn't exist)
    const { error } = await supabase.from("data_downloads").insert({
      email,
      newsletter: newsletter || false,
      dataset,
      downloaded_at: new Date().toISOString(),
      user_agent: request.headers.get("user-agent") || null,
    });

    if (error) {
      // If table doesn't exist, log but don't fail the download
      console.error("Supabase error (may need to create data_downloads table):", error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Download tracking error:", err);
    // Don't fail the download even if tracking fails
    return NextResponse.json({ success: true });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Data download API",
    usage: "POST with { email, newsletter, dataset }",
  });
}
