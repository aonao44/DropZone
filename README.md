# DropZone

DropZone は、デザイナーとクライアント間での素材提出をスムーズにするためのファイル提出プラットフォームです。  
Slack やメールでのファイル共有による「流れちゃう問題」を解消するための、シンプルで使いやすい提出フォームを提供します。

---

## 🖼 現在の進捗

- [x] クライアント用のアップロードフォーム UI
- [x] 提出完了モーダルの表示
- [x] デザイナー（依頼者）用ダッシュボード UI
- [x] クライアント用ダウンロード画面（一覧で DL）
- [x] ダークモード対応の Tailwind UI
- [x] 基本的なルーティングと構造
- [ ] Clerk 認証の導入（現在開発中）
- [ ] 提出フォームのバリデーション強化
- [ ] テスト＆Vercel への仮デプロイ

---

## 🧭 このプロジェクトの目的

クライアントワークで頻繁に起きる「どこに素材送ったっけ？」「Slack で流れちゃった！」問題を解決し、  
クライアントが迷わずにファイルを提出できる専用の提出フォームを提供することが目的です。

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
