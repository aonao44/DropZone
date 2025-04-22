"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  url: string;
  fileName: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function DownloadButton({
  url,
  fileName,
  className = "bg-gray-700 hover:bg-gray-600 border-gray-600 text-white",
  variant = "outline",
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // 1. ファイルをフェッチしてブロブとして取得
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("ファイルのダウンロードに失敗しました");
      }

      const blob = await response.blob();

      // 2. ブロブからURLを作成
      const blobUrl = window.URL.createObjectURL(blob);

      // 3. リンク要素を作成してダウンロード
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || url.split("/").pop() || "download";
      link.style.display = "none";

      // 4. リンクを追加してクリック
      document.body.appendChild(link);
      link.click();

      // 5. クリーンアップ
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("ダウンロードエラー:", error);
      alert("ファイルのダウンロードに失敗しました。");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button size="sm" variant={variant} className={className} onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
      {isDownloading ? "ダウンロード中..." : "ダウンロード"}
    </Button>
  );
}
