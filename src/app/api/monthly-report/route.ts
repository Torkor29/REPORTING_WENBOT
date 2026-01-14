import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils"
import { ArticleType, ArticleStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  const { searchParams } = new URL(request.url)
  const latest = searchParams.get("latest") === "true"
  const month = searchParams.get("month")
  const year = searchParams.get("year")

  if (latest || (month && year)) {
    // Get specific or latest monthly report
    const where = {
      type: ArticleType.MONTHLY_REPORT,
      status: ArticleStatus.PUBLISHED,
      ...(month &&
        year && {
          periodStart: {
            gte: new Date(parseInt(year), parseInt(month) - 1, 1),
            lt: new Date(parseInt(year), parseInt(month), 1),
          },
        }),
    }

    const report = await prisma.article.findFirst({
      where,
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { name: true } },
      },
    })

    if (!report) {
      // Return mock data
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      // Get real trade stats if available
      const tradeStats = await prisma.trade.aggregate({
        where: {
          entryTime: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { pnl: true },
        _count: true,
      })

      const winningTrades = await prisma.trade.count({
        where: {
          entryTime: { gte: startOfMonth, lte: endOfMonth },
          pnl: { gt: 0 },
        },
      })

      return successResponse({
        id: "mock",
        title: `Rapport Mensuel - ${now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
        periodStart: startOfMonth,
        periodEnd: endOfMonth,
        executiveSummary: "Ce mois a été marqué par une volatilité modérée et des performances positives du bot.",
        kpis: {
          monthlyReturn: tradeStats._sum.pnl || 2450,
          ytdReturn: 18750,
          maxDrawdown: -4.2,
          sharpeRatio: 1.8,
          winRate: tradeStats._count > 0 ? (winningTrades / tradeStats._count) * 100 : 68,
          totalTrades: tradeStats._count || 47,
        },
        marketContext: "Les marchés ont connu une période de consolidation après les gains de fin d'année.",
        botDecisions: [
          "Réduction de l'exposition aux altcoins de 20% suite à la baisse de momentum",
          "Augmentation de la position BTC après le breakout des 45k$",
          "Mise en place de stops plus serrés en période de faible volatilité",
        ],
        faq: [
          {
            question: "Pourquoi la performance a-t-elle été impactée mi-mois ?",
            answer: "Une correction soudaine du marché a déclenché plusieurs stop-loss. Le bot a correctement limité les pertes.",
          },
        ],
      })
    }

    return successResponse(report)
  }

  // Get all monthly reports
  const reports = await prisma.article.findMany({
    where: { type: ArticleType.MONTHLY_REPORT },
    orderBy: { periodEnd: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      periodStart: true,
      periodEnd: true,
      publishedAt: true,
    },
  })

  return successResponse(reports)
}
