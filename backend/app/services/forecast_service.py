from __future__ import annotations

from app.ml.monte_carlo import pnl_from_price, run_monte_carlo
from app.models.forecast import ForecastRequest, ForecastResponse, Scenario

DISCLAIMER = "Esto es una simulacion, no una garantia de rendimiento."

DEMO_FORECASTS = {
    ("BTC", 500, 30): {
        "current_price": 65000,
        "bearish_price": 60000,
        "base_price": 68000,
        "bullish_price": 74000,
        "bearish_pnl": -42,
        "base_pnl": 28,
        "bullish_pnl": 96,
        "risk": "High",
        "explanation": "Alta volatilidad y momentum positivo, pero el riesgo sigue elevado.",
    },
    ("SPY", 500, 30): {
        "current_price": 542.18,
        "bearish_price": 522,
        "base_price": 557,
        "bullish_price": 581,
        "bearish_pnl": -18,
        "base_pnl": 14,
        "bullish_pnl": 36,
        "risk": "Low",
        "explanation": "Tendencia estable y baja volatilidad.",
    },
}

PRICE_DEMO = {
    "BTC": (65000, 0.0012, 0.045),
    "ETH": (3480, 0.0010, 0.042),
    "SPY": (542.18, 0.00035, 0.011),
    "QQQ": (478.2, 0.00045, 0.014),
    "AAPL": (226.05, 0.00025, 0.018),
    "NVDA": (128.44, 0.0005, 0.032),
    "TSLA": (248.5, 0.0002, 0.038),
}


class ForecastService:
    def run(self, request: ForecastRequest) -> ForecastResponse:
        symbol = request.symbol.upper()
        key = (symbol, int(request.amount), int(request.horizon_days))
        if key in DEMO_FORECASTS:
            demo = DEMO_FORECASTS[key]
            return ForecastResponse(
                symbol=symbol,
                current_price=demo["current_price"],
                amount=request.amount,
                horizon_days=request.horizon_days,
                bearish=Scenario(pnl=demo["bearish_pnl"], price=demo["bearish_price"]),
                base=Scenario(pnl=demo["base_pnl"], price=demo["base_price"]),
                bullish=Scenario(pnl=demo["bullish_pnl"], price=demo["bullish_price"]),
                risk=demo["risk"],
                explanation=demo["explanation"],
                disclaimer=DISCLAIMER,
            )

        current_price, mean_return, volatility = PRICE_DEMO.get(symbol, PRICE_DEMO["SPY"])
        profile_multiplier = {"conservative": 0.75, "balanced": 1.0, "aggressive": 1.35}.get(
            request.risk_profile,
            1.0,
        )
        simulation = run_monte_carlo(
            current_price=current_price,
            mean_daily_return=mean_return,
            daily_volatility=volatility * profile_multiplier,
            horizon_days=request.horizon_days,
        )
        bearish_pnl = pnl_from_price(request.amount, current_price, simulation["bearish_price"])
        base_pnl = pnl_from_price(request.amount, current_price, simulation["base_price"])
        bullish_pnl = pnl_from_price(request.amount, current_price, simulation["bullish_price"])
        risk = "High" if volatility * profile_multiplier > 0.03 else "Medium" if volatility > 0.015 else "Low"

        return ForecastResponse(
            symbol=symbol,
            current_price=current_price,
            amount=request.amount,
            horizon_days=request.horizon_days,
            bearish=Scenario(pnl=round(bearish_pnl), price=round(simulation["bearish_price"], 2)),
            base=Scenario(pnl=round(base_pnl), price=round(simulation["base_price"], 2)),
            bullish=Scenario(pnl=round(bullish_pnl), price=round(simulation["bullish_price"], 2)),
            risk=risk,
            explanation="Escenario estimado con retornos historicos demo y volatilidad diaria.",
            disclaimer=DISCLAIMER,
        )
