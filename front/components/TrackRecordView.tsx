"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { ConnectRequired } from "@/components/ConnectRequired"
import { formatCurrency, symbolColor, type PredictionStatus } from "@/lib/data"
import { getTrackRecord } from "@/lib/api"
import type { TrackRecordItem } from "@/lib/types"
import { cn } from "@/lib/utils"

const filters: Array<"Todas" | PredictionStatus> = ["Todas", "acertada", "parcial", "fallida", "en curso"]

const statusStyles: Record<PredictionStatus, string> = {
  acertada: "bg-accent/15 text-accent ring-accent/30",
  parcial: "bg-chart-4/15 text-chart-4 ring-chart-4/30",
  fallida: "bg-destructive/15 text-destructive ring-destructive/30",
  "en curso": "bg-primary/15 text-primary ring-primary/30",
}

export function TrackRecordView() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todas")
  const [records, setRecords] = useState<TrackRecordItem[]>([])
  const [stats, setStats] = useState({ accuracy: 0, pnl: 0, roi: 0, deviation: 0 })
  const [requiresConnection, setRequiresConnection] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTrackRecord()
      .then((res) => {
        setRequiresConnection(res.requires_connection)
        setRecords(res.records)
        setStats(res.stats)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => records.filter((p) => filter === "Todas" || p.status === filter),
    [records, filter],
  )

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Cargando historial de predicciones...
      </div>
    )
  }

  if (requiresConnection) {
    return (
      <ConnectRequired message="El track record compara tus forecasts guardados con precios reales de Wallbit. Conecta tu cuenta y ejecuta simulaciones." />
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Cada prediccion se compara con el precio real de Wallbit. Mira cuanto habrias ganado si hubieras seguido al
          agente.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Precision", value: `${stats.accuracy}%` },
          { label: "P&L hipotetico", value: formatCurrency(stats.pnl, 0), accent: true },
          { label: "% ROI medio", value: `${stats.roi >= 0 ? "+" : ""}${stats.roi.toFixed(1)}%`, accent: true },
          { label: "Desviacion media", value: `${stats.deviation.toFixed(1)}%` },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className={cn("mt-2 text-3xl font-semibold tabular-nums", item.accent && "text-accent")}>{item.value}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              filter === item
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {item === "en curso" ? "En Curso" : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
          Aun no hay predicciones. Ejecuta un forecast en el simulador para empezar a medir precision.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((record) => {
            const status = record.status as PredictionStatus
            return (
              <article key={record.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-11 place-items-center rounded-xl text-sm font-bold"
                      style={{ backgroundColor: symbolColor(record.symbol) }}
                    >
                      {record.symbol.slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-lg font-semibold">
                        {record.symbol}{" "}
                        <span className="text-sm font-normal text-muted-foreground">{record.name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.date} · {record.horizon} ·{" "}
                        <span className="text-primary">{record.recommendation}</span>
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1",
                      statusStyles[status] ?? statusStyles.parcial,
                    )}
                  >
                    {record.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Precio de entrada</p>
                    <p className="mt-1 font-semibold tabular-nums">{formatCurrency(record.entry_price, 2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prediccion IA</p>
                    <p className="mt-1 font-semibold tabular-nums text-primary">
                      {formatCurrency(record.predicted_price, 2)}{" "}
                      <span className="text-sm">
                        ({record.predicted_pct >= 0 ? "+" : ""}
                        {record.predicted_pct.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Precio real</p>
                    <p className="mt-1 font-semibold tabular-nums text-accent">
                      {formatCurrency(record.actual_price, 2)}{" "}
                      <span className="text-sm">
                        ({record.actual_pct >= 0 ? "+" : ""}
                        {record.actual_pct.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Desviacion vs. prediccion</p>
                    <p className="mt-1 font-semibold tabular-nums">
                      {record.deviation >= 0 ? "+" : ""}
                      {record.deviation.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {!record.in_progress && (
                  <div className="mt-4 rounded-lg border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent">
                    Si hubieras invertido {formatCurrency(record.invested, 0)} habrias{" "}
                    {record.hypothetical_gain >= 0 ? "ganado" : "perdido"}{" "}
                    {formatCurrency(Math.abs(record.hypothetical_gain), 0)} (
                    {record.actual_pct >= 0 ? "+" : ""}
                    {record.actual_pct.toFixed(1)}%).
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
