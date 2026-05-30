import { Suspense } from "react"
import { ForecastSimulator } from "@/components/ForecastSimulator"

export default function ForecastPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <Suspense fallback={<div className="py-12 text-sm text-muted-foreground">Cargando simulador...</div>}>
        <ForecastSimulator />
      </Suspense>
    </div>
  )
}
