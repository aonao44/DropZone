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
      .select("slug, title, name, email, created_at")
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

  const { title, name: requesterName, email: requesterEmail, created_at } = projectInfo;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-900 px-4 py-10 space-y-6">
      <div className="w-full flex justify-center">
        <ClientSubmissionForm
          projectSlug={slug}
          showHistoryButton={true}
          projectInfo={{
            title,
            requesterName,
            requesterEmail,
            createdAt: created_at,
          }}
        />
      </div>
    </div>
  );
}
