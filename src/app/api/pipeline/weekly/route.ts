import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils"
import { Role, JobType, JobStatus, ArticleType, ArticleStatus } from "@prisma/client"
import { CollectorAgent } from "@/lib/agents/collector-agent"
import { RankerAgent } from "@/lib/agents/ranker-agent"
import { ClustererAgent } from "@/lib/agents/clusterer-agent"
import { WriterAgent } from "@/lib/agents/writer-agent"

export async function POST(request: NextRequest) {
  const auth = await requireAuth([Role.ADMIN, Role.EDITOR])
  if (!auth.authorized) {
    return errorResponse(auth.error!, auth.status)
  }

  // Create job run
  const jobRun = await prisma.jobRun.create({
    data: {
      type: JobType.WEEKLY_PROCESS,
      status: JobStatus.RUNNING,
      startedAt: new Date(),
    },
  })

  try {
    const logs: string[] = []

    // Step 1: Collect articles
    logs.push("Starting collection...")
    const collector = new CollectorAgent()
    const collectResult = await collector.execute()

    if (!collectResult.success) {
      throw new Error(`Collection failed: ${collectResult.error}`)
    }
    logs.push(`Collected ${(collectResult.data as { count: number })?.count || 0} articles`)

    // Step 2: Rank articles
    logs.push("Ranking articles...")
    const ranker = new RankerAgent()
    const rankResult = await ranker.execute()

    if (!rankResult.success) {
      throw new Error(`Ranking failed: ${rankResult.error}`)
    }
    logs.push("Ranking complete")

    // Step 3: Cluster articles
    logs.push("Clustering articles...")
    const clusterer = new ClustererAgent()
    const clusterResult = await clusterer.execute()

    if (!clusterResult.success) {
      throw new Error(`Clustering failed: ${clusterResult.error}`)
    }
    logs.push(`Created ${(clusterResult.data as { clusters: unknown[] })?.clusters?.length || 0} clusters`)

    // Step 4: Write digest
    logs.push("Writing digest...")
    const writer = new WriterAgent()
    const writeResult = await writer.execute()

    if (!writeResult.success) {
      throw new Error(`Writing failed: ${writeResult.error}`)
    }

    const digestContent = writeResult.data as { title: string; content: string; summary: string }

    // Create article
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const article = await prisma.article.create({
      data: {
        title: digestContent.title || `Weekly Digest - ${now.toLocaleDateString("fr-FR")}`,
        type: ArticleType.WEEKLY_DIGEST,
        summary: digestContent.summary || "",
        content: digestContent.content || "",
        status: ArticleStatus.DRAFT,
        authorId: auth.user!.id,
        periodStart: weekAgo,
        periodEnd: now,
      },
    })

    logs.push(`Created article: ${article.id}`)

    // Update job run
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: JobStatus.COMPLETED,
        finishedAt: new Date(),
        logs,
      },
    })

    return successResponse({
      jobRunId: jobRun.id,
      articleId: article.id,
      logs,
    })
  } catch (error) {
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: JobStatus.FAILED,
        finishedAt: new Date(),
        error: String(error),
      },
    })

    return errorResponse(`Pipeline failed: ${error}`)
  }
}
