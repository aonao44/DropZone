import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // プロジェクトの削除
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

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
