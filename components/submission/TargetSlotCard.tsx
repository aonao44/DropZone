"use client";

import { useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDroppable } from '@dnd-kit/core';
import Image from 'next/image';
import { FileText, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileVersionBadge } from './FileVersionBadge';
import { ACCEPT_TYPE_CONFIG } from '@/lib/slot-templates';
import type { ProjectSlot, FileWithId } from '@/lib/types';

/**
 * 割り当て済みファイルのサムネイル表示。
 * Blob URLをファイルごとにuseMemoで安定化し、アンマウント時に解放する。
 */
function AssignedFileThumbnail({
  file,
  onView,
}: {
  file: FileWithId;
  onView?: (url: string, name: string) => void;
}) {
  const isImage = file.type.startsWith('image/');
  const previewUrl = useMemo(
    () => (isImage ? URL.createObjectURL(file) : null),
    [file, isImage]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-slate-700">
      {isImage && previewUrl ? (
        <Image
          src={previewUrl}
          alt={file.name}
          fill
          className="object-cover cursor-pointer"
          sizes="40px"
          onClick={(e) => {
            e.stopPropagation();
            onView?.(previewUrl, file.name);
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <FileText className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

interface TargetSlotCardProps {
  slot: ProjectSlot;
  assignedFiles: FileWithId[];
  onDirectDrop: (slotId: string, files: File[]) => void;
  onRemoveFile: (slotId: string, fileId: string) => void;
  onViewImage?: (url: string, name: string) => void;
  isDraggingOver?: boolean;
}

export function TargetSlotCard({
  slot,
  assignedFiles,
  onDirectDrop,
  onRemoveFile,
  onViewImage,
  isDraggingOver = false,
}: TargetSlotCardProps) {
  const acceptConfig = ACCEPT_TYPE_CONFIG[slot.accept_type];

  // @dnd-kitのドロップゾーン
  const { setNodeRef } = useDroppable({
    id: `slot-${slot.id}`,
  });

  // react-dropzoneの直接ドロップ
  const { getRootProps, getInputProps, isDragActive: isFileDragActive } = useDropzone({
    onDrop: async (files) => {
      onDirectDrop(slot.id, files);
    },
    multiple: acceptConfig.multiple,
    accept: { [acceptConfig.accept]: [] },
  });

  // 既存ファイルの確認
  const hasExistingFile = slot.latest_file && !slot.latest_file.is_deleted;
  const existingVersion = hasExistingFile && slot.latest_file ? slot.latest_file.version : 0;

  // 新規ファイルのバージョン判定
  const getFileVersion = () => {
    if (!hasExistingFile) return 1;
    return existingVersion + 1;
  };

  // ステータス計算
  const currentCount = assignedFiles.length + (hasExistingFile ? 1 : 0);
  const isComplete = slot.is_required ? currentCount > 0 : true;
  const remainingCount = acceptConfig.multiple ? null : Math.max(0, 1 - currentCount);

  return (
    <Card
      ref={setNodeRef}
      {...getRootProps()}
      className={`
        transition-all duration-200
        ${isDraggingOver || isFileDragActive ? 'ring-2 ring-cyan-500 bg-cyan-500/10' : ''}
        bg-slate-800/40 border-slate-600/50
      `}
    >
      <input {...getInputProps()} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-light text-slate-50">
            {slot.name}
          </CardTitle>
          <div className="flex gap-1">
            {slot.is_required ? (
              <Badge variant="warning" className="text-xs">必須</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">任意</Badge>
            )}
            {isComplete ? (
              <Badge variant="success" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                完了
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                未提出
              </Badge>
            )}
          </div>
        </div>
        {slot.description && (
          <p className="text-xs text-slate-400 mt-1">{slot.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
          <span>{acceptConfig.label}</span>
          {!acceptConfig.multiple && remainingCount !== null && (
            <span>• 残り{remainingCount}件</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* 既存ファイル */}
        {hasExistingFile && slot.latest_file && (
          <div className="relative p-2 rounded border border-slate-600/30 bg-slate-700/30">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-slate-600">
                {slot.latest_file.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <Image
                    src={slot.latest_file.file_url}
                    alt={slot.latest_file.file_name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-light text-slate-300 truncate">
                  {slot.latest_file.file_name}
                </p>
                <p className="text-xs text-slate-500">既存 (v{slot.latest_file.version})</p>
              </div>
            </div>
          </div>
        )}

        {/* 新規割り当てファイル */}
        {assignedFiles.length > 0 ? (
          assignedFiles.map(file => {
            const newVersion = getFileVersion();

            return (
              <div key={file.id} className="relative p-2 rounded border border-cyan-500/30 bg-cyan-500/10">
                <FileVersionBadge version={newVersion} isNew={true} />
                <div className="flex items-center gap-2">
                  <AssignedFileThumbnail file={file} onView={onViewImage} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-light text-slate-200 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`${file.name} を削除`}
                    className="h-11 w-11 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(slot.id, file.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : !hasExistingFile ? (
          <div className="text-center py-6 border-2 border-dashed border-slate-600/50 rounded">
            <p className="text-xs text-slate-400">
              ここにドロップまたはクリック
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
