from __future__ import annotations

import json
from uuid import uuid4

from app.database import get_connection
from app.services.wallbit_client import WallbitClient
from app.services.wallbit_connection_service import WallbitConnectionService


class TrackRecordService:
    def __init__(self) -> None:
        self.connection_service = WallbitConnectionService()

    def save_forecast(
        self,
        user_id: str,
        symbol: str,
        amount: float,
        horizon_days: int,
        entry_price: float,
        predicted_price: float,
        bearish_pnl: float,
        base_pnl: float,
        bullish_pnl: float,
        risk: str,
        recommendation: str | None = None,
    ) -> str:
        forecast_id = f"fc-{uuid4().hex[:8]}"
        with get_connection() as conn:
            conn.execute(
                """
                INSERT INTO forecasts (
                    id, user_id, symbol, amount, horizon_days, entry_price,
                    predicted_price, bearish_pnl, base_pnl, bullish_pnl, risk, recommendation, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en curso')
                """,
                (
                    forecast_id,
                    user_id,
                    symbol,
                    amount,
                    horizon_days,
                    entry_price,
                    predicted_price,
                    bearish_pnl,
                    base_pnl,
                    bullish_pnl,
                    risk,
                    recommendation,
                ),
            )
        return forecast_id

    async def list_records(self, user_id: str = WallbitConnectionService.DEMO_USER_ID) -> dict:
        api_key = self.connection_service.get_api_key()
        from app.config import get_settings

        client = WallbitClient(api_key=api_key or get_settings().wallbit_api_key)

        with get_connection() as conn:
            rows = conn.execute(
                """
                SELECT * FROM forecasts WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
                """,
                (user_id,),
            ).fetchall()

        records = []
        for row in rows:
            symbol = row["symbol"]
            detail: dict = {"name": symbol, "price": float(row["entry_price"])}
            actual_price = float(row["entry_price"])
            if not client.is_demo:
                detail = await client.get_asset(symbol)
                if detail.get("price"):
                    actual_price = float(detail["price"])

            entry = float(row["entry_price"])
            predicted = float(row["predicted_price"])
            actual = float(actual_price)
            pred_pct = ((predicted - entry) / entry) * 100 if entry else 0
            actual_pct = ((actual - entry) / entry) * 100 if entry else 0
            deviation = actual_pct - pred_pct
            invested = float(row["amount"])
            gain = invested * (actual / entry - 1) if entry else 0
            status = row["status"]
            if status == "en curso" and abs(deviation) < 8:
                status = "acertada" if gain >= 0 else "parcial"

            records.append(
                {
                    "id": row["id"],
                    "symbol": symbol,
                    "name": detail.get("name", symbol) if not client.is_demo else symbol,
                    "date": row["created_at"][:10] if row["created_at"] else "",
                    "horizon": f"{row['horizon_days']} dias",
                    "recommendation": row["recommendation"] or "Mantener",
                    "entry_price": entry,
                    "predicted_price": predicted,
                    "actual_price": actual,
                    "invested": invested,
                    "status": status,
                    "in_progress": row["status"] == "en curso",
                    "predicted_pct": round(pred_pct, 1),
                    "actual_pct": round(actual_pct, 1),
                    "deviation": round(deviation, 1),
                    "hypothetical_gain": round(gain, 2),
                }
            )

        closed = [r for r in records if not r["in_progress"]]
        hits = len([r for r in closed if r["status"] == "acertada"])
        total_gain = sum(r["hypothetical_gain"] for r in closed)
        avg_roi = sum(r["actual_pct"] for r in closed) / len(closed) if closed else 0
        avg_dev = sum(abs(r["deviation"]) for r in closed) / len(closed) if closed else 0

        return {
            "requires_connection": client.is_demo,
            "stats": {
                "accuracy": round((hits / len(closed)) * 100) if closed else 0,
                "pnl": round(total_gain, 2),
                "roi": round(avg_roi, 1),
                "deviation": round(avg_dev, 1),
            },
            "records": records,
        }
