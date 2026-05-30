from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import init_db
from app.routes import alerts, connect, dashboard, forecast, ranking, reports, telegram, trades

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/")
def root() -> dict:
    return {
        "name": settings.app_name,
        "status": "ok",
        "message": "Wallbit Pulse AI backend running in demo mode.",
    }


app.include_router(connect.router, tags=["connect"])
app.include_router(dashboard.router, tags=["dashboard"])
app.include_router(forecast.router, tags=["forecast"])
app.include_router(ranking.router, tags=["ranking"])
app.include_router(alerts.router, tags=["alerts"])
app.include_router(telegram.router, tags=["telegram"])
app.include_router(reports.router, tags=["reports"])
app.include_router(trades.router, tags=["trades"])
