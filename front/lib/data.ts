export type Recommendation = "Comprar" | "Mantener" | "Reducir" | "Vender"
export type RiskLevel = "Bajo" | "Medio" | "Moderado" | "Alto"
export type RadarLabel = "Opportunity" | "Watch" | "Neutral" | "Risky" | "Reduce"

export type Holding = {
  symbol: string
  name: string
  value: number
  price: number
  change7d: number
  volatility: number
  exposure: number
  score: number
  recommendation: Recommendation
  risk: RiskLevel
  color: string
}

export type RankedAsset = {
  symbol: string
  score: number
  label: RadarLabel
  risk: RiskLevel
  reason: string
  action: string
}

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

export type Alert = {
  id: string
  symbol: string
  title: string
  detail: string
  type: "risk" | "opportunity" | "info"
  severity: RiskLevel
  time: string
}

export const CHECKING_BALANCE = 1250
export const PORTFOLIO_VALUE = 8760
export const DISCLAIMER =
  "Esto no es asesoria financiera. Las proyecciones son simulaciones basadas en datos historicos y no garantizan ganancias."

export const holdings: Holding[] = [
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF",
    value: 2500,
    price: 542.18,
    change7d: 1.2,
    volatility: 12,
    exposure: 28,
    score: 82,
    recommendation: "Mantener",
    risk: "Bajo",
    color: "var(--chart-1)",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp",
    value: 1800,
    price: 128.44,
    change7d: -5.1,
    volatility: 38,
    exposure: 18,
    score: 68,
    recommendation: "Reducir",
    risk: "Alto",
    color: "var(--chart-5)",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc",
    value: 1200,
    price: 226.05,
    change7d: -0.8,
    volatility: 18,
    exposure: 14,
    score: 72,
    recommendation: "Mantener",
    risk: "Medio",
    color: "var(--chart-2)",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    value: 1500,
    price: 65000,
    change7d: 3.4,
    volatility: 52,
    exposure: 17,
    score: 63,
    recommendation: "Mantener",
    risk: "Alto",
    color: "var(--chart-4)",
  },
  {
    symbol: "CASH",
    name: "Cash",
    value: 1760,
    price: 1,
    change7d: 0,
    volatility: 0,
    exposure: 20,
    score: 50,
    recommendation: "Mantener",
    risk: "Bajo",
    color: "var(--chart-3)",
  },
]

export type AssetClass = "Accion" | "ETF" | "Cripto"
export const assetClasses: ("Todos" | AssetClass)[] = ["Todos", "Accion", "ETF", "Cripto"]

function buildAsset(
  symbol: string,
  name: string,
  assetClass: AssetClass,
  price: number,
  change7d: number,
  volatility: number,
  score: number,
  colorIdx: number,
  exposure = 0,
  value = 0,
): Holding & { assetClass: AssetClass } {
  const recommendation: Recommendation =
    score >= 80 ? "Comprar" : score >= 65 ? "Mantener" : score >= 45 ? "Reducir" : "Vender"
  const risk: RiskLevel = volatility >= 35 ? "Alto" : volatility >= 18 ? "Medio" : "Bajo"
  return {
    symbol,
    name,
    assetClass,
    price,
    change7d,
    volatility,
    score,
    exposure,
    value,
    recommendation,
    risk,
    color: `var(--chart-${(colorIdx % 5) + 1})`,
  }
}

export const radarAssets: (Holding & { assetClass: AssetClass })[] = [
  buildAsset("SPY", "SPDR S&P 500 ETF", "ETF", 542.18, 1.2, 12, 82, 0, 28, 2500),
  buildAsset("QQQ", "Invesco QQQ Trust", "ETF", 478.2, 1.9, 16, 76, 1),
  buildAsset("NVDA", "NVIDIA Corp", "Accion", 128.44, -5.1, 38, 68, 4, 18, 1800),
  buildAsset("BTC", "Bitcoin", "Cripto", 65000, 3.4, 52, 63, 3, 17, 1500),
  buildAsset("TSLA", "Tesla Inc", "Accion", 248.5, -3.2, 45, 58, 2),
  buildAsset("ETH", "Ethereum", "Cripto", 3480, 2.8, 48, 61, 1),
  buildAsset("AAPL", "Apple Inc", "Accion", 226.05, -0.8, 18, 72, 2, 14, 1200),
]

export const pulse = {
  portfolioValue: PORTFOLIO_VALUE,
  weeklyChange: 1.2,
  mainAlert: "NVDA cayo 5.1% hoy",
  mainAlertDetail: "Tu exposicion actual es 18% del portafolio.",
  bestOpportunity: "SPY",
  bestOpportunityScore: 82,
  riskLevel: "Medio" as RiskLevel,
  riskDetail: "Mayor exposicion: NVDA 18%",
}

