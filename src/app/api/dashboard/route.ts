import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  // Get trade statistics
  const [allTrades, mtdTrades, ytdTrades] = await Promise.all([
    prisma.trade.aggregate({
      _sum: { pnl: true, fees: true },
      _count: true,
    }),
    prisma.trade.aggregate({
      where: { entryTime: { gte: startOfMonth } },
      _sum: { pnl: true },
    }),
    prisma.trade.aggregate({
      where: { entryTime: { gte: startOfYear } },
      _sum: { pnl: true },
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
    take: 100,
    select: { entryTime: true, pnl: true },
  })

  // Calculate cumulative equity
  let cumulative = 10000 // Starting capital
  const equityData = recentTrades.map((t) => {
    cumulative += t.pnl || 0
    return {
      date: t.entryTime.toISOString().split("T")[0],
      value: cumulative,
    }
  })

  // Calculate drawdown
  let peak = 10000
  const drawdownData = equityData.map((point) => {
    if (point.value > peak) peak = point.value
    const drawdown = ((peak - point.value) / peak) * 100
    return { date: point.date, value: -drawdown }
  })

  // Recent articles
  const recentArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      type: true,
      publishedAt: true,
    },
  })

  // Recent activity
  const recentActivity = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      actor: { select: { name: true } },
    },
  })

  return successResponse({
    kpis: {
      mtdReturn: mtdTrades._sum.pnl || 0,
      ytdReturn: ytdTrades._sum.pnl || 0,
      totalPnl: allTrades._sum.pnl || 0,
      totalFees: allTrades._sum.fees || 0,
      winRate: Math.round(winRate * 10) / 10,
      totalTrades: allTrades._count,
      maxDrawdown: Math.min(...drawdownData.map((d) => d.value), 0),
    },
    charts: {
      equity: equityData,
      drawdown: drawdownData,
    },
    recentArticles,
    recentActivity: recentActivity.map((a) => ({
      id: a.id,
      action: a.action,
      entity: a.entity,
      createdAt: a.createdAt,
      actor: a.actor?.name || "System",
    })),
  })
}
