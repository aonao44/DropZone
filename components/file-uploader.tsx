"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, File, X, AlertCircle } from "lucide-react";

interface FileUploaderProps {
  id: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;
  isDark?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  existingFileCount?: number;
}

export function FileUploader({
  id,
  files,
  onFilesChange,
  accept,
  isDark = false,
  multiple = true,
  maxFiles = 10,
  existingFileCount = 0,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset error when files change
    if (files.length <= maxFiles) {
      setFileError(null);
    }
  }, [files, maxFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      const totalCount = existingFileCount + files.length + newFiles.length;

      if (totalCount > maxFiles) {
        setFileError(`プロジェクト全体で最大${maxFiles}ファイルまでアップロード可能です`);
        return; // ← ここで追加しない
      }

      setFileError(null);
      onFilesChange([...files, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const totalCount = existingFileCount + files.length + newFiles.length;

      if (totalCount > maxFiles) {
        setFileError(`プロジェクト全体で最大${maxFiles}ファイルまでアップロード可能です`);
        return; // ← ここで追加しない
      }

      setFileError(null);
      onFilesChange([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    onFilesChange(updatedFiles);
    setFileError(null);

    if (updatedFiles.length === 0 && inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Theme-based classes
  const themeClasses = isDark
    ? {
        dropzone: isDragging
          ? "border-indigo-400/80 bg-indigo-800/20"
          : "border-gray-600/70 hover:border-indigo-500/70 bg-gray-700/40",
        uploadIcon: isDragging ? "text-indigo-300" : "text-gray-300",
        fileCard: "border-gray-600/70 bg-gray-700/40",
        fileIcon: "bg-indigo-800/30 text-indigo-300",
        removeButton: "text-gray-300 hover:text-indigo-300 hover:bg-indigo-800/30",
        hoverGradient: "from-indigo-800/20 to-purple-800/20",
        text: "text-gray-200",
        mutedText: "text-gray-300",
        errorText: "text-red-300",
        errorBg: "bg-red-900/20 border-red-500/30",
      }
    : {
        dropzone: isDragging
          ? "border-pink-300/80 bg-pink-50/70"
          : "border-gray-200/70 hover:border-pink-200/70 bg-white",
        uploadIcon: isDragging ? "text-pink-500/90" : "text-gray-400",
        fileCard: "border-gray-200/70 bg-white",
        fileIcon: "bg-pink-50/80 text-pink-500/90",
        removeButton: "text-gray-400 hover:text-pink-500/90 hover:bg-pink-50/50",
        hoverGradient: "from-blue-50/50 to-pink-50/50",
        text: "text-gray-700",
        mutedText: "text-gray-500",
        errorText: "text-red-600",
        errorBg: "bg-red-100 border-red-300",
      };

  return (
    <div className="w-full space-y-2">
      {fileError && (
        <div className={`flex items-center gap-2 p-2 rounded-lg border ${themeClasses.errorBg}`}>
          <AlertCircle className={`h-4 w-4 ${themeClasses.errorText}`} />
          <p className={`text-xs ${themeClasses.errorText}`}>{fileError}</p>
        </div>
      )}

      {files.length < maxFiles && (
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ y: 1 }}
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${themeClasses.dropzone} shadow-sm hover:shadow-md`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="absolute inset-0 bg-dot-pattern opacity-10 rounded-xl pointer-events-none"></div>
          <div className="flex flex-col items-center justify-center gap-2 text-center cursor-pointer">
            <motion.div
              animate={{
                y: isDragging ? -8 : 0,
                scale: isDragging ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <div
                className={`absolute inset-0 blur-lg ${
                  isDark ? "bg-indigo-500" : "bg-pink-200"
                } rounded-full transition-opacity ${isDragging ? "opacity-70" : "opacity-0"}`}
              ></div>
              <Upload className={`h-8 w-8 relative z-10 transition-colors ${themeClasses.uploadIcon}`} />
            </motion.div>
            <div className="space-y-1">
              <p className={`text-sm font-medium ${themeClasses.text}`}>
                ドラッグ＆ドロップ または クリックしてアップロード
              </p>
              <p className={`text-xs ${themeClasses.mutedText}`}>
                JPG, PNG, GIF (最大10MB) {multiple && `- 最大${maxFiles}ファイル`}
              </p>
              {files.length > 0 && (
                <p className={`text-xs ${themeClasses.mutedText}`}>
                  {files.length} / {maxFiles} ファイル選択中
                </p>
              )}
            </div>
          </div>
          <input
            id={id}
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <motion.div
              key={`${file.name}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-xl p-4 ${themeClasses.fileCard} shadow-sm relative overflow-hidden group`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${themeClasses.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className={`${themeClasses.fileIcon} p-2 rounded-lg`}>
                    <File className="h-5 w-5" />
                  </div>
                  <div className={`text-sm truncate max-w-[200px] ${themeClasses.text}`}>{file.name}</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className={`${themeClasses.removeButton} rounded-full p-1.5 transition-colors`}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
