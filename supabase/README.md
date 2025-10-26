# Supabase マイグレーション

## 概要

このディレクトリには、DropZone MVPのデータベーススキーマのマイグレーションファイルが格納されています。

## マイグレーションファイル

### 001_create_initial_schema.sql

完全なMVPスキーマを作成するマイグレーションです。以下のテーブルを作成/拡張します：

1. **users** - ユーザー情報
2. **projects** - プロジェクト情報（既存テーブルの拡張）
3. **submissions** - 提出情報（既存テーブルの拡張）
4. **assets** - アセット情報
5. **events** - イベントログ（監査ログ）
6. **plans** - プラン/課金情報

## マイグレーションの適用方法

### 方法1: Supabase CLIを使用（推奨）

```bash
# 1. Supabaseプロジェクトを初期化（未実施の場合）
npx supabase init

# 2. クラウドプロジェクトにリンク
npx supabase link --project-ref <your-project-ref>

# 3. マイグレーションを適用
npx supabase db push
```

### 方法2: Supabase Studio（GUIから直接実行）

1. https://app.supabase.com にアクセス
2. プロジェクトを選択
3. 「SQL Editor」を開く
4. `supabase/migrations/001_create_initial_schema.sql` の内容をコピー＆ペースト
5. 「Run」ボタンをクリック

## マイグレーション後の確認

以下のコマンドでテーブルが正しく作成されたか確認できます：

```sql
-- テーブル一覧の確認
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 各テーブルのカラム確認
\d users
\d projects
\d submissions
\d assets
\d events
\d plans
```

## 注意事項

- マイグレーションは**既存データを保持**します
- 既存のprojectsとsubmissionsテーブルがある場合、新しいカラムを追加します
- RLS（Row Level Security）は現在無効化されています（開発中）

## トラブルシューティング

### エラー: relation "projects" already exists

既存のテーブルがある場合は問題ありません。マイグレーションは既存テーブルを検出し、不足しているカラムのみを追加します。

### エラー: permission denied

Service Role Keyを使用してマイグレーションを実行してください。Supabase Studioから実行する場合は、自動的に適切な権限で実行されます。
