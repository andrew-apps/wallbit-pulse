from __future__ import annotations

import numpy as np


def run_monte_carlo(
    current_price: float,
    mean_daily_return: float,
    daily_volatility: float,
    horizon_days: int,
    runs: int = 1000,
    seed: int = 42,
) -> dict:
    rng = np.random.default_rng(seed)
    daily_returns = rng.normal(mean_daily_return, daily_volatility, size=(runs, horizon_days))
    price_paths = current_price * np.cumprod(1 + daily_returns, axis=1)
    terminal_prices = price_paths[:, -1]
    p10, p50, p90 = np.percentile(terminal_prices, [10, 50, 90])
    return {
        "bearish_price": float(p10),
        "base_price": float(p50),
        "bullish_price": float(p90),
        "paths": price_paths,
    }


def pnl_from_price(amount: float, current_price: float, future_price: float) -> float:
    return amount * ((future_price / current_price) - 1)
