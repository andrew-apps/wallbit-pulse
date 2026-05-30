import { TelegramConnectCard } from "@/components/TelegramConnectCard"
import { TelegramPreview } from "@/components/TelegramPreview"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"

export default function TelegramPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Telegram Preview</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Asi llega una alerta visual.</h1>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <TelegramConnectCard />
        <TelegramPreview />
      </div>

      <DisclaimerBanner />
    </div>
  )
}
