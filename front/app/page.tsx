import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Brain, Radar, ShieldCheck, Target, Zap } from "lucide-react"
import { MinimalHeader } from "@/components/MinimalHeader"
import { Button } from "@/components/ui/button"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"

const palette = [
  { name: "Deep Navy", hex: "#0B0F17" },
  { name: "Electric Blue", hex: "#2563EB" },
  { name: "Radar Green", hex: "#14D1A3" },
  { name: "Cool Gray", hex: "#A1AAB8" },
]

const pillars = [
  { icon: ShieldCheck, title: "Trusted", text: "Secure and Transparent" },
  { icon: Brain, title: "Intelligent", text: "AI-Powered Insights (Cerebras)" },
  { icon: Zap, title: "Automated", text: "Real-time Yahoo + Wallbit" },
  { icon: Target, title: "Focused", text: "Real vs predictive clarity" },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background grid-bg">
      <MinimalHeader />

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-10 lg:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Radar className="size-3.5" />
            AI + Machine Learning Investment Assistant
          </span>
          <h1 className="font-display mt-6 text-5xl font-semibold tracking-tight md:text-7xl">
            Wallbit <span className="text-primary">Radar</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Intelligent signals. Smarter decisions. Automated insights. Real financial clarity. All in one Radar.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-w-[200px] glow-green">
              <Link href="/connect">
                Conectar API Key
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-w-[200px]">
              <Link href="/forecast">Ver real vs predictivo</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-[280px_1fr]">
          <div className="brand-card glow-green flex flex-col items-center p-6 text-center">
            <Image src="/brand/logo-mark.svg" alt="Wallbit Radar" width={96} height={96} className="size-24" />
            <p className="font-display mt-4 text-lg font-semibold">
              Wallbit <span className="text-primary">Radar</span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Brand Identity · UI Kit</p>
            <div className="mt-5 grid w-full grid-cols-2 gap-2">
              {palette.map((c) => (
                <div key={c.hex} className="rounded-lg border border-border p-2 text-left">
                  <span className="block size-6 rounded-md ring-1 ring-border" style={{ background: c.hex }} />
                  <p className="mt-1 text-[10px] font-medium">{c.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{c.hex}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="brand-card glow-cyan p-5 md:p-6">
            <p className="text-xs uppercase tracking-wider text-accent">UI Preview</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-accent/25 bg-accent/5 p-4">
                <p className="text-xs font-semibold text-accent">AI Alert</p>
                <p className="font-display mt-2 text-lg font-semibold">Strong Buy Signal</p>
                <p className="text-sm text-muted-foreground">AAPL · Apple Inc.</p>
                <p className="mt-3 text-2xl font-semibold tabular-nums">$195.42</p>
                <p className="text-sm text-accent">+2.48%</p>
              </div>
              <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                <p className="text-xs font-semibold text-primary">Portfolio Insight</p>
                <p className="font-display mt-2 text-3xl font-semibold">78</p>
                <p className="text-xs text-muted-foreground">Score · conecta Wallbit para tu dato real</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Historial Yahoo + proyeccion Monte Carlo + explicacion Cerebras.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="brand-card p-4 text-center">
              <div className="mx-auto grid size-10 place-items-center rounded-lg bg-primary/15 text-primary">
                <Icon className="size-5" />
              </div>
              <p className="font-display mt-3 text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 pb-16">
        <DisclaimerBanner />
      </div>
    </main>
  )
}
