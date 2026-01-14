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

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      reviewer: { select: { id: true, name: true, email: true } },
      clusters: { include: { articles: true } },
    },
  })

  if (!article) {
    return errorResponse("Article non trouvé", 404)
  }

  return successResponse(article)
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
    const { title, summary, content, status, coverImage } = body

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(summary !== undefined && { summary }),
        ...(content !== undefined && { content }),
        ...(status && { status }),
        ...(coverImage !== undefined && { coverImage }),
        ...(status === "PUBLISHED" && { publishedAt: new Date() }),
      },
    })

    return successResponse(article)
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
    await prisma.article.delete({ where: { id } })
    return successResponse({ deleted: true })
  } catch (error) {
    return errorResponse(`Erreur suppression: ${error}`)
  }
}
