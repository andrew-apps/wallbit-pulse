from __future__ import annotations

from datetime import datetime, timezone

import numpy as np
import pandas as pd

CRYPTO_MAP = {
    "BTC": "BTC-USD",
    "ETH": "ETH-USD",
    "SOL": "SOL-USD",
    "DOGE": "DOGE-USD",
    "XRP": "XRP-USD",
    "ADA": "ADA-USD",
    "BNB": "BNB-USD",
}

PERIOD_DAYS = {
    "1mo": 30,
    "3mo": 90,
    "6mo": 180,
    "1y": 365,
    "2y": 730,
    "5y": 1825,
}


def to_yahoo_symbol(symbol: str) -> str:
    upper = symbol.upper().strip()
    return CRYPTO_MAP.get(upper, upper)


class YahooFinanceService:
    def fetch_history(self, symbol: str, period: str = "1y") -> pd.DataFrame:
        import yfinance as yf

        ticker = to_yahoo_symbol(symbol)
        period = period if period in PERIOD_DAYS else "1y"
        df = yf.Ticker(ticker).history(period=period, auto_adjust=True)

        if df.empty:
            raise ValueError(f"Yahoo Finance no devolvio historial para {symbol} ({ticker}).")

        frame = df[["Close", "Volume"]].copy()
        frame.columns = ["close", "volume"]
        frame.index = pd.to_datetime(frame.index, utc=True)
        frame = frame.dropna(subset=["close"])
        return frame

    def price_stats(self, symbol: str, period: str = "1y") -> tuple[float, float, float]:
        frame = self.fetch_history(symbol, period)
        closes = frame["close"].astype(float)
        returns = closes.pct_change().dropna()
        if returns.empty:
            raise ValueError(f"Historial insuficiente para calcular volatilidad de {symbol}.")
        current_price = float(closes.iloc[-1])
        mean_return = float(returns.mean())
        volatility = float(returns.std())
        return current_price, mean_return, volatility

    def series_payload(self, symbol: str, period: str = "1y") -> list[dict]:
        frame = self.fetch_history(symbol, period)
        points: list[dict] = []
        for ts, row in frame.iterrows():
            date_str = ts.strftime("%Y-%m-%d") if hasattr(ts, "strftime") else str(ts)[:10]
            points.append({"date": date_str, "close": round(float(row["close"]), 4), "volume": int(row["volume"])})
        return points

    def build_projection_path(
        self,
        current_price: float,
        mean_daily_return: float,
        daily_volatility: float,
        horizon_days: int,
        bearish_price: float,
        base_price: float,
        bullish_price: float,
    ) -> list[dict]:
        today = datetime.now(timezone.utc).date().isoformat()
        days = max(horizon_days, 1)
        path: list[dict] = []

        for day in range(days + 1):
            t = day / days
            base = current_price + (base_price - current_price) * t
            bear = current_price + (bearish_price - current_price) * t
            bull = current_price + (bullish_price - current_price) * t
            date = pd.Timestamp(datetime.now(timezone.utc).date()) + pd.Timedelta(days=day)
            path.append(
                {
                    "date": date.strftime("%Y-%m-%d"),
                    "base": round(float(base), 4),
                    "bearish": round(float(bear), 4),
                    "bullish": round(float(bull), 4),
                }
            )

        path[0]["date"] = today
        return path

    @staticmethod
    def backtest_mape(historical: list[dict], horizon_days: int = 30, window: int = 5) -> float | None:
        if len(historical) < horizon_days + window + 5:
            return None
        closes = np.array([p["close"] for p in historical], dtype=float)
        errors: list[float] = []
        step = max(len(closes) // window, horizon_days)
        indices = list(range(horizon_days, len(closes) - 1, step))[:window]
        for idx in indices:
            entry = closes[idx - horizon_days]
            predicted = entry * (1 + 0.0004 * horizon_days)
            actual = closes[idx]
            if entry > 0:
                errors.append(abs((actual - predicted) / entry) * 100)
        return round(float(np.mean(errors)), 2) if errors else None
