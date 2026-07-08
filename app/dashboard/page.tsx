import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { DashboardClient } from "@/components/DashboardClient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkPremiumAccess } from "@/lib/billing";

type Project = {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  client_email: string;
  created_at: string;
  file_count: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
};

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 認証チェック
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // プラン判定は lib/billing.ts に集約（課金再有効化もそこだけで済む）
  const hasPremiumAccess = await checkPremiumAccess();

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

  // 各プロジェクトのファイル数とレビューステータス別カウントを取得
  const projects: Project[] = await Promise.all(
    (projectsData || []).map(async (project) => {
      // プロジェクトのスロットIDを取得
      const { data: slots, error: slotsError } = await supabase
        .from("project_slots")
        .select("id")
        .eq("project_id", project.id);

      if (slotsError) {
        console.error(`Error fetching slots for project ${project.slug}:`, slotsError);
      }

      const slotIds = (slots || []).map((s) => s.id);
      let totalFiles = 0;
      let approvedCount = 0;
      let rejectedCount = 0;
      let pendingCount = 0;

      // スロットがある場合のみファイル数とステータス別カウントを取得
      if (slotIds.length > 0) {
        // 総ファイル数
        const { count: fileCount, error: filesError } = await supabase
          .from("slot_files")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false)
          .in("slot_id", slotIds);

        if (filesError) {
          console.error(`Error fetching files for project ${project.slug}:`, filesError);
        }
        totalFiles = fileCount || 0;

        // OK数（approved）
        const { count: approved, error: approvedError } = await supabase
          .from("slot_files")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false)
          .eq("review_status", "approved")
          .in("slot_id", slotIds);

        if (approvedError) {
          console.error(`Error fetching approved count for project ${project.slug}:`, approvedError);
        }
        approvedCount = approved || 0;

        // NG数（rejected）
        const { count: rejected, error: rejectedError } = await supabase
          .from("slot_files")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false)
          .eq("review_status", "rejected")
          .in("slot_id", slotIds);

        if (rejectedError) {
          console.error(`Error fetching rejected count for project ${project.slug}:`, rejectedError);
        }
        rejectedCount = rejected || 0;

        // 未確認数（pending）
        const { count: pending, error: pendingError } = await supabase
          .from("slot_files")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false)
          .eq("review_status", "pending")
          .in("slot_id", slotIds);

        if (pendingError) {
          console.error(`Error fetching pending count for project ${project.slug}:`, pendingError);
        }
        pendingCount = pending || 0;
      }

      return {
        ...project,
        file_count: totalFiles,
        approved_count: approvedCount,
        rejected_count: rejectedCount,
        pending_count: pendingCount,
      };
    })
  );

  return <DashboardClient projects={projects} hasPremiumAccess={hasPremiumAccess} />;
}
