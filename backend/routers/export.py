"""Export router for CSV and JSON data export.

Provides endpoints to download theme and stock data in
various formats for offline analysis or integration with
external tools.
"""

import csv
import io
import logging
from datetime import datetime

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from data.themes import THEMES, get_ticker_name

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/export/themes/csv")
def export_themes_csv(
    period: str = Query("1mo", description="Period for export"),
) -> StreamingResponse:
    """Export all themes as a CSV file.

    Each row contains theme id, name, description, and stock count.
    The response streams as a downloadable CSV attachment.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["theme_id", "name", "description", "stock_count"])

    for theme_id, theme_data in THEMES.items():
        writer.writerow([
            theme_id,
            theme_data["name"],
            theme_data["description"],
            len(theme_data["tickers"]),
        ])

    output.seek(0)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"themes_{period}_{timestamp}.csv"
    logger.info(f"Exporting themes CSV: {filename}")

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/api/export/themes/json")
def export_themes_json(
    period: str = Query("1mo", description="Period for export"),
) -> dict:
    """Export all themes as a JSON document.

    Returns a structured JSON with metadata and theme list
    suitable for programmatic consumption.
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

    logger.info(f"Exporting themes JSON for period={period}")
    return {
        "period": period,
        "exported_at": datetime.now().isoformat(),
        "total": len(themes_list),
        "themes": themes_list,
    }


@router.get("/api/export/stocks/csv")
def export_stocks_csv() -> StreamingResponse:
    """Export all tracked stocks as a CSV file.

    Iterates through every theme and outputs each stock's
    ticker, name, and parent theme.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ticker", "name", "theme_id", "theme_name"])

    seen: set[str] = set()
    for theme_id, theme_data in THEMES.items():
        for ticker in theme_data["tickers"]:
            if ticker not in seen:
                seen.add(ticker)
                writer.writerow([
                    ticker,
                    get_ticker_name(theme_id, ticker),
                    theme_id,
                    theme_data["name"],
                ])

    output.seek(0)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"stocks_{timestamp}.csv"
    logger.info(f"Exporting stocks CSV: {filename}")

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
