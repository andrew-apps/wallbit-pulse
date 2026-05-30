from __future__ import annotations

from fastapi import APIRouter, Request
from app.models.forecast import ForecastRequest
from app.services.forecast_service import ForecastService
from app.services.telegram_service import TelegramService

router = APIRouter()
forecast_service = ForecastService()
telegram_service = TelegramService()


@router.post("/telegram/webhook")
async def telegram_webhook(request: Request) -> dict:
    update = await request.json()
    message = update.get("message", {})
    text = (message.get("text") or "").strip()
    chat_id = str(message.get("chat", {}).get("id", ""))
    reply = handle_command(text)
    result = await telegram_service.send_message(reply, chat_id=chat_id or None)
    return {"ok": True, "reply": reply, "telegram": result}


def handle_command(text: str) -> str:
    if text == "/start":
        return "Hola, soy Wallbit Pulse AI. Puedo avisarte sobre caidas, riesgo, oportunidades y escenarios de inversion conectados a Wallbit."
    if text == "/resumen":
        return "Resumen de hoy:\nPortafolio: $8,760\nRiesgo: Medio\nAlerta: NVDA cayo 5.1%\nOportunidad: SPY score 82/100"
    if text.startswith("/forecast"):
        parts = text.split()
        symbol = parts[1] if len(parts) > 1 else "BTC"
        amount = float(parts[2]) if len(parts) > 2 else 500
        days = int(parts[3]) if len(parts) > 3 else 30
        forecast = forecast_service.run(
            ForecastRequest(symbol=symbol, amount=amount, horizon_days=days, risk_profile="balanced")
        )
        return (
            f"{forecast.symbol} - Escenario {forecast.horizon_days} dias\n"
            f"Monto simulado: ${forecast.amount:,.0f}\n\n"
            f"Pesimista: ${forecast.bearish.pnl:,.0f}\n"
            f"Base: ${forecast.base.pnl:,.0f}\n"
            f"Optimista: ${forecast.bullish.pnl:,.0f}\n\n"
            f"Riesgo: {forecast.risk}.\n"
            "Esto es una simulacion, no una ganancia garantizada."
        )
    if text == "/ranking":
        return "Ranking de hoy:\n\n1. SPY - 82 - Oportunidad defensiva\n2. QQQ - 76 - Vigilar\n3. NVDA - 68 - Riesgo alto\n4. BTC - 63 - Alta volatilidad\n5. TSLA - 58 - Vigilar"
    if text == "/riesgo":
        return "Tu mayor riesgo esta en NVDA: 18% del portafolio y caida reciente de 5.1%. Puedes simular rebalanceo."
    if text == "/rebalancear":
        return "Sugerencia: reducir NVDA de 18% a 12% y mover 6% a SPY. Quieres ver simulacion?"
    if text == "/alertas":
        return "Alertas activas:\n- Cuando NVDA caiga mas de 5%, enviar Telegram.\n- Enviar resumen diario."
    if text.startswith("/simular"):
        parts = text.split()
        symbol = parts[1] if len(parts) > 1 else "SPY"
        amount = parts[2] if len(parts) > 2 else "500"
        return f"Simulando {symbol} con ${amount}. Te envio forecast y snapshot visual si esta disponible."
    return "Comando no reconocido. Prueba /resumen, /riesgo, /forecast BTC 500 30, /ranking o /rebalancear."
