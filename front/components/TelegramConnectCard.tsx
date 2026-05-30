import Link from "next/link"
import { ArrowRight, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TelegramConnectCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
        <Send className="size-5" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold">Conecta Telegram</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Abre el bot, envia /start y pega el codigo de vinculacion para recibir alertas visuales.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-secondary/30 p-4">
        <p className="text-xs text-muted-foreground">Codigo de vinculacion</p>
        <p className="mt-2 font-mono text-2xl font-semibold text-primary">WB-PULSE-7F3K</p>
      </div>

      <div className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm">
        <p className="font-semibold text-destructive">Preview de alerta</p>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          NVDA cayo 5.1%. Tu exposicion es alta. Quieres simular rebalanceo?
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button className="flex-1">
          <Send className="size-4" />
          Conectar Telegram
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/dashboard">
            Ver Pulse
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
