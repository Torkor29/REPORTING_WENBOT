"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth/config"
import { Role } from "@prisma/client"

export async function sendToDiscord(articleId: string, webhookUrl?: string) {
  const session = await getServerSession(authConfig)
  if (!session?.user || ![Role.ADMIN, Role.EDITOR].includes(session.user.role as Role)) {
    return { error: "Non autorisé" }
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { author: { select: { name: true } } },
    })

    if (!article) {
      return { error: "Article non trouvé" }
    }

    const webhook = webhookUrl || process.env.DISCORD_WEBHOOK_URL

    if (!webhook) {
      return { error: "Aucun webhook Discord configuré" }
    }

    // Format message for Discord
    const message = formatForDiscord(article)

    // Split into chunks if needed (Discord limit: 2000 chars)
    const chunks = splitMessage(message, 1900)

    for (const chunk of chunks) {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: chunk,
          username: "Investor Reporting Bot",
        }),
      })

      if (!response.ok) {
        return { error: `Erreur Discord: ${response.statusText}` }
      }

      // Rate limit
      if (chunks.length > 1) {
        await new Promise((r) => setTimeout(r, 500))
      }
    }

    // Log the share
    await prisma.discordShare.create({
      data: {
        articleId,
        webhookUrl: webhook,
        status: "SENT",
      },
    })

    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}

function formatForDiscord(article: { title: string; summary: string; content: string; type: string }): string {
  let message = `# ${article.title}\n\n`

  if (article.summary) {
    message += `${article.summary}\n\n`
  }

  // Parse content and format for Discord
  if (article.content) {
    // Convert HTML/Markdown to Discord-friendly format
    message += article.content
      .replace(/<h[1-6]>/g, "## ")
      .replace(/<\/h[1-6]>/g, "\n")
      .replace(/<p>/g, "")
      .replace(/<\/p>/g, "\n")
      .replace(/<li>/g, "• ")
      .replace(/<\/li>/g, "\n")
      .replace(/<[^>]+>/g, "")
  }

  message += "\n\n---\n*Investor Reporting Hub*"

  return message
}

function splitMessage(content: string, maxLength: number): string[] {
  if (content.length <= maxLength) return [content]

  const chunks: string[] = []
  let remaining = content

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining)
      break
    }

    let breakPoint = remaining.lastIndexOf("\n", maxLength)
    if (breakPoint === -1 || breakPoint < maxLength / 2) {
      breakPoint = remaining.lastIndexOf(" ", maxLength)
    }
    if (breakPoint === -1) {
      breakPoint = maxLength
    }

    chunks.push(remaining.substring(0, breakPoint))
    remaining = remaining.substring(breakPoint).trim()
  }

  return chunks
}

export async function testDiscordWebhook(webhookUrl: string) {
  const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Non autorisé" }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "🔔 Test de connexion - Investor Reporting Hub\n\nLe webhook fonctionne correctement !",
        username: "Investor Reporting Bot",
      }),
    })

    if (!response.ok) {
      return { error: `Erreur: ${response.statusText}` }
    }

    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}
