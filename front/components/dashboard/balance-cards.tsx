"use client"

import { useEffect, useState } from "react"
import { Wallet, PieChart, TrendingUp, Activity, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/data"
import { getDashboard } from "@/lib/api"
import type { DashboardResponse } from "@/lib/types"
import { cn } from "@/lib/utils"

export function BalanceCards() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Cargando balances...
      </div>
    )
  }

  if (dashboard?.requires_connection) {
    return <p className="text-sm text-muted-foreground">Conecta Wallbit para ver balances reales.</p>
  }

  const checking = dashboard?.checking_balance ?? 0
  const portfolio = dashboard?.portfolio_value ?? 0
  const holdingsCount = dashboard?.holdings_count ?? dashboard?.holdings?.length ?? 0
  const weekly = dashboard?.weekly_change ?? 0

  const cards = [
    {
      label: "Balance Checking",
      value: formatCurrency(checking),
      sub: "Disponible para invertir",
      delta: null as string | null,
      icon: Wallet,
      accent: "primary",
    },
    {
      label: "Portfolio Value",
      value: formatCurrency(portfolio),
      sub: `${holdingsCount} posiciones`,
      delta: weekly ? `${weekly >= 0 ? "+" : ""}${weekly.toFixed(1)}%` : null,
      icon: PieChart,
      accent: "accent",
    },
    {
      label: "Patrimonio Total",
      value: formatCurrency(checking + portfolio),
      sub: "Checking + Portfolio",
      delta: null,
      icon: TrendingUp,
      accent: "primary",
    },
    {
      label: "Riesgo del Portfolio",
      value: dashboard?.risk_level ?? "—",
      sub: dashboard?.risk_detail ?? "",
      delta: null,
      icon: Activity,
      accent: "chart-4",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="animate-float-up rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
        >
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "grid size-9 place-items-center rounded-lg ring-1",
                c.accent === "accent" && "bg-accent/15 text-accent ring-accent/25",
                c.accent === "primary" && "bg-primary/15 text-primary ring-primary/25",
                c.accent === "chart-4" && "bg-chart-4/15 text-chart-4 ring-chart-4/25",
              )}
            >
              <c.icon className="size-[18px]" />
            </div>
            {c.delta && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">{c.delta}</span>
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{c.label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{c.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
