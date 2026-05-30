"use client"

import { useState } from "react"
import { BellRing, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { alerts } from "@/lib/data"

const symbols = ["NVDA", "BTC", "SPY", "QQQ", "AAPL", "TSLA"]
const conditions = [
  { value: "drop_percent", label: "caiga mas de" },
  { value: "rise_percent", label: "suba mas de" },
  { value: "score_above", label: "tenga score mayor a" },
  { value: "exposure_above", label: "supere exposicion de" },
]

export default function AlertsPage() {
  const [symbol, setSymbol] = useState("NVDA")
  const [condition, setCondition] = useState("drop_percent")
  const [threshold, setThreshold] = useState(5)
  const [created, setCreated] = useState(false)

  const selectedCondition = conditions.find((item) => item.value === condition)?.label ?? "caiga mas de"

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
          Cuando <span className="font-semibold text-primary">{symbol}</span>{" "}
          {selectedCondition} <span className="font-semibold">{threshold}%</span>, enviar{" "}
          <span className="font-semibold text-primary">Telegram</span>.
        </div>

        <Button className="mt-5" onClick={() => setCreated(true)}>
          <Send className="size-4" />
          {created ? "Alerta creada" : "Crear alerta"}
        </Button>
      </section>

      <section className="grid gap-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-primary">{alert.symbol}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                {alert.time}
              </span>
            </div>
            <p className="mt-2 font-medium">{alert.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{alert.detail}</p>
          </div>
        ))}
      </section>

      <DisclaimerBanner />
    </div>
  )
}
