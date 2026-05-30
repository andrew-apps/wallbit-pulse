from __future__ import annotations

import asyncio
from typing import Any

import httpx

from app.config import get_settings


DEMO_PORTFOLIO = {
    "checking_balance": 1250.0,
    "portfolio_value": 8760.0,
    "investment_cash": 1760.0,
    "holdings": [
        {"symbol": "SPY", "value": 2500, "exposure_percent": 28, "price": 542.18, "shares": 4.6},
        {"symbol": "NVDA", "value": 1800, "exposure_percent": 18, "price": 128.44, "shares": 14.0, "change_percent": -5.1},
        {"symbol": "AAPL", "value": 1200, "exposure_percent": 14, "price": 226.05, "shares": 5.3},
        {"symbol": "BTC", "value": 1500, "exposure_percent": 17, "price": 65000, "shares": 0.023},
        {"symbol": "CASH", "value": 1760, "exposure_percent": 20, "price": 1, "shares": 1760},
    ],
    "demo": True,
}

ERROR_MESSAGES = {
    "invalid_api_key": "API Key invalida o expirada. Verifica que la copiaste completa desde Wallbit.",
    "insufficient_permissions": "La API Key no tiene permiso 'read'. Crea una con lectura en Wallbit → Settings → API Keys.",
    "rate_limit": "Demasiados intentos. Espera un momento e intenta de nuevo.",
    "connection_error": "No pudimos contactar a Wallbit. Revisa tu conexion a internet.",
    "network_error": "Error de red al contactar api.wallbit.io.",
}


class WallbitClient:
    def __init__(self, api_key: str | None = None) -> None:
        settings = get_settings()
        self.api_key = (api_key or settings.wallbit_api_key or "").strip()
        self.base_url = settings.wallbit_base_url.rstrip("/")

    @property
    def is_demo(self) -> bool:
        return not self.api_key or self.api_key.lower().startswith("demo")

    @property
    def headers(self) -> dict[str, str]:
        return {"X-API-Key": self.api_key, "Accept": "application/json"}

    def _map_error(self, status_code: int, payload: dict[str, Any] | None = None) -> str:
        payload = payload or {}
        message = str(payload.get("message") or payload.get("error") or "").lower()
        if status_code == 401 or "invalid" in message or "expired" in message:
            return "invalid_api_key"
        if status_code == 403 or "permission" in message:
            return "insufficient_permissions"
        if status_code == 429 or "too many" in message:
            return "rate_limit"
        return "connection_error"

    async def validate(self) -> dict:
        if self.is_demo:
            return {"connected": True, "permissions": ["read"], "demo": True}

        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.get(
                    f"{self.base_url}/api/public/v1/balance/checking",
                    headers=self.headers,
                )
                if response.status_code >= 400:
                    payload = response.json() if response.content else {}
                    error = self._map_error(response.status_code, payload)
                    return {
                        "connected": False,
                        "error": error,
                        "message": payload.get("message") or ERROR_MESSAGES.get(error, ERROR_MESSAGES["connection_error"]),
                        "status_code": response.status_code,
                    }

                data = response.json().get("data", [])
                return {
                    "connected": True,
                    "permissions": ["read"],
                    "demo": False,
                    "currencies": len(data),
                }
        except httpx.HTTPError as exc:
            return {
                "connected": False,
                "error": "network_error",
                "message": ERROR_MESSAGES["network_error"],
                "detail": str(exc),
            }

    async def get_portfolio(self) -> dict:
        if self.is_demo:
            return DEMO_PORTFOLIO

        async with httpx.AsyncClient(timeout=20) as client:
            checking_response, stocks_response = await asyncio.gather(
                client.get(f"{self.base_url}/api/public/v1/balance/checking", headers=self.headers),
                client.get(f"{self.base_url}/api/public/v1/balance/stocks", headers=self.headers),
            )
            checking_response.raise_for_status()
            stocks_response.raise_for_status()

            checking_rows = checking_response.json().get("data", [])
            stock_rows = stocks_response.json().get("data", [])

            checking_balance = self._checking_total_usd(checking_rows)
            investment_cash = 0.0
            holdings: list[dict[str, Any]] = []

            symbols = [row["symbol"] for row in stock_rows if row.get("symbol") and row["symbol"] != "USD"]
            prices = await self._fetch_prices(client, symbols)

            stock_value_total = 0.0
            for row in stock_rows:
                symbol = row.get("symbol", "")
                shares = float(row.get("shares") or 0)
                if symbol == "USD":
                    investment_cash = shares
                    continue
                if shares <= 0:
                    continue
                price = prices.get(symbol, 0.0)
                value = shares * price if price else shares
                stock_value_total += value
                holdings.append(
                    {
                        "symbol": symbol,
                        "shares": round(shares, 4),
                        "price": round(price, 2) if price else None,
                        "value": round(value, 2),
                    }
                )

            portfolio_value = checking_balance + investment_cash + stock_value_total
            self._apply_exposure(holdings, portfolio_value)

            if investment_cash > 0:
                holdings.append(
                    {
                        "symbol": "CASH",
                        "shares": round(investment_cash, 2),
                        "price": 1,
                        "value": round(investment_cash, 2),
                        "exposure_percent": round((investment_cash / portfolio_value) * 100, 1) if portfolio_value else 0,
                    }
                )

            return {
                "checking_balance": round(checking_balance, 2),
                "portfolio_value": round(portfolio_value, 2),
                "investment_cash": round(investment_cash, 2),
                "holdings": holdings,
                "demo": False,
            }

    def _checking_total_usd(self, rows: list[dict[str, Any]]) -> float:
        if not rows:
            return 0.0
        usd = next((float(row.get("balance") or 0) for row in rows if row.get("currency") == "USD"), None)
        if usd is not None:
            return usd
        return sum(float(row.get("balance") or 0) for row in rows)

    async def _fetch_prices(self, client: httpx.AsyncClient, symbols: list[str]) -> dict[str, float]:
        async def fetch_one(symbol: str) -> tuple[str, float]:
            try:
                response = await client.get(
                    f"{self.base_url}/api/public/v1/assets/{symbol}",
                    headers=self.headers,
                )
                if response.status_code != 200:
                    return symbol, 0.0
                data = response.json().get("data", {})
                price = data.get("price") or data.get("currentPrice") or data.get("current_price") or 0
                return symbol, float(price or 0)
            except (httpx.HTTPError, TypeError, ValueError):
                return symbol, 0.0

        if not symbols:
            return {}
        results = await asyncio.gather(*(fetch_one(symbol) for symbol in symbols))
        return dict(results)

    def _apply_exposure(self, holdings: list[dict[str, Any]], portfolio_value: float) -> None:
        if portfolio_value <= 0:
            return
        for item in holdings:
            item["exposure_percent"] = round((item["value"] / portfolio_value) * 100, 1)

    @staticmethod
    def error_message(error_code: str) -> str:
        return ERROR_MESSAGES.get(error_code, ERROR_MESSAGES["connection_error"])
