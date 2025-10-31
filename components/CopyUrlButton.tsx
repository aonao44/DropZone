'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyUrlButtonProps {
  url: string;
}

export function CopyUrlButton({ url }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
    >
      {copied ? (
        <>
          <Check className="w-5 h-5" />
          コピーしました
        </>
      ) : (
        <>
          <Copy className="w-5 h-5" />
          URLをコピー
        </>
      )}
    </button>
  );
}
