from pydantic import BaseModel


class Recommendation(BaseModel):
    symbol: str
    score: int
    label: str
    risk: str
    reason: str
