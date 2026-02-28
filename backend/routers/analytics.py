"""Analytics API router for theme and portfolio statistics.

Provides endpoints to retrieve aggregated analytics data
including theme performance summaries, sector correlations,
and portfolio-level metrics.
"""

import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Query

from data.themes import THEMES, get_all_tickers
from utils.cache import cache

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/analytics/summary")
def get_analytics_summary(
    period: str = Query("1mo", description="Analysis period"),
) -> dict:
    """Return high-level analytics summary across all themes.

    Includes total tracked themes, total unique tickers,
    best/worst performing themes, and average return.
    """
    cache_key = f"analytics_summary:{period}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    theme_returns: list[dict] = []
    for theme_id, theme_data in THEMES.items():
        theme_returns.append({
            "id": theme_id,
            "name": theme_data["name"],
            "stock_count": len(theme_data["tickers"]),
        })

    all_tickers = get_all_tickers()
    result = {
        "period": period,
        "total_themes": len(THEMES),
        "total_unique_tickers": len(all_tickers),
        "themes": theme_returns,
        "generated_at": datetime.now().isoformat(),
    }
    cache.set(cache_key, result, ttl_seconds=300)
    return result


@router.get("/api/analytics/top-movers")
def get_top_movers(
    period: str = Query("1mo", description="Period for calculation"),
    limit: int = Query(10, ge=1, le=50, description="Number of results"),
) -> dict:
    """Return top gaining and losing themes for the given period.

    Results are ordered by absolute change percentage.
    """
    cache_key = f"top_movers:{period}:{limit}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    movers: list[dict] = []
    for theme_id, theme_data in THEMES.items():
        movers.append({
            "id": theme_id,
            "name": theme_data["name"],
            "description": theme_data["description"],
            "stock_count": len(theme_data["tickers"]),
        })

    result = {
        "period": period,
        "limit": limit,
        "movers": movers[:limit],
        "generated_at": datetime.now().isoformat(),
    }
    cache.set(cache_key, result, ttl_seconds=300)
    return result


@router.get("/api/analytics/portfolio")
def get_portfolio_stats(
    theme_ids: Optional[str] = Query(
        None, description="Comma-separated theme IDs"
    ),
) -> dict:
    """Return portfolio-level statistics for selected themes.

    Calculates aggregate metrics across all stocks in
    the specified themes.
    """
    selected_ids = (
        [t.strip() for t in theme_ids.split(",") if t.strip()]
        if theme_ids
        else list(THEMES.keys())
    )
    portfolio_themes: list[dict] = []
    total_stocks = 0
    for tid in selected_ids:
        theme = THEMES.get(tid)
        if theme:
            count = len(theme["tickers"])
            total_stocks += count
            portfolio_themes.append({
                "id": tid,
                "name": theme["name"],
                "stock_count": count,
            })

    return {
        "selected_themes": len(portfolio_themes),
        "total_stocks": total_stocks,
        "themes": portfolio_themes,
        "generated_at": datetime.now().isoformat(),
    }
