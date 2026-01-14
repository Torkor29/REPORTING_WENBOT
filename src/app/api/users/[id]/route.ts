import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

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
    const { name, role, status, password } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (role) updateData.role = role
    if (status) updateData.status = status
    if (password) updateData.password = await bcrypt.hash(password, 12)

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    })

    return successResponse(user)
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

  // Prevent self-deletion
  if (id === auth.user?.id) {
    return errorResponse("Impossible de supprimer votre propre compte", 400)
  }

  try {
    await prisma.user.delete({ where: { id } })
    return successResponse({ deleted: true })
  } catch (error) {
    return errorResponse(`Erreur suppression: ${error}`)
  }
}
