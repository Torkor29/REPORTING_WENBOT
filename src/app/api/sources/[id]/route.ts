import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils"
import { Role } from "@prisma/client"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth([Role.ADMIN])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  const { id } = await params

  try {
    const body = await request.json()

    const source = await prisma.source.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.type && { type: body.type }),
        ...(body.url && { url: body.url }),
        ...(body.category && { category: body.category }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.config && { config: body.config }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return successResponse(source)
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
    await prisma.source.delete({ where: { id } })
    return successResponse({ deleted: true })
  } catch (error) {
    return errorResponse(`Erreur suppression: ${error}`)
  }
}
