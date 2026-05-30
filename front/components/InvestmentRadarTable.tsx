"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Loader2, Search, TrendingDown, TrendingUp } from "lucide-react"
import { ConnectRequired } from "@/components/ConnectRequired"
import { assetClasses, symbolColor } from "@/lib/data"
import { getRadar } from "@/lib/api"
import type { RadarAsset } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

const riskStyles: Record<string, string> = {
  Alto: "text-destructive",
  Medio: "text-chart-4",
  Moderado: "text-chart-4",
  Bajo: "text-accent",
}

const recStyles: Record<string, string> = {
  Comprar: "text-accent",
  Mantener: "text-primary",
  Reducir: "text-chart-4",
  Vender: "text-destructive",
}

export function InvestmentRadarTable() {
  const [assets, setAssets] = useState<RadarAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [requiresConnection, setRequiresConnection] = useState(false)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<(typeof assetClasses)[number]>("Todos")

  useEffect(() => {
    getRadar()
      .then((res) => {
        setRequiresConnection(res.requires_connection)
        setAssets(res.assets)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return assets.filter((asset) => {
      const matchesQuery =
        !query ||
        asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
        asset.name.toLowerCase().includes(query.toLowerCase())
      const matchesClass = filter === "Todos" || asset.asset_class === filter
      return matchesQuery && matchesClass
    })
  }, [assets, query, filter])

  const counts = useMemo(() => {
    const accion = assets.filter((a) => a.asset_class === "Accion").length
    const etf = assets.filter((a) => a.asset_class === "ETF").length
    const cripto = assets.filter((a) => a.asset_class === "Cripto").length
    return { accion, etf, cripto, total: assets.length }
  }, [assets])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Cargando activos desde Wallbit...
      </div>
    )
  }

  if (requiresConnection) {
    return <ConnectRequired message="El radar necesita tu API Key para listar activos y calcular scores con tu cartera." />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {counts.total} activos desde Wallbit — acciones de EE.UU., ETFs y cripto con score, volatilidad y
          exposicion en tiempo real.
        </p>
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar activo..." className="pl-9" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["Todos", counts.total],
            ["Accion", counts.accion],
            ["ETF", counts.etf],
            ["Cripto", counts.cripto],
          ] as const
        ).map(([label, count]) => (
          <button
            key={label}
            type="button"
            onClick={() => setFilter(label as (typeof assetClasses)[number])}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === label
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {label} {count}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No hay activos que coincidan con el filtro.</p>
      ) : null}

      <div className="grid gap-3 lg:hidden">
        {filtered.map((asset) => {
          const color = symbolColor(asset.symbol)
          return (
            <div key={asset.symbol} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-10 place-items-center rounded-lg text-xs font-bold"
                    style={{ backgroundColor: color, color: "var(--primary-foreground)" }}
                  >
                    {asset.symbol.slice(0, 2)}
                  </span>
                  <div>
                    <p className="font-semibold">{asset.symbol}</p>
                    <p className="text-xs text-muted-foreground">{asset.name}</p>
                  </div>
                </div>
                <p className={cn("text-sm font-medium", recStyles[asset.recommendation])}>{asset.recommendation}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Precio</p>
                  <p className="font-semibold tabular-nums">${asset.price.toLocaleString("en-US")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">7d</p>
                  <p className={cn("font-semibold tabular-nums", asset.change_7d >= 0 ? "text-accent" : "text-destructive")}>
                    {asset.change_7d >= 0 ? "+" : ""}
                    {asset.change_7d}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="font-semibold">{asset.score}/100</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Riesgo</p>
                  <p className={cn("font-semibold", riskStyles[asset.risk])}>{asset.risk}</p>
                </div>
              </div>
              <Button asChild size="sm" className="mt-4 w-full">
                <Link href={`/forecast?symbol=${asset.symbol}`}>Operar</Link>
              </Button>
            </div>
          )
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card lg:block">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">7d</th>
              <th className="px-4 py-3 font-medium">Volatility</th>
              <th className="px-4 py-3 font-medium">Exposure</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Riesgo</th>
              <th className="px-4 py-3 font-medium">Recomendacion</th>
              <th className="px-4 py-3 font-medium">Accion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset) => (
              <tr key={asset.symbol} className="border-b border-border/60 last:border-0 hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-8 place-items-center rounded-md text-[10px] font-bold"
                      style={{ backgroundColor: symbolColor(asset.symbol) }}
                    >
                      {asset.symbol.slice(0, 2)}
                    </span>
                    <div>
                      <p className="font-semibold">{asset.symbol}</p>
                      <p className="text-xs text-muted-foreground">{asset.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums">${asset.price.toLocaleString("en-US")}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 tabular-nums font-medium",
                      asset.change_7d >= 0 ? "text-accent" : "text-destructive",
                    )}
                  >
                    {asset.change_7d >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                    {asset.change_7d >= 0 ? "+" : ""}
                    {asset.change_7d}%
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums">{asset.volatility}%</td>
                <td className="px-4 py-3 tabular-nums">{asset.exposure ? `${asset.exposure}%` : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex min-w-[120px] items-center gap-2">
                    <Progress value={asset.score} className="h-1.5 flex-1" />
                    <span className="w-8 tabular-nums text-xs font-semibold">{asset.score}</span>
                  </div>
                </td>
                <td className={cn("px-4 py-3 font-medium", riskStyles[asset.risk])}>{asset.risk}</td>
                <td className={cn("px-4 py-3 font-medium", recStyles[asset.recommendation])}>{asset.recommendation}</td>
                <td className="px-4 py-3">
                  <Button asChild size="sm">
                    <Link href={`/forecast?symbol=${asset.symbol}`}>Operar</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
