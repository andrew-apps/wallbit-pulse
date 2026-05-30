import { forecastPresets, pulse, ranking } from "@/lib/data"
import type {
  ConnectWallbitResponse,
  DashboardResponse,
  ForecastRequest,
  ForecastResponse,
  RankingResponse,
  TelegramLinkCodeResponse,
  TelegramSendResponse,
  TelegramStatusResponse,
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
      return new ApiError(
        detail.message || "Error de API",
        detail.error || "api_error",
        response.status,
      )
    }
  } catch {
    // ignore parse errors
  }
  return new ApiError(`Error de API (${response.status})`, "api_error", response.status)
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new ApiError("Backend no configurado. Crea front/.env.local con NEXT_PUBLIC_API_URL.", "missing_api_url", 0)

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw await parseApiError(response)
  }

  return response.json() as Promise<T>
}

export async function getWallbitStatus() {
  if (!API_URL) {
    return {
      connected: false,
      demo: true,
      mode: null,
      permissions: [],
      masked_key: null,
    } satisfies WallbitStatusResponse
  }
  return apiFetch<WallbitStatusResponse>("/connect-wallbit/status")
}

export async function connectWallbit(apiKey: string, mode = "read_only") {
  if (!API_URL) {
    if (!apiKey.trim()) {
      throw new ApiError("Configura NEXT_PUBLIC_API_URL en front/.env.local para conectar Wallbit.", "missing_api_url", 0)
    }
    return {
      connected: true,
      permissions: ["read"],
      message: "Modo demo local sin backend.",
      demo: true,
    } satisfies ConnectWallbitResponse
  }

  return apiFetch<ConnectWallbitResponse>("/connect-wallbit", {
    method: "POST",
    body: JSON.stringify({ api_key: apiKey, mode }),
  })
}

export async function connectWallbitDemo() {
  if (!API_URL) {
    return {
      connected: true,
      demo: true,
      permissions: ["read"],
      message: "Modo demo activado.",
    } satisfies ConnectWallbitResponse
  }
  return apiFetch<ConnectWallbitResponse>("/connect-wallbit/demo", { method: "POST" })
}

export async function disconnectWallbit() {
  if (!API_URL) return { connected: false, message: "Desconectado." }
  return apiFetch<{ connected: boolean; message: string }>("/connect-wallbit", { method: "DELETE" })
}

export async function getDashboard() {
  if (!API_URL) {
    return {
      portfolio_value: pulse.portfolioValue,
      checking_balance: 1250,
      main_alert: pulse.mainAlert,
      best_opportunity: pulse.bestOpportunity,
      risk_level: pulse.riskLevel,
      risk_detail: pulse.riskDetail,
      demo: true,
      connected: false,
    } satisfies DashboardResponse
  }

  return apiFetch<DashboardResponse>("/dashboard")
}

export async function runForecast(request: ForecastRequest) {
  if (!API_URL) {
    return (forecastPresets[request.symbol] ?? forecastPresets.BTC) satisfies ForecastResponse
  }

  return apiFetch<ForecastResponse>("/forecast", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export async function getRanking() {
  if (!API_URL) return ranking satisfies RankingResponse
  return apiFetch<RankingResponse>("/ranking")
}

export async function getTelegramStatus() {
  if (!API_URL) {
    return {
      configured: false,
      linked: false,
      chat_id: null,
      username: null,
      bot_username: "wallbit_radar_bot",
      bot_url: "https://t.me/wallbit_radar_bot",
      can_send: false,
      demo: true,
    } satisfies TelegramStatusResponse
  }
  return apiFetch<TelegramStatusResponse>("/telegram/status")
}

export async function createTelegramLinkCode() {
  if (!API_URL) {
    return {
      code: "WB-PULSE-7F3K",
      bot_url: "https://t.me/wallbit_radar_bot",
      instructions: "Abre el bot y envia /start WB-PULSE-7F3K",
    } satisfies TelegramLinkCodeResponse
  }
  return apiFetch<TelegramLinkCodeResponse>("/telegram/link-code", { method: "POST" })
}

export async function sendForecastToTelegram(request: ForecastRequest) {
  if (!API_URL) {
    return { sent: true, demo: true } satisfies TelegramSendResponse
  }
  return apiFetch<TelegramSendResponse>("/telegram/send-forecast", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export async function sendRiskAlertToTelegram(alertId: string) {
  if (!API_URL) {
    return { sent: true, demo: true }
  }
  return apiFetch<{ sent: boolean; demo?: boolean }>(`/reports/${alertId}/send-telegram`, {
    method: "POST",
  })
}
