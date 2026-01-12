import { BaseAgent, AgentResult } from "./base-agent"
import { prisma } from "@/lib/db"
import { PromptAgent, SourceCategory } from "@prisma/client"
import Parser from "rss-parser"

interface CollectedArticle {
  title: string
  content: string
  summary: string
  url: string
  author?: string
  publishedAt: Date
  sourceId: string
  externalId?: string
}

interface CollectionResult {
  articlesCollected: number
  sourcesProcessed: number
  errors: string[]
}

export class CollectorAgent extends BaseAgent {
  private rssParser: Parser

  constructor() {
    super("CollectorAgent", PromptAgent.COLLECTOR)
    this.rssParser = new Parser({
      customFields: {
        item: ["content:encoded", "description", "pubDate"],
      },
    })
  }

  async execute(): Promise<AgentResult<CollectionResult>> {
    this.startTimer()
    this.logs = []

    try {
      this.log("Starting collection process...")

      // Get active sources
      const sources = await prisma.source.findMany({
        where: { isActive: true },
      })

      this.log(`Found ${sources.length} active sources`)

      let totalArticles = 0
      const errors: string[] = []

      for (const source of sources) {
        try {
          this.log(`Processing source: ${source.name}`)

          let articles: CollectedArticle[] = []

          switch (source.type) {
            case "RSS":
              articles = await this.fetchRSS(source.id, source.url)
              break
            case "API":
              articles = await this.fetchAPI(source.id, source.url, source.config as Record<string, unknown>)
              break
            default:
              this.log(`Unsupported source type: ${source.type}`)
          }

          // Save articles
          for (const article of articles) {
            try {
              await prisma.rawArticle.upsert({
                where: {
                  sourceId_externalId: {
                    sourceId: article.sourceId,
                    externalId: article.externalId || article.url,
                  },
                },
                update: {
                  title: article.title,
                  content: article.content,
                  summary: article.summary,
                },
                create: {
                  sourceId: article.sourceId,
                  externalId: article.externalId || article.url,
                  title: article.title,
                  content: article.content,
                  summary: article.summary,
                  url: article.url,
                  author: article.author,
                  publishedAt: article.publishedAt,
                },
              })
              totalArticles++
            } catch (e) {
              // Duplicate, skip
            }
          }

          // Update source last fetch
          await prisma.source.update({
            where: { id: source.id },
            data: {
              lastFetch: new Date(),
              fetchErrors: 0,
            },
          })

          this.log(`Collected ${articles.length} articles from ${source.name}`)
        } catch (error) {
          const errorMsg = `Error processing ${source.name}: ${error}`
          this.log(errorMsg)
          errors.push(errorMsg)

          // Increment error count
          await prisma.source.update({
            where: { id: source.id },
            data: {
              fetchErrors: { increment: 1 },
            },
          })
        }
      }

      this.log(`Collection complete. Total: ${totalArticles} articles`)

      return {
        success: true,
        data: {
          articlesCollected: totalArticles,
          sourcesProcessed: sources.length,
          errors,
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

  private async fetchRSS(sourceId: string, url: string): Promise<CollectedArticle[]> {
    const feed = await this.rssParser.parseURL(url)
    const articles: CollectedArticle[] = []

    for (const item of feed.items.slice(0, 50)) {
      articles.push({
        title: item.title || "Untitled",
        content: item["content:encoded"] || item.content || item.description || "",
        summary: item.description?.substring(0, 500) || "",
        url: item.link || "",
        author: item.creator || item.author,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        sourceId,
        externalId: item.guid || item.link,
      })
    }

    return articles
  }

  private async fetchAPI(
    sourceId: string,
    url: string,
    config?: Record<string, unknown>
  ): Promise<CollectedArticle[]> {
    // Placeholder for API fetching
    // Would implement specific API calls based on config
    this.log(`API fetching not fully implemented for: ${url}`)
    return []
  }
}