export const ranking: RankedAsset[] = [
  {
    symbol: "SPY",
    score: 82,
    label: "Opportunity",
    risk: "Bajo",
    reason: "Oportunidad defensiva con tendencia estable.",
    action: "Simular",
  },
  {
    symbol: "QQQ",
    score: 76,
    label: "Watch",
    risk: "Medio",
    reason: "Momentum positivo, vigilar volatilidad tech.",
    action: "Simular",
  },
  {
    symbol: "NVDA",
    score: 68,
    label: "Risky",
    risk: "Alto",
    reason: "Caida reciente y exposicion elevada.",
    action: "Simular",
  },
  {
    symbol: "BTC",
    score: 63,
    label: "Neutral",
    risk: "Alto",
    reason: "Alta volatilidad con momentum positivo.",
    action: "Simular",
  },
  {
    symbol: "TSLA",
    score: 58,
    label: "Watch",
    risk: "Alto",
    reason: "Vigilar por drawdown y volatilidad.",
    action: "Simular",
  },
]

export const forecastPresets: Record<string, ForecastPreset> = {
  BTC: {
    symbol: "BTC",
    currentPrice: 65000,
    amount: 500,
    horizonDays: 30,
    risk: "Alto",
    range: "$60,000 - $74,000",
    explanation: "Alta volatilidad y momentum positivo, pero el riesgo sigue elevado.",
    scenarios: [
      { label: "Pesimista", pnl: -42, price: 60000 },
      { label: "Base", pnl: 28, price: 68000 },
      { label: "Optimista", pnl: 96, price: 74000 },
    ],
  },
  SPY: {
    symbol: "SPY",
    currentPrice: 542.18,
    amount: 500,
    horizonDays: 30,
    risk: "Bajo",
    range: "$522 - $581",
    explanation: "Tendencia estable y baja volatilidad para un escenario defensivo.",
    scenarios: [
      { label: "Pesimista", pnl: -18, price: 522 },
      { label: "Base", pnl: 14, price: 557 },
      { label: "Optimista", pnl: 36, price: 581 },
    ],
  },
}

export const alerts: Alert[] = [
  {
    id: "risk-nvda-5",
    symbol: "NVDA",
    title: "NVDA cayo 5.1% hoy",
    detail: "Tu exposicion es 18%. Riesgo alto: conviene simular rebalanceo antes de operar.",
    type: "risk",
    severity: "Alto",
    time: "hace 4 min",
  },
  {
    id: "score-spy-82",
    symbol: "SPY",
    title: "SPY mantiene score 82/100",
    detail: "Oportunidad defensiva para comparar contra activos mas volatiles.",
    type: "opportunity",
    severity: "Bajo",
    time: "hace 18 min",
  },
  {
    id: "btc-volatility",
    symbol: "BTC",
    title: "BTC mantiene volatilidad alta",
    detail: "El escenario pesimista supera tu tolerancia configurada para 30 dias.",
    type: "risk",
    severity: "Alto",
    time: "hace 42 min",
  },
]

export const riskSnapshot = {
  product: "Wallbit Pulse AI",
  title: "Riesgo detectado",
  symbol: "NVDA",
  movement: "-5.1%",
  exposure: "18% del portafolio",
  forecast: forecastPresets.BTC.scenarios,
  suggestedAction: "Simular rebalanceo",
  severity: "Alto" as RiskLevel,
}

export const telegramMessage = `Wallbit Pulse AI Alert

NVDA cayo -5.1% hoy.
Tu exposicion actual es 18%.
Riesgo: Alto.

Te envie el reporte visual abajo.

Comandos:
/forecast NVDA 500 30
/rebalancear
/riesgo`

export const navItems = [
  { href: "/dashboard", label: "Pulse", icon: "Activity" },
  { href: "/forecast", label: "Simular", icon: "TrendingUp" },
  { href: "/radar", label: "Radar", icon: "Radar" },
  { href: "/alerts", label: "Alertas", icon: "Bell" },
  { href: "/telegram", label: "Telegram", icon: "Send" },
] as const

export const performanceData = [
  { date: "D-6", value: 8620 },
  { date: "D-5", value: 8685 },
  { date: "D-4", value: 8710 },
  { date: "D-3", value: 8698 },
  { date: "D-2", value: 8750 },
  { date: "D-1", value: 8784 },
  { date: "Hoy", value: 8760 },
]

export type PredictionStatus = "acertada" | "parcial" | "fallida" | "en curso"
export type PredictionRecord = {
  id: string
  symbol: string
  name: string
  color: string
  date: string
  horizon: string
  recommendation: Recommendation
  entryPrice: number
  predictedPrice: number
  actualPrice: number
  invested: number
  status: PredictionStatus
  inProgress?: boolean
}

export const predictions: PredictionRecord[] = []

export function formatCurrency(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}
