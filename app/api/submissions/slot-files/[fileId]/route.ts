import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// スロットファイルのソフトデリート
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { fileId } = await params;

    const body = await request.json();
    const { submitter_name, submitter_email } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: "ファイルIDが必要です" },
        { status: 400 }
      );
    }

    // ファイルの存在確認と現在のステータス取得
    const { data: slotFile, error: fetchError } = await supabase
      .from("slot_files")
      .select("id, review_status, is_deleted")
      .eq("id", fileId)
      .single();

    if (fetchError || !slotFile) {
      return NextResponse.json(
        { error: "ファイルが見つかりません" },
        { status: 404 }
      );
    }

    // 既に削除済みの場合
    if (slotFile.is_deleted) {
      return NextResponse.json(
        { error: "このファイルは既に削除されています" },
        { status: 400 }
      );
    }

    // 承認済みのファイルは削除不可
    if (slotFile.review_status === "approved") {
      return NextResponse.json(
        { error: "承認済みのファイルは削除できません" },
        { status: 400 }
      );
    }

    // ソフトデリート実行
    const { error: updateError } = await supabase
      .from("slot_files")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: submitter_email || submitter_name || "unknown",
        is_latest: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId);

    if (updateError) {
      console.error("Error deleting slot file:", updateError);
      return NextResponse.json(
        { error: "ファイルの削除に失敗しました" },
        { status: 500 }
      );
    }

    // 同じスロットの直前のバージョンをis_latest: trueに更新
    const { data: deletedFile } = await supabase
      .from("slot_files")
      .select("slot_id, version")
      .eq("id", fileId)
      .single();

    if (deletedFile) {
      const { data: previousFile } = await supabase
        .from("slot_files")
        .select("id")
        .eq("slot_id", deletedFile.slot_id)
        .eq("is_deleted", false)
        .lt("version", deletedFile.version)
        .order("version", { ascending: false })
        .limit(1)
        .single();

      if (previousFile) {
        await supabase
          .from("slot_files")
          .update({ is_latest: true, updated_at: new Date().toISOString() })
          .eq("id", previousFile.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Slot file delete error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
