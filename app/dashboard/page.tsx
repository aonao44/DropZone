import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { DashboardClient } from "@/components/DashboardClient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type Project = {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  client_email: string;
  created_at: string;
  submission_count: number;
  file_count: number;
};

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 認証チェック
  const { userId, has } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Clerk Billingでプランをチェック
  // Plan Keys: "free" (無料プラン), "premium" (有料プラン)
  const hasPremiumAccess = has({ plan: "premium" });

  // ログインユーザーのプロジェクト一覧と提出数を取得
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
    .eq("user_id", userId) // ログインユーザーのプロジェクトのみ
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error details:", error.details);
    console.error("Error hint:", error.hint);
    return <DashboardClient projects={[]} hasPremiumAccess={hasPremiumAccess} />;
  }

  // 各プロジェクトの提出数とファイル数を取得
  const projects: Project[] = await Promise.all(
    (projectsData || []).map(async (project) => {
      // 提出回数を取得
      const { count, error: countError } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("project_slug", project.slug);

      if (countError) {
        console.error(`Error counting submissions for project ${project.slug}:`, countError);
      }

      // ファイル数を取得
      const { data: submissions, error: filesError } = await supabase
        .from("submissions")
        .select("files")
        .eq("project_slug", project.slug);

      if (filesError) {
        console.error(`Error fetching files for project ${project.slug}:`, filesError);
      }

      const totalFiles = (submissions || []).reduce((sum, submission) => {
        return sum + (Array.isArray(submission.files) ? submission.files.length : 0);
      }, 0);

      console.log(`Project ${project.slug} has ${count} submissions and ${totalFiles} files`);

      return {
        ...project,
        submission_count: count || 0,
        file_count: totalFiles,
      };
    })
  );

  return <DashboardClient projects={projects} hasPremiumAccess={hasPremiumAccess} />;
}
