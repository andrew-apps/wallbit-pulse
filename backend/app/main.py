from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routes import alerts, connect, dashboard, forecast, ranking, reports, telegram, trades
from app.services.telegram_bot import start_telegram_polling, stop_telegram_polling

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    await start_telegram_polling()
    yield
    await stop_telegram_polling()


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict:
    return {
        "name": settings.app_name,
        "status": "ok",
        "telegram_bot": settings.telegram_bot_username if settings.telegram_bot_token else None,
        "message": "Wallbit Pulse AI backend running.",
    }


app.include_router(connect.router, tags=["connect"])
app.include_router(dashboard.router, tags=["dashboard"])
app.include_router(forecast.router, tags=["forecast"])
app.include_router(ranking.router, tags=["ranking"])
app.include_router(alerts.router, tags=["alerts"])
app.include_router(telegram.router, tags=["telegram"])
app.include_router(reports.router, tags=["reports"])
app.include_router(trades.router, tags=["trades"])
