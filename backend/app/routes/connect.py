from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.database import audit_log
from app.services.wallbit_client import WallbitClient
from app.services.wallbit_connection_service import WallbitConnectionService

router = APIRouter()
connection_service = WallbitConnectionService()


class ConnectWallbitRequest(BaseModel):
    api_key: str = Field(default="", max_length=512)
    mode: str = "read_only"


@router.get("/connect-wallbit/status")
async def connect_wallbit_status() -> dict:
    status = connection_service.get_status()
    return status


@router.post("/connect-wallbit/demo")
async def connect_wallbit_demo() -> dict:
    saved = connection_service.save_connection("demo-read-only", mode="read_only")
    audit_log("wallbit_connected", {"mode": "read_only", "demo": True, "masked_key": saved["masked_key"]})
    return {
        "connected": True,
        "demo": True,
        "permissions": ["read"],
        "masked_key": saved["masked_key"],
        "message": "Modo demo activado. Puedes explorar Pulse sin API Key real.",
    }


@router.delete("/connect-wallbit")
async def disconnect_wallbit() -> dict:
    connection_service.clear_connection()
    audit_log("wallbit_disconnected", {})
    return {"connected": False, "message": "Conexion Wallbit eliminada."}


@router.post("/connect-wallbit")
async def connect_wallbit(payload: ConnectWallbitRequest) -> dict:
    if payload.mode not in {"read_only", "trade"}:
        raise HTTPException(status_code=400, detail={"error": "invalid_mode", "message": "Modo invalido."})

    api_key = payload.api_key.strip()
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail={"error": "missing_api_key", "message": "Ingresa tu API Key de Wallbit o usa modo demo."},
        )

    client = WallbitClient(api_key=api_key)
    result = await client.validate()
    if not result.get("connected"):
        error = result.get("error", "connection_error")
        message = result.get("message") or WallbitClient.error_message(error)
        status = 401 if error == "invalid_api_key" else 403 if error == "insufficient_permissions" else 429 if error == "rate_limit" else 502
        raise HTTPException(status_code=status, detail={"error": error, "message": message})

    saved = connection_service.save_connection(api_key, mode=payload.mode)
    audit_log(
        "wallbit_connected",
        {
            "mode": payload.mode,
            "permissions": saved["permissions"],
            "masked_key": saved["masked_key"],
            "demo": False,
        },
    )

    return {
        "connected": True,
        "demo": False,
        "permissions": saved["permissions"],
        "masked_key": saved["masked_key"],
        "message": "Wallbit conectado correctamente en modo solo lectura."
        if payload.mode == "read_only"
        else "Wallbit conectado. Trades requieren confirmacion explicita.",
    }
