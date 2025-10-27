import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateRandomSlug } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const body = await request.json();

    if (!body.title || !body.name || !body.email) {
      return new NextResponse(
        JSON.stringify({
          error: "必須項目が不足しています: プロジェクト名、依頼者名、メールアドレス",
        }),
        { status: 400 }
      );
    }

    const projectSlug = generateRandomSlug();

    const { data, error } = await supabase
      .from("projects")
      .insert({
        slug: projectSlug,
        title: body.title,
        client_name: body.name,
        client_email: body.email,
      })
      .select("id, slug")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return new NextResponse(
        JSON.stringify({
          error: "プロジェクト情報の保存に失敗しました",
        }),
        { status: 500 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        id: data.id,
        slug: data.slug,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Projects API error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "サーバー内部エラーが発生しました",
      }),
      { status: 500 }
    );
  }
}
