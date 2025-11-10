import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SubmissionFile } from "@/lib/types";

// 1ユーザーあたりの累計最大ファイル数
const MAX_FILES_PER_PROJECT = 10;

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

    const projectSlug = body.projectSlug || body.slug;

    // 冪等性チェック: 同じslugの提出が既に存在する場合は既存のデータを返す
    const { data: existingSubmission, error: duplicateCheckError } = await supabase
      .from("submissions")
      .select("id, slug, files, project_slug")
      .eq("slug", body.slug)
      .single();

    if (duplicateCheckError && duplicateCheckError.code !== "PGRST116") {
      // PGRST116 = "No rows found" エラー以外はエラーとして処理
      console.error("Error checking for duplicate submission:", duplicateCheckError);
      return new NextResponse(
        JSON.stringify({
          error: "重複チェック中にエラーが発生しました",
        }),
        { status: 500 }
      );
    }

    // 既存の提出が見つかった場合は、それを返す（冪等性）
    if (existingSubmission) {
      console.log("Duplicate submission detected, returning existing submission:", existingSubmission.id);

      // 既存ファイル数を計算
      const { data: allSubmissions } = await supabase
        .from("submissions")
        .select("files")
        .eq("project_slug", projectSlug);

      const existingFileCount = (allSubmissions || []).reduce((count, submission) => {
        return count + (Array.isArray(submission.files) ? submission.files.length : 0);
      }, 0);

      return new NextResponse(
        JSON.stringify({
          success: true,
          id: existingSubmission.id,
          slug: existingSubmission.slug,
          duplicate: true,
          fileCount: {
            existing: existingFileCount,
            new: 0,
            total: existingFileCount,
            max: MAX_FILES_PER_PROJECT,
          },
        }),
        { status: 200 }
      );
    }

    // プロジェクトが既存かチェック
    const { data: existingProjects, error: fetchError } = await supabase
      .from("submissions")
      .select("name, email")
      .eq("project_slug", projectSlug)
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

    // 既存ファイル数の取得
    const { data: existingSubmissions, error: filesCountError } = await supabase
      .from("submissions")
      .select("files")
      .eq("project_slug", projectSlug);

    if (filesCountError) {
      console.error("Error fetching existing files:", filesCountError);
      return new NextResponse(
        JSON.stringify({
          error: "既存のファイル情報取得中にエラーが発生しました",
        }),
        { status: 500 }
      );
    }

    // プロジェクト全体の既存ファイル数を計算
    const existingFileCount = existingSubmissions.reduce((count, submission) => {
      return count + (Array.isArray(submission.files) ? submission.files.length : 0);
    }, 0);

    // 新規ファイル数
    const newFileCount = Array.isArray(body.files) ? body.files.length : 0;

    // 合計ファイル数が上限を超えているかチェック
    if (existingFileCount + newFileCount > MAX_FILES_PER_PROJECT) {
      return new NextResponse(
        JSON.stringify({
          error: `プロジェクト全体で最大${MAX_FILES_PER_PROJECT}ファイルまでです。現在${existingFileCount}ファイル登録済みのため、あと${
            MAX_FILES_PER_PROJECT - existingFileCount
          }ファイルまでアップロード可能です。`,
          code: "file_limit_exceeded",
          existingFileCount,
          maxFiles: MAX_FILES_PER_PROJECT,
          remainingFiles: MAX_FILES_PER_PROJECT - existingFileCount,
        }),
        { status: 400 }
      );
    }

    // Create a new submission record with files stored as JSON
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        name: body.name,
        email: body.email, // emailは必須なのでnullチェック不要
        slug: body.slug,
        project_slug: projectSlug,
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
        fileCount: {
          existing: existingFileCount,
          new: newFileCount,
          total: existingFileCount + newFileCount,
          max: MAX_FILES_PER_PROJECT,
        },
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
