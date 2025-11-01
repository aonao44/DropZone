# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

DropZone は、デザイナーとクライアント間での素材提出を円滑にするファイル提出プラットフォームです。Slack やメールでのファイル共有による「流れちゃう問題」を解消するシンプルな提出フォームを提供します。

### コンセプト

**「素材回収、もう催促しない。1 リンクで"提出漏れゼロ"」**

Web/LP/デザイン制作のための提出フォーム生成 SaaS。提出要件のガイド・自動チェック・期限管理・受領管理を一気通貫で提供。

### 提供価値

- **漏れゼロ**: 要件テンプレ＋自動バリデーションで不足を可視化
- **催促ゼロ**: 期限・自動リマインドで能動的に回収
- **管理コスト最小**: 提出一覧・不足タグ・ZIP 一括 DL（Pro）で運用を短縮

### ターゲットユーザー

- フリーランス/小規模制作事業者（Web 制作、LP 制作、バナー/デザイン受託）
- 毎案件で素材回収がバラバラになり、催促/手戻りに時間を取られている人

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
- **Shadcn/ui + Radix UI** - UI コンポーネント

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
- **Shadcn/ui**: UI コンポーネントは重点的に利用
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

**重要**: タスクを完了したら、必ず `.claude/development_roadmap.md` の該当する項目のチェックボックス `[ ]` を `[x]` に更新してください。

1. **タスク分析**: 既存機能の確認、重複実装の防止
2. **実装**: ステップごとに進捗を報告
3. **品質管理**: エラー発生時は原因特定と対策の実施
4. **進捗記録**: `.claude/development_roadmap.md` の該当タスクのチェックボックスを更新（`[ ]` → `[x]`）
5. **最終確認**: 当初の指示内容との整合性確認
6. **結果報告**: 実行結果を markdown フォーマットで報告

## MVP 機能概要

### 主要機能

1. **プロジェクト作成（管理者）**

   - プロジェクト名、説明、提出期限（任意）、テンプレ選択（LP/コーポレート/バナー など 3 型）
   - フォーム URL の自動生成（`/s/:slug` または `/project/:slug/submit`）

2. **提出フォーム生成（クライアント用）**

   - ログイン不要、ドラッグ＆ドロップ対応、スマホ最適
   - 提出項目: ロゴ画像、キービジュアル、Figma リンク、任意メモ
   - 入力ガイド（推奨サイズ・拡張子・背景/透過・Figma の共有設定）

3. **自動バリデーション**

   - 画像: 拡張子（png/jpg/svg）、容量、最小 px、アスペクト比（任意）
   - Figma: URL 形式（`figma.com/file/` 含むか）、http/https 判定
   - 必須/任意の判定、未達項目は警告表示

4. **提出完了＆再提出**

   - 完了画面（お礼＋不足があれば案内）
   - 再提出リンク（同一 URL で追送可／最新版が上書き、履歴は管理画面へ）

5. **ダッシュボード（管理者）**

   - 提出一覧（ステータス: 未提出/一部不足/完了）
   - 各提出の詳細（ファイルプレビュー、ダウンロード、メモ、タイムスタンプ）
   - 不足項目のタグ付け（自動/手動）

6. **リマインド（MVP はメール）**

   - 期限 3 日前/前日/当日の自動メール（ON/OFF）
   - 手動リマインド送信（自由文＋フォーム URL 差し込み）

7. **料金/プラン**
   - **Free**: プロジェクト数制限、ストレージ上限、Powered by 表示
   - **Pro**: プロジェクト無制限、ZIP 一括 DL、CSV エクスポート、軽いホワイトラベル

## データモデル（MVP 想定）

```
User(id, email, role[admin], createdAt,...)
Project(id, ownerId(ref User), name, description, slug, dueDate, templateType[LP/CORP/BANNER], status[active/archived], createdAt,...)
Submission(id, projectId, clientEmail?, clientName?, status[pending/partial/complete], progressPct, createdAt, updatedAt)
Asset(id, submissionId, type[logo/kv/figma/guide/other], fileKey?, fileUrl?, width?, height?, bytes?, ext?, isValid, validationErrors[], createdAt)
Event(id, projectId?, submissionId?, type[created/submitted/reminded/downloaded,...], payload JSON, createdAt)
Plan(id, userId, tier[free/pro], stripeCustomerId, stripeSubId, status[active/canceled], createdAt)
```

## 開発ロードマップ（MVP）

### フェーズ 1: 基盤・認証・DB・アップロード（3–4 日）

- 環境構築（Next.js 15, TS, Tailwind, shadcn/ui）
- 認証（Clerk - 管理者のみ）
- DB/スキーマ（Supabase + Prisma）
- アップロード基盤（UploadThing）
- 共通 UI/レイアウト

### フェーズ 2: プロジェクト & 提出フォーム生成（2–3 日）

- プロジェクト作成
- 公開フォーム（ベース）
- 提出完了
- API/Server Actions

### フェーズ 3: 提出 & バリデーション（3–4 日）

- ファイル検証（フロント+サーバ）
- Figma リンク検証
- 提出データ登録
- 完了画面/再提出
- イベント記録

### フェーズ 4: ダッシュボード & 管理機能（2–3 日）

- 一覧表示
- 詳細表示
- フィルタ/ソート
- 手動リマインド（下準備）

### フェーズ 5: 期限・リマインド（メール）（2 日）

- リマインドスケジューラ
- メール送信（Resend）
- 手動リマインド
- イベント/監査

### フェーズ 6: Pro 課金（ZIP/CSV/ブランド色）（3–4 日）

- Stripe（サブスク）
- ZIP 一括 DL（ジョブ化）
- CSV エクスポート
- ブランド色/ロゴ（軽ホワイトラベル）

