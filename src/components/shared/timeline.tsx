import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { AlertCircle, Bot, TrendingUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface TimelineEvent {
  id: string
  date: Date
  type: "market" | "bot" | "risk" | "strategy"
  title: string
  description: string
  impact: "positive" | "negative" | "neutral"
}

interface TimelineProps {
  events: TimelineEvent[]
  className?: string
}

const eventTypeConfig = {
  market: {
    icon: TrendingUp,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-300 dark:border-blue-700",
  },
  bot: {
    icon: Bot,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-300 dark:border-purple-700",
  },
  risk: {
    icon: AlertCircle,
    bgColor: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-300 dark:border-red-700",
  },
  strategy: {
    icon: Zap,
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-300 dark:border-amber-700",
  },
}

const impactConfig = {
  positive: "border-l-emerald-500",
  negative: "border-l-red-500",
  neutral: "border-l-zinc-300 dark:border-l-zinc-600",
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("relative space-y-4", className)}>
      {/* Vertical line */}
      <div className="absolute left-5 top-0 h-full w-0.5 bg-zinc-200 dark:bg-zinc-700" />

      {events.map((event, index) => {
        const config = eventTypeConfig[event.type]
        const Icon = config.icon

        return (
          <div key={event.id} className="relative flex gap-4">
            {/* Icon */}
            <div
              className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                config.bgColor,
                config.borderColor
              )}
            >
              <Icon className={cn("h-5 w-5", config.iconColor)} />
            </div>

            {/* Content */}
            <div
              className={cn(
                "flex-1 rounded-lg border border-l-4 bg-white p-4 shadow-sm dark:bg-zinc-950",
                impactConfig[event.impact]
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {event.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {event.description}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                  {format(event.date, "d MMM yyyy", { locale: fr })}
                </time>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
