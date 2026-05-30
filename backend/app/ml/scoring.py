from __future__ import annotations


def clamp(value: float, low: float = 0, high: float = 100) -> float:
    return max(low, min(high, value))


def normalize(value: float, center: float = 0, width: float = 0.05) -> float:
    return clamp(50 + ((value - center) / width) * 50)


def investment_score(features: dict) -> dict:
    trend_score = normalize(features["rolling_mean_30"], 0.0005, 0.004)
    momentum_score = normalize(features["momentum_30"], 0.02, 0.12)
    volume_score = normalize(features["volume_change"], 0, 0.35)
    volatility = max(features["rolling_volatility_30"], 0.0001)
    risk_adjusted_return_score = normalize(features["rolling_mean_30"] / volatility, 0.08, 0.22)
    drawdown_opportunity_score = clamp(abs(features["max_drawdown"]) * 180)
    exposure_penalty = clamp(features["exposure_percent"] * 2.5)

    score = (
        0.25 * trend_score
        + 0.20 * momentum_score
        + 0.15 * volume_score
        + 0.20 * risk_adjusted_return_score
        + 0.10 * drawdown_opportunity_score
        - 0.10 * exposure_penalty
    )

    final = int(round(clamp(score)))
    return {"score": final, "label": classify_score(final)}


def classify_score(score: int) -> str:
    if score >= 80:
        return "Opportunity"
    if score >= 65:
        return "Watch"
    if score >= 45:
        return "Neutral"
    if score >= 25:
        return "Risky"
    return "Reduce"
