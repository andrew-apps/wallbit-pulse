from __future__ import annotations

from datetime import datetime, timezone

from app.database import get_connection
from app.services.security_service import decrypt_secret, encrypt_secret, mask_secret


class WallbitConnectionService:
    DEMO_USER_ID = "demo-user"

    def save_connection(
        self,
        api_key: str,
        mode: str = "read_only",
        user_id: str = DEMO_USER_ID,
    ) -> dict:
        encrypted = encrypt_secret(api_key)
        permissions = ["read"] if mode == "read_only" else ["read", "trade"]
        with get_connection() as conn:
            conn.execute(
                """
                INSERT INTO wallbit_connections (user_id, encrypted_api_key, mode, permissions, connected_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                    encrypted_api_key = excluded.encrypted_api_key,
                    mode = excluded.mode,
                    permissions = excluded.permissions,
                    connected_at = excluded.connected_at
                """,
                (
                    user_id,
                    encrypted,
                    mode,
                    ",".join(permissions),
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
        return {
            "connected": True,
            "mode": mode,
            "permissions": permissions,
            "masked_key": mask_secret(api_key),
            "demo": api_key.startswith("demo"),
        }

    def get_api_key(self, user_id: str = DEMO_USER_ID) -> str | None:
        with get_connection() as conn:
            row = conn.execute(
                "SELECT encrypted_api_key FROM wallbit_connections WHERE user_id = ?",
                (user_id,),
            ).fetchone()
            if not row:
                return None
            return decrypt_secret(row["encrypted_api_key"])

    def get_status(self, user_id: str = DEMO_USER_ID) -> dict:
        with get_connection() as conn:
            row = conn.execute(
                """
                SELECT mode, permissions, connected_at, encrypted_api_key
                FROM wallbit_connections
                WHERE user_id = ?
                """,
                (user_id,),
            ).fetchone()
            if not row:
                return {
                    "connected": False,
                    "demo": True,
                    "mode": None,
                    "permissions": [],
                    "masked_key": None,
                }

            api_key = decrypt_secret(row["encrypted_api_key"])
            return {
                "connected": True,
                "demo": api_key.startswith("demo"),
                "mode": row["mode"],
                "permissions": row["permissions"].split(","),
                "masked_key": mask_secret(api_key),
                "connected_at": row["connected_at"],
            }

    def clear_connection(self, user_id: str = DEMO_USER_ID) -> None:
        with get_connection() as conn:
            conn.execute("DELETE FROM wallbit_connections WHERE user_id = ?", (user_id,))
