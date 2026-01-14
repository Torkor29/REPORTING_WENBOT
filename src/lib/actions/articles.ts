"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth/config"
import { revalidatePath } from "next/cache"
import { ArticleStatus, ArticleType, Role } from "@prisma/client"

export async function createArticle(formData: FormData) {
  const session = await getServerSession(authConfig)
  if (!session?.user || ![Role.ADMIN, Role.EDITOR].includes(session.user.role as Role)) {
    return { error: "Non autorisé" }
  }

  const title = formData.get("title") as string
  const type = formData.get("type") as ArticleType
  const summary = formData.get("summary") as string
  const content = formData.get("content") as string

  try {
    const article = await prisma.article.create({
      data: {
        title,
        type: type || ArticleType.MANUAL_ANALYSIS,
        summary: summary || "",
        content: content || "",
        status: ArticleStatus.DRAFT,
        authorId: session.user.id,
        periodStart: new Date(),
        periodEnd: new Date(),
      },
    })

    revalidatePath("/editor")
    return { success: true, articleId: article.id }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}

export async function updateArticleStatus(articleId: string, status: ArticleStatus) {
  const session = await getServerSession(authConfig)
  if (!session?.user || ![Role.ADMIN, Role.EDITOR].includes(session.user.role as Role)) {
    return { error: "Non autorisé" }
  }

  try {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        status,
        ...(status === ArticleStatus.PUBLISHED && { publishedAt: new Date() }),
        ...(status === ArticleStatus.IN_REVIEW && { reviewerId: session.user.id }),
      },
    })

    revalidatePath("/editor")
    revalidatePath("/weekly-digest")
    revalidatePath("/monthly-report")
    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}

export async function deleteArticle(articleId: string) {
  const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Non autorisé" }
  }

  try {
    await prisma.article.delete({ where: { id: articleId } })
    revalidatePath("/editor")
    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}
