"use client"

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { ForecastScenario } from "@/lib/data"

type Props = {
  amount: number
  horizonDays: number
  scenarios: ForecastScenario[]
}

function buildSeries(amount: number, horizonDays: number, scenarios: ForecastScenario[]) {
  const points = ["Hoy", `+${Math.round(horizonDays / 3)}d`, `+${Math.round((horizonDays * 2) / 3)}d`, `+${horizonDays}d`]
  const bear = amount + scenarios[0].pnl
  const base = amount + scenarios[1].pnl
  const bull = amount + scenarios[2].pnl

  return points.map((label, i) => {
    const t = i / (points.length - 1)
    return {
      label,
      optimista: Math.round(amount + (bull - amount) * t),
      base: Math.round(amount + (base - amount) * t),
      pesimista: Math.round(amount + (bear - amount) * t),
    }
  })
}

export function ForecastProjectionChart({ amount, horizonDays, scenarios }: Props) {
  const data = buildSeries(amount, horizonDays, scenarios)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Proyeccion a {horizonDays} dias</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Escenarios pesimista, base y optimista</p>
        </div>
        <span className="rounded-full border border-chart-4/30 bg-chart-4/10 px-3 py-1 text-xs text-chart-4">
          Riesgo del escenario: Moderado
        </span>
      </div>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`$${value}`, ""]}
            />
            <Legend />
            <Line type="monotone" dataKey="optimista" name="Optimista" stroke="var(--accent)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="base" name="Base" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
            <Line
              type="monotone"
              dataKey="pesimista"
              name="Pesimista"
              stroke="var(--destructive)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
