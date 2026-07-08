"use client";

import { TwoPaneSubmissionForm } from "./submission/TwoPaneSubmissionForm";
import { TraditionalSubmissionForm } from "./submission/TraditionalSubmissionForm";
import type { ProjectSlot } from "@/lib/types";

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
  const hasSlots = slots && slots.length > 0;

  if (!hasSlots) {
    // 従来モード: シンプルな一括アップロードUI
    return (
      <TraditionalSubmissionForm
        projectSlug={projectSlug}
        projectInfo={projectInfo}
        previousSubmitter={previousSubmitter}
      />
    );
  }

  // スロットモード: ツーペイン仕分けUI
  return (
    <TwoPaneSubmissionForm
      projectSlug={projectSlug}
      projectInfo={projectInfo}
      previousSubmitter={previousSubmitter}
      slots={slots}
    />
  );
}