### フェーズ 7: 公開ページ & マーケ（1–2 日）

- トップ/料金ページ
- 導入フロー
- 計測

### フェーズ 8: 本番デプロイ＆品質確認（1 日）

- 本番デプロイ（Vercel）
- セキュリティ最終確認
- スモークテスト
- SLA/サポート動線

## 開発順守　

**重要**: 実装前に必ず該当するドキュメントを確認し、仕様に従って開発してください。

### .claude ディレクトリのドキュメント

プロジェクトの詳細な仕様とガイドラインは `.claude/` ディレクトリに格納されています：

- **requirements.md** - 要件定義書（サービス概要、機能要件、非機能要件、データモデル）
- **development_roadmap.md** - 開発ロードマップ（フェーズ別実装計画、タスク一覧、受け入れ基準）
- **design_system.md** - デザインシステム（配色、タイポグラフィ、コンポーネント設計、レスポンシブ対応）
- **clerk_document.md** - Clerk 認証の詳細実装ガイド
- **clerk_supabase_integration_document.md** - Clerk と Supabase の統合方法
- **supabase_document.md** - Supabase の使用方法とベストプラクティス
- **tailwind_document.md** - Tailwind CSS の使用ガイドライン
- カスタム CSS は原則として書かない

### コミットメッセージ

- 一区切り着いた段階で git にコミットしたいので日本語でコミットメッセージを出してください

## トラブルシューティング・ナレッジベース

### Supabase Row Level Security (RLS) の扱い

#### 問題: 提出履歴や詳細データが取得できない

**症状**:

- ダッシュボードで提出データが表示されない（`data: []`）
- クライアントコンポーネントからの Supabase クエリが空配列を返す

**原因**:

- Supabase の RLS（Row Level Security）ポリシーにより、匿名ユーザー（`ANON_KEY`）からのアクセスが制限されている
- `@/lib/supabase/server` は `ANON_KEY` を使用するため、RLS の制限を受ける

**解決策**:

1. **サーバーサイドでの対応**: `@/utils/supabase/server` を使用

   - `SERVICE_ROLE_KEY` を使用して RLS をバイパス
   - Server Components や API Routes で使用

2. **API Route パターンの採用**:

   ```typescript
   // app/api/submissions/[projectSlug]/route.ts
   import { createClient } from "@/utils/supabase/server";

   export async function GET(request, { params }) {
     const supabase = createClient(cookies());
     const { data, error } = await supabase
       .from("submissions")
       .select("*")
       .eq("project_slug", params.projectSlug);
     return NextResponse.json({ data });
   }
   ```

3. **クライアントコンポーネントからの利用**:
   ```typescript
   // Client Component
   const response = await fetch(`/api/submissions/${projectSlug}`);
   const { data } = await response.json();
   ```

**重要な区別**:

- `@/lib/supabase/server` → `ANON_KEY` 使用、RLS 適用対象
- `@/utils/supabase/server` → `SERVICE_ROLE_KEY` 使用、RLS バイパス（サーバーサイドのみ）

#### クエリ時のフィールド名に注意

**症状**: データベースにレコードは存在するのにクエリ結果が空

**原因**:

- データベーススキーマと異なるフィールド名でクエリしている
- 例: `project_id` でクエリすべきところを `slug` でクエリ

**解決策**:

```typescript
// ❌ 間違い
.eq("project_id", project.id)

// ✅ 正しい（スキーマに project_slug フィールドがある場合）
.eq("project_slug", project.slug)
```

**デバッグ方法**:

1. Supabase のテーブルスキーマを確認
2. `console.log` でクエリパラメータを出力
3. Supabase ダッシュボードで SQL を直接実行して確認

### ファイルダウンロード機能の実装

#### 問題: ダウンロードボタンを押すとブラウザで画像が表示されてしまう

**症状**:

- ダウンロードボタンをクリックすると、ファイルがダウンロードされずブラウザで開く
- 特に画像ファイル（PNG、JPG など）で発生しやすい

**原因**:

- 通常の `<a>` タグと `download` 属性だけでは、CORS 制限のある外部 URL（UploadThing など）からのダウンロードが機能しない
- ブラウザはファイルをダウンロードする代わりに表示してしまう

**解決策**: Blob 方式のダウンロード実装

```typescript
// components/DownloadButton.tsx
const handleDownload = async () => {
  // 1. ファイルを fetch して blob として取得
  const response = await fetch(url);
  const blob = await response.blob();

  // 2. blob URL を作成
  const blobUrl = window.URL.createObjectURL(blob);

  // 3. <a> タグを動的に作成してクリック
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  // 4. クリーンアップ
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
};
```

**使用例**:

```typescript
// ❌ 間違い - CORS エラーまたはブラウザで開く
<a href={file.url} download>ダウンロード</a>

// ✅ 正しい - DownloadButton コンポーネントを使用
<DownloadButton url={file.url} fileName={file.name} />
```

**注意事項**:

- ダウンロード後にファイルが自動で開くかどうかは、ブラウザや OS の設定に依存
- Web アプリケーション側ではダウンロード後の動作（ファイルを開くかどうか）を制御できない
- これは Web 標準の制限であり、回避不可能

**関連コンポーネント**:

- `components/DownloadButton.tsx` - 単一ファイルのダウンロード
- `components/ProjectDetailClient.tsx` - プロジェクト詳細画面でのダウンロード
- `components/submission-logs.tsx` - 提出履歴でのダウンロード

### Next.js キャッシュ問題

**症状**:

- コードを修正したのにコンパイルエラーが消えない
- "Expected a semicolon" などの誤ったエラーが表示される

**原因**:

- `.next` ディレクトリのキャッシュが破損

**解決策**:

```bash
rm -rf .next
npm run dev
```
