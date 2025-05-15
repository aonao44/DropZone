"use client";

import React from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { DownloadButton } from "@/components/DownloadButton";
import { User, Calendar, PaperClip, Link as LinkIcon } from "lucide-react";
import { Submission } from "@/lib/types";

interface ProjectSubmissionCardProps {
  submission: Submission;
}

export function ProjectSubmissionCard({ submission }: ProjectSubmissionCardProps) {
  const themeClasses = {
    card: "border-gray-600/70 bg-gray-700/40 hover:bg-gray-700/50 transition-all",
    header: "pb-2",
    title: "text-lg font-medium text-white",
    dateTime: "text-xs text-gray-400 flex items-center gap-1",
    section: "bg-gray-700/60 border-gray-600/70 p-3 rounded-lg border border-dashed",
    sectionTitle: "text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5",
    fileItem: "flex items-center justify-between py-2",
    fileLink: "text-indigo-300 hover:text-indigo-200 text-sm",
    figmaLink: "text-indigo-300 hover:text-indigo-200 text-sm",
    userInfo: "flex items-center gap-2",
    userName: "text-white",
    userEmail: "text-gray-400 text-sm",
  };

  const formattedDate = submission.submitted_at 
    ? format(new Date(submission.submitted_at), 'yyyy年MM月dd日 HH:mm')
    : '日時情報なし';

  return (
    <Card className={themeClasses.card}>
      <CardHeader className={themeClasses.header}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className={themeClasses.title}>{submission.name}からの提出</h3>
            <div className={themeClasses.dateTime}>
              <Calendar className="h-3 w-3 mr-1" /> 
              {formattedDate}
            </div>
          </div>
          <div className={themeClasses.userInfo}>
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <div className={themeClasses.userName}>{submission.name}</div>
              {submission.email && (
                <div className={themeClasses.userEmail}>{submission.email}</div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ファイルセクション */}
        {submission.files && submission.files.length > 0 && (
          <div className={themeClasses.section}>
            <h4 className={themeClasses.sectionTitle}>
              <PaperClip className="h-4 w-4" /> 
              アップロードファイル ({submission.files.length})
            </h4>
            <div className="space-y-1">
              {submission.files.map((file, index) => (
                <div key={index} className={themeClasses.fileItem}>
                  <span className={themeClasses.fileLink}>{file.name}</span>
                  <DownloadButton 
                    url={file.url} 
                    fileName={file.name} 
                    variant="secondary"
                    className="bg-gray-800 hover:bg-gray-700 text-white text-xs py-1 h-8"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Figmaリンクセクション */}
        {submission.figma_links && submission.figma_links.length > 0 && (
          <div className={themeClasses.section}>
            <h4 className={themeClasses.sectionTitle}>
              <LinkIcon className="h-4 w-4" /> 
              Figmaリンク
            </h4>
            <div className="space-y-1">
              {submission.figma_links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={themeClasses.figmaLink}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
