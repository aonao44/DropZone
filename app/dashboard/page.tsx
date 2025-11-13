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

  // 各プロジェクトの提出数を取得
  const projects: Project[] = await Promise.all(
    (projectsData || []).map(async (project) => {
      const { count, error: countError } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("project_slug", project.slug);

      if (countError) {
        console.error(`Error counting submissions for project ${project.slug}:`, countError);
      }

      console.log(`Project ${project.slug} has ${count} submissions`);

      return {
        ...project,
        submission_count: count || 0,
      };
    })
  );

  return <DashboardClient projects={projects} hasPremiumAccess={hasPremiumAccess} />;
}
