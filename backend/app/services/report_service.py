from __future__ import annotations

from app.config import get_settings


class ReportService:
    def risk_snapshot_url(self, alert_id: str) -> str:
        return f"{get_settings().frontend_url.rstrip('/')}/report/risk-alert/{alert_id}"

    def snapshot_payload(self, alert_id: str = "risk-nvda-5") -> dict:
        return {
            "alert_id": alert_id,
            "product": "Wallbit Pulse AI",
            "title": "Riesgo detectado",
            "symbol": "NVDA",
            "movement": "-5.1%",
            "exposure": "18% del portafolio",
            "forecast_30d": {
                "bearish": -42,
                "base": 28,
                "bullish": 96,
            },
            "suggested_action": "Simular rebalanceo",
            "disclaimer": "Esto no es asesoria financiera.",
        }
