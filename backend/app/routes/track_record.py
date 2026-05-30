from fastapi import APIRouter
from app.services.track_record_service import TrackRecordService

router = APIRouter()
service = TrackRecordService()


@router.get("/track-record")
async def track_record() -> dict:
    return await service.list_records()
