import { BaseAgent, AgentResult } from "./base-agent"
import { prisma } from "@/lib/db"
import { PromptAgent, ArticleType, ArticleStatus, SourceCategory } from "@prisma/client"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { nanoid } from "nanoid"

interface WriterResult {
  articleId: string
  title: string
  status: string
}

export class WriterAgent extends BaseAgent {
  constructor() {
    super("WriterAgent", PromptAgent.WRITER)
  }

  async execute(weekStart: Date, weekEnd: Date, authorId: string): Promise<AgentResult<WriterResult>> {
    this.startTimer()
    this.logs = []

    try {
      this.log("Starting weekly digest generation...")

      // Get clusters for the week
      const clusters = await prisma.eventCluster.findMany({
        where: {
          startDate: { gte: weekStart },
          endDate: { lte: weekEnd },
        },
        include: {
          rawArticles: {
            include: { source: true },
            where: { isDuplicate: false },
            orderBy: { relevanceScore: "desc" },
            take: 5,
          },
        },
        orderBy: { confidence: "desc" },
      })

      this.log(`Found ${clusters.length} clusters for the week`)

      if (clusters.length === 0) {
        return {
          success: false,
          error: "No clusters found for the week",
          logs: this.logs,
          duration: this.getElapsed(),
        }
      }

      // Get prompt template
      const systemPrompt = await this.getPrompt()

      // Group clusters by category
      const byCategory: Record<string, typeof clusters> = {}
      for (const cluster of clusters) {
        if (!byCategory[cluster.category]) {
          byCategory[cluster.category] = []
        }
        byCategory[cluster.category].push(cluster)
      }

      // Generate content for each category
      const sections: string[] = []
      const allCitations: Array<{ title: string; url: string; source: string }> = []

      for (const [category, categoryClusters] of Object.entries(byCategory)) {
        const categoryLabel = {
          MACRO: "Macro / Economie",
          CRYPTO: "Crypto / Marches",
          GEOPOLITICS: "Geopolitique",
          MARKETS: "Marches",
          REGULATION: "Regulation",
        }[category] || category

        const clustersSummary = categoryClusters
          .map((c) => {
            const articlesTitles = c.rawArticles.map((a) => `- ${a.title}`).join("\n")
            return `Event: ${c.title}\nSummary: ${c.summary}\nArticles:\n${articlesTitles}`
          })
          .join("\n\n")

        const userMessage = `
Category: ${categoryLabel}
Week: ${format(weekStart, "d MMMM", { locale: fr })} - ${format(weekEnd, "d MMMM yyyy", { locale: fr })}

Events and articles:
${clustersSummary}

Write the ${categoryLabel} section of the weekly digest following the structure:
1. Main title and summary
2. Key facts (bullet points)
3. Why it matters
4. Potential impact on markets
5. Impact on the trading bot
6. Points to watch

Remember: factual, pedagogical, neutral tone. Always cite sources.`

        try {
          const sectionContent = await this.callLLM(systemPrompt, userMessage, {
            temperature: 0.7,
            maxTokens: 2000,
          })

          sections.push(`## ${categoryLabel}\n\n${sectionContent}`)

          // Extract citations
          for (const cluster of categoryClusters) {
            for (const article of cluster.rawArticles) {
              allCitations.push({
                title: article.title,
                url: article.url,
                source: article.source.name,
              })
            }
          }

          this.log(`Generated ${categoryLabel} section`)
        } catch (error) {
          this.log(`Error generating ${categoryLabel}: ${error}`)
        }
      }

      // Assemble final content
      const weekLabel = `${format(weekStart, "d", { locale: fr })} - ${format(weekEnd, "d MMMM yyyy", { locale: fr })}`
      const title = `Veille Hebdomadaire - Semaine du ${weekLabel}`
      const slug = `weekly-${format(weekStart, "yyyy-MM-dd")}-${nanoid(6)}`

      const content = `# ${title}

> **Avertissement**: Ce document est fourni a titre informatif uniquement et ne constitue pas un conseil en investissement. Les performances passees ne garantissent pas les resultats futurs.

${sections.join("\n\n---\n\n")}

---

## Sources

${allCitations.map((c) => `- [${c.title}](${c.url}) - ${c.source}`).join("\n")}

---

*Ce digest a ete genere automatiquement le ${format(new Date(), "d MMMM yyyy 'a' HH:mm", { locale: fr })}.*
`

      // Create article
      const article = await prisma.article.create({
        data: {
          type: ArticleType.WEEKLY_DIGEST,
          status: ArticleStatus.DRAFT,
          title,
          slug,
          content,
          summary: `Veille hebdomadaire couvrant les evenements macro, crypto et geopolitiques de la semaine du ${weekLabel}.`,
          periodStart: weekStart,
          periodEnd: weekEnd,
          authorId,
          citations: {
            create: allCitations.slice(0, 20).map((c) => ({
              title: c.title,
              url: c.url,
              source: c.source,
            })),
          },
        },
      })

      this.log(`Created article: ${article.title}`)

      return {
        success: true,
        data: {
          articleId: article.id,
          title: article.title,
          status: article.status,
        },
        logs: this.logs,
        duration: this.getElapsed(),
      }
    } catch (error) {
      this.log(`Fatal error: ${error}`)
      return {
        success: false,
        error: String(error),
        logs: this.logs,
        duration: this.getElapsed(),
      }
    }
  }
}
