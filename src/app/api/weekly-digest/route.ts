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

  if (latest) {
    // Get the most recent published weekly digest
    const digest = await prisma.article.findFirst({
      where: {
        type: ArticleType.WEEKLY_DIGEST,
        status: ArticleStatus.PUBLISHED,
      },
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { name: true } },
        clusters: {
          include: {
            articles: {
              select: {
                id: true,
                title: true,
                url: true,
                source: { select: { name: true } },
              },
            },
          },
        },
      },
    })

    if (!digest) {
      // Return mock data if no digest exists
      return successResponse({
        id: "mock",
        title: `Weekly Digest - ${new Date().toLocaleDateString("fr-FR")}`,
        periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(),
        content: "",
        sections: {
          macro: {
            title: "Macro & Économie",
            items: [
              {
                headline: "Fed maintient les taux, signaux dovish",
                summary: "La Réserve fédérale maintient ses taux directeurs mais signale des baisses potentielles pour 2024.",
                impact: "Le bot a ajusté son exposition aux actifs risqués à la hausse de 5%.",
                sources: ["Reuters", "Bloomberg"],
              },
            ],
          },
          crypto: {
            title: "Crypto & Blockchain",
            items: [
              {
                headline: "Bitcoin ETF approuvé par la SEC",
                summary: "L'approbation historique des ETF Bitcoin spot ouvre la voie aux investisseurs institutionnels.",
                impact: "Position BTC renforcée, allocation passée de 30% à 40%.",
                sources: ["CoinDesk", "The Block"],
              },
            ],
          },
          geopolitics: {
            title: "Géopolitique",
            items: [
              {
                headline: "Tensions au Moyen-Orient",
                summary: "L'escalade des tensions impacte les marchés pétroliers et les actifs refuges.",
                impact: "Réduction exposition aux actifs corrélés au pétrole.",
                sources: ["Reuters", "AP News"],
              },
            ],
          },
        },
        botSummary: "Cette semaine, le bot a maintenu une approche prudente tout en profitant du momentum positif sur les cryptomonnaies.",
      })
    }

    return successResponse(digest)
  }

  // Get all weekly digests
  const digests = await prisma.article.findMany({
    where: { type: ArticleType.WEEKLY_DIGEST },
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

  return successResponse(digests)
}
