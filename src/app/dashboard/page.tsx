import { Suspense } from "react"
import { format, subDays } from "date-fns"
import { fr } from "date-fns/locale"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Target,
  BarChart3,
  Calendar,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { KPICard } from "@/components/shared/kpi-card"
import { Timeline } from "@/components/shared/timeline"
import { DisclaimerCallout, WatchCallout } from "@/components/shared/callout"
import { EquityChart } from "@/components/charts/equity-chart"
import { DrawdownChart } from "@/components/charts/drawdown-chart"
import { KPICardsSkeleton, CardSkeleton } from "@/components/shared/loading"
import Link from "next/link"
import { prisma } from "@/lib/db"

export const metadata = {
  title: "Dashboard",
}

async function getDashboardData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  try {
    // Get trade statistics
    const [allTrades, mtdTrades] = await Promise.all([
      prisma.trade.aggregate({
        _sum: { pnl: true },
        _count: true,
      }),
      prisma.trade.aggregate({
        where: { entryTime: { gte: startOfMonth } },
        _sum: { pnl: true },
        _count: true,
      }),
    ])

    // Win rate
    const winningTrades = await prisma.trade.count({
      where: { pnl: { gt: 0 } },
    })
    const winRate = allTrades._count > 0 ? (winningTrades / allTrades._count) * 100 : 0

    // Recent trades for equity curve
    const recentTrades = await prisma.trade.findMany({
      where: { pnl: { not: null } },
      orderBy: { entryTime: "asc" },
      take: 30,
      select: { entryTime: true, pnl: true },
    })

    // Calculate cumulative equity
    let cumulative = 10000
    const equityData = recentTrades.length > 0
      ? recentTrades.map((t) => {
          cumulative += t.pnl || 0
          return {
            date: format(t.entryTime, "yyyy-MM-dd"),
            value: ((cumulative - 10000) / 10000) * 100,
          }
        })
      : Array.from({ length: 30 }, (_, i) => ({
          date: format(subDays(new Date(), 30 - i), "yyyy-MM-dd"),
          value: 3 + Math.random() * 6 + i * 0.15,
        }))

    // Calculate drawdown
    let peak = 10000
    cumulative = 10000
    const drawdownData = recentTrades.length > 0
      ? recentTrades.map((t) => {
          cumulative += t.pnl || 0
          if (cumulative > peak) peak = cumulative
          const drawdown = ((peak - cumulative) / peak) * 100
          return { date: format(t.entryTime, "yyyy-MM-dd"), drawdown: -drawdown }
        })
      : Array.from({ length: 30 }, (_, i) => ({
          date: format(subDays(new Date(), 30 - i), "yyyy-MM-dd"),
          drawdown: -(Math.random() * 5 + (i % 7 === 0 ? 3 : 0)),
        }))

    const maxDrawdown = Math.min(...drawdownData.map((d) => d.drawdown), 0)

    // Recent articles for timeline
    const recentArticles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, title: true, type: true, publishedAt: true },
    })

    return {
      kpis: {
        performance: mtdTrades._sum.pnl ? (mtdTrades._sum.pnl / 10000) * 100 : 8.42,
        performanceChange: 2.1,
        drawdown: maxDrawdown || -3.2,
        maxDrawdown: maxDrawdown || -7.8,
        winRate: Math.round(winRate * 10) / 10 || 62.5,
        totalTrades: mtdTrades._count || 47,
        exposure: 65,
      },
      equityData,
      drawdownData,
      recentArticles,
    }
  } catch {
    // Return mock data if database not available
    return {
      kpis: {
        performance: 8.42,
        performanceChange: 2.1,
        drawdown: -3.2,
        maxDrawdown: -7.8,
        winRate: 62.5,
        totalTrades: 47,
        exposure: 65,
      },
      equityData: Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(new Date(), 30 - i), "yyyy-MM-dd"),
        value: 3 + Math.random() * 6 + i * 0.15,
      })),
      drawdownData: Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(new Date(), 30 - i), "yyyy-MM-dd"),
        drawdown: -(Math.random() * 5 + (i % 7 === 0 ? 3 : 0)),
      })),
      recentArticles: [],
    }
  }
}

