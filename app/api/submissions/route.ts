import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SubmissionFile } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const body = await request.json();

    // Required fields validation
    if (!body.name || !body.email || !body.slug || !body.submittedAt) {
      return new NextResponse(
        JSON.stringify({
          error: "必須項目が不足しています: 名前、メールアドレス、提出日時",
        }),
        { status: 400 }
      );
    }

    // Ensure files is an array
    if (!body.files) {
      body.files = [];
    }

    // プロジェクトが既存かチェック
    const { data: existingProjects, error: fetchError } = await supabase
      .from("submissions")
      .select("name, email")
      .eq("project_slug", body.projectSlug || body.slug)
      .order("submitted_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Error checking existing projects:", fetchError);
      return new NextResponse(
        JSON.stringify({
          error: "既存の提出情報確認中にエラーが発生しました",
        }),
        { status: 500 }
      );
    }

    // 既存プロジェクトがあり、かつメールアドレスが異なる場合はエラー
    if (existingProjects && existingProjects.length > 0) {
      const latestSubmission = existingProjects[0];

      // メールアドレスが異なる場合はエラー（メールアドレスは必須なので比較のみ）
      const emailMatches = latestSubmission.email === body.email;

      if (!emailMatches) {
        return new NextResponse(
          JSON.stringify({
            error: "このプロジェクトへの提出権限がありません。前回と同じメールアドレスを使用してください。",
            code: "permission_denied",
          }),
          { status: 403 }
        );
      }
    }

    // Create a new submission record with files stored as JSON
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        name: body.name,
        email: body.email, // emailは必須なのでnullチェック不要
        slug: body.slug,
        project_slug: body.projectSlug || body.slug, // projectSlugがなければslugを使用
        submitted_at: body.submittedAt,
        figma_links: body.figmaLinks || [],
        files: body.files || [], // Store files as JSON
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return new NextResponse(
        JSON.stringify({
          error: "提出情報の保存に失敗しました",
        }),
        { status: 500 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        id: data.id,
        slug: body.slug,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Submission API error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "サーバー内部エラーが発生しました",
      }),
      { status: 500 }
    );
  }
}
