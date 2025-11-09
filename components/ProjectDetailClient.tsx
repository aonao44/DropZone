"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Copy, Calendar, Clock, FileIcon, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DownloadButton } from "@/components/DownloadButton";
import { AnimatedBackground } from "@/components/animated-background";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 text-slate-100 overflow-hidden relative">
      <AnimatedBackground />

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
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="text-base"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
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
      <main className="py-8 sm:py-12 lg:py-16 relative z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* プロジェクト情報カード */}
          <Card className="mb-8 border-glow bg-card transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl font-bold mb-2">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    依頼者: {project.client_name} ({project.client_email})
                  </CardDescription>
                </div>
                <Button
                  onClick={handleCopyFormUrl}
                  variant="outline"
                  className="border-glow font-semibold px-4 py-3 sm:px-6 sm:py-4 rounded-xl transition-all duration-200 text-sm sm:text-base hover:glow-blue-sm"
                >
                  <Copy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  フォームURLをコピー
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">作成日</p>
                  <p className="text-lg font-semibold">
                    {formatDate(project.created_at)}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">提出数</p>
                  <p className="text-lg font-semibold">
                    {submissions.length}件
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">総ファイル数</p>
                  <p className="text-lg font-semibold">
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
            <h2 className="text-2xl font-bold">提出一覧</h2>

            {submissions.length === 0 ? (
              <Card className="border-2 border-dashed border-border rounded-2xl bg-card">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    まだ提出がありません
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card
                    key={submission.id}
                    className="border-glow bg-card transition-all duration-200 hover:glow-blue-sm"
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
                          <CardTitle className="text-xl font-semibold">
                            {submission.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {submission.email}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {formatDate(submission.created_at)}
                            </div>
                            <Badge className="mt-1 bg-primary">
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
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <FileIcon className="h-5 w-5" />
                              アップロードファイル
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {submission.files.map((file: any, index: number) => (
                                <div
                                  key={index}
                                  className="border border-border rounded-xl p-4 hover:border-primary transition-all duration-200"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">
                                        {file.name}
                                      </p>
                                      {file.size && (
                                        <p className="text-sm text-muted-foreground">
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
                                      className="w-full mt-2 gradient-primary hover:glow-blue-sm"
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
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <LinkIcon className="h-5 w-5" />
                                Figmaリンク
                              </h4>
                              <div className="space-y-2">
                                {submission.figma_links.map((link: string, index: number) => (
                                  <div
                                    key={index}
                                    className="border border-border rounded-xl p-3 flex items-center justify-between"
                                  >
                                    <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:text-primary/80 hover:underline truncate flex-1 min-w-0"
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
