from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.database import audit_log
from app.services.security_service import encrypt_secret, mask_secret
from app.services.wallbit_client import WallbitClient

router = APIRouter()


class ConnectWallbitRequest(BaseModel):
    api_key: str = Field(min_length=1)
    mode: str = "read_only"


@router.post("/connect-wallbit")
async def connect_wallbit(payload: ConnectWallbitRequest) -> dict:
    if payload.mode not in {"read_only", "trade"}:
        raise HTTPException(status_code=400, detail="Invalid mode")

    client = WallbitClient(api_key=payload.api_key)
    result = await client.validate()
    if not result.get("connected"):
        error = result.get("error", "connection_error")
        status = 401 if error == "invalid_api_key" else 403 if error == "insufficient_permissions" else 429 if error == "rate_limit" else 502
        raise HTTPException(status_code=status, detail=error)

    encrypted_key = encrypt_secret(payload.api_key)
    audit_log(
        "wallbit_connected",
        {
            "mode": payload.mode,
            "permissions": ["read"] if payload.mode == "read_only" else ["read", "trade"],
            "masked_key": mask_secret(payload.api_key),
            "encrypted_key_length": len(encrypted_key),
        },
    )

    return {
        "connected": True,
        "permissions": ["read"] if payload.mode == "read_only" else ["read", "trade"],
        "message": "Wallbit conectado en modo solo lectura." if payload.mode == "read_only" else "Wallbit conectado con trade mode opcional.",
    }
