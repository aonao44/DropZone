import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { ProgressBar } from "@/components/progress-bar"
import { Button } from "@/components/ui/button"
import { Calendar, Users, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  id: string
  title: string
  status: "completed" | "partial" | "pending"
  progress: number
  deadline: string
  submitters: number
  totalSubmitters: number
  className?: string
}

export function ProjectCard({
  id,
  title,
  status,
  progress,
  deadline,
  submitters,
  totalSubmitters,
  className,
}: ProjectCardProps) {
  const isOverdue = new Date(deadline) < new Date() && status !== "completed"

  return (
    <Card className={cn("border-glow bg-card transition-all duration-200 hover:glow-blue-sm", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg">{title}</CardTitle>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">進捗</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className={cn(isOverdue && "text-error font-semibold")}>
              {isOverdue ? "期限切れ" : `期限: ${deadline}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {submitters}/{totalSubmitters}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 bg-transparent" asChild>
            <Link href={`/dashboard/projects/${id}`}>詳細を見る</Link>
          </Button>
          <Button variant="outline" size="icon" className="bg-transparent" asChild>
            <Link href={`/s/${id}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
