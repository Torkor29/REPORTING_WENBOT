import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils"
import { Role } from "@prisma/client"

export async function GET(request: NextRequest) {
  const auth = await requireAuth([Role.ADMIN])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  const [schedules, recentRuns] = await Promise.all([
    prisma.jobSchedule.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.jobRun.findMany({
      where: type ? { type: type as never } : undefined,
      orderBy: { startedAt: "desc" },
      take: 50,
    }),
  ])

  return successResponse({ schedules, recentRuns })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth([Role.ADMIN])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  try {
    const body = await request.json()
    const { type, cronExpression, isActive, config } = body

    const schedule = await prisma.jobSchedule.create({
      data: {
        type,
        cronExpression,
        isActive: isActive ?? true,
        config: config || {},
      },
    })

    return successResponse(schedule, 201)
  } catch (error) {
    return errorResponse(`Erreur création job: ${error}`)
  }
}
