"""Search router for querying stocks and themes.

Provides full-text-like search across theme names, descriptions,
stock codes, and company names to support the frontend search bar.
"""

import logging

from fastapi import APIRouter, Query

from data.themes import THEMES, get_ticker_name

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/search/stocks")
def search_stocks(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Max results"),
) -> dict:
    """Search stocks by ticker code or company name.

    Performs case-insensitive substring matching against
    both ticker symbols and Japanese company names.
    """
    query_lower = q.lower()
    results: list[dict] = []
    seen: set[str] = set()

    for theme_id, theme_data in THEMES.items():
        for ticker in theme_data["tickers"]:
            if ticker in seen:
                continue
            name = get_ticker_name(theme_id, ticker)
            if query_lower in ticker.lower() or query_lower in name.lower():
                seen.add(ticker)
                results.append({
                    "ticker": ticker,
                    "name": name,
                    "theme_id": theme_id,
                    "theme_name": theme_data["name"],
                })
            if len(results) >= limit:
                break
        if len(results) >= limit:
            break

    logger.debug(f"Stock search q={q!r} returned {len(results)} results")
    return {
        "query": q,
        "total": len(results),
        "results": results,
    }


@router.get("/api/search/themes")
def search_themes(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Max results"),
) -> dict:
    """Search themes by name or description.

    Returns matching themes with their metadata including
    stock count and description.
    """
    query_lower = q.lower()
    results: list[dict] = []

    for theme_id, theme_data in THEMES.items():
        name_match = query_lower in theme_data["name"].lower()
        desc_match = query_lower in theme_data["description"].lower()
        id_match = query_lower in theme_id.lower()

        if name_match or desc_match or id_match:
            results.append({
                "id": theme_id,
                "name": theme_data["name"],
                "description": theme_data["description"],
                "stock_count": len(theme_data["tickers"]),
            })
        if len(results) >= limit:
            break

    logger.debug(f"Theme search q={q!r} returned {len(results)} results")
    return {
        "query": q,
        "total": len(results),
        "results": results,
    }


@router.get("/api/search/all")
def search_all(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Max results per type"),
) -> dict:
    """Unified search across both stocks and themes.

    Returns combined results organized by entity type
    for the frontend omni-search component.
    """
    stock_results = search_stocks(q=q, limit=limit)
    theme_results = search_themes(q=q, limit=limit)

    return {
        "query": q,
        "stocks": stock_results["results"],
        "themes": theme_results["results"],
        "total_stocks": stock_results["total"],
        "total_themes": theme_results["total"],
    }
