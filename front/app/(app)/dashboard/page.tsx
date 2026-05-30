import Link from "next/link"
import { Send, TrendingUp } from "lucide-react"
import { PulseSummaryCard } from "@/components/PulseSummaryCard"
import { MainAlertCard } from "@/components/MainAlertCard"
import { OpportunityCard } from "@/components/OpportunityCard"
import { RiskLevelCard } from "@/components/RiskLevelCard"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { Button } from "@/components/ui/button"
import { pulse } from "@/lib/data"

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Pulso de hoy</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Tu portafolio esta estable, pero NVDA requiere atencion.
          </h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/forecast">
              <TrendingUp className="size-4" />
              Simular inversion
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/telegram">
              <Send className="size-4" />
              Enviar resumen a Telegram
            </Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PulseSummaryCard value={pulse.portfolioValue} weeklyChange={pulse.weeklyChange} />
        <MainAlertCard title={pulse.mainAlert} detail={pulse.mainAlertDetail} />
        <OpportunityCard symbol={pulse.bestOpportunity} score={pulse.bestOpportunityScore} />
        <RiskLevelCard level={pulse.riskLevel} detail={pulse.riskDetail} />
      </section>

      <DisclaimerBanner />
    </div>
  )
}
