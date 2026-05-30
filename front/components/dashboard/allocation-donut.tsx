"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/data"
import type { HoldingItem } from "@/lib/types"

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-5)", "var(--chart-4)", "var(--chart-3)"]

export function AllocationDonut({ holdings, total }: { holdings: HoldingItem[]; total: number }) {
  if (!holdings.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Portfolio Allocation</h3>
        <p className="mt-8 text-center text-sm text-muted-foreground">Sin posiciones en tu cuenta Wallbit.</p>
      </div>
    )
  }

  const data = holdings.map((h, i) => ({
    name: h.symbol,
    value: h.value,
    color: h.color || COLORS[i % COLORS.length],
  }))

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Portfolio Allocation</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Distribucion real por activo</p>

      <div className="mt-2 flex flex-col items-center gap-5">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2} stroke="none">
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-lg font-semibold tabular-nums">{formatCurrency(total)}</span>
          </div>
        </div>

        <ul className="grid w-full grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6">
          {holdings.map((h) => (
            <li key={h.symbol} className="flex items-center gap-2.5 text-sm">
              <span className="size-2.5 shrink-0 rounded-sm bg-primary" />
              <span className="font-medium">{h.symbol}</span>
              <span className="ml-auto tabular-nums text-muted-foreground">
                {total > 0 ? ((h.value / total) * 100).toFixed(1) : 0}%
              </span>
              <span className="w-16 text-right tabular-nums">{formatCurrency(h.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
