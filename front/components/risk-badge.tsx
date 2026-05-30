import { cn } from "@/lib/utils"
import type { Recommendation, RiskLevel } from "@/lib/data"

const riskStyles: Record<RiskLevel, string> = {
  Bajo: "bg-accent/15 text-accent ring-accent/30",
  Medio: "bg-chart-4/15 text-chart-4 ring-chart-4/30",
  Moderado: "bg-chart-4/15 text-chart-4 ring-chart-4/30",
  Alto: "bg-destructive/15 text-destructive ring-destructive/30",
}

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
        riskStyles[level],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {level}
    </span>
  )
}

const recStyles: Record<Recommendation, string> = {
  Comprar: "bg-accent/15 text-accent ring-accent/30",
  Mantener: "bg-primary/15 text-primary ring-primary/30",
  Reducir: "bg-chart-4/15 text-chart-4 ring-chart-4/30",
  Vender: "bg-destructive/15 text-destructive ring-destructive/30",
}

export function RecommendationBadge({
  value,
  className,
}: {
  value: Recommendation
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
        recStyles[value],
        className,
      )}
    >
      {value}
    </span>
  )
}
