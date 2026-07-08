"use client";

import { useEffect, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { FileText, GripVertical, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { FileWithId } from '@/lib/types';

interface InboxFileCardProps {
  file: FileWithId;
  isSelected: boolean;
  onClick: (event: React.MouseEvent) => void;
  isDraggingDisabled?: boolean;
}

export function InboxFileCard({ file, isSelected, onClick, isDraggingDisabled = false }: InboxFileCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: file.id,
    disabled: isDraggingDisabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

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

  const uploadProgress = file.uploadProgress ?? 0;
  const isUploading = uploadProgress > 0 && uploadProgress < 100;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        relative transition-all duration-200
        ${isSelected ? 'ring-2 ring-cyan-500 bg-cyan-500/10' : ''}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        bg-slate-800/40 border-slate-600/50
      `}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* ドラッグハンドル */}
        {!isDraggingDisabled && (
          <div
            {...listeners}
            {...attributes}
            aria-label={`${file.name} をドラッグして移動`}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
        )}

        {/* 選択ボタン（サムネイル・ファイル情報・チェック） */}
        <button
          type="button"
          onClick={onClick}
          aria-pressed={isSelected}
          className="flex-1 min-w-0 flex items-center gap-3 text-left rounded-md cursor-pointer hover:bg-slate-700/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          {/* サムネイル */}
          <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-slate-700">
            {isImage && previewUrl ? (
              <Image
                src={previewUrl}
                alt={file.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FileText className="h-6 w-6 text-slate-400" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* ファイル情報 */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-light text-slate-200 truncate">{file.name}</p>
            <p className="text-xs text-slate-400">
              {(file.size / 1024).toFixed(1)} KB
            </p>
            {isUploading && (
              <Progress value={uploadProgress} className="h-1 mt-1" />
            )}
          </div>

          {/* 選択チェック */}
          {isSelected && (
            <CheckCircle2 className="h-5 w-5 text-cyan-500 flex-shrink-0" aria-hidden="true" />
          )}
        </button>
      </CardContent>
    </Card>
  );
}
