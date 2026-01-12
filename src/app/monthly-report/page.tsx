import { Suspense } from "react"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { fr } from "date-fns/locale"
import {
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Copy,
  Download,
  Share2,
  Bot,
  Calendar,
  Activity,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DisclaimerCallout,
  ExplainerCallout,
  RiskCallout,
  WatchCallout,
} from "@/components/shared/callout"
import { StatusBadge } from "@/components/shared/status-badge"
import { KPICard } from "@/components/shared/kpi-card"
import { Timeline } from "@/components/shared/timeline"
import { EquityChart } from "@/components/charts/equity-chart"
import { DrawdownChart } from "@/components/charts/drawdown-chart"
import { TradesPnLChart, WinRateChart } from "@/components/charts/trades-chart"
import { CardSkeleton } from "@/components/shared/loading"

// Mock data
const mockMonthlyReport = {
  month: new Date(),
  status: "published",
  kpis: {
    performance: 8.42,
    benchmark: 5.2,
    drawdown: -3.2,
    maxDrawdown: -7.8,
    volatility: 12.5,
    winRate: 62.5,
    totalTrades: 47,
    profitFactor: 1.85,
    sharpeRatio: 1.42,
  },
  executiveSummary: [
    "Performance de +8.42% sur le mois, surperformant le BTC (+5.2%)",
    "Drawdown maximum controle a -3.2%, bien en dessous de la limite historique",
    "47 trades executes avec un win rate de 62.5%",
    "Exposition moyenne de 65% du capital, politique defensive maintenue",
    "Volatilite de marche elevee, gestion active du risque",
  ],
  marketContext: `Le mois de janvier a ete marque par une volatilite importante sur les marches crypto, principalement liee aux flux entrants des nouveaux ETF Bitcoin spot. Le BTC a oscille entre $38,500 et $48,000, avec une tendance haussiere soutenue par les achats institutionnels.

La Reserve federale a maintenu sa politique de taux stables, tout en signalant une approche prudente pour 2025. L'inflation reste au-dessus de la cible de 2%, mais la trajectoire est descendante.

Les tensions geopolitiques en Mer Rouge ont eu un impact limite sur les marches crypto, mais ont contribue a l'incertitude generale.`,
  volatilityPeriods: [
    {
      start: "2025-01-08",
      end: "2025-01-10",
      description: "Publication CPI + reaction Fed",
      severity: "high",
    },
    {
      start: "2025-01-15",
      end: "2025-01-16",
      description: "Expiration options importantes",
      severity: "medium",
    },
    {
      start: "2025-01-22",
      end: "2025-01-23",
      description: "Annonce ETF BlackRock record",
      severity: "low",
    },
  ],
  botDecisions: [
    {
      date: "2025-01-03",
      decision: "Augmentation exposition 60% → 70%",
      reason: "Signal haussier confirme, support $40k solide",
      outcome: "Positif (+2.1% capture)",
    },
    {
      date: "2025-01-08",
      decision: "Reduction exposition 70% → 55%",
      reason: "Volatilite pre-CPI, protection capital",
      outcome: "Positif (evite -4% intraday)",
    },
    {
      date: "2025-01-12",
      decision: "Retour exposition normale 65%",
      reason: "Volatilite normalisee post-CPI",
      outcome: "Neutre",
    },
    {
      date: "2025-01-20",
      decision: "Mode defensif active",
      reason: "Correlation elevee avec equities, incertitude macro",
      outcome: "En cours",
    },
  ],
  positives: [
    "Surperformance vs benchmark BTC de +3.22%",
    "Gestion du risque efficace lors des pics de volatilite",
    "Win rate stable au-dessus de 60%",
    "Profit factor de 1.85, bien au-dessus du seuil de 1.5",
    "Aucune perte superieure a 1% du capital sur un trade",
  ],
  vigilancePoints: [
    "Correlation avec les marches traditionnels reste elevee",
    "Volatilite implicite toujours au-dessus de la moyenne",
    "Exposition reduite limite le potentiel de gains en cas de rally",
    "Concentration sur BTC - diversification limitee",
  ],
  faq: [
    {
      question: "Pourquoi le bot n'a-t-il pas profite davantage du rally de mi-janvier ?",
      answer: "Le bot privilegie la preservation du capital. L'exposition a ete reduite avant le CPI pour proteger les gains. Cette approche prudente a evite une perte potentielle de -4% lors de la volatilite du 8 janvier, meme si elle a limite les gains lors du rebond subsequent.",
    },
    {
      question: "Comment le bot decide-t-il de son niveau d'exposition ?",
      answer: "L'exposition est determinee par un modele multi-factoriel incluant : volatilite realisee et implicite, correlation avec les actifs traditionnels, force de la tendance, niveaux de support/resistance, et indicateurs de sentiment. En periode d'incertitude, l'exposition est systematiquement reduite.",
    },
    {
      question: "Quelle est la strategie pour les periodes de forte volatilite ?",
      answer: "Le bot passe en mode 'defensif' avec : reduction de l'exposition maximale, stops plus serres, et preference pour les positions a court terme. L'objectif est de minimiser les pertes potentielles plutot que de maximiser les gains.",
    },
    {
      question: "Comment interpreter le Sharpe ratio de 1.42 ?",
      answer: "Un Sharpe ratio au-dessus de 1 est considere comme bon, au-dessus de 2 comme excellent. Notre ratio de 1.42 indique un rendement ajuste au risque satisfaisant. Cela signifie que le bot genere des rendements superieurs au risque pris.",
    },
    {
      question: "Y a-t-il des frais preleves sur la performance ?",
      answer: "La structure de frais est detaillee dans la documentation investisseur. En resume : 0% de frais de gestion, 20% de frais de performance au-dessus du high-water mark, preleves trimestriellement.",
    },
  ],
  glossary: [
    { term: "Drawdown", definition: "Baisse maximale du capital par rapport a son plus haut. Exprime en pourcentage." },
    { term: "Win Rate", definition: "Pourcentage de trades clotures en profit. 60%+ est considere comme bon." },
    { term: "Profit Factor", definition: "Ratio gains totaux / pertes totales. Superieur a 1.5 est l'objectif." },
    { term: "Sharpe Ratio", definition: "Rendement ajuste au risque. Mesure la performance par unite de risque prise." },
    { term: "Exposition", definition: "Pourcentage du capital investi sur le marche. 100% = capital totalement investi." },
    { term: "Risk-off", definition: "Phase de marche ou les investisseurs fuient les actifs risques vers les valeurs refuges." },
  ],
}

