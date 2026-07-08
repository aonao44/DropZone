import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateRandomSlug } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { SlotInput, SlotTemplateKey } from "@/lib/types";
import { getSlotsFromTemplate, DEFAULT_MIGRATION_SLOT } from "@/lib/slot-templates";

interface CreateProjectBody {
  title: string;
  name: string;
  email: string;
  template?: SlotTemplateKey;
  customSlots?: SlotInput[];
}

export async function POST(request: Request) {
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
    const body: CreateProjectBody = await request.json();

    if (!body.title || !body.name || !body.email) {
      return new NextResponse(
        JSON.stringify({
          error: "必須項目が不足しています: プロジェクト名、依頼者名、メールアドレス",
        }),
        { status: 400 }
      );
    }

    const projectSlug = generateRandomSlug();

    // 1. プロジェクト作成
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .insert({
        slug: projectSlug,
        title: body.title,
        client_name: body.name,
        client_email: body.email,
        user_id: userId,
      })
      .select("id, slug")
      .single();

    if (projectError) {
      console.error("Supabase project error:", projectError);
      return new NextResponse(
        JSON.stringify({
          error: "プロジェクト情報の保存に失敗しました",
        }),
        { status: 500 }
      );
    }

    // 2. スロット作成
    // customSlots（画面で編集した最終形）があればそれを正とし、
    // 無い場合のみテンプレートのデフォルトを使う
    let slotsToCreate: SlotInput[] = [];

    if (body.customSlots && body.customSlots.length > 0) {
      slotsToCreate = body.customSlots.map((slot, index) => ({
        ...slot,
        sort_order: slot.sort_order ?? index,
      }));
    } else if (body.template) {
      slotsToCreate = getSlotsFromTemplate(body.template);
    }

    // テンプレートもカスタムスロットもない場合はデフォルトスロットを追加
    if (slotsToCreate.length === 0) {
      slotsToCreate = [DEFAULT_MIGRATION_SLOT];
    }

    // スロットをDBに挿入
    const slotsData = slotsToCreate.map((slot) => ({
      project_id: projectData.id,
      name: slot.name,
      description: slot.description || null,
      is_required: slot.is_required,
      accept_type: slot.accept_type,
      sort_order: slot.sort_order ?? 0,
    }));

    const { error: slotsError } = await supabase
      .from("project_slots")
      .insert(slotsData);

    if (slotsError) {
      console.error("Supabase slots error:", slotsError);
      // プロジェクトは作成済みなので、エラーをログに残しつつ続行
      // スロットは後から追加可能
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        id: projectData.id,
        slug: projectData.slug,
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
