import type { ForecastPreset, RadarLabel, Recommendation, RiskLevel } from "@/lib/data"

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

export type HoldingItem = {
  symbol: string
  name?: string
  value: number
  price?: number | null
  shares?: number
  exposure_percent?: number
  change_7d?: number
  color?: string
  risk?: RiskLevel
  recommendation?: Recommendation
}

export type AlertItem = {
  id: string
  symbol: string
  message: string
  severity: string
  time?: string
}

export type PerformancePoint = {
  date: string
  value: number
}

export type DashboardResponse = {
  portfolio_value: number
  checking_balance: number
  main_alert: string
  best_opportunity: string
  best_opportunity_score?: number
  risk_level: RiskLevel
  connected?: boolean
  demo?: boolean
  requires_connection?: boolean
  masked_key?: string | null
  risk_detail?: string
  holdings_count?: number
  holdings?: HoldingItem[]
  performance?: PerformancePoint[]
  weekly_change?: number
  alerts?: AlertItem[]
}

export type ForecastRequest = {
  symbol: string
  amount: number
  horizon_days: number
  risk_profile: "conservative" | "balanced" | "aggressive"
}

export type ApiForecastResponse = {
  symbol: string
  current_price: number
  amount: number
  horizon_days: number
  bearish: { pnl: number; price?: number | null }
  base: { pnl: number; price?: number | null }
  bullish: { pnl: number; price?: number | null }
  risk: string
  explanation: string
  disclaimer: string
  ai_provider?: string
  yahoo_period?: string
  daily_volatility?: number | null
  backtest_mape_pct?: number | null
  historical?: HistoryPoint[]
  projection?: ProjectionPoint[]
}

export type HistoryPoint = {
  date: string
  close: number
  volume?: number | null
}

export type ProjectionPoint = {
  date: string
  base: number
  bearish: number
  bullish: number
}

export type MarketHistoryResponse = {
  symbol: string
  yahoo_ticker: string
  period: string
  source: string
  current_price: number
  mean_daily_return: number
  daily_volatility: number
  backtest_mape_pct: number | null
  historical: HistoryPoint[]
}

export type ForecastResponse = ForecastPreset

export type RadarAsset = {
  symbol: string
  name: string
  asset_class: string
  price: number
  change_7d: number
  volatility: number
  exposure: number
  score: number
  label: RadarLabel | string
  risk: RiskLevel
  recommendation: string
  reason: string
}

export type RadarResponse = {
  requires_connection: boolean
  assets: RadarAsset[]
  total: number
}

export type RankingResponse = RadarAsset[]

export type TrackRecordItem = {
  id: string
  symbol: string
  name: string
  date: string
  horizon: string
  recommendation: string
  entry_price: number
  predicted_price: number
  actual_price: number
  invested: number
  status: string
  in_progress: boolean
  predicted_pct: number
  actual_pct: number
  deviation: number
  hypothetical_gain: number
}

export type TrackRecordResponse = {
  requires_connection: boolean
  stats: {
    accuracy: number
    pnl: number
    roi: number
    deviation: number
  }
  records: TrackRecordItem[]
}

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
