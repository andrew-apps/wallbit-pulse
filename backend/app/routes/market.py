from fastapi import APIRouter, HTTPException, Query

from app.services.yahoo_finance_service import YahooFinanceService, to_yahoo_symbol

router = APIRouter()
yahoo = YahooFinanceService()


@router.get("/market/history/{symbol}")
async def market_history(
    symbol: str,
    period: str = Query(default="1y", pattern="^(1mo|3mo|6mo|1y|2y|5y)$"),
) -> dict:
    try:
        historical = yahoo.series_payload(symbol.upper(), period)
        stats_price, mean_return, volatility = yahoo.price_stats(symbol.upper(), period)
        mape = yahoo.backtest_mape(historical, horizon_days=30)
        return {
            "symbol": symbol.upper(),
            "yahoo_ticker": to_yahoo_symbol(symbol),
            "period": period,
            "source": "yahoo_finance",
            "current_price": stats_price,
            "mean_daily_return": round(mean_return, 6),
            "daily_volatility": round(volatility, 6),
            "backtest_mape_pct": mape,
            "historical": historical,
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
