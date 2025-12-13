# CLAUDE.md - DropZone

## プロジェクト概要

クライアントから素材を集めるための URL 発行型提出フォーム作成ツール。
Next.js 15 / Supabase / Clerk / UploadThing で構築。

## 開発コマンド

```bash
npm run dev      # 開発サーバー (localhost:3000)
npm run build    # ビルド & 型チェック
npm run lint     # ESLint
```

## 重要なルール

1. **GET API ルート禁止** - データ取得は Server Components で行う
2. **Server Components 優先** - `'use client'` は必要な場合のみ
3. **UI/UX 変更は承認必須** - デザイン変更前に必ず確認

## 主要ファイル

- `lib/supabase/server.ts` - DB クライアント
- `lib/types.ts` - 型定義
- `components/dark-layout.tsx` - 共通レイアウト

## デザイン

**Digital Serenity** - ダークテーマ（すべてのページで `DarkLayout` を使用）

- 背景: `from-slate-900 via-black to-slate-800`
- テキスト: `text-slate-50` / `text-slate-400`
- フォント: `font-extralight` / `font-light`

## 詳細ドキュメント

`agent_docs/` を参照:

| ファイル | 内容 |
|---------|------|
| `requirements.md` | プロダクト要件定義 |
| `roadmap.md` | 開発ロードマップ |
| `design-system.md` | デザインシステム詳細 |
| `clerk.md` | Clerk 認証・課金ガイド |
| `clerk-supabase-integration.md` | Clerk + Supabase RLS 統合 |
| `supabase.md` | Supabase データベースガイド |
| `tailwind.md` | Tailwind CSS v4 設定 |

## Clerk + Supabase

- userId は TEXT 型で保存
- RLS は Service Role キー方式を推奨
- プラン確認: `has({ plan: 'premium' })`
