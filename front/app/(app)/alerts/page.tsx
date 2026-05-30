"use client"

import { useEffect, useState } from "react"
import { BellRing, Loader2, Send } from "lucide-react"
import { ConnectRequired } from "@/components/ConnectRequired"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { createAlert, getAlerts, getRadar, getWallbitStatus } from "@/lib/api"
import { ApiError } from "@/lib/api"

const conditions = [
  { value: "drop_percent", label: "caiga mas de" },
  { value: "rise_percent", label: "suba mas de" },
  { value: "score_above", label: "tenga score mayor a" },
  { value: "exposure_above", label: "supere exposicion de" },
]

export default function AlertsPage() {
  const [symbol, setSymbol] = useState("SPY")
  const [symbols, setSymbols] = useState<string[]>(["SPY"])
  const [condition, setCondition] = useState("drop_percent")
  const [threshold, setThreshold] = useState(5)
  const [created, setCreated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [requiresConnection, setRequiresConnection] = useState(false)
  const [alerts, setAlerts] = useState<Array<{ id: string; symbol: string; message: string; severity: string }>>([])
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([getWallbitStatus(), getRadar(), getAlerts()])
      .then(([status, radar, alertList]) => {
        setRequiresConnection(!status.connected || status.demo)
        const radarSymbols = radar.assets.map((a) => a.symbol)
        if (radarSymbols.length) {
          setSymbols(radarSymbols)
          setSymbol(radarSymbols[0])
        }
        setAlerts(alertList)
      })
      .finally(() => setLoading(false))
  }, [])

  const selectedCondition = conditions.find((item) => item.value === condition)?.label ?? "caiga mas de"

  async function handleCreate() {
    setError("")
    try {
      const alert = await createAlert({ symbol, condition, threshold })
      setAlerts((prev) => [alert, ...prev])
      setCreated(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la alerta")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Cargando alertas...
      </div>
    )
  }

  if (requiresConnection) {
    return (
      <div className="mx-auto max-w-4xl">
        <ConnectRequired message="Las alertas se evaluan contra precios y exposicion reales de tu cuenta Wallbit." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Risk Alerts</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Crea alertas como una frase.</h1>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-center gap-2">
          <BellRing className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Nueva alerta</h2>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1.5fr_120px]">
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
            <Label>Condicion</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Valor</Label>
            <Input
              type="number"
              min={1}
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="font-mono"
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm">
          Cuando <span className="font-semibold text-primary">{symbol}</span> {selectedCondition}{" "}
          <span className="font-semibold">{threshold}%</span>, enviar{" "}
          <span className="font-semibold text-primary">Telegram</span>.
        </div>

        {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}

        <Button className="mt-5" onClick={handleCreate}>
          <Send className="size-4" />
          {created ? "Alerta creada" : "Crear alerta"}
        </Button>
      </section>

      <section className="grid gap-3">
        {!alerts.length ? (
          <p className="text-sm text-muted-foreground">No hay alertas creadas todavia.</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-primary">{alert.symbol}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                  {alert.severity}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{alert.message}</p>
            </div>
          ))
        )}
      </section>

      <DisclaimerBanner />
    </div>
  )
}
