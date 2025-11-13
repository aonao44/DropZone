# テストユーザー作成スクリプト

このディレクトリには、DropZoneアプリケーションのテスト用ユーザーを作成するためのスクリプトが含まれています。

## 使用方法

### 1. 必要なパッケージのインストール（初回のみ）

```bash
npm install tsx
```

### 2. テストユーザーの作成

```bash
npx tsx scripts/test-users/create-test-users.ts
```

## 作成されるテストユーザー

このスクリプトは以下の5人のテストユーザーを作成します：

| No. | 名前 | メールアドレス | パスワード |
|-----|------|----------------|------------|
| 1 | 田中 太郎 | tanaka.taro@test-dropzone.local | TestPassword123! |
| 2 | 佐藤 花子 | sato.hanako@test-dropzone.local | TestPassword123! |
| 3 | 鈴木 一郎 | suzuki.ichiro@test-dropzone.local | TestPassword123! |
| 4 | 高橋 美咲 | takahashi.misaki@test-dropzone.local | TestPassword123! |
| 5 | 渡辺 健太 | watanabe.kenta@test-dropzone.local | TestPassword123! |

## 注意事項

- このスクリプトはClerk Management APIを使用します
- 環境変数`CLERK_SECRET_KEY`が正しく設定されている必要があります
- 既に存在するメールアドレスの場合はスキップされます
- **本番環境では実行しないでください**（Development環境専用）

## トラブルシューティング

### エラー: "Unauthorized"

環境変数`CLERK_SECRET_KEY`が設定されていないか、無効です。`.env.local`ファイルを確認してください。

### エラー: "form_identifier_exists"

既に同じメールアドレスのユーザーが存在します。Clerk Dashboardから削除するか、スクリプト内のメールアドレスを変更してください。

## テスト後のクリーンアップ

テスト完了後、作成したユーザーを削除する場合は、Clerk Dashboardから手動で削除するか、`delete-test-users.ts`スクリプトを使用してください（今後追加予定）。
