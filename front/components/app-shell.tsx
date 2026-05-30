"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Bell, CircleDot, Menu, Radar, Send, TrendingUp } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { navItems } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const iconMap = {
  Activity,
  Radar,
  TrendingUp,
  Bell,
  Send,
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap]
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-[18px] shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href="/" onClick={onNavigate} className="px-2 pt-2">
        <Logo />
      </Link>
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto rounded-xl border border-border bg-secondary/50 p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-accent">
          <CircleDot className="size-3.5 animate-pulse" />
          Modo demo read-only
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Ninguna operacion se ejecuta sin confirmacion explicita.
        </p>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const title = navItems.find((i) => i.href === pathname)?.label ?? "Wallbit Pulse AI"

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Navegacion</SheetTitle>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <h1 className="text-base font-semibold tracking-tight md:text-lg">{title}</h1>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
              <span className="size-1.5 rounded-full bg-accent" />
              Telegram listo
            </span>
            <div className="grid size-9 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-1 ring-primary/30">
              AI
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
