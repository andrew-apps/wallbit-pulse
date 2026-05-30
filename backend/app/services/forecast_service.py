from __future__ import annotations

from app.ml.monte_carlo import pnl_from_price, run_monte_carlo
from app.models.forecast import ForecastRequest, ForecastResponse, HistoryPoint, ProjectionPoint, Scenario
from app.services.cerebras_service import CerebrasService
from app.services.market_data_service import MarketDataService
from app.services.track_record_service import TrackRecordService
from app.services.wallbit_client import WallbitClient
from app.services.wallbit_connection_service import WallbitConnectionService
from app.services.yahoo_finance_service import YahooFinanceService

DISCLAIMER = "Esto es una simulacion basada en datos reales (Wallbit + Yahoo Finance). No es una garantia de rendimiento."

RISK_MAP = {"Low": "Bajo", "Medium": "Medio", "High": "Alto"}


class ForecastService:
    def __init__(self) -> None:
        self.market_data = MarketDataService()
        self.yahoo = YahooFinanceService()
        self.cerebras = CerebrasService()
        self.track_record = TrackRecordService()
        self.connection_service = WallbitConnectionService()

    def _client(self) -> WallbitClient:
        from app.config import get_settings

        api_key = self.connection_service.get_api_key()
        return WallbitClient(api_key=api_key or get_settings().wallbit_api_key)

    async def run(self, request: ForecastRequest) -> ForecastResponse:
        symbol = request.symbol.upper()
        client = self._client()

        if client.is_demo:
            raise ValueError("Conecta tu cuenta Wallbit para simular con datos reales.")

        yahoo_period = "2y" if request.horizon_days >= 180 else "1y"
        wallbit_price, _, _ = await self.market_data.get_price_stats(client, symbol)

        try:
            historical_raw = self.yahoo.series_payload(symbol, yahoo_period)
            _, mean_return, volatility = self.yahoo.price_stats(symbol, yahoo_period)
            yahoo_price = float(historical_raw[-1]["close"])
            current_price = wallbit_price if wallbit_price > 0 else yahoo_price
            backtest_mape = self.yahoo.backtest_mape(historical_raw, horizon_days=min(request.horizon_days, 30))
        except Exception:
            historical_raw = []
            mean_return, volatility = 0.0004, self.market_data.VOLATILITY_BY_SYMBOL.get(symbol, 0.018)
            current_price = wallbit_price
            backtest_mape = None
            yahoo_period = "fallback"

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
        risk_en = "High" if volatility * profile_multiplier > 0.03 else "Medium" if volatility > 0.015 else "Low"
        risk = RISK_MAP.get(risk_en, "Medio")

        projection_raw = self.yahoo.build_projection_path(
            current_price=current_price,
            mean_daily_return=mean_return,
            daily_volatility=volatility,
            horizon_days=request.horizon_days,
            bearish_price=simulation["bearish_price"],
            base_price=simulation["base_price"],
            bullish_price=simulation["bullish_price"],
        )

        explanation = self.cerebras.explain_forecast(
            symbol=symbol,
            current_price=current_price,
            horizon_days=request.horizon_days,
            risk=risk,
            bearish_price=simulation["bearish_price"],
            base_price=simulation["base_price"],
            bullish_price=simulation["bullish_price"],
            amount=request.amount,
            volatility_pct=volatility * 100,
            yahoo_period=yahoo_period,
            backtest_mape=backtest_mape,
        )

        self.track_record.save_forecast(
            user_id=WallbitConnectionService.DEMO_USER_ID,
            symbol=symbol,
            amount=request.amount,
            horizon_days=request.horizon_days,
            entry_price=current_price,
            predicted_price=simulation["base_price"],
            bearish_pnl=round(bearish_pnl),
            base_pnl=round(base_pnl),
            bullish_pnl=round(bullish_pnl),
            risk=risk,
            recommendation="Comprar" if base_pnl > 0 else "Mantener",
        )

        return ForecastResponse(
            symbol=symbol,
            current_price=current_price,
            amount=request.amount,
            horizon_days=request.horizon_days,
            bearish=Scenario(pnl=round(bearish_pnl), price=round(simulation["bearish_price"], 2)),
            base=Scenario(pnl=round(base_pnl), price=round(simulation["base_price"], 2)),
            bullish=Scenario(pnl=round(bullish_pnl), price=round(simulation["bullish_price"], 2)),
            risk=risk,
            explanation=explanation,
            disclaimer=DISCLAIMER,
            ai_provider="cerebras" if self.cerebras.enabled else "fallback",
            yahoo_period=yahoo_period,
            daily_volatility=round(volatility, 6),
            backtest_mape_pct=backtest_mape,
            historical=[HistoryPoint(**point) for point in historical_raw],
            projection=[ProjectionPoint(**point) for point in projection_raw],
        )

    def run_sync(self, request: ForecastRequest) -> ForecastResponse:
        raise NotImplementedError("Usa await service.run(request)")
