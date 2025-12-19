import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ProjectDetailClient } from "@/components/ProjectDetailClient";
import { checkPremiumAccess } from "@/lib/billing";
import { auth } from "@clerk/nextjs/server";

import type { ReviewStatus, ProjectSlot, SlotFile } from "@/lib/types";

type Submission = {
  id: string;
  name: string;
  email: string;
  files: any[];
  figma_links: string[];
  submitted_at: string;
  created_at: string;
  // 検品ワークフロー
  review_status?: ReviewStatus;
  review_comment?: string;
  reviewed_at?: string;
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

  // そのプロジェクトの提出一覧を取得（検品ステータス含む）
  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select("id, name, email, files, figma_links, submitted_at, created_at, review_status, review_comment, reviewed_at")
    .eq("project_slug", project.slug)
    .order("created_at", { ascending: false });

  if (submissionsError) {
    console.error("Error fetching submissions:", submissionsError);
  }

  // file_reviewsからis_deleted情報を取得
  const submissionIds = (submissions || []).map((s) => s.id);
  let fileReviews: { submission_id: string; file_index: number; is_deleted: boolean }[] = [];

  if (submissionIds.length > 0) {
    const { data: reviews, error: reviewsError } = await supabase
      .from("file_reviews")
      .select("submission_id, file_index, is_deleted")
      .in("submission_id", submissionIds);

    if (reviewsError) {
      console.error("Error fetching file reviews:", reviewsError);
    }
    fileReviews = reviews || [];
  }

  // プロジェクトのスロット情報を取得
  const { data: slotsData, error: slotsError } = await supabase
    .from("project_slots")
    .select(`
      *,
      slot_files (
        id,
        file_name,
        file_url,
        file_size,
        version,
        is_latest,
        review_status,
        review_comment,
        reviewed_at,
        reviewed_by,
        is_deleted,
        submitted_by_name,
        submitted_by_email,
        created_at
      )
    `)
    .eq("project_id", project.id)
    .order("sort_order", { ascending: true });

  if (slotsError) {
    console.error("Error fetching slots:", slotsError);
  }

  // スロットデータを整形（削除済みファイルを除外）
  const slots: ProjectSlot[] = (slotsData || []).map((slot) => {
    const files = (slot.slot_files || [])
      .filter((f: SlotFile) => !f.is_deleted)
      .sort((a: SlotFile, b: SlotFile) => b.version - a.version);
    const latestFile = files.find((f: SlotFile) => f.is_latest) || files[0] || null;
    return {
      ...slot,
      files,
      latest_file: latestFile,
    };
  });

  // 削除済みファイルを除外した提出データを作成
  const submissionsWithFilteredFiles = (submissions || []).map((submission) => {
    const filteredFiles = (submission.files || []).filter((_file: unknown, index: number) => {
      const review = fileReviews.find(
        (r) => r.submission_id === submission.id && r.file_index === index
      );
      // 削除済みでないファイルのみ残す
      return !review?.is_deleted;
    });
    return {
      ...submission,
      files: filteredFiles,
      // 元のファイルインデックスを保持するためのマッピングも作成
      originalFileIndices: (submission.files || [])
        .map((_file: unknown, index: number) => {
          const review = fileReviews.find(
            (r) => r.submission_id === submission.id && r.file_index === index
          );
          return !review?.is_deleted ? index : null;
        })
        .filter((index: number | null): index is number => index !== null),
    };
  });

  // プレミアムプランのチェック
  const hasPremium = await checkPremiumAccess();

  return (
    <ProjectDetailClient
      project={project}
      submissions={submissionsWithFilteredFiles}
      hasPremium={hasPremium}
      slots={slots}
    />
  );
}
