import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

// スロットファイルのレビュー（検品）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Clerk認証チェック
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { fileId } = await params;

    const body = await request.json();
    const { review_status, review_comment } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: "ファイルIDが必要です" },
        { status: 400 }
      );
    }

    if (!review_status || !["approved", "rejected", "pending"].includes(review_status)) {
      return NextResponse.json(
        { error: "有効なレビューステータスが必要です" },
        { status: 400 }
      );
    }

    // ファイルの存在確認
    const { data: slotFile, error: fetchError } = await supabase
      .from("slot_files")
      .select("id, is_deleted")
      .eq("id", fileId)
      .single();

    if (fetchError || !slotFile) {
      return NextResponse.json(
        { error: "ファイルが見つかりません" },
        { status: 404 }
      );
    }

    if (slotFile.is_deleted) {
      return NextResponse.json(
        { error: "削除済みのファイルはレビューできません" },
        { status: 400 }
      );
    }

    // レビュー情報を更新
    const { error: updateError } = await supabase
      .from("slot_files")
      .update({
        review_status,
        review_comment: review_status === "rejected" ? review_comment : null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId);

    if (updateError) {
      console.error("Error updating slot file review:", updateError);
      return NextResponse.json(
        { error: "レビューの保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Slot file review error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
