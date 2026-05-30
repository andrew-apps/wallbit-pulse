"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ApiError, connectWallbit } from "@/lib/api"

export function ConnectWallbitCard() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState("")
  const [readOnly, setReadOnly] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  async function validateConnection() {
    setError("")
    setSuccessMessage("")

    if (!apiKey.trim()) {
      setError("Ingresa tu API Key de Wallbit para ver datos reales.")
      return
    }

    setLoading(true)
    try {
      const result = await connectWallbit(apiKey.trim(), readOnly ? "read_only" : "trade")
      setConnected(true)
      setSuccessMessage(result.message)
      setTimeout(() => router.push("/dashboard"), 900)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("No pudimos validar la conexion. Verifica que el backend este corriendo en :8000.")
      }
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
        Usaremos tu API Key con permiso <strong>read</strong> para leer balances y portafolio desde api.wallbit.io.
        Sin datos ficticios.
      </p>

      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="wallbit-key">API Key de Wallbit</Label>
          <Input
            id="wallbit-key"
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="wlb_..."
            autoComplete="off"
            className="font-mono"
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          {successMessage ? (
            <p className="text-xs text-accent">{successMessage}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Crea la key en Wallbit → Settings → API Keys con permiso de lectura.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
          <div>
            <Label htmlFor="read-only">Modo solo lectura</Label>
            <p className="mt-1 text-xs text-muted-foreground">Recomendado: solo lectura, sin operaciones.</p>
          </div>
          <Switch id="read-only" checked={readOnly} onCheckedChange={setReadOnly} />
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-accent/25 bg-accent/10 p-3 text-xs text-accent">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          La key se cifra en el backend y nunca se muestra completa despues de guardarla.
        </div>

        <Button onClick={validateConnection} disabled={loading} className="w-full" size="lg">
          {loading ? "Validando con Wallbit..." : connected ? "Conexion validada" : "Validar conexion"}
          {connected ? <CheckCircle2 className="size-4" /> : null}
        </Button>
      </div>
    </div>
  )
}
