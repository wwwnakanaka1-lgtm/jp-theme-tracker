"""Tests for data/themes.py"""


import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from data.themes import (
    THEMES,
    get_all_tickers,
    get_theme_by_id,
    get_theme_names,
    get_theme_tickers,
    get_ticker_description,
    get_ticker_info,
    get_ticker_name,
)

# ---------------------------------------------------------------------------
# THEMES structure
# ---------------------------------------------------------------------------

class TestThemesStructure:
    def test_themes_has_20_entries(self):
        assert len(THEMES) == 20

    def test_each_theme_has_required_fields(self):
        required_fields = {"id", "name", "description", "tickers", "ticker_names"}
        for theme_id, theme_data in THEMES.items():
            missing = required_fields - set(theme_data.keys())
            assert not missing, (
                f"Theme '{theme_id}' is missing fields: {missing}"
            )

    def test_each_theme_has_10_tickers(self):
        for theme_id, theme_data in THEMES.items():
            assert len(theme_data["tickers"]) == 10, (
                f"Theme '{theme_id}' has {len(theme_data['tickers'])} tickers, expected 10"
            )

    def test_ticker_names_match_tickers(self):
        """Every ticker in the list must have a corresponding name."""
        for theme_id, theme_data in THEMES.items():
            for ticker in theme_data["tickers"]:
                assert ticker in theme_data["ticker_names"], (
                    f"Theme '{theme_id}': ticker '{ticker}' has no name entry"
                )

    def test_theme_id_matches_dict_key(self):
        for key, theme_data in THEMES.items():
            assert theme_data["id"] == key


# ---------------------------------------------------------------------------
# get_theme_by_id
# ---------------------------------------------------------------------------

class TestGetThemeById:
    def test_existing_theme(self):
        result = get_theme_by_id("ai")
        assert result is not None
        assert result["id"] == "ai"
        assert result["name"] == "AI\u30fb\u4eba\u5de5\u77e5\u80fd"

    def test_another_theme(self):
        result = get_theme_by_id("semiconductor")
        assert result is not None
        assert result["id"] == "semiconductor"

    def test_nonexistent_theme(self):
        assert get_theme_by_id("nonexistent") is None

    def test_empty_string(self):
        assert get_theme_by_id("") is None


# ---------------------------------------------------------------------------
# get_all_tickers
# ---------------------------------------------------------------------------

class TestGetAllTickers:
    def test_returns_list(self):
        result = get_all_tickers()
        assert isinstance(result, list)

    def test_no_duplicates(self):
        result = get_all_tickers()
        assert len(result) == len(set(result))

    def test_all_tickers_end_with_dot_t(self):
        for ticker in get_all_tickers():
            assert ticker.endswith(".T"), f"Ticker '{ticker}' does not end with .T"

    def test_count_is_reasonable(self):
        # 20 themes * 10 tickers = 200 max, minus duplicates
        result = get_all_tickers()
        assert len(result) > 100  # there should be many unique tickers
        assert len(result) <= 200


# ---------------------------------------------------------------------------
# get_ticker_name
# ---------------------------------------------------------------------------

class TestGetTickerName:
    def test_known_ticker(self):
        name = get_ticker_name("ai", "6758.T")
        assert name == "\u30bd\u30cb\u30fc\u30b0\u30eb\u30fc\u30d7"

    def test_unknown_ticker_returns_ticker(self):
        name = get_ticker_name("ai", "9999.T")
        assert name == "9999.T"

    def test_unknown_theme_returns_ticker(self):
        name = get_ticker_name("nonexistent", "7203.T")
        assert name == "7203.T"


# ---------------------------------------------------------------------------
# get_theme_names
# ---------------------------------------------------------------------------

class TestGetThemeNames:
    def test_returns_20_names(self):
        names = get_theme_names()
        assert len(names) == 20

    def test_contains_known_themes(self):
        names = get_theme_names()
        assert "ai" in names
        assert "semiconductor" in names
        assert "ev" in names


# ---------------------------------------------------------------------------
# get_theme_tickers
# ---------------------------------------------------------------------------

class TestGetThemeTickers:
    def test_existing_theme(self):
        tickers = get_theme_tickers("ai")
        assert len(tickers) == 10
        assert "6758.T" in tickers

    def test_nonexistent_theme(self):
        assert get_theme_tickers("nonexistent") == []


# ---------------------------------------------------------------------------
# get_ticker_description
# ---------------------------------------------------------------------------

class TestGetTickerDescription:
    def test_known_ticker(self):
        desc = get_ticker_description("ai", "6758.T")
        assert desc is not None
        assert len(desc) > 0

    def test_unknown_ticker(self):
        desc = get_ticker_description("ai", "9999.T")
        assert desc is None

    def test_unknown_theme(self):
        desc = get_ticker_description("nonexistent", "6758.T")
        assert desc is None


# ---------------------------------------------------------------------------
# get_ticker_info
# ---------------------------------------------------------------------------

class TestGetTickerInfo:
    def test_known_ticker(self):
        info = get_ticker_info("7203.T")
        assert info is not None
        assert info["ticker"] == "7203.T"
        assert "theme_id" in info
        assert "theme_name" in info
        assert "name" in info

    def test_unknown_ticker(self):
        assert get_ticker_info("0000.T") is None
