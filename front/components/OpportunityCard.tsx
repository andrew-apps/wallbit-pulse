import { Radar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function OpportunityCard({ symbol, score }: { symbol: string; score: number }) {
  return (
    <Card className="border-border bg-card/90">
      <CardContent className="space-y-5">
        <div className="grid size-10 place-items-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/25">
          <Radar className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Best Opportunity</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold">{symbol}</p>
            <p className="pb-1 text-sm font-medium text-accent">Score {score}/100</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Oportunidad defensiva para comparar escenarios.</p>
        </div>
      </CardContent>
    </Card>
  )
}
