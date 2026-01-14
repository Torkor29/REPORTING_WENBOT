import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils"
import { Role } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  const { id } = await params

  const trade = await prisma.trade.findUnique({
    where: { id },
    include: {
      notes: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!trade) {
    return errorResponse("Trade non trouvé", 404)
  }

  return successResponse(trade)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth([Role.ADMIN, Role.EDITOR])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  const { id } = await params

  try {
    const body = await request.json()

    const trade = await prisma.trade.update({
      where: { id },
      data: {
        ...(body.pair && { pair: body.pair }),
        ...(body.side && { side: body.side }),
        ...(body.entryPrice && { entryPrice: parseFloat(body.entryPrice) }),
        ...(body.exitPrice && { exitPrice: parseFloat(body.exitPrice) }),
        ...(body.size && { size: parseFloat(body.size) }),
        ...(body.pnl !== undefined && { pnl: parseFloat(body.pnl) }),
        ...(body.status && { status: body.status }),
        ...(body.strategy !== undefined && { strategy: body.strategy }),
        ...(body.tags && { tags: body.tags }),
      },
    })

    return successResponse(trade)
  } catch (error) {
    return errorResponse(`Erreur mise à jour: ${error}`)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth([Role.ADMIN])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  const { id } = await params

  try {
    await prisma.trade.delete({ where: { id } })
    return successResponse({ deleted: true })
  } catch (error) {
    return errorResponse(`Erreur suppression: ${error}`)
  }
}
