"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Calendar, Clock, FileIcon, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DropZoneLogo } from "@/components/dropzone-logo";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DownloadButton } from "@/components/DownloadButton";

type Submission = {
  id: string;
  name: string;
  email: string;
  files: any[];
  figma_links: string[];
  submitted_at: string;
  created_at: string;
};

type Project = {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  client_email: string;
  created_at: string;
};

interface ProjectDetailClientProps {
  project: Project;
  submissions: Submission[];
}

export function ProjectDetailClient({ project, submissions }: ProjectDetailClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(
    submissions.length > 0 ? submissions[0].id : null
  );

  const handleCopyFormUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/project/${project.slug}/submit`;
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <DropZoneLogo isDark={false} />
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              ダッシュボードに戻る
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8 sm:py-12">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* プロジェクト情報カード */}
          <Card className="mb-8 border-2 border-gray-200 rounded-2xl shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    依頼者: {project.client_name} ({project.client_email})
                  </CardDescription>
                </div>
                <Button
                  onClick={handleCopyFormUrl}
                  variant="outline"
                  className="border-2 border-blue-500 text-blue-600 font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-blue-50 hover:shadow-md transition-all duration-200"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  フォームURLをコピー
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">作成日</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(project.created_at)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">提出数</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {submissions.length}件
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">総ファイル数</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {submissions.reduce(
                      (total, sub) => total + (Array.isArray(sub.files) ? sub.files.length : 0),
                      0
                    )}
                    ファイル
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 提出一覧 */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">提出一覧</h2>

            {submissions.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300 rounded-2xl">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 text-lg">
                    まだ提出がありません
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card
                    key={submission.id}
                    className="border-2 border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedSubmission(
                          expandedSubmission === submission.id ? null : submission.id
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-semibold text-gray-900">
                            {submission.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {submission.email}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {formatDate(submission.created_at)}
                            </div>
                            <Badge className="mt-1 bg-blue-500">
                              {Array.isArray(submission.files) ? submission.files.length : 0}
                              ファイル
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {expandedSubmission === submission.id && (
                      <CardContent>
                        <Separator className="mb-4" />

                        {/* ファイル一覧 */}
                        {Array.isArray(submission.files) && submission.files.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <FileIcon className="h-5 w-5" />
                              アップロードファイル
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {submission.files.map((file: any, index: number) => (
                                <div
                                  key={index}
                                  className="border border-gray-300 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all duration-200"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 truncate">
                                        {file.name}
                                      </p>
                                      {file.size && (
                                        <p className="text-sm text-gray-600">
                                          {formatFileSize(file.size)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {file.url && (
                                    <DownloadButton
                                      url={file.url}
                                      fileName={file.name}
                                      variant="default"
                                      size="sm"
                                      className="w-full mt-2 bg-blue-500 text-white hover:bg-blue-600"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Figmaリンク */}
                        {Array.isArray(submission.figma_links) &&
                          submission.figma_links.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <LinkIcon className="h-5 w-5" />
                                Figmaリンク
                              </h4>
                              <div className="space-y-2">
                                {submission.figma_links.map((link: string, index: number) => (
                                  <div
                                    key={index}
                                    className="border border-gray-300 rounded-xl p-3 flex items-center justify-between"
                                  >
                                    <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 hover:underline truncate flex-1 min-w-0"
                                    >
                                      {link}
                                    </a>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        navigator.clipboard.writeText(link);
                                        toast({
                                          title: "リンクをコピーしました",
                                        });
                                      }}
                                      className="ml-2"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
