"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatCurrency } from "@/lib/data"
import type { PerformancePoint } from "@/lib/types"

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums text-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export function PerformanceChart({ data }: { data: PerformancePoint[] }) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Performance del Portfolio</h3>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          El historial se construye con snapshots reales cada vez que abres el dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Performance del Portfolio</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Snapshots reales de tu cuenta Wallbit</p>
        </div>
      </div>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--primary)", strokeOpacity: 0.3 }} />
            <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} fill="url(#perfFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
