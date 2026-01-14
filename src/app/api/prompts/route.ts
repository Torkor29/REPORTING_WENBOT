import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils"
import { Role } from "@prisma/client"

export async function GET(request: NextRequest) {
  const auth = await requireAuth([Role.ADMIN])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  const prompts = await prisma.promptTemplate.findMany({
    orderBy: { agent: "asc" },
  })

  return successResponse(prompts)
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth([Role.ADMIN])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  try {
    const body = await request.json()
    const { agent, template, description } = body

    const prompt = await prisma.promptTemplate.upsert({
      where: { agent },
      update: {
        template,
        description,
        version: { increment: 1 },
      },
      create: {
        agent,
        template,
        description,
        version: 1,
      },
    })

    return successResponse(prompt)
  } catch (error) {
    return errorResponse(`Erreur mise à jour prompt: ${error}`)
  }
}
