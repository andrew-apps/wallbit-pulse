"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { connectWallbit } from "@/lib/api"

export function ConnectWallbitCard() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState("")
  const [readOnly, setReadOnly] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)

  async function validateConnection() {
    setError("")

    if (!apiKey.trim()) {
      setError("Ingresa una API Key o usa el modo demo.")
      return
    }

    setLoading(true)
    try {
      await connectWallbit(apiKey, readOnly ? "read_only" : "trade")
      setConnected(true)
      setTimeout(() => router.push("/telegram"), 700)
    } catch {
      setError("No pudimos validar la conexion. Revisa permisos, rate limit o conectividad.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl md:p-8">
      <div className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
        <KeyRound className="size-5" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold">Conecta tu cuenta</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Usaremos tu API Key para leer balances, portafolio y activos. Puedes empezar en modo solo lectura.
      </p>

      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="wallbit-key">API Key de Wallbit</Label>
          <Input
            id="wallbit-key"
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="wb_live_..."
            autoComplete="off"
            className="font-mono"
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
          <div>
            <Label htmlFor="read-only">Modo solo lectura</Label>
            <p className="mt-1 text-xs text-muted-foreground">Recomendado para el MVP y la demo.</p>
          </div>
          <Switch id="read-only" checked={readOnly} onCheckedChange={setReadOnly} />
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-accent/25 bg-accent/10 p-3 text-xs text-accent">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          No ejecutaremos operaciones sin confirmacion explicita. Nunca mostraremos tu API Key despues de guardarla.
        </div>

        <Button onClick={validateConnection} disabled={loading} className="w-full" size="lg">
          {loading ? "Validando..." : connected ? "Conexion validada" : "Validar conexion"}
          {connected ? <CheckCircle2 className="size-4" /> : null}
        </Button>

        <Button variant="ghost" className="w-full" onClick={() => router.push("/telegram")}>
          Probar demo sin API Key
        </Button>
      </div>
    </div>
  )
}
