from pydantic import BaseModel, Field


class AlertCreate(BaseModel):
    symbol: str = Field(default="NVDA", min_length=1)
    condition: str = "drop_percent"
    threshold: float = 5
    channel: str = "telegram"


class AlertOut(BaseModel):
    id: str
    symbol: str
    alert_type: str
    severity: str
    message: str
    snapshot_url: str | None = None
    sent_to_telegram: bool = False
