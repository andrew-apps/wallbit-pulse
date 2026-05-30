"use client"

import { useState } from "react"
import { ArrowRight, Check, ShieldAlert, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RiskBadge, RecommendationBadge } from "@/components/risk-badge"
import { formatCurrency, type Holding } from "@/lib/data"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  holding: Holding | null
  side?: "Comprar" | "Vender"
  defaultAmount?: number
}

export function TradeModal({ open, onOpenChange, holding, side = "Comprar", defaultAmount = 500 }: Props) {
  const [amount, setAmount] = useState(defaultAmount)
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle")

  if (!holding) return null

  const qty = holding.price > 0 ? amount / holding.price : 0
  const fee = amount * 0.001

  function confirm() {
    setStatus("loading")
    setTimeout(() => setStatus("done"), 1200)
  }

  function close(o: boolean) {
    if (!o) setTimeout(() => setStatus("idle"), 200)
    onOpenChange(o)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        {status === "done" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/30">
              <Check className="size-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Trade confirmado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Orden de {side.toLowerCase()} {formatCurrency(amount)} en {holding.symbol} enviada a Wallbit.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
              <Send className="size-3.5 text-primary" />
              Confirmación enviada a tu Telegram
            </div>
            <Button className="mt-5 w-full" onClick={() => close(false)}>
              Listo
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span
                  className="grid size-8 place-items-center rounded-lg text-xs font-bold"
                  style={{ backgroundColor: `${holding.color}26`, color: holding.color }}
                >
                  {holding.symbol.slice(0, 3)}
                </span>
                {side} {holding.symbol}
              </DialogTitle>
              <DialogDescription>{holding.name} · Confirmación de trade</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trade-amount">Monto a invertir (USD)</Label>
                <Input
                  id="trade-amount"
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="font-mono"
                />
              </div>

              <dl className="space-y-2.5 rounded-lg border border-border bg-secondary/30 p-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Precio actual</dt>
                  <dd className="tabular-nums">{formatCurrency(holding.price, holding.symbol === "BTC" ? 0 : 2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Cantidad estimada</dt>
                  <dd className="tabular-nums">
                    {qty.toFixed(holding.symbol === "BTC" ? 5 : 3)} {holding.symbol}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Comisión (0.1%)</dt>
                  <dd className="tabular-nums">{formatCurrency(fee, 2)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2.5 font-medium">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatCurrency(amount + fee, 2)}</dd>
                </div>
              </dl>

              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
                <span className="text-xs text-muted-foreground">Recomendación AI</span>
                <div className="flex items-center gap-2">
                  <RiskBadge level={holding.risk} />
                  <RecommendationBadge value={holding.recommendation} />
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-chart-4/30 bg-chart-4/10 p-3 text-xs text-chart-4">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                Esto no es asesoría financiera. Revisa los escenarios antes de operar.
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => close(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={confirm} disabled={status === "loading" || amount <= 0} className="flex-1">
                {status === "loading" ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    Enviando…
                  </>
                ) : (
                  <>
                    Confirmar
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
