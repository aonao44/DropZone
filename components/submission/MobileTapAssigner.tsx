"use client";

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProjectSlot, FileWithId } from '@/lib/types';

interface MobileTapAssignerProps {
  selectedFiles: FileWithId[];
  slots: ProjectSlot[];
  onAssign: (slotId: string) => void;
}

export function MobileTapAssigner({
  selectedFiles,
  slots,
  onAssign,
}: MobileTapAssignerProps) {
  if (selectedFiles.length === 0) {
    return null;
  }

  return (
    <Card className="bg-cyan-500/10 border-cyan-500/30">
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="default" className="bg-cyan-500">
            {selectedFiles.length}件選択中
          </Badge>
          <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">割り当て先を選択:</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {slots
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(slot => (
              <Button
                key={slot.id}
                variant="outline"
                onClick={() => onAssign(slot.id)}
                className="w-full justify-start text-left h-auto py-2 px-3"
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="text-sm font-light">{slot.name}</span>
                  {slot.is_required && (
                    <Badge variant="warning" className="text-xs">必須</Badge>
                  )}
                </div>
              </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
