"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { DarkLayout } from "@/components/dark-layout";
import { UserButton, useUser } from "@clerk/nextjs";

export default function NewProjectPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ログインユーザーの情報を自動入力
  useEffect(() => {
    if (isLoaded && user) {
      // フルネームを取得（firstName + lastName、なければusername）
      const fullName = user.fullName || user.username || "";
      // メールアドレスを取得
      const userEmail = user.primaryEmailAddress?.emailAddress || "";

      setName(fullName);
      setEmail(userEmail);
    }
  }, [isLoaded, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          name,
          email,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/project/${data.slug}/created`);
      } else {
        console.error("プロジェクト作成に失敗しました");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <DarkLayout>
      {/* ヘッダー - LPと同じデザイン */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="w-full flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
              <Image
                src="/dropzone-logo.png"
                alt="DropZone"
                width={180}
                height={50}
                className="h-10 w-auto"
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-base text-muted-foreground transition-colors hover:text-foreground">
                ダッシュボード
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="text-base cursor-default hover:bg-transparent">
              🎉 お試し期間実施中！
            </Button>
            <Button
              onClick={() => router.push("/dashboard/new")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-base"
            >
              <Plus className="mr-2 h-4 w-4" />
              新規プロジェクト
            </Button>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9"
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-xl sm:max-w-2xl lg:max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-4 sm:pb-5 p-4 sm:p-5 lg:p-6">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-extralight text-center text-slate-50 tracking-tight">
                新規プロジェクト作成
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base text-center leading-relaxed text-slate-300 font-light">
                プロジェクト情報を入力して、専用の提出フォームを発行しましょう
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* プロジェクト名 */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs sm:text-sm lg:text-base font-light text-slate-200">
                    プロジェクト名 <span className="text-slate-400">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="例: 新規デザインプロジェクト"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base bg-slate-700/30 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500"
                  />
                  <p className="text-xs text-slate-400 font-light">
                    依頼者情報はログイン情報から自動的に設定されます
                  </p>
                </div>

                {/* 送信ボタン */}
                <div className="pt-3 sm:pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-4 rounded-lg transition-all duration-200 text-sm sm:text-base lg:text-lg hover:scale-105"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        作成中...
                      </>
                    ) : (
                      "プロジェクトを作成"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </DarkLayout>
  );
}
