"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Download, Eye, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { DownloadButton } from "@/components/DownloadButton";
import { DownloadAllButton } from "@/components/DownloadAllButton";

// 仮のデータ型定義
interface SubmissionLog {
  id: string;
  date: string;
  time: string;
  name: string;
  assetsCount: number;
  figmaLinksCount: number;
  viewUrl: string;
  files: any[];
}

interface SubmissionLogsProps {
  isDark?: boolean;
  projectSlug: string;
}

export function SubmissionLogs({ isDark = false, projectSlug }: SubmissionLogsProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [logs, setLogs] = useState<SubmissionLog[]>([]);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  useEffect(() => {
    if (!projectSlug) return;
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("id, submitted_at, name, files, figma_links, slug, project_slug")
        .eq("slug", projectSlug)
        .order("submitted_at", { ascending: false });
      if (error) {
        setLogs([]);
        return;
      }
      setLogs(
        (data || []).map((item: any) => ({
          id: item.id,
          date: new Date(item.submitted_at).toLocaleDateString("ja-JP"),
          time: new Date(item.submitted_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
          name: item.name,
          assetsCount: Array.isArray(item.files) ? item.files.length : 0,
          figmaLinksCount: Array.isArray(item.figma_links) ? item.figma_links.length : 0,
          viewUrl: `/project/${projectSlug}/view`,
          files: item.files || [],
        }))
      );
    };
    fetchLogs();
  }, [projectSlug]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  // Theme-based classes
  const themeClasses = isDark
    ? {
        logCard: "border-gray-600/70 bg-gray-700/40 hover:bg-gray-700/70",
        logCardExpanded: "border-indigo-500/50 bg-gray-700/60",
        expandButton: "text-gray-300 hover:text-indigo-300",
        expandButtonActive: "text-indigo-300 bg-indigo-800/30",
        dateTime: "text-gray-300",
        iconBg: "bg-indigo-800/20",
        iconFg: "text-indigo-300",
        buttonBg: "bg-indigo-800/20 border-indigo-500/30 hover:bg-indigo-700/40 text-indigo-300",
        text: "text-gray-200",
        mutedText: "text-gray-400",
      }
    : {
        logCard: "border-gray-200/70 bg-white hover:bg-gray-50/80",
        logCardExpanded: "border-pink-300/50 bg-white",
        expandButton: "text-gray-400 hover:text-pink-500",
        expandButtonActive: "text-pink-500 bg-pink-50/50",
        dateTime: "text-gray-500",
        iconBg: "bg-pink-50/80",
        iconFg: "text-pink-500",
        buttonBg: "bg-pink-50/80 border-pink-200/50 hover:bg-pink-100/80 text-pink-500",
        text: "text-gray-700",
        mutedText: "text-gray-500",
      };

  return (
    <div className="space-y-3 text-2xl w-full max-w-none mx-auto">
      {logs.length === 0 ? (
        <div className="text-center py-10">
          <p className={`${themeClasses.mutedText} text-2xl`}>まだ提出履歴はありません</p>
        </div>
      ) : (
        logs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`w-full max-w-none mx-auto border rounded-lg p-8 transition-all duration-200 ${
              expandedLogId === log.id ? themeClasses.logCardExpanded : themeClasses.logCard
            } cursor-pointer text-2xl`}
            onClick={() => toggleExpand(log.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`${themeClasses.iconBg} p-4 rounded-md`}>
                  <Clock className={`h-6 w-6 ${themeClasses.iconFg}`} />
                </div>
                <div>
                  <p className={`text-2xl font-medium ${themeClasses.text}`}>{log.name}</p>
                  <p className={`text-lg ${themeClasses.dateTime}`}>
                    {log.date} {log.time}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(log.id);
                }}
                className={`p-2 rounded-full text-2xl ${
                  expandedLogId === log.id ? themeClasses.expandButtonActive : themeClasses.expandButton
                }`}
              >
                <ChevronRight
                  className={`h-8 w-8 transition-transform duration-200 ${expandedLogId === log.id ? "rotate-90" : ""}`}
                />
              </Button>
            </div>

            {expandedLogId === log.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 pt-6 border-t border-dashed border-gray-200 dark:border-gray-600/50 text-xl"
              >
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className={`text-xs ${themeClasses.mutedText}`}>アップロードファイル</p>
                    <p className={`text-sm ${themeClasses.text}`}>{log.assetsCount}個</p>
                  </div>
                  <div>
                    <p className={`text-xs ${themeClasses.mutedText}`}>Figmaリンク</p>
                    <p className={`text-sm ${themeClasses.text}`}>{log.figmaLinksCount}個</p>
                  </div>
                </div>
                {/* 画像リスト表示（filesを必ず配列に変換） */}
                {(() => {
                  console.log("log.files", log.files);
                  const files = typeof log.files === "string" ? JSON.parse(log.files) : log.files;
                  return Array.isArray(files) && files.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {files.map((file: any, idx: number) => (
                        <div key={idx} className="flex flex-row items-center gap-6 p-4 w-full border-b last:border-b-0">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-20 h-20 object-cover rounded border flex-shrink-0"
                            style={{ background: "#222" }}
                          />
                          <span className="flex-1 text-2xl truncate overflow-hidden whitespace-nowrap px-2">
                            {file.name}
                          </span>
                          <DownloadButton url={file.url} fileName={file.name} variant="ghost" />
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}
              </motion.div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
}
