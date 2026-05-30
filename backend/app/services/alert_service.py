from __future__ import annotations

from uuid import uuid4
from app.database import audit_log, get_connection
from app.models.alert import AlertCreate, AlertOut
from app.services.report_service import ReportService


class AlertService:
    def __init__(self) -> None:
        self.report_service = ReportService()

    def create_alert(self, payload: AlertCreate, user_id: str = "demo-user") -> AlertOut:
        alert_id = f"alert-{uuid4().hex[:8]}"
        message = self._message(payload)
        severity = "High" if payload.condition in {"drop_percent", "exposure_above"} else "Medium"
        snapshot_url = self.report_service.risk_snapshot_url(alert_id)

        with get_connection() as conn:
            conn.execute(
                """
                INSERT INTO alerts (id, user_id, symbol, alert_type, severity, message, snapshot_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (alert_id, user_id, payload.symbol.upper(), payload.condition, severity, message, snapshot_url),
            )

        audit_log("alert_created", {"alert_id": alert_id, "payload": payload.model_dump()}, user_id)
        return AlertOut(
            id=alert_id,
            symbol=payload.symbol.upper(),
            alert_type=payload.condition,
            severity=severity,
            message=message,
            snapshot_url=snapshot_url,
            sent_to_telegram=False,
        )

    def list_alerts(self) -> list[AlertOut]:
        with get_connection() as conn:
            rows = conn.execute("SELECT * FROM alerts ORDER BY created_at DESC").fetchall()
        if not rows:
            return [
                AlertOut(
                    id="risk-nvda-5",
                    symbol="NVDA",
                    alert_type="drop_percent",
                    severity="High",
                    message="NVDA cayo 5.1% hoy. Tu exposicion es 18%.",
                    snapshot_url=self.report_service.risk_snapshot_url("risk-nvda-5"),
                    sent_to_telegram=True,
                )
            ]
        return [
            AlertOut(
                id=row["id"],
                symbol=row["symbol"],
                alert_type=row["alert_type"],
                severity=row["severity"],
                message=row["message"],
                snapshot_url=row["snapshot_url"],
                sent_to_telegram=bool(row["sent_to_telegram"]),
            )
            for row in rows
        ]

    @staticmethod
    def _message(payload: AlertCreate) -> str:
        symbol = payload.symbol.upper()
        if payload.condition == "drop_percent":
            return f"Cuando {symbol} caiga mas de {payload.threshold}%, enviar Telegram."
        if payload.condition == "rise_percent":
            return f"Cuando {symbol} suba mas de {payload.threshold}%, enviar Telegram."
        if payload.condition == "score_above":
            return f"Cuando {symbol} supere score {payload.threshold}, enviar Telegram."
        if payload.condition == "exposure_above":
            return f"Cuando la exposicion a {symbol} supere {payload.threshold}%, enviar Telegram."
        return f"Alerta creada para {symbol}."
