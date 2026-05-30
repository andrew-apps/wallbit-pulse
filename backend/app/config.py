from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Wallbit Pulse AI"
    environment: str = "local"
    wallbit_base_url: str = "https://api.wallbit.io"
    wallbit_api_key: str | None = None
    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None
    telegram_bot_username: str = "wallbit_radar_bot"
    telegram_use_polling: bool = True
    encryption_key: str = Field(default="demo-local-key-change-me")
    frontend_url: str = "http://localhost:3000"
    database_url: str = "sqlite:///./wallbit_pulse.db"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
