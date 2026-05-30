"use client"

import { useMemo, useState } from "react"
import { Bell, Loader2, Send, Shuffle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScenarioCards } from "@/components/ScenarioCards"
import { TradeConfirmationModal } from "@/components/TradeConfirmationModal"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { sendForecastToTelegram } from "@/lib/api"
import { forecastPresets, type ForecastPreset, type RiskLevel } from "@/lib/data"

const symbols = ["BTC", "ETH", "SPY", "QQQ", "AAPL", "NVDA", "TSLA"]
const horizons = [7, 15, 30]
const profiles = [
  { value: "conservative", label: "Conservador" },
  { value: "balanced", label: "Balanceado" },
  { value: "aggressive", label: "Agresivo" },
]

function buildFallback(symbol: string, amount: number, horizon: number): ForecastPreset {
  const risk: RiskLevel = symbol === "SPY" || symbol === "QQQ" ? "Bajo" : "Alto"
  const volatilityFactor = risk === "Alto" ? 0.14 : 0.05
  const horizonFactor = horizon / 30
  return {
    symbol,
    currentPrice: symbol === "ETH" ? 3480 : symbol === "NVDA" ? 128.44 : 250,
    amount,
    horizonDays: horizon,
    risk,
    range: "Rango estimado segun volatilidad demo",
    explanation:
      risk === "Alto"
        ? "Alta volatilidad: conviene comparar el escenario pesimista antes de operar."
        : "Volatilidad moderada: el escenario base es estable, pero sigue siendo simulacion.",
    scenarios: [
      { label: "Pesimista", pnl: Math.round(-amount * volatilityFactor * horizonFactor), price: 230 },
      { label: "Base", pnl: Math.round(amount * 0.035 * horizonFactor), price: 260 },
      { label: "Optimista", pnl: Math.round(amount * volatilityFactor * 1.8 * horizonFactor), price: 290 },
    ],
  }
}

export function ForecastSimulator() {
  const [symbol, setSymbol] = useState("BTC")
  const [amount, setAmount] = useState(500)
  const [horizon, setHorizon] = useState(30)
  const [profile, setProfile] = useState("balanced")
  const [telegramSent, setTelegramSent] = useState(false)
  const [telegramLoading, setTelegramLoading] = useState(false)
  const [telegramDemo, setTelegramDemo] = useState(false)
  const [tradeOpen, setTradeOpen] = useState(false)

  const forecast = useMemo(() => {
    const preset = forecastPresets[symbol]
    if (preset && amount === 500 && horizon === 30) return preset
    return buildFallback(symbol, amount, horizon)
  }, [symbol, amount, horizon])

  async function handleSendTelegram() {
    setTelegramLoading(true)
    try {
      const result = await sendForecastToTelegram({
        symbol,
        amount,
        horizon_days: horizon,
        risk_profile: profile as "conservative" | "balanced" | "aggressive",
      })
      setTelegramSent(result.sent)
      setTelegramDemo(result.demo)
    } catch {
      setTelegramSent(false)
    } finally {
      setTelegramLoading(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Simula un escenario</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Calcula cuanto podrias ganar o perder segun monto y horizonte.
        </p>

        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <Label>Activo</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {symbols.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="forecast-amount">Monto</Label>
            <Input
              id="forecast-amount"
              type="number"
              min={1}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label>Horizonte</Label>
            <div className="grid grid-cols-3 gap-2">
              {horizons.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={horizon === item ? "default" : "outline"}
                  onClick={() => setHorizon(item)}
                  className="h-10"
                >
                  {item}d
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Perfil</Label>
            <Select value={profile} onValueChange={setProfile}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <ScenarioCards scenarios={forecast.scenarios} />

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Precio actual</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                ${forecast.currentPrice.toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rango estimado</p>
              <p className="mt-1 text-lg font-semibold">{forecast.range}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Riesgo</p>
              <p className={forecast.risk === "Alto" ? "mt-1 text-lg font-semibold text-destructive" : "mt-1 text-lg font-semibold text-accent"}>
                {forecast.risk}
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{forecast.explanation}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={handleSendTelegram} disabled={telegramLoading}>
            {telegramLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {telegramSent
              ? telegramDemo
                ? "Preview demo enviado"
                : "Enviado a Telegram"
              : "Enviar a Telegram"}
          </Button>
          <Button variant="outline">
            <Bell className="size-4" />
            Crear alerta
          </Button>
          <Button variant="outline">
            <Shuffle className="size-4" />
            Simular rebalanceo
          </Button>
          <Button variant="secondary" onClick={() => setTradeOpen(true)}>
            Preparar orden
          </Button>
        </div>

        <DisclaimerBanner />
      </section>

      <TradeConfirmationModal
        open={tradeOpen}
        onOpenChange={setTradeOpen}
        symbol={symbol}
        side="BUY"
        amount={amount}
        risk={forecast.risk}
        scenarios={forecast.scenarios}
        readOnly
      />
    </div>
  )
}
