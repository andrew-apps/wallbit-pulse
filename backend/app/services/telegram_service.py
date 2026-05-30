from __future__ import annotations

from pathlib import Path
import re

import httpx

from app.config import get_settings
from app.database import audit_log
from app.models.forecast import ForecastRequest
from app.services.forecast_service import ForecastService
from app.services.telegram_link_service import TelegramLinkService


class TelegramService:
    BOT_USERNAME = "wallbit_radar_bot"

    def __init__(self) -> None:
        self.settings = get_settings()
        self.link_service = TelegramLinkService()
        self.forecast_service = ForecastService()

    @property
    def has_token(self) -> bool:
        return bool(self.settings.telegram_bot_token)

    @property
    def enabled(self) -> bool:
        return self.has_token and bool(self.resolve_chat_id())

    def bot_url(self) -> str:
        username = self.settings.telegram_bot_username or self.BOT_USERNAME
        return f"https://t.me/{username}"

    def resolve_chat_id(self, user_id: str = TelegramLinkService.DEMO_USER_ID) -> str | None:
        linked = self.link_service.get_chat_id(user_id)
        if linked:
            return linked
        return self.settings.telegram_chat_id

    async def _api(self, method: str, *, json: dict | None = None, data: dict | None = None, files: dict | None = None) -> dict:
        if not self.has_token:
            return {"ok": False, "demo": True}

        url = f"https://api.telegram.org/bot{self.settings.telegram_bot_token}/{method}"
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, json=json, data=data, files=files)
            response.raise_for_status()
            return response.json()

    async def get_bot_info(self) -> dict:
        if not self.has_token:
            return {"ok": False, "demo": True}
        return await self._api("getMe")

    async def get_updates(self, offset: int = 0, timeout: int = 25) -> list[dict]:
        if not self.has_token:
            return []

        payload = await self._api("getUpdates", json={"offset": offset, "timeout": timeout})
        return payload.get("result", [])

    async def send_message(self, text: str, chat_id: str | None = None, user_id: str = TelegramLinkService.DEMO_USER_ID) -> dict:
        target_chat = chat_id or self.resolve_chat_id(user_id)
        if not self.has_token or not target_chat:
            return {"sent": False, "demo": True, "text": text}

        result = await self._api(
            "sendMessage",
            json={"chat_id": target_chat, "text": text, "parse_mode": "HTML"},
        )
        audit_log("telegram_message_sent", {"chat_id": target_chat, "preview": text[:120]})
        return result

    async def send_photo(
        self,
        image_path: str,
        caption: str,
        chat_id: str | None = None,
        user_id: str = TelegramLinkService.DEMO_USER_ID,
    ) -> dict:
        target_chat = chat_id or self.resolve_chat_id(user_id)
        if not self.has_token or not target_chat:
            return {"sent": False, "demo": True, "image_path": image_path, "caption": caption}

        path = Path(image_path)
        with path.open("rb") as image:
            result = await self._api(
                "sendPhoto",
                data={"chat_id": target_chat, "caption": caption},
                files={"photo": (path.name, image, "image/png")},
            )
        audit_log("telegram_photo_sent", {"chat_id": target_chat, "image_path": image_path})
        return result

    async def process_update(self, update: dict) -> dict | None:
        message = update.get("message") or update.get("edited_message")
        if not message:
            return None

        text = (message.get("text") or "").strip()
        chat = message.get("chat", {})
        chat_id = str(chat.get("id", ""))
        username = chat.get("username")

        link_code = self._extract_link_code(text)
        if link_code:
            linked = self.link_service.link_chat(link_code, chat_id, username)
            if linked:
                reply = (
                    "Cuenta vinculada correctamente.\n\n"
                    "Comandos disponibles:\n"
                    "/resumen - pulso del portafolio\n"
                    "/riesgo - exposicion principal\n"
                    "/forecast BTC 500 30 - simular escenario\n"
                    "/ranking - top oportunidades\n"
                    "/rebalancear - sugerencia de ajuste\n"
                    "/alertas - alertas activas\n"
                    "/help - ayuda"
                )
            else:
                reply = "Codigo invalido o expirado. Genera uno nuevo en la web de Wallbit Pulse AI."
            await self.send_message(reply, chat_id=chat_id)
            audit_log("telegram_linked", {"chat_id": chat_id, "username": username, "linked": bool(linked)})
            return {"linked": bool(linked), "chat_id": chat_id}

        reply = await self.handle_command(text)
        if reply:
            result = await self.send_message(reply, chat_id=chat_id)
            return {"reply": reply, "telegram": result}
        return None

    def _extract_link_code(self, text: str) -> str | None:
        upper = text.upper()
        match = re.search(r"WB-PULSE-[A-F0-9]{4}", upper)
        if match:
            return match.group(0)
        parts = text.split()
        if len(parts) >= 2 and parts[0] == "/START":
            candidate = parts[1].upper()
            if candidate.startswith("WB-PULSE-"):
                return candidate
        return None

    async def handle_command(self, text: str) -> str:
        from app.services.portfolio_service import PortfolioService
        from app.services.radar_service import RadarService

        if text in {"/start", "/help"}:
            return (
                "Hola, soy <b>Wallbit Pulse AI</b> (@wallbit_radar_bot).\n\n"
                "Vincula tu cuenta Wallbit desde la web y usa:\n"
                "/resumen /riesgo /forecast /ranking /rebalancear /alertas\n\n"
                "Ejemplo: /forecast BTC 500 30"
            )
        if text == "/resumen":
            bundle = await PortfolioService().get_portfolio_bundle()
            if bundle.get("requires_connection"):
                return "Conecta tu API Key de Wallbit en la web para ver tu resumen real."
            return (
                f"<b>Resumen de hoy</b>\n"
                f"Portafolio: ${bundle['portfolio_value']:,.2f}\n"
                f"Checking: ${bundle['checking_balance']:,.2f}\n"
                f"Riesgo: {bundle.get('risk_level', 'Medio')}\n"
                f"Alerta: {bundle.get('main_alert', 'Sin alertas')}"
            )
        if text.startswith("/forecast"):
            parts = text.split()
            symbol = parts[1].upper() if len(parts) > 1 else "BTC"
            amount = float(parts[2]) if len(parts) > 2 else 500
            days = int(parts[3]) if len(parts) > 3 else 30
            try:
                forecast = await self.forecast_service.run(
                    ForecastRequest(symbol=symbol, amount=amount, horizon_days=days, risk_profile="balanced")
                )
            except ValueError as exc:
                return str(exc)
            return self.format_forecast_message(forecast)
        if text == "/ranking":
            ranking = await RadarService().ranking(limit=5)
            if not ranking:
                return "Conecta Wallbit para ver el ranking real de activos."
            lines = "\n".join(
                f"{i + 1}. {item['symbol']} - {item['score']} - {item['reason'][:40]}"
                for i, item in enumerate(ranking)
            )
            return f"<b>Ranking de hoy</b>\n\n{lines}"
        if text == "/riesgo":
            bundle = await PortfolioService().get_portfolio_bundle()
            if bundle.get("requires_connection"):
                return "Conecta Wallbit para analizar tu riesgo real."
            return bundle.get("risk_detail", "Sin datos de riesgo.")
        if text == "/rebalancear":
            ranking = await RadarService().ranking(limit=1)
            if not ranking:
                return "Conecta Wallbit para recibir sugerencias reales."
            top = ranking[0]["symbol"]
            return f"Sugerencia: revisa exposicion en tu cartera y simula rebalanceo con /forecast {top} 500 30"
        if text == "/alertas":
            from app.services.alert_service import AlertService

            alerts = AlertService().list_alerts()
            if not alerts:
                return "No tienes alertas activas. Crea una desde la web."
            lines = "\n".join(f"- {alert.message}" for alert in alerts[:5])
            return f"<b>Alertas activas</b>\n{lines}"
        if text.startswith("/simular"):
            parts = text.split()
            symbol = parts[1].upper() if len(parts) > 1 else "SPY"
            amount = parts[2] if len(parts) > 2 else "500"
            return f"Simulando {symbol} con ${amount}. Te envio forecast si esta disponible."
        if text:
            return (
                "Comando no reconocido. Prueba /resumen, /riesgo, /forecast BTC 500 30, "
                "/ranking o /rebalancear."
            )
        return ""

    def format_forecast_message(self, forecast) -> str:
        return (
            f"<b>Wallbit Pulse AI Forecast</b>\n"
            f"{forecast.symbol} - {forecast.horizon_days} dias\n"
            f"Monto: ${forecast.amount:,.0f}\n\n"
            f"Pesimista: ${forecast.bearish.pnl:,.0f}\n"
            f"Base: ${forecast.base.pnl:,.0f}\n"
            f"Optimista: ${forecast.bullish.pnl:,.0f}\n\n"
            f"Riesgo: {forecast.risk}\n"
            "<i>Simulacion Monte Carlo. No es asesoria financiera.</i>"
        )
