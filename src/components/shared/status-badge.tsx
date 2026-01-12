import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"
import { Clock, CheckCircle, XCircle, AlertCircle, FileEdit, Archive } from "lucide-react"

type StatusType = "draft" | "in_review" | "published" | "archived" | "pending" | "running" | "completed" | "failed"

interface StatusBadgeProps {
  status: StatusType
  showIcon?: boolean
  className?: string
}

const statusConfig: Record<StatusType, {
  label: string
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
  icon: React.ComponentType<{ className?: string }>
}> = {
  draft: {
    label: "Brouillon",
    variant: "secondary",
    icon: FileEdit,
  },
  in_review: {
    label: "En revue",
    variant: "warning",
    icon: Clock,
  },
  published: {
    label: "Publie",
    variant: "success",
    icon: CheckCircle,
  },
  archived: {
    label: "Archive",
    variant: "outline",
    icon: Archive,
  },
  pending: {
    label: "En attente",
    variant: "secondary",
    icon: Clock,
  },
  running: {
    label: "En cours",
    variant: "warning",
    icon: Clock,
  },
  completed: {
    label: "Termine",
    variant: "success",
    icon: CheckCircle,
  },
  failed: {
    label: "Echoue",
    variant: "destructive",
    icon: XCircle,
  },
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant as "default" | "secondary" | "destructive" | "outline"} className={cn("gap-1", className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  )
}
