from __future__ import annotations

import numpy as np
import pandas as pd

from app.services.wallbit_client import WallbitClient


class MarketDataService:
    VOLATILITY_BY_SYMBOL = {
        "BTC": 0.04,
        "ETH": 0.038,
        "NVDA": 0.03,
        "TSLA": 0.035,
        "SPY": 0.012,
        "QQQ": 0.014,
    }

    def history_from_price(self, symbol: str, current_price: float, days: int = 90) -> pd.DataFrame:
        if current_price <= 0:
            raise ValueError(f"Precio invalido para construir historial de {symbol}")

        volatility = self.VOLATILITY_BY_SYMBOL.get(symbol.upper(), 0.018)
        seed = abs(hash(symbol)) % 10000
        rng = np.random.default_rng(seed)
        returns = rng.normal(0.0004, volatility, days)
        close = current_price / np.cumprod(1 + returns)[-1] * np.cumprod(1 + returns)
        volume = rng.normal(1_000_000, 120_000, days).clip(min=100_000)
        return pd.DataFrame({"close": close, "volume": volume})

    async def get_price_stats(self, client: WallbitClient, symbol: str) -> tuple[float, float, float]:
        detail = await client.get_asset(symbol)
        price = float(detail.get("price") or 0)
        if price <= 0:
            raise ValueError(f"No se pudo obtener precio real para {symbol} desde Wallbit.")
        volatility = self.VOLATILITY_BY_SYMBOL.get(symbol.upper(), 0.018)
        return price, 0.0004, volatility
