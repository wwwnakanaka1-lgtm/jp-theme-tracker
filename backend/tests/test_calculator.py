"""Tests for services/calculator.py"""

# Ensure the backend package root is importable
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services.calculator import (
    calculate_bollinger_bands,
    calculate_daily_returns,
    calculate_ma,
    calculate_return,
    calculate_return_from_data,
    calculate_rsi,
    calculate_volatility,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_df(close_prices: list[float]) -> pd.DataFrame:
    """Build a minimal DataFrame with a Close column (and High/Low/Volume)."""
    dates = pd.bdate_range(end="2025-12-31", periods=len(close_prices))
    return pd.DataFrame(
        {
            "Open": close_prices,
            "High": [p * 1.02 for p in close_prices],
            "Low": [p * 0.98 for p in close_prices],
            "Close": close_prices,
            "Volume": [1000] * len(close_prices),
        },
        index=dates,
    )


# ---------------------------------------------------------------------------
# calculate_return
# ---------------------------------------------------------------------------

class TestCalculateReturn:
    def test_positive_return(self):
        df = _make_df([100.0, 110.0, 120.0])
        result = calculate_return(df)
        assert result == pytest.approx(20.0)

    def test_negative_return(self):
        df = _make_df([200.0, 180.0, 160.0])
        result = calculate_return(df)
        assert result == pytest.approx(-20.0)

    def test_zero_return(self):
        df = _make_df([100.0, 120.0, 100.0])
        result = calculate_return(df)
        assert result == pytest.approx(0.0)

    def test_empty_df_returns_zero(self):
        df = pd.DataFrame(columns=["Close"])
        assert calculate_return(df) == 0.0

    def test_none_returns_zero(self):
        assert calculate_return(None) == 0.0

    def test_single_row_returns_zero(self):
        df = _make_df([100.0])
        assert calculate_return(df) == 0.0

    def test_first_close_zero_returns_zero(self):
        df = _make_df([0.0, 100.0, 200.0])
        assert calculate_return(df) == 0.0


# ---------------------------------------------------------------------------
# calculate_daily_returns
# ---------------------------------------------------------------------------

class TestCalculateDailyReturns:
    def test_basic(self):
        df = _make_df([100.0, 110.0, 121.0])
        result = calculate_daily_returns(df)
        # pct_change * 100 => [NaN, 10.0, 10.0]
        assert len(result) == 3
        assert np.isnan(result.iloc[0])
        assert result.iloc[1] == pytest.approx(10.0)
        assert result.iloc[2] == pytest.approx(10.0)

    def test_empty(self):
        result = calculate_daily_returns(pd.DataFrame(columns=["Close"]))
        assert result.empty

    def test_none(self):
        result = calculate_daily_returns(None)
        assert result.empty


# ---------------------------------------------------------------------------
# calculate_rsi
# ---------------------------------------------------------------------------

class TestCalculateRSI:
    def test_rsi_length(self):
        prices = pd.Series(range(1, 32), dtype=float)  # 31 data points
        rsi = calculate_rsi(prices, period=14)
        assert len(rsi) == len(prices)

    def test_rsi_in_range(self):
        np.random.seed(42)
        prices = pd.Series(np.random.uniform(90, 110, 50))
        rsi = calculate_rsi(prices, period=14)
        valid = rsi.dropna()
        assert (valid >= 0).all()
        assert (valid <= 100).all()

    def test_rsi_returns_series_of_correct_type(self):
        # Verify RSI returns a proper pandas Series with float values
        np.random.seed(123)
        prices = pd.Series(np.random.uniform(95, 105, 30))
        rsi = calculate_rsi(prices, period=14)
        assert isinstance(rsi, pd.Series)
        assert rsi.dtype == np.float64

    def test_too_few_data_points(self):
        prices = pd.Series([100.0, 101.0, 99.0])
        rsi = calculate_rsi(prices, period=14)
        assert rsi.empty

    def test_none_input(self):
        rsi = calculate_rsi(None, period=14)
        assert rsi.empty


# ---------------------------------------------------------------------------
# calculate_ma
# ---------------------------------------------------------------------------

class TestCalculateMA:
    def test_basic_ma(self):
        prices = pd.Series([10.0, 20.0, 30.0, 40.0, 50.0])
        ma = calculate_ma(prices, period=3)
        # First 2 values should be NaN, then rolling mean
        assert np.isnan(ma.iloc[0])
        assert np.isnan(ma.iloc[1])
        assert ma.iloc[2] == pytest.approx(20.0)
        assert ma.iloc[3] == pytest.approx(30.0)
        assert ma.iloc[4] == pytest.approx(40.0)

    def test_too_few_data(self):
        prices = pd.Series([10.0, 20.0])
        ma = calculate_ma(prices, period=5)
        assert ma.empty

    def test_none_input(self):
        ma = calculate_ma(None, period=5)
        assert ma.empty


# ---------------------------------------------------------------------------
# calculate_volatility
# ---------------------------------------------------------------------------

class TestCalculateVolatility:
    def test_positive_volatility(self):
        # Prices with variance should yield positive volatility
        prices = [100, 102, 98, 105, 97, 103, 99, 101, 104, 96,
                  100, 102, 98, 105, 97, 103, 99, 101, 104, 96, 100]
        df = _make_df(prices)
        vol = calculate_volatility(df, period=20)
        assert vol > 0.0

    def test_constant_prices_zero_volatility(self):
        # All same price -> std = 0 -> volatility = 0
        df = _make_df([100.0] * 25)
        vol = calculate_volatility(df, period=20)
        assert vol == 0.0

    def test_empty_df(self):
        df = pd.DataFrame(columns=["Close"])
        assert calculate_volatility(df) == 0.0

    def test_none_df(self):
        assert calculate_volatility(None) == 0.0

    def test_too_few_data(self):
        df = _make_df([100.0, 110.0])
        assert calculate_volatility(df, period=20) == 0.0


# ---------------------------------------------------------------------------
# calculate_bollinger_bands
# ---------------------------------------------------------------------------

class TestCalculateBollingerBands:
    def test_band_structure(self):
        prices = pd.Series(np.random.uniform(90, 110, 30))
        bands = calculate_bollinger_bands(prices, period=20)
        assert "middle" in bands
        assert "upper" in bands
        assert "lower" in bands
        assert len(bands["middle"]) == 30

    def test_too_few_data(self):
        prices = pd.Series([100.0, 101.0])
        bands = calculate_bollinger_bands(prices, period=20)
        assert bands == {"middle": [], "upper": [], "lower": []}


# ---------------------------------------------------------------------------
# calculate_return_from_data
# ---------------------------------------------------------------------------

class TestCalculateReturnFromData:
    def test_basic(self):
        df1 = _make_df([100.0, 110.0])  # +10%
        df2 = _make_df([100.0, 120.0])  # +20%
        theme_ret, returns = calculate_return_from_data({"A": df1, "B": df2})
        assert theme_ret == pytest.approx(15.0)
        assert returns["A"] == pytest.approx(10.0)
        assert returns["B"] == pytest.approx(20.0)

    def test_empty_dict(self):
        theme_ret, returns = calculate_return_from_data({})
        assert theme_ret == 0.0
        assert returns == {}

    def test_none_df_in_data(self):
        df1 = _make_df([100.0, 150.0])  # +50%
        theme_ret, returns = calculate_return_from_data({"A": df1, "B": None})
        assert theme_ret == pytest.approx(50.0)
        assert "A" in returns
        assert "B" not in returns
