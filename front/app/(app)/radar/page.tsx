import { InvestmentRanking } from "@/components/InvestmentRanking"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"

export default function RadarPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Investment Radar</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Cinco activos que merecen atencion.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sin tabla gigante. El radar prioriza score, riesgo y motivo para decidir que simular.
        </p>
      </div>

      <InvestmentRanking />
      <DisclaimerBanner />
    </div>
  )
}
