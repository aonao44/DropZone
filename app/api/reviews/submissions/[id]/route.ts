import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { ReviewStatus } from "@/lib/types";

interface ReviewRequestBody {
  review_status: ReviewStatus;
  review_comment?: string;
}

// PATCH: 提出全体のレビューステータスを更新
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    if (!id) {
      return new NextResponse(
        JSON.stringify({
          error: "提出IDが指定されていません",
        }),
        { status: 400 }
      );
    }

    const body: ReviewRequestBody = await request.json();

    // バリデーション
    if (!body.review_status || !["pending", "approved", "rejected"].includes(body.review_status)) {
      return new NextResponse(
        JSON.stringify({
          error: "有効なレビューステータスを指定してください: pending, approved, rejected",
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

    // 提出が存在するか確認し、関連プロジェクトの所有者チェック
    const { data: submission, error: fetchError } = await supabase
      .from("submissions")
      .select("id, project_slug")
      .eq("id", id)
      .single();

    if (fetchError || !submission) {
      return new NextResponse(
        JSON.stringify({
          error: "提出が見つかりません",
        }),
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
        JSON.stringify({
          error: "プロジェクトが見つかりません",
        }),
        { status: 404 }
      );
    }

    if (project.user_id !== userId) {
      return new NextResponse(
        JSON.stringify({
          error: "このプロジェクトのレビュー権限がありません",
        }),
        { status: 403 }
      );
    }

    // レビューステータス更新
    const updateData: Record<string, string | null> = {
      review_status: body.review_status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
    };

    // 承認時はコメントをクリア、差戻し時はコメントを保存
    if (body.review_status === "approved") {
      updateData.review_comment = null;
    } else if (body.review_status === "rejected") {
      updateData.review_comment = body.review_comment || null;
    }

    const { data, error: updateError } = await supabase
      .from("submissions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase error:", updateError);
      return new NextResponse(
        JSON.stringify({
          error: "レビューステータスの更新に失敗しました",
        }),
        { status: 500 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: body.review_status === "approved" ? "承認しました" : "差戻ししました",
        submission: data,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Review submission API error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "サーバー内部エラーが発生しました",
      }),
      { status: 500 }
    );
  }
}
