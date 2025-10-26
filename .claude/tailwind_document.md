# Next.js Tailwind CSS v4 設定ガイド

## 概要

Tailwind CSS v4 では、**ゼロコンフィグレーション**が実現されており、デフォルトでは設定ファイルが不要です。

## 必要な設定

### 1. パッケージのインストール

```bash
npm install -D tailwindcss @tailwindcss/postcss
```

### 2. PostCSS 設定ファイル

`postcss.config.mjs`を作成：

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

または

```javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
```

### 3. CSS ファイルでのインポート

`globals.css`または任意の CSS ファイルで：

```css
@import "tailwindcss";
```

**注意**: v3 の`@tailwind base/components/utilities`ディレクティブは使用しません。

なお、本システムにおいては可能な限りカスタムカラーなど、独自 CSS の定義は避け、デフォルトの Tailwind CSS ユーティリティクラスを使用するようにしてください。

## 重要な変更点（v3 から v4）

### 実装時の学び

**問題**: Next.js 15 で Tailwind CSS が適用されない
**原因**: v3 の設定ファイル（`tailwind.config.js`）が存在すると、v4 の設定と競合する
**解決策**:

- v3 の設定ファイルを完全に削除
- `postcss.config.mjs`で`@tailwindcss/postcss`のみを設定
- `globals.css`で`@import "tailwindcss"`を使用

### ❌ 不要になったもの

- `tailwind.config.js/ts` - デフォルトでは不要
- `@tailwind base/components/utilities` - `@import "tailwindcss"`に置き換え
- `content`配列の設定 - 自動検出される

### ✅ 新しい方式

- `@import "tailwindcss"` - 単一のインポート文
- `@theme` ディレクティブ - カスタムテーマ設定用
- ゼロコンフィグ - 設定ファイルなしで動作

## トラブルシューティング

### よくある問題

1. **Tailwind が適用されない**

   - `postcss.config.mjs`が存在することを確認
   - `@import "tailwindcss"`が正しく記述されているか確認
   - 開発サーバーを再起動

2. **ビルドエラー: Cannot find module '@tailwindcss/postcss'**

   ```bash
   npm install -D @tailwindcss/postcss
   ```

3. **v3 の設定ファイルが残っている**
   - `tailwind.config.js/ts`を削除（カスタマイズが不要な場合）
   - `@tailwind`ディレクティブを`@import`に変更

## カスタマイズが必要な場合

カスタムテーマやプラグインが必要な場合は、CSS ファイル内で`@theme`ディレクティブを使用：

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

## Shadcn UI との統合

### 重要な注意事項

**Tailwind CSS v4 では`tailwind.config.js/ts`を作成してはいけません。** Shadcn UI との統合でも設定ファイルは不要です。

### 正しい設定方法

1. **postcss.config.mjs**

   ```javascript
   const config = {
     plugins: ["@tailwindcss/postcss"],
   };

   export default config;
   ```

2. **globals.css** - CSS 変数を`hsl()`でラップし、`@theme inline`を使用

   ```css
   @import "tailwindcss";

   :root {
     --background: hsl(0 0% 100%);
     --foreground: hsl(222.2 84% 4.9%);
     --primary: hsl(217.2 91.2% 59.8%);
     /* その他のCSS変数... */
   }

   @theme inline {
     --color-background: var(--background);
     --color-foreground: var(--foreground);
     --color-primary: var(--primary);
     /* その他のカスタムカラー... */
   }

   @layer base {
     * {
       @apply border-border;
     }
     body {
       @apply bg-background text-foreground;
     }
   }
   ```

3. **components.json**
   ```json
   {
     "$schema": "https://ui.shadcn.com/schema.json",
     "style": "new-york",
     "rsc": true,
     "tsx": true,
     "tailwind": {
       "config": "",  // 空文字列にする
       "css": "src/app/globals.css",
       "baseColor": "slate",
       "cssVariables": true,
       "prefix": ""
     },
     "aliases": {
       "components": "@/components",
       "utils": "@/lib/utils"
     }
   }
   ```

### トラブルシューティング（Shadcn UI）

1. **`mb-4`などの基本クラスが動作しない**

   - 余計な CSS リセットを削除
   - `@theme inline`を正しく設定
   - 開発サーバーを再起動

2. **カスタムカラー（`bg-primary`など）が認識されない**

   - CSS 変数を`hsl()`でラップ
   - `@theme inline`でカラーを定義
   - Shadcn UI コンポーネントを再インストール

3. **`border-border`エラー**
   - `@layer base`内で`@apply`を使用
   - CSS 変数が正しく定義されているか確認

### デザインシステムとの統合

Shadcn UI のデフォルトスタイルを使用する場合でも、独自のデザインシステムに合わせてカスタマイズする場合でも、以下の点に注意：

- **CSS 変数は必ず`hsl()`形式で定義**
- **`@theme inline`で Tailwind のカスタムカラーとして登録**
- **コンポーネントのスタイルは標準の Tailwind クラスを優先**

## まとめ

Tailwind CSS v4 の最大の特徴は「**何もしなくていい**」こと。必要最小限の設定（PostCSS 設定と CSS インポート）だけで、すぐに使い始められます。Shadcn UI との統合でも、設定ファイルは作成せず、CSS 変数と`@theme inline`を活用することが重要です。

## 参考リンク

- [Tailwind CSS v4 公式ドキュメント](https://tailwindcss.com/docs/v4)
- [PostCSS 設定](https://tailwindcss.com/docs/v4/getting-started#configuring-postcss)
- [Shadcn UI - Tailwind v4 統合ガイド](https://ui.shadcn.com/docs/tailwind-v4)
