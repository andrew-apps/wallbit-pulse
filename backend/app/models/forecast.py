from pydantic import BaseModel, Field


class ForecastRequest(BaseModel):
    symbol: str = Field(default="BTC", min_length=1)
    amount: float = Field(default=500, gt=0)
    horizon_days: int = Field(default=30, ge=1, le=365)
    risk_profile: str = "balanced"


class Scenario(BaseModel):
    pnl: float
    price: float | None = None


class ForecastResponse(BaseModel):
    symbol: str
    current_price: float
    amount: float
    horizon_days: int
    bearish: Scenario
    base: Scenario
    bullish: Scenario
    risk: str
    explanation: str
    disclaimer: str
