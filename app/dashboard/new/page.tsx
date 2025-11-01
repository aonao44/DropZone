"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropZoneLogo } from "@/components/dropzone-logo";
import { ArrowLeft, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b border-border">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
          <div className="flex items-center justify-between">
            <DropZoneLogo isDark={true} />
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="border-glow font-semibold px-3 py-2 sm:px-6 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base hover:glow-blue-sm"
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
          <Card className="border-glow bg-card glow-blue-sm">
            <CardHeader className="space-y-2 sm:space-y-3 pb-4 sm:pb-6 p-4 sm:p-6 lg:p-8">
              <CardTitle className="text-2xl sm:text-3xl lg:text-5xl font-bold text-center">
                新規プロジェクト作成
              </CardTitle>
              <CardDescription className="text-sm sm:text-base lg:text-xl text-center leading-relaxed">
                プロジェクト情報を入力して、専用の提出フォームを発行しましょう
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-8">
                {/* プロジェクト名 */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm sm:text-base lg:text-xl font-semibold">
                    プロジェクト名 <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="例: 新規デザインプロジェクト"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="h-10 sm:h-12 lg:h-16 text-sm sm:text-base lg:text-xl"
                  />
                </div>

                {/* 依頼者名 */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm sm:text-base lg:text-xl font-semibold">
                    依頼者名 <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="例: 山田 太郎"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-10 sm:h-12 lg:h-16 text-sm sm:text-base lg:text-xl"
                  />
                </div>

                {/* 依頼者メールアドレス */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base lg:text-xl font-semibold">
                    依頼者メールアドレス <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="例: yamada@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 sm:h-12 lg:h-16 text-sm sm:text-base lg:text-xl"
                  />
                </div>

                {/* 送信ボタン */}
                <div className="pt-4 sm:pt-6">
                  <Button
                    type="submit"
                    className="w-full gradient-primary font-semibold px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 rounded-xl glow-blue-sm hover:glow-blue transition-all duration-200 text-base sm:text-lg lg:text-2xl"
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
    </div>
  );
}
