from __future__ import annotations

import asyncio
import logging

from app.config import get_settings
from app.services.telegram_service import TelegramService

logger = logging.getLogger(__name__)

_polling_task: asyncio.Task | None = None


async def poll_telegram_updates() -> None:
    settings = get_settings()
    if not settings.telegram_bot_token or not settings.telegram_use_polling:
        return

    service = TelegramService()
    bot = await service.get_bot_info()
    if bot.get("ok"):
        username = bot.get("result", {}).get("username", "bot")
        logger.info("Telegram bot polling started (@%s)", username)

    offset = 0
    while True:
        try:
            updates = await service.get_updates(offset=offset, timeout=25)
            for update in updates:
                offset = update["update_id"] + 1
                await service.process_update(update)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Telegram polling error")
            await asyncio.sleep(3)


async def start_telegram_polling() -> None:
    global _polling_task
    settings = get_settings()
    if not settings.telegram_bot_token or not settings.telegram_use_polling:
        return
    if _polling_task and not _polling_task.done():
        return
    _polling_task = asyncio.create_task(poll_telegram_updates())


async def stop_telegram_polling() -> None:
    global _polling_task
    if _polling_task and not _polling_task.done():
        _polling_task.cancel()
        try:
            await _polling_task
        except asyncio.CancelledError:
            pass
    _polling_task = None
