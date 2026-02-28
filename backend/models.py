"""Data models for theme and stock entities.

These models represent the core domain objects used
throughout the application. They are decoupled from
Pydantic schemas to keep persistence logic separate
from API serialization.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Stock:
    """Represents a single traded stock."""
    ticker: str
    name: str
    description: Optional[str] = None
    theme_id: Optional[str] = None
    market_cap: int = 0
    market_cap_category: str = "unknown"
    latest_price: Optional[float] = None
    change_percent: float = 0.0
    rsi: Optional[float] = None
    beta: Optional[float] = None
    alpha: Optional[float] = None

    @property
    def code(self) -> str:
        """Return the numeric part of the ticker."""
        return self.ticker.replace(".T", "")

    def is_large_cap(self) -> bool:
        """Check whether the stock is large-cap or above."""
        return self.market_cap_category in ("mega", "large")


@dataclass
class Theme:
    """Represents an investment theme grouping related stocks."""
    id: str
    name: str
    description: str
    tickers: list[str] = field(default_factory=list)
    ticker_names: dict[str, str] = field(default_factory=dict)
    ticker_descriptions: dict[str, str] = field(default_factory=dict)
    change_percent: float = 0.0
    stock_count: int = 0

    def get_stock_name(self, ticker: str) -> str:
        """Resolve human-readable name for a ticker."""
        return self.ticker_names.get(ticker, ticker)

    def contains(self, ticker: str) -> bool:
        """Check whether the theme contains a given ticker."""
        return ticker in self.tickers


@dataclass
class PricePoint:
    """Single point of price history for charting."""
    date: str
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    close: Optional[float] = None
    volume: Optional[int] = None


@dataclass
class AnalyticsSnapshot:
    """Point-in-time analytics calculation result."""
    period: str
    total_themes: int
    total_tickers: int
    average_return: float = 0.0
    best_theme_id: Optional[str] = None
    worst_theme_id: Optional[str] = None
    generated_at: str = field(
        default_factory=lambda: datetime.now().isoformat()
    )


@dataclass
class UserSession:
    """Tracks an authenticated user session."""
    username: str
    token: str
    created_at: str = field(
        default_factory=lambda: datetime.now().isoformat()
    )
    expires_at: Optional[str] = None
    is_active: bool = True

    def invalidate(self) -> None:
        """Mark session as inactive."""
        self.is_active = False
