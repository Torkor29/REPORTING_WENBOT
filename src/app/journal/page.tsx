"use client"

import { useState } from "react"
import { format, subDays } from "date-fns"
import { fr } from "date-fns/locale"
import {
  BookOpen,
  Upload,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit2,
  MessageSquare,
  Image as ImageIcon,
  MoreVertical,
  ChevronDown,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { KPICard } from "@/components/shared/kpi-card"
import { EmptyState } from "@/components/shared/empty-state"
import { WinRateChart } from "@/components/charts/trades-chart"

// Mock trades data
const mockTrades = [
  {
    id: "1",
    instrument: "BTC-USDT",
    direction: "LONG",
    status: "CLOSED",
    entryPrice: 42500,
    exitPrice: 44200,
    size: 0.5,
    leverage: 2,
    pnl: 850,
    pnlPercent: 4.0,
    entryTime: subDays(new Date(), 2),
    exitTime: subDays(new Date(), 1),
    tags: ["trend-follow", "breakout"],
    hasNote: true,
    hasAttachment: true,
  },
  {
    id: "2",
    instrument: "ETH-USDT",
    direction: "LONG",
    status: "CLOSED",
    entryPrice: 2280,
    exitPrice: 2195,
    size: 2,
    leverage: 3,
    pnl: -510,
    pnlPercent: -3.7,
    entryTime: subDays(new Date(), 5),
    exitTime: subDays(new Date(), 4),
    tags: ["mean-reversion"],
    hasNote: true,
    hasAttachment: false,
  },
  {
    id: "3",
    instrument: "BTC-USDT",
    direction: "SHORT",
    status: "CLOSED",
    entryPrice: 45800,
    exitPrice: 44500,
    size: 0.3,
    leverage: 2,
    pnl: 390,
    pnlPercent: 2.8,
    entryTime: subDays(new Date(), 7),
    exitTime: subDays(new Date(), 6),
    tags: ["reversal", "resistance"],
    hasNote: false,
    hasAttachment: false,
  },
  {
    id: "4",
    instrument: "SOL-USDT",
    direction: "LONG",
    status: "OPEN",
    entryPrice: 98.5,
    exitPrice: null,
    size: 10,
    leverage: 2,
    pnl: null,
    pnlPercent: null,
    entryTime: new Date(),
    exitTime: null,
    tags: ["momentum"],
    hasNote: false,
    hasAttachment: false,
  },
]

const mockStats = {
  totalTrades: 47,
  winRate: 62.5,
  totalPnl: 12450,
  avgWin: 3.2,
  avgLoss: -1.8,
  profitFactor: 1.85,
  maxWin: 8.5,
  maxLoss: -4.2,
}

function TradeRow({ trade }: { trade: typeof mockTrades[0] }) {
  const isProfit = trade.pnl !== null && trade.pnl > 0
  const isOpen = trade.status === "OPEN"

  return (
    <div className="flex items-center gap-4 rounded-lg border border-zinc-100 bg-white p-4 hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      {/* Direction indicator */}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          trade.direction === "LONG"
            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        {trade.direction === "LONG" ? (
          <TrendingUp className="h-5 w-5" />
        ) : (
          <TrendingDown className="h-5 w-5" />
        )}
      </div>

      {/* Main info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            {trade.instrument}
          </span>
          <Badge variant="secondary" className="text-xs">
            {trade.direction}
          </Badge>
          {isOpen && (
            <Badge variant="warning" className="text-xs">
              OPEN
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Entry: ${trade.entryPrice.toLocaleString()}</span>
          {trade.exitPrice && (
            <span>Exit: ${trade.exitPrice.toLocaleString()}</span>
          )}
          <span>Size: {trade.size}</span>
          <span>Leverage: {trade.leverage}x</span>
        </div>
      </div>

      {/* Tags */}
      <div className="hidden md:flex flex-wrap gap-1">
        {trade.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* PnL */}
      <div className="text-right">
        {trade.pnl !== null ? (
          <>
            <p
              className={`font-semibold ${
                isProfit
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isProfit ? "+" : ""}${trade.pnl.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500">
              {isProfit ? "+" : ""}
              {trade.pnlPercent?.toFixed(2)}%
            </p>
          </>
        ) : (
          <p className="text-sm text-zinc-500">En cours</p>
        )}
      </div>

      {/* Indicators */}
      <div className="flex items-center gap-2">
        {trade.hasNote && (
          <MessageSquare className="h-4 w-4 text-zinc-400" />
        )}
        {trade.hasAttachment && (
          <ImageIcon className="h-4 w-4 text-zinc-400" />
        )}
      </div>

      {/* Date */}
      <div className="hidden lg:block text-right text-xs text-zinc-500 w-24">
        <p>{format(trade.entryTime, "d MMM", { locale: fr })}</p>
        <p>{format(trade.entryTime, "HH:mm")}</p>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" />
            Voir details
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit2 className="mr-2 h-4 w-4" />
            Ajouter note
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ImageIcon className="mr-2 h-4 w-4" />
            Ajouter capture
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function ImportDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-1 h-4 w-4" />
          Importer CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importer des trades</DialogTitle>
          <DialogDescription>
            Importez vos trades depuis un fichier CSV. Le format attendu est detaille ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-zinc-200 p-8 text-center dark:border-zinc-700">
            <Upload className="mx-auto h-8 w-8 text-zinc-400" />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Glissez un fichier CSV ici ou cliquez pour parcourir
            </p>
            <Button variant="outline" className="mt-4">
              Parcourir
            </Button>
          </div>
          <div className="text-xs text-zinc-500 space-y-1">
            <p><strong>Format attendu :</strong></p>
            <code className="block bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-[10px]">
              timestamp,instrument,direction,size,entry_price,exit_price,pnl,pnl_percent,tags
            </code>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Annuler</Button>
          <Button disabled>Importer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TradeNoteDialog({ trade }: { trade: typeof mockTrades[0] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Ajouter note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Note de trade</DialogTitle>
          <DialogDescription>
            {trade.instrument} - {trade.direction} - {format(trade.entryTime, "d MMMM yyyy", { locale: fr })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intention">Intention du trade</Label>
            <Textarea
              id="intention"
              placeholder="Pourquoi ce trade a ete pris..."
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Contexte marche</Label>
            <Textarea
              id="context"
              placeholder="Conditions de marche, tendance, volatilite..."
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rules">Regles de strategie</Label>
            <Textarea
              id="rules"
              placeholder="Quelles regles ont declenche ce trade..."
              className="min-h-[60px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lessons">Lecons apprises</Label>
            <Textarea
              id="lessons"
              placeholder="Ce qu'on peut retenir de ce trade..."
              className="min-h-[60px]"
            />
          </div>
          <div>
            <Label>Captures d'ecran</Label>
            <div className="mt-2 rounded-lg border-2 border-dashed border-zinc-200 p-4 text-center dark:border-zinc-700">
              <ImageIcon className="mx-auto h-6 w-6 text-zinc-400" />
              <p className="mt-1 text-xs text-zinc-500">Glissez des images ici</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Annuler</Button>
          <Button>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function JournalPage() {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Trade Journal
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Historique et analyse de tous les trades
          </p>
        </div>
        <div className="flex gap-2">
          <ImportDialog />
          <TradeNoteDialog trade={mockTrades[0]} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Trades"
          value={mockStats.totalTrades}
          subtitle="Ce mois"
          icon={<BookOpen className="h-6 w-6 text-blue-600" />}
        />
        <KPICard
          title="Win Rate"
          value={`${mockStats.winRate}%`}
          subtitle={`Profit Factor: ${mockStats.profitFactor}`}
          trend="up"
          icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
        />
        <KPICard
          title="PnL Total"
          value={mockStats.totalPnl}
          format="currency"
          trend="up"
          icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
        />
        <KPICard
          title="Avg Win / Loss"
          value={`+${mockStats.avgWin}% / ${mockStats.avgLoss}%`}
          subtitle={`Max: +${mockStats.maxWin}% / ${mockStats.maxLoss}%`}
          icon={<TrendingDown className="h-6 w-6 text-red-600" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Rechercher par instrument, tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="open">Ouverts</SelectItem>
            <SelectItem value="closed">Fermes</SelectItem>
            <SelectItem value="profit">Gagnants</SelectItem>
            <SelectItem value="loss">Perdants</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="30d">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
            <SelectItem value="90d">90 derniers jours</SelectItem>
            <SelectItem value="ytd">Annee en cours</SelectItem>
            <SelectItem value="all">Tout</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Filter className="mr-1 h-4 w-4" />
          Plus de filtres
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-2">
          {mockTrades.map((trade) => (
            <TradeRow key={trade.id} trade={trade} />
          ))}
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-6 lg:grid-cols-2">
            <WinRateChart
              data={{
                wins: 29,
                losses: 16,
                breakeven: 2,
              }}
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistiques detaillees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Meilleur trade</span>
                    <span className="font-semibold text-emerald-600">+{mockStats.maxWin}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Pire trade</span>
                    <span className="font-semibold text-red-600">{mockStats.maxLoss}%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Gain moyen</span>
                    <span className="font-semibold">+{mockStats.avgWin}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Perte moyenne</span>
                    <span className="font-semibold">{mockStats.avgLoss}%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Profit Factor</span>
                    <span className="font-semibold">{mockStats.profitFactor}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-8">
              <EmptyState
                title="Calendrier des trades"
                description="Vue calendrier disponible prochainement"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
