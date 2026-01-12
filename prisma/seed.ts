import { PrismaClient, Role, AccountStatus, SourceType, SourceCategory, JobType, PromptAgent, ArticleType, ArticleStatus, TradeDirection, TradeStatus } from "@prisma/client"
import { hash } from "bcryptjs"
import { subDays, subWeeks, format } from "date-fns"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Clean existing data
  await prisma.citation.deleteMany()
  await prisma.articleVersion.deleteMany()
  await prisma.shareLink.deleteMany()
  await prisma.weeklyDigestCluster.deleteMany()
  await prisma.article.deleteMany()
  await prisma.rawArticle.deleteMany()
  await prisma.eventCluster.deleteMany()
  await prisma.source.deleteMany()
  await prisma.tradeNote.deleteMany()
  await prisma.tradeAttachment.deleteMany()
  await prisma.trade.deleteMany()
  await prisma.jobRun.deleteMany()
  await prisma.jobSchedule.deleteMany()
  await prisma.promptVersion.deleteMany()
  await prisma.promptTemplate.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.invite.deleteMany()
  await prisma.allowedEmail.deleteMany()
  await prisma.allowedDomain.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.setting.deleteMany()
  await prisma.discordWebhook.deleteMany()

  // Create users
  const adminPassword = await hash("admin123", 12)
  const admin = await prisma.user.create({
    data: {
      email: "admin@company.com",
      name: "Jean Dupont",
      password: adminPassword,
      role: Role.ADMIN,
      status: AccountStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  const editor = await prisma.user.create({
    data: {
      email: "editor@company.com",
      name: "Marie Martin",
      password: await hash("editor123", 12),
      role: Role.EDITOR,
      status: AccountStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  const viewer = await prisma.user.create({
    data: {
      email: "viewer@company.com",
      name: "Pierre Durand",
      password: await hash("viewer123", 12),
      role: Role.VIEWER,
      status: AccountStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  console.log("Created users")

  // Create allowed domain
  await prisma.allowedDomain.create({
    data: {
      domain: "company.com",
      role: Role.VIEWER,
      isActive: true,
    },
  })

  // Create sources
  const sources = await Promise.all([
    prisma.source.create({
      data: {
        name: "Federal Reserve",
        type: SourceType.RSS,
        url: "https://www.federalreserve.gov/feeds/press_all.xml",
        category: SourceCategory.MACRO,
        trustScore: 95,
        language: "en",
        isActive: true,
      },
    }),
    prisma.source.create({
      data: {
        name: "CoinDesk",
        type: SourceType.RSS,
        url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
        category: SourceCategory.CRYPTO,
        trustScore: 85,
        language: "en",
        isActive: true,
      },
    }),
    prisma.source.create({
      data: {
        name: "Reuters World",
        type: SourceType.API,
        url: "https://api.reuters.com/news",
        category: SourceCategory.GEOPOLITICS,
        trustScore: 90,
        language: "en",
        isActive: true,
      },
    }),
    prisma.source.create({
      data: {
        name: "CoinGlass",
        type: SourceType.API,
        url: "https://api.coinglass.com",
        category: SourceCategory.CRYPTO,
        trustScore: 80,
        language: "en",
        isActive: true,
      },
    }),
  ])

  console.log("Created sources")

  // Create job schedules
  await Promise.all([
    prisma.jobSchedule.create({
      data: {
        type: JobType.WEEKLY_COLLECT,
        cronExpr: "0 6 * * 1",
        timezone: "Europe/Paris",
        isActive: true,
      },
    }),
    prisma.jobSchedule.create({
      data: {
        type: JobType.WEEKLY_WRITE,
        cronExpr: "0 8 * * 1",
        timezone: "Europe/Paris",
        isActive: true,
      },
    }),
    prisma.jobSchedule.create({
      data: {
        type: JobType.MONTHLY_GENERATE,
        cronExpr: "0 9 1 * *",
        timezone: "Europe/Paris",
        isActive: true,
      },
    }),
    prisma.jobSchedule.create({
      data: {
        type: JobType.SOURCE_FETCH,
        cronExpr: "0 */4 * * *",
        timezone: "Europe/Paris",
        isActive: true,
      },
    }),
  ])

  console.log("Created job schedules")

  // Create prompt templates
  await Promise.all([
    prisma.promptTemplate.create({
      data: {
        agent: PromptAgent.COLLECTOR,
        name: "Collecteur de news",
        description: "Normalise et structure les articles collectes",
        template: `Tu es un assistant specialise dans la collecte et la normalisation de news financieres.

Pour chaque article fourni, tu dois:
1. Extraire le titre principal
2. Identifier la date de publication
3. Resumer le contenu en 2-3 phrases
4. Identifier les entites cles
5. Classifier dans une categorie

Format de sortie JSON.`,
        version: 1,
      },
    }),
    prisma.promptTemplate.create({
      data: {
        agent: PromptAgent.RANKER,
        name: "Evaluateur",
        description: "Score les articles selon leur pertinence",
        template: `Tu es un analyste financier specialise dans l'evaluation de news.

Criteres:
- Pertinence pour un bot de trading crypto (0-100)
- Impact potentiel sur les marches (0-100)
- Detection des doublons

Output format JSON.`,
        version: 1,
      },
    }),
    prisma.promptTemplate.create({
      data: {
        agent: PromptAgent.CLUSTERER,
        name: "Groupeur d'evenements",
        description: "Regroupe les articles par evenement",
        template: `Tu analyses des articles et les regroupes par evenement commun.

Output JSON avec les clusters.`,
        version: 1,
      },
    }),
    prisma.promptTemplate.create({
      data: {
        agent: PromptAgent.WRITER,
        name: "Redacteur",
        description: "Redige le contenu pedagogique",
        template: `Tu es un redacteur financier senior.

Style:
- Professionnel mais accessible
- Factuel et neutre
- Pedagogique

Structure: Faits -> Importance -> Impact -> Vigilance

JAMAIS de promesses. TOUJOURS sourcer.`,
        version: 1,
      },
    }),
    prisma.promptTemplate.create({
      data: {
        agent: PromptAgent.RISK_COMPLIANCE,
        name: "Verificateur compliance",
        description: "Verifie le ton et la conformite",
        template: `Tu verifies que le contenu:
1. Ne contient pas de promesses
2. Ne donne pas de conseils
3. Inclut les disclaimers
4. Utilise un ton neutre

Mots interdits: garanti, sans risque, sur, certain`,
        version: 1,
      },
    }),
    prisma.promptTemplate.create({
      data: {
        agent: PromptAgent.MONTHLY_SYNTHESIZER,
        name: "Synthetiseur mensuel",
        description: "Genere le rapport mensuel",
        template: `Tu synthetises les digests hebdos en rapport mensuel complet.

Sections: Resume executif, Contexte, Volatilite, Decisions bot, FAQ.`,
        version: 1,
      },
    }),
    prisma.promptTemplate.create({
      data: {
        agent: PromptAgent.EDITOR_ASSISTANT,
        name: "Assistant editeur",
        description: "Aide a completer les notes de trade",
        template: `Tu aides a rediger les notes de trade en proposant des brouillons.`,
        version: 1,
      },
    }),
  ])

  console.log("Created prompt templates")

  // Create sample trades
  const trades = await Promise.all([
    prisma.trade.create({
      data: {
        instrument: "BTC-USDT",
        direction: TradeDirection.LONG,
        status: TradeStatus.CLOSED,
        size: 0.5,
        leverage: 2,
        entryPrice: 42500,
        exitPrice: 44200,
        pnl: 850,
        pnlPercent: 4.0,
        entryTime: subDays(new Date(), 2),
        exitTime: subDays(new Date(), 1),
        tags: ["trend-follow", "breakout"],
      },
    }),
    prisma.trade.create({
      data: {
        instrument: "ETH-USDT",
        direction: TradeDirection.LONG,
        status: TradeStatus.CLOSED,
        size: 2,
        leverage: 3,
        entryPrice: 2280,
        exitPrice: 2195,
        pnl: -510,
        pnlPercent: -3.7,
        entryTime: subDays(new Date(), 5),
        exitTime: subDays(new Date(), 4),
        tags: ["mean-reversion"],
      },
    }),
    prisma.trade.create({
      data: {
        instrument: "BTC-USDT",
        direction: TradeDirection.SHORT,
        status: TradeStatus.CLOSED,
        size: 0.3,
        leverage: 2,
        entryPrice: 45800,
        exitPrice: 44500,
        pnl: 390,
        pnlPercent: 2.8,
        entryTime: subDays(new Date(), 7),
        exitTime: subDays(new Date(), 6),
        tags: ["reversal", "resistance"],
      },
    }),
    prisma.trade.create({
      data: {
        instrument: "SOL-USDT",
        direction: TradeDirection.LONG,
        status: TradeStatus.OPEN,
        size: 10,
        leverage: 2,
        entryPrice: 98.5,
        entryTime: new Date(),
        tags: ["momentum"],
      },
    }),
  ])

  // Add notes to first trade
  await prisma.tradeNote.create({
    data: {
      tradeId: trades[0].id,
      authorId: editor.id,
      intention: "Breakout confirme au-dessus de $42k avec volume",
      context: "ETF inflows positifs, momentum haussier",
      rules: "Signal breakout + volume + tendance haussiere",
      result: "Target atteint, sortie propre",
      lessons: "Patience sur les breakouts paie",
    },
  })

  console.log("Created trades")

  // Create sample article
  await prisma.article.create({
    data: {
      type: ArticleType.WEEKLY_DIGEST,
      status: ArticleStatus.PUBLISHED,
      title: "Veille Hebdomadaire - Semaine du 6-12 Janvier 2025",
      slug: "weekly-2025-01-06",
      content: `# Veille Hebdomadaire

## Macro / Economie

La Fed maintient ses taux a 5.25-5.50%. L'inflation reste au-dessus de la cible.

**Faits cles:**
- Taux inchanges
- CPI a 2.9%
- Marche du travail solide

## Crypto

ETF Bitcoin spot en forte collecte.

**Faits cles:**
- +$1.2B d'afflux nets
- BTC dominance stable

## A surveiller

- FOMC le 15 janvier
- Expiration options BTC
`,
      summary: "Synthese des evenements macro, crypto et geopolitiques de la semaine.",
      periodStart: subWeeks(new Date(), 1),
      periodEnd: new Date(),
      authorId: admin.id,
      publishedAt: new Date(),
    },
  })

  console.log("Created sample article")

  // Create Discord webhook
  await prisma.discordWebhook.create({
    data: {
      name: "Canal Investisseurs",
      webhookUrl: "https://discord.com/api/webhooks/example",
      channelName: "#investor-reports",
      postWeekly: true,
      postMonthly: true,
      autoPost: false,
      isActive: true,
    },
  })

  console.log("Created Discord webhook")

  // Create settings
  await Promise.all([
    prisma.setting.create({
      data: {
        key: "public_sharing_enabled",
        value: true,
        category: "sharing",
      },
    }),
    prisma.setting.create({
      data: {
        key: "default_share_expiry_days",
        value: 30,
        category: "sharing",
      },
    }),
    prisma.setting.create({
      data: {
        key: "openai_model",
        value: "gpt-4-turbo-preview",
        category: "llm",
      },
    }),
  ])

  console.log("Created settings")

  console.log("Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
