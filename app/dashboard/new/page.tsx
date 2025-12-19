"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Edit2, GripVertical } from "lucide-react";
import { DarkLayout } from "@/components/dark-layout";
import { UserButton, useUser } from "@clerk/nextjs";
import { SlotInput, SlotTemplateKey, SlotAcceptType } from "@/lib/types";
import { TEMPLATE_OPTIONS, ACCEPT_TYPE_OPTIONS, getSlotsFromTemplate } from "@/lib/slot-templates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function NewProjectPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // スロット関連の状態
  const [selectedTemplate, setSelectedTemplate] = useState<SlotTemplateKey>("LP");
  const [slots, setSlots] = useState<SlotInput[]>(() => getSlotsFromTemplate("LP"));
  const [editingSlot, setEditingSlot] = useState<SlotInput | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);

  // ログインユーザーの情報を自動入力
  useEffect(() => {
    if (isLoaded && user) {
      const fullName = user.fullName || user.username || "";
      const userEmail = user.primaryEmailAddress?.emailAddress || "";
      setName(fullName);
      setEmail(userEmail);
    }
  }, [isLoaded, user]);

  // テンプレート変更時
  const handleTemplateChange = (template: SlotTemplateKey) => {
    setSelectedTemplate(template);
    setSlots(getSlotsFromTemplate(template));
  };

  // スロット編集ダイアログを開く
  const openEditDialog = (slot: SlotInput, index: number) => {
    setEditingSlot({ ...slot });
    setEditingIndex(index);
    setIsSlotDialogOpen(true);
  };

  // 新規スロット追加ダイアログを開く
  const openAddDialog = () => {
    setEditingSlot({
      name: "",
      is_required: false,
      accept_type: "ANY",
      sort_order: slots.length,
    });
    setEditingIndex(null);
    setIsSlotDialogOpen(true);
  };

  // スロットを保存
  const saveSlot = () => {
    if (!editingSlot || !editingSlot.name.trim()) return;

    if (editingIndex !== null) {
      // 既存スロットの編集
      setSlots((prev) =>
        prev.map((s, i) => (i === editingIndex ? editingSlot : s))
      );
    } else {
      // 新規スロット追加
      setSlots((prev) => [...prev, { ...editingSlot, sort_order: prev.length }]);
    }
    setIsSlotDialogOpen(false);
    setEditingSlot(null);
    setEditingIndex(null);
  };

  // スロットを削除
  const deleteSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          name,
          email,
          template: selectedTemplate,
          customSlots: selectedTemplate === "CUSTOM" ? slots : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/project/${data.slug}/created`);
      } else {
        console.error("プロジェクト作成に失敗しました");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
      setIsSubmitting(false);
    }
  };

  // accept_typeのラベルを取得
  const getAcceptTypeLabel = (acceptType: SlotAcceptType) => {
    const option = ACCEPT_TYPE_OPTIONS.find((o) => o.value === acceptType);
    return option ? `${option.icon} ${option.label}` : acceptType;
  };

  return (
    <DarkLayout>
      {/* ヘッダー - LPと同じデザイン */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="w-full flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
              <Image
                src="/dropzone-logo.png"
                alt="DropZone"
                width={180}
                height={50}
                className="h-10 w-auto"
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-base text-muted-foreground transition-colors hover:text-foreground">
                ダッシュボード
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="text-base cursor-default hover:bg-transparent">
              🎉 お試し期間実施中！
            </Button>
            <Button
              onClick={() => router.push("/dashboard/new")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-base"
            >
              <Plus className="mr-2 h-4 w-4" />
              新規プロジェクト
            </Button>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9"
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-xl sm:max-w-2xl lg:max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-4 sm:pb-5 p-4 sm:p-5 lg:p-6">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-extralight text-center text-slate-50 tracking-tight">
                新規プロジェクト作成
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base text-center leading-relaxed text-slate-300 font-light">
                プロジェクト情報を入力して、専用の提出フォームを発行しましょう
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* プロジェクト名 */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs sm:text-sm lg:text-base font-light text-slate-200">
                    プロジェクト名 <span className="text-slate-400">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="例: 新規デザインプロジェクト"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base bg-slate-700/30 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500"
                  />
                  <p className="text-xs text-slate-400 font-light">
                    依頼者情報はログイン情報から自動的に設定されます
                  </p>
                </div>

                {/* テンプレート選択 */}
                <div className="space-y-3">
                  <Label className="text-xs sm:text-sm lg:text-base font-light text-slate-200">
                    テンプレート選択
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {TEMPLATE_OPTIONS.map((template) => (
                      <button
                        key={template.value}
                        type="button"
                        onClick={() => handleTemplateChange(template.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedTemplate === template.value
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                        }`}
                      >
                        <div className="font-medium text-sm text-slate-100">{template.label}</div>
                        <div className="text-xs text-slate-400 mt-1">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* スロット一覧 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs sm:text-sm lg:text-base font-light text-slate-200">
                      提出スロット
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openAddDialog}
                      className="h-7 text-xs border-slate-600 bg-slate-700/30 hover:bg-slate-600/50"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      追加
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {slots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/30 border border-slate-600"
                      >
                        <GripVertical className="h-4 w-4 text-slate-500" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-100 truncate">{slot.name}</span>
                            {slot.is_required && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-500/20 text-amber-300">
                                必須
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            {getAcceptTypeLabel(slot.accept_type)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(slot, index)}
                            className="h-7 w-7 p-0 hover:bg-slate-600/50"
                          >
                            <Edit2 className="h-3 w-3 text-slate-400" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSlot(index)}
                            className="h-7 w-7 p-0 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-3 w-3 text-slate-400 hover:text-red-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {slots.length === 0 && (
                      <div className="text-center py-4 text-slate-400 text-sm">
                        スロットがありません。「追加」ボタンから追加してください。
                      </div>
                    )}
                  </div>
                </div>

                {/* 送信ボタン */}
                <div className="pt-3 sm:pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-4 rounded-lg transition-all duration-200 text-sm sm:text-base lg:text-lg hover:scale-105"
                    disabled={isSubmitting || slots.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        作成中...
                      </>
                    ) : (
                      "プロジェクトを作成"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* スロット編集ダイアログ */}
      <Dialog open={isSlotDialogOpen} onOpenChange={setIsSlotDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              {editingIndex !== null ? "スロットを編集" : "スロットを追加"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              提出枠の設定を行います
            </DialogDescription>
          </DialogHeader>

          {editingSlot && (
            <div className="space-y-4 py-4">
              {/* スロット名 */}
              <div className="space-y-2">
                <Label className="text-sm text-slate-200">スロット名</Label>
                <Input
                  value={editingSlot.name}
                  onChange={(e) => setEditingSlot({ ...editingSlot, name: e.target.value })}
                  placeholder="例: ロゴ画像"
                  className="bg-slate-700/30 border-slate-600 text-slate-100"
                />
              </div>

              {/* ファイル種類 */}
              <div className="space-y-2">
                <Label className="text-sm text-slate-200">受け入れファイル種類</Label>
                <Select
                  value={editingSlot.accept_type}
                  onValueChange={(value: SlotAcceptType) =>
                    setEditingSlot({ ...editingSlot, accept_type: value })
                  }
                >
                  <SelectTrigger className="bg-slate-700/30 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {ACCEPT_TYPE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-slate-100 focus:bg-slate-700"
                      >
                        {option.icon} {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 必須フラグ */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_required"
                  checked={editingSlot.is_required}
                  onCheckedChange={(checked) =>
                    setEditingSlot({ ...editingSlot, is_required: checked === true })
                  }
                  className="border-slate-500"
                />
                <Label htmlFor="is_required" className="text-sm text-slate-200">
                  必須スロットにする
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSlotDialogOpen(false)}
              className="border-slate-600 bg-slate-700/30 hover:bg-slate-600/50"
            >
              キャンセル
            </Button>
            <Button
              type="button"
              onClick={saveSlot}
              disabled={!editingSlot?.name.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DarkLayout>
  );
}
