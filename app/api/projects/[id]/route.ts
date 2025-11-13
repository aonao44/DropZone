import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Clerk認証チェック
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
          error: "プロジェクトIDが指定されていません",
        }),
        { status: 400 }
      );
    }

    // プロジェクトの削除（所有者チェック付き）
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", userId); // 所有者のみ削除可能

    if (error) {
      console.error("Supabase error:", error);
      return new NextResponse(
        JSON.stringify({
          error: "プロジェクトの削除に失敗しました",
        }),
        { status: 500 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "プロジェクトを削除しました",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete project API error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "サーバー内部エラーが発生しました",
      }),
      { status: 500 }
    );
  }
}
