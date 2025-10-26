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
        router.push(`/project/${data.slug}/submit`);
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
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <DropZoneLogo isDark={false} />
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8 sm:py-16">
        <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white border border-gray-300 rounded-2xl shadow-md">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 text-center">
                新規プロジェクト作成
              </CardTitle>
              <CardDescription className="text-base text-gray-700 text-center leading-relaxed">
                プロジェクト情報を入力して、専用の提出フォームを発行しましょう
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* プロジェクト名 */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold text-gray-900">
                    プロジェクト名 <span className="text-blue-700">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="例: 新規デザインプロジェクト"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="h-12 border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-20 focus-visible:border-blue-500 text-base"
                  />
                </div>

                {/* 依頼者名 */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold text-gray-900">
                    依頼者名 <span className="text-blue-700">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="例: 山田 太郎"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12 border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-20 focus-visible:border-blue-500 text-base"
                  />
                </div>

                {/* 依頼者メールアドレス */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold text-gray-900">
                    依頼者メールアドレス <span className="text-blue-700">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="例: yamada@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-20 focus-visible:border-blue-500 text-base"
                  />
                </div>

                {/* 送信ボタン */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-500 text-white font-semibold px-6 py-4 rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
