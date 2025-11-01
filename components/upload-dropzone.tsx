"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UploadDropzoneProps {
  onDrop: (files: File[]) => void
  files: File[]
  onRemove: (index: number) => void
  maxFiles?: number
  acceptedFileTypes?: Record<string, string[]>
  maxSize?: number
}

export function UploadDropzone({
  onDrop,
  files,
  onRemove,
  maxFiles = 10,
  acceptedFileTypes = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
  },
  maxSize = 8 * 1024 * 1024, // 8MB
}: UploadDropzoneProps) {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles)
    },
    [onDrop]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: onDropCallback,
    maxFiles,
    maxSize,
    accept: acceptedFileTypes,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          {isDragActive ? (
            <p className="text-sm text-muted-foreground">ファイルをドロップ...</p>
          ) : (
            <>
              <p className="text-sm font-medium">
                ファイルをドラッグ&ドロップ、またはクリックして選択
              </p>
              <p className="text-xs text-muted-foreground">
                最大 {maxFiles} ファイル、{formatFileSize(maxSize)} まで
              </p>
            </>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="rounded-lg bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive mb-2">アップロードできないファイル:</p>
          <ul className="text-xs text-destructive/80 space-y-1">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name} - {errors.map((e) => e.message).join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">選択されたファイル ({files.length})</p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded bg-accent">
                  <FileImage className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