// Mock chart data
const mockEquityData = Array.from({ length: 30 }, (_, i) => ({
  date: format(new Date(2025, 0, i + 1), "yyyy-MM-dd"),
  value: 3 + Math.random() * 6 + i * 0.2,
}))

const mockDrawdownData = Array.from({ length: 30 }, (_, i) => ({
  date: format(new Date(2025, 0, i + 1), "yyyy-MM-dd"),
  drawdown: -(Math.random() * 4 + (i % 7 === 0 ? 2 : 0)),
}))

const mockTradesData = Array.from({ length: 15 }, (_, i) => ({
  date: format(new Date(2025, 0, i * 2 + 1), "yyyy-MM-dd"),
  pnl: (Math.random() - 0.4) * 3,
  instrument: "BTC-USDT",
}))

export const metadata = {
  title: "Rapport Mensuel",
}

export default function MonthlyReportPage() {
  const monthLabel = format(mockMonthlyReport.month, "MMMM yyyy", { locale: fr })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Rapport Mensuel
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {monthLabel}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Copy className="mr-1 h-4 w-4" />
            Discord
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-1 h-4 w-4" />
            Partager
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-4">
        <StatusBadge status="published" />
        <span className="text-sm text-zinc-500">
          Publie le {format(new Date(), "d MMMM 'a' HH:mm", { locale: fr })}
        </span>
      </div>

      {/* Disclaimer */}
      <DisclaimerCallout />

      {/* Executive Summary */}
      <Card className="border-l-4 border-l-zinc-900 dark:border-l-zinc-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume Executif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mockMonthlyReport.executiveSummary.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                {point}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Performance"
          value={mockMonthlyReport.kpis.performance}
          format="percent"
          subtitle={`Benchmark: +${mockMonthlyReport.kpis.benchmark}%`}
          trend="up"
          icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
        />
        <KPICard
          title="Drawdown Max"
          value={mockMonthlyReport.kpis.drawdown}
          format="percent"
          subtitle={`Historique: ${mockMonthlyReport.kpis.maxDrawdown}%`}
          icon={<TrendingDown className="h-6 w-6 text-red-600" />}
        />
        <KPICard
          title="Sharpe Ratio"
          value={mockMonthlyReport.kpis.sharpeRatio.toFixed(2)}
          subtitle="Rendement ajuste au risque"
          icon={<Activity className="h-6 w-6 text-blue-600" />}
        />
        <KPICard
          title="Win Rate"
          value={`${mockMonthlyReport.kpis.winRate}%`}
          subtitle={`${mockMonthlyReport.kpis.totalTrades} trades`}
          icon={<Shield className="h-6 w-6 text-purple-600" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EquityChart data={mockEquityData} title="Performance mensuelle" />
        <DrawdownChart
          data={mockDrawdownData}
          title="Drawdown"
          maxDrawdown={mockMonthlyReport.kpis.maxDrawdown}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TradesPnLChart data={mockTradesData} title="PnL par trade" />
        <WinRateChart
          data={{
            wins: 29,
            losses: 16,
            breakeven: 2,
          }}
        />
      </div>

      {/* Market Context */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contexte de marche
          </CardTitle>
        </CardHeader>
        <CardContent className="prose-investor max-w-none">
          <div className="whitespace-pre-line text-sm">
            {mockMonthlyReport.marketContext}
          </div>
        </CardContent>
      </Card>

      {/* Volatility Periods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Periodes de volatilite
          </CardTitle>
          <CardDescription>
            Detection automatique des periodes de volatilite elevee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockMonthlyReport.volatilityPeriods.map((period, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {period.description}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {format(new Date(period.start), "d MMM", { locale: fr })} - {format(new Date(period.end), "d MMM", { locale: fr })}
                  </p>
                </div>
                <Badge
                  variant={
                    period.severity === "high"
                      ? "destructive"
                      : period.severity === "medium"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {period.severity === "high" ? "Elevee" : period.severity === "medium" ? "Moderee" : "Faible"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bot Decisions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            Decisions du bot (niveau macro)
          </CardTitle>
          <CardDescription>
            Principales decisions strategiques prises ce mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMonthlyReport.botDecisions.map((decision, i) => (
              <div key={i} className="border-l-2 border-purple-200 dark:border-purple-800 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-zinc-500">
                    {format(new Date(decision.date), "d MMMM", { locale: fr })}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {decision.outcome}
                  </Badge>
                </div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">
                  {decision.decision}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Raison: {decision.reason}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Positives & Vigilance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
              Points positifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mockMonthlyReport.positives.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Points de vigilance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mockMonthlyReport.vigilancePoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            FAQ Investisseur
          </CardTitle>
          <CardDescription>
            Reponses aux questions frequentes ce mois
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockMonthlyReport.faq.map((item, i) => (
            <div key={i} className="space-y-2">
              <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">
                Q: {item.question}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
                {item.answer}
              </p>
              {i < mockMonthlyReport.faq.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Next month */}
      <WatchCallout>
        <p className="font-semibold mb-2">Ce que nous surveillons pour le mois prochain :</p>
        <ul className="space-y-1 text-sm">
          <li>Evolution des flux ETF post-premiere semaine</li>
          <li>Decisions de la Fed le 31 janvier</li>
          <li>Halving Bitcoin prevu en avril - impact sur la volatilite</li>
          <li>Correlation persistante avec les indices actions</li>
        </ul>
      </WatchCallout>

      {/* Glossary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Glossaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {mockMonthlyReport.glossary.map((item, i) => (
              <div key={i} className="text-xs">
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {item.term}:
                </span>{" "}
                <span className="text-zinc-600 dark:text-zinc-400">
                  {item.definition}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
