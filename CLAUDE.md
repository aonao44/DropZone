# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

DropZone は、デザイナーとクライアント間での素材提出を円滑にするファイル提出プラットフォームです。Slack やメールでのファイル共有による「流れちゃう問題」を解消するシンプルな提出フォームを提供します。

## 開発コマンド

### 基本コマンド
```bash
# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start

# Linter の実行
npm run lint
```

## 技術スタック

- **Next.js** v15.2.4 (App Router)
- **React** v19.0.0
- **TypeScript** v5
- **TailwindCSS** v4 (@tailwindcss/postcss)
- **Clerk** v6.12.12 - 認証・ユーザー管理（現在開発中、ミドルウェアは一時的に無効化中）
- **Supabase** - データベース（@supabase/supabase-js, @supabase/ssr）
- **UploadThing** v7.6.0 - ファイルアップロード
- **Shadcn/ui + Radix UI** - UIコンポーネント

## アーキテクチャと設計原則

### ディレクトリ構造

```
app/
├── api/                      # APIルート（POST/PATCH/PUT/DELETE のみ）
│   ├── projects/            # プロジェクト関連API
│   ├── submissions/         # 提出関連API
│   ├── download-all/        # 一括ダウンロードAPI
│   └── uploadthing/         # ファイルアップロード設定
├── dashboard/               # デザイナー用ダッシュボード
├── project/[slug]/          # プロジェクト関連ページ
│   ├── submit/             # クライアント用提出フォーム
│   └── view/               # 提出物の閲覧画面
├── sign-in/                 # サインインページ
├── sign-up/                 # サインアップページ
├── submit/                  # 提出フォーム（レガシー）
└── page.tsx                 # ランディングページ

components/
├── client-submission-form.tsx           # クライアント提出フォーム
├── client-additional-submission-form.tsx # 追加提出フォーム
├── file-uploader.tsx                    # ファイルアップローダー
├── submission-logs.tsx                   # 提出履歴表示
├── ProjectSubmissionCard.tsx            # プロジェクトカード
├── DownloadButton.tsx                   # ダウンロードボタン
├── DownloadAllButton.tsx                # 一括ダウンロードボタン
└── ui/                                  # Shadcn UIコンポーネント

lib/
├── supabase/
│   └── server.ts            # Supabaseサーバークライアント
├── types.ts                 # 型定義（Submission, Project, SubmissionFile）
├── uploadthing.ts           # UploadThing設定
└── utils.ts                 # ユーティリティ関数

hooks/                       # カスタムフック
utils/                       # ヘルパー関数
```

### コンポーネント設計

- **Server Components を優先**: デフォルトで Server Components を使用し、データフェッチは Server Components で実行
- **Client Components は最小限**: `'use client'` は以下の場合のみ使用
  - ブラウザ API を使用する場合
  - イベントリスナーが必要な場合
  - React hooks を使用する場合
  - クライアントサイドの状態管理が必要な場合

### API ルート設計

- **GET API は作成しない**: データフェッチはサーバーコンポーネントで実行
- **POST/PATCH/PUT/DELETE のみ実装**: ユーザーデータの操作のみ API として提供
- エラーハンドリングとステータスコードの適切な使用
- Server Actions の使用も推奨

### 命名規則

- ディレクトリ: 小文字とダッシュ（例: `components/auth-wizard`）
- コンポーネント: 名前付きエクスポートを推奨
- ページコンポーネント: `page.tsx`
- レイアウトコンポーネント: `layout.tsx`
- ローディング状態: `loading.tsx`
- エラーハンドリング: `error.tsx`

### スタイリング

- **Tailwind CSS**: デスクトップファーストのアプローチ
  - ダッシュボード: デスクトップファーストを採用
  - ランディングページ: モバイルファースト、SEO 重視
- **Shadcn/ui**: UIコンポーネントは重点的に利用
- **Radix UI**: アクセシブルなコンポーネント基盤

## 認証（Clerk）

現在、Clerk 認証は開発中のため、`middleware.ts` で一時的に無効化されています。

### 実装時の注意事項

- ミドルウェアの設定は `.cursor/rules/dev-rules/clerk.mdc` に記載された最新の仕様に従うこと
- `clerkMiddleware` と `createRouteMatcher` を使用
- サーバーサイドでの認証チェックは `auth()` を使用
- クライアントサイドでは `useAuth()` フックを使用

## データベース（Supabase）

### 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 主要な型定義

- `Submission`: 提出データ（name, email, files, figma_links）
- `Project`: プロジェクト（slug, title, name, email）
- `SubmissionFile`: 提出ファイル（name, url, ufsUrl）

### Supabase クライアントの使用

```typescript
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const supabase = createClient(cookies());
```

## ファイルアップロード（UploadThing）

### 環境変数

```env
UPLOADTHING_SECRET=
```

### 設定

- 画像アップロード: 最大 8MB、最大 10 ファイル
- アップロード設定: `app/api/uploadthing/core.ts`
- クライアント設定: `lib/uploadthing.ts`

## 重要な開発ルール

### コードスタイル

- 関数型と宣言型のプログラミングパターンを使用、クラスは避ける
- 説明的な変数名を補助動詞とともに使用（例: `isLoading`, `hasError`）
- 型よりインターフェースを優先
- 列挙型（enum）を避け、マップを使用

### パフォーマンス

- `'use client'`、`useEffect`、`setState` の使用を最小限に抑え、React Server Components を優先
- クライアントコンポーネントを Suspense でラップし、フォールバックを提供
- 重要でないコンポーネントには動的ローディングを使用
- 画像最適化: `next/image` を使用、WebP フォーマットを推奨

### UI/UX の変更

- **明示的に指示されていない変更は行わない**
- **UI/UX デザインの変更（レイアウト、色、フォント、間隔など）は事前承認が必要**
- 変更が必要な場合は必ず理由を示し、承認を得る

### 実装前の確認事項

- 既存の類似機能の有無を確認
- 同名または類似名の関数やコンポーネントがないかチェック
- 重複する API エンドポイントがないか確認
- 共通化可能な処理の特定

### セキュリティ

- API キー、パスワードは環境変数で管理（`.env.example` を参照）
- すべての外部入力を検証
- サーバーサイドでのバリデーションを必ず実施

## 開発フロー

1. **タスク分析**: 既存機能の確認、重複実装の防止
2. **実装**: ステップごとに進捗を報告
3. **品質管理**: エラー発生時は原因特定と対策の実施
4. **最終確認**: 当初の指示内容との整合性確認
5. **結果報告**: 実行結果を markdown フォーマットで報告

## 参考資料

詳細なルールは以下のファイルを参照してください：
- `.cursorrules` - TypeScript + Next.js 開発ガイドライン
- `.cursor/rules/globals.mdc` - グローバルルール
- `.cursor/rules/dev-rules/techstack.mdc` - 技術スタック詳細
- `.cursor/rules/dev-rules/nextjs.mdc` - Next.js ベストプラクティス
- `.cursor/rules/dev-rules/clerk.mdc` - Clerk 認証実装ルール
- `.cursor/rules/dev-rules/db-blueprint.mdc` - データベース設計ルール
