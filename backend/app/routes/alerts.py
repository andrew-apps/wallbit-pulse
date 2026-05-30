from fastapi import APIRouter
from app.models.alert import AlertCreate, AlertOut
from app.services.alert_engine import AlertEngine
from app.services.alert_service import AlertService

router = APIRouter()
service = AlertService()
engine = AlertEngine()


@router.post("/alerts", response_model=AlertOut)
async def create_alert(payload: AlertCreate) -> AlertOut:
    return service.create_alert(payload)


@router.get("/alerts", response_model=list[AlertOut])
async def list_alerts() -> list[AlertOut]:
    return service.list_alerts()


@router.post("/alerts/run-demo")
async def run_demo_alert_engine() -> dict:
    return engine.run_once()
