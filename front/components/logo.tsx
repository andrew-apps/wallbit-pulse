import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative grid size-9 place-items-center rounded-xl bg-[#151B26] ring-1 ring-[#2563EB]/40 glow-green">
        <Image src="/brand/logo-mark.svg" alt="Wallbit Radar" width={28} height={28} className="size-7" />
      </div>
      {withText && (
        <span className="font-display text-[15px] font-semibold tracking-tight">
          Wallbit <span className="text-[#2563EB]">Radar</span>
        </span>
      )}
    </div>
  )
}
