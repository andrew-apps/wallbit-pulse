import { ShieldCheck } from "lucide-react"
import { DISCLAIMER } from "@/lib/data"
import { cn } from "@/lib/utils"

export function DisclaimerBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4 text-sm text-muted-foreground",
        className,
      )}
    >
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
      <p className="leading-relaxed">{DISCLAIMER}</p>
    </div>
  )
}
