from __future__ import annotations

import asyncio
import httpx
from app.config import get_settings


DEMO_PORTFOLIO = {
    "checking_balance": 1250,
    "portfolio_value": 8760,
    "holdings": [
        {"symbol": "SPY", "value": 2500, "exposure_percent": 28, "price": 542.18},
        {"symbol": "NVDA", "value": 1800, "exposure_percent": 18, "price": 128.44, "change_percent": -5.1},
        {"symbol": "AAPL", "value": 1200, "exposure_percent": 14, "price": 226.05},
        {"symbol": "BTC", "value": 1500, "exposure_percent": 17, "price": 65000},
        {"symbol": "CASH", "value": 1760, "exposure_percent": 20, "price": 1},
    ],
}


class WallbitClient:
    def __init__(self, api_key: str | None = None) -> None:
        settings = get_settings()
        self.api_key = api_key or settings.wallbit_api_key
        self.base_url = settings.wallbit_base_url.rstrip("/")

    @property
    def headers(self) -> dict[str, str]:
        return {"X-API-Key": self.api_key or "demo"}

    async def validate(self) -> dict:
        if not self.api_key or self.api_key.startswith("demo"):
            return {"connected": True, "permissions": ["read"], "demo": True}

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{self.base_url}/api/public/v1/account-details", headers=self.headers)
            if response.status_code == 401:
                return {"connected": False, "error": "invalid_api_key"}
            if response.status_code == 403:
                return {"connected": False, "error": "insufficient_permissions"}
            if response.status_code == 429:
                return {"connected": False, "error": "rate_limit"}
            response.raise_for_status()
            return {"connected": True, "permissions": ["read"]}

    async def get_portfolio(self) -> dict:
        if not self.api_key or self.api_key.startswith("demo"):
            return DEMO_PORTFOLIO

        async with httpx.AsyncClient(timeout=10) as client:
            checking, stocks = await asyncio.gather(
                client.get(f"{self.base_url}/api/public/v1/balance/checking", headers=self.headers),
                client.get(f"{self.base_url}/api/public/v1/balance/stocks", headers=self.headers),
            )
            checking.raise_for_status()
            stocks.raise_for_status()
            return {"checking": checking.json(), "stocks": stocks.json()}
