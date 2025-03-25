"use client";

import type React from "react";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, User, Mail, Calendar, Clock, ArrowLeft, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUploader } from "./file-uploader";
import { DropZoneLogo } from "./dropzone-logo";
import { SubmissionLogs } from "./submission-logs";

export function ClientSubmissionForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [figmaUrl, setFigmaUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submissionTime, setSubmissionTime] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [viewingLogs, setViewingLogs] = useState(false);
  const isDarkMode = true; // 常にダークモード

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    // Here you would typically handle the actual submission to your backend
    console.log({
      name,
      email,
      logoFile,
      figmaUrl,
      submissionTime: `${formattedDate} ${formattedTime}`,
    });

    // Show success message
    setIsSubmitted(true);

    // Reset form after 8 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setName("");
      setEmail("");
      setFigmaUrl("");
      setLogoFile(null);
    }, 8000);
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
                      メールアドレス <span className={`text-xs ${themeClasses.mutedText}`}>(任意)</span>
                    </Label>
                    <div className="relative group">
                      <Input
                        id="email"
                        type="email"
                        placeholder="yamada@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`transition-all ${themeClasses.input} pr-4`}
                      />
                      <div
                        className={`absolute inset-0 -z-10 rounded-md transition-all group-hover:blur-sm group-focus-within:blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-gradient-to-r from-indigo-800/50 via-purple-800/50 to-blue-800/50`}
                      ></div>
                    </div>
                  </div>
                </div>

                <Separator className={themeClasses.separator} />

                {/* 素材アップロードセクション */}
                <div className="space-y-4">
                  <Label htmlFor="logo-upload" className={`text-sm font-medium ${themeClasses.text}`}>
                    素材ファイル <span className="text-indigo-300">*</span>
                  </Label>
                  <FileUploader
                    id="logo-upload"
                    file={logoFile}
                    onFileChange={setLogoFile}
                    accept="image/*"
                    isDark={true}
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
                  disabled={!name || !logoFile}
                  type="submit"
                  className={`w-full ${themeClasses.button} font-normal text-white`}
                >
                  提出する
                </Button>

                <div className="pt-2 flex justify-center">
                  <Button
                    variant="link"
                    size="sm"
                    className={`text-xs text-indigo-300`}
                    onClick={() => setViewingLogs(true)}
                  >
                    <History className="h-3 w-3 mr-1" />
                    過去の提出履歴を見る
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Card className={themeClasses.card}>
            <div className="absolute inset-0 bg-dot-pattern opacity-5 rounded-lg pointer-events-none"></div>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-indigo-500/20"
              >
                <CheckCircle className="h-8 w-8 text-indigo-300" strokeWidth={1.5} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className={`text-xl font-medium mb-2 ${themeClasses.text}`}
              >
                提出が完了しました
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className={`text-center mb-6 ${themeClasses.mutedText}`}
              >
                素材の提出ありがとうございます
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className={`w-full p-4 rounded-lg ${themeClasses.section} flex flex-col space-y-2`}
              >
                <div className="flex items-center">
                  <Calendar className={`h-4 w-4 mr-2 ${themeClasses.mutedText}`} />
                  <span className={`text-sm ${themeClasses.mutedText}`}>提出日: {submissionDate}</span>
                </div>
                <div className="flex items-center">
                  <Clock className={`h-4 w-4 mr-2 ${themeClasses.mutedText}`} />
                  <span className={`text-sm ${themeClasses.mutedText}`}>提出時間: {submissionTime}</span>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
