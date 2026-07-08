'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { CopyUrlButton } from '@/components/CopyUrlButton';

interface Project {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  client_email: string;
}

interface ProjectCreatedClientProps {
  project: Project;
  slug: string;
}

export function ProjectCreatedClient({ project, slug }: ProjectCreatedClientProps) {
  const [submitUrl, setSubmitUrl] = useState('');

  useEffect(() => {
    // クライアントサイドでURLを生成（デプロイ環境のURLを取得するため）
    const baseUrl = window.location.origin;
    setSubmitUrl(`${baseUrl}/project/${slug}/submit`);
  }, [slug]);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-6">
      <div className="max-w-2xl w-full">
        {/* 注意事項 */}
        <div className="mb-4 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg backdrop-blur-sm">
          <p className="text-xs text-amber-200 font-light">
            <strong className="font-medium">注意:</strong> このURLは誰でもアクセス可能です。クライアント以外には共有しないでください。
          </p>
        </div>

        {/* 成功アイコン */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-green-500/20 rounded-full mb-3 backdrop-blur-sm border border-green-500/30">
            <CheckCircle className="w-7 h-7 lg:w-9 lg:h-9 text-green-400" aria-hidden="true" />
          </div>
          <h1 className="text-xl lg:text-2xl font-extralight text-slate-50 mb-1.5 tracking-tight">
            プロジェクトが作成されました
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 font-light">
            以下のURLをクライアントに共有してください
          </p>
        </div>

        {/* プロジェクト情報 */}
        <div className="bg-slate-800/40 rounded-lg p-3.5 lg:p-4 mb-3.5 border border-slate-700/50 backdrop-blur-sm">
          <h2 className="text-sm lg:text-base font-light text-slate-100 mb-2">
            プロジェクト情報
          </h2>
          <div className="space-y-1.5 text-xs lg:text-sm font-light">
            <div className="flex justify-between">
              <span className="text-slate-400">プロジェクト名:</span>
              <span className="text-slate-200">{project.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">依頼者:</span>
              <span className="text-slate-200">{project.client_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">メール:</span>
              <span className="text-slate-200 truncate ml-2 min-w-0">{project.client_email}</span>
            </div>
          </div>
        </div>

        {/* URL共有セクション */}
        <div className="bg-slate-800/40 rounded-lg p-3.5 lg:p-4 border border-slate-700/50 mb-3.5 backdrop-blur-sm">
          <h2 className="text-sm lg:text-base font-light text-slate-100 mb-1.5">
            クライアント用提出フォームURL
          </h2>
          <p className="text-xs text-slate-400 mb-2.5 font-light">
            このURLをコピーしてクライアントに送信してください。クライアントはこのURLから素材を提出できます。
          </p>

          <div className="bg-slate-900/50 rounded-lg p-2.5 mb-2.5 border border-slate-700/30">
            <code className="text-cyan-400 text-xs break-all font-mono">
              {submitUrl || '読み込み中…'}
            </code>
          </div>

          {submitUrl && <CopyUrlButton url={submitUrl} />}
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/dashboard"
            className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 font-light py-2 px-4 rounded-lg transition-all text-center border border-slate-600 text-xs lg:text-sm"
          >
            ダッシュボードに戻る
          </Link>
          <Link
            href={`/project/${slug}/view`}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-all text-center hover:scale-105 text-xs lg:text-sm"
          >
            提出状況を確認
          </Link>
        </div>
      </div>
    </div>
  );
}
