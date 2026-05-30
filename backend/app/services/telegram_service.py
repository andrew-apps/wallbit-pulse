from __future__ import annotations

from pathlib import Path
import httpx
from app.config import get_settings


class TelegramService:
    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def enabled(self) -> bool:
        return bool(self.settings.telegram_bot_token and self.settings.telegram_chat_id)

    async def send_message(self, text: str, chat_id: str | None = None) -> dict:
        target_chat = chat_id or self.settings.telegram_chat_id
        if not self.enabled or not target_chat:
            return {"sent": False, "demo": True, "text": text}

        url = f"https://api.telegram.org/bot{self.settings.telegram_bot_token}/sendMessage"
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(url, json={"chat_id": target_chat, "text": text})
            response.raise_for_status()
            return response.json()

    async def send_photo(self, image_path: str, caption: str, chat_id: str | None = None) -> dict:
        target_chat = chat_id or self.settings.telegram_chat_id
        if not self.enabled or not target_chat:
            return {"sent": False, "demo": True, "image_path": image_path, "caption": caption}

        url = f"https://api.telegram.org/bot{self.settings.telegram_bot_token}/sendPhoto"
        path = Path(image_path)
        async with httpx.AsyncClient(timeout=30) as client:
            with path.open("rb") as image:
                response = await client.post(
                    url,
                    data={"chat_id": target_chat, "caption": caption},
                    files={"photo": (path.name, image, "image/png")},
                )
            response.raise_for_status()
            return response.json()
