import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { SlotInput } from "@/lib/types";

// プロジェクトのスロット一覧を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { id: projectId } = await params;

    // プロジェクトの存在確認
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりません" },
        { status: 404 }
      );
    }

    // スロット一覧を取得（最新ファイル情報付き）
    const { data: slots, error: slotsError } = await supabase
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
          is_deleted,
          created_at
        )
      `)
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    if (slotsError) {
      console.error("Error fetching slots:", slotsError);
      return NextResponse.json(
        { error: "スロットの取得に失敗しました" },
        { status: 500 }
      );
    }

    // 最新ファイル情報を整形
    const slotsWithLatest = slots.map((slot) => {
      const files = (slot.slot_files || []).filter((f: any) => !f.is_deleted);
      const latestFile = files.find((f: any) => f.is_latest);
      return {
        ...slot,
        files,
        latest_file: latestFile || null,
      };
    });

    return NextResponse.json({ slots: slotsWithLatest });
  } catch (error) {
    console.error("Get slots error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// プロジェクトに新しいスロットを追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id: projectId } = await params;
    const body: SlotInput = await request.json();

    // プロジェクトの存在確認と所有者チェック
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりません" },
        { status: 404 }
      );
    }

    if (project.user_id !== userId) {
      return NextResponse.json(
        { error: "このプロジェクトを編集する権限がありません" },
        { status: 403 }
      );
    }

    // 現在の最大sort_orderを取得
    const { data: maxOrderSlot } = await supabase
      .from("project_slots")
      .select("sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const newSortOrder = (maxOrderSlot?.sort_order ?? -1) + 1;

    // スロットを作成
    const { data: newSlot, error: insertError } = await supabase
      .from("project_slots")
      .insert({
        project_id: projectId,
        name: body.name,
        description: body.description,
        is_required: body.is_required ?? false,
        accept_type: body.accept_type ?? "ANY",
        sort_order: body.sort_order ?? newSortOrder,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating slot:", insertError);
      return NextResponse.json(
        { error: "スロットの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ slot: newSlot }, { status: 201 });
  } catch (error) {
    console.error("Create slot error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
