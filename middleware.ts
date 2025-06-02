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
