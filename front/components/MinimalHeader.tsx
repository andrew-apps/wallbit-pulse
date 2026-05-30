import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

export function MinimalHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/">
        <Logo />
      </Link>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link href="/dashboard">Probar demo</Link>
        </Button>
        <Button asChild>
          <Link href="/connect">
            Conectar Wallbit
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </header>
  )
}
