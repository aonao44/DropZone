"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Clock, ChevronDown, ChevronUp, Download, ZoomIn, Check, X, MessageSquare, Loader2, User, Images, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProjectSlot, SlotFile, ReviewStatus } from "@/lib/types";
import { ACCEPT_TYPE_CONFIG } from "@/lib/slot-templates";

// 提出回（Batch）の型定義
interface SubmissionBatch {
  submissionId: string;
  version: number;
  date: Date;
  files: SlotFile[];
  isLatest: boolean;
}

interface SlotFileReviewCardProps {
  slot: ProjectSlot;
  onReviewUpdate?: () => void;
}

export function SlotFileReviewCard({ slot, onReviewUpdate }: SlotFileReviewCardProps) {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<SlotFile | null>(slot.latest_file || null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isBatchReviewing, setIsBatchReviewing] = useState(false);
  const [comment, setComment] = useState("");
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);

  // マルチスロットかどうか
  const isMultiSlot = slot.accept_type === 'IMAGE_MULTI';

  const acceptConfig = ACCEPT_TYPE_CONFIG[slot.accept_type];

  // マルチスロット用: ファイルを提出回（submission_id）ごとにグループ化
  const batches = useMemo<SubmissionBatch[]>(() => {
    if (!isMultiSlot || !slot.files) return [];

    const activeFiles = slot.files.filter((f) => !f.is_deleted);
    const grouped = new Map<string, SlotFile[]>();

    activeFiles.forEach((file) => {
      const key = file.submission_id;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(file);
    });

    // 日付順にソートしてバージョン番号を割り当て
    const sortedBatches = Array.from(grouped.entries())
      .map(([submissionId, files]) => {
        const earliestDate = files.reduce((min, f) => {
          const d = new Date(f.created_at || 0);
          return d < min ? d : min;
        }, new Date());
        return { submissionId, files, date: earliestDate };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return sortedBatches.map((batch, index) => ({
      ...batch,
      version: index + 1,
      isLatest: index === sortedBatches.length - 1,
    }));
  }, [isMultiSlot, slot.files]);

  // 選択中のバッチ
  const selectedBatch = useMemo(() => {
    if (!selectedBatchId && batches.length > 0) {
      // デフォルトは最新バッチ
      return batches[batches.length - 1];
    }
    return batches.find((b) => b.submissionId === selectedBatchId) || null;
  }, [batches, selectedBatchId]);

  // propsが変わった時にselectedVersionを同期
  useEffect(() => {
    if (slot.latest_file) {
      // 選択中のバージョンを更新されたデータで置き換え
      const updatedFile = slot.files?.find((f) => f.id === selectedVersion?.id);
      if (updatedFile) {
        setSelectedVersion(updatedFile);
      } else {
        setSelectedVersion(slot.latest_file);
      }
    }
  }, [slot.files, slot.latest_file]);

  // バッチ選択時にそのバッチの最初のファイルを選択
  useEffect(() => {
    if (selectedBatch && selectedBatch.files.length > 0) {
      const currentFileInBatch = selectedBatch.files.find((f) => f.id === selectedVersion?.id);
      if (!currentFileInBatch) {
        setSelectedVersion(selectedBatch.files[0]);
      }
    }
  }, [selectedBatch]);

  // シングルスロット用
  const activeFiles = slot.files?.filter((f) => !f.is_deleted) || [];
  const historyFiles = isMultiSlot ? [] : slot.files?.filter((f) => !f.is_latest && !f.is_deleted) || [];
  const hasHistory = historyFiles.length > 0;
  const hasFiles = slot.files && slot.files.length > 0;

  // ステータス表示用のヘルパー関数
  const getStatusDisplay = (status: ReviewStatus) => {
    switch (status) {
      case "approved":
        return { icon: <Check className="h-3 w-3" />, label: "OK", className: "bg-green-500/20 text-green-400 border-green-500/30" };
      case "rejected":
        return { icon: <X className="h-3 w-3" />, label: "NG", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
      default:
        return { icon: null, label: "確認中", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
    }
  };

  // レビュー送信
  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedVersion) return;
    setIsReviewing(true);

    // 楽観的更新：即座にUIを更新
    const previousVersion = selectedVersion;
    setSelectedVersion({
      ...selectedVersion,
      review_status: status,
      review_comment: status === "rejected" ? comment : "",
    });

    try {
      const response = await fetch(`/api/submissions/slot-files/${selectedVersion.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_status: status,
          review_comment: status === "rejected" ? comment : "",
        }),
      });

      if (!response.ok) {
        // エラー時はロールバック
        setSelectedVersion(previousVersion);
        throw new Error("レビューの保存に失敗しました");
      }

      setComment("");
      onReviewUpdate?.();
    } catch (error) {
      console.error("Review error:", error);
      alert("レビューの保存に失敗しました");
    } finally {
      setIsReviewing(false);
    }
  };

  // ダウンロード（単一ファイル）
  const handleDownload = async (file: SlotFile) => {
    try {
      const response = await fetch(file.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  // バッチ全体をダウンロード
  const handleBatchDownload = async (batch: SubmissionBatch) => {
    for (const file of batch.files) {
      await handleDownload(file);
      // 連続ダウンロードの間隔を空ける
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  // バッチ全体のレビュー
  const handleBatchReview = async (status: "approved" | "rejected") => {
    if (!selectedBatch) return;
    setIsBatchReviewing(true);

    try {
      // バッチ内の全ファイルを順番にレビュー
      for (const file of selectedBatch.files) {
        if (file.review_status === "pending") {
          const response = await fetch(`/api/submissions/slot-files/${file.id}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              review_status: status,
              review_comment: status === "rejected" ? comment : "",
            }),
          });

          if (!response.ok) {
            throw new Error(`ファイル ${file.file_name} のレビューに失敗しました`);
          }
        }
      }

      setComment("");
      onReviewUpdate?.();
    } catch (error) {
      console.error("Batch review error:", error);
      alert("一括レビューの保存に失敗しました");
    } finally {
      setIsBatchReviewing(false);
    }
  };

  // バッチのレビューステータスを計算
  const getBatchReviewStatus = (batch: SubmissionBatch): ReviewStatus => {
    const statuses = batch.files.map((f) => f.review_status);
    if (statuses.every((s) => s === "approved")) return "approved";
    if (statuses.some((s) => s === "rejected")) return "rejected";
    if (statuses.some((s) => s === "pending")) return "pending";
    return "pending";
  };

  // バッチ内にpendingファイルがあるか
  const hasPendingInBatch = (batch: SubmissionBatch): boolean => {
    return batch.files.some((f) => f.review_status === "pending");
  };

  if (!hasFiles) {
    return (
      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-100">{slot.name}</span>
              {slot.is_required && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-500/20 text-amber-300 border-amber-500/30">
                  必須
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-400 border-slate-600">
                {acceptConfig.label}
              </Badge>
            </div>
          </div>
          <div className="text-center py-6 text-slate-500 text-sm">
            未提出
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardContent className="p-4">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-100">{slot.name}</span>
              {slot.is_required && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-500/20 text-amber-300 border-amber-500/30">
                  必須
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-400 border-slate-600">
                {acceptConfig.label}
              </Badge>
            </div>
            {/* バージョン切り替えボタン（シングルスロットのみ） */}
            {!isMultiSlot && hasHistory && (
              <div className="flex items-center gap-1">
                {slot.files?.filter((f) => !f.is_deleted).map((file) => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedVersion(file)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      selectedVersion?.id === file.id
                        ? "bg-blue-500 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    v{file.version}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* マルチスロット: 提出回（Batch）ごとのタブ表示 */}
          {isMultiSlot && batches.length > 0 && (
            <div className="space-y-3">
              {/* バッチ切り替えタブ */}
              <div className="flex flex-wrap items-center gap-1">
                {batches.map((batch, batchIndex) => (
                  <button
                    key={`batch-${batchIndex}-${batch.version}`}
                    onClick={() => setSelectedBatchId(batch.submissionId)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 ${
                      selectedBatch?.submissionId === batch.submissionId
                        ? "bg-blue-500 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    <span>v{batch.version}</span>
                    <span className="text-slate-400 text-[10px]">
                      ({batch.date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })})
                    </span>
                    {batch.isLatest ? (
                      <span className="text-green-400 text-[10px]">🟢最新</span>
                    ) : (
                      <span className={`text-[10px] ${getStatusDisplay(getBatchReviewStatus(batch)).className} px-1 rounded`}>
                        {getStatusDisplay(getBatchReviewStatus(batch)).label}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* 選択中バッチのアクションバー */}
              {selectedBatch && (
                <div className={`rounded-lg border p-3 ${getStatusDisplay(getBatchReviewStatus(selectedBatch)).className}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-200">
                        v{selectedBatch.version} - {selectedBatch.files.length}ファイル
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusDisplay(getBatchReviewStatus(selectedBatch)).className}`}>
                        {getStatusDisplay(getBatchReviewStatus(selectedBatch)).label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBatchDownload(selectedBatch)}
                        className="h-7 text-xs border-yellow-500/50 text-yellow-400 hover:bg-yellow-500 hover:text-black hover:border-yellow-500 hover:scale-105 transition-all"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        まとめてDL
                      </Button>
                      {hasPendingInBatch(selectedBatch) && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleBatchReview("approved")}
                            disabled={isBatchReviewing}
                            className="h-7 text-xs bg-green-600 hover:bg-green-400 hover:text-black hover:scale-105 transition-all"
                          >
                            {isBatchReviewing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                            OK
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBatchReview("rejected")}
                            disabled={isBatchReviewing}
                            className="h-7 text-xs border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white hover:border-purple-500 hover:scale-105 transition-all"
                          >
                            {isBatchReviewing ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3 mr-1" />}
                            NG
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* コメント入力（バッチ全体NG時用） */}
                  {hasPendingInBatch(selectedBatch) && (
                    <div className="mb-3">
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="一括修正コメント（NG選択時に全ファイルに適用されます）"
                        className="h-12 text-xs bg-slate-900/50 border-slate-600 resize-none"
                      />
                    </div>
                  )}

                  {/* サムネイルグリッド */}
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {selectedBatch.files.map((file, index) => (
                      <div
                        key={file.id}
                        className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selectedVersion?.id === file.id
                            ? "border-blue-500 ring-2 ring-blue-500/30"
                            : "border-transparent hover:border-slate-600"
                        }`}
                        onClick={() => setSelectedVersion(file)}
                      >
                        <div className="relative aspect-square bg-slate-800">
                          <Image
                            src={file.file_url}
                            alt={file.file_name}
                            fill
                            className="object-cover"
                            sizes="100px"
                          />
                          {/* インデックスバッジ */}
                          <div className="absolute top-0.5 left-0.5 px-1 py-0.5 text-[9px] font-medium bg-black/60 text-white rounded">
                            #{index + 1}
                          </div>
                          {/* ステータスバッジ */}
                          <div className={`absolute bottom-0.5 right-0.5 px-1 py-0.5 text-[9px] rounded ${getStatusDisplay(file.review_status).className}`}>
                            {getStatusDisplay(file.review_status).label}
                          </div>
                          {/* ホバーオーバーレイ */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 選択中のファイル詳細（クリック時） */}
                  {selectedVersion && selectedBatch.files.some((f) => f.id === selectedVersion.id) && (
                    <div className="mt-3 pt-3 border-t border-slate-600/50">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => setLightboxImage({ url: selectedVersion.file_url, name: selectedVersion.file_name })}
                          className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800 group cursor-pointer"
                        >
                          <Image
                            src={selectedVersion.file_url}
                            alt={selectedVersion.file_name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-3 h-3 text-white" />
                          </div>
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-blue-400">
                              #{selectedBatch.files.findIndex((f) => f.id === selectedVersion.id) + 1}
                            </span>
                            <p className="text-sm text-slate-200 truncate">{selectedVersion.file_name}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            {selectedVersion.file_size && (
                              <span>{(selectedVersion.file_size / 1024).toFixed(1)} KB</span>
                            )}
                            {selectedVersion.submitted_by_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {selectedVersion.submitted_by_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(selectedVersion)}
                              className="h-6 text-[10px] border-yellow-500/50 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              DL
                            </Button>
                            {selectedVersion.review_status === "pending" && (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleReview("approved")}
                                  disabled={isReviewing}
                                  className="h-6 text-[10px] bg-green-600 hover:bg-green-400 hover:text-black"
                                >
                                  {isReviewing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                                  OK
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReview("rejected")}
                                  disabled={isReviewing}
                                  className="h-6 text-[10px] border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white"
                                >
                                  {isReviewing ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3 mr-1" />}
                                  NG
                                </Button>
                              </div>
                            )}
                          </div>
                          {/* 個別コメント表示 */}
                          {selectedVersion.review_status === "rejected" && selectedVersion.review_comment && (
                            <div className="mt-2 p-2 bg-purple-500/10 rounded flex items-start gap-2 text-purple-300">
                              <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <p className="text-xs">{selectedVersion.review_comment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* シングルスロット: 従来の詳細表示 */}
          {!isMultiSlot && selectedVersion && (
            <div className={`rounded-lg border p-3 ${getStatusDisplay(selectedVersion.review_status).className}`}>
              <div className="flex items-start gap-4">
                {/* サムネイル */}
                <button
                  type="button"
                  onClick={() => setLightboxImage({ url: selectedVersion.file_url, name: selectedVersion.file_name })}
                  className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800 group cursor-pointer"
                >
                  <Image
                    src={selectedVersion.file_url}
                    alt={selectedVersion.file_name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                </button>

                {/* ファイル情報 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate font-medium">{selectedVersion.file_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${getStatusDisplay(selectedVersion.review_status).className}`}>
                      {getStatusDisplay(selectedVersion.review_status).icon}
                      {getStatusDisplay(selectedVersion.review_status).label}
                    </span>
                    <span className="text-xs text-slate-500">v{selectedVersion.version}</span>
                    {selectedVersion.file_size && (
                      <span className="text-xs text-slate-500">
                        {(selectedVersion.file_size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                  {/* 提出者情報 */}
                  {selectedVersion.submitted_by_name && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <User className="h-3 w-3" />
                      {selectedVersion.submitted_by_name}
                    </div>
                  )}
                  {/* 提出日時 */}
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(selectedVersion.created_at || "").toLocaleString("ja-JP")}
                  </p>

                  {/* アクションボタン */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(selectedVersion)}
                      className="h-7 text-xs border-yellow-500/50 text-yellow-400 hover:bg-yellow-500 hover:text-black hover:border-yellow-500 hover:scale-105 transition-all"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      DL
                    </Button>

                    {/* 検品ボタン */}
                    {selectedVersion.review_status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReview("approved")}
                          disabled={isReviewing}
                          className="h-7 text-xs bg-green-600 hover:bg-green-400 hover:text-black hover:scale-105 transition-all"
                        >
                          {isReviewing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                          OK
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview("rejected")}
                          disabled={isReviewing}
                          className="h-7 text-xs border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white hover:border-purple-500 hover:scale-105 transition-all"
                        >
                          {isReviewing ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3 mr-1" />}
                          NG
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* コメント入力（NG時） */}
              {selectedVersion.review_status === "pending" && (
                <div className="mt-3">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="修正コメント（NG選択時に送信されます）"
                    className="h-16 text-xs bg-slate-900/50 border-slate-600 resize-none"
                  />
                </div>
              )}

              {/* 修正コメント表示 */}
              {selectedVersion.review_status === "rejected" && selectedVersion.review_comment && (
                <div className="mt-3 p-2 bg-purple-500/10 rounded flex items-start gap-2 text-purple-300">
                  <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <p className="text-xs">{selectedVersion.review_comment}</p>
                </div>
              )}
            </div>
          )}

          {/* 履歴展開 */}
          {hasHistory && (
            <div className="mt-3 pt-3 border-t border-slate-600/50">
              <button
                type="button"
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors"
              >
                <Clock className="h-3 w-3" />
                過去のバージョン ({historyFiles.length})
                {isHistoryExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              <AnimatePresence>
                {isHistoryExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-1">
                      {historyFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 p-2 rounded bg-slate-800/50 text-slate-400 cursor-pointer hover:bg-slate-700/50"
                          onClick={() => setSelectedVersion(file)}
                        >
                          <div className="relative w-8 h-8 flex-shrink-0 rounded overflow-hidden bg-slate-700">
                            <Image
                              src={file.file_url}
                              alt={file.file_name}
                              fill
                              className="object-cover opacity-70"
                              sizes="32px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs truncate">{file.file_name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500">v{file.version}</span>
                              <span className={`text-[10px] px-1 py-0.5 rounded ${getStatusDisplay(file.review_status).className}`}>
                                {getStatusDisplay(file.review_status).label}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ライトボックス */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="absolute top-4 left-4 text-white text-sm font-light truncate max-w-[60%]">
              {lightboxImage.name}
            </div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative max-w-[90vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxImage.url}
                alt={lightboxImage.name}
                width={1200}
                height={800}
                className="object-contain max-w-full max-h-[85vh] rounded-lg"
                priority
                unoptimized
              />
            </motion.div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-light">
              クリックまたは ESC キーで閉じる
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
