from __future__ import annotations

from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from app.database import audit_log
from app.services.report_service import ReportService
from app.services.screenshot_service import ScreenshotService
from app.services.telegram_service import TelegramService

router = APIRouter()
report_service = ReportService()
screenshot_service = ScreenshotService()
telegram_service = TelegramService()


class RiskSnapshotRequest(BaseModel):
    alert_id: str = "risk-nvda-5"


@router.post("/reports/risk-snapshot")
async def create_risk_snapshot(payload: RiskSnapshotRequest) -> dict:
    snapshot = report_service.snapshot_payload(payload.alert_id)
    snapshot["url"] = report_service.risk_snapshot_url(payload.alert_id)
    audit_log("risk_snapshot_created", snapshot)
    return snapshot


@router.get("/report/risk-alert/{alert_id}", response_class=HTMLResponse)
async def risk_alert_html(alert_id: str) -> str:
    snapshot = report_service.snapshot_payload(alert_id)
    return render_snapshot_html(snapshot)


@router.post("/reports/{alert_id}/send-telegram")
async def send_report_to_telegram(alert_id: str) -> dict:
    url = report_service.risk_snapshot_url(alert_id)
    image_path = await screenshot_service.capture_report(url)
    caption = "Wallbit Pulse AI Alert - NVDA cayo -5.1%. Riesgo alto. Esto no es asesoria financiera."
    telegram_result = await telegram_service.send_photo(image_path, caption)
    audit_log("telegram_report_sent", {"alert_id": alert_id, "image_path": image_path, "telegram": telegram_result})
    try:
        Path(image_path).unlink(missing_ok=True)
    except OSError:
        pass
    return {"sent": True, "telegram": telegram_result}


def render_snapshot_html(snapshot: dict) -> str:
    return f"""
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Wallbit Pulse AI Risk Snapshot</title>
  <style>
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #05070b;
      color: #f8fafc;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }}
    .card {{
      width: min(960px, calc(100vw - 48px));
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 24px;
      background: #10141d;
      padding: 44px;
      box-shadow: 0 30px 90px rgba(0, 0, 0, 0.45);
    }}
    .top {{ display: flex; justify-content: space-between; gap: 24px; align-items: center; }}
    .brand {{ color: #67e8f9; font-size: 18px; font-weight: 700; }}
    .badge {{ color: #fca5a5; border: 1px solid rgba(248, 113, 113, 0.35); background: rgba(248, 113, 113, 0.12); padding: 8px 12px; border-radius: 999px; font-size: 13px; }}
    h1 {{ margin: 40px 0 0; font-size: 64px; line-height: 0.95; letter-spacing: -0.04em; }}
    .danger {{ color: #fb7185; }}
    .grid {{ display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; margin-top: 34px; }}
    .metric {{ border: 1px solid rgba(148, 163, 184, 0.16); border-radius: 18px; padding: 22px; background: rgba(15, 23, 42, 0.62); }}
    .label {{ color: #94a3b8; font-size: 14px; margin: 0 0 8px; }}
    .value {{ margin: 0; font-size: 32px; font-weight: 700; }}
    .forecast {{ display: grid; gap: 12px; }}
    .row {{ display: flex; justify-content: space-between; color: #cbd5e1; }}
    .green {{ color: #86efac; }}
    .action {{ margin-top: 24px; border: 1px solid rgba(103, 232, 249, 0.32); background: rgba(8, 145, 178, 0.14); border-radius: 18px; padding: 20px; color: #67e8f9; font-size: 24px; font-weight: 700; }}
    .disclaimer {{ margin: 24px 0 0; color: #94a3b8; font-size: 13px; }}
    @media (max-width: 780px) {{
      .card {{ padding: 28px; }}
      h1 {{ font-size: 44px; }}
      .grid {{ grid-template-columns: 1fr; }}
    }}
  </style>
</head>
<body>
  <main class="card">
    <div class="top">
      <div class="brand">{snapshot["product"]}</div>
      <div class="badge">Riesgo alto</div>
    </div>
    <h1>{snapshot["title"]}<br />{snapshot["symbol"]} <span class="danger">{snapshot["movement"]}</span></h1>
    <section class="grid">
      <div class="metric">
        <p class="label">Tu exposicion</p>
        <p class="value">{snapshot["exposure"]}</p>
      </div>
      <div class="metric forecast">
        <p class="label">Forecast 30 dias</p>
        <div class="row"><span>Pesimista</span><strong class="danger">-${abs(snapshot["forecast_30d"]["bearish"])}</strong></div>
        <div class="row"><span>Base</span><strong class="green">+${snapshot["forecast_30d"]["base"]}</strong></div>
        <div class="row"><span>Optimista</span><strong class="green">+${snapshot["forecast_30d"]["bullish"]}</strong></div>
      </div>
    </section>
    <div class="action">{snapshot["suggested_action"]}</div>
    <p class="disclaimer">{snapshot["disclaimer"]}</p>
  </main>
</body>
</html>
"""
