import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { DashboardClient } from "@/components/DashboardClient";
import Header from "@/components/header";

type Project = {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  client_email: string;
  created_at: string;
  submission_count: number;
};

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // プロジェクト一覧と提出数を取得
  const { data: projectsData, error } = await supabase
    .from("projects")
    .select(`
      id,
      slug,
      title,
      client_name,
      client_email,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return (
      <>
        <Header />
        <DashboardClient projects={[]} />
      </>
    );
  }

  // 各プロジェクトの提出数を取得
  const projects: Project[] = await Promise.all(
    (projectsData || []).map(async (project) => {
      const { count } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("project_id", project.id);

      return {
        ...project,
        submission_count: count || 0,
      };
    })
  );

  return (
    <>
      <Header />
      <DashboardClient projects={projects} />
    </>
  );
}
