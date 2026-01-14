import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse, parseSearchParams } from "@/lib/api-utils"
import { Role, TradeSide, TradeStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  const { page, limit, sort, order } = parseSearchParams(request.url)
  const { searchParams } = new URL(request.url)
  const side = searchParams.get("side") as TradeSide | null
  const status = searchParams.get("status") as TradeStatus | null
  const pair = searchParams.get("pair")

  const where = {
    ...(side && { side }),
    ...(status && { status }),
    ...(pair && { pair: { contains: pair, mode: "insensitive" as const } }),
  }

  const [trades, total, stats] = await Promise.all([
    prisma.trade.findMany({
      where,
      include: {
        notes: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { notes: true } },
      },
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.trade.count({ where }),
    prisma.trade.aggregate({
      _sum: { pnl: true, fees: true },
      _avg: { pnl: true },
      _count: true,
    }),
  ])

  const winningTrades = await prisma.trade.count({
    where: { ...where, pnl: { gt: 0 } },
  })

  return successResponse({
    trades,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    stats: {
      totalPnl: stats._sum.pnl || 0,
      totalFees: stats._sum.fees || 0,
      avgPnl: stats._avg.pnl || 0,
      totalTrades: stats._count,
      winRate: stats._count > 0 ? (winningTrades / stats._count) * 100 : 0,
    },
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth([Role.ADMIN, Role.EDITOR])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  try {
    const body = await request.json()
    const trades = Array.isArray(body) ? body : [body]

    const created = await prisma.trade.createMany({
      data: trades.map((t) => ({
        externalId: t.externalId || `trade-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        pair: t.pair,
        side: t.side || TradeSide.LONG,
        entryPrice: parseFloat(t.entryPrice),
        exitPrice: t.exitPrice ? parseFloat(t.exitPrice) : null,
        size: parseFloat(t.size),
        leverage: t.leverage ? parseFloat(t.leverage) : 1,
        pnl: t.pnl ? parseFloat(t.pnl) : null,
        fees: t.fees ? parseFloat(t.fees) : 0,
        status: t.status || TradeStatus.CLOSED,
        entryTime: new Date(t.entryTime || t.date),
        exitTime: t.exitTime ? new Date(t.exitTime) : null,
        strategy: t.strategy,
        tags: t.tags || [],
      })),
      skipDuplicates: true,
    })

    return successResponse({ created: created.count }, 201)
  } catch (error) {
    return errorResponse(`Erreur import trades: ${error}`)
  }
}
