import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"

type Status = "completed" | "partial" | "pending"

interface StatusBadgeProps {
  status: Status
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    completed: {
      label: "完了",
      variant: "success" as const,
      icon: CheckCircle2,
    },
    partial: {
      label: "一部不足",
      variant: "warning" as const,
      icon: AlertCircle,
    },
    pending: {
      label: "未提出",
      variant: "error" as const,
      icon: Clock,
    },
  }

  const { label, variant, icon: Icon } = config[status]

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
