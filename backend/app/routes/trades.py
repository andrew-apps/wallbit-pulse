from fastapi import APIRouter
from app.models.trade import TradeConfirmRequest, TradePrepareRequest, TradeResponse
from app.services.trade_service import TradeService

router = APIRouter()
service = TradeService()


@router.post("/trade/prepare", response_model=TradeResponse)
async def prepare_trade(payload: TradePrepareRequest) -> TradeResponse:
    return service.prepare(payload)


@router.post("/trade/confirm", response_model=TradeResponse)
async def confirm_trade(payload: TradeConfirmRequest) -> TradeResponse:
    return service.confirm(payload)
