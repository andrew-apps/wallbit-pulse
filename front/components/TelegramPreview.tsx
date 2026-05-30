"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bot, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RiskSnapshotCard } from "@/components/RiskSnapshotCard"
import { getDashboard } from "@/lib/api"
import type { DashboardResponse } from "@/lib/types"

export function TelegramPreview() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .finally(() => setLoading(false))
  }, [])

  const message =
    dashboard && !dashboard.requires_connection
      ? `Wallbit Pulse AI Alert

${dashboard.main_alert}
Riesgo: ${dashboard.risk_level}
Portafolio: $${dashboard.portfolio_value.toLocaleString("en-US")}

Te envie el reporte visual abajo.

Comandos:
/resumen
/riesgo
/forecast ${dashboard.best_opportunity !== "—" ? dashboard.best_opportunity : "SPY"} 500 30
/ranking`
      : `Wallbit Pulse AI

Conecta tu API Key para recibir alertas con datos reales de tu portafolio.

Comandos disponibles:
/start
/resumen
/riesgo
/forecast SPY 500 30
/ranking`

  return (
    <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
            <Bot className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Wallbit Pulse AI</p>
            <p className="text-xs text-accent">{dashboard?.connected ? "bot conectado" : "esperando Wallbit"}</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando preview...
          </div>
        ) : (
          <>
            <div className="mt-4 rounded-2xl rounded-bl-sm bg-secondary p-4 text-sm leading-relaxed">
              <p className="whitespace-pre-line">{message}</p>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-background p-2">
              <RiskSnapshotCard compact dashboard={dashboard} />
            </div>

            <Button asChild className="mt-4 w-full">
              <Link href="/telegram">
                <Send className="size-4" />
                Configurar bot
              </Link>
            </Button>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Comandos del bot</h2>
        <div className="mt-4 grid gap-2">
          {[
            "/start",
            "/resumen",
            "/riesgo",
            "/forecast BTC 500 30",
            "/ranking",
            "/alertas",
            "/simular SPY 500",
            "/rebalancear",
          ].map((command) => (
            <div
              key={command}
              className="rounded-lg border border-border bg-secondary/30 px-3 py-2 font-mono text-sm text-muted-foreground"
            >
              {command}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
