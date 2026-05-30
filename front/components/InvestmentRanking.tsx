import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ranking, type RadarLabel } from "@/lib/data"
import { cn } from "@/lib/utils"

const labelStyles: Record<RadarLabel, string> = {
  Opportunity: "bg-accent/15 text-accent ring-accent/30",
  Watch: "bg-primary/15 text-primary ring-primary/30",
  Neutral: "bg-secondary text-muted-foreground ring-border",
  Risky: "bg-chart-4/15 text-chart-4 ring-chart-4/30",
  Reduce: "bg-destructive/15 text-destructive ring-destructive/30",
}

export function InvestmentRanking() {
  return (
    <div className="grid gap-3">
      {ranking.slice(0, 5).map((asset, index) => (
        <Card key={asset.symbol} className="border-border bg-card/90">
          <CardContent className="flex items-center gap-4 py-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-sm font-semibold text-muted-foreground">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{asset.symbol}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                    labelStyles[asset.label],
                  )}
                >
                  {asset.label}
                </span>
                <span className="font-mono text-xs text-muted-foreground">Score {asset.score}</span>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">{asset.reason}</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={`/forecast?symbol=${asset.symbol}`}>
                Simular
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
