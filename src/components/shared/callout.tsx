import { AlertCircle, AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface CalloutProps {
  type: "info" | "warning" | "error" | "success" | "tip"
  title?: string
  children: React.ReactNode
  className?: string
}

const calloutConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-900 dark:text-blue-100",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    titleColor: "text-amber-900 dark:text-amber-100",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-900 dark:text-red-100",
  },
  success: {
    icon: CheckCircle2,
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    titleColor: "text-emerald-900 dark:text-emerald-100",
  },
  tip: {
    icon: Lightbulb,
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    iconColor: "text-purple-600 dark:text-purple-400",
    titleColor: "text-purple-900 dark:text-purple-100",
  },
}

export function Callout({ type, title, children, className }: CalloutProps) {
  const config = calloutConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-4",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 space-y-1">
        {title && (
          <p className={cn("font-semibold text-sm", config.titleColor)}>{title}</p>
        )}
        <div className="text-sm text-zinc-700 dark:text-zinc-300">{children}</div>
      </div>
    </div>
  )
}

// Specific callouts for investor reporting
export function DisclaimerCallout({ className }: { className?: string }) {
  return (
    <Callout type="warning" title="Avertissement" className={className}>
      Ce document est fourni a titre informatif uniquement et ne constitue pas un conseil en investissement.
      Les performances passees ne garantissent pas les resultats futurs.
    </Callout>
  )
}

export function RiskCallout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Callout type="error" title="Points de vigilance" className={className}>
      {children}
    </Callout>
  )
}

export function ExplainerCallout({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <Callout type="info" title={`En clair : ${title}`} className={className}>
      {children}
    </Callout>
  )
}

export function WatchCallout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Callout type="tip" title="A surveiller" className={className}>
      {children}
    </Callout>
  )
}
