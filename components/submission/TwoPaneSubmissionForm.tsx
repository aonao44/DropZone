"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CheckCircle, User, Mail, ArrowLeft, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UploadDropZone } from './UploadDropZone';
import { InboxColumn } from './InboxColumn';
import { TargetsColumn } from './TargetsColumn';
import { MobileTapAssigner } from './MobileTapAssigner';
import { useUploadThing } from '@/lib/uploadthing';
import { generateRandomSlug } from '@/lib/utils';
import { ACCEPT_TYPE_CONFIG } from '@/lib/slot-templates';
import type { ProjectSlot, FileWithId } from '@/lib/types';
import { createFileWithId } from '@/lib/types';

type ProjectInfo = {
  title: string;
  requesterName: string;
  requesterEmail: string;
  createdAt: string;
};

interface TwoPaneSubmissionFormProps {
  projectSlug: string;
  projectInfo?: ProjectInfo;
  previousSubmitter?: { name: string; email: string } | null;
  slots: ProjectSlot[];
}

export function TwoPaneSubmissionForm({
  projectSlug,
  projectInfo,
  previousSubmitter,
  slots,
}: TwoPaneSubmissionFormProps) {
  const router = useRouter();

  // ファイル管理
  const [inboxFiles, setInboxFiles] = useState<FileWithId[]>([]);
  const [slotAssignments, setSlotAssignments] = useState<Record<string, FileWithId[]>>({});

  // 選択状態
  const [selectedInboxIds, setSelectedInboxIds] = useState<Set<string>>(new Set());

  // アップロード進捗
  const [uploadProgressMap, setUploadProgressMap] = useState<Record<string, number>>({});

  // D&D
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [overSlotId, setOverSlotId] = useState<string | null>(null);

  // 提出者情報
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // UI状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 重複実行防止
  const isSubmittingRef = useRef(false);

  // ライトボックスのフォーカス管理
  const lightboxCloseButtonRef = useRef<HTMLButtonElement>(null);
  const lightboxTriggerRef = useRef<HTMLElement | null>(null);

  // LocalStorage key
  const SUBMITTER_INFO_KEY = 'dropzone_submitter_info';

  // モバイル判定
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // LocalStorageから提出者情報を復元
  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem(SUBMITTER_INFO_KEY);
      if (savedInfo) {
        const { name: savedName, email: savedEmail } = JSON.parse(savedInfo);
        if (savedName) setName(savedName);
        if (savedEmail) setEmail(savedEmail);
      } else if (previousSubmitter) {
        if (previousSubmitter.name) setName(previousSubmitter.name);
        if (previousSubmitter.email) setEmail(previousSubmitter.email);
      }
    } catch (error) {
      console.error('Error loading submitter information:', error);
      if (previousSubmitter) {
        if (previousSubmitter.name) setName(previousSubmitter.name);
        if (previousSubmitter.email) setEmail(previousSubmitter.email);
      }
    }
  }, [previousSubmitter]);

  // ライトボックスのEscapeキー・フォーカス管理
  useEffect(() => {
    if (!lightboxImage) return;

    lightboxCloseButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      lightboxTriggerRef.current?.focus();
    };
  }, [lightboxImage]);

  // UploadThing統合
  const { startUpload } = useUploadThing("imageUploader");

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Inboxへのファイル追加
  const addFilesToInbox = (files: File[]) => {
    const filesWithIds = files.map(createFileWithId);
    setInboxFiles(prev => [...prev, ...filesWithIds]);
  };

  // Inbox→Targetへの割り当て
  const assignFilesToSlot = (fileIds: Set<string>, slotId: string) => {
    const filesToAssign = inboxFiles.filter(f => fileIds.has(f.id));
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    const acceptConfig = ACCEPT_TYPE_CONFIG[slot.accept_type];
    const currentAssignments = slotAssignments[slotId] || [];

    let newAssignments = [...currentAssignments, ...filesToAssign];
    if (!acceptConfig.multiple) {
      newAssignments = filesToAssign.slice(0, 1); // 1ファイルのみ
    }

    setSlotAssignments(prev => ({
      ...prev,
      [slotId]: newAssignments,
    }));

    // Inboxから削除
    setInboxFiles(prev => prev.filter(f => !fileIds.has(f.id)));
    setSelectedInboxIds(new Set());
  };

  // Desktop→Targetへの直接ドロップ
  const handleDirectDropToSlot = (slotId: string, files: File[]) => {
    const filesWithIds = files.map(createFileWithId);
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    const acceptConfig = ACCEPT_TYPE_CONFIG[slot.accept_type];
    const currentAssignments = slotAssignments[slotId] || [];

    let newAssignments = [...currentAssignments, ...filesWithIds];
    if (!acceptConfig.multiple) {
      newAssignments = filesWithIds.slice(0, 1);
    }

    setSlotAssignments(prev => ({
      ...prev,
      [slotId]: newAssignments,
    }));
  };

  // スロットからファイル削除
  const handleRemoveFileFromSlot = (slotId: string, fileId: string) => {
    setSlotAssignments(prev => ({
      ...prev,
      [slotId]: (prev[slotId] || []).filter(f => f.id !== fileId),
    }));
  };

  // ライトボックスを開く（呼び出し元へのフォーカス復帰のため、トリガー要素を保存）
  const openLightbox = (url: string, name: string) => {
    lightboxTriggerRef.current = document.activeElement as HTMLElement;
    setLightboxImage({ url, name });
  };

  // ドラッグ開始
  const handleDragStart = (event: DragEndEvent) => {
    setActiveDragId(event.active.id as string);
  };

  // ドラッグ中
  const handleDragOver = (event: any) => {
    if (event.over?.id.startsWith('slot-')) {
      setOverSlotId(event.over.id);
    } else {
      setOverSlotId(null);
    }
  };

  // ドラッグ終了
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    setOverSlotId(null);

    if (!over) return;

    if (over.id.toString().startsWith('slot-')) {
      const slotId = over.id.toString().replace('slot-', '');
      const fileId = active.id as string;

      // 選択中のファイルがある場合は全て割り当て
      if (selectedInboxIds.has(fileId)) {
        assignFilesToSlot(selectedInboxIds, slotId);
      } else {
        assignFilesToSlot(new Set([fileId]), slotId);
      }
    }
  };

  // 入力内容の検証（具体的なエラーメッセージを返す）
  const getValidationError = (): string | null => {
    if (!name.trim()) return 'お名前を入力してください';
    if (!email.trim()) return 'メールアドレスを入力してください';

    for (const slot of slots) {
      if (slot.is_required) {
        const hasExisting = slot.latest_file && !slot.latest_file.is_deleted;
        const hasNew = (slotAssignments[slot.id] || []).length > 0;
        if (!hasExisting && !hasNew) {
          return `必須スロット「${slot.name}」にファイルがありません`;
        }
      }
    }
    return null;
  };

  // 提出処理
  const handleSubmit = async () => {
    const validationError = getValidationError();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    setSubmitError(null);

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      // スロット割当を平坦化
      const entries = Object.entries(slotAssignments).flatMap(([slotId, files]) =>
        files.map(file => ({ slotId, file }))
      );

      if (entries.length === 0) {
        setSubmitError("少なくとも1つのファイルをアップロードしてください");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      // 同名ファイルの取り違えを防ぐため、一意なIDを付けた名前でアップロードし、
      // 結果はそのIDで突合する（DBには元のファイル名を保存）
      const uploadName = (file: FileWithId) => `${file.id}__${file.name}`;
      const uploadResults = await startUpload(
        entries.map(({ file }) => new File([file], uploadName(file), { type: file.type }))
      );

      if (!uploadResults || uploadResults.length !== entries.length) {
        throw new Error("ファイルのアップロードに失敗しました");
      }

      const resultsByName = new Map(uploadResults.map(r => [r.name, r]));

      // slotFileData生成
      const slotFileData = entries.map(({ slotId, file }) => {
        const uploaded = resultsByName.get(uploadName(file));
        if (!uploaded?.url) {
          throw new Error(`「${file.name}」のアップロード結果を確認できませんでした`);
        }
        return {
          slotId,
          name: file.name,
          url: uploaded.url,
          size: file.size,
          mimeType: file.type,
        };
      });

      // POST /api/submissions
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          slug: generateRandomSlug(),
          projectSlug,
          submittedAt: new Date().toISOString(),
          files: [],
          figmaLinks: [],
          slotFiles: slotFileData,
        }),
      });

      if (response.ok) {
        // LocalStorageに保存
        try {
          localStorage.setItem(SUBMITTER_INFO_KEY, JSON.stringify({ name, email }));
        } catch (error) {
          console.error('Error saving submitter information:', error);
        }

        // 成功画面表示
        setIsSubmitted(true);
      } else {
        throw new Error("提出に失敗しました");
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('提出中にエラーが発生しました');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // 提出完了画面
  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 py-12"
      >
        <Card className="bg-slate-800/40 border-slate-600/50">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" aria-hidden="true" />
            <h2 className="text-2xl font-light text-slate-50 mb-4">提出が完了しました</h2>
            <p className="text-slate-400 mb-8">
              ファイルのアップロードが完了しました。ご協力ありがとうございます。
            </p>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="gap-2 h-11"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              トップページへ
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        {projectInfo && (
          <Card className="mb-6 bg-slate-800/40 border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-xl font-light text-slate-50">
                {projectInfo.title}
              </CardTitle>
              <p className="text-sm text-slate-400">
                依頼者: {projectInfo.requesterName}
              </p>
            </CardHeader>
          </Card>
        )}

        {/* 利用手順 */}
        <p className="text-sm text-slate-400 mb-6">
          1. ファイルを追加 → 2. 提出先へ振り分け → 3. 提出
        </p>

        {/* 提出者情報フォーム */}
        <Card className="mb-6 bg-slate-800/40 border-slate-600/50">
          <CardHeader>
            <CardTitle className="text-lg font-light text-slate-50">提出者情報</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div>
                <Label htmlFor="name" className="text-slate-300">
                  <User className="inline h-4 w-4 mr-1" aria-hidden="true" />
                  お名前
                </Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田太郎"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-300">
                  <Mail className="inline h-4 w-4 mr-1" aria-hidden="true" />
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@example.com"
                  className="mt-1"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* アップロードドロップゾーン */}
        <div className="mb-6">
          <UploadDropZone
            onFileDrop={addFilesToInbox}
            isUploading={isSubmitting}
          />
        </div>

        {/* 選択中ファイルの割り当て（ファイル選択時のみ表示、モバイル/デスクトップ共通） */}
        <div className="mb-6">
          <MobileTapAssigner
            selectedFiles={inboxFiles.filter(f => selectedInboxIds.has(f.id))}
            slots={slots}
            onAssign={(slotId) => assignFilesToSlot(selectedInboxIds, slotId)}
          />
        </div>

        {/* ツーペインレイアウト */}
        <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-2 gap-6'}`}>
          {/* 左カラム: ファイル置き場 */}
          <InboxColumn
            files={inboxFiles}
            selectedIds={selectedInboxIds}
            onSelectionChange={setSelectedInboxIds}
            onSelectAll={() => setSelectedInboxIds(new Set(inboxFiles.map(f => f.id)))}
            isMobile={isMobile}
          />

          {/* 右カラム: 提出先 */}
          <TargetsColumn
            slots={slots}
            assignments={slotAssignments}
            onDirectDrop={handleDirectDropToSlot}
            onRemoveFile={handleRemoveFileFromSlot}
            onViewImage={openLightbox}
            activeDragSlotId={overSlotId}
          />
        </div>

        {/* 提出ボタン */}
        <div className="mt-8 flex flex-col items-center gap-3">
          {submitError && (
            <p
              role="alert"
              className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-center max-w-md"
            >
              {submitError}
            </p>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="px-12 h-11"
          >
            {isSubmitting ? '提出中…' : '提出する'}
          </Button>
        </div>

        {/* ライトボックス */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
              onClick={() => setLightboxImage(null)}
              role="dialog"
              aria-modal="true"
              aria-label={lightboxImage.name}
            >
              <button
                ref={lightboxCloseButtonRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImage(null);
                }}
                aria-label="閉じる"
                className="absolute top-4 right-4 h-11 w-11 flex items-center justify-center rounded-full bg-slate-800/80 text-slate-200 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
              <img
                src={lightboxImage.url}
                alt={lightboxImage.name}
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  );
}
