import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-800 text-slate-100 px-4">
      <div className="text-center">
        <p className="text-sm text-slate-400 font-light mb-2">404</p>
        <h1 className="text-2xl font-extralight text-slate-50 mb-3 tracking-tight">
          ページが見つかりません
        </h1>
        <p className="text-slate-400 font-light mb-8">
          URLが正しいか確認してください。提出用URLの場合は、送り主にお問い合わせください。
        </p>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-lg bg-slate-100 px-6 py-3 font-medium text-slate-900 transition-colors hover:bg-slate-200"
        >
          トップページへ
        </Link>
      </div>
    </div>
  );
}
