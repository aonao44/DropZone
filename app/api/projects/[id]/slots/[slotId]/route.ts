import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

// スロットの詳細を取得（全バージョン履歴付き）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slotId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { slotId } = await params;

    const { data: slot, error } = await supabase
      .from("project_slots")
      .select(`
        *,
        slot_files (
          id,
          file_name,
          file_url,
          file_size,
          version,
          is_latest,
          review_status,
          review_comment,
          reviewed_at,
          reviewed_by,
          is_deleted,
          deleted_at,
          deleted_by,
          submitted_by_name,
          submitted_by_email,
          created_at
        )
      `)
      .eq("id", slotId)
      .single();

    if (error || !slot) {
      return NextResponse.json(
        { error: "スロットが見つかりません" },
        { status: 404 }
      );
    }

    // 削除済みを除外し、バージョン降順でソート
    const files = (slot.slot_files || [])
      .filter((f: any) => !f.is_deleted)
      .sort((a: any, b: any) => b.version - a.version);

    return NextResponse.json({
      slot: {
        ...slot,
        files,
        latest_file: files.find((f: any) => f.is_latest) || files[0] || null,
      },
    });
  } catch (error) {
    console.error("Get slot error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// スロットを更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slotId: string }> }
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
    const { id: projectId, slotId } = await params;
    const body = await request.json();

    // プロジェクトの所有者チェック
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("user_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project || project.user_id !== userId) {
      return NextResponse.json(
        { error: "このスロットを編集する権限がありません" },
        { status: 403 }
      );
    }

    // 更新可能なフィールドのみ抽出
    const updateData: Record<string, any> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.is_required !== undefined) updateData.is_required = body.is_required;
    if (body.accept_type !== undefined) updateData.accept_type = body.accept_type;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedSlot, error: updateError } = await supabase
      .from("project_slots")
      .update(updateData)
      .eq("id", slotId)
      .eq("project_id", projectId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating slot:", updateError);
      return NextResponse.json(
        { error: "スロットの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ slot: updatedSlot });
  } catch (error) {
    console.error("Update slot error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// スロットを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slotId: string }> }
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
    const { id: projectId, slotId } = await params;

    // プロジェクトの所有者チェック
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("user_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project || project.user_id !== userId) {
      return NextResponse.json(
        { error: "このスロットを削除する権限がありません" },
        { status: 403 }
      );
    }

    // スロットを削除（関連するslot_filesはCASCADEで削除される）
    const { error: deleteError } = await supabase
      .from("project_slots")
      .delete()
      .eq("id", slotId)
      .eq("project_id", projectId);

    if (deleteError) {
      console.error("Error deleting slot:", deleteError);
      return NextResponse.json(
        { error: "スロットの削除に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete slot error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
