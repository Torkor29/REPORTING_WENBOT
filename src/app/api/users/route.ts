import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  const auth = await requireAuth([Role.ADMIN])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { articles: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return successResponse(users)
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth([Role.ADMIN])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  try {
    const body = await request.json()
    const { email, name, password, role } = body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return errorResponse("Email déjà utilisé", 409)
    }

    const hashedPassword = password ? await bcrypt.hash(password, 12) : null

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || Role.VIEWER,
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    })

    return successResponse(user, 201)
  } catch (error) {
    return errorResponse(`Erreur création utilisateur: ${error}`)
  }
}
