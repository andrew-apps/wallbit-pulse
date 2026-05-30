from fastapi import APIRouter

from app.services.wallbit_client import WallbitClient
from app.services.wallbit_connection_service import WallbitConnectionService

router = APIRouter()
connection_service = WallbitConnectionService()


def _risk_from_holdings(holdings: list[dict]) -> tuple[str, str]:
    if not holdings:
        return "Bajo", "Sin posiciones en inversion."

    sorted_holdings = sorted(holdings, key=lambda item: item.get("exposure_percent", 0), reverse=True)
    top = sorted_holdings[0]
    exposure = top.get("exposure_percent", 0)
    symbol = top.get("symbol", "N/A")

    if exposure >= 20:
        return "Alto", f"Mayor exposicion: {symbol} {exposure}%"
    if exposure >= 12:
        return "Medio", f"Mayor exposicion: {symbol} {exposure}%"
    return "Bajo", f"Cartera diversificada. Top: {symbol} {exposure}%"


@router.get("/dashboard")
async def dashboard() -> dict:
    status = connection_service.get_status()
    api_key = connection_service.get_api_key()
    client = WallbitClient(api_key=api_key or "demo")
    portfolio = await client.get_portfolio()
    risk_level, risk_detail = _risk_from_holdings(portfolio.get("holdings", []))

    top_symbol = "SPY"
    holdings = portfolio.get("holdings", [])
    if holdings:
        top_symbol = holdings[0].get("symbol", "SPY")

    return {
        "connected": status.get("connected", False),
        "demo": portfolio.get("demo", True),
        "masked_key": status.get("masked_key"),
        "portfolio_value": portfolio["portfolio_value"],
        "checking_balance": portfolio["checking_balance"],
        "main_alert": "NVDA cayo 5.1% hoy" if portfolio.get("demo") else f"Posicion principal: {top_symbol}",
        "best_opportunity": "SPY",
        "risk_level": risk_level if not portfolio.get("demo") else "Medio",
        "risk_detail": risk_detail,
        "holdings_count": len(holdings),
    }
