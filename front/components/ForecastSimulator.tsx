"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowRight, Bell, Loader2, Send, Shuffle } from "lucide-react"
import { ConnectRequired } from "@/components/ConnectRequired"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScenarioCards } from "@/components/ScenarioCards"
import { RealVsPredictiveChart } from "@/components/forecast/RealVsPredictiveChart"
import { ForecastProjectionChart } from "@/components/forecast/ForecastProjectionChart"
import { TradeConfirmationModal } from "@/components/TradeConfirmationModal"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { AssetSearchCombobox } from "@/components/forecast/AssetSearchCombobox"
import { ApiError, getRadar, getWallbitStatus, runForecast, sendForecastToTelegram } from "@/lib/api"
import type { ForecastPreset } from "@/lib/data"
import type { RadarAsset } from "@/lib/types"

const horizons = [7, 15, 30]
const profiles = [
  { value: "conservative", label: "Conservador" },
  { value: "balanced", label: "Moderado" },
  { value: "aggressive", label: "Agresivo" },
]

export function ForecastSimulator() {
  const searchParams = useSearchParams()
  const initialSymbol = searchParams.get("symbol")?.toUpperCase() || "SPY"

  const [symbol, setSymbol] = useState(initialSymbol)
  const [amount, setAmount] = useState(1000)
  const [horizon, setHorizon] = useState(30)
  const [profile, setProfile] = useState("balanced")
  const [radarAssets, setRadarAssets] = useState<RadarAsset[]>([])
  const [requiresConnection, setRequiresConnection] = useState(false)
  const [forecast, setForecast] = useState<
    (ForecastPreset & {
      aiProvider?: string
      yahooPeriod?: string
      backtestMape?: number | null
      historical?: import("@/lib/types").HistoryPoint[]
      projection?: import("@/lib/types").ProjectionPoint[]
    }) | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastError, setForecastError] = useState("")
  const [telegramSent, setTelegramSent] = useState(false)
  const [telegramLoading, setTelegramLoading] = useState(false)
  const [tradeOpen, setTradeOpen] = useState(false)

  useEffect(() => {
    Promise.all([getWallbitStatus(), getRadar()])
      .then(([status, radar]) => {
        setRequiresConnection(!status.connected || status.demo)
        setRadarAssets(radar.assets)
        const match = radar.assets.find((a) => a.symbol === initialSymbol)
        if (radar.assets.length && !match) {
          const byName = radar.assets.find((a) => a.name.toLowerCase().includes(initialSymbol.toLowerCase()))
          setSymbol(byName?.symbol ?? radar.assets[0].symbol)
        } else if (match) {
          setSymbol(match.symbol)
        }
      })
      .finally(() => setLoading(false))
  }, [initialSymbol])

  useEffect(() => {
    if (requiresConnection || loading) return

    setForecastLoading(true)
    setForecastError("")
    runForecast({
      symbol,
      amount,
      horizon_days: horizon,
      risk_profile: profile as "conservative" | "balanced" | "aggressive",
    })
      .then((result) => {
        setForecast(result)
        setTelegramSent(false)
      })
      .catch((err) => {
        setForecast(null)
        setForecastError(err instanceof ApiError ? err.message : "No se pudo calcular el forecast")
      })
      .finally(() => setForecastLoading(false))
  }, [symbol, amount, horizon, profile, requiresConnection, loading])

  const selectableAssets = useMemo(() => (radarAssets.length ? radarAssets : [{ symbol, name: symbol } as RadarAsset]), [radarAssets, symbol])

  useEffect(() => {
    if (!loading && symbol) {
      const params = new URLSearchParams(window.location.search)
      if (params.get("symbol") !== symbol) {
        params.set("symbol", symbol)
        window.history.replaceState(null, "", `/forecast?${params.toString()}`)
      }
    }
  }, [symbol, loading])

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
    } catch {
      setTelegramSent(false)
    } finally {
      setTelegramLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Preparando simulador...
      </div>
    )
  }

  if (requiresConnection) {
    return <ConnectRequired message="El forecast usa precios reales de Wallbit y guarda predicciones en tu track record." />
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Simula escenarios con precios reales de Wallbit. Cada simulacion queda registrada en Track Record.
      </p>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <section className="rounded-xl border border-border bg-card p-5 xl:sticky xl:top-24 xl:self-start">
          <h2 className="text-sm font-semibold">Parametros</h2>

          <div className="mt-5 space-y-5">
            <div className="space-y-2">
              <Label>Activo</Label>
              <AssetSearchCombobox assets={selectableAssets} value={symbol} onChange={setSymbol} />
              <p className="text-xs text-muted-foreground">Busca por ticker (GE) o nombre (General Electric).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="forecast-amount">Monto (USD)</Label>
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
                    className="h-10 px-2 text-xs sm:text-sm"
                  >
                    {item} dias
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Perfil de riesgo</Label>
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

            <Button className="w-full" size="lg" onClick={() => setTradeOpen(true)} disabled={!forecast}>
              Operar {symbol}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          {forecastLoading ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Calculando escenarios con datos reales...
            </div>
          ) : forecastError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
              {forecastError}
            </div>
          ) : forecast ? (
            <>
              <ScenarioCards scenarios={forecast.scenarios} amount={amount} />
              <RealVsPredictiveChart
                historical={forecast.historical ?? []}
                projection={forecast.projection ?? []}
                symbol={symbol}
                period={forecast.yahooPeriod ?? "1y"}
                backtestMape={forecast.backtestMape}
              />
              <ForecastProjectionChart amount={amount} horizonDays={horizon} scenarios={forecast.scenarios} />

              <div className="brand-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-sm font-semibold">Explicacion del agente</h3>
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent">
                    {forecast.aiProvider === "cerebras" ? "Cerebras IA" : "Analisis local"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{forecast.explanation}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Precio actual {symbol}: ${forecast.currentPrice.toLocaleString("en-US")} · Riesgo: {forecast.risk} ·{" "}
                  {forecast.range}
                </p>
              </div>
            </>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button onClick={handleSendTelegram} disabled={telegramLoading || !forecast}>
              {telegramLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {telegramSent ? "Enviado a Telegram" : "Enviar a Telegram"}
            </Button>
            <Button variant="outline" asChild>
              <a href="/alerts">
                <Bell className="size-4" />
                Crear alerta
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/radar">
                <Shuffle className="size-4" />
                Ver radar
              </a>
            </Button>
          </div>

          <DisclaimerBanner />
        </section>
      </div>

      {forecast ? (
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
      ) : null}
    </div>
  )
}
