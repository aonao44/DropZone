"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"

const projectSchema = z.object({
  title: z.string().min(1, "プロジェクト名は必須です"),
  description: z.string().optional(),
  deadline: z.string().min(1, "期限は必須です"),
})

type ProjectFormData = z.infer<typeof projectSchema>

export function NewProjectModal() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  })

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "プロジェクト作成完了",
        description: `「${data.title}」を作成しました。`,
      })

      setOpen(false)
      reset()
    } catch (error) {
      toast({
        title: "エラー",
        description: "プロジェクトの作成に失敗しました。",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary glow-blue-sm hover:glow-blue">
          <Plus className="mr-2 h-4 w-4" />
          新規プロジェクト
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新規プロジェクト作成</DialogTitle>
          <DialogDescription>プロジェクトの基本情報を入力してください。</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">プロジェクト名 *</Label>
              <Input id="title" {...register("title")} placeholder="新規Webサイト制作" className="focus-glow" />
              {errors.title && <p className="text-sm text-error">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="プロジェクトの概要を入力..."
                className="focus-glow resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">期限 *</Label>
              <Input id="deadline" type="date" {...register("deadline")} className="focus-glow" />
              {errors.deadline && <p className="text-sm text-error">{errors.deadline.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-transparent">
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gradient-primary">
              {isSubmitting ? "作成中..." : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
