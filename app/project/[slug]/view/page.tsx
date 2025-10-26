import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DownloadButton } from "@/components/DownloadButton";
import { DownloadAllButton } from "@/components/DownloadAllButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropZoneLogo } from "@/components/dropzone-logo";
import { ArrowLeft, FileText, Calendar, User, Mail, Download } from "lucide-react";

interface SubmissionFile {
  name: string;
  url: string;
}

export default async function ProjectViewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // プロジェクト情報を取得
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  // 提出データを取得
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("project_slug", slug ?? "")
    .order("submitted_at", { ascending: false });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <DropZoneLogo isDark={false} />
            <Button
              asChild
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
            >
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                ダッシュボードへ戻る
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8 sm:py-12">
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* プロジェクト情報 */}
          {project && (
            <Card className="mb-8 bg-white border border-gray-300 rounded-2xl shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-base text-gray-700">
                  プロジェクト情報
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-base">依頼者: {project.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <span className="text-base">{project.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span className="text-base">作成日: {formatDate(project.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* タイトルとアクション */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">提出履歴</h1>
            {submissions && submissions.length > 0 && (
              <DownloadAllButton
                projectSlug={slug}
                className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
              />
            )}
          </div>

          {/* 提出履歴 */}
          {submissions && submissions.length > 0 ? (
            <div className="space-y-6">
              {submissions.map((sub, index) => (
                <Card
                  key={sub.id}
                  className="bg-white border border-gray-300 rounded-2xl shadow-md"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">
                          {index === 0 ? "最新の提出" : `提出 #${submissions.length - index}`}
                        </CardTitle>
                        <CardDescription className="text-base text-gray-700 mt-1">
                          提出者: {sub.name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {formatDate(sub.submitted_at)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(sub.files) && sub.files.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          提出ファイル ({sub.files.length}件)
                        </p>
                        {sub.files.map((file: SubmissionFile, fileIndex: number) => (
                          <div
                            key={`${file.url}-${fileIndex}`}
                            className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
                              <span className="truncate text-base text-gray-900 font-medium">
                                {file.name}
                              </span>
                            </div>
                            <DownloadButton
                              url={file.url}
                              fileName={file.name}
                              className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-600 hover:shadow-md transition-all duration-200 flex-shrink-0 ml-4"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-base text-gray-600 text-center py-4">
                        ファイルがありません
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                まだ提出がありません
              </h3>
              <p className="text-base text-gray-700 mb-6 leading-relaxed">
                クライアントがファイルを提出すると、ここに表示されます
              </p>
              <Button
                asChild
                className="bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
              >
                <Link href={`/project/${slug}/submit`}>
                  提出フォームへ
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
