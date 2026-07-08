# DropZone SaaS 戦略（2026-07-07 調査）

コードベース調査・要件ドキュメント調査・市場調査（競合 pricing は公式ページで確認）を統合した戦略メモ。
【事実】= 出典で確認済み ／【推測】= 戦略仮説。

## 1. プロダクトの背骨（思想の統合）

v01「提出漏れゼロのフォーム」→ v02「デジタル検品所」→ v03「スロット/ツーペイン提出 UI」と重心が移ってきたが、一貫している核は:

1. **クライアントは絶対ログイン不要**（アカウント不要・アプリ不要・2ステップ以内）
2. **スマホ最適**（ゲストはスマホ提出前提）
3. **チャットレス**（OK/NG＋コメント必須のステータス管理で「どれが確定版？」の往復を殺す）

以後の機能判断はすべてこの3点への貢献で判定する。雑談チャット・多段承認・重厚なポータルは作らない。

## 2. 市場ポジション【事実】

「①ログイン不要提出 × ②検収(OK/NG)」を両立する製品は世界でも少数で、**日本語ネイティブの専用 SaaS は実質存在しない**。

| 競合 | 最安有料/月 | ①ログイン不要 | ②検収 | 弱み |
|---|---|---|---|---|
| Content Snare | $35〜 | ◯ | ◯ | 英語のみ・無料なし・通知過多・リクエスト数課金で急に高額化 |
| Dropbox File Requests | 無料〜 | ◯ | ✕ | 収集のみ。ロゴ除去不可 |
| WeTransfer | $12〜16 | △ | △ | 転送のみ。保存・進捗なし |
| Filestage | $199 | ◯ | ◎ | 高価格帯・中大規模向け |
| FileInvite | $829〜 | △ | ◯ | 融資特化へピボット、個人に非現実的 |
| Copilot/Moxie/SuperOkay | $9〜59 | ✕〜△ | ◯ | ポータルログイン型で①が弱い |
| ギガファイル便/firestorage | 無料 | ◎ | ✕ | 一方向転送。検収・進行レイヤーなし |
| formrun | ¥2,980〜 | ◯ | △ | 問い合わせ管理思想。素材（大容量）に非力 |
| Googleフォーム+Drive | 無料 | ✕（ログイン強制） | ✕ | 実際の最大競合は「この手動運用」 |

**真の競合は SaaS ではなく「ギガファイル便＋Chatwork＋Google フォームの手動運用」**。勝負所は「手動運用の痛み（URL どこ？どれが確定版？）を製品で吸収できるか」。

## 3. 勝ち筋【推測】

WeTransfer の低摩擦 × Content Snare の検収 × formrun の日本語 —— 各社が1本しか持たない柱を3本同時に持つ。

1. **摩擦ゼロ提出を"信条"として明言**（LP ヒーローで「クライアントはアカウント不要」）
2. **検収を提出フローに内蔵**: クライアント側にも 提出済み/差戻し/承認 を表示し、問い合わせを製品側で吸収
3. **クライアントを疲れさせない通知**: 1日1通ダイジェスト既定。競合最大の不満（通知過多）の逆張り
4. **日本語ネイティブ＋国内商習慣**（円建て・インボイス対応）
5. **課金の壁 =「クライアントに見せる体裁」**: 無料は提出画面に DropZone ロゴ（バイラル露出兼用）、有料でロゴ除去
6. **（中期）AI 検収で先行**: 解像度・カラーモード(CMYK/RGB)・フォーマットの自動チェックは海外 DAM では実装済みだが日本の素材回収文脈では空白【事実】

## 4. 課金設計の推奨【推測】

- **モデル**: 恒久フリーミアム＋リバーストライアル（初回14日は上位開放→期限後 Free に降格）
- **Free**: プロジェクト1〜2件 / 月間提出制限 / 提出画面に DropZone ロゴ
- **Pro ¥1,980〜2,980/月**: プロジェクト10〜20件 / ロゴ除去 / 一括DL / CSV / 保存無期限
- **Business は保留**（ホワイトラベル需要が見えてから）
- **決済基盤は Clerk Billing に一本化**（実装最短・Stripe 直は撤去）。plan slug は既存コード通り `premium` か、`pro` に統一するなら lib/billing.ts と CLAUDE.md を同時更新
- 根拠【事実】: ブランディング除去は Typeform/Content Snare/SuperOkay/formrun 共通の有料化トリガー。日本の価格アンカーは formrun（エントリー¥2,980）。フリーミアムは TTV 5分未満の製品で有利（DropZone は該当）

※ 現状は v01(2段階¥1,480〜)/v02(3段階¥2,980〜)/CLAUDE.md(premium)/clerk.md(サンプル) でプラン記述が食い違っている。**上記で一本化するか、別の結論を出すかの意思決定が Phase C の前提**。

## 5. 直近の実装優先順位

roadmap.md の Phase 0 → B → C の順。要点:

1. **Phase 0（土台）**: WIP ツーペイン UI の実 DB 検証、是正マイグレーション、旧ルート/旧検収 API 退役、E2E 再整備
2. **Phase B（通知）**: Resend + ダイジェスト方式。「催促ゼロ」という v01 の約束をここで回収
3. **Phase C（課金）**: プラン一本化 → Clerk Billing 再有効化（lib/billing.ts の1箇所）
4. **並行**: 需要検証。制作会社のディレクター/進行管理者 5〜10人に「検収 OK/NG」が刺さるかインタビュー

## 6. リスク・未検証【重要】

- **需要未検証が最大リスク**: 「無料転送＋手動運用で足りている層」を有料に動かせるかは未証明。空白 ≠ 需要
- Supabase 本番プロジェクトが INACTIVE（無料枠自動停止）。本番運用の基盤判断が必要
- 一部競合価格が未確定（WeTransfer/Copilot/SuperOkay/FileInvite は要再確認）
- 素材回収ニッチの市場サイズは client portal 全体の数字（2024 USD 1.2〜5.2B、CAGR 8〜15%）しかない

## 7. 主要出典

- 競合: contentsnare.com/pricing / dropbox.com/plans / filestage.io/pricing / fileinvite.com/plans-pricing / withmoxie.com/pricing / superokay.com/pricing / clustdoc.com/pricing
- 日本: gigafile.nu / firestorage.jp / form.run/home/pricing / tayori.com/plan / bitrix24.jp/prices
- AI: liscio.me / usecollect.com / smartvault.com / pageproof.com / acquia.com/blog/artificial-intelligence-ai-and-dam
- 価格設計: typeform.com/pricing / chartmogul.com/reports/saas-conversion-report / productled.com/blog/product-led-growth-benchmarks
- 市場規模: gminsights.com/industry-analysis/client-portal-software-market / dataintelo.com/report/client-portal-software-market
