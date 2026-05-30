import { ShieldAlert } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { RiskBadge } from "@/components/risk-badge"
import type { RiskLevel } from "@/lib/data"

export function RiskLevelCard({ level, detail }: { level: RiskLevel; detail: string }) {
  return (
    <Card className="border-border bg-card/90">
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="grid size-10 place-items-center rounded-lg bg-chart-4/15 text-chart-4 ring-1 ring-chart-4/25">
            <ShieldAlert className="size-5" />
          </div>
          <RiskBadge level={level} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Risk Level</p>
          <p className="mt-2 text-2xl font-semibold">Riesgo {level.toLowerCase()}</p>
          <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}
