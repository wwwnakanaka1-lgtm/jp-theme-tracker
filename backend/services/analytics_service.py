"""Analytics calculation service for theme performance metrics.

Provides higher-level analytics computations built on top of
the base calculator module including rankings, correlations,
and aggregate portfolio statistics.
"""

import logging
from datetime import datetime
from typing import Optional

from data.themes import THEMES, get_all_tickers

logger = logging.getLogger(__name__)


def calculate_theme_ranking(period: str = "1mo") -> list[dict]:
    """Rank all themes by their stock count and metadata.

    Args:
        period: Analysis period identifier.

    Returns:
        Sorted list of theme summary dicts with rank field.
    """
    rankings: list[dict] = []
    for theme_id, theme_data in THEMES.items():
        rankings.append({
            "id": theme_id,
            "name": theme_data["name"],
            "description": theme_data["description"],
            "stock_count": len(theme_data["tickers"]),
            "period": period,
        })

    rankings.sort(key=lambda t: t["stock_count"], reverse=True)
    for idx, item in enumerate(rankings, start=1):
        item["rank"] = idx

    return rankings


def calculate_portfolio_metrics(
    theme_ids: Optional[list[str]] = None,
) -> dict:
    """Calculate aggregate metrics across selected themes.

    Args:
        theme_ids: List of theme IDs to include. If None, all themes.

    Returns:
        Dict with portfolio-level statistics.
    """
    ids = theme_ids or list(THEMES.keys())
    total_stocks = 0
    unique_tickers: set[str] = set()

    for tid in ids:
        theme = THEMES.get(tid)
        if theme:
            total_stocks += len(theme["tickers"])
            unique_tickers.update(theme["tickers"])

    return {
        "selected_themes": len(ids),
        "total_stock_slots": total_stocks,
        "unique_tickers": len(unique_tickers),
        "overlap_count": total_stocks - len(unique_tickers),
        "calculated_at": datetime.now().isoformat(),
    }


def get_theme_overlap_matrix() -> dict:
    """Build a matrix showing ticker overlap between themes.

    Returns:
        Dict mapping theme pairs to their shared ticker count.
    """
    theme_ids = list(THEMES.keys())
    overlap: dict[str, dict[str, int]] = {}

    for i, tid_a in enumerate(theme_ids):
        overlap[tid_a] = {}
        tickers_a = set(THEMES[tid_a]["tickers"])
        for tid_b in theme_ids[i + 1:]:
            tickers_b = set(THEMES[tid_b]["tickers"])
            shared = len(tickers_a & tickers_b)
            if shared > 0:
                overlap[tid_a][tid_b] = shared

    return {
        "total_themes": len(theme_ids),
        "overlaps": overlap,
        "calculated_at": datetime.now().isoformat(),
    }


def get_sector_distribution() -> list[dict]:
    """Summarize how tickers are distributed across themes.

    Returns:
        List of dicts with theme name and percentage of total.
    """
    all_tickers = get_all_tickers()
    total_unique = len(all_tickers)
    distribution: list[dict] = []

    for theme_id, theme_data in THEMES.items():
        count = len(theme_data["tickers"])
        pct = round((count / total_unique) * 100, 2) if total_unique else 0
        distribution.append({
            "id": theme_id,
            "name": theme_data["name"],
            "stock_count": count,
            "percentage_of_total": pct,
        })

    distribution.sort(key=lambda d: d["stock_count"], reverse=True)
    return distribution
