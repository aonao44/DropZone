"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, User, Mail, Calendar, Clock, ArrowLeft, History, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUploader } from "./file-uploader";
import { DropZoneLogo } from "./dropzone-logo";
import { SubmissionLogs } from "./submission-logs";
import { useUploadThing } from "@/lib/uploadthing";
import { generateRandomSlug } from "@/lib/utils";
import { SubmissionFile } from "@/lib/types";

export function ClientSubmissionForm({
  projectSlug = "",
  showHistoryButton = true,
}: {
  projectSlug?: string;
  showHistoryButton?: boolean;
}) {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [figmaUrl, setFigmaUrl] = useState("");
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submissionTime, setSubmissionTime] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [viewingLogs, setViewingLogs] = useState(false);
  const isDarkMode = true; // 常にダークモード

  // slugを状態として保持
  const [submissionSlug, setSubmissionSlug] = useState<string>("");

  // コンポーネントのマウント時とprojectSlugの変更時にslugを設定
  useEffect(() => {
    // 追加提出の場合（projectSlugが指定されている場合）
    if (projectSlug && projectSlug.trim() !== "") {
      setSubmissionSlug(projectSlug);
    }
    // 新規提出の場合（projectSlugが指定されていない場合）
    else {
      setSubmissionSlug(generateRandomSlug());
    }
  }, [projectSlug]);

  // UploadThing hook for file uploads
  const { startUpload, isUploading: isUploadingFile } = useUploadThing("imageUploader", {
    onClientUploadComplete: async (res) => {
      console.log("Upload completed:", res);

      if (res && res.length > 0) {
        // slgが空でないことを確認
        const slug = submissionSlug || generateRandomSlug();

        // Create submission record in Supabase
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            projectSlug: slug,
            slug: slug,
            submittedAt: new Date().toISOString(),
            files: res.map((file: any) => ({
              name: file.fileName || file.name,
              url: file.ufsUrl || file.fileUrl || file.url, // v9互換性対応
            })),
            figmaLinks: figmaUrl ? [figmaUrl] : [],
          }),
        });

        if (response.ok) {
          // Redirect to view page
          router.push(`/project/${slug}/view`);
        } else {
          console.error("Failed to create submission:", await response.text());
          setIsUploading(false);
        }
      } else {
        setIsUploading(false);
      }
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setIsUploading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    // Record submission time
    const now = new Date();
    const formattedDate = now.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setSubmissionDate(formattedDate);
    setSubmissionTime(formattedTime);

    try {
      // slugが空でないことを確認
      const slug = submissionSlug || generateRandomSlug();

      // Upload files to UploadThing if they exist
      if (logoFiles.length > 0) {
        await startUpload(logoFiles);
      } else {
        // If no files, just create a submission record
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            projectSlug: slug,
            slug: slug,
            submittedAt: new Date().toISOString(),
            files: [],
            figmaLinks: figmaUrl ? [figmaUrl] : [],
          }),
        });

        if (response.ok) {
          // Redirect to view page
          router.push(`/project/${slug}/view`);
        } else {
          console.error("Failed to create submission:", await response.text());
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      setIsUploading(false);
    }
  };

  // Determine theme-based classes - 常にダークモード
  const themeClasses = {
    card: "border-0 shadow-xl bg-card/95 backdrop-blur-sm",
    section: "bg-gray-700/60 border-gray-600/70",
    input:
      "border-gray-600/70 bg-input focus-visible:ring-indigo-400 focus-visible:border-indigo-500 placeholder:text-gray-400",
    button: "bg-gradient-to-r from-indigo-500/90 to-purple-500/90 hover:from-indigo-400 hover:to-purple-400",
    separator: "bg-gray-600/50",
    logCard: "bg-gray-700/60 border-gray-600/70",
    backButton: "border-indigo-400/70 text-indigo-300 hover:bg-indigo-800/30 hover:text-indigo-200",
    logButton: "border-indigo-400/70 text-indigo-300 hover:bg-indigo-800/30 hover:text-indigo-200",
    themeIcon: "text-indigo-300",
    text: "text-gray-200",
    mutedText: "text-gray-300",
  };

  if (viewingLogs) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <Card className={themeClasses.card}>
          <div className="absolute inset-0 bg-dot-pattern opacity-5 rounded-lg pointer-events-none"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingLogs(false)}
                className={`${themeClasses.backButton} border-dashed`}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> 戻る
              </Button>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <DropZoneLogo isDark={true} />
              <CardTitle className="text-2xl font-light tracking-tight">提出ログ一覧</CardTitle>
            </div>
            <CardDescription className="text-center">過去の素材提出履歴を確認できます</CardDescription>
          </CardHeader>
          <CardContent>
            <SubmissionLogs isDark={true} />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Card className={themeClasses.card}>
            <div className="absolute inset-0 bg-dot-pattern opacity-5 rounded-lg pointer-events-none"></div>
            <CardHeader className="pb-2">
              <div className="flex flex-col items-center space-y-3 mb-2">
                <DropZoneLogo isDark={true} />
                <CardTitle className="text-2xl font-light tracking-tight mt-2">素材提出フォーム</CardTitle>
              </div>
              <CardDescription className="text-center">
                プロジェクトに必要な素材をアップロードしてください
              </CardDescription>
              {showHistoryButton && (
                <div className="flex justify-center mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingLogs(true)}
                    className={`${themeClasses.logButton} border-dashed`}
                  >
                    <History className="h-4 w-4 mr-1" /> 履歴を確認
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 提出者情報セクション */}
                <div className={`space-y-4 rounded-lg ${themeClasses.section} p-4 border border-dashed`}>
                  <h3 className={`text-sm font-medium flex items-center gap-1.5 ${themeClasses.text}`}>
                    <User className="h-3.5 w-3.5" />
                    提出者情報
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="name" className={`text-sm font-normal ${themeClasses.mutedText}`}>
                      お名前 <span className="text-indigo-300">*</span>
                    </Label>
                    <div className="relative group">
                      <Input
                        id="name"
                        type="text"
                        placeholder="山田 太郎"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={`transition-all ${themeClasses.input} pr-4`}
                      />
                      <div
                        className={`absolute inset-0 -z-10 rounded-md transition-all group-hover:blur-sm group-focus-within:blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-gradient-to-r from-indigo-800/50 via-purple-800/50 to-blue-800/50`}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className={`text-sm font-normal ${themeClasses.mutedText} flex items-center gap-1.5`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      メールアドレス <span className="text-indigo-300">*</span>
                    </Label>
                    <div className="relative group">
                      <Input
                        id="email"
                        type="email"
                        placeholder="yamada@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`transition-all ${themeClasses.input} pr-4`}
                      />
                      <div
                        className={`absolute inset-0 -z-10 rounded-md transition-all group-hover:blur-sm group-focus-within:blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-gradient-to-r from-indigo-800/50 via-purple-800/50 to-blue-800/50`}
                      ></div>
                    </div>
                  </div>
                </div>

                <Separator className={themeClasses.separator} />

                {/* ファイルアップロードセクション */}
                <div className={`space-y-4 rounded-lg ${themeClasses.section} p-4 border border-dashed`}>
                  <h3 className={`text-sm font-medium ${themeClasses.text} flex items-center gap-1.5`}>
                    <Upload className="h-3.5 w-3.5" />
                    ファイルアップロード <span className={`text-xs ${themeClasses.mutedText}`}>(最大10ファイル)</span>
                  </h3>
                  <FileUploader
                    id="logo-upload"
                    files={logoFiles}
                    onFilesChange={setLogoFiles}
                    accept="image/*"
                    isDark={true}
                    multiple={true}
                    maxFiles={10}
                  />
                </div>

                {/* Figmaリンクセクション */}
                <div className="space-y-2">
                  <Label htmlFor="figma-url" className={`text-sm font-normal ${themeClasses.mutedText}`}>
                    Figmaリンク <span className={`text-xs ${themeClasses.mutedText}`}>(任意)</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      id="figma-url"
                      type="url"
                      placeholder="https://figma.com/file/..."
                      value={figmaUrl}
                      onChange={(e) => setFigmaUrl(e.target.value)}
                      className={`transition-all ${themeClasses.input} pr-4`}
                    />
                    <div
                      className={`absolute inset-0 -z-10 rounded-md transition-all group-hover:blur-sm group-focus-within:blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-gradient-to-r from-indigo-800/50 via-purple-800/50 to-blue-800/50`}
                    ></div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className={`w-full ${themeClasses.button} text-white hover:text-white py-6`}
                  disabled={isUploading || isUploadingFile || !name}
                >
                  {isUploading || isUploadingFile ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                      アップロード中...
                    </span>
                  ) : (
                    "送信する"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Card className={themeClasses.card}>
            <div className="absolute inset-0 bg-dot-pattern opacity-5 rounded-lg pointer-events-none"></div>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="bg-indigo-500/10 rounded-full p-4 mb-6">
                <CheckCircle className="h-12 w-12 text-indigo-400" />
              </div>
              <h2 className={`text-2xl font-medium mb-3 ${themeClasses.text}`}>提出完了</h2>
              <p className={`text-center mb-6 ${themeClasses.mutedText}`}>
                素材の提出を受け付けました。ありがとうございます！
              </p>

              <div className="flex flex-col gap-2 w-full max-w-[300px]">
                <div className={`${themeClasses.logCard} p-3 rounded-lg`}>
                  <p className={`text-xs ${themeClasses.mutedText}`}>提出者</p>
                  <p className={`${themeClasses.text}`}>{name}</p>
                </div>
                {email && (
                  <div className={`${themeClasses.logCard} p-3 rounded-lg`}>
                    <p className={`text-xs ${themeClasses.mutedText}`}>メールアドレス</p>
                    <p className={`${themeClasses.text}`}>{email}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className={`${themeClasses.logCard} p-3 rounded-lg`}>
                    <p className={`text-xs ${themeClasses.mutedText} flex items-center gap-1`}>
                      <Calendar className="h-3 w-3" />
                      提出日
                    </p>
                    <p className={`${themeClasses.text}`}>{submissionDate}</p>
                  </div>
                  <div className={`${themeClasses.logCard} p-3 rounded-lg`}>
                    <p className={`text-xs ${themeClasses.mutedText} flex items-center gap-1`}>
                      <Clock className="h-3 w-3" />
                      時間
                    </p>
                    <p className={`${themeClasses.text}`}>{submissionTime}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
