// Re-export Prisma types
export type {
  User,
  Account,
  Session,
  AllowedEmail,
  AllowedDomain,
  Invite,
  AuditLog,
  Source,
  RawArticle,
  EventCluster,
  Article,
  ArticleVersion,
  Citation,
  ShareLink,
  Trade,
  TradeNote,
  TradeAttachment,
  JobRun,
  JobSchedule,
  PromptTemplate,
  PromptVersion,
  Setting,
  DiscordWebhook,
  MarketDataCache,
} from "@prisma/client"

export {
  Role,
  AccountStatus,
  AuditAction,
  SourceType,
  SourceCategory,
  ArticleType,
  ArticleStatus,
  TradeDirection,
  TradeStatus,
  JobType,
  JobStatus,
  PromptAgent,
} from "@prisma/client"

// Custom types

export interface KPIData {
  performance: number
  performanceChange: number
  drawdown: number
  maxDrawdown: number
  volatility: number
  exposure: number
  winRate: number
  totalTrades: number
  profitFactor: number
  sharpeRatio: number
}

export interface TimelineEvent {
  id: string
  date: Date
  type: "market" | "bot" | "risk" | "strategy"
  title: string
  description: string
  impact: "positive" | "negative" | "neutral"
  metadata?: Record<string, unknown>
}

export interface KeyTakeaway {
  id: string
  icon: string
  title: string
  description: string
  category: "performance" | "risk" | "market" | "strategy"
}

export interface WeeklyDigestSection {
  category: "macro" | "crypto" | "geopolitics"
  title: string
  summary: string
  facts: string[]
  importance: string
  impact: string
  sources: Array<{
    title: string
    url: string
    publishedAt: string
  }>
}

export interface MonthlyReportData {
  executiveSummary: string
  marketContext: string
  volatilityPeriods: Array<{
    start: Date
    end: Date
    description: string
    severity: "low" | "medium" | "high"
  }>
  botDecisions: Array<{
    date: Date
    decision: string
    reason: string
    outcome?: string
  }>
  positives: string[]
  vigilancePoints: string[]
  faq: Array<{
    question: string
    answer: string
  }>
  glossary: Array<{
    term: string
    definition: string
  }>
}

export interface DiscordMessage {
  title: string
  content: string
  embeds?: Array<{
    title?: string
    description?: string
    color?: number
    fields?: Array<{
      name: string
      value: string
      inline?: boolean
    }>
  }>
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface TradeImportData {
  externalId?: string
  instrument: string
  direction: "LONG" | "SHORT"
  size: number
  entryPrice: number
  exitPrice?: number
  entryTime: string
  exitTime?: string
  pnl?: number
  pnlPercent?: number
  fees?: number
  tags?: string[]
}

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: "ADMIN" | "EDITOR" | "VIEWER"
  image: string | null
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface JobRunResult {
  success: boolean
  duration: number
  logs: string[]
  errors: string[]
  metadata?: Record<string, unknown>
}

export interface AgentConfig {
  name: string
  description: string
  prompt: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface NewsItem {
  title: string
  content: string
  summary?: string
  url: string
  source: string
  publishedAt: Date
  category: "macro" | "crypto" | "geopolitics" | "markets" | "regulation"
}
