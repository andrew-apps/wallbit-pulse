import { Card, CardContent } from "@/components/ui/card"
import type { ForecastScenario } from "@/lib/data"
import { formatSignedCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const toneByLabel: Record<ForecastScenario["label"], string> = {
  Pesimista: "text-destructive bg-destructive/15 ring-destructive/25",
  Base: "text-primary bg-primary/15 ring-primary/25",
  Optimista: "text-accent bg-accent/15 ring-accent/25",
}

export function ScenarioCards({ scenarios }: { scenarios: ForecastScenario[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {scenarios.map((scenario) => (
        <Card key={scenario.label} className="border-border bg-card/90">
          <CardContent className="space-y-3">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                toneByLabel[scenario.label],
              )}
            >
              {scenario.label}
            </span>
            <p
              className={cn(
                "text-3xl font-semibold tabular-nums",
                scenario.pnl < 0 ? "text-destructive" : scenario.pnl > 0 ? "text-accent" : "text-foreground",
              )}
            >
              {formatSignedCurrency(scenario.pnl)}
            </p>
            <p className="text-xs text-muted-foreground">Precio estimado: ${scenario.price.toLocaleString("en-US")}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
