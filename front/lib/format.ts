export function formatSignedCurrency(value: number) {
  const abs = Math.abs(value)
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(abs)

  if (value === 0) return formatted
  return `${value > 0 ? "+" : "-"}${formatted}`
}

export function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`
}
