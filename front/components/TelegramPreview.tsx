import { Bot, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RiskSnapshotCard } from "@/components/RiskSnapshotCard"
import { telegramMessage } from "@/lib/data"

export function TelegramPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
            <Bot className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Wallbit Pulse AI</p>
            <p className="text-xs text-accent">bot conectado</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl rounded-bl-sm bg-secondary p-4 text-sm leading-relaxed">
          <p className="whitespace-pre-line">{telegramMessage}</p>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-background p-2">
          <RiskSnapshotCard compact />
        </div>

        <Button className="mt-4 w-full">
          <Send className="size-4" />
          Enviar resumen demo
        </Button>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Comandos del bot</h2>
        <div className="mt-4 grid gap-2">
          {[
            "/start",
            "/resumen",
            "/riesgo",
            "/forecast BTC 500 30",
            "/ranking",
            "/alertas",
            "/simular SPY 500",
            "/rebalancear",
          ].map((command) => (
            <div
              key={command}
              className="rounded-lg border border-border bg-secondary/30 px-3 py-2 font-mono text-sm text-muted-foreground"
            >
              {command}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
