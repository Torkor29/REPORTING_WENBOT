export { BaseAgent, type AgentResult } from "./base-agent"
export { CollectorAgent } from "./collector-agent"
export { RankerAgent } from "./ranker-agent"
export { ClustererAgent } from "./clusterer-agent"
export { WriterAgent } from "./writer-agent"

// Weekly digest pipeline
export async function runWeeklyPipeline(weekStart: Date, weekEnd: Date, authorId: string) {
  const { CollectorAgent } = await import("./collector-agent")
  const { RankerAgent } = await import("./ranker-agent")
  const { ClustererAgent } = await import("./clusterer-agent")
  const { WriterAgent } = await import("./writer-agent")

  const results = {
    collector: null as Awaited<ReturnType<CollectorAgent["execute"]>> | null,
    ranker: null as Awaited<ReturnType<RankerAgent["execute"]>> | null,
    clusterer: null as Awaited<ReturnType<ClustererAgent["execute"]>> | null,
    writer: null as Awaited<ReturnType<WriterAgent["execute"]>> | null,
  }

  // Step 1: Collect
  const collector = new CollectorAgent()
  results.collector = await collector.execute()
  if (!results.collector.success) {
    return { success: false, step: "collector", results }
  }

  // Step 2: Rank
  const ranker = new RankerAgent()
  results.ranker = await ranker.execute(weekStart, weekEnd)
  if (!results.ranker.success) {
    return { success: false, step: "ranker", results }
  }

  // Step 3: Cluster
  const clusterer = new ClustererAgent()
  results.clusterer = await clusterer.execute(weekStart, weekEnd)
  if (!results.clusterer.success) {
    return { success: false, step: "clusterer", results }
  }

  // Step 4: Write
  const writer = new WriterAgent()
  results.writer = await writer.execute(weekStart, weekEnd, authorId)

  return {
    success: results.writer.success,
    step: "complete",
    results,
  }
}
