from __future__ import annotations

import numpy as np
import pandas as pd


class MarketDataService:
    def synthetic_history(self, symbol: str, days: int = 90) -> pd.DataFrame:
        seed = abs(hash(symbol)) % 10000
        rng = np.random.default_rng(seed)
        base_price = {"BTC": 65000, "SPY": 542, "NVDA": 128, "QQQ": 478}.get(symbol.upper(), 250)
        volatility = {"BTC": 0.04, "NVDA": 0.03, "TSLA": 0.035}.get(symbol.upper(), 0.012)
        returns = rng.normal(0.0005, volatility, days)
        close = base_price * np.cumprod(1 + returns)
        volume = rng.normal(1_000_000, 120_000, days).clip(min=100_000)
        return pd.DataFrame({"close": close, "volume": volume})
