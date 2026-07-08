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
import { getPlanLimits } from "@/lib/plan-limits";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface DashboardClientProps {
  projects: Project[];
  hasPremiumAccess: boolean;
}

export function DashboardClient({ projects, hasPremiumAccess }: DashboardClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  // プラン別の制限（lib/plan-limits.ts に一元化）
  const { maxProjects: MAX_PROJECTS, maxFilesPerProject: MAX_FILES_PER_PROJECT } =
    getPlanLimits(hasPremiumAccess);

  const handleCopyFormUrl = async (slug: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/project/${slug}/submit`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URLをコピーしました",
        description: "提出フォームのURLがクリップボードにコピーされました",
      });
    } catch {
      toast({
        title: "コピーできませんでした",
        description: `お手数ですが手動でコピーしてください: ${url}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
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
            <Button
              onClick={() => router.push("/dashboard/new")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-base"
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
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
                <Inbox className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-slate-400" aria-hidden="true" />
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
                    {project.file_count > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                          OK {project.approved_count}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                          NG {project.rejected_count}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                          未確認 {project.pending_count}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-1.5 bg-slate-500"></div>
                        <span className="text-xs sm:text-sm font-light text-slate-400">
                          未提出
                        </span>
                      </div>
                    )}
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
                      onClick={() => setConfirmDelete({ id: project.id, title: project.title })}
                      variant="outline"
                      disabled={deletingProjectId === project.id}
                      className="w-full border-red-600/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 font-light px-3 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                    >
                      <Trash2 className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                      {deletingProjectId === project.id ? "削除中…" : "削除"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* プロジェクト削除の確認ダイアログ */}
      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
      >
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-50 font-light">
              「{confirmDelete?.title}」を削除しますか？
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              提出されたファイルの記録もすべて削除されます。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 bg-slate-700/30 text-slate-200 hover:bg-slate-600/50 hover:text-slate-100">
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) handleDeleteProject(confirmDelete.id);
                setConfirmDelete(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DarkLayout>
  );
}
