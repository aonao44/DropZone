# DropZone

DropZone は、クライアントとデザイナー間での素材提出をスムーズにするためのファイル提出プラットフォームです。
Slack やメールでのファイル共有による「流れちゃう問題」を解消するための、シンプルで使いやすい提出フォームを提供します。
※開発途中

---

## 🖼 現在の進捗

- [x] デザイナー用のアップロードフォーム UI
- [x] 提出完了モーダルの表示
- [x] クライアント（依頼者）用ダッシュボード UI
- [x] クライアント用ダウンロード画面（一覧で DL）
- [x] ダークモード対応の Tailwind UI
- [x] 基本的なルーティングと構造
- [ ] Clerk 認証の導入（現在開発中）
- [ ] 提出フォームのバリデーション強化
- [ ] テスト＆Vercel への仮デプロイ

---

## 🧭 このプロジェクトの目的

クライアントワークで頻繁に起きる「どこに素材送ったっけ？」「Slack で流れちゃった！」問題を解決し、
デザイナーが迷わずにファイルを提出できる専用の提出フォームを提供することが目的です。

---

## 🛠️ 使用技術（Tech Stack）

- Next.js 15（App Router）
- TypeScript
- TailwindCSS
- Clerk（認証）※実装中
- UploadThing（ファイルアップロード予定）
- Framer Motion / Radix UI / Lucide Icons

---

## 📦 開発手順（Getting Started）

1. リポジトリをクローン

```bash
git clone git@github.com:your-username/DropZone.git
cd DropZone
```

2. `.env.example` を参考に `.env` ファイルを作成し、API キーなどを設定

3. 依存関係をインストール

```bash
npm install
```

4. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

---

## 🚀 Vercel へのデプロイ

### 環境変数の設定

Vercel にデプロイする際は、以下の環境変数を **必ず設定** してください:

| 環境変数名 | 説明 | 取得方法 |
|-----------|------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk の公開鍵 | [Clerk Dashboard](https://dashboard.clerk.com) の API Keys ページから取得 |
| `CLERK_SECRET_KEY` | Clerk のシークレットキー | 同上 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL | [Supabase Dashboard](https://app.supabase.com) の Settings > API から取得 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の匿名キー | 同上 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase のサービスロールキー | 同上（管理者権限が必要な操作用） |
| `UPLOADTHING_SECRET` | UploadThing のシークレットキー | [UploadThing Dashboard](https://uploadthing.com/dashboard) から取得 |
| `NEXT_PUBLIC_APP_URL` | デプロイ先の URL | `https://your-app.vercel.app` |

### デプロイ手順

1. Vercel にログイン: https://vercel.com
2. GitHub リポジトリを接続
3. プロジェクトをインポート
4. **Settings > Environment Variables** で上記の環境変数をすべて設定
5. **Deploy** ボタンをクリック

### 重要な注意事項

⚠️ **環境変数が設定されていない場合、ビルドが失敗します**

特に以下のエラーが出る場合は、環境変数が正しく設定されているか確認してください:

```
Error: @clerk/clerk-react: Missing publishableKey
```

→ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` が設定されていません

### トラブルシューティング

- **ビルドエラーが出る場合**: Vercel の環境変数がすべて設定されているか確認
- **認証が動作しない場合**: Clerk Dashboard で許可されたドメインに Vercel の URL を追加
- **ファイルアップロードが失敗する場合**: UploadThing Dashboard で Vercel の URL を許可リストに追加

---

## 📝 ライセンス

MIT License