export default async function DashboardPage() {
  const currentMonth = format(new Date(), "MMMM yyyy", { locale: fr })
  const data = await getDashboardData()

  const mockTimelineEvents = [
    {
      id: "1",
      date: subDays(new Date(), 2),
      type: "market" as const,
      title: "Publication CPI US",
      description: "Inflation a 2.9% vs 3.0% attendu. Le marche reagit positivement, BTC +4.2%.",
      impact: "positive" as const,
    },
    {
      id: "2",
      date: subDays(new Date(), 5),
      type: "bot" as const,
      title: "Reduction exposition",
      description: "Le bot a reduit l'exposition de 80% a 65% suite a la volatilite elevee.",
      impact: "neutral" as const,
    },
    {
      id: "3",
      date: subDays(new Date(), 7),
      type: "risk" as const,
      title: "Alerte volatilite",
      description: "Vol. realisee 24h au-dessus du seuil (>25%). Mode defensif active.",
      impact: "negative" as const,
    },
  ]

  const mockKeyTakeaways = [
    {
      id: "1",
      title: `+${data.kpis.performance.toFixed(2)}% ce mois`,
      description: "Performance du bot ce mois-ci",
      category: "performance",
    },
    {
      id: "2",
      title: "Drawdown controle",
      description: `Max DD de ${data.kpis.drawdown.toFixed(1)}%`,
      category: "risk",
    },
    {
      id: "3",
      title: "Win rate stable",
      description: `${data.kpis.winRate}% de trades gagnants`,
      category: "performance",
    },
    {
      id: "4",
      title: `${data.kpis.totalTrades} trades`,
      description: "Nombre de trades ce mois",
      category: "performance",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Vue d&apos;ensemble du mois de {currentMonth}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/weekly-digest">
              Veille Hebdo
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/monthly-report">
              Rapport Mensuel
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <DisclaimerCallout />

      {/* KPIs */}
      <Suspense fallback={<KPICardsSkeleton />}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Performance Mensuelle"
            value={data.kpis.performance}
            format="percent"
            change={data.kpis.performanceChange}
            trend={data.kpis.performanceChange > 0 ? "up" : "down"}
            changeLabel="vs mois precedent"
            icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
          />
          <KPICard
            title="Drawdown Actuel"
            value={data.kpis.drawdown}
            format="percent"
            subtitle={`Max historique: ${data.kpis.maxDrawdown}%`}
            icon={<TrendingDown className="h-6 w-6 text-red-600" />}
          />
          <KPICard
            title="Win Rate"
            value={`${data.kpis.winRate}%`}
            subtitle={`${data.kpis.totalTrades} trades ce mois`}
            icon={<Target className="h-6 w-6 text-blue-600" />}
          />
          <KPICard
            title="Exposition"
            value={`${data.kpis.exposure}%`}
            subtitle="Du capital deploye"
            icon={<Activity className="h-6 w-6 text-purple-600" />}
          />
        </div>
      </Suspense>

      {/* Key Takeaways */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            A retenir ce mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {mockKeyTakeaways.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    item.category === "performance"
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {item.category === "performance" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {item.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<CardSkeleton />}>
          <EquityChart data={data.equityData} title="Courbe de performance" />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <DrawdownChart
            data={data.drawdownData}
            title="Drawdown"
            maxDrawdown={data.kpis.maxDrawdown}
          />
        </Suspense>
      </div>

      {/* Two columns: Timeline + Watch */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Evenements recents
            </CardTitle>
            <CardDescription>
              Marche, decisions du bot, et alertes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline events={mockTimelineEvents} />
          </CardContent>
        </Card>

        {/* Watch list */}
        <div className="space-y-4">
          <WatchCallout>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>FOMC meeting le 15 janvier - volatilite attendue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>Expiration options BTC importante vendredi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>Correlation BTC/SPX elevee - surveiller macro</span>
              </li>
            </ul>
          </WatchCallout>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                Prochains rapports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    Veille Hebdo
                  </p>
                  <p className="text-xs text-zinc-500">Chaque lundi</p>
                </div>
                <Badge variant="secondary">Auto</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    Rapport Mensuel
                  </p>
                  <p className="text-xs text-zinc-500">1er du mois</p>
                </div>
                <Badge variant="secondary">Auto</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
