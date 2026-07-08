import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { ReviewStatus } from "@/lib/types";

interface FileReviewRequestBody {
  submission_id: string;
  file_index: number;
  file_name: string;
  file_url: string;
  review_status: ReviewStatus;
  review_comment?: string;
}

interface FileDeleteRequestBody {
  submission_id: string;
  file_index: number;
  // 提出者認証用（Clerk認証がない場合）
  submitter_name?: string;
  submitter_email?: string;
}

// POST: ファイル単位のレビューを作成または更新
export async function POST(request: Request) {
  try {
    // Clerk認証チェック（ホストのみ操作可能）
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({
          error: "認証が必要です",
        }),
        { status: 401 }
      );
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const body: FileReviewRequestBody = await request.json();

    // バリデーション
    if (!body.submission_id) {
      return new NextResponse(
        JSON.stringify({ error: "submission_id が必要です" }),
        { status: 400 }
      );
    }

    if (body.file_index === undefined || body.file_index < 0) {
      return new NextResponse(
        JSON.stringify({ error: "有効な file_index が必要です" }),
        { status: 400 }
      );
    }

    if (!body.file_name || !body.file_url) {
      return new NextResponse(
        JSON.stringify({ error: "file_name と file_url が必要です" }),
        { status: 400 }
      );
    }

    if (!body.review_status || !["pending", "approved", "rejected"].includes(body.review_status)) {
      return new NextResponse(
        JSON.stringify({
          error: "有効な review_status を指定してください: pending, approved, rejected",
        }),
        { status: 400 }
      );
    }

    // 差戻し時はコメント必須
    if (body.review_status === "rejected" && !body.review_comment?.trim()) {
      return new NextResponse(
        JSON.stringify({
          error: "差戻しの場合は修正指示コメントが必須です",
        }),
        { status: 400 }
      );
    }

    // 提出が存在するか確認
    const { data: submission, error: fetchError } = await supabase
      .from("submissions")
      .select("id, project_slug")
      .eq("id", body.submission_id)
      .single();

    if (fetchError || !submission) {
      return new NextResponse(
        JSON.stringify({ error: "提出が見つかりません" }),
        { status: 404 }
      );
    }

    // プロジェクトの所有者確認
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("user_id")
      .eq("slug", submission.project_slug)
      .single();

    if (projectError || !project) {
      return new NextResponse(
        JSON.stringify({ error: "プロジェクトが見つかりません" }),
        { status: 404 }
      );
    }

    if (project.user_id !== userId) {
      return new NextResponse(
        JSON.stringify({ error: "このプロジェクトのレビュー権限がありません" }),
        { status: 403 }
      );
    }

    // Upsert: 既存のレビューを更新、なければ作成
    const reviewData = {
      submission_id: body.submission_id,
      file_index: body.file_index,
      file_name: body.file_name,
      file_url: body.file_url,
      review_status: body.review_status,
      review_comment: body.review_status === "rejected" ? body.review_comment : null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
    };

    const { data, error: upsertError } = await supabase
      .from("file_reviews")
      .upsert(reviewData, {
        onConflict: "submission_id,file_index",
      })
      .select()
      .single();

    if (upsertError) {
      console.error("Supabase error:", upsertError);
      return new NextResponse(
        JSON.stringify({
          error: "ファイルレビューの保存に失敗しました",
        }),
        { status: 500 }
      );
    }

    // 全ファイルのレビュー状況を取得して、提出全体のステータスを自動更新
    const { data: allReviews } = await supabase
      .from("file_reviews")
      .select("review_status")
      .eq("submission_id", body.submission_id);

    // 提出のファイル数を取得
    const { data: submissionData } = await supabase
      .from("submissions")
      .select("files")
      .eq("id", body.submission_id)
      .single();

    const totalFiles = Array.isArray(submissionData?.files) ? submissionData.files.length : 0;
    const reviewedFiles = allReviews?.length || 0;

    // 全ファイルがレビュー済みの場合、提出全体のステータスを自動更新
    if (totalFiles > 0 && reviewedFiles >= totalFiles) {
      const hasRejected = allReviews?.some((r) => r.review_status === "rejected");
      const allApproved = allReviews?.every((r) => r.review_status === "approved");

      let newSubmissionStatus: ReviewStatus = "pending";
      if (allApproved) {
        newSubmissionStatus = "approved";
      } else if (hasRejected) {
        newSubmissionStatus = "rejected";
      }

      await supabase
        .from("submissions")
        .update({
          review_status: newSubmissionStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId,
        })
        .eq("id", body.submission_id);
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: body.review_status === "approved" ? "ファイルを承認しました" : "ファイルを差戻ししました",
        file_review: data,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("File review API error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "サーバー内部エラーが発生しました",
      }),
      { status: 500 }
    );
  }
}

