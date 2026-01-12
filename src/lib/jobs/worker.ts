import { Worker, Queue, Job } from "bullmq"
import { prisma } from "@/lib/db"
import { JobType, JobStatus } from "@prisma/client"
import { runWeeklyPipeline } from "@/lib/agents"
import { startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths } from "date-fns"

// Redis connection config
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
}

// Job Queues
export const weeklyCollectQueue = new Queue("weekly-collect", { connection })
export const weeklyWriteQueue = new Queue("weekly-write", { connection })
export const monthlyGenerateQueue = new Queue("monthly-generate", { connection })
export const sourceFetchQueue = new Queue("source-fetch", { connection })

// Job processor function
async function processJob(
  job: Job,
  type: JobType,
  processor: () => Promise<{ success: boolean; data?: unknown; error?: string; logs?: string[] }>
) {
  // Create job run record
  const jobRun = await prisma.jobRun.create({
    data: {
      type,
      status: JobStatus.RUNNING,
      startedAt: new Date(),
      triggeredBy: job.data.triggeredBy || "scheduler",
      isManual: job.data.isManual || false,
    },
  })

  try {
    const result = await processor()

    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: result.success ? JobStatus.COMPLETED : JobStatus.FAILED,
        finishedAt: new Date(),
        duration: Date.now() - jobRun.startedAt!.getTime(),
        logs: result.logs || [],
        errors: result.error ? [result.error] : [],
        metadata: result.data as object || {},
      },
    })

    // Update schedule last run
    await prisma.jobSchedule.update({
      where: { type },
      data: { lastRunAt: new Date() },
    })

    return result
  } catch (error) {
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: JobStatus.FAILED,
        finishedAt: new Date(),
        duration: Date.now() - jobRun.startedAt!.getTime(),
        errors: [String(error)],
      },
    })
    throw error
  }
}

// Workers
export function startWorkers() {
  // Weekly Collect Worker
  const weeklyCollectWorker = new Worker(
    "weekly-collect",
    async (job) => {
      return processJob(job, JobType.WEEKLY_COLLECT, async () => {
        const { CollectorAgent } = await import("@/lib/agents/collector-agent")
        const collector = new CollectorAgent()
        return collector.execute()
      })
    },
    { connection }
  )

  // Weekly Write Worker (full pipeline)
  const weeklyWriteWorker = new Worker(
    "weekly-write",
    async (job) => {
      return processJob(job, JobType.WEEKLY_WRITE, async () => {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
        const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

        // Get system user for authoring
        const systemUser = await prisma.user.findFirst({
          where: { role: "ADMIN" },
        })

        if (!systemUser) {
          return { success: false, error: "No admin user found for authoring" }
        }

        return runWeeklyPipeline(weekStart, weekEnd, systemUser.id)
      })
    },
    { connection }
  )

  // Monthly Generate Worker
  const monthlyGenerateWorker = new Worker(
    "monthly-generate",
    async (job) => {
      return processJob(job, JobType.MONTHLY_GENERATE, async () => {
        const lastMonth = subMonths(new Date(), 1)
        const monthStart = startOfMonth(lastMonth)
        const monthEnd = endOfMonth(lastMonth)

        // TODO: Implement monthly synthesizer agent
        return {
          success: true,
          logs: ["Monthly report generation placeholder"],
          data: { month: lastMonth.toISOString() },
        }
      })
    },
    { connection }
  )

  // Source Fetch Worker
  const sourceFetchWorker = new Worker(
    "source-fetch",
    async (job) => {
      return processJob(job, JobType.SOURCE_FETCH, async () => {
        const { CollectorAgent } = await import("@/lib/agents/collector-agent")
        const collector = new CollectorAgent()
        return collector.execute()
      })
    },
    { connection }
  )

  console.log("Workers started")

  return {
    weeklyCollectWorker,
    weeklyWriteWorker,
    monthlyGenerateWorker,
    sourceFetchWorker,
  }
}

// Schedule jobs
export async function scheduleJobs() {
  // Clear existing scheduled jobs
  await weeklyCollectQueue.obliterate({ force: true })
  await weeklyWriteQueue.obliterate({ force: true })
  await monthlyGenerateQueue.obliterate({ force: true })
  await sourceFetchQueue.obliterate({ force: true })

  // Get schedules from DB
  const schedules = await prisma.jobSchedule.findMany({
    where: { isActive: true },
  })

  for (const schedule of schedules) {
    const queue = {
      [JobType.WEEKLY_COLLECT]: weeklyCollectQueue,
      [JobType.WEEKLY_WRITE]: weeklyWriteQueue,
      [JobType.MONTHLY_GENERATE]: monthlyGenerateQueue,
      [JobType.SOURCE_FETCH]: sourceFetchQueue,
    }[schedule.type]

    if (queue) {
      await queue.add(
        schedule.type,
        { scheduled: true },
        {
          repeat: { pattern: schedule.cronExpr },
          jobId: schedule.type,
        }
      )
      console.log(`Scheduled ${schedule.type}: ${schedule.cronExpr}`)
    }
  }
}

// Manual job trigger
export async function triggerJob(type: JobType, userId: string) {
  const queue = {
    [JobType.WEEKLY_COLLECT]: weeklyCollectQueue,
    [JobType.WEEKLY_WRITE]: weeklyWriteQueue,
    [JobType.MONTHLY_GENERATE]: monthlyGenerateQueue,
    [JobType.SOURCE_FETCH]: sourceFetchQueue,
  }[type]

  if (!queue) {
    throw new Error(`Unknown job type: ${type}`)
  }

  await queue.add(
    `${type}-manual-${Date.now()}`,
    { triggeredBy: userId, isManual: true },
    { removeOnComplete: true }
  )

  return { success: true, message: `Job ${type} triggered` }
}
