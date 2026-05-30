import Link from "next/link"
import { ArrowRight, Bell, Radar, ShieldCheck, TrendingUp } from "lucide-react"
import { MinimalHeader } from "@/components/MinimalHeader"
import { Button } from "@/components/ui/button"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { RiskSnapshotCard } from "@/components/RiskSnapshotCard"

const benefits = [
  { icon: Bell, title: "Detecta riesgos", text: "NVDA cae, exposicion alta, alerta lista." },
  { icon: TrendingUp, title: "Simula escenarios", text: "Pesimista, base y optimista antes de decidir." },
  { icon: Radar, title: "Te avisa por Telegram", text: "Texto + imagen del reporte cuando importa." },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <MinimalHeader />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-10 pt-10 lg:grid-cols-[1fr_460px] lg:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Radar className="size-3.5" />
            Agente predictivo conectado a Wallbit
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">
            Wallbit Pulse AI
          </h1>
          <p className="mt-4 text-xl text-primary">Tu radar predictivo conectado a Wallbit.</p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Simula escenarios, mide riesgo y recibe alertas visuales por Telegram antes de tomar decisiones.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/connect">
                Conectar Wallbit
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">Probar demo</Link>
            </Button>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-accent" />
            Esto no es asesoria financiera. Las proyecciones son simulaciones.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-xs font-medium text-muted-foreground">Telegram alert preview</span>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-accent ring-1 ring-accent/25">
              enviado
            </span>
          </div>
          <RiskSnapshotCard compact />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-6 py-8 md:grid-cols-3">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="rounded-xl border border-border bg-card p-5">
            <benefit.icon className="size-5 text-primary" />
            <h2 className="mt-4 text-sm font-semibold">{benefit.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{benefit.text}</p>
          </div>
        ))}
      </section>

      <footer className="mx-auto max-w-6xl px-6 pb-10">
        <DisclaimerBanner />
      </footer>
    </main>
  )
}
