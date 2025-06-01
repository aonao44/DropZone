import React from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

// 簡易テーマクラス（実際のテーマ変数が無い環境向け）
const themeClasses = {
  section: "border-gray-600/70 bg-gray-700/60",
  text: "text-gray-200",
  mutedText: "text-gray-300",
};

type ClientSubmissionFormProps = {
  projectSlug: string;
  originalSlug: string;
  originalName: string;
  originalEmail: string;
  showHistoryButton?: boolean;
  projectInfo?: {
    title: string;
    requesterName: string;
    requesterEmail: string;
    createdAt: string;
  };
};

function ClientSubmissionForm({
  projectSlug,
  originalSlug,
  originalName,
  originalEmail,
  showHistoryButton = false,
  projectInfo,
}: ClientSubmissionFormProps) {
  return (
    <form>
      {/* form fields here */}

      {showHistoryButton && (
        <button type="button" className="btn-history">
          履歴を見る
        </button>
      )}

      {/* === プロジェクト情報カード === */}
      {projectInfo && (
        <div className={`space-y-2 rounded-lg ${themeClasses.section} p-4 border border-dashed`}>
          <h3 className={`text-sm font-medium ${themeClasses.text}`}>プロジェクト情報</h3>
          <p className={`text-sm ${themeClasses.mutedText}`}>プロジェクト名: {projectInfo.title}</p>
          <p className={`text-sm ${themeClasses.mutedText}`}>依頼者: {projectInfo.requesterName}</p>
          <p className={`text-sm ${themeClasses.mutedText}`}>メール: {projectInfo.requesterEmail}</p>
          <p className={`text-sm ${themeClasses.mutedText}`}>
            発行日: {new Date(projectInfo.createdAt).toLocaleDateString("ja-JP")}
          </p>
        </div>
      )}
    </form>
  );
}

// Next.jsページコンポーネント（default export必須）
export default async function SubmitPage({ params }: { params: Promise<{ slug: string }> }) {
  const cookieStore = cookies();
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
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">提出フォーム - {project.title}</h1>
      
      <ClientSubmissionForm
        projectSlug={slug}
        originalSlug={slug}
        originalName={project.requester_name || ""}
        originalEmail={project.requester_email || ""}
        showHistoryButton={true}
        projectInfo={{
          title: project.title,
          requesterName: project.requester_name || "",
          requesterEmail: project.requester_email || "",
          createdAt: project.created_at,
        }}
      />
    </div>
  );
}
