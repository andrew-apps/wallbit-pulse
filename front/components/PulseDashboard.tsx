"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Send, TrendingUp } from "lucide-react"
import { PulseSummaryCard } from "@/components/PulseSummaryCard"
import { MainAlertCard } from "@/components/MainAlertCard"
import { OpportunityCard } from "@/components/OpportunityCard"
import { RiskLevelCard } from "@/components/RiskLevelCard"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { Button } from "@/components/ui/button"
import { getDashboard } from "@/lib/api"
import { pulse } from "@/lib/data"
import type { DashboardResponse } from "@/lib/types"

export function PulseDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const dashboard = data ?? {
    portfolio_value: pulse.portfolioValue,
    checking_balance: 1250,
    main_alert: pulse.mainAlert,
    best_opportunity: pulse.bestOpportunity,
    risk_level: pulse.riskLevel,
    risk_detail: pulse.riskDetail,
    demo: true,
    connected: false,
  }

  const headline = dashboard.demo
    ? "Tu portafolio demo esta estable, pero NVDA requiere atencion."
    : `Portafolio conectado${dashboard.masked_key ? ` (${dashboard.masked_key})` : ""}.`

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">
            {loading ? "Cargando pulso..." : dashboard.demo ? "Pulso demo" : "Pulso en vivo · Wallbit"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {loading ? "Sincronizando con Wallbit..." : headline}
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

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Leyendo balances...
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <PulseSummaryCard value={dashboard.portfolio_value} weeklyChange={pulse.weeklyChange} />
          <MainAlertCard title={dashboard.main_alert} detail={pulse.mainAlertDetail} />
          <OpportunityCard symbol={dashboard.best_opportunity} score={pulse.bestOpportunityScore} />
          <RiskLevelCard level={dashboard.risk_level} detail={dashboard.risk_detail ?? pulse.riskDetail} />
        </section>
      )}

      <DisclaimerBanner />
    </div>
  )
}
