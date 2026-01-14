import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils"
import { Role, SourceType, SourceCategory } from "@prisma/client"

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") as SourceCategory | null
  const active = searchParams.get("active")

  const sources = await prisma.source.findMany({
    where: {
      ...(category && { category }),
      ...(active !== null && { isActive: active === "true" }),
    },
    include: {
      _count: { select: { articles: true } },
    },
    orderBy: [{ priority: "desc" }, { name: "asc" }],
  })

  return successResponse(sources)
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth([Role.ADMIN])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  try {
    const body = await request.json()
    const { name, type, url, category, priority, config } = body

    const source = await prisma.source.create({
      data: {
        name,
        type: type || SourceType.RSS,
        url,
        category: category || SourceCategory.CRYPTO,
        priority: priority || 5,
        config: config || {},
        isActive: true,
      },
    })

    return successResponse(source, 201)
  } catch (error) {
    return errorResponse(`Erreur création source: ${error}`)
  }
}
