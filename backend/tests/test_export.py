"""Tests for the export router and export service.

Validates CSV/JSON export endpoints, data integrity,
and formatting service functions.
"""

import csv
import io
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import APIRouter, FastAPI
from fastapi.testclient import TestClient

from data.themes import THEMES
from routers.export import router
from services.export_service import (
    format_stocks_csv,
    format_themes_csv,
    format_themes_json,
    generate_export_filename,
)

# Verify router uses @router decorators
assert isinstance(router, APIRouter), "export router must be an APIRouter"

_app = FastAPI()
_app.include_router(router)
client = TestClient(_app)


# ---------------------------------------------------------------------------
# CSV export endpoint tests
# ---------------------------------------------------------------------------

class TestThemesCsvExport:
    """Tests for @router.get /api/export/themes/csv"""

    def test_csv_returns_200(self):
        resp = client.get("/api/export/themes/csv?period=1mo")
        assert resp.status_code == 200

    def test_csv_content_type(self):
        resp = client.get("/api/export/themes/csv")
        assert "text/csv" in resp.headers["content-type"]

    def test_csv_has_attachment_header(self):
        resp = client.get("/api/export/themes/csv")
        assert "attachment" in resp.headers.get("content-disposition", "")

    def test_csv_has_header_row(self):
        resp = client.get("/api/export/themes/csv")
        reader = csv.reader(io.StringIO(resp.text))
        header = next(reader)
        assert "theme_id" in header
        assert "name" in header

    def test_csv_row_count_matches_themes(self):
        resp = client.get("/api/export/themes/csv")
        reader = csv.reader(io.StringIO(resp.text))
        rows = list(reader)
        # header + data rows
        assert len(rows) == len(THEMES) + 1


class TestStocksCsvExport:
    """Tests for @router.get /api/export/stocks/csv"""

    def test_stocks_csv_returns_200(self):
        resp = client.get("/api/export/stocks/csv")
        assert resp.status_code == 200

    def test_stocks_csv_has_ticker_column(self):
        resp = client.get("/api/export/stocks/csv")
        reader = csv.reader(io.StringIO(resp.text))
        header = next(reader)
        assert "ticker" in header


# ---------------------------------------------------------------------------
# JSON export endpoint tests
# ---------------------------------------------------------------------------

class TestThemesJsonExport:
    """Tests for @router.get /api/export/themes/json"""

    def test_json_returns_200(self):
        resp = client.get("/api/export/themes/json?period=1mo")
        assert resp.status_code == 200

    def test_json_has_themes_list(self):
        data = client.get("/api/export/themes/json").json()
        assert "themes" in data
        assert isinstance(data["themes"], list)

    def test_json_total_matches(self):
        data = client.get("/api/export/themes/json").json()
        assert data["total"] == len(THEMES)

    def test_json_period_included(self):
        data = client.get("/api/export/themes/json?period=3mo").json()
        assert data["period"] == "3mo"


# ---------------------------------------------------------------------------
# Export service function tests
# ---------------------------------------------------------------------------

class TestExportService:
    """Tests for export_service module functions."""

    def test_format_themes_csv_header(self):
        content = format_themes_csv("1mo")
        lines = content.strip().split("\n")
        assert "theme_id" in lines[0]

    def test_format_themes_csv_row_count(self):
        content = format_themes_csv()
        lines = content.strip().split("\n")
        assert len(lines) == len(THEMES) + 1

    def test_format_stocks_csv_all(self):
        content = format_stocks_csv()
        lines = content.strip().split("\n")
        assert len(lines) > 1  # header + at least 1 data row

    def test_format_stocks_csv_filtered(self):
        content = format_stocks_csv("ai")
        lines = content.strip().split("\n")
        # header + 10 AI stocks
        assert len(lines) == 11

    def test_format_themes_json_structure(self):
        data = format_themes_json("6mo")
        assert data["format"] == "json"
        assert data["period"] == "6mo"
        assert "exported_at" in data

    def test_generate_filename_csv(self):
        name = generate_export_filename("themes", "csv", "1mo")
        assert name.startswith("themes_1mo_")
        assert name.endswith(".csv")

    def test_generate_filename_json(self):
        name = generate_export_filename("stocks", "json", "3mo")
        assert name.startswith("stocks_3mo_")
        assert name.endswith(".json")
