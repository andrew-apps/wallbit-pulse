"use client"

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { HistoryPoint, ProjectionPoint } from "@/lib/types"

type Props = {
  historical: HistoryPoint[]
  projection: ProjectionPoint[]
  symbol: string
  period: string
  backtestMape?: number | null
}

function mergeChartData(historical: HistoryPoint[], projection: ProjectionPoint[]) {
  const hist = historical.slice(-120).map((p) => ({
    date: p.date.slice(5),
    actual: p.close,
    base: null as number | null,
    bearish: null as number | null,
    bullish: null as number | null,
  }))

  const proj = projection.map((p, i) => ({
    date: i === 0 ? "Hoy" : p.date.slice(5),
    actual: i === 0 && hist.length ? hist[hist.length - 1].actual : null,
    base: p.base,
    bearish: p.bearish,
    bullish: p.bullish,
  }))

  if (hist.length && proj.length) {
    proj[0].actual = hist[hist.length - 1].actual
  }

  return [...hist, ...proj.slice(1)]
}

export function RealVsPredictiveChart({ historical, projection, symbol, period, backtestMape }: Props) {
  if (!historical.length) {
    return (
      <div className="brand-card p-5">
        <h3 className="font-display text-sm font-semibold">Historial real vs proyeccion</h3>
        <p className="mt-4 text-sm text-muted-foreground">Sin datos de Yahoo Finance para {symbol}.</p>
      </div>
    )
  }

  const data = mergeChartData(historical, projection)
  const splitLabel = data.find((d) => d.base !== null)?.date ?? "Hoy"

  return (
    <div className="brand-card glow-cyan p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Yahoo Finance · {period}</p>
          <h3 className="font-display mt-1 text-sm font-semibold">Movimiento real vs predictivo — {symbol}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Linea solida: precio historico real. Lineas punteadas: escenarios Monte Carlo desde hoy.
          </p>
        </div>
        {backtestMape != null ? (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            Backtest MAPE ~{backtestMape}%
          </span>
        ) : null}
      </div>

      <div className="mt-4 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [
                value != null ? `$${Number(value).toFixed(2)}` : "—",
                name,
              ]}
            />
            <ReferenceLine x={splitLabel} stroke="var(--muted-foreground)" strokeDasharray="2 6" label="Forecast" />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="actual"
              name="Real (Yahoo)"
              stroke="var(--accent)"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="base"
              name="Base (IA)"
              stroke="var(--primary)"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="bearish"
              name="Pesimista"
              stroke="var(--destructive)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="bullish"
              name="Optimista"
              stroke="var(--chart-4)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
