import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils"
import { Role } from "@prisma/client"

export async function POST(
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
    const { content, screenshots } = body

    const note = await prisma.tradeNote.create({
      data: {
        tradeId: id,
        authorId: auth.user!.id,
        content,
        screenshots: screenshots || [],
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    })

    return successResponse(note, 201)
  } catch (error) {
    return errorResponse(`Erreur création note: ${error}`)
  }
}
