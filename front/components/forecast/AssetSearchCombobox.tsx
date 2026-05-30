"use client"

import { useMemo, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import type { RadarAsset } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Props = {
  assets: RadarAsset[]
  value: string
  onChange: (symbol: string) => void
}

export function AssetSearchCombobox({ assets, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const selected = assets.find((a) => a.symbol === value)

  const sorted = useMemo(
    () => [...assets].sort((a, b) => a.symbol.localeCompare(b.symbol)),
    [assets],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-11 w-full justify-between font-normal"
        >
          {selected ? (
            <span className="truncate">
              <span className="font-semibold">{selected.symbol}</span>
              <span className="text-muted-foreground"> — {selected.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Buscar por simbolo o nombre...</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command filter={(itemValue, search) => (itemValue.includes(search.toLowerCase()) ? 1 : 0)}>
          <CommandInput placeholder="Ej: GE, NVIDIA, Bitcoin..." />
          <CommandList>
            <CommandEmpty>No se encontro el activo.</CommandEmpty>
            <CommandGroup>
              {sorted.map((asset) => (
                <CommandItem
                  key={asset.symbol}
                  value={`${asset.symbol} ${asset.name}`.toLowerCase()}
                  onSelect={() => {
                    onChange(asset.symbol)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 size-4", value === asset.symbol ? "opacity-100" : "opacity-0")} />
                  <span className="font-semibold">{asset.symbol}</span>
                  <span className="ml-2 truncate text-muted-foreground">{asset.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
