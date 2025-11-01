"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Eye, Inbox, Plus, Home } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DropZoneLogo } from "@/components/dropzone-logo";

type Project = {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  client_email: string;
  created_at: string;
  submission_count: number;
};

interface DashboardClientProps {
  projects: Project[];
}

export function DashboardClient({ projects }: DashboardClientProps) {
  const { toast } = useToast();
  const router = useRouter();

  const handleCopyFormUrl = (slug: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/project/${slug}/submit`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URLをコピーしました",
      description: "提出フォームのURLがクリップボードにコピーされました",
    });
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
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b border-border">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
          <div className="flex items-center justify-between">
            <DropZoneLogo isDark={true} />
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="border-glow font-semibold px-3 py-2 sm:px-6 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base hover:glow-blue-sm"
              >
                <Home className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">ホーム</span>
              </Button>
              <Button
                onClick={() => router.push("/dashboard/new")}
                className="gradient-primary font-semibold px-3 py-2 sm:px-6 sm:py-3 rounded-xl glow-blue-sm hover:glow-blue transition-all duration-200 text-sm sm:text-base"
              >
                <Plus className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">新規</span>プロジェクト
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">プロジェクト一覧</h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
              素材提出の管理と確認ができます
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="bg-card border-2 border-dashed border-border rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto bg-muted rounded-full flex items-center justify-center mb-6 sm:mb-8">
                <Inbox className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-muted-foreground" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-4">
                まだプロジェクトがありません
              </h3>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                「新規プロジェクト」ボタンをクリックして、最初のプロジェクトを作成しましょう
              </p>
              <Button
                onClick={() => router.push("/dashboard/new")}
                className="gradient-primary font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-xl glow-blue-sm hover:glow-blue transition-all duration-200 text-base sm:text-lg"
              >
                <Plus className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                新規プロジェクト
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="border-glow bg-card transition-all duration-200 hover:glow-blue-sm"
                >
                  <CardHeader className="pb-3 sm:pb-4 space-y-2 sm:space-y-3 p-5 sm:p-6 lg:p-8">
                    <CardTitle className="text-xl sm:text-2xl font-semibold line-clamp-2">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      作成日: {formatDate(project.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 sm:pb-6 px-5 sm:px-6 lg:px-8">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2 sm:mr-3 ${
                            project.submission_count > 0 ? "bg-success" : "bg-warning"
                          }`}
                        ></div>
                        <span className="text-sm sm:text-base font-medium">
                          {project.submission_count > 0
                            ? `${project.submission_count}件の提出`
                            : "未提出"}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        依頼者: {project.client_name}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 sm:gap-3 pt-0 p-5 sm:p-6 lg:p-8">
                    <Button
                      onClick={() => handleCopyFormUrl(project.slug)}
                      variant="outline"
                      className="w-full border-glow font-semibold px-4 py-3 sm:px-6 sm:py-4 rounded-xl transition-all duration-200 text-sm sm:text-base hover:glow-blue-sm"
                    >
                      <Copy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">フォーム</span>URLコピー
                    </Button>
                    <Button
                      asChild
                      className="w-full gradient-primary font-semibold px-4 py-3 sm:px-6 sm:py-4 rounded-xl glow-blue-sm hover:glow-blue transition-all duration-200 text-sm sm:text-base"
                    >
                      <Link href={`/project/${project.slug}/view`}>
                        <Eye className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        提出内容<span className="hidden sm:inline">を</span>確認
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
