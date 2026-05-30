from __future__ import annotations

import pandas as pd


def build_features(
    prices: pd.DataFrame,
    exposure_percent: float,
    cash_ratio: float,
    risk_profile_factor: float,
) -> dict:
    frame = prices.copy()
    frame["daily_return"] = frame["close"].pct_change()
    frame["rolling_mean_7"] = frame["daily_return"].rolling(7).mean()
    frame["rolling_mean_30"] = frame["daily_return"].rolling(30).mean()
    frame["rolling_volatility_7"] = frame["daily_return"].rolling(7).std()
    frame["rolling_volatility_30"] = frame["daily_return"].rolling(30).std()
    frame["momentum_7"] = frame["close"].pct_change(7)
    frame["momentum_30"] = frame["close"].pct_change(30)
    frame["volume_change"] = frame["volume"].pct_change(7) if "volume" in frame else 0
    rolling_max = frame["close"].cummax()
    frame["drawdown"] = (frame["close"] - rolling_max) / rolling_max

    latest = frame.iloc[-1].fillna(0)
    return {
        "daily_return": float(latest["daily_return"]),
        "rolling_mean_7": float(latest["rolling_mean_7"]),
        "rolling_mean_30": float(latest["rolling_mean_30"]),
        "rolling_volatility_7": float(latest["rolling_volatility_7"]),
        "rolling_volatility_30": float(latest["rolling_volatility_30"]),
        "momentum_7": float(latest["momentum_7"]),
        "momentum_30": float(latest["momentum_30"]),
        "volume_change": float(latest["volume_change"]),
        "max_drawdown": float(frame["drawdown"].min()),
        "exposure_percent": exposure_percent,
        "cash_ratio": cash_ratio,
        "risk_profile_factor": risk_profile_factor,
    }
