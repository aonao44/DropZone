import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CopyUrlButton } from '@/components/CopyUrlButton';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { DarkLayout } from '@/components/dark-layout';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProjectCreatedPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createClient(await cookies());

  // プロジェクトの存在確認
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !project) {
    redirect('/dashboard');
  }

  // 提出フォームのURL
  const submitUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/project/${slug}/submit`;

  return (
    <DarkLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* 成功アイコン */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4 backdrop-blur-sm border border-green-500/30">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-3xl font-extralight text-slate-50 mb-2 tracking-tight">
              プロジェクトが作成されました
            </h1>
            <p className="text-slate-400 font-light">
              以下のURLをクライアントに共有してください
            </p>
          </div>

          {/* プロジェクト情報 */}
          <div className="bg-slate-800/40 rounded-lg p-6 mb-6 border border-slate-700/50 backdrop-blur-sm">
            <h2 className="text-lg font-light text-slate-100 mb-4">
              プロジェクト情報
            </h2>
            <div className="space-y-2 text-sm font-light">
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
                <span className="text-slate-200">{project.client_email}</span>
              </div>
            </div>
          </div>

          {/* URL共有セクション */}
          <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50 mb-6 backdrop-blur-sm">
            <h2 className="text-lg font-light text-slate-100 mb-2">
              クライアント用提出フォームURL
            </h2>
            <p className="text-sm text-slate-400 mb-4 font-light">
              このURLをコピーしてクライアントに送信してください。クライアントはこのURLから素材を提出できます。
            </p>

            <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700/30">
              <code className="text-cyan-400 text-sm break-all font-mono">
                {submitUrl}
              </code>
            </div>

            <CopyUrlButton url={submitUrl} />
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 font-light py-3 px-6 rounded-lg transition-all text-center border border-slate-600"
            >
              ダッシュボードに戻る
            </Link>
            <Link
              href={`/project/${slug}/view`}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-3 px-6 rounded-lg transition-all text-center hover:scale-105"
            >
              提出状況を確認
            </Link>
          </div>

          {/* 注意事項 */}
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-amber-200 font-light">
              <strong className="font-medium">注意:</strong> このURLは誰でもアクセス可能です。クライアント以外には共有しないでください。
            </p>
          </div>
        </div>
      </div>
    </DarkLayout>
  );
}
