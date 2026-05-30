from pydantic import BaseModel


class TelegramLink(BaseModel):
    user_id: str
    telegram_chat_id: str
    telegram_username: str | None = None
