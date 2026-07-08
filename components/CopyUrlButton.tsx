'use client';

import { useRef, useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';

interface CopyUrlButtonProps {
  url: string;
}

type CopyStatus = 'idle' | 'copied' | 'error';

export function CopyUrlButton({ url }: CopyUrlButtonProps) {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
    resetTimerRef.current = setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
    >
      <span aria-live="polite" className="flex items-center gap-2">
        {status === 'copied' && (
          <>
            <Check className="w-5 h-5" aria-hidden="true" />
            コピーしました
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
            コピーできませんでした。URLを長押しで選択してください
          </>
        )}
        {status === 'idle' && (
          <>
            <Copy className="w-5 h-5" aria-hidden="true" />
            URLをコピー
          </>
        )}
      </span>
    </button>
  );
}
