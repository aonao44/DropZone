"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, MessageSquare, ZoomIn, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { DownloadButton } from "@/components/DownloadButton";
import { useToast } from "@/hooks/use-toast";
import type { ReviewStatus } from "@/lib/types";

interface FileReviewCardProps {
  submissionId: string;
  fileIndex: number;
  file: {
    name: string;
    url: string;
    size?: number;
  };
  reviewStatus?: ReviewStatus;
  reviewComment?: string;
  onReviewUpdate?: () => void;
}

// 画像拡張子のリスト
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];

function isImageFile(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return IMAGE_EXTENSIONS.includes(ext);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function getStatusBadge(status?: ReviewStatus) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          🟢 承認
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          🟣 差戻し
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

export function FileReviewCard({
  submissionId,
  fileIndex,
  file,
  reviewStatus = "pending",
  reviewComment,
  onReviewUpdate,
}: FileReviewCardProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [currentStatus, setCurrentStatus] = useState<ReviewStatus>(reviewStatus);
  const [currentComment, setCurrentComment] = useState(reviewComment);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isImage = isImageFile(file.name);

  // ESCキーでライトボックスを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showLightbox) {
        setShowLightbox(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLightbox]);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/reviews/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          file_index: fileIndex,
          file_name: file.name,
          file_url: file.url,
          review_status: "approved",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "承認に失敗しました");
      }

      setCurrentStatus("approved");
      setCurrentComment(undefined);
      toast({
        title: "承認しました",
        description: `${file.name} を承認しました`,
      });
      onReviewUpdate?.();
    } catch (error) {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "承認に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      toast({
        title: "コメントを入力してください",
        description: "差戻しの場合は修正指示が必須です",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/reviews/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          file_index: fileIndex,
          file_name: file.name,
          file_url: file.url,
          review_status: "rejected",
          review_comment: rejectComment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "差戻しに失敗しました");
      }

      setCurrentStatus("rejected");
      setCurrentComment(rejectComment);
      setShowRejectDialog(false);
      setRejectComment("");
      toast({
        title: "差戻ししました",
        description: `${file.name} に修正指示を送信しました`,
      });
      onReviewUpdate?.();
    } catch (error) {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "差戻しに失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/reviews/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          file_index: fileIndex,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "削除に失敗しました");
      }

      toast({
        title: "削除しました",
        description: `${file.name} を削除しました`,
      });
      setShowDeleteDialog(false);
      onReviewUpdate?.();
    } catch (error) {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "削除に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ステータスに応じた背景色
  const cardBgColor =
    currentStatus === "approved"
      ? "bg-green-500/5 border-green-500/30"
      : currentStatus === "rejected"
      ? "bg-purple-500/5 border-purple-500/30"
      : "border-border";

  return (
    <>
      <div
        className={`border rounded-xl p-4 transition-all duration-200 ${cardBgColor}`}
      >
        <div className="flex gap-4">
          {/* サムネイル（クリックで拡大表示） */}
          <div className="flex-shrink-0">
            {isImage ? (
              <button
                type="button"
                onClick={() => setShowLightbox(true)}
                className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted group cursor-pointer transition-transform hover:scale-105"
              >
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                {/* ホバー時のオーバーレイ */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </button>
            ) : (
              <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            )}
          </div>

          {/* ファイル情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                {file.size && (
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                )}
              </div>
              {getStatusBadge(currentStatus)}
            </div>

            {/* NGコメント表示 */}
            {currentStatus === "rejected" && currentComment && (
              <div className="mt-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-purple-300">{currentComment}</p>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex flex-wrap gap-2 mt-3">
              <DownloadButton
                url={file.url}
                fileName={file.name}
                variant="outline"
                className="text-xs h-8 px-2"
              />

              {currentStatus !== "approved" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="text-xs text-green-400 border-green-500/30 hover:bg-green-500/10"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  承認
                </Button>
              )}

              {currentStatus !== "rejected" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isLoading}
                  className="text-xs text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
                >
                  <X className="h-3 w-3 mr-1" />
                  差戻し
                </Button>
              )}

              {/* 削除ボタン（承認済み以外で表示） */}
              {currentStatus !== "approved" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isLoading || isDeleting}
                  className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  削除
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 差戻しダイアログ */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>差戻し - 修正指示</DialogTitle>
            <DialogDescription>
              {file.name} に対する修正指示を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="例: 解像度が低いです。1920px以上の画像をお送りください。"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleReject}
              disabled={isLoading || !rejectComment.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              差戻し
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ライトボックスモーダル - 高速表示 */}
      <AnimatePresence>
        {showLightbox && isImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setShowLightbox(false)}
          >
            {/* 閉じるボタン */}
            <button
              type="button"
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* ファイル名 */}
            <div className="absolute top-4 left-4 text-white text-sm font-light truncate max-w-[60%]">
              {file.name}
            </div>

            {/* 画像 */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative max-w-[90vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={file.url}
                alt={file.name}
                width={1200}
                height={800}
                className="object-contain max-w-full max-h-[85vh] rounded-lg"
                priority
                unoptimized
              />
            </motion.div>

            {/* 操作ヒント */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-light">
              クリックまたは ESC キーで閉じる
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ファイルを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{file.name}」を削除します。この操作は元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  削除中...
                </>
              ) : (
                "削除する"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
