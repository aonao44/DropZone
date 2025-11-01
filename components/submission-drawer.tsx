"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, AlertCircle, CheckCircle2, FileImage, Link2, MessageSquare } from "lucide-react"

interface SubmissionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: {
    name: string
    email: string
    submittedAt: string
    status: "completed" | "partial"
    items: Array<{
      label: string
      value: string
      status: "ok" | "missing"
      type: "file" | "url" | "text"
    }>
  }
}

export function SubmissionDrawer({ open, onOpenChange, submission }: SubmissionDrawerProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "file":
        return FileImage
      case "url":
        return Link2
      case "text":
        return MessageSquare
      default:
        return FileImage
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{submission.name}</SheetTitle>
          <SheetDescription>{submission.email}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">提出日時</div>
            <div className="text-sm font-medium">{submission.submittedAt}</div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">提出内容</h3>
            {submission.items.map((item, index) => {
              const Icon = getIcon(item.type)
              return (
                <div key={index} className="rounded-lg border border-border/40 bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{item.label}</p>
                        {item.status === "ok" ? (
                          <Badge variant="success" className="shrink-0">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            OK
                          </Badge>
                        ) : (
                          <Badge variant="error" className="shrink-0">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            不足
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground font-mono">{item.value}</p>
                      {item.type === "file" && item.status === "ok" && (
                        <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                          <Download className="mr-2 h-3 w-3" />
                          ダウンロード
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent">
              不足としてマーク
            </Button>
            <Button className="flex-1 gradient-primary">
              <Download className="mr-2 h-4 w-4" />
              全てダウンロード
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
