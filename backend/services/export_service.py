"""Export data formatting service for CSV and JSON output.

Handles the transformation of raw theme and stock data
into structured export formats with proper encoding
and metadata.
"""

import csv
import io
import logging
from datetime import datetime
from typing import Any

from data.themes import THEMES, get_ticker_name

logger = logging.getLogger(__name__)


def format_themes_csv(period: str = "1mo") -> str:
    """Generate CSV content for all themes.

    Args:
        period: The analysis period label to include.

    Returns:
        CSV-formatted string with header row and data rows.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "theme_id", "name", "description", "stock_count", "period",
    ])

    for theme_id, theme_data in THEMES.items():
        writer.writerow([
            theme_id,
            theme_data["name"],
            theme_data["description"],
            len(theme_data["tickers"]),
            period,
        ])

    return output.getvalue()


def format_stocks_csv(theme_id: str | None = None) -> str:
    """Generate CSV content for stocks, optionally filtered by theme.

    Args:
        theme_id: If provided, only export stocks from this theme.

    Returns:
        CSV-formatted string.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ticker", "name", "theme_id", "theme_name"])

    seen: set[str] = set()
    themes_to_export = (
        {theme_id: THEMES[theme_id]}
        if theme_id and theme_id in THEMES
        else THEMES
    )

    for tid, theme_data in themes_to_export.items():
        for ticker in theme_data["tickers"]:
            if ticker not in seen:
                seen.add(ticker)
                writer.writerow([
                    ticker,
                    get_ticker_name(tid, ticker),
                    tid,
                    theme_data["name"],
                ])

    return output.getvalue()


def format_themes_json(period: str = "1mo") -> dict[str, Any]:
    """Generate structured JSON export for all themes.

    Args:
        period: Analysis period label.

    Returns:
        Dictionary ready for JSON serialization.
    """
    themes_list: list[dict] = []
    for theme_id, theme_data in THEMES.items():
        themes_list.append({
            "id": theme_id,
            "name": theme_data["name"],
            "description": theme_data["description"],
            "stock_count": len(theme_data["tickers"]),
            "tickers": theme_data["tickers"],
        })

    return {
        "format": "json",
        "period": period,
        "exported_at": datetime.now().isoformat(),
        "total": len(themes_list),
        "themes": themes_list,
    }


def generate_export_filename(
    entity: str,
    fmt: str,
    period: str = "1mo",
) -> str:
    """Create a timestamped filename for downloads.

    Args:
        entity: Type of data (themes, stocks).
        fmt: File format extension (csv, json).
        period: Period label to include in the name.

    Returns:
        Formatted filename string.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{entity}_{period}_{timestamp}.{fmt}"
