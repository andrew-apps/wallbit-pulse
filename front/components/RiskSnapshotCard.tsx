import { AlertTriangle, Radar } from "lucide-react"
import { formatSignedCurrency } from "@/lib/format"
import type { DashboardResponse } from "@/lib/types"
import { cn } from "@/lib/utils"

export function RiskSnapshotCard({
  compact = false,
  dashboard,
}: {
  compact?: boolean
  dashboard?: DashboardResponse | null
}) {
  const topHolding = dashboard?.holdings?.find((h) => h.symbol !== "CASH")
  const symbol = topHolding?.symbol ?? "—"
  const change = topHolding?.change_7d ?? 0
  const exposure = topHolding?.exposure_percent ?? 0
  const riskLevel = dashboard?.risk_level ?? "Medio"

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[780px] rounded-2xl border border-border bg-card p-6 shadow-2xl",
        compact ? "max-w-md p-5" : "md:p-8",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
            <Radar className="size-5" />
          </div>
          <p className="text-sm font-semibold">Wallbit Pulse AI</p>
        </div>
        <span className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-medium text-destructive ring-1 ring-destructive/30">
          Riesgo {riskLevel.toLowerCase()}
        </span>
      </div>

      {dashboard?.requires_connection ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Conecta Wallbit para generar reportes visuales con datos reales de tu cartera.
        </p>
      ) : (
        <>
          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_240px]">
            <div>
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-5" />
                <p className="text-sm font-medium">{dashboard?.main_alert ?? "Sin alertas activas"}</p>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
                {symbol}{" "}
                <span className={change >= 0 ? "text-accent" : "text-destructive"}>
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">Tu exposicion</p>
              <p className="mt-1 text-2xl font-semibold">{exposure.toFixed(1)}% del portafolio</p>
            </div>

            <div className="rounded-xl border border-border bg-background/50 p-4">
              <p className="text-xs font-medium text-muted-foreground">Resumen</p>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Portafolio</span>
                  <span className="font-semibold tabular-nums">
                    ${(dashboard?.portfolio_value ?? 0).toLocaleString("en-US")}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Checking</span>
                  <span className="font-semibold tabular-nums">
                    ${(dashboard?.checking_balance ?? 0).toLocaleString("en-US")}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Mejor oportunidad</span>
                  <span className="font-semibold text-primary">{dashboard?.best_opportunity ?? "—"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-primary/25 bg-primary/10 p-4">
            <p className="text-xs text-muted-foreground">Accion sugerida</p>
            <p className="mt-1 text-lg font-semibold text-primary">
              Simular {dashboard?.best_opportunity !== "—" ? dashboard?.best_opportunity : symbol}
            </p>
          </div>
        </>
      )}

      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Esto no es asesoria financiera. Las proyecciones son simulaciones.
      </p>
    </div>
  )
}
