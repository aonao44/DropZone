"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, X, Loader2, MessageSquare } from "lucide-react";

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

  const isImage = isImageFile(file.name);

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
          {/* サムネイル */}
          <div className="flex-shrink-0">
            {isImage ? (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
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
    </>
  );
}
