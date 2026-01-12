"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Database,
  Plus,
  Search,
  Globe,
  Rss,
  Code,
  MoreVertical,
  Trash2,
  Edit2,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

// Mock data
const mockSources = [
  {
    id: "1",
    name: "Federal Reserve",
    type: "RSS",
    url: "https://www.federalreserve.gov/feeds/press_all.xml",
    category: "MACRO",
    trustScore: 95,
    language: "en",
    isActive: true,
    lastFetch: new Date("2025-01-12T08:00:00"),
    fetchErrors: 0,
    articlesCount: 1250,
  },
  {
    id: "2",
    name: "CoinDesk",
    type: "RSS",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    category: "CRYPTO",
    trustScore: 85,
    language: "en",
    isActive: true,
    lastFetch: new Date("2025-01-12T07:30:00"),
    fetchErrors: 0,
    articlesCount: 3420,
  },
  {
    id: "3",
    name: "Reuters World News",
    type: "API",
    url: "https://api.reuters.com/v1/news",
    category: "GEOPOLITICS",
    trustScore: 90,
    language: "en",
    isActive: true,
    lastFetch: new Date("2025-01-12T07:45:00"),
    fetchErrors: 1,
    articlesCount: 2180,
  },
  {
    id: "4",
    name: "CoinGlass Flows",
    type: "API",
    url: "https://api.coinglass.com/api/futures/liquidation",
    category: "CRYPTO",
    trustScore: 80,
    language: "en",
    isActive: true,
    lastFetch: new Date("2025-01-12T08:00:00"),
    fetchErrors: 0,
    articlesCount: 890,
  },
  {
    id: "5",
    name: "FRED (Federal Reserve Economic Data)",
    type: "API",
    url: "https://api.stlouisfed.org/fred/series",
    category: "MACRO",
    trustScore: 98,
    language: "en",
    isActive: false,
    lastFetch: new Date("2025-01-10T12:00:00"),
    fetchErrors: 3,
    articlesCount: 450,
  },
]

const categoryConfig = {
  MACRO: { label: "Macro", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  CRYPTO: { label: "Crypto", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  GEOPOLITICS: { label: "Geopolitique", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  MARKETS: { label: "Marches", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  REGULATION: { label: "Regulation", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
}

const typeConfig = {
  RSS: { icon: Rss, color: "text-orange-500" },
  API: { icon: Code, color: "text-blue-500" },
  SCRAPER: { icon: Globe, color: "text-purple-500" },
}

function SourceRow({ source }: { source: typeof mockSources[0] }) {
  const TypeIcon = typeConfig[source.type as keyof typeof typeConfig]?.icon || Globe
  const category = categoryConfig[source.category as keyof typeof categoryConfig]

  return (
    <Card className={`${!source.isActive ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800`}>
            <TypeIcon className={`h-5 w-5 ${typeConfig[source.type as keyof typeof typeConfig]?.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                {source.name}
              </p>
              <Badge variant="outline" className={`text-xs ${category?.color}`}>
                {category?.label}
              </Badge>
              {!source.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Inactif
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-500 truncate">{source.url}</p>
          </div>

          {/* Trust Score */}
          <div className="hidden md:block w-24">
            <div className="flex items-center gap-2">
              <Progress value={source.trustScore} className="h-2" />
              <span className="text-xs font-medium">{source.trustScore}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Trust score</p>
          </div>

          {/* Status */}
          <div className="hidden lg:flex items-center gap-2">
            {source.fetchErrors > 0 ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            )}
            <div className="text-xs">
              <p className="text-zinc-900 dark:text-zinc-50">
                {source.articlesCount.toLocaleString()} articles
              </p>
              <p className="text-zinc-500">
                {format(source.lastFetch, "HH:mm", { locale: fr })}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <RefreshCw className="mr-2 h-4 w-4" />
                Rafraichir maintenant
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Voir les articles
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit2 className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

function AddSourceDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Ajouter une source
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter une source</DialogTitle>
          <DialogDescription>
            Configurez une nouvelle source de donnees pour la veille.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" placeholder="Federal Reserve News" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select defaultValue="RSS">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RSS">RSS Feed</SelectItem>
                <SelectItem value="API">API REST</SelectItem>
                <SelectItem value="SCRAPER">Web Scraper</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categorie</Label>
            <Select defaultValue="MACRO">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MACRO">Macro / Economie</SelectItem>
                <SelectItem value="CRYPTO">Crypto</SelectItem>
                <SelectItem value="GEOPOLITICS">Geopolitique</SelectItem>
                <SelectItem value="MARKETS">Marches</SelectItem>
                <SelectItem value="REGULATION">Regulation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="trust">Trust Score (0-100)</Label>
            <Input id="trust" type="number" defaultValue="50" min="0" max="100" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Activer immediatement</Label>
            <Switch id="active" defaultChecked />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Annuler</Button>
          <Button>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function SourcesPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const activeSources = mockSources.filter((s) => s.isActive)
  const totalArticles = mockSources.reduce((acc, s) => acc + s.articlesCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Gestion des sources
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Configurez les sources de donnees pour la veille automatique
          </p>
        </div>
        <AddSourceDialog />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <Database className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockSources.length}</p>
                <p className="text-xs text-zinc-500">Sources</p>
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
                <p className="text-2xl font-bold">{activeSources.length}</p>
                <p className="text-xs text-zinc-500">Actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalArticles.toLocaleString()}</p>
                <p className="text-xs text-zinc-500">Articles collectes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <XCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockSources.filter((s) => s.fetchErrors > 0).length}
                </p>
                <p className="text-xs text-zinc-500">Avec erreurs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Rechercher une source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="MACRO">Macro</SelectItem>
            <SelectItem value="CRYPTO">Crypto</SelectItem>
            <SelectItem value="GEOPOLITICS">Geopolitique</SelectItem>
            <SelectItem value="MARKETS">Marches</SelectItem>
            <SelectItem value="REGULATION">Regulation</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-1 h-4 w-4" />
          Tout rafraichir
        </Button>
      </div>

      {/* Sources list */}
      <div className="space-y-3">
        {mockSources.map((source) => (
          <SourceRow key={source.id} source={source} />
        ))}
      </div>
    </div>
  )
}
