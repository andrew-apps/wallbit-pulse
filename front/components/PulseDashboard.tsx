"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Send, TrendingUp } from "lucide-react"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { AllocationDonut } from "@/components/dashboard/allocation-donut"
import { MomentumList, RecentAlertsPanel } from "@/components/dashboard/momentum-alerts"
import { PulseSummaryCard } from "@/components/PulseSummaryCard"
import { MainAlertCard } from "@/components/MainAlertCard"
import { OpportunityCard } from "@/components/OpportunityCard"
import { RiskLevelCard } from "@/components/RiskLevelCard"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { ConnectRequired } from "@/components/ConnectRequired"
import { Button } from "@/components/ui/button"
import { getDashboard } from "@/lib/api"
import type { DashboardResponse } from "@/lib/types"

export function PulseDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar dashboard"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Sincronizando con Wallbit...
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <ConnectRequired message={error} />
      </div>
    )
  }

  if (data?.requires_connection) {
    return (
      <div className="mx-auto max-w-7xl">
        <ConnectRequired />
      </div>
    )
  }

  const dashboard = data!
  const holdings = dashboard.holdings ?? []
  const performance = dashboard.performance ?? []
  const alerts = dashboard.alerts ?? []

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard · Wallbit en vivo</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Portafolio {dashboard.masked_key ?? "conectado"}
          </h2>
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
              Enviar resumen
            </Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PulseSummaryCard value={dashboard.portfolio_value} weeklyChange={dashboard.weekly_change ?? 0} />
        <MainAlertCard title={dashboard.main_alert} detail={dashboard.risk_detail ?? ""} />
        <OpportunityCard symbol={dashboard.best_opportunity} score={dashboard.best_opportunity_score ?? 0} />
        <RiskLevelCard level={dashboard.risk_level} detail={dashboard.risk_detail ?? ""} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PerformanceChart data={performance} />
        </div>
        <AllocationDonut holdings={holdings} total={dashboard.portfolio_value} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <MomentumList holdings={holdings} />
        <RecentAlertsPanel alerts={alerts} />
      </section>

      <DisclaimerBanner />
    </div>
  )
}
