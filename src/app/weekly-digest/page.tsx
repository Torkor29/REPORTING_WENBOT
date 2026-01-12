import { Suspense } from "react"
import { format, subWeeks, startOfWeek, endOfWeek } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Newspaper,
  Building2,
  Bitcoin,
  Globe,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Bot,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DisclaimerCallout, ExplainerCallout, RiskCallout } from "@/components/shared/callout"
import { StatusBadge } from "@/components/shared/status-badge"
import { CardSkeleton } from "@/components/shared/loading"
import Link from "next/link"

// Mock data for demonstration
const mockWeeklyDigests = [
  {
    id: "1",
    weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
    weekEnd: endOfWeek(new Date(), { weekStartsOn: 1 }),
    status: "published",
    sections: {
      macro: {
        title: "Fed maintient ses taux, signaux mixtes sur 2025",
        summary: "La Reserve federale a maintenu ses taux directeurs inchanges lors de sa reunion du 10 janvier. Jerome Powell a indique que l'inflation restait 'persistante' mais que les conditions s'amelioraient progressivement.",
        facts: [
          "Taux Fed funds inchanges a 5.25-5.50%",
          "CPI a 2.9% vs 3.0% attendu",
          "Marche du travail reste solide avec 216k emplois crees",
        ],
        importance: "Les marches anticipent desormais 2 a 3 baisses de taux en 2025 contre 5 precedemment. Cela impacte directement les actifs risques comme le BTC.",
        impact: "Le bot reste en mode neutre avec une exposition moderee. La volatilite implicite reste elevee, justifiant notre approche prudente.",
        sources: [
          { title: "Fed Statement", url: "https://federalreserve.gov" },
          { title: "Bureau of Labor Statistics", url: "https://bls.gov" },
        ],
      },
      crypto: {
        title: "ETF Bitcoin : afflux massifs, nouvelle concurrence",
        summary: "Les ETF spot Bitcoin ont enregistre leur meilleure semaine depuis le lancement, avec $1.2B d'afflux nets. BlackRock domine avec IBIT representant 65% des volumes.",
        facts: [
          "ETF BTC spot : +$1.2B d'afflux nets cette semaine",
          "GBTC continue les sorties : -$320M",
          "BTC dominance stable a 52.3%",
          "ETH gas fees au plus bas depuis 2 ans",
        ],
        importance: "Les flux institutionnels soutiennent le prix mais GBTC reste une source de pression vendeuse. L'equilibre entre les deux determine la tendance court terme.",
        impact: "Le bot a identifie un biais haussier modere et a augmente l'exposition de 60% a 70% sur BTC.",
        sources: [
          { title: "Bloomberg ETF Data", url: "https://bloomberg.com" },
          { title: "CoinGlass Flows", url: "https://coinglass.com" },
        ],
      },
      geopolitics: {
        title: "Tensions Mer Rouge : impact sur les chaines logistiques",
        summary: "Les attaques des Houthis en Mer Rouge continuent de perturber le trafic maritime. Les armateurs rallongent les trajets via le Cap de Bonne-Esperance, ajoutant 10-15 jours de transit.",
        facts: [
          "40% du commerce maritime mondial passe par la Mer Rouge",
          "Cout du fret container x2.5 depuis novembre",
          "Prix du petrole stable grace aux reserves US",
        ],
        importance: "L'impact inflationniste reste pour l'instant limite aux biens importes. A surveiller si la situation perdure au-dela de Q1.",
        impact: "Pas d'impact direct sur la strategie crypto, mais le bot surveille les correlations avec les marches traditionnels.",
        sources: [
          { title: "Reuters", url: "https://reuters.com" },
          { title: "Financial Times", url: "https://ft.com" },
        ],
      },
    },
    botImpact: {
      bias: "neutre-haussier",
      exposureChange: "+10%",
      risksIdentified: ["Volatilite FOMC", "Expiration options", "GBTC outflows"],
      opportunities: ["Support $40k tient", "ETF inflows", "Saisonnalite favorable"],
    },
  },
  {
    id: "2",
    weekStart: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
    weekEnd: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
    status: "published",
    sections: {
      macro: { title: "Semaine calme avant le CPI" },
      crypto: { title: "Consolidation autour de $42k" },
      geopolitics: { title: "Pas de developpement majeur" },
    },
  },
]

