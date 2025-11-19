"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Copy, Eye, Inbox, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DarkLayout } from "@/components/dark-layout";

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

interface DashboardClientProps {
  projects: Project[];
  hasPremiumAccess: boolean;
}

export function DashboardClient({ projects, hasPremiumAccess }: DashboardClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // プラン別の制限
  const MAX_PROJECTS = hasPremiumAccess ? 20 : 3;
  const MAX_FILES_PER_PROJECT = hasPremiumAccess ? 50 : 10;

  const handleCopyFormUrl = (slug: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/project/${slug}/submit`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URLをコピーしました",
      description: "提出フォームのURLがクリップボードにコピーされました",
    });
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!confirm(`プロジェクト「${projectTitle}」を削除してもよろしいですか?\nこの操作は取り消せません。`)) {
      return;
    }

    setDeletingProjectId(projectId);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "プロジェクトを削除しました",
          description: "プロジェクトが正常に削除されました",
        });
        router.refresh();
      } else {
        const data = await response.json();
        toast({
          title: "削除に失敗しました",
          description: data.error || "プロジェクトの削除に失敗しました",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "エラーが発生しました",
        description: "プロジェクトの削除中にエラーが発生しました",
        variant: "destructive",
      });
    } finally {
      setDeletingProjectId(null);
    }
  };

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
    <DarkLayout>
      {/* ヘッダー - LPと同じデザイン */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="w-full flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
              <Image
                src="/dropzone-logo.png"
                alt="DropZone"
                width={180}
                height={50}
                className="h-10 w-auto"
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-base text-muted-foreground transition-colors hover:text-foreground">
                ダッシュボード
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* 🚨 一時的に変更: お試し期間用のメッセージを表示 */}
            <Button variant="outline" className="text-base cursor-default hover:bg-transparent">
              🎉 お試し期間実施中！
            </Button>
            <Button
              onClick={() => router.push("/dashboard/new")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-base"
            >
              <Plus className="mr-2 h-4 w-4" />
              新規プロジェクト
            </Button>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9"
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extralight mb-3 sm:mb-4 tracking-tight text-slate-50">プロジェクト一覧</h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed font-light">
              素材提出の管理と確認ができます
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl sm:rounded-3xl p-8 sm:p-10 lg:p-12 text-center backdrop-blur-sm">
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto bg-slate-700/30 rounded-full flex items-center justify-center mb-6">
                <Inbox className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-slate-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-light mb-3 text-slate-100">
                まだプロジェクトがありません
              </h3>
              <p className="text-base sm:text-lg lg:text-xl text-slate-400 mb-6 leading-relaxed font-light">
                「新規プロジェクト」ボタンをクリックして、最初のプロジェクトを作成しましょう
              </p>
              <Button
                onClick={() => router.push("/dashboard/new")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium px-6 py-3 sm:px-8 sm:py-4 rounded-lg transition-all duration-200 text-base sm:text-lg hover:scale-105"
              >
                <Plus className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                新規プロジェクト
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 lg:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm transition-all duration-200 hover:bg-slate-800/60 hover:border-slate-600/50"
                >
                  <CardHeader className="pb-2 space-y-1 p-3 sm:p-4">
                    <CardTitle className="text-base sm:text-lg font-light line-clamp-2 text-slate-50">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-400">
                      作成日: {formatDate(project.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center">
                        <div
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-1.5 ${
                            project.submission_count > 0 ? "bg-green-400" : "bg-yellow-400"
                          }`}
                        ></div>
                        <span className="text-xs sm:text-sm font-light text-slate-200">
                          {project.submission_count > 0
                            ? `${project.submission_count}回の提出 ${project.file_count}ファイル`
                            : "未提出"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-1.5 pt-0 p-3 sm:p-4">
                    <Button
                      onClick={() => handleCopyFormUrl(project.slug)}
                      variant="outline"
                      className="w-full border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600/50 hover:text-slate-50 font-light px-3 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                    >
                      <Copy className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">フォーム</span>URLコピー
                    </Button>
                    <Button
                      asChild
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium px-3 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm hover:scale-105"
                    >
                      <Link href={`/project/${project.slug}/view`}>
                        <Eye className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                        提出内容<span className="hidden sm:inline">を</span>確認
                      </Link>
                    </Button>
                    <Button
                      onClick={() => handleDeleteProject(project.id, project.title)}
                      variant="outline"
                      disabled={deletingProjectId === project.id}
                      className="w-full border-red-600/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 font-light px-3 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                    >
                      <Trash2 className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                      {deletingProjectId === project.id ? "削除中..." : "削除"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </DarkLayout>
  );
}
