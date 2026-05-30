import { ForecastSimulator } from "@/components/ForecastSimulator"

export default function ForecastPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Forecast Simulator</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Simula cuanto podrias ganar o perder.</h1>
      </div>
      <ForecastSimulator />
    </div>
  )
}
