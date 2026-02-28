"""Data formatting utilities for consistent output.

Provides helper functions to format numbers, dates,
and financial data for display in the frontend or
export files.
"""

from datetime import datetime
from typing import Optional, Union


def format_percent(value: Optional[float], decimals: int = 2) -> str:
    """Format a float as a percentage string.

    Args:
        value: Numeric value to format.
        decimals: Decimal places to include.

    Returns:
        Formatted string like '+12.34%' or '-5.60%'.
    """
    if value is None:
        return "N/A"
    sign = "+" if value >= 0 else ""
    return f"{sign}{value:.{decimals}f}%"


def format_market_cap(value: Optional[int]) -> str:
    """Format market capitalization in human-readable Japanese units.

    Args:
        value: Market cap in JPY.

    Returns:
        Formatted string (e.g. '1.5兆円', '3,200億円').
    """
    if value is None or value == 0:
        return "N/A"

    cho = 1_000_000_000_000  # 1兆
    oku = 100_000_000        # 1億

    if value >= cho:
        return f"{value / cho:.1f}兆円"
    if value >= oku:
        return f"{value / oku:,.0f}億円"
    return f"{value:,}円"


def format_price(value: Optional[float], currency: str = "JPY") -> str:
    """Format a stock price with appropriate precision.

    Args:
        value: Price value.
        currency: Currency code for symbol.

    Returns:
        Formatted price string.
    """
    if value is None:
        return "N/A"
    if currency == "JPY":
        return f"¥{value:,.0f}"
    return f"${value:,.2f}"


def format_date(
    dt: Union[str, datetime, None],
    fmt: str = "%Y-%m-%d",
) -> str:
    """Format a datetime object or ISO string.

    Args:
        dt: Datetime to format.
        fmt: Output format string.

    Returns:
        Formatted date string or 'N/A'.
    """
    if dt is None:
        return "N/A"
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt)
        except ValueError:
            return dt
    return dt.strftime(fmt)


def format_volume(value: Optional[int]) -> str:
    """Format trading volume with thousands separators.

    Args:
        value: Volume integer.

    Returns:
        Comma-separated string or 'N/A'.
    """
    if value is None:
        return "N/A"
    return f"{value:,}"


def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncate text with ellipsis if it exceeds max length.

    Args:
        text: Input text.
        max_length: Maximum allowed length.

    Returns:
        Truncated text with '...' suffix if needed.
    """
    if len(text) <= max_length:
        return text
    return text[: max_length - 3] + "..."


def build_csv_row(*values: Union[str, int, float, None]) -> list[str]:
    """Convert mixed-type values into a list of strings for CSV output.

    Args:
        values: Arbitrary values to convert.

    Returns:
        List of string representations.
    """
    result: list[str] = []
    for v in values:
        if v is None:
            result.append("")
        elif isinstance(v, float):
            result.append(f"{v:.2f}")
        else:
            result.append(str(v))
    return result
