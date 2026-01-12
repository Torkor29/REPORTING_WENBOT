import { FileText, FolderOpen, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        {icon || <FolderOpen className="h-8 w-8 text-zinc-400" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  )
}

export function NoDataState({ message }: { message?: string }) {
  return (
    <EmptyState
      icon={<FileText className="h-8 w-8 text-zinc-400" />}
      title="Aucune donnee"
      description={message || "Il n'y a pas encore de donnees a afficher."}
    />
  )
}

export function NoResultsState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-zinc-400" />}
      title="Aucun resultat"
      description={`Aucun resultat trouve pour "${query}". Essayez avec d'autres termes.`}
    />
  )
}
