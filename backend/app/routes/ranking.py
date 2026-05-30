from fastapi import APIRouter
from app.models.recommendation import Recommendation
from app.services.investment_score_service import InvestmentScoreService

router = APIRouter()
service = InvestmentScoreService()


@router.get("/ranking", response_model=list[Recommendation])
async def ranking() -> list[Recommendation]:
    return service.ranking()
