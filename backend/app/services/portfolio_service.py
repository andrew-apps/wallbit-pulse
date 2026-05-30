from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from typing import Any

from app.database import get_connection
from app.services.wallbit_client import WallbitClient
from app.services.wallbit_connection_service import WallbitConnectionService


class PortfolioService:
    def __init__(self) -> None:
        self.connection_service = WallbitConnectionService()

    def _client(self) -> WallbitClient:
        api_key = self.connection_service.get_api_key()
        settings_key = __import__("app.config", fromlist=["get_settings"]).get_settings().wallbit_api_key
        return WallbitClient(api_key=api_key or settings_key)

    async def get_portfolio_bundle(self, user_id: str = WallbitConnectionService.DEMO_USER_ID) -> dict:
        status = self.connection_service.get_status(user_id)
        client = self._client()

        if client.is_demo:
            return {
                "connected": False,
                "demo": True,
                "requires_connection": True,
                "portfolio_value": 0,
                "checking_balance": 0,
                "holdings": [],
                "performance": [],
                "weekly_change": 0,
            }

        portfolio = await client.get_portfolio()
        holdings = await client.enrich_holdings(portfolio.get("holdings", []))
        self._save_snapshot(user_id, portfolio, holdings)

        return {
            "connected": status.get("connected", False),
            "demo": False,
            "requires_connection": False,
            "masked_key": status.get("masked_key"),
            "portfolio_value": portfolio["portfolio_value"],
            "checking_balance": portfolio["checking_balance"],
            "holdings": holdings,
            "performance": self._performance_series(user_id),
            "weekly_change": self._weekly_change(user_id),
        }

    def _save_snapshot(self, user_id: str, portfolio: dict, holdings: list[dict]) -> None:
        payload = {
            "portfolio_value": portfolio["portfolio_value"],
            "checking_balance": portfolio["checking_balance"],
            "holdings": holdings,
        }
        with get_connection() as conn:
            conn.execute(
                """
                INSERT INTO portfolio_snapshots (user_id, portfolio_value, checking_balance, snapshot_json)
                VALUES (?, ?, ?, ?)
                """,
                (
                    user_id,
                    portfolio["portfolio_value"],
                    portfolio["checking_balance"],
                    json.dumps(payload),
                ),
            )

    def _performance_series(self, user_id: str) -> list[dict]:
        with get_connection() as conn:
            rows = conn.execute(
                """
                SELECT portfolio_value, created_at
                FROM portfolio_snapshots
                WHERE user_id = ?
                ORDER BY created_at ASC
                LIMIT 30
                """,
                (user_id,),
            ).fetchall()
        if not rows:
            return []
        return [
            {
                "date": row["created_at"][:10] if row["created_at"] else "Hoy",
                "value": round(float(row["portfolio_value"]), 2),
            }
            for row in rows
        ]

    def _weekly_change(self, user_id: str) -> float:
        with get_connection() as conn:
            rows = conn.execute(
                """
                SELECT portfolio_value FROM portfolio_snapshots
                WHERE user_id = ?
                ORDER BY created_at ASC
                LIMIT 1
                """,
                (user_id,),
            ).fetchone()
            latest = conn.execute(
                """
                SELECT portfolio_value FROM portfolio_snapshots
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (user_id,),
            ).fetchone()
        if not rows or not latest or rows["portfolio_value"] == 0:
            return 0.0
        start = float(rows["portfolio_value"])
        end = float(latest["portfolio_value"])
        return round(((end - start) / start) * 100, 2)