// DELETE: ファイルを論理削除
export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const body: FileDeleteRequestBody = await request.json();

    // バリデーション
    if (!body.submission_id) {
      return new NextResponse(
        JSON.stringify({ error: "submission_id が必要です" }),
        { status: 400 }
      );
    }

    if (body.file_index === undefined || body.file_index < 0) {
      return new NextResponse(
        JSON.stringify({ error: "有効な file_index が必要です" }),
        { status: 400 }
      );
    }

    // 提出情報を取得
    const { data: submission, error: fetchError } = await supabase
      .from("submissions")
      .select("id, project_slug, name, email")
      .eq("id", body.submission_id)
      .single();

    if (fetchError || !submission) {
      return new NextResponse(
        JSON.stringify({ error: "提出が見つかりません" }),
        { status: 404 }
      );
    }

    // 認証チェック: Clerk認証 または 提出者本人
    const { userId } = await auth();
    let deletedBy = "";
    let isAuthorized = false;

    if (userId) {
      // Clerk認証がある場合: プロジェクト所有者かチェック
      const { data: project } = await supabase
        .from("projects")
        .select("user_id")
        .eq("slug", submission.project_slug)
        .single();

      if (project && project.user_id === userId) {
        isAuthorized = true;
        deletedBy = userId;
      }
    }

    // 提出者本人の認証（Clerk認証がない場合、または所有者でない場合）
    if (!isAuthorized && body.submitter_name && body.submitter_email) {
      if (
        submission.name === body.submitter_name &&
        submission.email === body.submitter_email
      ) {
        isAuthorized = true;
        deletedBy = `submitter:${body.submitter_email}`;
      }
    }

    if (!isAuthorized) {
      return new NextResponse(
        JSON.stringify({ error: "このファイルを削除する権限がありません" }),
        { status: 403 }
      );
    }

    // 既存のfile_reviewレコードを取得
    const { data: existingReview } = await supabase
      .from("file_reviews")
      .select("review_status, is_deleted")
      .eq("submission_id", body.submission_id)
      .eq("file_index", body.file_index)
      .single();

    // 承認済みファイルは削除不可
    if (existingReview?.review_status === "approved") {
      return new NextResponse(
        JSON.stringify({
          error: "承認済みのファイルは削除できません",
        }),
        { status: 403 }
      );
    }

    // 既に削除済みの場合
    if (existingReview?.is_deleted) {
      return new NextResponse(
        JSON.stringify({ error: "このファイルは既に削除されています" }),
        { status: 400 }
      );
    }

    // 論理削除を実行
    if (existingReview) {
      // 既存のレコードを更新
      const { error: updateError } = await supabase
        .from("file_reviews")
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: deletedBy,
        })
        .eq("submission_id", body.submission_id)
        .eq("file_index", body.file_index);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        return new NextResponse(
          JSON.stringify({ error: "ファイルの削除に失敗しました" }),
          { status: 500 }
        );
      }
    } else {
      // レコードがない場合は新規作成（削除済み状態で）
      // submissionsからファイル情報を取得
      const { data: submissionFiles } = await supabase
        .from("submissions")
        .select("files")
        .eq("id", body.submission_id)
        .single();

      const files = submissionFiles?.files as Array<{ name: string; url: string }> | undefined;
      const file = files?.[body.file_index];

      if (!file) {
        return new NextResponse(
          JSON.stringify({ error: "指定されたファイルが見つかりません" }),
          { status: 404 }
        );
      }

      const { error: insertError } = await supabase
        .from("file_reviews")
        .insert({
          submission_id: body.submission_id,
          file_index: body.file_index,
          file_name: file.name,
          file_url: file.url,
          review_status: "pending",
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: deletedBy,
        });

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        return new NextResponse(
          JSON.stringify({ error: "ファイルの削除に失敗しました" }),
          { status: 500 }
        );
      }
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "ファイルを削除しました",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("File delete API error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "サーバー内部エラーが発生しました",
      }),
      { status: 500 }
    );
  }
}
