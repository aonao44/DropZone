"use client";

import React from 'react';
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  url: string;
  fileName: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function DownloadButton({
  url,
  fileName,
  className = "bg-gray-700 hover:bg-gray-600 border-gray-600 text-white",
  variant = "outline"
}: DownloadButtonProps) {
  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Add download parameter to the URL
    const downloadUrl = `${url}?download=true`;
    
    // Create a hidden anchor and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      size="sm"
      variant={variant}
      className={className}
      onClick={handleDownload}
    >
      <Download className="h-4 w-4 mr-1" />
      ダウンロード
    </Button>
  );
}
