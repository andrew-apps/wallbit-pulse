import { Card, CardContent } from "@/components/ui/card"
import type { ForecastScenario } from "@/lib/data"
import { formatSignedCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const toneByLabel: Record<ForecastScenario["label"], string> = {
  Pesimista: "text-destructive bg-destructive/15 ring-destructive/25",
  Base: "text-primary bg-primary/15 ring-primary/30",
  Optimista: "text-accent bg-accent/15 ring-accent/25",
}

export function ScenarioCards({
  scenarios,
  amount,
  selected = "Base",
}: {
  scenarios: ForecastScenario[]
  amount: number
  selected?: ForecastScenario["label"]
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {scenarios.map((scenario) => {
        const total = amount + scenario.pnl
        const pct = amount > 0 ? (scenario.pnl / amount) * 100 : 0
        const isSelected = scenario.label === selected

        return (
          <Card
            key={scenario.label}
            className={cn(
              "border-border bg-card/90 transition-colors",
              isSelected && "border-primary/50 ring-1 ring-primary/30",
            )}
          >
            <CardContent className="space-y-3 p-5">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                  toneByLabel[scenario.label],
                )}
              >
                {scenario.label}
              </span>
              <p className="text-3xl font-semibold tabular-nums">${total.toLocaleString("en-US")}</p>
              <p
                className={cn(
                  "text-sm font-medium tabular-nums",
                  scenario.pnl < 0 ? "text-destructive" : scenario.pnl > 0 ? "text-accent" : "text-foreground",
                )}
              >
                {formatSignedCurrency(scenario.pnl)} / {pct >= 0 ? "+" : ""}
                {pct.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
