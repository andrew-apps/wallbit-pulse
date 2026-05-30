from pydantic import BaseModel, Field


class TradePrepareRequest(BaseModel):
    symbol: str
    side: str = Field(pattern="^(BUY|SELL)$")
    amount: float = Field(gt=0)


class TradeConfirmRequest(BaseModel):
    trade_id: str
    confirmation_text: str
    has_trade_permission: bool = False
    read_only: bool = True


class TradeResponse(BaseModel):
    trade_id: str
    status: str
    message: str
