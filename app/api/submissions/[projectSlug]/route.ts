import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectSlug: string } }
) {
  try {
    const { projectSlug } = params;

    if (!projectSlug) {
      return NextResponse.json(
        { error: "projectSlug is required" },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("submissions")
      .select("id, submitted_at, name, email, files, figma_links, slug, project_slug")
      .eq("project_slug", projectSlug)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error fetching submissions:", error);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/submissions/[projectSlug]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
