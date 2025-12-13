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
