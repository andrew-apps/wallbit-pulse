from fastapi import APIRouter
from app.services.radar_service import RadarService

router = APIRouter()
service = RadarService()


@router.get("/radar")
async def radar() -> dict:
    return await service.list_assets()


@router.get("/ranking")
async def ranking() -> list[dict]:
    return await service.ranking(limit=5)
