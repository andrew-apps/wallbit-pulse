"use client"

import { useState } from "react"
import { ShieldAlert } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ForecastScenario, RiskLevel } from "@/lib/data"
import { formatSignedCurrency } from "@/lib/format"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  symbol: string
  side: "BUY" | "SELL"
  amount: number
  risk: RiskLevel
  scenarios: ForecastScenario[]
  readOnly?: boolean
}

export function TradeConfirmationModal({
  open,
  onOpenChange,
  symbol,
  side,
  amount,
  risk,
  scenarios,
  readOnly = true,
}: Props) {
  const [confirmation, setConfirmation] = useState("")
  const canExecute = confirmation === "CONFIRMAR" && !readOnly && amount <= 2500

  function close(openValue: boolean) {
    if (!openValue) setConfirmation("")
    onOpenChange(openValue)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirmacion manual requerida</DialogTitle>
          <DialogDescription>
            Esta orden queda preparada, pero no se ejecuta sin confirmacion humana explicita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-lg border border-border bg-secondary/30 p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Activo</p>
              <p className="mt-1 font-semibold">{symbol}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Accion</p>
              <p className="mt-1 font-semibold">{side}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Monto</p>
              <p className="mt-1 font-semibold">${amount.toLocaleString("en-US")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Riesgo</p>
              <p className={risk === "Alto" ? "mt-1 font-semibold text-destructive" : "mt-1 font-semibold text-accent"}>
                {risk}
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {scenarios.map((scenario) => (
              <div key={scenario.label} className="rounded-lg border border-border bg-background/50 p-3">
                <p className="text-xs text-muted-foreground">{scenario.label}</p>
                <p
                  className={
                    scenario.pnl < 0
                      ? "mt-1 font-semibold text-destructive"
                      : "mt-1 font-semibold text-accent"
                  }
                >
                  {formatSignedCurrency(scenario.pnl)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-chart-4/30 bg-chart-4/10 p-3 text-xs text-chart-4">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              Esto no es asesoria financiera. El modo demo esta en solo lectura y el limite seguro
              evita ejecutar montos altos.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-trade">Escribe CONFIRMAR para habilitar ejecucion</Label>
            <Input
              id="confirm-trade"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="CONFIRMAR"
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => close(false)} className="flex-1">
            Cancelar
          </Button>
          <Button disabled={!canExecute} className="flex-1">
            Ejecutar orden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
