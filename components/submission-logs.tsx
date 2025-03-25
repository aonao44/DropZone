"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Download, Eye, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

// 仮のデータ型定義
interface SubmissionLog {
  id: string;
  date: string;
  time: string;
  name: string;
  assetsCount: number;
  figmaLinksCount: number;
  viewUrl: string;
}

// 仮データ
const logs: SubmissionLog[] = [
  {
    id: "log_1",
    date: "2025年3月20日",
    time: "15:30",
    name: "山田 太郎",
    assetsCount: 3,
    figmaLinksCount: 1,
    viewUrl: "/logs/1",
  },
  {
    id: "log_2",
    date: "2025年3月18日",
    time: "11:15",
    name: "佐藤 花子",
    assetsCount: 1,
    figmaLinksCount: 2,
    viewUrl: "/logs/2",
  },
];

interface SubmissionLogsProps {
  isDark?: boolean;
}

export function SubmissionLogs({ isDark = false }: SubmissionLogsProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

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
    <div className="space-y-3">
      {logs.length === 0 ? (
        <div className="text-center py-10">
          <p className={`${themeClasses.mutedText}`}>まだ提出履歴はありません</p>
        </div>
      ) : (
        logs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`border rounded-lg p-4 transition-all duration-200 ${
              expandedLogId === log.id ? themeClasses.logCardExpanded : themeClasses.logCard
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`${themeClasses.iconBg} p-2 rounded-md`}>
                  <Clock className={`h-4 w-4 ${themeClasses.iconFg}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${themeClasses.text}`}>{log.name}</p>
                  <p className={`text-xs ${themeClasses.dateTime}`}>
                    {log.date} {log.time}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpand(log.id)}
                className={`p-1 rounded-full ${
                  expandedLogId === log.id ? themeClasses.expandButtonActive : themeClasses.expandButton
                }`}
              >
                <ChevronRight
                  className={`h-5 w-5 transition-transform duration-200 ${expandedLogId === log.id ? "rotate-90" : ""}`}
                />
              </Button>
            </div>

            {expandedLogId === log.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-600/50"
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

                <div className="flex space-x-2 mt-3">
                  <Button size="sm" variant="outline" className={`text-xs py-1 px-3 h-auto ${themeClasses.buttonBg}`}>
                    <Download className="h-3 w-3 mr-1" />
                    全てダウンロード
                  </Button>
                  <Link href={log.viewUrl} passHref>
                    <Button size="sm" variant="outline" className={`text-xs py-1 px-3 h-auto ${themeClasses.buttonBg}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      詳細を見る
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
}
