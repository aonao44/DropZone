"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropZoneLogo } from "@/components/dropzone-logo";
import { generateRandomSlug } from "@/lib/utils";

export default function Home() {
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
        router.push(`/submit/${data.slug}`);
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
    <div className="min-h-screen flex items-center w-full max-w-none bg-gray-900 px-4">
      <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm w-full max-w-5xl mx-auto">
        <div className="absolute inset-0 bg-dot-pattern opacity-5 rounded-lg pointer-events-none"></div>
        <CardHeader className="pb-2">
          <div className="flex flex-col items-center space-y-3 mb-2">
            <DropZoneLogo isDark={true} />
            <CardTitle className="text-4xl font-light tracking-tight mt-2">プロジェクト発行</CardTitle>
          </div>
          <CardDescription className="text-center text-lg">
            素材提出フォームを作成するためにプロジェクト情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 rounded-lg bg-gray-700/60 border border-dashed border-gray-600/70 p-4">
              <h3 className="text-xl font-medium flex items-center gap-1.5 text-gray-200">プロジェクト情報</h3>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lg font-normal text-gray-300">
                  プロジェクト名 <span className="text-indigo-300">*</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="title"
                    type="text"
                    placeholder="新規デザインプロジェクト"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="transition-all border-gray-600/70 bg-input focus-visible:ring-indigo-400 focus-visible:border-indigo-500 placeholder:text-gray-400 pr-4 text-xl h-14"
                  />
                  <div className="absolute inset-0 -z-10 rounded-md transition-all group-hover:blur-sm group-focus-within:blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-gradient-to-r from-indigo-800/50 via-purple-800/50 to-blue-800/50"></div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg font-normal text-gray-300">
                  依頼者名 <span className="text-indigo-300">*</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="name"
                    type="text"
                    placeholder="山田 太郎"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="transition-all border-gray-600/70 bg-input focus-visible:ring-indigo-400 focus-visible:border-indigo-500 placeholder:text-gray-400 pr-4 text-xl h-14"
                  />
                  <div className="absolute inset-0 -z-10 rounded-md transition-all group-hover:blur-sm group-focus-within:blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-gradient-to-r from-indigo-800/50 via-purple-800/50 to-blue-800/50"></div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg font-normal text-gray-300">
                  依頼者メールアドレス <span className="text-indigo-300">*</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="yamada@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all border-gray-600/70 bg-input focus-visible:ring-indigo-400 focus-visible:border-indigo-500 placeholder:text-gray-400 pr-4 text-xl h-14"
                  />
                  <div className="absolute inset-0 -z-10 rounded-md transition-all group-hover:blur-sm group-focus-within:blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-gradient-to-r from-indigo-800/50 via-purple-800/50 to-blue-800/50"></div>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500/90 to-purple-500/90 hover:from-indigo-400 hover:to-purple-400 text-white hover:text-white py-8 text-2xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? "送信中..." : "プロジェクト作成"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
