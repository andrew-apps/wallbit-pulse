import { cn } from "@/lib/utils"

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative grid size-8 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/40">
        <svg viewBox="0 0 24 24" className="size-5 text-primary" fill="none" aria-hidden="true">
          <path
            d="M3 13.5L7.5 13.5L10 7L14 17L16.5 10.5L21 10.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
      </div>
      {withText && (
        <span className="text-[15px] font-semibold tracking-tight">
          Wallbit <span className="text-primary">Pulse</span>{" "}
          <span className="text-muted-foreground">AI</span>
        </span>
      )}
    </div>
  )
}
