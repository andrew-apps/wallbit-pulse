import { Wallet, PieChart, TrendingUp, Activity } from "lucide-react"
import { CHECKING_BALANCE, PORTFOLIO_VALUE, formatCurrency } from "@/lib/data"
import { cn } from "@/lib/utils"

const cards = [
  {
    label: "Balance Checking",
    value: formatCurrency(CHECKING_BALANCE),
    sub: "Disponible para invertir",
    delta: null as string | null,
    icon: Wallet,
    accent: "primary",
  },
  {
    label: "Portfolio Value",
    value: formatCurrency(PORTFOLIO_VALUE),
    sub: "5 posiciones activas",
    delta: "+4.2%",
    icon: PieChart,
    accent: "accent",
  },
  {
    label: "Patrimonio Total",
    value: formatCurrency(CHECKING_BALANCE + PORTFOLIO_VALUE),
    sub: "Checking + Portfolio",
    delta: "+3.1%",
    icon: TrendingUp,
    accent: "primary",
  },
  {
    label: "Riesgo del Portfolio",
    value: "Moderado",
    sub: "Volatilidad media 24%",
    delta: null,
    icon: Activity,
    accent: "chart-4",
  },
]

export function BalanceCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="animate-float-up rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
        >
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "grid size-9 place-items-center rounded-lg ring-1",
                c.accent === "accent" && "bg-accent/15 text-accent ring-accent/25",
                c.accent === "primary" && "bg-primary/15 text-primary ring-primary/25",
                c.accent === "chart-4" && "bg-chart-4/15 text-chart-4 ring-chart-4/25",
              )}
            >
              <c.icon className="size-[18px]" />
            </div>
            {c.delta && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                {c.delta}
              </span>
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{c.label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{c.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
