"""Shared pytest fixtures for the JP Theme Tracker test suite.

Provides reusable fixtures including the FastAPI test client,
sample theme data, and mock stock DataFrames.
"""

import sys
from pathlib import Path

import pandas as pd
import pytest

# Ensure backend root is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))



@pytest.fixture
def sample_theme() -> dict:
    """Return a minimal theme dict for testing."""
    return {
        "id": "test-theme",
        "name": "Test Theme",
        "description": "A theme for unit tests",
        "tickers": ["7203.T", "6758.T", "9984.T"],
        "ticker_names": {
            "7203.T": "Toyota",
            "6758.T": "Sony",
            "9984.T": "SoftBank",
        },
        "ticker_descriptions": {
            "7203.T": "Auto manufacturer",
            "6758.T": "Electronics conglomerate",
            "9984.T": "Investment company",
        },
    }


@pytest.fixture
def sample_stock_df() -> pd.DataFrame:
    """Return a simple stock price DataFrame."""
    dates = pd.bdate_range(end="2025-12-31", periods=30)
    prices = [100 + i * 0.5 for i in range(30)]
    return pd.DataFrame(
        {
            "Open": prices,
            "High": [p * 1.01 for p in prices],
            "Low": [p * 0.99 for p in prices],
            "Close": prices,
            "Volume": [10000] * 30,
        },
        index=dates,
    )


@pytest.fixture
def empty_df() -> pd.DataFrame:
    """Return an empty DataFrame with expected columns."""
    return pd.DataFrame(columns=["Open", "High", "Low", "Close", "Volume"])


@pytest.fixture
def sample_periods() -> list[str]:
    """Return the list of valid period strings."""
    return ["1d", "5d", "10d", "1mo", "3mo", "6mo", "1y", "3y", "5y"]
