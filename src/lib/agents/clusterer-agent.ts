import { BaseAgent, AgentResult } from "./base-agent"
import { prisma } from "@/lib/db"
import { PromptAgent, SourceCategory } from "@prisma/client"

interface ClusteringResult {
  clustersCreated: number
  articlesAssigned: number
}

export class ClustererAgent extends BaseAgent {
  constructor() {
    super("ClustererAgent", PromptAgent.CLUSTERER)
  }

  async execute(weekStart: Date, weekEnd: Date): Promise<AgentResult<ClusteringResult>> {
    this.startTimer()
    this.logs = []

    try {
      this.log("Starting clustering process...")

      // Get high-relevance articles
      const articles = await prisma.rawArticle.findMany({
        where: {
          publishedAt: {
            gte: weekStart,
            lte: weekEnd,
          },
          isProcessed: true,
          isDuplicate: false,
          relevanceScore: { gte: 50 },
          clusterId: null,
        },
        include: {
          source: true,
        },
        orderBy: {
          relevanceScore: "desc",
        },
        take: 100,
      })

      this.log(`Found ${articles.length} articles to cluster`)

      if (articles.length === 0) {
        return {
          success: true,
          data: { clustersCreated: 0, articlesAssigned: 0 },
          logs: this.logs,
          duration: this.getElapsed(),
        }
      }

      // Get prompt template
      const systemPrompt = await this.getPrompt()

      // Group by category first
      const byCategory = articles.reduce((acc, article) => {
        const cat = article.source.category
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(article)
        return acc
      }, {} as Record<string, typeof articles>)

      let clustersCreated = 0
      let articlesAssigned = 0

      for (const [category, categoryArticles] of Object.entries(byCategory)) {
        this.log(`Clustering ${category}: ${categoryArticles.length} articles`)

        // Create summary of articles for clustering
        const articlesSummary = categoryArticles
          .map((a, i) => `[${i}] ${a.title}: ${a.summary?.substring(0, 200) || ""}`)
          .join("\n")

        const userMessage = `
Category: ${category}
Articles:
${articlesSummary}

Group these articles into event clusters. Return JSON with clusters.`

        try {
          const result = await this.callLLMWithJSON<{
            clusters: Array<{
              title: string
              summary: string
              article_indices: number[]
              confidence: number
            }>
          }>(systemPrompt, userMessage, { temperature: 0.3 })

          for (const cluster of result.clusters) {
            const clusterArticles = cluster.article_indices
              .map((i) => categoryArticles[i])
              .filter(Boolean)

            if (clusterArticles.length === 0) continue

            // Create cluster
            const newCluster = await prisma.eventCluster.create({
              data: {
                title: cluster.title,
                category: category as SourceCategory,
                summary: cluster.summary,
                confidence: cluster.confidence,
                startDate: weekStart,
                endDate: weekEnd,
              },
            })

            // Assign articles
            await prisma.rawArticle.updateMany({
              where: {
                id: { in: clusterArticles.map((a) => a.id) },
              },
              data: {
                clusterId: newCluster.id,
              },
            })

            clustersCreated++
            articlesAssigned += clusterArticles.length
            this.log(`Created cluster: "${cluster.title}" with ${clusterArticles.length} articles`)
          }
        } catch (error) {
          this.log(`Error clustering ${category}: ${error}`)
        }
      }

      this.log(`Clustering complete. Created ${clustersCreated} clusters`)

      return {
        success: true,
        data: { clustersCreated, articlesAssigned },
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
