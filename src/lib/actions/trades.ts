"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth/config"
import { revalidatePath } from "next/cache"
import { TradeSide, TradeStatus, Role } from "@prisma/client"

export async function importTrades(csvData: string) {
  const session = await getServerSession(authConfig)
  if (!session?.user || ![Role.ADMIN, Role.EDITOR].includes(session.user.role as Role)) {
    return { error: "Non autorisé" }
  }

  try {
    const lines = csvData.trim().split("\n")
    const headers = lines[0].toLowerCase().split(",")

    const trades = lines.slice(1).map((line) => {
      const values = line.split(",")
      const row: Record<string, string> = {}
      headers.forEach((h, i) => (row[h.trim()] = values[i]?.trim() || ""))

      return {
        externalId: `import-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        pair: row.pair || row.symbol || "BTC/USDT",
        side: (row.side?.toUpperCase() === "SHORT" ? TradeSide.SHORT : TradeSide.LONG),
        entryPrice: parseFloat(row.entryprice || row.entry || "0"),
        exitPrice: row.exitprice || row.exit ? parseFloat(row.exitprice || row.exit) : null,
        size: parseFloat(row.size || row.quantity || "1"),
        leverage: parseFloat(row.leverage || "1"),
        pnl: row.pnl ? parseFloat(row.pnl) : null,
        fees: parseFloat(row.fees || "0"),
        status: TradeStatus.CLOSED,
        entryTime: new Date(row.date || row.entrytime || Date.now()),
        exitTime: row.exittime ? new Date(row.exittime) : null,
        strategy: row.strategy || null,
        tags: row.tags ? row.tags.split(";") : [],
      }
    })

    const result = await prisma.trade.createMany({
      data: trades,
      skipDuplicates: true,
    })

    revalidatePath("/journal")
    return { success: true, imported: result.count }
  } catch (error) {
    return { error: `Erreur import: ${error}` }
  }
}

export async function addTradeNote(tradeId: string, content: string) {
  const session = await getServerSession(authConfig)
  if (!session?.user || ![Role.ADMIN, Role.EDITOR].includes(session.user.role as Role)) {
    return { error: "Non autorisé" }
  }

  try {
    await prisma.tradeNote.create({
      data: {
        tradeId,
        authorId: session.user.id,
        content,
        screenshots: [],
      },
    })

    revalidatePath("/journal")
    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}

export async function deleteTrade(tradeId: string) {
  const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Non autorisé" }
  }

  try {
    await prisma.trade.delete({ where: { id: tradeId } })
    revalidatePath("/journal")
    return { success: true }
  } catch (error) {
    return { error: `Erreur: ${error}` }
  }
}
