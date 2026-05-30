"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { holdings, PORTFOLIO_VALUE, formatCurrency } from "@/lib/data"

export function AllocationDonut() {
  const data = holdings.map((h) => ({ name: h.symbol, value: h.value, color: h.color }))

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Portfolio Allocation</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Distribución por activo</p>

      <div className="mt-2 flex flex-col items-center gap-5">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={84}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(PORTFOLIO_VALUE)}
            </span>
          </div>
        </div>

        <ul className="grid w-full grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6">
          {holdings.map((h) => (
            <li key={h.symbol} className="flex items-center gap-2.5 text-sm">
              <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: h.color }} />
              <span className="font-medium">{h.symbol}</span>
              <span className="ml-auto tabular-nums text-muted-foreground">
                {((h.value / PORTFOLIO_VALUE) * 100).toFixed(1)}%
              </span>
              <span className="w-16 text-right tabular-nums">{formatCurrency(h.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
