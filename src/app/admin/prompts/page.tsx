"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  MessageSquare,
  Save,
  RotateCcw,
  Play,
  History,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Mock prompts data
const mockPrompts = [
  {
    id: "1",
    agent: "COLLECTOR",
    name: "Collecteur de news",
    description: "Normalise et structure les articles collectes depuis les sources",
    template: `Tu es un assistant specialise dans la collecte et la normalisation de news financieres.

Pour chaque article fourni, tu dois:
1. Extraire le titre principal
2. Identifier la date de publication
3. Resumer le contenu en 2-3 phrases
4. Identifier les entites cles (entreprises, personnes, institutions)
5. Classifier dans une categorie: MACRO, CRYPTO, GEOPOLITICS, MARKETS, REGULATION

Format de sortie JSON:
{
  "title": "...",
  "summary": "...",
  "entities": ["..."],
  "category": "...",
  "relevance_score": 0-100
}`,
    version: 3,
    lastUpdated: new Date("2025-01-10"),
    updatedBy: "Jean Dupont",
  },
  {
    id: "2",
    agent: "RANKER",
    name: "Evaluateur de pertinence",
    description: "Score les articles selon leur pertinence et impact potentiel",
    template: `Tu es un analyste financier specialise dans l'evaluation de news.

Criteres d'evaluation:
- Pertinence pour un bot de trading crypto (0-100)
- Impact potentiel sur les marches (0-100)
- Fiabilite de la source (deja fourni)
- Fraicheur de l'information

Tu dois aussi identifier si l'article est un doublon potentiel d'une news deja vue.

Output format JSON:
{
  "relevance_score": 0-100,
  "impact_score": 0-100,
  "is_duplicate": boolean,
  "duplicate_of_id": null ou "id",
  "key_topics": ["..."]
}`,
    version: 2,
    lastUpdated: new Date("2025-01-08"),
    updatedBy: "Jean Dupont",
  },
  {
    id: "3",
    agent: "WRITER",
    name: "Redacteur de digest",
    description: "Redige le contenu pedagogique du digest hebdomadaire",
    template: `Tu es un redacteur financier senior specialise dans la communication investisseur.

Ton style est:
- Professionnel mais accessible
- Factuel et neutre (jamais "bullish" ou "bearish" sans nuance)
- Pedagogique: tu expliques les concepts techniques
- Structure: Faits -> Importance -> Impact possible -> Vigilance

Regles absolues:
- JAMAIS de promesses ("garanti", "sans risque", "performance assuree")
- TOUJOURS separer faits et interpretations
- TOUJOURS citer les sources
- Inclure un mini-glossaire pour les termes techniques

Structure du digest:
## [Categorie]
### [Titre de l'evenement]
**Ce qui s'est passe:** [faits]
**Pourquoi c'est important:** [explication]
**Impact possible:** [analyse prudente]
**A surveiller:** [risques]
**Sources:** [liens]`,
    version: 5,
    lastUpdated: new Date("2025-01-12"),
    updatedBy: "Marie Martin",
  },
  {
    id: "4",
    agent: "RISK_COMPLIANCE",
    name: "Verificateur compliance",
    description: "Verifie le ton et la conformite des contenus avant publication",
    template: `Tu es un responsable compliance specialise dans la communication financiere.

Ton role est de verifier que le contenu:
1. Ne contient pas de promesses de rendement
2. Ne donne pas de conseils d'investissement directs
3. Inclut les disclaimers necessaires
4. Utilise un ton neutre et factuel
5. Ne contient pas de formulations trompeuses

Mots/expressions interdits:
- "garanti", "sans risque", "sur", "certain"
- "vous devez investir", "achetez", "vendez"
- "va monter", "va baisser" (sans conditionnel)
- "opportunite unique", "ne ratez pas"

Output:
{
  "is_compliant": boolean,
  "issues": ["..."],
  "suggestions": ["..."],
  "risk_level": "low" | "medium" | "high"
}`,
    version: 2,
    lastUpdated: new Date("2025-01-05"),
    updatedBy: "Jean Dupont",
  },
]

const mockVersions = [
  { version: 5, date: new Date("2025-01-12"), author: "Marie Martin", comment: "Ajout structure mini-glossaire" },
  { version: 4, date: new Date("2025-01-08"), author: "Jean Dupont", comment: "Clarification regles sources" },
  { version: 3, date: new Date("2025-01-02"), author: "Marie Martin", comment: "Ajout section A surveiller" },
  { version: 2, date: new Date("2024-12-20"), author: "Jean Dupont", comment: "Premiere version stable" },
  { version: 1, date: new Date("2024-12-15"), author: "Jean Dupont", comment: "Version initiale" },
]

function PromptEditor({ prompt }: { prompt: typeof mockPrompts[0] }) {
  const [content, setContent] = useState(prompt.template)
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (value: string) => {
    setContent(value)
    setHasChanges(value !== prompt.template)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
            {prompt.name}
          </h3>
          <p className="text-sm text-zinc-500">{prompt.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">v{prompt.version}</Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="mr-1 h-4 w-4" />
                Historique
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Historique des versions</DialogTitle>
                <DialogDescription>
                  Versions precedentes du prompt "{prompt.name}"
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {mockVersions.map((v) => (
                    <div
                      key={v.version}
                      className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">v{v.version}</Badge>
                          <span className="text-sm font-medium">{v.author}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">{v.comment}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500">
                          {format(v.date, "d MMM yyyy", { locale: fr })}
                        </p>
                        <Button variant="ghost" size="sm" className="mt-1">
                          <RotateCcw className="mr-1 h-3 w-3" />
                          Restaurer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        className="min-h-[300px] font-mono text-sm"
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          Derniere modification par {prompt.updatedBy} le {format(prompt.lastUpdated, "d MMMM yyyy", { locale: fr })}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!hasChanges}>
            <Play className="mr-1 h-4 w-4" />
            Tester
          </Button>
          <Button size="sm" disabled={!hasChanges}>
            <Save className="mr-1 h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PromptsPage() {
  const [selectedAgent, setSelectedAgent] = useState("WRITER")

  const selectedPrompt = mockPrompts.find((p) => p.agent === selectedAgent)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Templates de prompts
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gerez les prompts des agents LLM
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Agent list */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Agents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockPrompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => setSelectedAgent(prompt.agent)}
                className={`w-full text-left rounded-lg p-3 transition-colors ${
                  selectedAgent === prompt.agent
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                    {prompt.agent}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                  {prompt.name}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Main - Editor */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            {selectedPrompt && <PromptEditor prompt={selectedPrompt} />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
