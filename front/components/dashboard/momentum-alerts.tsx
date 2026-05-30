import Link from "next/link"
import { ArrowUpRight, Bell } from "lucide-react"
import { formatCurrency } from "@/lib/data"
import type { AlertItem, HoldingItem } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const actionStyles = {
  Comprar: "bg-accent/15 text-accent ring-accent/30",
  Mantener: "bg-primary/15 text-primary ring-primary/30",
  Reducir: "bg-chart-4/15 text-chart-4 ring-chart-4/30",
  Vender: "bg-destructive/15 text-destructive ring-destructive/30",
}

export function MomentumList({ holdings }: { holdings: HoldingItem[] }) {
  const items = holdings.filter((h) => h.symbol !== "CASH").slice(0, 4)

  if (!items.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Movimientos destacados</h3>
        <p className="mt-4 text-sm text-muted-foreground">Sin posiciones en cartera.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Movimientos destacados</h3>
        <Button asChild variant="ghost" size="sm" className="text-primary">
          <Link href="/radar">Ver radar<ArrowUpRight className="size-4" /></Link>
        </Button>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const change = item.change_7d ?? 0
          const rec = change >= 0 ? "Comprar" : "Reducir"
          return (
            <li key={item.symbol} className="flex flex-col gap-3 rounded-lg border border-border/70 bg-secondary/20 p-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.symbol}</p>
                <p className="truncate text-xs text-muted-foreground">{item.name ?? item.symbol}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">{item.price ? formatCurrency(item.price, 2) : "—"}</p>
                  <p className={cn("text-xs font-medium tabular-nums", change >= 0 ? "text-accent" : "text-destructive")}>
                    {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                  </p>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium ring-1", actionStyles[rec as keyof typeof actionStyles])}>
                  {rec}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function RecentAlertsPanel({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Alertas recientes</h3>
        <Bell className="size-4 text-muted-foreground" />
      </div>

      {!alerts.length ? (
        <p className="mt-4 text-sm text-muted-foreground">No hay alertas. Crea una desde la seccion Alertas.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {alerts.map((alert) => (
            <li key={alert.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
              <p className="text-sm font-semibold"><span className="text-primary">{alert.symbol}</span> · {alert.message}</p>
            </li>
          ))}
        </ul>
      )}

      <Button asChild variant="outline" className="mt-4 w-full">
        <Link href="/alerts">Ver todas las alertas</Link>
      </Button>
    </div>
  )
}
