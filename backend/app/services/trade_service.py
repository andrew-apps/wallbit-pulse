from __future__ import annotations

from uuid import uuid4
from app.database import audit_log, get_connection
from app.models.trade import TradeConfirmRequest, TradePrepareRequest, TradeResponse

MAX_DEMO_TRADE_AMOUNT = 2500


class TradeService:
    def prepare(self, request: TradePrepareRequest, user_id: str = "demo-user") -> TradeResponse:
        trade_id = f"trade-{uuid4().hex[:8]}"
        with get_connection() as conn:
            conn.execute(
                """
                INSERT INTO trade_confirmations (id, user_id, symbol, side, amount, status)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (trade_id, user_id, request.symbol.upper(), request.side, request.amount, "prepared"),
            )
        audit_log("trade_prepared", {"trade_id": trade_id, **request.model_dump()}, user_id)
        return TradeResponse(
            trade_id=trade_id,
            status="prepared",
            message="Orden preparada. Requiere escribir CONFIRMAR antes de ejecutar.",
        )

    def confirm(self, request: TradeConfirmRequest, user_id: str = "demo-user") -> TradeResponse:
        with get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM trade_confirmations WHERE id = ? AND user_id = ?",
                (request.trade_id, user_id),
            ).fetchone()

            if row is None:
                return TradeResponse(trade_id=request.trade_id, status="rejected", message="No existe audit log previo.")
            if request.confirmation_text != "CONFIRMAR":
                return TradeResponse(trade_id=request.trade_id, status="rejected", message="Debes escribir CONFIRMAR.")
            if request.read_only:
                return TradeResponse(trade_id=request.trade_id, status="rejected", message="API Key en modo solo lectura.")
            if not request.has_trade_permission:
                return TradeResponse(trade_id=request.trade_id, status="rejected", message="No hay permiso trade.")
            if float(row["amount"]) > MAX_DEMO_TRADE_AMOUNT:
                return TradeResponse(trade_id=request.trade_id, status="rejected", message="Monto supera limite de seguridad.")

            conn.execute(
                "UPDATE trade_confirmations SET status = ?, confirmation_text = ? WHERE id = ?",
                ("confirmed", request.confirmation_text, request.trade_id),
            )

        audit_log("trade_confirmed", request.model_dump(), user_id)
        return TradeResponse(trade_id=request.trade_id, status="confirmed", message="Orden confirmada para ejecucion Wallbit.")
