from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from fastapi import Request

from app.database import audit_log
from app.models.forecast import ForecastRequest
from app.services.forecast_service import ForecastService
from app.services.telegram_link_service import TelegramLinkService
from app.services.telegram_service import TelegramService

router = APIRouter()
forecast_service = ForecastService()
telegram_service = TelegramService()
link_service = TelegramLinkService()


class ForecastTelegramRequest(BaseModel):
    symbol: str = "BTC"
    amount: float = 500
    horizon_days: int = 30
    risk_profile: str = Field(default="balanced")


@router.get("/telegram/status")
async def telegram_status() -> dict:
    bot = await telegram_service.get_bot_info()
    link = link_service.get_link()
    chat_id = telegram_service.resolve_chat_id()
    return {
        "configured": telegram_service.has_token,
        "linked": link is not None,
        "chat_id": link.telegram_chat_id if link else None,
        "username": link.telegram_username if link else None,
        "bot_username": bot.get("result", {}).get("username") if bot.get("ok") else telegram_service.settings.telegram_bot_username,
        "bot_url": telegram_service.bot_url(),
        "can_send": bool(chat_id),
        "demo": not telegram_service.has_token,
    }


@router.post("/telegram/link-code")
async def create_telegram_link_code() -> dict:
    code = link_service.create_link_code()
    audit_log("telegram_link_code_created", {"code": code})
    return {
        "code": code,
        "bot_url": telegram_service.bot_url(),
        "instructions": f"Abre el bot y envia /start {code}",
    }


@router.post("/telegram/webhook")
async def telegram_webhook(request: Request) -> dict:
    update = await request.json()
    result = await telegram_service.process_update(update)
    return {"ok": True, "result": result}


@router.post("/telegram/send-forecast")
async def send_forecast_to_telegram(payload: ForecastTelegramRequest) -> dict:
    try:
        forecast = await forecast_service.run(
            ForecastRequest(
                symbol=payload.symbol.upper(),
                amount=payload.amount,
                horizon_days=payload.horizon_days,
                risk_profile=payload.risk_profile,
            )
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    message = telegram_service.format_forecast_message(forecast)
    telegram_result = await telegram_service.send_message(message)
    audit_log("telegram_forecast_sent", {"symbol": payload.symbol, "telegram": telegram_result})
    return {
        "sent": telegram_result.get("ok", False) or telegram_result.get("demo", False),
        "demo": telegram_result.get("demo", False),
        "telegram": telegram_result,
        "message": message,
    }
