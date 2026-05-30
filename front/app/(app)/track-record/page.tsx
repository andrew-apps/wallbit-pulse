import { TrackRecordView } from "@/components/TrackRecordView"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"

export default function TrackRecordPage() {
  return (
    <div className="space-y-6">
      <TrackRecordView />
      <DisclaimerBanner />
    </div>
  )
}
