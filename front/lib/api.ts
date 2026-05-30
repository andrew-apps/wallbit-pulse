import { forecastPresets, pulse, ranking } from "@/lib/data"
import type {
  ConnectWallbitResponse,
  DashboardResponse,
  ForecastRequest,
  ForecastResponse,
  RankingResponse,
} from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("API URL not configured")

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(`API error ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function connectWallbit(apiKey: string, mode = "read_only") {
  if (!API_URL) {
    return {
      connected: true,
      permissions: ["read"],
      message: apiKey ? "Wallbit conectado en modo demo solo lectura." : "Modo demo activado.",
    } satisfies ConnectWallbitResponse
  }

  return apiFetch<ConnectWallbitResponse>("/connect-wallbit", {
    method: "POST",
    body: JSON.stringify({ api_key: apiKey, mode }),
  })
}

export async function getDashboard() {
  if (!API_URL) {
    return {
      portfolio_value: pulse.portfolioValue,
      checking_balance: 1250,
      main_alert: pulse.mainAlert,
      best_opportunity: pulse.bestOpportunity,
      risk_level: pulse.riskLevel,
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
