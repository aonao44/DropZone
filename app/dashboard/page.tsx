"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Eye, Inbox, Plus, Home } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DropZoneLogo } from "@/components/dropzone-logo";

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
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <DropZoneLogo isDark={false} />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
              >
                <Home className="mr-2 h-4 w-4" />
                ホーム
              </Button>
              <Button
                onClick={() => router.push("/dashboard/new")}
                className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                新規プロジェクト
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8 sm:py-12">
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">プロジェクト一覧</h1>
            <p className="text-base text-gray-700 leading-relaxed">
              素材提出の管理と確認ができます
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Inbox className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                まだプロジェクトがありません
              </h3>
              <p className="text-base text-gray-700 mb-6 leading-relaxed">
                「新規プロジェクト」ボタンをクリックして、最初のプロジェクトを作成しましょう
              </p>
              <Button
                onClick={() => router.push("/dashboard/new")}
                className="bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                新規プロジェクト
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-white border border-gray-300 rounded-2xl shadow-md hover:shadow-lg hover:border-gray-400 transition-all duration-200"
                >
                  <CardHeader className="pb-3 space-y-2">
                    <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      作成日: {formatDate(project.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          project.hasSubmission ? "bg-green-600" : "bg-amber-600"
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {project.hasSubmission ? "提出あり" : "未提出"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 pt-0">
                    <Button
                      onClick={() => handleCopyFormUrl(project.formUrl)}
                      variant="outline"
                      className="w-full border-2 border-gray-300 text-gray-700 font-semibold px-4 py-3 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      フォームURLをコピー
                    </Button>
                    <Button
                      asChild
                      className="w-full bg-blue-500 text-white font-semibold px-4 py-3 rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
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
