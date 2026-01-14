import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse, parseSearchParams } from "@/lib/api-utils"
import { Role, ArticleStatus, ArticleType } from "@prisma/client"

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  const { page, limit, search, sort, order } = parseSearchParams(request.url)
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") as ArticleType | null
  const status = searchParams.get("status") as ArticleStatus | null

  const where = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { summary: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(type && { type }),
    ...(status && { status }),
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true } },
        clusters: { select: { id: true, title: true } },
      },
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ])

  return successResponse({
    articles,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth([Role.ADMIN, Role.EDITOR])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  try {
    const body = await request.json()
    const { title, type, summary, content, coverImage } = body

    const article = await prisma.article.create({
      data: {
        title,
        type: type || ArticleType.MANUAL_ANALYSIS,
        summary: summary || "",
        content: content || "",
        coverImage,
        status: ArticleStatus.DRAFT,
        authorId: auth.user!.id,
        periodStart: new Date(),
        periodEnd: new Date(),
      },
    })

    return successResponse(article, 201)
  } catch (error) {
    return errorResponse(`Erreur création article: ${error}`)
  }
}
