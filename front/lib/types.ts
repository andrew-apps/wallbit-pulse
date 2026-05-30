import type { ForecastPreset, RadarLabel, RiskLevel } from "@/lib/data"

export type WallbitMode = "read_only" | "trade"

export type ConnectWallbitResponse = {
  connected: boolean
  permissions: string[]
  message: string
  demo?: boolean
  masked_key?: string | null
}

export type WallbitStatusResponse = {
  connected: boolean
  demo: boolean
  mode: string | null
  permissions: string[]
  masked_key: string | null
  connected_at?: string | null
}

export type DashboardResponse = {
  portfolio_value: number
  checking_balance: number
  main_alert: string
  best_opportunity: string
  risk_level: RiskLevel
  connected?: boolean
  demo?: boolean
  masked_key?: string | null
  risk_detail?: string
  holdings_count?: number
}

export type ForecastRequest = {
  symbol: string
  amount: number
  horizon_days: number
  risk_profile: "conservative" | "balanced" | "aggressive"
}

export type ForecastResponse = ForecastPreset

export type RankingResponse = {
  symbol: string
  score: number
  label: RadarLabel
  risk: RiskLevel
  reason: string
}[]

export type TelegramStatusResponse = {
  configured: boolean
  linked: boolean
  chat_id: string | null
  username: string | null
  bot_username: string | null
  bot_url: string
  can_send: boolean
  demo: boolean
}

export type TelegramLinkCodeResponse = {
  code: string
  bot_url: string
  instructions: string
}

export type TelegramSendResponse = {
  sent: boolean
  demo: boolean
  message?: string
}
