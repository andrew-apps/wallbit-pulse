from fastapi import APIRouter
from app.services.wallbit_client import WallbitClient

router = APIRouter()


@router.get("/dashboard")
async def dashboard() -> dict:
    portfolio = await WallbitClient(api_key="demo").get_portfolio()
    return {
        "portfolio_value": portfolio["portfolio_value"],
        "checking_balance": portfolio["checking_balance"],
        "main_alert": "NVDA cayo 5.1% hoy",
        "best_opportunity": "SPY",
        "risk_level": "Medium",
        "risk_detail": "Mayor exposicion: NVDA 18%",
    }