const currentDigest = mockWeeklyDigests[0]

export const metadata = {
  title: "Veille Hebdomadaire",
}

function CategorySection({
  icon: Icon,
  title,
  section,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  section: {
    title: string
    summary: string
    facts: string[]
    importance: string
    impact: string
    sources: Array<{ title: string; url: string }>
  }
  color: string
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{section.title}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{section.summary}</p>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Les faits
          </h4>
          <ul className="space-y-1">
            {section.facts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <ExplainerCallout title="Pourquoi c'est important">
          {section.importance}
        </ExplainerCallout>

        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/30">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
              Impact sur le bot
            </span>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300">{section.impact}</p>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Sources
          </h4>
          <div className="flex flex-wrap gap-2">
            {section.sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                {source.title}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function WeeklyDigestPage() {
  const weekLabel = `${format(currentDigest.weekStart, "d", { locale: fr })} - ${format(currentDigest.weekEnd, "d MMMM yyyy", { locale: fr })}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Veille Hebdomadaire
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Semaine du {weekLabel}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Copy className="mr-1 h-4 w-4" />
            Copier Discord
          </Button>
          <Button variant="outline" size="sm">
            Archives
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-4">
        <StatusBadge status="published" />
        <span className="text-sm text-zinc-500">
          Genere automatiquement le {format(new Date(), "d MMMM 'a' HH:mm", { locale: fr })}
        </span>
      </div>

      {/* Disclaimer */}
      <DisclaimerCallout />

      {/* Week selector tabs */}
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Cette semaine</TabsTrigger>
          <TabsTrigger value="previous">Semaine precedente</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Bot Impact Summary */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                Synthese : Impact sur le bot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Biais identifie
                  </p>
                  <Badge variant="secondary" className="text-sm">
                    {currentDigest.botImpact.bias}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Changement exposition
                  </p>
                  <p className="text-lg font-semibold text-emerald-600">
                    {currentDigest.botImpact.exposureChange}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Risques identifies
                  </p>
                  <ul className="space-y-1">
                    {currentDigest.botImpact.risksIdentified.map((risk, i) => (
                      <li key={i} className="text-xs text-red-600 dark:text-red-400">
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Opportunites
                  </p>
                  <ul className="space-y-1">
                    {currentDigest.botImpact.opportunities.map((opp, i) => (
                      <li key={i} className="text-xs text-emerald-600 dark:text-emerald-400">
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-6">
            <CategorySection
              icon={Building2}
              title="Macro / Economie"
              section={currentDigest.sections.macro as any}
              color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            />
            <CategorySection
              icon={Bitcoin}
              title="Crypto / Marches"
              section={currentDigest.sections.crypto as any}
              color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
            />
            <CategorySection
              icon={Globe}
              title="Geopolitique"
              section={currentDigest.sections.geopolitics as any}
              color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            />
          </div>

          {/* Risk callout */}
          <RiskCallout>
            <ul className="mt-2 space-y-1 text-sm">
              <li>FOMC: volatilite attendue autour de l'annonce</li>
              <li>Expiration $2.1B d'options BTC vendredi</li>
              <li>Correlation BTC/SPX reste elevee (0.72)</li>
            </ul>
          </RiskCallout>
        </TabsContent>

        <TabsContent value="previous" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Semaine du {format(mockWeeklyDigests[1].weekStart, "d", { locale: fr })} - {format(mockWeeklyDigests[1].weekEnd, "d MMMM yyyy", { locale: fr })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">
                Consultez les archives pour voir le contenu complet de cette semaine.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href={`/weekly-digest/${mockWeeklyDigests[1].id}`}>
                  Voir le rapport complet
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Methodology */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Sources & Methodologie
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
          <p>
            Ce digest est genere automatiquement chaque lundi matin a partir de sources verifiees :
            Reuters, Bloomberg, Federal Reserve, BLS, CoinGlass, et autres sources institutionnelles.
          </p>
          <p>
            <strong>Processus :</strong> Collecte automatique → Scoring pertinence → Clustering par evenement →
            Redaction assistee par IA → Validation compliance → Publication
          </p>
          <p>
            <strong>Limites :</strong> Ce contenu est fourni a titre informatif. Les analyses ne constituent
            pas des conseils en investissement. Le bot prend ses decisions de maniere autonome.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
