from fastapi import APIRouter

from app.services.alert_service import AlertService
from app.services.portfolio_service import PortfolioService
from app.services.radar_service import RadarService

router = APIRouter()
portfolio_service = PortfolioService()
radar_service = RadarService()
alert_service = AlertService()


@router.get("/dashboard")
async def dashboard() -> dict:
    bundle = await portfolio_service.get_portfolio_bundle()
    alerts = alert_service.list_alerts()
    ranking = await radar_service.ranking(limit=1)

    holdings = bundle.get("holdings", [])
    top = holdings[0] if holdings else None
    best = ranking[0]["symbol"] if ranking else None

    main_alert = "Conecta Wallbit para ver alertas reales."
    if alerts:
        main_alert = alerts[0].message
    elif top:
        change = top.get("change_7d", 0)
        direction = "cayo" if change < 0 else "subio"
        main_alert = f"{top['symbol']} {direction} {abs(change):.1f}% · exposicion {top.get('exposure_percent', 0)}%"

    risk_level = "Medio"
    risk_detail = "Sin datos de cartera."
    if holdings:
        sorted_h = sorted(holdings, key=lambda h: h.get("exposure_percent", 0), reverse=True)
        top_h = sorted_h[0]
        exp = top_h.get("exposure_percent", 0)
        if exp >= 20:
            risk_level = "Alto"
        elif exp >= 12:
            risk_level = "Medio"
        else:
            risk_level = "Bajo"
        risk_detail = f"Mayor exposicion: {top_h.get('symbol')} {exp}%"

    return {
        **bundle,
        "main_alert": main_alert,
        "best_opportunity": best or "—",
        "best_opportunity_score": ranking[0]["score"] if ranking else 0,
        "risk_level": risk_level,
        "risk_detail": risk_detail,
        "alerts": [a.model_dump() for a in alerts[:5]],
        "holdings_count": len(holdings),
    }
