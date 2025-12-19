"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Copy, Calendar, Clock, FileIcon, Link as LinkIcon, Download, Lock, Sparkles, Plus, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DownloadButton } from "@/components/DownloadButton";
import { DarkLayout } from "@/components/dark-layout";
import { FileReviewCard } from "@/components/FileReviewCard";
import { SlotFileReviewCard } from "@/components/SlotFileReviewCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { ReviewStatus, ProjectSlot, SlotAcceptType } from "@/lib/types";
import { ACCEPT_TYPE_OPTIONS } from "@/lib/slot-templates";

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
  // 削除済みファイルを除外した後の元インデックスマッピング
  originalFileIndices?: number[];
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
  hasPremium?: boolean;
  slots?: ProjectSlot[];
}

// レビューステータスのバッジを取得
function getSubmissionStatusBadge(status?: ReviewStatus) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          🟢 全て承認
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          🟣 差戻しあり
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          🟡 確認待ち
        </Badge>
      );
  }
}

export function ProjectDetailClient({ project, submissions: initialSubmissions, hasPremium = false, slots = [] }: ProjectDetailClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const hasSlots = slots.length > 0;

  // スロット追加ダイアログ用の状態
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotName, setNewSlotName] = useState("");
  const [newSlotDescription, setNewSlotDescription] = useState("");
  const [newSlotRequired, setNewSlotRequired] = useState(false);
  const [newSlotAcceptType, setNewSlotAcceptType] = useState<SlotAcceptType>("IMAGE_SINGLE");

  // スロット削除用の状態
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);

  // データを再取得する関数
  const refreshSubmissions = () => {
    router.refresh();
  };

  // スロット追加処理
  const handleAddSlot = async () => {
    if (!newSlotName.trim()) {
      toast({
        title: "エラー",
        description: "スロット名を入力してください",
        variant: "destructive",
      });
      return;
    }

    setIsAddingSlot(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSlotName.trim(),
          description: newSlotDescription.trim() || undefined,
          is_required: newSlotRequired,
          accept_type: newSlotAcceptType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "スロットの追加に失敗しました");
      }

      toast({
        title: "スロットを追加しました",
        description: `「${newSlotName}」を追加しました`,
      });

      // フォームをリセット
      setNewSlotName("");
      setNewSlotDescription("");
      setNewSlotRequired(false);
      setNewSlotAcceptType("IMAGE_SINGLE");
      setIsAddSlotOpen(false);

      // ページをリフレッシュ
      router.refresh();
    } catch (error) {
      console.error("Add slot error:", error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "スロットの追加に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsAddingSlot(false);
    }
  };

  // スロット削除処理
  const handleDeleteSlot = async (slotId: string, slotName: string) => {
    if (!confirm(`スロット「${slotName}」を削除してもよろしいですか？\nこのスロットに含まれるファイルも全て削除されます。`)) {
      return;
    }

    setDeletingSlotId(slotId);
    try {
      const response = await fetch(`/api/projects/${project.id}/slots/${slotId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "スロットの削除に失敗しました");
      }

      toast({
        title: "スロットを削除しました",
        description: `「${slotName}」を削除しました`,
      });

      // ページをリフレッシュ
      router.refresh();
    } catch (error) {
      console.error("Delete slot error:", error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "スロットの削除に失敗しました",
        variant: "destructive",
      });
    } finally {
      setDeletingSlotId(null);
    }
  };

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
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* プロジェクト情報カード */}
          <Card className="mb-8 border-glow bg-card transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold mb-2">
                    {project.title}
                  </CardTitle>
                  {submissions.length > 0 && (
                    <CardDescription className="text-sm">
                      提出者: {[...new Map(submissions.map(s => [s.email, s])).values()]
                        .map(s => `${s.name} (${s.email})`)
                        .join(", ")}
                    </CardDescription>
                  )}
                </div>
                <Button
                  onClick={handleCopyFormUrl}
                  variant="outline"
                  className="border-glow font-semibold px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 text-xs sm:text-sm hover:glow-blue-sm"
                >
                  <Copy className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  フォームURLをコピー
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">作成日</p>
                  <p className="text-base font-semibold">
                    {formatDate(project.created_at)}
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-2">検品ステータス</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      OK {slots.reduce((total, slot) => total + (slot.files?.filter(f => f.review_status === 'approved').length || 0), 0)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      NG {slots.reduce((total, slot) => total + (slot.files?.filter(f => f.review_status === 'rejected').length || 0), 0)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                      未確認 {slots.reduce((total, slot) => total + (slot.files?.filter(f => f.review_status === 'pending').length || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* プレミアム機能セクション */}
          <Card className="mb-8 border-glow bg-card transition-all duration-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <CardTitle className="text-lg">プレミアム機能</CardTitle>
              </div>
              <CardDescription className="text-sm">
                全ファイルを一括でダウンロードできます
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasPremium ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    プレミアムプランをご利用中です。全てのファイルをZIP形式で一括ダウンロードできます。
                  </p>
                  <Button
                    onClick={async () => {
                      try {
                        toast({
                          title: "ZIP作成中",
                          description: "ファイルをまとめています...",
                        });

                        const response = await fetch(
                          `/api/download-all?projectSlug=${project.slug}`
                        );

                        if (!response.ok) {
                          throw new Error("ダウンロードに失敗しました");
                        }

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${project.title}_all_files.zip`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);

                        toast({
                          title: "ダウンロード完了",
                          description: "全てのファイルをZIPでダウンロードしました",
                        });
                      } catch (error) {
                        console.error("Download error:", error);
                        toast({
                          title: "エラーが発生しました",
                          description: "ファイルのダウンロードに失敗しました",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    全ファイルをZIPでダウンロード
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-muted">
                    <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      {/* 🚨 一時的に無効化: Vercelデプロイ時に課金機能を無効化 */}
                      <p className="text-sm font-medium mb-1">プレミアムプランが必要です</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        ZIP一括ダウンロード機能を利用するには、プレミアムプランへのアップグレードが必要です。
                      </p>
                      {/* <Link href="/pricing">
                        <Button variant="outline" size="sm" className="border-glow hover:glow-blue-sm">
                          <Sparkles className="mr-2 h-4 w-4" />
                          プレミアムプランを見る
                        </Button>
                      </Link> */}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* スロットベースの表示 */}
          {hasSlots && (
            <div className="space-y-6 mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">提出スロット</h2>
                <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
                      <Plus className="h-4 w-4 mr-1" />
                      スロット追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-slate-100">スロットを追加</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        新しい提出スロットを追加します
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="slot-name" className="text-slate-200">
                          スロット名 <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="slot-name"
                          value={newSlotName}
                          onChange={(e) => setNewSlotName(e.target.value)}
                          placeholder="例: ロゴ、バナー画像"
                          className="bg-slate-800 border-slate-600 text-slate-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slot-description" className="text-slate-200">
                          説明（任意）
                        </Label>
                        <Input
                          id="slot-description"
                          value={newSlotDescription}
                          onChange={(e) => setNewSlotDescription(e.target.value)}
                          placeholder="例: 透過PNGまたはSVG形式"
                          className="bg-slate-800 border-slate-600 text-slate-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200">ファイル形式</Label>
                        <Select
                          value={newSlotAcceptType}
                          onValueChange={(value) => setNewSlotAcceptType(value as SlotAcceptType)}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            {ACCEPT_TYPE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="text-slate-100 focus:bg-slate-700"
                              >
                                {option.icon} {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="slot-required"
                          checked={newSlotRequired}
                          onCheckedChange={(checked) => setNewSlotRequired(checked === true)}
                          className="border-slate-600 data-[state=checked]:bg-amber-500"
                        />
                        <Label htmlFor="slot-required" className="text-slate-200 cursor-pointer">
                          必須項目にする
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddSlotOpen(false)}
                        className="border-slate-600 text-slate-200 hover:bg-slate-700"
                      >
                        キャンセル
                      </Button>
                      <Button
                        onClick={handleAddSlot}
                        disabled={isAddingSlot || !newSlotName.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {isAddingSlot ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            追加中...
                          </>
                        ) : (
                          "追加"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slots.map((slot) => (
                  <div key={slot.id} className="relative">
                    <SlotFileReviewCard
                      slot={slot}
                      onReviewUpdate={refreshSubmissions}
                    />
                    {/* 削除ボタン */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSlot(slot.id, slot.name)}
                      disabled={deletingSlotId === slot.id}
                      className="absolute top-2 right-2 h-7 w-7 p-0 bg-slate-700/80 hover:bg-red-600 text-slate-400 hover:text-white"
                      title="スロットを削除"
                    >
                      {deletingSlotId === slot.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 従来の提出一覧（スロットがない場合のみ表示） */}
          {!hasSlots && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">提出一覧</h2>

            {submissions.length === 0 ? (
              <Card className="border-2 border-dashed border-border rounded-2xl bg-card">
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground text-base">
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
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold">
                            {submission.name}
                          </CardTitle>
                          <CardDescription className="mt-1 text-sm">
                            {submission.email}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(submission.created_at)}
                            </div>
                            <div className="flex items-center gap-2">
                              {getSubmissionStatusBadge(submission.review_status)}
                              <Badge className="bg-primary text-xs">
                                {Array.isArray(submission.files) ? submission.files.length : 0}
                                ファイル
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                        <Separator className="mb-4" />

                        {/* ファイル一覧（検品カード付き） */}
                        {Array.isArray(submission.files) && submission.files.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                              <FileIcon className="h-4 w-4" />
                              アップロードファイル
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                              {submission.files.map((file: any, index: number) => {
                                // 元のファイルインデックスを取得（削除済みファイル除外後のマッピング）
                                const originalIndex = submission.originalFileIndices
                                  ? submission.originalFileIndices[index]
                                  : index;
                                return (
                                  <FileReviewCard
                                    key={originalIndex}
                                    submissionId={submission.id}
                                    fileIndex={originalIndex}
                                    file={file}
                                    onReviewUpdate={refreshSubmissions}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Figmaリンク */}
                        {Array.isArray(submission.figma_links) &&
                          submission.figma_links.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                                <LinkIcon className="h-4 w-4" />
                                Figmaリンク
                              </h4>
                              <div className="space-y-2">
                                {submission.figma_links.map((link: string, index: number) => (
                                  <div
                                    key={index}
                                    className="border border-border rounded-xl p-2.5 flex items-center justify-between"
                                  >
                                    <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:text-primary/80 hover:underline truncate flex-1 min-w-0 text-sm"
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
                                      className="ml-2 text-xs"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          )}
        </div>
      </main>
    </DarkLayout>
  );
}
