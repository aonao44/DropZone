# DropZone

> クライアントが Web 制作・デザイン案件の資料（画像・テキスト・参考リンク）をまとめてアップロード送信できる Web アプリ

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://drop-zone-lac.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## 何を解決するか

受託制作の現場では「ロゴ送ってください → メール添付・Slack DM・ギガファイル便がバラバラ」「会話に流れて資料が行方不明」「Notion を渡してもクライアントが使い切れない」といった課題が日常的に起きます。

DropZone は、案件ごとに 1 つの提出専用 URL を発行し、クライアントは画面の指示に従ってファイルや参考リンクを置いていくだけで完結します。受け取り側はダッシュボードで一覧管理・一括ダウンロードが可能です。

## 主要機能

- 案件ごとの提出専用 URL（slug ベース）を発行
- クライアントは画像・ファイル・Figma などの URL リンクをまとめて送信
- 同一案件への追加提出に対応（追記送信フロー）
- ダッシュボードで案件一覧・提出件数・ファイル数を一覧表示
- 受領ファイルを ZIP で一括ダウンロード
- 送信者・送信履歴のログ表示
- Clerk 認証によるオーナー（受託側）アカウント管理
- 無料 / Premium プランの切り替え（Clerk Billing 連携）
- ダークモード基調の UI（Tailwind + shadcn/ui）

## デモ

https://drop-zone-lac.vercel.app

> Premium プランの一部機能を除き、サインアップして実際にプロジェクトを作成・URL 発行・提出フローまで一通り体験できます。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) / React 19 / TypeScript 5
- **スタイル**: Tailwind CSS v4 / shadcn/ui (Radix UI ベース) / Framer Motion / Lucide Icons
- **認証**: [Clerk](https://clerk.com/)（`@clerk/nextjs` ミドルウェアで保護ルート制御）
- **課金**: Clerk Billing + Stripe SDK
- **データベース**: Supabase (PostgreSQL) / `@supabase/ssr`
- **ファイルアップロード**: UploadThing / `react-dropzone` / `browser-image-compression`
- **ZIP 生成**: `archiver`
- **フォーム**: React Hook Form + Zod
- **テスト**: Playwright
- **デプロイ**: Vercel

## アーキテクチャ

```
app/
├── page.tsx                       # ランディングページ
├── dashboard/                     # 受託側ダッシュボード（Clerk 認証必須）
│   ├── page.tsx                   # 案件一覧・提出数集計
│   └── new/page.tsx               # 新規プロジェクト作成
├── project/[slug]/                # 案件のオーナー画面
│   ├── created/                   # URL 発行直後の案内
│   ├── submit/                    # オーナー側からの確認用提出画面
│   └── view/                      # 提出物のレビュー・ダウンロード
├── submit/[slug]/                 # クライアント向けの提出フォーム（公開 URL）
└── api/
    ├── projects/                  # プロジェクト CRUD
    ├── submissions/[projectSlug]/ # 提出データ取得・保存
    ├── reviews/                   # 提出物レビュー API
    ├── download-all/              # ZIP 一括ダウンロード
    └── uploadthing/               # UploadThing コールバック
components/   # UI コンポーネント（shadcn/ui ベース）
lib/          # supabase client / uploadthing 設定 / 型定義
supabase/     # マイグレーション SQL（projects / submissions / assets / events / plans）
middleware.ts # Clerk による保護ルート制御
```

データモデルは `projects → submissions → assets` の 1 対多構造で、`events` テーブルに作成・送信・ダウンロード等の監査ログを保存しています。

## セットアップ

```bash
# 1. クローン
git clone https://github.com/aonao44/DropZone.git
cd DropZone

# 2. 依存関係のインストール
npm install

# 3. 環境変数を設定（.env.local を作成）
#    - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY
#    - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
#    - UPLOADTHING_SECRET / UPLOADTHING_TOKEN
#    - NEXT_PUBLIC_APP_URL

# 4. Supabase に対してマイグレーションを適用
#    supabase/migrations/*.sql を順に実行

# 5. 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## ライセンス

MIT License

## 作者

[aonao44](https://github.com/aonao44)
