import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { ConnectWallbitCard } from "@/components/ConnectWallbitCard"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"

export default function ConnectPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        </Button>
      </header>

      <section className="mx-auto grid max-w-5xl items-center gap-8 px-6 py-10 lg:grid-cols-[1fr_430px]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Lock className="size-3.5" />
            Conexion segura con Wallbit
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">Conecta Wallbit sin ruido.</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Conecta tu API Key de Wallbit. Todos los datos del producto son reales: portafolio, precios, scores y alertas.
          </p>
          <div className="mt-6 grid max-w-lg gap-3 text-sm text-muted-foreground">
            <p className="rounded-lg border border-border bg-card p-4">1. Validamos acceso de lectura.</p>
            <p className="rounded-lg border border-border bg-card p-4">2. Calculamos pulso, score y alertas.</p>
            <p className="rounded-lg border border-border bg-card p-4">3. Vinculas Telegram para recibir snapshots.</p>
          </div>
        </div>

        <ConnectWallbitCard />
      </section>

      <footer className="mx-auto max-w-5xl px-6 pb-10">
        <DisclaimerBanner />
      </footer>
    </main>
  )
}
