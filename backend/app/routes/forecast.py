from fastapi import APIRouter, HTTPException
from app.database import audit_log
from app.models.forecast import ForecastRequest, ForecastResponse
from app.services.forecast_service import ForecastService

router = APIRouter()
service = ForecastService()


@router.post("/forecast", response_model=ForecastResponse)
async def forecast(payload: ForecastRequest) -> ForecastResponse:
    try:
        result = await service.run(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    audit_log("forecast_generated", {"request": payload.model_dump(), "response": result.model_dump()})
    return result
