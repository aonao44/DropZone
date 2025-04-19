// middleware.ts
import { clerkMiddleware, redirectToSignIn } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default clerkMiddleware({
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)"],
  // Add custom beforeAuth to handle exact protected routes
  beforeAuth: (req: NextRequest) => {
    return NextResponse.next();
  },
  afterAuth: (auth, req) => {
    // Handle protected routes
    const url = new URL(req.url);
    const isProtectedRoute = url.pathname === "/submit" ||
      /^\/project\/[^\/]+\/submit/.test(url.pathname);
    
    if (isProtectedRoute && !auth.userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/"],
};
