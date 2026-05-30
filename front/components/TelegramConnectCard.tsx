"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, ExternalLink, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createTelegramLinkCode, getTelegramStatus } from "@/lib/api"
import type { TelegramStatusResponse } from "@/lib/types"

export function TelegramConnectCard() {
  const [status, setStatus] = useState<TelegramStatusResponse | null>(null)
  const [code, setCode] = useState("WB-PULSE-7F3K")
  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState(false)

  const refreshStatus = useCallback(async () => {
    const next = await getTelegramStatus()
    setStatus(next)
    setLoading(false)
    return next
  }, [])

  useEffect(() => {
    void refreshStatus()
  }, [refreshStatus])

  useEffect(() => {
    if (status?.linked) return
    const interval = window.setInterval(() => {
      void refreshStatus()
    }, 4000)
    return () => window.clearInterval(interval)
  }, [refreshStatus, status?.linked])

  async function handleGenerateCode() {
    setLinking(true)
    try {
      const response = await createTelegramLinkCode()
      setCode(response.code)
      await refreshStatus()
    } finally {
      setLinking(false)
    }
  }

  const botUrl = status?.bot_url ?? "https://t.me/wallbit_radar_bot"
  const startCommand = `/start ${code}`

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
        <Send className="size-5" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold">Conecta Telegram</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Abre @{status?.bot_username ?? "wallbit_radar_bot"}, envia el codigo y recibe alertas visuales en tiempo real.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Verificando bot...
        </div>
      ) : status?.linked ? (
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent/10 p-4">
          <div className="flex items-center gap-2 text-accent">
            <CheckCircle2 className="size-4" />
            <p className="font-semibold">Telegram vinculado</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {status.username ? `@${status.username}` : `Chat ${status.chat_id}`} recibira alertas y comandos del bot.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-border bg-secondary/30 p-4">
          <p className="text-xs text-muted-foreground">Codigo de vinculacion</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-primary">{code}</p>
          <p className="mt-3 text-xs text-muted-foreground">En Telegram envia:</p>
          <p className="mt-1 font-mono text-sm">{startCommand}</p>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm">
        <p className="font-semibold text-destructive">Preview de alerta</p>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          NVDA cayo 5.1%. Tu exposicion es alta. Quieres simular rebalanceo?
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        {!status?.linked && (
          <Button className="flex-1" variant="outline" onClick={handleGenerateCode} disabled={linking}>
            {linking ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Nuevo codigo
          </Button>
        )}
        <Button asChild className="flex-1">
          <a href={botUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            Abrir @{status?.bot_username ?? "wallbit_radar_bot"}
          </a>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/dashboard">
            Ver Pulse
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {status?.configured && !status.linked && (
        <p className="mt-4 text-xs text-muted-foreground">
          Esperando vinculacion... esta pagina se actualiza automaticamente.
        </p>
      )}
    </div>
  )
}
