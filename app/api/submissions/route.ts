import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SubmissionFile, SlotAcceptType } from "@/lib/types";
import { validateFileType } from "@/lib/file-validation";

// 1ユーザーあたりの累計最大ファイル数
const MAX_FILES_PER_PROJECT = 10;

// スロット対応のファイル入力型
interface SlotFileInput {
  slotId: string;
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}

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
    // review_status は自動的に 'pending'（確認待ち）に設定
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
        review_status: "pending", // 検品ワークフロー: 確認待ち状態で開始
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

    // スロット対応のファイル処理
    const slotFiles: SlotFileInput[] = body.slotFiles || [];
    const slotFileResults: { slotId: string; fileId: string; version: number }[] = [];

    if (slotFiles.length > 0) {
      // プロジェクトIDを取得（スロット検証用）
      const { data: projectData } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", projectSlug)
        .single();

      if (projectData) {
        for (const slotFile of slotFiles) {
          // スロット情報を取得
          const { data: slot } = await supabase
            .from("project_slots")
            .select("id, accept_type")
            .eq("id", slotFile.slotId)
            .eq("project_id", projectData.id)
            .single();

          if (!slot) {
            console.error(`Slot not found: ${slotFile.slotId}`);
            continue;
          }

          // ファイル種類バリデーション
          if (slotFile.mimeType) {
            const validation = validateFileType(
              { type: slotFile.mimeType, name: slotFile.name },
              slot.accept_type as SlotAcceptType
            );
            if (!validation.valid) {
              console.error(`File validation failed for ${slotFile.name}: ${validation.error}`);
              continue;
            }
          }

          // 既存の is_latest フラグを false に更新
          await supabase
            .from("slot_files")
            .update({ is_latest: false })
            .eq("slot_id", slotFile.slotId)
            .eq("is_latest", true);

          // 現在の最大バージョンを取得
          const { data: maxVersionFile } = await supabase
            .from("slot_files")
            .select("version")
            .eq("slot_id", slotFile.slotId)
            .order("version", { ascending: false })
            .limit(1)
            .single();

          const newVersion = (maxVersionFile?.version || 0) + 1;

          // 新しいスロットファイルを作成
          const { data: newSlotFile, error: slotFileError } = await supabase
            .from("slot_files")
            .insert({
              slot_id: slotFile.slotId,
              submission_id: data.id,
              file_name: slotFile.name,
              file_url: slotFile.url,
              file_size: slotFile.size || null,
              version: newVersion,
              is_latest: true,
              review_status: "pending",
              submitted_by_name: body.name,
              submitted_by_email: body.email,
            })
            .select("id, version")
            .single();

          if (slotFileError) {
            console.error("Slot file insert error:", slotFileError);
            continue;
          }

          if (newSlotFile) {
            slotFileResults.push({
              slotId: slotFile.slotId,
              fileId: newSlotFile.id,
              version: newSlotFile.version,
            });
          }
        }
      }
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
        slotFiles: slotFileResults,
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
