# DropZone Design System - Digital Serenity

## 1. デザイン理念

Digital Serenity（デジタル・セレニティ）- 静寂と明瞭さが共存するミニマリスト・ダークテーマ。

洗練されたダークモードUIをベースに、SVGグリッドパターン、マウス追従グラデーション、インタラクティブなリップルエフェクトを組み合わせた、モダンで落ち着きのあるデザインシステムです。アクセシビリティを最優先に、シンプルさと機能性のバランスを追求します。

## 2. 配色システム

配色は個別CSSで定義せず、Tailwind CSSのユーティリティクラスのみを使用する。

### ダークテーマ基本配色

- **背景グラデーション**: `bg-gradient-to-br from-slate-900 via-black to-slate-800`
  - メインカラー: from-slate-900 (#0F172A)
  - 中間カラー: via-black (#000000)
  - アクセント: to-slate-800 (#1E293B)

### Slateカラーパレット

- **テキストメイン**: text-slate-50 (#F8FAFC) - 主要テキスト、見出し
- **テキストサブ**: text-slate-200 (#E2E8F0) - 通常テキスト
- **テキストミュート**: text-slate-300 (#CBD5E1) - 説明文、サブテキスト
- **テキストディム**: text-slate-400 (#94A3B8) - 補助情報、キャプション

### カード・コンポーネント背景

- **カード背景**: bg-slate-800/40 - 透過性のある暗色（40%透明度）
- **セクション背景**: bg-slate-700/30 - より薄い暗色（30%透明度）
- **ホバー背景**: bg-slate-700/50 - ホバー時のセクション背景
- **ボーダー**: border-slate-700/50 - 境界線（50%透明度）
- **ボーダー濃**: border-slate-600/50 - より明瞭な境界線

### アクセントカラー（ホワイトボタン）

- **プライマリボタン**: bg-slate-100 hover:bg-slate-200
- **ボタンテキスト**: text-slate-900
- **アウトラインボタン**: border-slate-600 bg-slate-800/50 text-slate-200

### システムカラー

- **成功**: bg-green-500/20 border-green-500/30 text-green-400
- **警告**: bg-amber-500/10 border-amber-500/30 text-amber-200
- **エラー**: bg-red-500/20 border-red-500/30 text-red-400
- **情報**: bg-blue-500/20 border-blue-500/30 text-blue-400

### グラスモーフィズム効果

- **ブラー効果**: backdrop-blur-sm - カード、モーダル、セクションに適用
- **透過度**: 20%-40%の範囲で使用（/20, /30, /40）

### SVGグリッドパターン

```jsx
<svg className="fixed inset-0 w-full h-full pointer-events-none z-0">
  <defs>
    <pattern id="gridDarkLayout" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(100, 116, 139, 0.1)" strokeWidth="0.5"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#gridDarkLayout)" />
</svg>
```

### マウス追従グラデーション

```css
#mouse-gradient-dark {
  position: fixed;
  pointer-events: none;
  border-radius: 9999px;
  background-image: radial-gradient(
    circle,
    rgba(156, 163, 175, 0.05),
    rgba(107, 114, 128, 0.05),
    transparent 70%
  );
  transform: translate(-50%, -50%);
  transition: left 70ms linear, top 70ms linear, opacity 300ms ease-out;
}
```

## 3. タイポグラフィ

### フォントウェイト階層

- **超軽量**: font-extralight (200) - 大見出し、ヒーロータイトル
- **軽量**: font-thin (300) - サブ見出し、装飾的テキスト
- **標準軽量**: font-light (300) - 通常テキスト、説明文
- **標準**: font-normal (400) - ラベル、入力フィールド
- **中**: font-medium (500) - 強調ボタンテキスト

### フォントサイズ階層（レスポンシブ対応）

- **ヒーロー見出し**: text-3xl sm:text-4xl lg:text-5xl + font-extralight + tracking-tight
- **大見出し**: text-2xl sm:text-3xl lg:text-4xl + font-extralight + tracking-tight
- **見出し1**: text-xl sm:text-2xl lg:text-3xl + font-light + tracking-tight
- **見出し2**: text-lg sm:text-xl lg:text-2xl + font-light
- **見出し3**: text-base sm:text-lg lg:text-xl + font-light
- **本文**: text-sm sm:text-base lg:text-lg + font-light
- **小本文**: text-xs sm:text-sm lg:text-base + font-light

### 行間・文字間隔

- **見出し**: leading-tight (1.25) + tracking-tight
- **本文**: leading-relaxed (1.625)
- **長文**: leading-loose (2)

### コントラスト要件

- ダークモード背景（slate-900系）に対して:
  - メインテキスト: slate-50 (白に近い) - 高コントラスト
  - サブテキスト: slate-300 - 中コントラスト
  - ミュートテキスト: slate-400 - 低コントラスト

## 4. 角丸システム

### コンポーネント別設定

- **ボタン**: rounded-lg (8px)
- **カード**: rounded-lg, rounded-2xl (16px)
- **モーダル**: rounded-2xl, rounded-3xl (24px)
- **入力フィールド**: rounded-md, rounded-lg
- **アイコンボタン**: rounded-full（円形）

## 5. 余白体系

### レスポンシブ余白（モバイルファースト）

- **コンテナ余白**: p-4 sm:p-6 lg:p-8
- **カード内余白**: p-4 sm:p-6 lg:p-8
- **セクション間**: space-y-4 sm:space-y-5 lg:space-y-6

### ボタン内余白（レスポンシブ）

- **小ボタン**: px-3 py-2 sm:px-6 sm:py-3
- **標準ボタン**: px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6
- **大ボタン**: px-6 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-8

### 最小タッチターゲット

- 44px x 44px 以上を確保（アクセシビリティ要件）

## 6. コンポーネント設計

### プライマリボタン（ホワイトボタン）

```jsx
<Button className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105">
  プロジェクトを作成
</Button>
```

### セカンダリボタン（アウトラインボタン）

```jsx
<Button
  variant="outline"
  className="border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 hover:text-slate-50 font-light px-6 py-3 rounded-lg transition-all duration-200"
>
  戻る
</Button>
```

### カード設計

```jsx
<Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm transition-all duration-200 hover:bg-slate-800/60 hover:border-slate-600/50">
  <CardHeader className="pb-4 p-6">
    <CardTitle className="text-2xl font-light text-slate-50">
      タイトル
    </CardTitle>
    <CardDescription className="text-base text-slate-400">
      説明文
    </CardDescription>
  </CardHeader>
  <CardContent className="p-6">
    {/* コンテンツ */}
  </CardContent>
</Card>
```

### 入力フィールド

```jsx
<Input
  className="h-12 text-base bg-slate-700/30 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500"
  placeholder="例: 山田 太郎"
/>
```

### ラベル

```jsx
<Label className="text-base font-light text-slate-400">
  お名前 <span className="text-slate-400">*</span>
</Label>
```

### アラート・通知

```jsx
{/* 警告 */}
<div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-lg backdrop-blur-sm">
  <p className="text-sm font-light">
    <strong className="font-medium">注意:</strong> このURLは誰でもアクセス可能です。
  </p>
</div>

{/* 成功 */}
<div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full backdrop-blur-sm border border-green-500/30">
  <CheckCircle className="w-12 h-12 text-green-400" />
</div>
```

## 7. インタラクティブエフェクト

### ホバー効果

- **ボタン**: hover:bg-slate-200 + hover:scale-105
- **カード**: hover:bg-slate-800/60 + hover:border-slate-600/50
- **リンク**: hover:text-slate-300 transition-colors

### トランジション

- **標準**: transition-all duration-200
- **色のみ**: transition-colors duration-200
- **スケール**: transition-transform duration-200

### アニメーション

#### ワードアニメーション

```css
@keyframes word-appear {
  0% { opacity: 0; transform: translateY(30px) scale(0.8); filter: blur(10px); }
  50% { opacity: 0.8; transform: translateY(10px) scale(0.95); filter: blur(2px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
```

#### グリッドライン描画

```css
@keyframes grid-draw {
  0% { stroke-dashoffset: 1000; opacity: 0; }
  50% { opacity: 0.3; }
  100% { stroke-dashoffset: 0; opacity: 0.15; }
}
```

#### パルスグロー

```css
@keyframes pulse-glow {
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.1); }
}
```

#### リップルエフェクト

```jsx
const [ripples, setRipples] = useState([]);

useEffect(() => {
  const handleClick = (e) => {
    const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 1000);
  };
  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
}, []);

{ripples.map(ripple => (
  <div
    key={ripple.id}
    className="ripple-effect"
    style={{ left: `${ripple.x}px`, top: `${ripple.y}px` }}
  ></div>
))}
```

## 8. レイアウトシステム

### DarkLayoutコンポーネント

すべてのページは`DarkLayout`コンポーネントでラップする:

```jsx
import { DarkLayout } from "@/components/dark-layout";

export default function Page() {
  return (
    <DarkLayout>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* コンテンツ */}
      </div>
    </DarkLayout>
  );
}
```

### コンテナ

- **最大幅**: max-w-7xl (ダッシュボード、一覧ページ)
- **中サイズ**: max-w-2xl sm:max-w-3xl lg:max-w-5xl (フォーム)
- **小サイズ**: max-w-md sm:max-w-lg lg:max-w-2xl (完了画面)
- **中央寄せ**: mx-auto
- **水平余白**: px-4 sm:px-6 lg:px-8

### グリッドシステム

- **1カラム**: grid-cols-1
- **2カラム**: grid-cols-1 md:grid-cols-2
- **3カラム**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- **間隔**: gap-4 sm:gap-6 lg:gap-8

## 9. レスポンシブデザイン

### ブレークポイント

- **sm**: 640px 以上
- **md**: 768px 以上
- **lg**: 1024px 以上
- **xl**: 1280px 以上
- **2xl**: 1536px 以上

### レスポンシブパターン

```jsx
{/* テキストサイズ */}
<h1 className="text-2xl sm:text-3xl lg:text-5xl">

{/* 余白 */}
<div className="p-4 sm:p-6 lg:p-8">

{/* 表示/非表示 */}
<span className="hidden sm:inline">ホーム</span>

{/* アイコンサイズ */}
<Home className="h-4 w-4 sm:h-5 sm:w-5" />
```

## 10. アクセシビリティ

### キーボード操作

- Tab順序の論理的な設定
- フォーカスインジケーターの視認性（3:1以上）
- Enterキーでのボタン操作

### スクリーンリーダー対応

- 適切なaria-label設定
- heading階層の正しい使用
- フォーム要素のlabel関連付け

### カラーコントラスト

- ダーク背景に対するテキストコントラスト4.5:1以上
- ボタンとボーダーのコントラスト3:1以上

## 11. 実装チェックリスト

### 必須項目（デザイン）

- [ ] DarkLayoutコンポーネントでラップ
- [ ] Slateカラーパレット使用（slate-50, 100, 200, 300, 400, 600, 700, 800, 900）
- [ ] font-extralight/font-light使用
- [ ] backdrop-blur-sm適用（カード、セクション）
- [ ] 透過度設定（/20, /30, /40, /50）
- [ ] レスポンシブ対応（sm:, lg:）
- [ ] トランジション設定（transition-all duration-200）

### 必須項目（アクセシビリティ）

- [ ] コントラスト比4.5:1以上
- [ ] 最小タッチターゲット44px x 44px
- [ ] キーボードナビゲーション対応
- [ ] フォーカス状態の視認性

### 推奨項目（UX向上）

- [ ] ホバーエフェクト（hover:scale-105）
- [ ] ローディング状態の実装
- [ ] マウス追従グラデーション
- [ ] リップルエフェクト

## 12. 禁止事項

### 絶対に避けるべき要素

- [ ] 明るい背景色の使用（bg-white, bg-gray-50など）
- [ ] 原色・ビビッドカラーの使用
- [ ] 重いフォントウェイト（font-bold, font-black）
- [ ] グラデーション背景の多用（背景以外）
- [ ] 過度なアニメーション
- [ ] 44px未満のタッチターゲット

### 制限的使用項目

- [ ] font-mediumは強調ボタンテキストのみ
- [ ] アニメーションは控えめに
- [ ] 装飾的要素は最小限に
- [ ] カスタムCSSは避け、Tailwindユーティリティクラスを使用

## 13. コンポーネント使用例

### ヘッダー

```jsx
<header className="border-b border-slate-700/50 backdrop-blur-sm">
  <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
    <div className="flex items-center justify-between">
      <Link href="/" className="text-2xl font-extralight tracking-tight text-slate-50 hover:text-slate-300 transition-colors">
        DropZone
      </Link>
      <Button className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105">
        <Plus className="mr-2 h-5 w-5" />
        新規プロジェクト
      </Button>
    </div>
  </div>
</header>
```

### セクション

```jsx
<div className="bg-slate-800/40 rounded-lg p-6 mb-6 border border-slate-700/50 backdrop-blur-sm">
  <h2 className="text-lg font-light text-slate-100 mb-4">
    プロジェクト情報
  </h2>
  <div className="space-y-2 text-sm font-light">
    <div className="flex justify-between">
      <span className="text-slate-400">プロジェクト名:</span>
      <span className="text-slate-200">{project.title}</span>
    </div>
  </div>
</div>
```

### 空状態

```jsx
<div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-12 text-center backdrop-blur-sm">
  <div className="w-24 h-24 mx-auto bg-slate-700/30 rounded-full flex items-center justify-center mb-8">
    <Inbox className="h-14 w-14 text-slate-400" />
  </div>
  <h3 className="text-3xl font-light mb-4 text-slate-100">
    まだプロジェクトがありません
  </h3>
  <p className="text-lg text-slate-400 mb-8 leading-relaxed font-light">
    「新規プロジェクト」ボタンをクリックして、最初のプロジェクトを作成しましょう
  </p>
</div>
```

---

**このデザインシステムは、DropZoneプロジェクトのすべてのUIコンポーネントに適用されます。**
**新規コンポーネントを作成する際は、このドキュメントを参照し、一貫性のあるデザインを維持してください。**
