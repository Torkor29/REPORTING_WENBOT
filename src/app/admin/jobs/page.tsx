"use client"

import { useState } from "react"
import { format, formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Zap,
  Play,
  Pause,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Settings,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Mock data
const mockJobSchedules = [
  {
    id: "1",
    type: "WEEKLY_COLLECT",
    name: "Collecte Hebdomadaire",
    description: "Collecte les articles des sources pour la veille hebdo",
    cronExpr: "0 6 * * 1",
    cronHuman: "Tous les lundis a 6h",
    isActive: true,
    lastRunAt: new Date("2025-01-06T06:00:00"),
    nextRunAt: new Date("2025-01-13T06:00:00"),
    lastDuration: 145000,
    lastStatus: "COMPLETED",
  },
  {
    id: "2",
    type: "WEEKLY_WRITE",
    name: "Redaction Hebdomadaire",
    description: "Genere le digest hebdo a partir des articles collectes",
    cronExpr: "0 8 * * 1",
    cronHuman: "Tous les lundis a 8h",
    isActive: true,
    lastRunAt: new Date("2025-01-06T08:00:00"),
    nextRunAt: new Date("2025-01-13T08:00:00"),
    lastDuration: 320000,
    lastStatus: "COMPLETED",
  },
  {
    id: "3",
    type: "MONTHLY_GENERATE",
    name: "Rapport Mensuel",
    description: "Genere le rapport mensuel complet",
    cronExpr: "0 9 1 * *",
    cronHuman: "Le 1er de chaque mois a 9h",
    isActive: true,
    lastRunAt: new Date("2025-01-01T09:00:00"),
    nextRunAt: new Date("2025-02-01T09:00:00"),
    lastDuration: 480000,
    lastStatus: "COMPLETED",
  },
  {
    id: "4",
    type: "SOURCE_FETCH",
    name: "Fetch Sources",
    description: "Recupere les nouveaux articles des sources actives",
    cronExpr: "0 */4 * * *",
    cronHuman: "Toutes les 4 heures",
    isActive: true,
    lastRunAt: new Date("2025-01-12T08:00:00"),
    nextRunAt: new Date("2025-01-12T12:00:00"),
    lastDuration: 45000,
    lastStatus: "COMPLETED",
  },
  {
    id: "5",
    type: "CLEANUP",
    name: "Nettoyage",
    description: "Supprime les anciennes donnees et logs",
    cronExpr: "0 3 * * 0",
    cronHuman: "Tous les dimanches a 3h",
    isActive: false,
    lastRunAt: new Date("2025-01-05T03:00:00"),
    nextRunAt: null,
    lastDuration: 12000,
    lastStatus: "COMPLETED",
  },
]

const mockJobRuns = [
  {
    id: "1",
    type: "WEEKLY_COLLECT",
    status: "COMPLETED",
    startedAt: new Date("2025-01-12T06:00:00"),
    finishedAt: new Date("2025-01-12T06:02:25"),
    duration: 145000,
    isManual: false,
    logs: [
      "Starting weekly collection...",
      "Fetching from 5 sources...",
      "Collected 127 articles",
      "Processing duplicates...",
      "Removed 23 duplicates",
      "Scoring articles...",
      "Clustering events...",
      "Created 8 event clusters",
      "Collection completed successfully",
    ],
    errors: [],
  },
  {
    id: "2",
    type: "WEEKLY_WRITE",
    status: "COMPLETED",
    startedAt: new Date("2025-01-12T08:00:00"),
    finishedAt: new Date("2025-01-12T08:05:20"),
    duration: 320000,
    isManual: false,
    logs: [
      "Starting weekly digest generation...",
      "Loading 8 event clusters...",
      "Generating macro section...",
      "Generating crypto section...",
      "Generating geopolitics section...",
      "Running compliance check...",
      "Creating draft article...",
      "Digest generated successfully",
    ],
    errors: [],
  },
  {
    id: "3",
    type: "SOURCE_FETCH",
    status: "FAILED",
    startedAt: new Date("2025-01-12T04:00:00"),
    finishedAt: new Date("2025-01-12T04:00:45"),
    duration: 45000,
    isManual: false,
    logs: [
      "Starting source fetch...",
      "Fetching Federal Reserve...",
      "Fetching CoinDesk...",
      "Error fetching Reuters...",
    ],
    errors: ["Reuters API returned 503: Service Unavailable"],
  },
]

function JobScheduleCard({ schedule }: { schedule: typeof mockJobSchedules[0] }) {
  const statusColors = {
    COMPLETED: "text-emerald-500",
    FAILED: "text-red-500",
    RUNNING: "text-blue-500",
    PENDING: "text-amber-500",
  }

  return (
    <Card className={`${!schedule.isActive ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Zap className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {schedule.name}
              </p>
              {!schedule.isActive && (
                <Badge variant="secondary">Desactive</Badge>
              )}
            </div>
            <p className="text-sm text-zinc-500">{schedule.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {schedule.cronHuman}
              </div>
              {schedule.lastRunAt && (
                <div className="flex items-center gap-1">
                  <CheckCircle className={`h-3 w-3 ${statusColors[schedule.lastStatus as keyof typeof statusColors]}`} />
                  Il y a {formatDistanceToNow(schedule.lastRunAt, { locale: fr })}
                </div>
              )}
            </div>
          </div>
          <div className="text-right text-xs">
            {schedule.nextRunAt && (
              <>
                <p className="text-zinc-500">Prochain run</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {format(schedule.nextRunAt, "d MMM HH:mm", { locale: fr })}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Play className="mr-1 h-3 w-3" />
              Run
            </Button>
            <Button variant="ghost" size="icon-sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function JobRunRow({ run }: { run: typeof mockJobRuns[0] }) {
  const [expanded, setExpanded] = useState(false)

  const statusConfig = {
    COMPLETED: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    FAILED: { icon: XCircle, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
    RUNNING: { icon: RefreshCw, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
    PENDING: { icon: Clock, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" },
  }

  const config = statusConfig[run.status as keyof typeof statusConfig]
  const StatusIcon = config.icon

  return (
    <Card>
      <CardContent className="p-4">
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bg}`}>
            <StatusIcon className={`h-5 w-5 ${config.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {run.type}
              </p>
              {run.isManual && (
                <Badge variant="outline" className="text-xs">Manuel</Badge>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              {format(run.startedAt, "d MMM yyyy HH:mm:ss", { locale: fr })}
              {run.finishedAt && ` - Duree: ${(run.duration / 1000).toFixed(1)}s`}
            </p>
          </div>
          <Badge variant={run.status === "COMPLETED" ? "success" : run.status === "FAILED" ? "destructive" : "secondary"}>
            {run.status}
          </Badge>
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Logs
              </p>
              <ScrollArea className="h-40 rounded-lg bg-zinc-950 p-3">
                <pre className="text-xs text-zinc-300 font-mono">
                  {run.logs.map((log, i) => (
                    <div key={i} className="py-0.5">
                      <span className="text-zinc-500">[{format(new Date(run.startedAt.getTime() + i * 10000), "HH:mm:ss")}]</span>{" "}
                      {log}
                    </div>
                  ))}
                </pre>
              </ScrollArea>
            </div>
            {run.errors.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
                  Erreurs
                </p>
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
                  {run.errors.map((error, i) => (
                    <p key={i}>{error}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function JobsPage() {
  const completedRuns = mockJobRuns.filter((r) => r.status === "COMPLETED").length
  const failedRuns = mockJobRuns.filter((r) => r.status === "FAILED").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Jobs & Scheduler
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gerez les taches automatiques
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockJobSchedules.length}</p>
                <p className="text-xs text-zinc-500">Jobs configures</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedRuns}</p>
                <p className="text-xs text-zinc-500">Runs reussis (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{failedRuns}</p>
                <p className="text-xs text-zinc-500">Echecs (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockJobSchedules.filter((s) => s.isActive).length}
                </p>
                <p className="text-xs text-zinc-500">Jobs actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedules">Schedules ({mockJobSchedules.length})</TabsTrigger>
          <TabsTrigger value="runs">Historique ({mockJobRuns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-3">
          {mockJobSchedules.map((schedule) => (
            <JobScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </TabsContent>

        <TabsContent value="runs" className="space-y-3">
          {mockJobRuns.map((run) => (
            <JobRunRow key={run.id} run={run} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
