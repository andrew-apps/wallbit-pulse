import type { ForecastPreset, RadarLabel, RiskLevel } from "@/lib/data"

export type WallbitMode = "read_only" | "trade"

export type ConnectWallbitResponse = {
  connected: boolean
  permissions: string[]
  message: string
}

export type DashboardResponse = {
  portfolio_value: number
  checking_balance: number
  main_alert: string
  best_opportunity: string
  risk_level: RiskLevel
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
