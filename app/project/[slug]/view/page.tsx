import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ProjectDetailClient } from "@/components/ProjectDetailClient";
import { checkPremiumAccess } from "@/lib/billing";
import { auth } from "@clerk/nextjs/server";

type Submission = {
  id: string;
  name: string;
  email: string;
  files: any[];
  figma_links: string[];
  submitted_at: string;
  created_at: string;
};

type Project = {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  client_email: string;
  created_at: string;
  user_id: string;
};

export default async function ProjectViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Clerk認証チェック
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { slug } = await params;

  // プロジェクト情報を取得（user_idも含める）
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, slug, title, client_name, client_email, created_at, user_id")
    .eq("slug", slug)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // 所有者チェック - 自分のプロジェクトでない場合は404
  if (project.user_id !== userId) {
    notFound();
  }

  // そのプロジェクトの提出一覧を取得
  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select("id, name, email, files, figma_links, submitted_at, created_at")
    .eq("project_slug", project.slug)
    .order("created_at", { ascending: false });

  if (submissionsError) {
    console.error("Error fetching submissions:", submissionsError);
  }

  // プレミアムプランのチェック
  const hasPremium = await checkPremiumAccess();

  return (
    <ProjectDetailClient
      project={project}
      submissions={submissions || []}
      hasPremium={hasPremium}
    />
  );
}
