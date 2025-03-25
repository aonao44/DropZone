"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Eye, Inbox, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// サンプルデータ（実際の実装では API から取得）
const sampleProjects = [
  {
    id: "1",
    slug: "brand-identity-redesign",
    name: "ブランドアイデンティティ リデザイン",
    createdAt: "2025-03-20T09:00:00Z",
    hasSubmission: true,
    formUrl: "https://dropzone.app/submit/brand-identity-redesign",
  },
  {
    id: "2",
    slug: "website-assets",
    name: "ウェブサイト アセット",
    createdAt: "2025-03-18T14:30:00Z",
    hasSubmission: false,
    formUrl: "https://dropzone.app/submit/website-assets",
  },
  {
    id: "3",
    slug: "social-media-campaign",
    name: "ソーシャルメディア キャンペーン",
    createdAt: "2025-03-15T11:15:00Z",
    hasSubmission: true,
    formUrl: "https://dropzone.app/submit/social-media-campaign",
  },
];

export default function DashboardPage() {
  const [projects, setProjects] = useState(sampleProjects);
  const { toast } = useToast();
  const router = useRouter();

  const handleCopyFormUrl = (url: string) => {
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
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <header className="sticky top-0 z-10 border-b border-border/40 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">DropZone</h1>
          </div>
          <Button onClick={() => router.push("/new")} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            新規プロジェクト
          </Button>
        </div>
      </header>
      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">プロジェクト一覧</h2>
            <p className="text-muted-foreground">素材提出の管理と確認ができます</p>
          </div>

          {projects.length === 0 ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/30">
                <Inbox className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">まだプロジェクトがありません</h3>
              <p className="mt-2 text-muted-foreground">
                「新規プロジェクト」ボタンをクリックして、最初のプロジェクトを作成しましょう
              </p>
              <Button onClick={() => router.push("/new")} className="mt-6 bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                新規プロジェクト
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden border-border/50 bg-gray-800/50 transition-all hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-1 text-white">{project.name}</CardTitle>
                    <CardDescription>作成日: {formatDate(project.createdAt)}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center">
                      <div
                        className={`mr-2 h-2.5 w-2.5 rounded-full ${
                          project.hasSubmission ? "bg-green-500" : "bg-amber-500"
                        }`}
                      ></div>
                      <span className="text-sm text-muted-foreground">
                        {project.hasSubmission ? "提出あり" : "未提出"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200"
                      onClick={() => handleCopyFormUrl(project.formUrl)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      フォームURLをコピー
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-purple-600/30 text-purple-300 hover:bg-purple-600/40"
                      asChild
                    >
                      <Link href={`/project/${project.slug}/view`}>
                        <Eye className="mr-2 h-4 w-4" />
                        提出内容を確認
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
