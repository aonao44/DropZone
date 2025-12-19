"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, User, Mail, Calendar, Clock, ArrowLeft, Upload, AlertCircle, FileText, MessageSquare, X, ZoomIn, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { FileUploader } from "./file-uploader";
import { SubmissionLogs } from "./submission-logs";
import { SlotUploadCard } from "./SlotUploadCard";
import { useUploadThing } from "@/lib/uploadthing";
import { generateRandomSlug } from "@/lib/utils";
import { SubmissionFile, FileReview, ReviewStatus, ProjectSlot, SlotFile } from "@/lib/types";
import { createClient } from "@supabase/supabase-js"; // ←こっちを復活

// Clerk認証は開発中のため一時的に無効化
// import { useUser } from "@clerk/nextjs";

type ProjectInfo = {
  title: string;
  requesterName: string;
  requesterEmail: string;
  createdAt: string;
};

export function ClientSubmissionForm({
  projectSlug = "",
  showHistoryButton = true,
  projectInfo,
  previousSubmitter,
  slots = [],
}: {
  projectSlug?: string;
  showHistoryButton?: boolean;
  projectInfo?: ProjectInfo;
  previousSubmitter?: { name: string; email: string } | null;
  slots?: ProjectSlot[];
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
  const [existingFileCount, setExistingFileCount] = useState(0);
  const [showFileLimitError, setShowFileLimitError] = useState(false);
  const [submittedFilesWithStatus, setSubmittedFilesWithStatus] = useState<{
    file: SubmissionFile;
    review_status: ReviewStatus;
    review_comment?: string;
    submissionId: string;
    fileIndex: number;
  }[]>([]);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    file: SubmissionFile;
    submissionId: string;
    fileIndex: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isDarkMode = true; // 常にダークモード

  // スロットベースのファイル管理
  const [slotFiles, setSlotFiles] = useState<Record<string, File[]>>({});
  const [slotDeleteTarget, setSlotDeleteTarget] = useState<{
    slotId: string;
    fileId: string;
    fileName: string;
  } | null>(null);
  const hasSlots = slots.length > 0;

  // React Strict Modeによる重複実行を防ぐフラグ
  const isSubmittingRef = useRef(false);

  // LocalStorage key for submitter information
  const SUBMITTER_INFO_KEY = 'dropzone_submitter_info';

  // Initialize Supabase client (client-side)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  // Load submitter information from localStorage or previousSubmitter prop
  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem(SUBMITTER_INFO_KEY);
      if (savedInfo) {
        const { name: savedName, email: savedEmail } = JSON.parse(savedInfo);
        if (savedName) setName(savedName);
        if (savedEmail) setEmail(savedEmail);
      } else if (previousSubmitter) {
        // localStorageにない場合はpreviousSubmitterを使用
        if (previousSubmitter.name) setName(previousSubmitter.name);
        if (previousSubmitter.email) setEmail(previousSubmitter.email);
      }
    } catch (error) {
      console.error('Error loading submitter information from localStorage:', error);
      // エラー時はpreviousSubmitterにフォールバック
      if (previousSubmitter) {
        if (previousSubmitter.name) setName(previousSubmitter.name);
        if (previousSubmitter.email) setEmail(previousSubmitter.email);
      }
    }
  }, [previousSubmitter]);

  // 既存ファイル数とステータスを取得する関数
  const fetchExistingFilesWithStatus = async (slug: string) => {
    if (!slug || slug.trim() === "") return;

    try {
      // submissionsとfile_reviewsを取得
      const { data: submissions, error } = await supabase
        .from("submissions")
        .select("id, files")
        .eq("project_slug", slug);

      if (error) {
        console.error("Error fetching submissions:", error);
        return;
      }

      // 全ファイルを収集
      const allFiles: { file: SubmissionFile; submissionId: string; fileIndex: number }[] = [];
      submissions.forEach((submission) => {
        if (Array.isArray(submission.files)) {
          submission.files.forEach((file: SubmissionFile, index: number) => {
            allFiles.push({ file, submissionId: submission.id, fileIndex: index });
          });
        }
      });

      setExistingFileCount(allFiles.length);

      // file_reviewsからステータスを取得
      const submissionIds = submissions.map((s) => s.id);
      if (submissionIds.length > 0) {
        const { data: reviews, error: reviewError } = await supabase
          .from("file_reviews")
          .select("*")
          .in("submission_id", submissionIds);

        if (reviewError) {
          console.error("Error fetching file reviews:", reviewError);
        }

        // ファイルとステータスをマッピング（削除済みを除外）
        const filesWithStatus = allFiles
          .map(({ file, submissionId, fileIndex }) => {
            const review = reviews?.find(
              (r) => r.submission_id === submissionId && r.file_index === fileIndex
            );
            // 削除済みファイルは除外
            if (review?.is_deleted) return null;
            return {
              file,
              review_status: (review?.review_status || "pending") as ReviewStatus,
              review_comment: review?.review_comment,
              submissionId,
              fileIndex,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        setSubmittedFilesWithStatus(filesWithStatus);
      } else {
        setSubmittedFilesWithStatus([]);
      }
    } catch (err) {
      console.error("Error fetching files with status:", err);
    }
  };

  // 後方互換性のためのエイリアス
  const fetchExistingFileCount = fetchExistingFilesWithStatus;

  // コンポーネントのマウント時とprojectSlugの変更時に既存ファイル数を取得
  useEffect(() => {
    if (projectSlug && projectSlug.trim() !== "") {
      // 既存ファイル数を取得
      fetchExistingFileCount(projectSlug);
    } else {
      setExistingFileCount(0);
    }
  }, [projectSlug]);

  // ESCキーでライトボックスを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && lightboxImage) {
        setLightboxImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage]);

  // Update file selection handling
  const handleFilesChange = (files: File[]) => {
    const totalFileCount = existingFileCount + files.length;

    if (totalFileCount > 10) {
      // 上限を超える場合はエラーを表示するだけ
      setShowFileLimitError(true);
      // setLogoFiles は呼び出さない
    } else {
      // 上限内の場合はエラーを非表示にし、ファイルリストを更新
      setShowFileLimitError(false);
      setLogoFiles(files);
    }
  };

  // UploadThing hook for file uploads
  const [uploadProgress, setUploadProgress] = useState(0);

  const { startUpload, isUploading: isUploadingFile } = useUploadThing("imageUploader", {
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onClientUploadComplete: async (res) => {
      console.log("Upload completed:", res);
      // ファイルアップロード完了時は何もしない（handleCreateSubmissionで処理）
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setIsUploading(false);
    },
  });

  // 提出データを作成する関数
  const handleCreateSubmission = async (uploadedFiles?: any[]) => {
    // 重複実行を防ぐ
    if (isSubmittingRef.current) {
      console.log("Submission already in progress, skipping duplicate call");
      return;
    }

    isSubmittingRef.current = true;

    try {
      // 提出ごとに新しいslugを生成
      const newSubmissionSlug = generateRandomSlug();

      // 提出データの準備
      const submissionData = {
        name,
        email,
        slug: newSubmissionSlug,     // 提出のslug（毎回新規生成）
        projectSlug: projectSlug,    // プロジェクトのslug（固定値）
        submittedAt: new Date().toISOString(),
        files: uploadedFiles
          ? uploadedFiles.map((file: any) => ({
              name: file.fileName || file.name,
              url: file.ufsUrl || file.fileUrl || file.url,
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

      if (response.ok) {
        // 提出成功時に提出者情報をlocalStorageに保存
        try {
          localStorage.setItem(SUBMITTER_INFO_KEY, JSON.stringify({ name, email }));
        } catch (error) {
          console.error('Error saving submitter information to localStorage:', error);
        }

        // 送信完了後、最新のファイル数を再取得
        await fetchExistingFileCount(projectSlug);
        // ファイルリストをクリア
        setLogoFiles([]);
        // 提出完了状態に設定
        setIsSubmitted(true);
        setIsUploading(false);
      } else {
        const errorData = await response.json().catch(() => ({ error: "不明なエラーが発生しました" }));
        console.error("Failed to create submission:", errorData);
        alert(`提出に失敗しました: ${errorData.error || "不明なエラー"}`);
        setIsUploading(false);
        isSubmittingRef.current = false; // エラー時はフラグをリセット
      }
    } catch (error) {
      console.error("Error in submission creation:", error);
      alert("提出中にエラーが発生しました。もう一度お試しください。");
      setIsUploading(false);
      isSubmittingRef.current = false; // エラー時はフラグをリセット
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // スロットモードの場合
    if (hasSlots) {
      await handleSlotSubmit();
      return;
    }

    // 従来モード：送信前にファイル数チェック
    if (existingFileCount + logoFiles.length > 10) {
      alert("累計10ファイルを超えるため、送信できません。");
      return;
    }

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
      // Upload files to UploadThing if they exist
      if (logoFiles.length > 0) {
        // 並列アップロード用の関数
        const uploadFilesInBatches = async (files: File[], batchSize = 3) => {
          const results = [];
          for (let i = 0; i < files.length; i += batchSize) {
            const batch = files.slice(i, i + batchSize);
            const batchResults = await startUpload(batch);
            if (batchResults) {
              results.push(...batchResults);
            }
          }
          return results;
        };

        const uploadedFiles = await uploadFilesInBatches(logoFiles, 3);
        if (uploadedFiles && uploadedFiles.length > 0) {
          await handleCreateSubmission(uploadedFiles);
        } else {
          setIsUploading(false);
        }
      } else {
        // If no files, just create a submission record
        await handleCreateSubmission([]);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      setIsUploading(false);
    }
  };

  // スロットベースの送信処理
  const handleSlotSubmit = async () => {
    // 必須チェック
    if (!canSubmitSlots()) {
      alert("必須スロットにファイルをアップロードしてください。");
      return;
    }

    // アップロードするファイルがあるかチェック
    const totalNewFiles = getTotalNewFiles();
    if (totalNewFiles === 0) {
      alert("アップロードするファイルがありません。");
      return;
    }

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
      // 各スロットのファイルをアップロード
      const slotFileData: { slotId: string; name: string; url: string; size: number; mimeType?: string }[] = [];

      for (const [slotId, files] of Object.entries(slotFiles)) {
        if (files.length === 0) continue;

        // UploadThingでファイルをアップロード
        const uploadedFiles = await startUpload(files);
        if (uploadedFiles) {
          for (let i = 0; i < uploadedFiles.length; i++) {
            const uploadedFile = uploadedFiles[i];
            const originalFile = files[i];
            slotFileData.push({
              slotId,
              name: uploadedFile.name,
              url: uploadedFile.ufsUrl || uploadedFile.url,
              size: uploadedFile.size,
              mimeType: originalFile?.type,
            });
          }
        }
      }

      if (slotFileData.length === 0) {
        setIsUploading(false);
        return;
      }

      // 提出データの準備
      const newSubmissionSlug = generateRandomSlug();
      const submissionData = {
        name,
        email,
        slug: newSubmissionSlug,
        projectSlug: projectSlug,
        submittedAt: new Date().toISOString(),
        files: [], // 従来のfiles（空）
        figmaLinks: figmaUrl ? [figmaUrl] : [],
        slotFiles: slotFileData, // スロットファイル
      };

      // Supabaseに保存
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        // 提出成功時に提出者情報をlocalStorageに保存
        try {
          localStorage.setItem(SUBMITTER_INFO_KEY, JSON.stringify({ name, email }));
        } catch (error) {
          console.error('Error saving submitter information to localStorage:', error);
        }

        // スロットファイルリストをクリア
        setSlotFiles({});
        // 提出完了状態に設定
        setIsSubmitted(true);
        setIsUploading(false);
      } else {
        const errorData = await response.json().catch(() => ({ error: "不明なエラーが発生しました" }));
        console.error("Failed to create slot submission:", errorData);
        alert(`提出に失敗しました: ${errorData.error || "不明なエラー"}`);
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Error in slot submission:", error);
      alert("提出中にエラーが発生しました。もう一度お試しください。");
      setIsUploading(false);
    }
  };

  // スロットファイル変更ハンドラ
  const handleSlotFilesChange = (slotId: string, files: File[]) => {
    setSlotFiles((prev) => ({
      ...prev,
      [slotId]: files,
    }));
  };

  // スロットファイル削除ハンドラ（slot_filesテーブルから削除）
  const handleSlotFileDelete = async () => {
    if (!slotDeleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/submissions/slot-files/${slotDeleteTarget.fileId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submitter_name: name,
          submitter_email: email,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "削除に失敗しました");
      }

      // 削除成功：ページをリロードして最新状態を取得
      window.location.reload();
    } catch (error) {
      console.error("Slot file delete error:", error);
      alert(error instanceof Error ? error.message : "削除に失敗しました");
    } finally {
      setIsDeleting(false);
      setSlotDeleteTarget(null);
    }
  };

  // ライトボックス表示ハンドラ
  const handleViewImage = (url: string, name: string) => {
    setLightboxImage({ url, name });
  };

  // スロットファイル削除確認ダイアログを開く
  const handleDeleteSlotFile = (slotId: string, fileId: string) => {
    const slot = slots.find(s => s.id === slotId);
    const file = slot?.latest_file;
    if (file) {
      setSlotDeleteTarget({ slotId, fileId, fileName: file.file_name });
    }
  };

  // スロットベースの送信可否チェック
  const canSubmitSlots = () => {
    // 必須スロットにファイルがあるかチェック（既存ファイルまたは新規選択）
    for (const slot of slots) {
      if (slot.is_required) {
        const hasExistingFile = slot.latest_file && !slot.latest_file.is_deleted;
        const hasNewFile = (slotFiles[slot.id] || []).length > 0;
        if (!hasExistingFile && !hasNewFile) {
          return false;
        }
      }
    }
    return true;
  };

  // 全スロットの新規ファイル数を取得
  const getTotalNewFiles = () => {
    return Object.values(slotFiles).reduce((sum, files) => sum + files.length, 0);
  };

  // ステータス表示用のヘルパー関数
  const getStatusDisplay = (status: ReviewStatus) => {
    switch (status) {
      case "approved":
        return { emoji: "🟢", label: "承認済み", className: "text-green-400 bg-green-500/10 border-green-500/30" };
      case "rejected":
        return { emoji: "🟣", label: "修正依頼", className: "text-purple-400 bg-purple-500/10 border-purple-500/30" };
      default:
        return { emoji: "🟡", label: "確認中", className: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" };
    }
  };

  // ファイル削除ハンドラ
  const handleDeleteFile = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/reviews/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: deleteTarget.submissionId,
          file_index: deleteTarget.fileIndex,
          submitter_name: name,
          submitter_email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "削除に失敗しました");
      }

      // 削除成功：リストから該当ファイルを除外
      setSubmittedFilesWithStatus((prev) =>
        prev.filter(
          (item) =>
            !(item.submissionId === deleteTarget.submissionId && item.fileIndex === deleteTarget.fileIndex)
        )
      );

      // 既存ファイル数を更新
      setExistingFileCount((prev) => Math.max(0, prev - 1));

      // ダイアログを閉じる
      setDeleteTarget(null);
    } catch (error) {
      console.error("File delete error:", error);
      alert(error instanceof Error ? error.message : "削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine theme-based classes - Digital Serenity design
  const themeClasses = {
    card: "bg-slate-800/40 border-slate-700/50 backdrop-blur-sm",
    section: "bg-slate-700/30 border-slate-600/50",
    input:
      "bg-slate-700/30 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500",
    button: "bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium hover:scale-105",
    separator: "bg-slate-600/50",
    logCard: "bg-slate-700/30 border-slate-600/50",
    backButton: "border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 hover:text-slate-50 font-light",
    logButton: "border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 hover:text-slate-50 font-light",
    themeIcon: "text-slate-300",
    text: "text-slate-50",
    mutedText: "text-slate-400",
    alert: "bg-amber-500/10 border-amber-500/30 text-amber-200",
  };

  if (viewingLogs) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl sm:max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6"
      >
        <Card className={themeClasses.card}>
          <div className="absolute inset-0 bg-dot-pattern opacity-5 rounded-lg pointer-events-none"></div>
          <CardHeader className="pb-2 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingLogs(false)}
                className={`${themeClasses.backButton} border-dashed text-sm sm:text-base lg:text-lg py-2 px-4 sm:py-3 sm:px-6`}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> 戻る
              </Button>
            </div>
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-extralight tracking-tight text-slate-50">提出ログ一覧</CardTitle>
            </div>
            <CardDescription className="text-center text-xs sm:text-sm lg:text-base text-slate-300 font-light">過去の素材提出履歴を確認できます</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <SubmissionLogs isDark={true} projectSlug={projectSlug} />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
    <AnimatePresence mode="wait">
      {!isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl sm:max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6"
        >
          <Card className={themeClasses.card}>
            <div className="absolute inset-0 bg-dot-pattern opacity-5 rounded-lg pointer-events-none"></div>
            <CardHeader className="pb-2 p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col items-center space-y-2 sm:space-y-2.5 mb-1">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-extralight tracking-tight mt-1 text-slate-50">素材提出フォーム</CardTitle>
              </div>
              <CardDescription className="text-center text-xs sm:text-sm lg:text-base text-slate-300 font-light">
                プロジェクトに必要な素材をアップロードしてください
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-5">
              {showFileLimitError && (
                <div className={`${themeClasses.alert} p-3 sm:p-4 rounded-lg mb-4 flex items-center gap-2`}>
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <p className="text-sm sm:text-base lg:text-lg">
                    このプロジェクトでは最大10ファイルまでアップロード可能です。
                    {existingFileCount > 0 && `（既存: ${existingFileCount}ファイル）`}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5 lg:space-y-4">
                {/* プロジェクト情報カード - 2列×2行レイアウト */}
                {projectInfo && (
                  <div className={`rounded-lg ${themeClasses.section} p-2.5 sm:p-3 lg:p-4 border border-dashed backdrop-blur-sm`}>
                    <h3 className={`text-xs sm:text-sm lg:text-base font-light ${themeClasses.text} mb-2`}>プロジェクト情報</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <p className={`text-xs sm:text-sm font-light ${themeClasses.mutedText}`}>
                        プロジェクト名: <span className={themeClasses.text}>{projectInfo.title}</span>
                      </p>
                      <p className={`text-xs sm:text-sm font-light ${themeClasses.mutedText}`}>
                        依頼者: <span className={themeClasses.text}>{projectInfo.requesterName}</span>
                      </p>
                      <p className={`text-xs sm:text-sm font-light ${themeClasses.mutedText}`}>
                        メール: <span className={themeClasses.text}>{projectInfo.requesterEmail}</span>
                      </p>
                      <p className={`text-xs sm:text-sm font-light ${themeClasses.mutedText}`}>
                        発行日: <span className={themeClasses.text}>{new Date(projectInfo.createdAt).toLocaleDateString("ja-JP")}</span>
                      </p>
                    </div>
                  </div>
                )}
                {/* 提出者情報セクション - スロットモードでは常に表示、従来モードでは初回のみ */}
                {(hasSlots || submittedFilesWithStatus.length === 0) && (
                  <div className="space-y-3 rounded-lg bg-blue-500/10 border border-blue-500/30 p-2.5 sm:p-3 lg:p-4 border-dashed backdrop-blur-sm">
                    <h3 className="text-xs sm:text-sm lg:text-base font-light flex items-center gap-1.5 text-blue-300">
                      <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                      提出者情報
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="name" className={`text-xs sm:text-sm lg:text-base font-light ${themeClasses.mutedText}`}>
                        お名前 <span className="text-slate-400">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="山田 太郎"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={`${themeClasses.input} text-sm sm:text-base lg:text-lg h-9 sm:h-10 lg:h-11`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className={`text-xs sm:text-sm lg:text-base font-light ${themeClasses.mutedText} flex items-center gap-1.5`}
                      >
                        <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                        メールアドレス <span className="text-slate-400">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="yamada@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`${themeClasses.input} text-sm sm:text-base lg:text-lg h-9 sm:h-10 lg:h-11`}
                      />
                    </div>
                  </div>
                )}

                {/* スロットベースのアップロード or 従来のファイルアップロード */}
                {hasSlots ? (
                  /* スロットベースのUI */
                  <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm lg:text-base font-light text-blue-300 flex items-center gap-1.5">
                      <Upload className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                      素材アップロード
                      {getTotalNewFiles() > 0 && (
                        <span className="text-xs text-slate-400">
                          （{getTotalNewFiles()}件選択中）
                        </span>
                      )}
                    </h3>
                    <div className="space-y-3">
                      {slots.map((slot) => (
                        <SlotUploadCard
                          key={slot.id}
                          slot={slot}
                          onFilesChange={handleSlotFilesChange}
                          selectedFiles={slotFiles[slot.id] || []}
                          onViewImage={handleViewImage}
                          onDeleteFile={handleDeleteSlotFile}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  /* 従来のファイルアップロードセクション */
                  <div className="space-y-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 p-2.5 sm:p-3 lg:p-4 border-dashed backdrop-blur-sm">
                    <h3 className="text-xs sm:text-sm lg:text-base font-light text-blue-300 flex items-center gap-1.5">
                      <Upload className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                      ファイルアップロード{" "}
                      <span className="text-xs sm:text-xs lg:text-sm font-light text-slate-400">
                        (プロジェクト当たり最大10ファイル 現在選択: {logoFiles.length}/10)
                      </span>
                    </h3>
                    {existingFileCount > 0 && (
                      <p className={`text-xs sm:text-xs lg:text-sm font-light ${themeClasses.mutedText}`}>既存ファイル数: {existingFileCount} / 10</p>
                    )}
                    <FileUploader
                      id="logo-upload"
                      files={logoFiles}
                      onFilesChange={handleFilesChange}
                      accept="image/*"
                      isDark={true}
                      multiple={true}
                      maxFiles={10}
                      existingFileCount={existingFileCount}
                    />
                  </div>
                )}

                {/* 提出済みファイルのステータス表示セクション - 従来モードのみ */}
                {!hasSlots && submittedFilesWithStatus.length > 0 && (
                  <div className="space-y-2.5 rounded-lg bg-slate-700/30 border border-slate-600/50 p-2.5 sm:p-3 lg:p-4 border-dashed backdrop-blur-sm">
                    <h3 className="text-xs sm:text-sm lg:text-base font-light text-slate-300 flex items-center gap-1.5">
                      <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                      提出済みファイル（ステータス）
                    </h3>
                    <div className="space-y-2">
                      {submittedFilesWithStatus.map((item, index) => {
                        const statusDisplay = getStatusDisplay(item.review_status);
                        return (
                          <div
                            key={index}
                            className={`rounded-lg border p-2 sm:p-2.5 ${statusDisplay.className}`}
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              {/* サムネイル（クリックで拡大表示） */}
                              <button
                                type="button"
                                onClick={() => setLightboxImage({ url: item.file.url, name: item.file.name })}
                                className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-md overflow-hidden bg-slate-800 group cursor-pointer transition-transform hover:scale-105"
                              >
                                <Image
                                  src={item.file.url}
                                  alt={item.file.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                                {/* ホバー時のオーバーレイ */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <ZoomIn className="w-4 h-4 text-white" />
                                </div>
                              </button>
                              {/* ファイル名とステータス */}
                              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                <span className="text-xs sm:text-sm lg:text-base font-light text-slate-200 truncate">
                                  {item.file.name}
                                </span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`text-xs sm:text-sm font-medium ${statusDisplay.className} px-2 py-0.5 rounded`}>
                                    {statusDisplay.emoji} {statusDisplay.label}
                                  </span>
                                  {/* 削除ボタン（承認済み以外で表示） */}
                                  {item.review_status !== "approved" && (
                                    <button
                                      type="button"
                                      onClick={() => setDeleteTarget({
                                        file: item.file,
                                        submissionId: item.submissionId,
                                        fileIndex: item.fileIndex,
                                      })}
                                      className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                      title="ファイルを削除"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            {item.review_status === "rejected" && item.review_comment && (
                              <div className="mt-1.5 ml-12 sm:ml-15 flex items-start gap-1.5 text-purple-300">
                                <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 mt-0.5 flex-shrink-0" />
                                <p className="text-xs sm:text-sm font-light">{item.review_comment}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Figmaリンクセクション */}
                <div className="space-y-2">
                  <Label htmlFor="figma-url" className={`text-xs sm:text-sm lg:text-base font-light ${themeClasses.mutedText}`}>
                    Figmaリンク <span className={`text-xs sm:text-xs lg:text-sm font-light ${themeClasses.mutedText}`}>(任意)</span>
                  </Label>
                  <Input
                    id="figma-url"
                    type="url"
                    placeholder="https://figma.com/file/..."
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    className={`${themeClasses.input} text-sm sm:text-base lg:text-lg h-9 sm:h-10 lg:h-11`}
                  />
                </div>

                <Button
                  type="submit"
                  className={`w-full ${themeClasses.button} py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg transition-all duration-200`}
                  disabled={isUploading || isUploadingFile || !name}
                >
                  {isUploading || isUploadingFile ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-slate-900"></span>
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
          className="w-full max-w-md sm:max-w-lg lg:max-w-2xl mx-auto px-4 sm:px-6"
        >
          <Card className={themeClasses.card}>
            <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8 lg:py-10 p-4 sm:p-5 lg:p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-green-500/20 rounded-full mb-4 sm:mb-5 backdrop-blur-sm border border-green-500/30">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-400" />
              </div>
              <h2 className={`text-lg sm:text-xl lg:text-2xl font-extralight mb-3 ${themeClasses.text}`}>提出完了</h2>
              <p className={`text-center mb-4 sm:mb-5 lg:mb-6 text-xs sm:text-sm lg:text-base font-light ${themeClasses.mutedText}`}>
                素材の提出を受け付けました。ありがとうございます！
              </p>

              <div className="flex flex-col gap-2 w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[380px]">
                <div className={`${themeClasses.logCard} p-2.5 sm:p-3 lg:p-4 rounded-lg backdrop-blur-sm`}>
                  <p className={`text-xs sm:text-xs lg:text-sm font-light ${themeClasses.mutedText}`}>提出者</p>
                  <p className={`text-sm sm:text-sm lg:text-base font-light ${themeClasses.text}`}>{name}</p>
                </div>
                {email && (
                  <div className={`${themeClasses.logCard} p-2.5 sm:p-3 lg:p-4 rounded-lg backdrop-blur-sm`}>
                    <p className={`text-xs sm:text-xs lg:text-sm font-light ${themeClasses.mutedText}`}>メールアドレス</p>
                    <p className={`text-sm sm:text-sm lg:text-base font-light ${themeClasses.text}`}>{email}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className={`${themeClasses.logCard} p-2.5 sm:p-3 lg:p-4 rounded-lg backdrop-blur-sm`}>
                    <p className={`text-xs sm:text-xs lg:text-sm font-light ${themeClasses.mutedText} flex items-center gap-1`}>
                      <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      提出日
                    </p>
                    <p className={`text-xs sm:text-sm lg:text-base font-light ${themeClasses.text}`}>{submissionDate}</p>
                  </div>
                  <div className={`${themeClasses.logCard} p-2.5 sm:p-3 lg:p-4 rounded-lg backdrop-blur-sm`}>
                    <p className={`text-xs sm:text-xs lg:text-sm font-light ${themeClasses.mutedText} flex items-center gap-1`}>
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      時間
                    </p>
                    <p className={`text-xs sm:text-sm lg:text-base font-light ${themeClasses.text}`}>{submissionTime}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ライトボックスモーダル - 高速表示 */}
    <AnimatePresence>
      {lightboxImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setLightboxImage(null)}
        >
          {/* 閉じるボタン */}
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* ファイル名 */}
          <div className="absolute top-4 left-4 text-white text-sm font-light truncate max-w-[60%]">
            {lightboxImage.name}
          </div>

          {/* 画像 */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative max-w-[90vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage.url}
              alt={lightboxImage.name}
              width={1200}
              height={800}
              className="object-contain max-w-full max-h-[85vh] rounded-lg"
              priority
              unoptimized
            />
          </motion.div>

          {/* 操作ヒント */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-light">
            クリックまたは ESC キーで閉じる
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* 削除確認ダイアログ（従来モード用） */}
    <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
      <AlertDialogContent className="bg-slate-900 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-100">ファイルを削除しますか？</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {deleteTarget && (
              <>
                「{deleteTarget.file.name}」を削除します。
                <br />
                この操作は元に戻せません。
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            disabled={isDeleting}
          >
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteFile}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                削除中...
              </>
            ) : (
              "削除する"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* スロットファイル削除確認ダイアログ */}
    <AlertDialog open={!!slotDeleteTarget} onOpenChange={(open) => !open && setSlotDeleteTarget(null)}>
      <AlertDialogContent className="bg-slate-900 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-100">ファイルを削除しますか？</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {slotDeleteTarget && (
              <>
                「{slotDeleteTarget.fileName}」を削除します。
                <br />
                この操作は元に戻せません。
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            disabled={isDeleting}
          >
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSlotFileDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                削除中...
              </>
            ) : (
              "削除する"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
