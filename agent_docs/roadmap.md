# DropZone 開発ロードマップ

## 概要

素材管理・検品 SaaS「DropZone」の実装順序とタスクリストを定義します。
プロダクトの背骨は3点で一貫させる（詳細は `saas-strategy.md`）:

1. **クライアントはログイン不要**（アカウント不要・アプリ不要の低摩擦提出）
2. **スマホ最適**（ゲストはスマホ提出前提）
3. **チャットレス**（OK/NG ステータスで会話を減らす「デジタル検品所」）

要件の正: requirements_v02（検品ワークフロー）＋ requirements_v03（スロット/ツーペイン提出 UI）の統合。

---

## 📊 現状分析（2026-07-07 時点）

| 機能カテゴリ | 状態 | 備考 |
|:-----------|:----:|:-----|
| 認証（Clerk・日本語化） | ✅ | |
| プロジェクト作成・URL 発行 | ✅ | テンプレート（LP/BANNER/CUSTOM）対応 |
| スロット（指定席）システム | ✅ | project_slots / slot_files、バージョン管理付き |
| 検品ワークフロー（Phase A） | ✅ | pending/approved/rejected、NG コメント必須（commit e8032d2） |
| ツーペイン仕分け提出 UI（v03） | 🟠 進行中 | feature/smart-inbox-ui。UI 実装済み、結線の検証が未 |
| 提出 API のスロット対応検証・上限 | ✅ | 2026-07-07 修正: スロット分も上限カウント、事前検証化 |
| プラン上限の一元化 | ✅ | lib/plan-limits.ts + lib/billing.ts に集約 |
| メール通知（Resend） | 🔴 未実装 | Phase B |
| 課金（Clerk Billing） | 🟡 無効化中 | lib/billing.ts が全員プレミアム扱い。プラン設計は未確定 |
| CSV エクスポート | 🔴 未実装 | |
| ホワイトラベル（ロゴ除去） | 🔴 未実装 | 市場調査上、最有力の有料化トリガー |
| Supabase 本番 | ⚠️ INACTIVE | 無料枠の自動停止。本番運用前に有料化 or 復元運用の決定が必要 |

### 既知の技術的負債（優先度順）

1. **マイグレーション⇔コード不整合**: migrations は projects(name,email,owner_id) を作るが、コードは client_name/client_email/user_id を参照。DB を再現できない。是正マイグレーション（008）が必要
2. **検収 API 二系統**: 旧 file_reviews と新 slot_files が併存。slot_files に一本化して旧系を退役させる
3. **Supabase クライアント二重化**: utils/supabase/server.ts（Service Role）と lib/supabase/server.ts（Anon）が混在。認可方針を決めて統一
4. **ルート重複**: /submit/[slug]（旧）と /project/[slug]/submit（新）、空スタブ /project/[slug]、孤立 /submit の整理
5. **E2E テスト形骸化**: 旧仕様・無効化済み課金向けの4本のみ。現行フロー（スロット提出→検品）の E2E がない
6. **console.log 残存・test.html などの残骸**

---

## 🎯 実装ロードマップ

### Phase 0: WIP 完了と土台固め（最優先・進行中）

- [x] Next.js 16 対応の lint 基盤復旧（next lint 廃止 → ESLint CLI）
- [x] 提出 API: スロット分のファイル上限カウント・保存前検証
- [x] ツーペイン UI: アップロード結果突合の一意キー化（同名ファイル取り違え防止）
- [x] プラン上限の一元化（plan-limits.ts）
- [ ] ツーペイン提出 → 検品 → 再提出の一連フローを実 DB で動作確認（Supabase 復元が前提）
- [ ] 是正マイグレーション 008（実 DB スキーマの正とコードの一致）
- [ ] 旧ルート・旧検収 API の退役
- [ ] 現行フローの E2E テスト再整備（Playwright）

### Phase B: 通知システム（Phase 0 完了後すぐ）

「催促ゼロ」の実現。市場調査の教訓: 競合（Content Snare/FileInvite）の最大の不満は**通知過多**。

- [ ] Resend 統合＋テンプレート
- [ ] ホストへ「提出あり」/ ゲストへ「承認・差戻し（コメント付き）」
- [ ] **1日1通ダイジェスト方式**（デフォルト）＋即時通知はオプトイン
- [ ] リマインドは「ホストが手動でワンクリック送信」から開始（自動化は後続）

### Phase C: マネタイズ（プラン設計の意思決定が先）

**着手前に決めること**（現状4文書でプランがバラバラ。saas-strategy.md の推奨案参照）:
- [ ] プラン段数・価格・plan slug の確定（推奨: Free / Pro ¥1,980〜2,980 の2段階から開始）
- [ ] 決済基盤の確定（推奨: Clerk Billing。Stripe 直は保留、依存から stripe を外す）
- [ ] 無料↔有料の壁 = **提出画面の DropZone ロゴ除去**＋数量（プロジェクト数/月間提出数）
- [ ] lib/billing.ts の再有効化（一元化済みなので1箇所）
- [ ] 提出フォーム側の上限をサーバーから受け取る形に統一
- [ ] CSV エクスポート（Pro 以上）

### Phase D: ホワイトラベル・拡張

- [ ] ロゴ差し替え / 独自ドメイン（Business 検討時）
- [ ] AI 検収（解像度・カラーモード・フォーマットの自動チェック）※差別化候補、saas-strategy.md 参照

---

## ✅ 完了済みフェーズ（詳細は git 履歴）

- 基盤（Next.js 16 / Tailwind v4 / shadcn/ui / Clerk / Supabase / UploadThing）
- プロジェクト作成〜公開フォーム〜提出〜ダッシュボード〜一括 DL（ZIP）
- 検品ワークフロー Phase A（OK/NG・NG コメント必須・ステータス集計）
- スロットシステム＋バージョン管理（再提出は新バージョン）
- Vercel デプロイ・CVE-2025-66478 対応

---

## リスク & 回避策

- **需要未検証（最大リスク）** → Phase C 前にユーザーインタビュー / LP 検証。詳細は saas-strategy.md
- **通知過多による嫌悪** → ダイジェスト方式をデフォルトに
- **Supabase 無料枠の自動停止** → 本番運用開始時に Pro 化、もしくは稼働監視
- **ストレージ肥大** → Free は保存期間制限（物理削除ポリシーを Phase C で確定）

---

## ポスト MVP バックログ

1. Slack/Chatwork 通知（日本の制作現場は Chatwork 圏が厚い）
2. クライアントポータル（履歴・進捗％）
3. 外部ストレージ連携（Drive/Dropbox/S3）
4. チーム/権限
5. テンプレマーケット
6. AI 依頼文生成・自動リネーム
