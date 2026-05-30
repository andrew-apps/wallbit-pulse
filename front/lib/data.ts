export type Recommendation = "Comprar" | "Mantener" | "Reducir" | "Vender"
export type RiskLevel = "Bajo" | "Medio" | "Moderado" | "Alto"
export type RadarLabel = "Opportunity" | "Watch" | "Neutral" | "Risky" | "Reduce"
export type PredictionStatus = "acertada" | "parcial" | "fallida" | "en curso"

export type ForecastScenario = {
  label: "Pesimista" | "Base" | "Optimista"
  pnl: number
  price: number
}

export type ForecastPreset = {
  symbol: string
  currentPrice: number
  amount: number
  horizonDays: number
  risk: RiskLevel
  range: string
  explanation: string
  scenarios: ForecastScenario[]
}

export const assetClasses = ["Todos", "Accion", "ETF", "Cripto"] as const

export const DISCLAIMER =
  "Esto no es asesoria financiera. Las proyecciones son simulaciones basadas en datos historicos y no garantizan ganancias."

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/radar", label: "Investment Radar", icon: "Radar" },
  { href: "/forecast", label: "Forecast Simulator", icon: "TrendingUp" },
  { href: "/track-record", label: "Track Record", icon: "History" },
  { href: "/alerts", label: "Alertas", icon: "Bell" },
  { href: "/telegram", label: "Telegram Bot", icon: "Send" },
] as const

export function formatCurrency(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function symbolColor(symbol: string) {
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-5)", "var(--chart-4)", "var(--chart-3)"]
  let hash = 0
  for (let i = 0; i < symbol.length; i += 1) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
