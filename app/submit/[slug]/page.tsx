import { ClientSubmissionForm } from "@/components/client-submission-form";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

async function getProjectInfo(slug: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("slug, title, name, email")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("プロジェクト情報の取得エラー:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Supabaseアクセスエラー:", error);
    return null;
  }
}

export default async function SubmitWithSlugPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const projectInfo = await getProjectInfo(slug);

  if (!projectInfo) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <ClientSubmissionForm projectSlug={slug} showHistoryButton={true} />
    </div>
  );
}
