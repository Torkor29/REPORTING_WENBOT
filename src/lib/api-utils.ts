import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth/config"
import { Role } from "@prisma/client"

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(error: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error }, { status })
}

export async function requireAuth(requiredRoles?: Role[]) {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    return { authorized: false, error: "Non authentifié", status: 401 }
  }

  if (requiredRoles && !requiredRoles.includes(session.user.role as Role)) {
    return { authorized: false, error: "Accès non autorisé", status: 403 }
  }

  return { authorized: true, user: session.user }
}

export function parseSearchParams(url: string) {
  const { searchParams } = new URL(url)
  return {
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "20"),
    search: searchParams.get("search") || "",
    sort: searchParams.get("sort") || "createdAt",
    order: (searchParams.get("order") || "desc") as "asc" | "desc",
  }
}
