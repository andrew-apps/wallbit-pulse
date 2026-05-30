import { InvestmentRadarTable } from "@/components/InvestmentRadarTable"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"

export default function RadarPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DisclaimerBanner />
      <InvestmentRadarTable />
    </div>
  )
}
