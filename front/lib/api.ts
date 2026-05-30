import type {
  ApiForecastResponse,
  ConnectWallbitResponse,
  DashboardResponse,
  ForecastRequest,
  ForecastResponse,
  HistoryPoint,
  MarketHistoryResponse,
  ProjectionPoint,
  RadarResponse,
  RankingResponse,
  TelegramLinkCodeResponse,
  TelegramSendResponse,
  TelegramStatusResponse,
  TrackRecordResponse,
  WallbitStatusResponse,
} from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export class ApiError extends Error {
  code: string
  status: number

  constructor(message: string, code = "unknown_error", status = 500) {
    super(message)
    this.code = code
    this.status = status
  }
}

async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as { detail?: string | { error?: string; message?: string } }
    const detail = body.detail
    if (typeof detail === "string") {
      return new ApiError(detail, detail, response.status)
    }
    if (detail && typeof detail === "object") {
      return new ApiError(detail.message || "Error de API", detail.error || "api_error", response.status)
    }
  } catch {
    // ignore
  }
  return new ApiError(`Error de API (${response.status})`, "api_error", response.status)
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new ApiError("Configura NEXT_PUBLIC_API_URL en front/.env.local", "missing_api_url", 0)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  })

  if (!response.ok) throw await parseApiError(response)
  return response.json() as Promise<T>
}

function mapForecast(api: ApiForecastResponse): ForecastResponse & {
  aiProvider: string
  yahooPeriod: string
  backtestMape: number | null
  historical: HistoryPoint[]
  projection: ProjectionPoint[]
} {
  const risk = api.risk as ForecastResponse["risk"]
  return {
    symbol: api.symbol,
    currentPrice: api.current_price,
    amount: api.amount,
    horizonDays: api.horizon_days,
    risk,
    range: `$${api.bearish.price?.toLocaleString("en-US") ?? "—"} - $${api.bullish.price?.toLocaleString("en-US") ?? "—"}`,
    explanation: api.explanation,
    scenarios: [
      { label: "Pesimista", pnl: api.bearish.pnl, price: api.bearish.price ?? 0 },
      { label: "Base", pnl: api.base.pnl, price: api.base.price ?? 0 },
      { label: "Optimista", pnl: api.bullish.pnl, price: api.bullish.price ?? 0 },
    ],
    aiProvider: api.ai_provider ?? "fallback",
    yahooPeriod: api.yahoo_period ?? "1y",
    backtestMape: api.backtest_mape_pct ?? null,
    historical: api.historical ?? [],
    projection: api.projection ?? [],
  }
}

export async function getWallbitStatus() {
  return apiFetch<WallbitStatusResponse>("/connect-wallbit/status")
}

export async function connectWallbit(apiKey: string, mode = "read_only") {
  return apiFetch<ConnectWallbitResponse>("/connect-wallbit", {
    method: "POST",
    body: JSON.stringify({ api_key: apiKey, mode }),
  })
}

export async function connectWallbitDemo() {
  return apiFetch<ConnectWallbitResponse>("/connect-wallbit/demo", { method: "POST" })
}

export async function disconnectWallbit() {
  return apiFetch<{ connected: boolean; message: string }>("/connect-wallbit", { method: "DELETE" })
}

export async function getDashboard() {
  return apiFetch<DashboardResponse>("/dashboard")
}

export async function getRadar() {
  return apiFetch<RadarResponse>("/radar")
}

export async function getRanking() {
  return apiFetch<RankingResponse>("/ranking")
}

export async function getTrackRecord() {
  return apiFetch<TrackRecordResponse>("/track-record")
}

export async function getMarketHistory(symbol: string, period = "1y") {
  return apiFetch<MarketHistoryResponse>(`/market/history/${symbol}?period=${period}`)
}

export async function runForecast(request: ForecastRequest) {
  const api = await apiFetch<ApiForecastResponse>("/forecast", {
    method: "POST",
    body: JSON.stringify(request),
  })
  return mapForecast(api)
}

export async function getTelegramStatus() {
  return apiFetch<TelegramStatusResponse>("/telegram/status")
}

export async function createTelegramLinkCode() {
  return apiFetch<TelegramLinkCodeResponse>("/telegram/link-code", { method: "POST" })
}

export async function sendForecastToTelegram(request: ForecastRequest) {
  return apiFetch<TelegramSendResponse>("/telegram/send-forecast", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export async function sendRiskAlertToTelegram(alertId: string) {
  return apiFetch<{ sent: boolean; demo?: boolean }>(`/reports/${alertId}/send-telegram`, { method: "POST" })
}

export type AlertOut = {
  id: string
  symbol: string
  alert_type: string
  severity: string
  message: string
  snapshot_url?: string | null
  sent_to_telegram?: boolean
}

export async function getAlerts() {
  return apiFetch<AlertOut[]>("/alerts")
}

export async function createAlert(payload: { symbol: string; condition: string; threshold: number }) {
  return apiFetch<AlertOut>("/alerts", {
    method: "POST",
    body: JSON.stringify({ ...payload, channel: "telegram" }),
  })
}
