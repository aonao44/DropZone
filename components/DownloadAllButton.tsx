"use client";

import React from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface DownloadAllButtonProps {
  projectSlug: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

export function DownloadAllButton({
  projectSlug,
  className,
  variant = 'outline',
  disabled = false,
}: DownloadAllButtonProps) {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Use window.location to trigger the file download
      window.location.href = `/api/download-all?projectSlug=${encodeURIComponent(projectSlug)}`;
      
      // Set a timeout to reset the downloading state 
      // (since we can't easily track the download completion)
      setTimeout(() => {
        setIsDownloading(false);
      }, 3000);
    } catch (error) {
      console.error('Error downloading submissions:', error);
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      className={className}
      variant={variant}
      disabled={disabled || isDownloading}
    >
      <Download className="h-4 w-4 mr-1" />
      {isDownloading ? '準備中...' : '全てダウンロード'}
    </Button>
  );
}
