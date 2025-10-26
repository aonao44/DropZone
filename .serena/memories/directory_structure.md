# DropZone - ディレクトリ構造

## トップレベル構造

```
/
├── .claude/              # Claude Code用ドキュメント
│   ├── requirements.md
│   ├── development_roadmap.md
│   ├── design_system.md
│   └── ...
├── .cursor/              # Cursor設定
├── app/                  # Next.js App Router
├── components/           # Reactコンポーネント
├── lib/                  # ライブラリ・ユーティリティ
├── hooks/                # カスタムフック
├── utils/                # ヘルパー関数
├── public/               # 静的ファイル
├── supabase/             # Supabase設定
└── ...設定ファイル
```

## app/ ディレクトリ（Next.js App Router）

```
app/
├── api/                      # APIルート（POST/PATCH/PUT/DELETEのみ）
│   ├── projects/            # プロジェクト関連API
│   ├── submissions/         # 提出関連API
│   ├── download-all/        # 一括ダウンロードAPI
│   └── uploadthing/         # ファイルアップロード設定
├── dashboard/               # デザイナー用ダッシュボード
│   ├── new/                # 新規プロジェクト作成
│   ├── page.tsx            # ダッシュボードトップ
│   └── ...
├── project/[slug]/          # プロジェクト関連ページ
│   ├── submit/             # クライアント用提出フォーム
│   └── view/               # 提出物の閲覧画面
├── sign-in/                 # サインインページ
├── sign-up/                 # サインアップページ
├── submit/                  # 提出フォーム（レガシー）
├── page.tsx                 # ランディングページ
├── layout.tsx               # ルートレイアウト
└── globals.css              # グローバルスタイル
```

## components/ ディレクトリ

```
components/
├── ui/                                      # Shadcn UIコンポーネント
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...（多数のRadix UIベースコンポーネント）
├── client-submission-form.tsx               # クライアント提出フォーム
├── client-additional-submission-form.tsx    # 追加提出フォーム
├── file-uploader.tsx                        # ファイルアップローダー
├── submission-logs.tsx                      # 提出履歴表示
├── ProjectSubmissionCard.tsx                # プロジェクトカード
├── DownloadButton.tsx                       # ダウンロードボタン
├── DownloadAllButton.tsx                    # 一括ダウンロードボタン
├── DashboardClient.tsx                      # ダッシュボードクライアント
├── ProjectDetailClient.tsx                  # プロジェクト詳細クライアント
├── dropzone-logo.tsx                        # ロゴコンポーネント
└── theme-provider.tsx                       # テーマプロバイダー
```

## lib/ ディレクトリ

```
lib/
├── supabase/
│   └── server.ts            # Supabaseサーバークライアント
├── types.ts                 # 型定義（Submission, Project, SubmissionFile）
├── uploadthing.ts           # UploadThing設定
└── utils.ts                 # ユーティリティ関数
```

## 主要な型定義ファイル

`lib/types.ts` には以下の主要な型が定義されています:
- `Project` - プロジェクト情報
- `Submission` - 提出データ
- `SubmissionFile` - 提出ファイル
- `UploadthingResponse` - アップロードレスポンス

## ルーティング構造

- `/` - ランディングページ
- `/dashboard` - ダッシュボード（認証必須）
- `/dashboard/new` - 新規プロジェクト作成
- `/project/[slug]/submit` - クライアント提出フォーム（認証不要）
- `/project/[slug]/view` - 提出物閲覧（認証必須）
- `/sign-in` - サインイン
- `/sign-up` - サインアップ
- `/api/projects` - プロジェクトAPI
- `/api/submissions` - 提出API
- `/api/download-all` - 一括ダウンロードAPI
