import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils"
import { Role } from "@prisma/client"

export async function POST(request: NextRequest) {
  const auth = await requireAuth([Role.ADMIN, Role.EDITOR])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  try {
    const body = await request.json()
    const { content, webhookUrl, articleId } = body

    const webhook = webhookUrl || process.env.DISCORD_WEBHOOK_URL

    if (!webhook) {
      return errorResponse("Aucun webhook Discord configuré", 400)
    }

    // Format content for Discord (max 2000 chars per message)
    const messages = splitContent(content, 1900)

    for (const msg of messages) {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: msg,
          username: "Investor Reporting Bot",
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return errorResponse(`Erreur Discord: ${error}`, response.status)
      }

      // Rate limit: wait 500ms between messages
      if (messages.length > 1) {
        await new Promise((r) => setTimeout(r, 500))
      }
    }

    // Log the share if articleId provided
    if (articleId) {
      await prisma.discordShare.create({
        data: {
          articleId,
          webhookUrl: webhook,
          status: "SENT",
        },
      })
    }

    return successResponse({ sent: true, messageCount: messages.length })
  } catch (error) {
    return errorResponse(`Erreur envoi Discord: ${error}`)
  }
}

function splitContent(content: string, maxLength: number): string[] {
  if (content.length <= maxLength) return [content]

  const messages: string[] = []
  let remaining = content

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      messages.push(remaining)
      break
    }

    // Find a good break point (newline or space)
    let breakPoint = remaining.lastIndexOf("\n", maxLength)
    if (breakPoint === -1 || breakPoint < maxLength / 2) {
      breakPoint = remaining.lastIndexOf(" ", maxLength)
    }
    if (breakPoint === -1) {
      breakPoint = maxLength
    }

    messages.push(remaining.substring(0, breakPoint))
    remaining = remaining.substring(breakPoint).trim()
  }

  return messages
}
