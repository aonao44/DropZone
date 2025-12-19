"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, ChevronDown, ChevronUp, Clock, ZoomIn, Trash2, Check, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectSlot, SlotFile, ReviewStatus } from "@/lib/types";
import { ACCEPT_TYPE_CONFIG } from "@/lib/slot-templates";
import { FileUploader } from "./file-uploader";

interface SlotUploadCardProps {
  slot: ProjectSlot;
  onFilesChange: (slotId: string, files: File[]) => void;
  selectedFiles: File[];
  onViewImage?: (url: string, name: string) => void;
  onDeleteFile?: (slotId: string, fileId: string) => void;
  disabled?: boolean;
}

export function SlotUploadCard({
  slot,
  onFilesChange,
  selectedFiles,
  onViewImage,
  onDeleteFile,
  disabled = false,
}: SlotUploadCardProps) {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const acceptConfig = ACCEPT_TYPE_CONFIG[slot.accept_type];
  const latestFile = slot.latest_file;
  const historyFiles = slot.files?.filter((f) => !f.is_latest && !f.is_deleted) || [];
  const hasHistory = historyFiles.length > 0;

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

  const handleFilesChange = (files: File[]) => {
    // IMAGE_SINGLE の場合は1ファイルのみ許可
    if (!acceptConfig.multiple && files.length > 1) {
      onFilesChange(slot.id, [files[0]]);
    } else {
      onFilesChange(slot.id, files);
    }
  };

  return (
    <Card className="bg-slate-700/30 border-slate-600/50 overflow-hidden">
      <CardContent className="p-3 sm:p-4">
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
        </div>

        {/* 最新ファイル表示 or アップロードエリア */}
        {latestFile && !latestFile.is_deleted ? (
          <div className="space-y-2">
            {/* 最新ファイルプレビュー */}
            <div className={`rounded-lg border p-2 ${getStatusDisplay(latestFile.review_status).className}`}>
              <div className="flex items-center gap-3">
                {/* サムネイル */}
                <button
                  type="button"
                  onClick={() => onViewImage?.(latestFile.file_url, latestFile.file_name)}
                  className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-slate-800 group cursor-pointer"
                >
                  <Image
                    src={latestFile.file_url}
                    alt={latestFile.file_name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </div>
                </button>

                {/* ファイル情報 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{latestFile.file_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${getStatusDisplay(latestFile.review_status).className}`}>
                      {getStatusDisplay(latestFile.review_status).icon}
                      {getStatusDisplay(latestFile.review_status).label}
                    </span>
                    <span className="text-xs text-slate-500">v{latestFile.version}</span>
                  </div>
                </div>

                {/* 削除ボタン */}
                {latestFile.review_status !== "approved" && onDeleteFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteFile(slot.id, latestFile.id)}
                    className="h-8 w-8 p-0 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-400" />
                  </Button>
                )}
              </div>

              {/* 修正コメント */}
              {latestFile.review_status === "rejected" && latestFile.review_comment && (
                <p className="mt-2 text-xs text-purple-300 bg-purple-500/10 rounded p-2">
                  {latestFile.review_comment}
                </p>
              )}
            </div>

            {/* 新しいファイルをアップロード */}
            <div className="pt-2">
              <p className="text-xs text-slate-400 mb-2">新しいバージョンをアップロード:</p>
              <FileUploader
                id={`slot-${slot.id}`}
                files={selectedFiles}
                onFilesChange={handleFilesChange}
                accept={acceptConfig.accept}
                isDark={true}
                multiple={acceptConfig.multiple}
                maxFiles={acceptConfig.multiple ? 10 : 1}
                compact={true}
              />
            </div>
          </div>
        ) : (
          // 未提出時のアップロードエリア
          <FileUploader
            id={`slot-${slot.id}`}
            files={selectedFiles}
            onFilesChange={handleFilesChange}
            accept={acceptConfig.accept}
            isDark={true}
            multiple={acceptConfig.multiple}
            maxFiles={acceptConfig.multiple ? 10 : 1}
          />
        )}

        {/* 履歴展開 */}
        {hasHistory && (
          <div className="mt-3 pt-3 border-t border-slate-600/50">
            <button
              type="button"
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              🕒 過去の履歴 ({historyFiles.length}件)
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
                  <div className="mt-2 space-y-2">
                    {historyFiles.map((file) => {
                      const statusDisplay = getStatusDisplay(file.review_status);
                      return (
                        <div
                          key={file.id}
                          className={`flex items-center gap-2 p-2 rounded border ${statusDisplay.className}`}
                        >
                          {/* サムネイル */}
                          <button
                            type="button"
                            onClick={() => onViewImage?.(file.file_url, file.file_name)}
                            className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-slate-700 group"
                          >
                            <Image
                              src={file.file_url}
                              alt={file.file_name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-3 h-3 text-white" />
                            </div>
                          </button>

                          {/* ファイル情報 */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-200 truncate">{file.file_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] px-1 py-0.5 rounded flex items-center gap-0.5 ${statusDisplay.className}`}>
                                {statusDisplay.icon}
                                {statusDisplay.label}
                              </span>
                              <span className="text-[10px] text-slate-500">v{file.version}</span>
                              <span className="text-[10px] text-slate-500">
                                {file.created_at && new Date(file.created_at).toLocaleDateString("ja-JP")}
                              </span>
                            </div>
                          </div>

                          {/* ダウンロードボタン */}
                          <a
                            href={file.file_url}
                            download={file.file_name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-slate-600/50 text-slate-400 hover:text-slate-200 transition-colors"
                            title="ダウンロード"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
