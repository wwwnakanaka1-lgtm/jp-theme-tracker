"""Tests for the analytics router and analytics service.

Validates endpoint responses, data structures, and edge cases
for the analytics module using the FastAPI test client.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import APIRouter, FastAPI
from fastapi.testclient import TestClient

from data.themes import THEMES
from routers.analytics import router
from services.analytics_service import (
    calculate_portfolio_metrics,
    calculate_theme_ranking,
    get_sector_distribution,
    get_theme_overlap_matrix,
)

# Verify router is properly configured
assert isinstance(router, APIRouter), "analytics router must be an APIRouter"


# ---------------------------------------------------------------------------
# Build a mini FastAPI app for testing the router endpoints
# ---------------------------------------------------------------------------

_app = FastAPI()
_app.include_router(router)
client = TestClient(_app)


# ---------------------------------------------------------------------------
# Router endpoint tests
# ---------------------------------------------------------------------------

class TestAnalyticsSummaryEndpoint:
    """Tests for @router.get /api/analytics/summary"""

    def test_summary_returns_200(self):
        resp = client.get("/api/analytics/summary?period=1mo")
        assert resp.status_code == 200

    def test_summary_contains_total_themes(self):
        data = client.get("/api/analytics/summary").json()
        assert "total_themes" in data
        assert data["total_themes"] == len(THEMES)

    def test_summary_contains_total_tickers(self):
        data = client.get("/api/analytics/summary").json()
        assert "total_unique_tickers" in data
        assert data["total_unique_tickers"] > 0

    def test_summary_period_passed_through(self):
        data = client.get("/api/analytics/summary?period=3mo").json()
        assert data["period"] == "3mo"

    def test_summary_has_generated_at(self):
        data = client.get("/api/analytics/summary").json()
        assert "generated_at" in data


class TestTopMoversEndpoint:
    """Tests for @router.get /api/analytics/top-movers"""

    def test_top_movers_returns_200(self):
        resp = client.get("/api/analytics/top-movers?period=1mo&limit=5")
        assert resp.status_code == 200

    def test_top_movers_respects_limit(self):
        data = client.get("/api/analytics/top-movers?limit=3").json()
        assert len(data["movers"]) <= 3

    def test_top_movers_default_limit(self):
        data = client.get("/api/analytics/top-movers").json()
        assert data["limit"] == 10


class TestPortfolioEndpoint:
    """Tests for @router.get /api/analytics/portfolio"""

    def test_portfolio_all_themes(self):
        data = client.get("/api/analytics/portfolio").json()
        assert data["selected_themes"] == len(THEMES)

    def test_portfolio_specific_themes(self):
        data = client.get(
            "/api/analytics/portfolio?theme_ids=ai,ev"
        ).json()
        assert data["selected_themes"] == 2


# ---------------------------------------------------------------------------
# Service function tests
# ---------------------------------------------------------------------------

class TestAnalyticsService:
    """Tests for analytics_service module functions."""

    def test_ranking_returns_all_themes(self):
        ranking = calculate_theme_ranking("1mo")
        assert len(ranking) == len(THEMES)

    def test_ranking_has_rank_field(self):
        ranking = calculate_theme_ranking()
        for item in ranking:
            assert "rank" in item

    def test_portfolio_metrics_all(self):
        metrics = calculate_portfolio_metrics()
        assert metrics["selected_themes"] == len(THEMES)
        assert metrics["unique_tickers"] > 0

    def test_portfolio_metrics_subset(self):
        metrics = calculate_portfolio_metrics(["ai", "semiconductor"])
        assert metrics["selected_themes"] == 2

    def test_overlap_matrix_structure(self):
        matrix = get_theme_overlap_matrix()
        assert "total_themes" in matrix
        assert "overlaps" in matrix

    def test_sector_distribution_sums(self):
        dist = get_sector_distribution()
        assert len(dist) == len(THEMES)
        for item in dist:
            assert "stock_count" in item
            assert "percentage_of_total" in item
