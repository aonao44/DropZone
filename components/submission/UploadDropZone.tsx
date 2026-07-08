"use client";

import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UploadDropZoneProps {
  onFileDrop: (files: File[]) => void;
  isUploading?: boolean;
}

export function UploadDropZone({ onFileDrop, isUploading = false }: UploadDropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      onFileDrop(acceptedFiles);
    },
    noClick: false,
    noKeyboard: false,
  });

  return (
    <Card
      {...getRootProps()}
      className={`
        border-2 border-dashed cursor-pointer transition-all duration-200
        ${isDragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-600/50 bg-slate-800/40'}
        ${isUploading ? 'opacity-60 cursor-not-allowed' : 'hover:border-cyan-500/50 hover:bg-slate-700/30'}
      `}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 px-4">
        <input {...getInputProps()} disabled={isUploading} />
        {isUploading ? (
          <Loader2 className="h-12 w-12 text-cyan-500 animate-spin mb-4" />
        ) : (
          <Upload className="h-12 w-12 text-slate-400 mb-4" />
        )}
        <p className="text-lg font-light text-slate-200 mb-2">
          {isDragActive ? 'ここにドロップ' : 'ファイルをドラッグ&ドロップ'}
        </p>
        <p className="text-sm text-slate-400">
          またはクリックしてファイルを選択
        </p>
      </CardContent>
    </Card>
  );
}
