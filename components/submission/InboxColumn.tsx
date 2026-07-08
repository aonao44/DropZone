"use client";

import { Inbox, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InboxFileCard } from './InboxFileCard';
import type { FileWithId } from '@/lib/types';

interface InboxColumnProps {
  files: FileWithId[];
  selectedIds: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
  onSelectAll: () => void;
  isMobile: boolean;
}

export function InboxColumn({
  files,
  selectedIds,
  onSelectionChange,
  onSelectAll,
  isMobile,
}: InboxColumnProps) {

  const handleFileClick = (fileId: string, event: React.MouseEvent) => {
    if (event.shiftKey && selectedIds.size > 0) {
      // Shift+Click: 範囲選択
      const fileIds = files.map(f => f.id);
      const lastSelectedId = Array.from(selectedIds).pop();
      const lastIndex = fileIds.findIndex(id => id === lastSelectedId);
      const currentIndex = fileIds.findIndex(id => id === fileId);

      if (lastIndex !== -1 && currentIndex !== -1) {
        const [start, end] = [Math.min(lastIndex, currentIndex), Math.max(lastIndex, currentIndex)];
        const rangeIds = fileIds.slice(start, end + 1);
        onSelectionChange(new Set([...selectedIds, ...rangeIds]));
      }
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd+Click: 個別追加/削除
      const newSet = new Set(selectedIds);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      onSelectionChange(newSet);
    } else {
      // 通常クリック: 単一選択
      onSelectionChange(new Set([fileId]));
    }
  };

  return (
    <Card className="bg-slate-800/40 border-slate-600/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-light text-slate-50 flex items-center gap-2">
          <Inbox className="h-5 w-5 text-cyan-500" aria-hidden="true" />
          ファイル置き場 ({files.length}件)
        </CardTitle>
        {files.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="text-slate-400 hover:text-slate-200 h-11"
          >
            <CheckSquare className="h-4 w-4 mr-1" aria-hidden="true" />
            すべて選択
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {files.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            ここにファイルをドロップすると一時保管されます
          </p>
        ) : (
          files.map(file => (
            <InboxFileCard
              key={file.id}
              file={file}
              isSelected={selectedIds.has(file.id)}
              onClick={(e) => handleFileClick(file.id, e)}
              isDraggingDisabled={isMobile}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
