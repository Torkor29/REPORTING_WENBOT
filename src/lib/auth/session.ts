import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"

export async function getSession() {
  return await auth()
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    redirect("/login")
  }
  return session.user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role as Role)) {
    redirect("/dashboard")
  }
  return user
}

export async function requireAdmin() {
  return requireRole([Role.ADMIN])
}

export async function requireEditor() {
  return requireRole([Role.ADMIN, Role.EDITOR])
}

export function canEdit(userRole: Role): boolean {
  return userRole === Role.ADMIN || userRole === Role.EDITOR
}

export function canManage(userRole: Role): boolean {
  return userRole === Role.ADMIN
}

export function canView(userRole: Role): boolean {
  return true // All authenticated users can view
}
