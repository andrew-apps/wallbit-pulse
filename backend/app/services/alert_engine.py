from __future__ import annotations

from app.models.alert import AlertCreate
from app.services.alert_service import AlertService


class AlertEngine:
    def __init__(self) -> None:
        self.alert_service = AlertService()

    def run_once(self) -> dict:
        demo_drop = -5.1
        demo_exposure = 18
        triggered = []

        if abs(demo_drop) >= 5:
            triggered.append(
                self.alert_service.create_alert(
                    AlertCreate(symbol="NVDA", condition="drop_percent", threshold=5, channel="telegram")
                )
            )
        if demo_exposure >= 18:
            triggered.append(
                self.alert_service.create_alert(
                    AlertCreate(symbol="NVDA", condition="exposure_above", threshold=18, channel="telegram")
                )
            )

        return {"checked": True, "triggered": [item.model_dump() for item in triggered]}
