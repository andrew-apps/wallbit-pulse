from datetime import datetime
from pydantic import BaseModel


class AuditLog(BaseModel):
    id: int | None = None
    user_id: str
    event_type: str
    payload_json: dict
    created_at: datetime | None = None
