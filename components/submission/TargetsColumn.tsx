"use client";

import { Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TargetSlotCard } from './TargetSlotCard';
import type { ProjectSlot, FileWithId } from '@/lib/types';

interface TargetsColumnProps {
  slots: ProjectSlot[];
  assignments: Record<string, FileWithId[]>;
  onDirectDrop: (slotId: string, files: File[]) => void;
  onRemoveFile: (slotId: string, fileId: string) => void;
  onViewImage?: (url: string, name: string) => void;
  activeDragSlotId?: string | null;
}

export function TargetsColumn({
  slots,
  assignments,
  onDirectDrop,
  onRemoveFile,
  onViewImage,
  activeDragSlotId,
}: TargetsColumnProps) {
  return (
    <Card className="bg-slate-800/40 border-slate-600/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-light text-slate-50 flex items-center gap-2">
          <Target className="h-5 w-5 text-cyan-500" aria-hidden="true" />
          提出先 ({slots.length}スロット)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {slots.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            スロットが定義されていません
          </p>
        ) : (
          slots
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(slot => (
              <TargetSlotCard
                key={slot.id}
                slot={slot}
                assignedFiles={assignments[slot.id] || []}
                onDirectDrop={onDirectDrop}
                onRemoveFile={onRemoveFile}
                onViewImage={onViewImage}
                isDraggingOver={activeDragSlotId === `slot-${slot.id}`}
              />
            ))
        )}
      </CardContent>
    </Card>
  );
}
