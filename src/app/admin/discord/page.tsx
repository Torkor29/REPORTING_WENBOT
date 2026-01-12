"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  MessageSquare,
  Plus,
  Settings,
  Send,
  Eye,
  Trash2,
  CheckCircle,
  Copy,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock webhooks
const mockWebhooks = [
  {
    id: "1",
    name: "Canal Investisseurs",
    channelName: "#investor-reports",
    webhookUrl: "https://discord.com/api/webhooks/xxx/yyy",
    postWeekly: true,
    postMonthly: true,
    autoPost: false,
    isActive: true,
    lastPostedAt: new Date("2025-01-06T08:15:00"),
  },
  {
    id: "2",
    name: "Alertes Equipe",
    channelName: "#team-alerts",
    webhookUrl: "https://discord.com/api/webhooks/aaa/bbb",
    postWeekly: true,
    postMonthly: false,
    autoPost: true,
    isActive: true,
    lastPostedAt: new Date("2025-01-12T09:00:00"),
  },
]

// Mock Discord message preview
const mockDiscordPreview = `**Veille Hebdomadaire - Semaine du 6-12 Janvier 2025**

**Macro / Economie**
La Fed maintient ses taux a 5.25-5.50%. L'inflation (CPI) ressort a 2.9% vs 3.0% attendu.

**Points cles:**
- Taux Fed inchanges
- CPI legerement sous les attentes
- Marche du travail reste solide

**Crypto**
ETF Bitcoin spot: +$1.2B d'afflux nets cette semaine. BlackRock domine les volumes.

**A surveiller:**
- FOMC le 15 janvier
- Expiration options BTC vendredi
- Correlation BTC/SPX elevee

---
*Ce contenu est genere automatiquement. Ne constitue pas un conseil en investissement.*`

function WebhookCard({ webhook }: { webhook: typeof mockWebhooks[0] }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {webhook.name}
              </p>
              {webhook.isActive ? (
                <Badge variant="success" className="text-xs">Actif</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Inactif</Badge>
              )}
            </div>
            <p className="text-sm text-zinc-500">{webhook.channelName}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                {webhook.postWeekly && <Badge variant="outline">Hebdo</Badge>}
                {webhook.postMonthly && <Badge variant="outline">Mensuel</Badge>}
              </div>
              {webhook.autoPost ? (
                <span className="text-amber-600">Auto-post</span>
              ) : (
                <span>Validation manuelle</span>
              )}
            </div>
            <div className="text-right">
              <p>Dernier post</p>
              <p className="font-medium">{format(webhook.lastPostedAt, "d MMM HH:mm", { locale: fr })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Send className="mr-1 h-4 w-4" />
              Test
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

function AddWebhookDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Ajouter un webhook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un webhook Discord</DialogTitle>
          <DialogDescription>
            Configurez un webhook pour poster automatiquement les rapports.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" placeholder="Canal Investisseurs" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook">URL du webhook</Label>
            <Input id="webhook" placeholder="https://discord.com/api/webhooks/..." />
            <p className="text-xs text-zinc-500">
              <a href="https://support.discord.com/hc/en-us/articles/228383668" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                Comment creer un webhook Discord
                <ExternalLink className="inline ml-1 h-3 w-3" />
              </a>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="channel">Nom du channel (optionnel)</Label>
            <Input id="channel" placeholder="#investor-reports" />
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Poster le digest hebdo</Label>
                <p className="text-xs text-zinc-500">Chaque lundi matin</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Poster le rapport mensuel</Label>
                <p className="text-xs text-zinc-500">Le 1er de chaque mois</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-post</Label>
                <p className="text-xs text-zinc-500">Poster sans validation manuelle</p>
              </div>
              <Switch />
            </div>
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

export default function DiscordPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(mockDiscordPreview)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Integration Discord
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Configurez les webhooks et previsualisation des messages
          </p>
        </div>
        <AddWebhookDialog />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockWebhooks.length}</p>
                <p className="text-xs text-zinc-500">Webhooks configures</p>
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
                <p className="text-2xl font-bold">{mockWebhooks.filter(w => w.isActive).length}</p>
                <p className="text-xs text-zinc-500">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-zinc-500">Messages envoyes (30j)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks ({mockWebhooks.length})</TabsTrigger>
          <TabsTrigger value="preview">Previsualisation</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-3">
          {mockWebhooks.map((webhook) => (
            <WebhookCard key={webhook.id} webhook={webhook} />
          ))}
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Previsualisation Discord</CardTitle>
              <CardDescription>
                Apercu du message tel qu'il apparaitra sur Discord
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-[#36393f] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600">
                    <span className="text-white font-bold">IH</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Investor Hub</span>
                      <Badge className="bg-[#5865f2] text-white text-[10px]">BOT</Badge>
                      <span className="text-xs text-[#72767d]">Aujourd'hui a 08:15</span>
                    </div>
                    <div className="mt-2 text-sm text-[#dcddde] whitespace-pre-wrap font-[Whitney,Helvetica]">
                      {mockDiscordPreview}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <CheckCircle className="mr-1 h-4 w-4 text-emerald-500" />
                      Copie !
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-4 w-4" />
                      Copier le texte
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template de message</CardTitle>
              <CardDescription>
                Personnalisez le format des messages Discord
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template hebdomadaire</Label>
                <Textarea
                  className="min-h-[200px] font-mono text-sm"
                  defaultValue={`**Veille Hebdomadaire - Semaine du {{week_start}} - {{week_end}}**

{{#each sections}}
**{{category}}**
{{summary}}

{{/each}}

**A surveiller:**
{{#each risks}}
- {{this}}
{{/each}}

---
*Ce contenu est genere automatiquement. Ne constitue pas un conseil en investissement.*`}
                />
                <p className="text-xs text-zinc-500">
                  Variables disponibles: {`{{week_start}}, {{week_end}}, {{sections}}, {{risks}}`}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Reinitialiser</Button>
                <Button>Sauvegarder</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
