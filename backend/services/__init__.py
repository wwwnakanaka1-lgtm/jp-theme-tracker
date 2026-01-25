"""Services module"""

from services.data_fetcher import (
    fetch_stock_data,
    fetch_batch,
    clear_cache,
    get_stock_info,
)

from services.calculator import (
    calculate_return,
    calculate_daily_returns,
    calculate_beta_alpha,
    calculate_theme_return,
    calculate_theme_daily_returns,
    calculate_rsi,
    calculate_ma,
    calculate_volatility,
    get_stock_indicators,
    get_price_history,
)

__all__ = [
    # data_fetcher
    "fetch_stock_data",
    "fetch_batch",
    "clear_cache",
    "get_stock_info",
    # calculator
    "calculate_return",
    "calculate_daily_returns",
    "calculate_beta_alpha",
    "calculate_theme_return",
    "calculate_theme_daily_returns",
    "calculate_rsi",
    "calculate_ma",
    "calculate_volatility",
    "get_stock_indicators",
    "get_price_history",
]
