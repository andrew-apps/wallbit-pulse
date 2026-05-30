import { AlertTriangle, Radar } from "lucide-react"
import { riskSnapshot } from "@/lib/data"
import { formatSignedCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

export function RiskSnapshotCard({ compact = false }: { compact?: boolean }) {
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
          <p className="text-sm font-semibold">{riskSnapshot.product}</p>
        </div>
        <span className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-medium text-destructive ring-1 ring-destructive/30">
          Riesgo {riskSnapshot.severity.toLowerCase()}
        </span>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_240px]">
        <div>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            <p className="text-sm font-medium">{riskSnapshot.title}</p>
          </div>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight">
            {riskSnapshot.symbol} <span className="text-destructive">{riskSnapshot.movement}</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">Tu exposicion</p>
          <p className="mt-1 text-2xl font-semibold">{riskSnapshot.exposure}</p>
        </div>

        <div className="rounded-xl border border-border bg-background/50 p-4">
          <p className="text-xs font-medium text-muted-foreground">Forecast 30 dias</p>
          <div className="mt-3 space-y-3">
            {riskSnapshot.forecast.map((scenario) => (
              <div key={scenario.label} className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">{scenario.label}</span>
                <span
                  className={cn(
                    "font-mono text-sm font-semibold",
                    scenario.pnl < 0 ? "text-destructive" : "text-accent",
                  )}
                >
                  {formatSignedCurrency(scenario.pnl)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-primary/25 bg-primary/10 p-4">
        <p className="text-xs text-muted-foreground">Accion sugerida</p>
        <p className="mt-1 text-lg font-semibold text-primary">{riskSnapshot.suggestedAction}</p>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Esto no es asesoria financiera. Las proyecciones son simulaciones.
      </p>
    </div>
  )
}
