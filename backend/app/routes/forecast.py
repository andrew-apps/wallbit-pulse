from fastapi import APIRouter
from app.database import audit_log
from app.models.forecast import ForecastRequest, ForecastResponse
from app.services.forecast_service import ForecastService

router = APIRouter()
service = ForecastService()


@router.post("/forecast", response_model=ForecastResponse)
async def forecast(payload: ForecastRequest) -> ForecastResponse:
    result = service.run(payload)
    audit_log("forecast_generated", {"request": payload.model_dump(), "response": result.model_dump()})
    return result
