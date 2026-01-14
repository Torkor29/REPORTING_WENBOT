"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth/config"
import { revalidatePath } from "next/cache"
import { Role, AccountStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function createUser(formData: FormData) {
  const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Non autorisé" }
  }

  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as Role

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { error: "Email déjà utilisé" }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || Role.VIEWER,
        status: AccountStatus.ACTIVE,
      },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}

export async function updateUserRole(userId: string, role: Role) {
  const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Non autorisé" }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}

export async function updateUserStatus(userId: string, status: AccountStatus) {
  const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Non autorisé" }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}

export async function deleteUser(userId: string) {
  const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Non autorisé" }
  }

  if (userId === session.user.id) {
    return { error: "Impossible de supprimer votre propre compte" }
  }

  try {
    await prisma.user.delete({ where: { id: userId } })
    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}

export async function addAllowedDomain(domain: string) {
  const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Non autorisé" }
  }

  try {
    await prisma.allowedDomain.create({
      data: { domain: domain.toLowerCase() },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}
