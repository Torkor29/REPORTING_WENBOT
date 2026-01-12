import OpenAI from "openai"
import { prisma } from "@/lib/db"
import { PromptAgent } from "@prisma/client"

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
  protected openai: OpenAI
  protected logs: string[] = []
  protected startTime: number = 0

  constructor(name: string, agentType: PromptAgent) {
    this.name = name
    this.agentType = agentType
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
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
      throw new Error(`No prompt template found for agent: ${this.agentType}`)
    }

    return template.template
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
    const response = await this.openai.chat.completions.create({
      model: options?.model || "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    })

    return response.choices[0]?.message?.content || ""
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
    const response = await this.openai.chat.completions.create({
      model: options?.model || "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 4096,
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content || "{}"
    return JSON.parse(content) as T
  }

  protected startTimer(): void {
    this.startTime = Date.now()
  }

  protected getElapsed(): number {
    return Date.now() - this.startTime
  }

  abstract execute(...args: unknown[]): Promise<AgentResult>
}
