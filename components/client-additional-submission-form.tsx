"use client";

import type React from "react";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, User, Mail, Calendar, Clock, ArrowLeft, History, Upload, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUploader } from "./file-uploader";
import { DropZoneLogo } from "./dropzone-logo";
import { useUploadThing } from "@/lib/uploadthing";
import { generateRandomSlug } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ClientAdditionalSubmissionFormProps {
  projectSlug: string;
  originalSlug: string;
  originalName?: string;
  originalEmail?: string;
  showHistoryButton?: boolean;
}

export function ClientAdditionalSubmissionForm({
  projectSlug,
  originalSlug,
  originalName,
  originalEmail,
  showHistoryButton = true,
}: ClientAdditionalSubmissionFormProps) {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [figmaUrl, setFigmaUrl] = useState("");
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [name, setName] = useState(originalName || "");
  const [email, setEmail] = useState(originalEmail || "");
  const [submissionTime, setSubmissionTime] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const isDarkMode = true; // 常にダークモード

  // UploadThing hook for file uploads
  const { startUpload, isUploading: isUploadingFile } = useUploadThing("imageUploader", {
    onClientUploadComplete: async (res) => {
      console.log("Upload completed:", res);

      if (res && res.length > 0) {
        await handleCreateSubmission(res);
      } else {
        setIsUploading(false);
      }
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setErrorMessage("ファイルのアップロードに失敗しました。もう一度お試しください。");
      setIsUploading(false);
    },
  });

  // 提出レコードを作成する共通関数
  const handleCreateSubmission = async (uploadedFiles?: any[]) => {
    try {
      // 提出データの準備
      const submissionData = {
        name,
        email,
        slug: originalSlug, // URLから受け取ったslugをそのまま使用
        projectSlug: originalSlug, // project_slugとしても同じslugを使用
        submittedAt: new Date().toISOString(),
        files: uploadedFiles
          ? uploadedFiles.map((file: any) => ({
              name: file.fileName || file.name,
              url: file.ufsUrl || file.fileUrl || file.url, // v9互換性対応
            }))
          : [],
        figmaLinks: figmaUrl ? [figmaUrl] : [],
      };

      // Supabaseに保存
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (response.ok) {
        // 正常に保存された場合は元のプロジェクトビューページにリダイレクト
        router.push(`/project/${originalSlug}/view`);
      } else {
        // エラー処理
        console.error("Failed to create submission:", data.error);
        setErrorMessage(data.error || "提出の保存に失敗しました。もう一度お試しください。");
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Error in submission creation:", error);
      setErrorMessage("予期せぬエラーが発生しました。もう一度お試しください。");
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMessage(""); // エラーメッセージをリセット

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
      // Upload files to UploadThing if they exist
      if (logoFiles.length > 0) {
        await startUpload(logoFiles);
      } else {
        // ファイルなしの場合は直接提出
        await handleCreateSubmission();
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      setErrorMessage("フォーム送信中にエラーが発生しました。もう一度お試しください。");
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
    backButton: "border-indigo-400/70 text-indigo-300 hover:bg-indigo-800/30 hover:text-indigo-200",
    text: "text-gray-200",
    mutedText: "text-gray-300",
    gradientText: "bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300",
    errorAlert: "border-red-500/30 bg-red-950/30 text-red-200",
    originalHighlight: "font-medium text-indigo-300",
  };

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
              <div className="flex items-center justify-between mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/project/${originalSlug}/view`)}
                  className={`${themeClasses.backButton} border-dashed`}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> 戻る
                </Button>

                {showHistoryButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/project/${originalSlug}/view`)}
                    className={`${themeClasses.backButton} border-dashed`}
                  >
                    <History className="h-4 w-4 mr-1" /> 履歴を確認
                  </Button>
                )}
              </div>
              <div className="flex flex-col items-center space-y-3 mb-2">
                <DropZoneLogo isDark={true} />
                <CardTitle className="text-2xl font-light tracking-tight mt-2">追加提出フォーム</CardTitle>
              </div>
              <CardDescription className="text-center space-y-2">
                <span className={themeClasses.gradientText}>このプロジェクトへの追加提出です</span>
                {(originalName || originalEmail) && (
                  <p className="text-sm mt-1 text-gray-300">
                    {originalName && (
                      <>
                        前回の提出者名: <span className={themeClasses.originalHighlight}>{originalName}</span>
                        <br />
                      </>
                    )}
                    {originalEmail && (
                      <>
                        前回のメールアドレス: <span className={themeClasses.originalHighlight}>{originalEmail}</span>
                        <br />
                      </>
                    )}
                    <span className="text-xs">※前回と同じメールアドレスを使用してください</span>
                  </p>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorMessage && (
                <Alert className={`mb-6 ${themeClasses.errorAlert}`}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>エラーが発生しました</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

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
                  disabled={isUploading || isUploadingFile || !name || !email}
                >
                  {isUploading || isUploadingFile ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                      アップロード中...
                    </span>
                  ) : (
                    "追加提出する"
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
              <h2 className={`text-2xl font-medium mb-3 ${themeClasses.text}`}>追加提出完了</h2>
              <p className={`text-center mb-6 ${themeClasses.mutedText}`}>
                素材の追加提出を受け付けました。ありがとうございます！
              </p>

              <div className="flex flex-col gap-2 w-full max-w-[300px]">
                <div className={`${themeClasses.section} p-3 rounded-lg`}>
                  <p className={`text-xs ${themeClasses.mutedText}`}>提出者</p>
                  <p className={`${themeClasses.text}`}>{name}</p>
                </div>
                <div className={`${themeClasses.section} p-3 rounded-lg`}>
                  <p className={`text-xs ${themeClasses.mutedText}`}>メールアドレス</p>
                  <p className={`${themeClasses.text}`}>{email}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`${themeClasses.section} p-3 rounded-lg`}>
                    <p className={`text-xs ${themeClasses.mutedText} flex items-center gap-1`}>
                      <Calendar className="h-3 w-3" />
                      提出日
                    </p>
                    <p className={`${themeClasses.text}`}>{submissionDate}</p>
                  </div>
                  <div className={`${themeClasses.section} p-3 rounded-lg`}>
                    <p className={`text-xs ${themeClasses.mutedText} flex items-center gap-1`}>
                      <Clock className="h-3 w-3" />
                      時間
                    </p>
                    <p className={`${themeClasses.text}`}>{submissionTime}</p>
                  </div>
                </div>
              </div>

              <Button
                className={`mt-8 ${themeClasses.button} text-white`}
                onClick={() => router.push(`/project/${originalSlug}/view`)}
              >
                提出一覧を確認する
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
