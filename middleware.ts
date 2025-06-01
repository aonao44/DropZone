import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/submit",
  "/project/*/submit"
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/"],
};



## 現在の設定状況

✅ **ドメイン**: `drop-zone-tac.vercel.app`
✅ **環境**: Production環境に接続
❌ **問題**: 「Connect to an environment」が選択されている

## 問題の原因

この設定では、ドメインが**環境全体**に紐付けられているため、どの特定のデプロイメントを表示するかが曖昧になっています。これが404エラー（`DEPLOYMENT_NOT_FOUND`）の原因です。

## 解決方法

### 現在の設定のまま進める場合

1. **「Save」ボタンをクリック**して現在の設定を保存
2. しばらく待ってから（5-10分）再度アクセスしてみる
3. Vercelが自動的に最新の成功デプロイメントに紐付ける

### より確実な解決方法（推奨）

先ほど提案したミドルウェアの修正を実行：
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Clerkミドルウェアを一時的に無効化
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// const isProtectedRoute = createRouteMatcher([
//   "/submit",
//   "/project/*/submit"
// ]);

// 一時的なミドルウェア（認証なし）
export default function middleware(req: NextRequest) {
  // すべてのリクエストを通す
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/"],
};
```
