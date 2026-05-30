import Link from "next/link"
import { KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ConnectRequired({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="grid size-12 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
        <KeyRound className="size-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Conecta Wallbit para ver datos reales</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {message ??
          "Esta pantalla usa tu API Key y la API publica de Wallbit. No mostramos datos ficticios."}
      </p>
      <Button asChild className="mt-6">
        <Link href="/connect">Conectar API Key</Link>
      </Button>
    </div>
  )
}
