import { BaseAgent, AgentResult } from "./base-agent"
import { prisma } from "@/lib/db"
import { PromptAgent } from "@prisma/client"

interface RankedArticle {
  id: string
  relevanceScore: number
  impactScore: number
  isDuplicate: boolean
  duplicateOf?: string
}

interface RankingResult {
  articlesRanked: number
  duplicatesFound: number
}

export class RankerAgent extends BaseAgent {
  constructor() {
    super("RankerAgent", PromptAgent.RANKER)
  }

  async execute(weekStart: Date, weekEnd: Date): Promise<AgentResult<RankingResult>> {
    this.startTimer()
    this.logs = []

    try {
      this.log("Starting ranking process...")

      // Get unprocessed articles from the week
      const articles = await prisma.rawArticle.findMany({
        where: {
          publishedAt: {
            gte: weekStart,
            lte: weekEnd,
          },
          isProcessed: false,
        },
        include: {
          source: true,
        },
        take: 200,
      })

      this.log(`Found ${articles.length} unprocessed articles`)

      if (articles.length === 0) {
        return {
          success: true,
          data: { articlesRanked: 0, duplicatesFound: 0 },
          logs: this.logs,
          duration: this.getElapsed(),
        }
      }

      // Get prompt template
      const systemPrompt = await this.getPrompt()

      let duplicatesFound = 0

      // Process in batches
      const batchSize = 10
      for (let i = 0; i < articles.length; i += batchSize) {
        const batch = articles.slice(i, i + batchSize)
        this.log(`Processing batch ${Math.floor(i / batchSize) + 1}`)

        for (const article of batch) {
          try {
            const userMessage = `
Article:
Title: ${article.title}
Source: ${article.source.name} (Trust: ${article.source.trustScore})
Category: ${article.source.category}
Summary: ${article.summary || article.content.substring(0, 500)}
Published: ${article.publishedAt.toISOString()}

Evaluate this article for relevance and impact.`

            const result = await this.callLLMWithJSON<{
              relevance_score: number
              impact_score: number
              is_duplicate: boolean
              key_topics: string[]
            }>(systemPrompt, userMessage, { temperature: 0.2 })

            await prisma.rawArticle.update({
              where: { id: article.id },
              data: {
                relevanceScore: result.relevance_score,
                impactScore: result.impact_score,
                isDuplicate: result.is_duplicate,
                isProcessed: true,
                metadata: {
                  key_topics: result.key_topics,
                },
              },
            })

            if (result.is_duplicate) {
              duplicatesFound++
            }
          } catch (error) {
            this.log(`Error ranking article ${article.id}: ${error}`)
          }
        }
      }

      this.log(`Ranking complete. Duplicates found: ${duplicatesFound}`)

      return {
        success: true,
        data: {
          articlesRanked: articles.length,
          duplicatesFound,
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
