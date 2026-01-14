"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth/config"
import { revalidatePath } from "next/cache"
import { SourceType, SourceCategory, Role } from "@prisma/client"

export async function createSource(formData: FormData) {
  const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Non autorisé" }
  }

  const name = formData.get("name") as string
  const url = formData.get("url") as string
  const type = formData.get("type") as SourceType
  const category = formData.get("category") as SourceCategory
  const priority = parseInt(formData.get("priority") as string) || 5

  try {
    await prisma.source.create({
      data: {
        name,
        url,
        type: type || SourceType.RSS,
        category: category || SourceCategory.CRYPTO,
        priority,
        isActive: true,
        config: {},
      },
    })

    revalidatePath("/admin/sources")
    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}

export async function updateSource(sourceId: string, formData: FormData) {
  const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Non autorisé" }
  }

  try {
    await prisma.source.update({
      where: { id: sourceId },
      data: {
        name: formData.get("name") as string,
        url: formData.get("url") as string,
        type: formData.get("type") as SourceType,
        category: formData.get("category") as SourceCategory,
        priority: parseInt(formData.get("priority") as string) || 5,
        isActive: formData.get("isActive") === "true",
      },
    })

    revalidatePath("/admin/sources")
    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}

export async function deleteSource(sourceId: string) {
  const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Non autorisé" }
  }

  try {
    await prisma.source.delete({ where: { id: sourceId } })
    revalidatePath("/admin/sources")
    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}

export async function toggleSource(sourceId: string, isActive: boolean) {
  const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Non autorisé" }
  }

  try {
    await prisma.source.update({
      where: { id: sourceId },
      data: { isActive },
    })

    revalidatePath("/admin/sources")
    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}
