import React from "react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ClientSubmissionForm } from "@/components/client-submission-form";
import { DarkLayout } from "@/components/dark-layout";
import { ProjectSlot, SlotFile } from "@/lib/types";

// Next.jsページコンポーネント（default export必須）
export default async function SubmitPage({ params }: { params: Promise<{ slug: string }> }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 公開データ取得用の匿名クライアント
  const supabaseAnon = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { slug } = await params;

  // プロジェクト情報を取得
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !project) {
    notFound();
  }

  // プロジェクトのスロット情報を取得
  const { data: slotsData } = await supabase
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
        submitted_by_name,
        submitted_by_email,
        created_at
      )
    `)
    .eq("project_id", project.id)
    .order("sort_order", { ascending: true });

  // スロットデータを整形（最新ファイル情報を追加）
  const slots: ProjectSlot[] = (slotsData || []).map((slot) => {
    const files = (slot.slot_files || []).filter((f: SlotFile) => !f.is_deleted);
    const latestFile = files.find((f: SlotFile) => f.is_latest);
    return {
      ...slot,
      files,
      latest_file: latestFile || null,
    };
  });

  // 過去の提出者情報を取得（最新の提出）
  // RLSの問題を回避するため、認証済みクライアントを使用
  console.log("Looking for submissions with project_slug:", slug);

  const { data: previousSubmissions, error: submissionError } = await supabase
    .from("submissions")
    .select("name, email")
    .eq("project_slug", slug)
    .order("submitted_at", { ascending: false })
    .limit(1);

  if (submissionError) {
    console.error("Error fetching previous submissions:", submissionError);
    console.error("Error details:", JSON.stringify(submissionError, null, 2));
  }

  console.log("Previous submissions:", previousSubmissions);

  const previousSubmitter = previousSubmissions?.[0] || null;
  console.log("Previous submitter:", previousSubmitter);

  return (
    <DarkLayout>
      <div className="min-h-screen flex items-center justify-center py-4 sm:py-6 lg:py-8 px-4">
        <ClientSubmissionForm
          projectSlug={slug}
          showHistoryButton={true}
          projectInfo={{
            title: project.title,
            requesterName: project.client_name || "",
            requesterEmail: project.client_email || "",
            createdAt: project.created_at,
          }}
          previousSubmitter={previousSubmitter}
          slots={slots}
        />
      </div>
    </DarkLayout>
  );
}
