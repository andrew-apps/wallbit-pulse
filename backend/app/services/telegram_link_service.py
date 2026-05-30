from __future__ import annotations

import secrets
import sqlite3
from datetime import datetime, timezone

from app.database import get_connection
from app.models.telegram_link import TelegramLink


class TelegramLinkService:
    DEMO_USER_ID = "demo-user"

    def create_link_code(self, user_id: str = DEMO_USER_ID) -> str:
        code = f"WB-PULSE-{secrets.token_hex(2).upper()}"
        with get_connection() as conn:
            conn.execute("DELETE FROM telegram_link_codes WHERE user_id = ?", (user_id,))
            conn.execute(
                """
                INSERT INTO telegram_link_codes (code, user_id, created_at)
                VALUES (?, ?, ?)
                """,
                (code, user_id, datetime.now(timezone.utc).isoformat()),
            )
        return code

    def link_chat(self, code: str, chat_id: str, username: str | None = None) -> TelegramLink | None:
        with get_connection() as conn:
            row = conn.execute(
                "SELECT user_id FROM telegram_link_codes WHERE code = ?",
                (code.strip().upper(),),
            ).fetchone()
            if not row:
                return None

            user_id = row["user_id"]
            conn.execute(
                "DELETE FROM telegram_links WHERE user_id = ?",
                (user_id,),
            )
            conn.execute(
                """
                INSERT INTO telegram_links (user_id, telegram_chat_id, telegram_username, linked_at)
                VALUES (?, ?, ?, ?)
                """,
                (user_id, chat_id, username, datetime.now(timezone.utc).isoformat()),
            )
            conn.execute("DELETE FROM telegram_link_codes WHERE code = ?", (code.strip().upper(),))
            return TelegramLink(
                user_id=user_id,
                telegram_chat_id=chat_id,
                telegram_username=username,
            )

    def get_link(self, user_id: str = DEMO_USER_ID) -> TelegramLink | None:
        with get_connection() as conn:
            row = conn.execute(
                """
                SELECT user_id, telegram_chat_id, telegram_username
                FROM telegram_links
                WHERE user_id = ?
                """,
                (user_id,),
            ).fetchone()
            if not row:
                return None
            return TelegramLink(
                user_id=row["user_id"],
                telegram_chat_id=row["telegram_chat_id"],
                telegram_username=row["telegram_username"],
            )

    def get_chat_id(self, user_id: str = DEMO_USER_ID) -> str | None:
        link = self.get_link(user_id)
        return link.telegram_chat_id if link else None
