from __future__ import annotations

from app.models.recommendation import Recommendation


class InvestmentScoreService:
    def ranking(self) -> list[Recommendation]:
        return [
            Recommendation(symbol="SPY", score=82, label="Opportunity", risk="Low", reason="Tendencia estable y baja volatilidad."),
            Recommendation(symbol="QQQ", score=76, label="Watch", risk="Medium", reason="Momentum positivo, vigilar volatilidad tech."),
            Recommendation(symbol="NVDA", score=68, label="Risky", risk="High", reason="Caida reciente y exposicion elevada."),
            Recommendation(symbol="BTC", score=63, label="Neutral", risk="High", reason="Alta volatilidad con momentum positivo."),
            Recommendation(symbol="TSLA", score=58, label="Watch", risk="High", reason="Vigilar por drawdown y volatilidad."),
        ]
