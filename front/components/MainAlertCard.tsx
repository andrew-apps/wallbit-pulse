import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function MainAlertCard({ title, detail }: { title: string; detail: string }) {
  return (
    <Card className="border-destructive/30 bg-card/90">
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="grid size-10 place-items-center rounded-lg bg-destructive/15 text-destructive ring-1 ring-destructive/25">
            <AlertTriangle className="size-5" />
          </div>
          <Badge className="bg-destructive/15 text-destructive ring-1 ring-destructive/30 hover:bg-destructive/15">
            Riesgo alto
          </Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Main Alert</p>
          <p className="mt-2 text-xl font-semibold leading-tight">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}
