"""Tests for utils/security.py"""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import HTTPException

from utils.security import (
    VALID_PERIODS,
    sanitize_filename,
    validate_period,
    validate_stock_code,
    validate_theme_id,
)

# ---------------------------------------------------------------------------
# validate_period
# ---------------------------------------------------------------------------

class TestValidatePeriod:
    @pytest.mark.parametrize("period", sorted(VALID_PERIODS))
    def test_valid_periods(self, period):
        assert validate_period(period) == period

    @pytest.mark.parametrize("bad", ["2d", "10y", "", "1M", "month", "1 mo"])
    def test_invalid_periods_raise(self, bad):
        with pytest.raises(HTTPException) as exc_info:
            validate_period(bad)
        assert exc_info.value.status_code == 400


# ---------------------------------------------------------------------------
# validate_stock_code
# ---------------------------------------------------------------------------

class TestValidateStockCode:
    def test_four_digit_code(self):
        assert validate_stock_code("7203") == "7203.T"

    def test_code_with_dot_t(self):
        assert validate_stock_code("7203.T") == "7203.T"

    def test_code_with_whitespace(self):
        assert validate_stock_code("  7203  ") == "7203.T"

    @pytest.mark.parametrize("bad", [
        "123",      # too short
        "12345",    # too long
        "ABCD",     # letters
        "7203.N",   # wrong suffix
        "",         # empty
        "72 03",    # space in middle
    ])
    def test_invalid_codes_raise(self, bad):
        with pytest.raises(HTTPException) as exc_info:
            validate_stock_code(bad)
        assert exc_info.value.status_code == 400


# ---------------------------------------------------------------------------
# validate_theme_id
# ---------------------------------------------------------------------------

class TestValidateThemeId:
    @pytest.mark.parametrize("valid_id", [
        "ai",
        "semiconductor",
        "5g-telecom",
        "defense-space",
        "real-estate",
        "food_beverage",
        "ABC123",
    ])
    def test_valid_ids(self, valid_id):
        assert validate_theme_id(valid_id) == valid_id

    @pytest.mark.parametrize("bad_id", [
        "ai theme",        # space
        "theme/attack",    # slash
        "../etc/passwd",   # path traversal
        "theme<script>",   # html
        "",                # empty (won't match the pattern)
    ])
    def test_invalid_ids_raise(self, bad_id):
        with pytest.raises(HTTPException) as exc_info:
            validate_theme_id(bad_id)
        assert exc_info.value.status_code == 400


# ---------------------------------------------------------------------------
# sanitize_filename
# ---------------------------------------------------------------------------

class TestSanitizeFilename:
    def test_clean_filename_unchanged(self):
        assert sanitize_filename("report.csv") == "report.csv"

    def test_slashes_replaced(self):
        result = sanitize_filename("path/to\\file.txt")
        assert "/" not in result
        assert "\\" not in result

    def test_double_dots_replaced(self):
        result = sanitize_filename("../../etc/passwd")
        assert ".." not in result

    def test_angle_brackets_replaced(self):
        result = sanitize_filename("<script>.html")
        assert "<" not in result
        assert ">" not in result

    def test_special_chars_replaced(self):
        result = sanitize_filename('file:name|test?"star*')
        assert ":" not in result
        assert "|" not in result
        assert "?" not in result
        assert "*" not in result
        assert '"' not in result

    def test_null_byte_replaced(self):
        result = sanitize_filename("file\x00name.txt")
        assert "\x00" not in result
