import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SubmissionFile } from "@/lib/types";
import Link from "next/link";
import { DownloadAllButton } from "@/components/DownloadAllButton";
import { DownloadButton } from "@/components/DownloadButton";

// 提出データの型定義
interface Submission {
  id: string;
  name: string;
  email?: string;
  submitted_at: string;
  files: SubmissionFile[];
  project_slug?: string;
}

// 提出履歴をすべて取得する関数（プロジェクトごとに）
async function getAllSubmissions(projectSlug: string): Promise<Submission[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("submissions")
    .select("id, name, email, submitted_at, files, project_slug")
    .eq("project_slug", projectSlug)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Error fetching all submissions:", error);
    return [];
  }

  return data || [];
}

// Supabaseからデータを取得する関数
async function getSubmission(slug: string): Promise<Submission | null> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("submissions")
      .select(
        `
      id,
      name,
      email,
      submitted_at,
      files,
      project_slug
    `
      )
      .eq("slug", slug)
      .order("submitted_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching submission:", error);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data[0];
  } catch (error) {
    console.error("Error accessing Supabase:", error);
    return null;
  }
}

// 日付をフォーマットする関数
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

export default async function SubmissionViewPage({ params }: { params: { slug: string } }) {
  const submission = await getSubmission(params.slug);

  if (!submission) {
    notFound();
  }

  // ファイルが配列であることを確認（JSONから取得した場合に必要）
  const files = Array.isArray(submission.files) ? submission.files : [];

  // 同じプロジェクトに関連する提出を取得
  const projectSlug = submission.project_slug || params.slug;
  const allSubmissions = await getAllSubmissions(projectSlug);
  
  // 全ファイル数をカウント
  const totalFiles = allSubmissions.reduce((count, sub) => {
    return count + (Array.isArray(sub.files) ? sub.files.length : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-white">ダウンロード一覧</h1>
          <div className="flex gap-2">
            {totalFiles > 0 && (
              <DownloadAllButton 
                projectSlug={projectSlug} 
                variant="outline"
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
              />
            )}
            <Button
              asChild
              className="bg-gradient-to-r from-indigo-500/90 to-purple-500/90 hover:from-indigo-400 hover:to-purple-400 text-white"
            >
              <Link href={`/project/${projectSlug}/submit`}>
                <Plus className="h-4 w-4 mr-1" />
                追加提出
              </Link>
            </Button>
          </div>
        </div>

        {allSubmissions.map((submission) => (
          <Card key={submission.id} className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">{submission.name}</CardTitle>
              <p className="text-xs text-gray-400">{formatDate(submission.submitted_at)}</p>
            </CardHeader>
            <CardContent>
              {submission.email && <p className="text-sm text-gray-400 mb-3">{submission.email}</p>}
              {submission.files?.map((file, index) => (
                <div key={index} className="bg-gray-750 rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">{file.name}</p>
                    <DownloadButton 
                      url={file.ufsUrl || file.url}
                      fileName={file.name}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {allSubmissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">まだ提出がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
