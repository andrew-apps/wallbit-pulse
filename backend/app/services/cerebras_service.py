from __future__ import annotations

from app.config import get_settings


class CerebrasService:
    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def enabled(self) -> bool:
        return bool(self.settings.cerebras_api_key)

    def explain_forecast(
        self,
        symbol: str,
        current_price: float,
        horizon_days: int,
        risk: str,
        bearish_price: float,
        base_price: float,
        bullish_price: float,
        amount: float,
        volatility_pct: float,
        yahoo_period: str,
        backtest_mape: float | None = None,
    ) -> str:
        if not self.enabled:
            return self._fallback(
                symbol,
                current_price,
                horizon_days,
                risk,
                volatility_pct,
                yahoo_period,
            )

        from cerebras.cloud.sdk import Cerebras

        client = Cerebras(api_key=self.settings.cerebras_api_key)
        backtest_line = f"Error medio backtest {backtest_mape}%." if backtest_mape is not None else ""

        prompt = f"""Eres un analista cuantitativo de Wallbit Radar. Explica en espanol (max 3 frases, tono claro, sin prometer ganancias):
Activo: {symbol}
Precio actual: ${current_price:,.2f}
Horizonte: {horizon_days} dias
Volatilidad historica Yahoo ({yahoo_period}): {volatility_pct:.1f}%
Escenarios: pesimista ${bearish_price:,.2f}, base ${base_price:,.2f}, optimista ${bullish_price:,.2f}
Monto simulado: ${amount:,.0f}
Riesgo: {risk}
{backtest_line}
Incluye una recomendacion prudente (Comprar/Mantener/Reducir) sin lenguaje de certeza."""

        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=self.settings.cerebras_model,
            max_completion_tokens=320,
            temperature=0.2,
            top_p=1,
            stream=False,
        )
        content = completion.choices[0].message.content
        return content.strip() if content else self._fallback(symbol, current_price, horizon_days, risk, volatility_pct, yahoo_period)

    @staticmethod
    def _fallback(
        symbol: str,
        current_price: float,
        horizon_days: int,
        risk: str,
        volatility_pct: float,
        yahoo_period: str,
    ) -> str:
        return (
            f"{symbol} cotiza a ${current_price:,.2f}. Con volatilidad historica de {volatility_pct:.1f}% "
            f"(Yahoo {yahoo_period}), la simulacion a {horizon_days} dias sugiere riesgo {risk.lower()}. "
            "Revisa el escenario pesimista antes de operar; esto no es asesoria financiera."
        )
