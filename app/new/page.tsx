"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, ExternalLink, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewProjectPage() {
  const [projectName, setProjectName] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 32);
  };

  const handleGenerateUrl = () => {
    if (!projectName.trim()) return;

    const slug = generateSlug(projectName);
    const url = `https://dropzone.app/project/${slug}`;
    setGeneratedUrl(url);
  };

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      toast({
        title: "URLをコピーしました",
        description: "クライアントに共有できます",
      });
    }
  };

  const openPreview = () => {
    if (generatedUrl) {
      window.open(generatedUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/20 blur-md"></div>
            <Plus className="w-7 h-7 text-cyan-300 relative z-10" />
          </div>
          <h1 className="text-2xl font-bold text-cyan-300 mb-1">DropZone</h1>
        </div>

        <Card className="bg-gray-800 border-gray-700 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-white">新しい提出フォームを作成</CardTitle>
            <CardDescription className="text-gray-400">プロジェクト名を入力して、提出用URLを生成します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium text-gray-300">
                プロジェクト名 <span className="text-cyan-400">*</span>
              </label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="例: ロゴデザイン依頼"
                className="bg-gray-700 border-gray-600 text-gray-200 focus-visible:ring-cyan-500 focus-visible:border-cyan-500"
                required
              />
            </div>

            <Button
              onClick={handleGenerateUrl}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-900/20"
              disabled={!projectName.trim()}
            >
              フォームURLを生成
            </Button>

            <div className="mt-6 space-y-4">
              {generatedUrl ? (
                <div className="animate-in fade-in duration-300 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">提出用URL</label>
                    <div className="flex items-center">
                      <div className="bg-gray-900 text-sm rounded-l-md p-3 flex-1 truncate border border-r-0 border-gray-700">
                        {generatedUrl}
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className="bg-gray-800 hover:bg-gray-700 p-3 rounded-r-md border border-gray-700 transition-colors"
                        aria-label="URLをコピー"
                      >
                        <Copy className="w-5 h-5 text-cyan-300" />
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={openPreview}
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-cyan-300 hover:border-cyan-500/50 transition-all"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    プレビュー
                  </Button>
                </div>
              ) : (
                <div className="w-full bg-gray-700 rounded-md p-[2px]">
                  <div className="w-full bg-gray-800 rounded-[5px] border-2 border-gray-700 shadow-lg">
                    <div className="py-2 px-4 flex items-center justify-center gap-2 text-gray-500 cursor-not-allowed">
                      <ExternalLink className="w-4 h-4" />
                      プレビュー
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
