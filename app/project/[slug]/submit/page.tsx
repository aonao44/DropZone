import { ClientAdditionalSubmissionForm } from "@/components/client-additional-submission-form";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

// プロジェクト情報を取得する関数
async function getProjectInfo(slug: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // まず最初の提出物を確認して、プロジェクトが存在するか確認
    const { data, error } = await supabase
      .from("submissions")
      .select("id, name, email, project_slug")
      .eq("project_slug", slug)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // データが見つからない場合（新規プロジェクト）の場合はエラーではなく新規扱い
      if (error.code === "PGRST116") {
        return {
          exists: false,
          projectSlug: slug,
          name: "",
          email: "",
        };
      }

      console.error("プロジェクト情報の取得エラー:", error);
      return null;
    }

    return {
      exists: true,
      projectSlug: data.project_slug || slug,
      name: data.name,
      email: data.email,
    };
  } catch (error) {
    console.error("Supabaseアクセスエラー:", error);
    return null;
  }
}

export default async function SubmissionPage({ params }: { params: { slug: string } }) {
  // URLからプロジェクトのslugを取得
  const { slug } = params;

  // プロジェクト情報を確認
  const projectInfo = await getProjectInfo(slug);

  // プロジェクト情報の取得に失敗した場合は404
  if (projectInfo === null) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <ClientAdditionalSubmissionForm
        projectSlug={projectInfo.projectSlug}
        originalSlug={slug}
        originalName={projectInfo.name}
        originalEmail={projectInfo.email}
        showHistoryButton={true}
      />
    </div>
  );
}
