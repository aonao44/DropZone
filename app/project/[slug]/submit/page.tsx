import React from "react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ClientSubmissionForm } from "@/components/client-submission-form";

// Next.jsページコンポーネント（default export必須）
export default async function SubmitPage({ params }: { params: Promise<{ slug: string }> }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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

  return (
    <ClientSubmissionForm
      projectSlug={slug}
      originalSlug={slug}
      originalName={project.client_name || ""}
      originalEmail={project.client_email || ""}
      showHistoryButton={true}
      projectInfo={{
        title: project.title,
        requesterName: project.client_name || "",
        requesterEmail: project.client_email || "",
        createdAt: project.created_at,
      }}
    />
  );
}
