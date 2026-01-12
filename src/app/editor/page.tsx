"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Edit3,
  Plus,
  FileText,
  AlertTriangle,
  Settings,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  Copy,
  Send,
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
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import Link from "next/link"

// Mock articles data
const mockArticles = [
  {
    id: "1",
    type: "MANUAL_ANALYSIS",
    status: "published",
    title: "Analyse : Impact du halving sur notre strategie",
    excerpt: "Le halving Bitcoin prevu en avril 2024 aura des implications sur la volatilite...",
    author: "Jean Dupont",
    createdAt: new Date("2025-01-10"),
    publishedAt: new Date("2025-01-11"),
    updatedAt: new Date("2025-01-11"),
  },
  {
    id: "2",
    type: "STRATEGY_CHANGE",
    status: "in_review",
    title: "Changement de strategie : Ajustement des seuils de volatilite",
    excerpt: "Suite aux conditions de marche du Q4, nous ajustons les parametres...",
    author: "Marie Martin",
    createdAt: new Date("2025-01-08"),
    publishedAt: null,
    updatedAt: new Date("2025-01-09"),
  },
  {
    id: "3",
    type: "INCIDENT",
    status: "draft",
    title: "Post-mortem : Arret temporaire du bot le 5 janvier",
    excerpt: "Un probleme de connexion API a cause un arret de 2 heures...",
    author: "Jean Dupont",
    createdAt: new Date("2025-01-06"),
    publishedAt: null,
    updatedAt: new Date("2025-01-06"),
  },
  {
    id: "4",
    type: "TRADE_REVIEW",
    status: "draft",
    title: "Review : Trade BTC du 3 janvier",
    excerpt: "Analyse detaillee du trade long BTC qui a genere +4.2%...",
    author: "Marie Martin",
    createdAt: new Date("2025-01-04"),
    publishedAt: null,
    updatedAt: new Date("2025-01-04"),
  },
]

const articleTypeConfig = {
  MANUAL_ANALYSIS: {
    label: "Analyse",
    icon: FileText,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  INCIDENT: {
    label: "Incident",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
  STRATEGY_CHANGE: {
    label: "Strategie",
    icon: Settings,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  },
  TRADE_REVIEW: {
    label: "Trade Review",
    icon: TrendingUp,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
}

function ArticleCard({ article }: { article: typeof mockArticles[0] }) {
  const typeConfig = articleTypeConfig[article.type as keyof typeof articleTypeConfig]
  const Icon = typeConfig.icon

  return (
    <Card className="hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeConfig.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {typeConfig.label}
              </Badge>
              <StatusBadge status={article.status as any} showIcon={false} />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
              {article.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
              <span>{article.author}</span>
              <span>
                Modifie le {format(article.updatedAt, "d MMM", { locale: fr })}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/editor/${article.id}`}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Previsualiser
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Dupliquer
              </DropdownMenuItem>
              {article.status === "draft" && (
                <DropdownMenuItem>
                  <Send className="mr-2 h-4 w-4" />
                  Soumettre pour revue
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
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

function NewArticleDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Nouvel article
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Creer un article</DialogTitle>
          <DialogDescription>
            Choisissez un modele pour commencer votre article.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {Object.entries(articleTypeConfig).map(([type, config]) => {
            const Icon = config.icon
            return (
              <Link
                key={type}
                href={`/editor/new?type=${type}`}
                className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${config.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {config.label}
                </span>
              </Link>
            )
          })}
        </div>
        <DialogFooter>
          <Button variant="outline">Annuler</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function EditorPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredArticles = mockArticles.filter((article) => {
    if (statusFilter !== "all" && article.status !== statusFilter) return false
    if (typeFilter !== "all" && article.type !== typeFilter) return false
    if (search && !article.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const draftCount = mockArticles.filter((a) => a.status === "draft").length
  const reviewCount = mockArticles.filter((a) => a.status === "in_review").length
  const publishedCount = mockArticles.filter((a) => a.status === "published").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Editeur d'articles
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Redigez et publiez des analyses, incidents, et changements de strategie
          </p>
        </div>
        <NewArticleDialog />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <FileText className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {mockArticles.length}
                </p>
                <p className="text-xs text-zinc-500">Total articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Edit3 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {draftCount}
                </p>
                <p className="text-xs text-zinc-500">Brouillons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {reviewCount}
                </p>
                <p className="text-xs text-zinc-500">En revue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Send className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {publishedCount}
                </p>
                <p className="text-xs text-zinc-500">Publies</p>
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
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="in_review">En revue</SelectItem>
            <SelectItem value="published">Publies</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="MANUAL_ANALYSIS">Analyse</SelectItem>
            <SelectItem value="INCIDENT">Incident</SelectItem>
            <SelectItem value="STRATEGY_CHANGE">Strategie</SelectItem>
            <SelectItem value="TRADE_REVIEW">Trade Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Articles list */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tous ({mockArticles.length})</TabsTrigger>
          <TabsTrigger value="draft">Brouillons ({draftCount})</TabsTrigger>
          <TabsTrigger value="review">En revue ({reviewCount})</TabsTrigger>
          <TabsTrigger value="published">Publies ({publishedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {filteredArticles.length === 0 ? (
            <EmptyState
              title="Aucun article"
              description="Commencez par creer votre premier article."
              action={{ label: "Creer un article", onClick: () => {} }}
            />
          ) : (
            filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-3">
          {mockArticles
            .filter((a) => a.status === "draft")
            .map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
        </TabsContent>

        <TabsContent value="review" className="space-y-3">
          {mockArticles
            .filter((a) => a.status === "in_review")
            .map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
        </TabsContent>

        <TabsContent value="published" className="space-y-3">
          {mockArticles
            .filter((a) => a.status === "published")
            .map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
