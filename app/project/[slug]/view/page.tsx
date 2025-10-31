import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "@/components/ProjectDetailClient";

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
};

export default async function ProjectViewPage({
  params,
}: {
  params: { slug: string };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // プロジェクト情報を取得
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, slug, title, client_name, client_email, created_at")
    .eq("slug", params.slug)
    .single();

  if (projectError || !project) {
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

  return (
    <ProjectDetailClient
      project={project}
      submissions={submissions || []}
    />
  );
}
