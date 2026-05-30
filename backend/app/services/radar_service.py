from __future__ import annotations

from app.ml.features import build_features
from app.ml.scoring import investment_score
from app.services.market_data_service import MarketDataService
from app.services.portfolio_service import PortfolioService
from app.services.wallbit_client import WallbitClient
from app.services.wallbit_connection_service import WallbitConnectionService


RISK_MAP = {"Low": "Bajo", "Medium": "Medio", "High": "Alto"}
REC_MAP = {
    "Opportunity": "Comprar",
    "Watch": "Mantener",
    "Neutral": "Mantener",
    "Risky": "Reducir",
    "Reduce": "Vender",
}


class RadarService:
    def __init__(self) -> None:
        self.connection_service = WallbitConnectionService()
        self.portfolio_service = PortfolioService()
        self.market_data = MarketDataService()

    def _client(self) -> WallbitClient:
        api_key = self.connection_service.get_api_key()
        from app.config import get_settings

        return WallbitClient(api_key=api_key or get_settings().wallbit_api_key)

    async def list_assets(self) -> dict:
        client = self._client()
        if client.is_demo:
            return {"requires_connection": True, "assets": [], "total": 0}

        portfolio = await self.portfolio_service.get_portfolio_bundle()
        exposure_map = {
            h["symbol"]: h.get("exposure_percent", 0)
            for h in portfolio.get("holdings", [])
            if h.get("symbol") != "CASH"
        }

        raw_assets = await client.list_assets(limit=50)
        scored: list[dict] = []

        for item in raw_assets:
            symbol = str(item.get("symbol") or item.get("ticker") or "").upper()
            if not symbol:
                continue

            exposure = float(exposure_map.get(symbol, 0))
            prices = self.market_data.history_from_price(
                symbol,
                float(item.get("price") or item.get("current_price") or 0),
            )
            features = build_features(prices, exposure, cash_ratio=0.2, risk_profile_factor=1.0)
            score_data = investment_score(features)
            volatility = round(float(features["rolling_volatility_30"]) * 100 * 15, 1)
            change_7d = float(item.get("change_percent_7d") or item.get("change7d") or features["momentum_7"] * 100)

            risk_en = "High" if volatility >= 35 else "Medium" if volatility >= 18 else "Low"
            label = score_data["label"]
            scored.append(
                {
                    "symbol": symbol,
                    "name": item.get("name") or item.get("company_name") or symbol,
                    "asset_class": self._asset_class(item, symbol),
                    "price": float(item.get("price") or item.get("current_price") or 0),
                    "change_7d": round(change_7d, 2),
                    "volatility": volatility,
                    "exposure": round(exposure, 1),
                    "score": score_data["score"],
                    "label": label,
                    "risk": RISK_MAP.get(risk_en, "Medio"),
                    "recommendation": REC_MAP.get(label, "Mantener"),
                    "reason": self._reason(label, symbol, exposure),
                }
            )

        scored.sort(key=lambda x: x["score"], reverse=True)
        return {"requires_connection": False, "assets": scored, "total": len(scored)}

    async def ranking(self, limit: int = 5) -> list[dict]:
        bundle = await self.list_assets()
        return bundle["assets"][:limit]

    @staticmethod
    def _asset_class(item: dict, symbol: str) -> str:
        raw = str(item.get("asset_class") or item.get("type") or item.get("category") or "").lower()
        if "crypto" in raw or symbol in {"BTC", "ETH", "SOL", "USDT", "USDC"}:
            return "Cripto"
        if "etf" in raw:
            return "ETF"
        return "Accion"

    @staticmethod
    def _reason(label: str, symbol: str, exposure: float) -> str:
        if exposure >= 15:
            return f"Exposicion {exposure:.1f}% en cartera. Score {label.lower()}."
        if label == "Opportunity":
            return "Tendencia estable con buen score de inversion."
        if label == "Risky":
            return "Volatilidad elevada o drawdown reciente."
        return f"Activo {symbol} bajo seguimiento del radar."
