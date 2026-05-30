import { Activity, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/data"
import { formatPercent } from "@/lib/format"

export function PulseSummaryCard({
  value,
  weeklyChange,
}: {
  value: number
  weeklyChange: number
}) {
  return (
    <Card className="border-border bg-card/90">
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="grid size-10 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
            <Wallet className="size-5" />
          </div>
          <Activity className="size-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Portfolio Value</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{formatCurrency(value)}</p>
          <p className="mt-1 text-sm font-medium text-accent">{formatPercent(weeklyChange)} esta semana</p>
        </div>
      </CardContent>
    </Card>
  )
}
