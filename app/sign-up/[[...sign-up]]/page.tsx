// /app/sign-up/[[...sign-up]]/page.tsx
// Clerk認証は開発中のため一時的に無効化
// import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Dropzone",
  description: "Create a new account to start using Dropzone",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">サインアップ</h1>
        <p className="text-gray-700 mb-4">
          Clerk認証は現在開発中です。
        </p>
        <p className="text-sm text-gray-600">
          認証機能は後ほど実装されます。
        </p>
      </div>
    </div>
  );
}
