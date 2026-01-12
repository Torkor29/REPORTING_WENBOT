import { TrendingDown, TrendingUp, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils/cn"

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: number
  changeLabel?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  className?: string
  format?: "percent" | "currency" | "number"
}

export function KPICard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  trend,
  icon,
  className,
  format = "number",
}: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val
    switch (format) {
      case "percent":
        return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`
      case "currency":
        return new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(val)
      default:
        return val.toLocaleString("fr-FR")
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4" />
      case "down":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return "text-zinc-500"
    switch (trend) {
      case "up":
        return "text-emerald-600 dark:text-emerald-400"
      case "down":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-zinc-500 dark:text-zinc-400"
    }
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {title}
            </p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {formatValue(value)}
            </p>
            {subtitle && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {subtitle}
              </p>
            )}
            {change !== undefined && (
              <div className={cn("flex items-center gap-1 text-sm", getTrendColor())}>
                {getTrendIcon()}
                <span>
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)}%
                </span>
                {changeLabel && (
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
