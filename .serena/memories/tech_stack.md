# DropZone - 技術スタック

## フロントエンド
- **Next.js** v15.2.4 (App Router)
- **React** v19.0.0
- **TypeScript** v5
- **TailwindCSS** v4 (@tailwindcss/postcss)

## 認証・データベース
- **Clerk** v6.12.12 - 認証・ユーザー管理（現在開発中、ミドルウェアは一時的に無効化中）
- **Supabase** - データベース（@supabase/supabase-js, @supabase/ssr）

## ファイルアップロード
- **UploadThing** v7.6.0 - ファイルアップロード（署名付きURL、ドラッグ＆ドロップ）

## UIライブラリ
- **Shadcn/ui + Radix UI** - UIコンポーネント
  - アコーディオン、ダイアログ、ドロップダウン、フォーム要素など多数のRadix UIコンポーネント
- **Lucide React** - アイコン
- **Framer Motion** - アニメーション

## ユーティリティ
- **react-hook-form** - フォーム管理
- **date-fns** - 日時操作
- **axios** - HTTPクライアント
- **browser-image-compression** - 画像圧縮
- **archiver** - ZIPファイル生成

## 開発ツール
- **TypeScript** v5
- **ESLint** - リンター

## デプロイ
- **Vercel** - ホスティング（推奨）

## 環境変数
- `CLERK_PUBLISHABLE_KEY` - Clerk公開鍵
- `CLERK_SECRET_KEY` - Clerkシークレット鍵
- `UPLOADTHING_SECRET` - UploadThingシークレット
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名キー
