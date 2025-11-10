"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { DarkLayout } from "@/components/dark-layout";

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      {/* ヘッダー */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-extralight tracking-tight text-slate-50 hover:text-slate-300 transition-colors">
              DropZone
            </Link>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 hover:text-slate-50 font-light px-3 py-2 sm:px-6 sm:py-3 rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              戻る
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-xl sm:max-w-2xl lg:max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="space-y-2 sm:space-y-3 pb-4 sm:pb-6 p-4 sm:p-6 lg:p-8">
              <CardTitle className="text-2xl sm:text-3xl lg:text-5xl font-extralight text-center text-slate-50 tracking-tight">
                新規プロジェクト作成
              </CardTitle>
              <CardDescription className="text-sm sm:text-base lg:text-xl text-center leading-relaxed text-slate-300 font-light">
                プロジェクト情報を入力して、専用の提出フォームを発行しましょう
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-8">
                {/* プロジェクト名 */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm sm:text-base lg:text-xl font-light text-slate-200">
                    プロジェクト名 <span className="text-slate-400">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="例: 新規デザインプロジェクト"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="h-10 sm:h-12 lg:h-16 text-sm sm:text-base lg:text-xl bg-slate-700/30 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>

                {/* 依頼者名 */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm sm:text-base lg:text-xl font-light text-slate-200">
                    依頼者名 <span className="text-slate-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="例: 山田 太郎"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-10 sm:h-12 lg:h-16 text-sm sm:text-base lg:text-xl bg-slate-700/30 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>

                {/* 依頼者メールアドレス */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base lg:text-xl font-light text-slate-200">
                    依頼者メールアドレス <span className="text-slate-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="例: yamada@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 sm:h-12 lg:h-16 text-sm sm:text-base lg:text-xl bg-slate-700/30 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>

                {/* 送信ボタン */}
                <div className="pt-4 sm:pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 rounded-lg transition-all duration-200 text-base sm:text-lg lg:text-2xl hover:scale-105"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 animate-spin" />
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
