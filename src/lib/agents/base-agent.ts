import OpenAI from "openai"
import { prisma } from "@/lib/db"
import { PromptAgent } from "@prisma/client"

// Using Groq's free API (compatible with OpenAI SDK)
// Free tier: 30 requests/minute, Llama 3.1 70B
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
})

// Default model - Llama 3.1 70B (best free model)
const DEFAULT_MODEL = "llama-3.1-70b-versatile"

export interface AgentResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  logs: string[]
  duration: number
}

export abstract class BaseAgent {
  protected name: string
  protected agentType: PromptAgent
  protected llm: OpenAI
  protected logs: string[] = []
  protected startTime: number = 0

  constructor(name: string, agentType: PromptAgent) {
    this.name = name
    this.agentType = agentType
    this.llm = groq
  }

  protected log(message: string): void {
    const timestamp = new Date().toISOString()
    this.logs.push(`[${timestamp}] ${message}`)
    console.log(`[${this.name}] ${message}`)
  }

  protected async getPrompt(): Promise<string> {
    const template = await prisma.promptTemplate.findUnique({
      where: { agent: this.agentType },
    })

    if (!template) {
      // Return a default prompt if none found
      return this.getDefaultPrompt()
    }

    return template.template
  }

  protected getDefaultPrompt(): string {
    const prompts: Record<PromptAgent, string> = {
      COLLECTOR: "You are a news collector agent. Extract and structure news articles from the provided sources.",
      RANKER: "You are a relevance ranker. Score each article from 1-10 based on importance for crypto trading.",
      CLUSTERER: "You are an event clusterer. Group related articles into coherent event clusters.",
      WRITER: "You are a financial writer. Create clear, professional summaries for investors.",
      RISK_COMPLIANCE: "You are a risk analyst. Identify potential risks and compliance issues.",
      MONTHLY_SYNTHESIZER: "You are a monthly report synthesizer. Create comprehensive monthly performance reports.",
      EDITOR_ASSISTANT: "You are an editorial assistant. Help improve and polish content.",
    }
    return prompts[this.agentType] || "You are a helpful assistant."
  }

  protected async callLLM(
    systemPrompt: string,
    userMessage: string,
    options?: {
      model?: string
      temperature?: number
      maxTokens?: number
    }
  ): Promise<string> {
    try {
      const response = await this.llm.chat.completions.create({
        model: options?.model || DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
      })

      return response.choices[0]?.message?.content || ""
    } catch (error) {
      this.log(`LLM error: ${error}`)
      throw error
    }
  }

  protected async callLLMWithJSON<T>(
    systemPrompt: string,
    userMessage: string,
    options?: {
      model?: string
      temperature?: number
      maxTokens?: number
    }
  ): Promise<T> {
    try {
      // Groq supports JSON mode with json_object
      const response = await this.llm.chat.completions.create({
        model: options?.model || DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt + "\n\nYou must respond with valid JSON only." },
          { role: "user", content: userMessage },
        ],
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 4096,
        response_format: { type: "json_object" },
      })

      const content = response.choices[0]?.message?.content || "{}"
      return JSON.parse(content) as T
    } catch (error) {
      this.log(`LLM JSON error: ${error}`)
      throw error
    }
  }

  protected startTimer(): void {
    this.startTime = Date.now()
  }

  protected getElapsed(): number {
    return Date.now() - this.startTime
  }

  abstract execute(...args: unknown[]): Promise<AgentResult>
}
