"""Pydantic v2 schemas for API request/response validation.

Defines structured models used across routers and services
for consistent data serialization and input validation.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class StockBase(BaseModel):
    """Core stock data shared across responses."""
    code: str = Field(..., description="Ticker symbol (e.g. 7203.T)")
    name: str = Field(..., description="Company name")


class StockDetail(StockBase):
    """Extended stock information with price metrics."""
    change_percent: float = Field(0.0, description="Period return %")
    change_percent_1d: Optional[float] = Field(None, description="1-day return %")
    price: Optional[float] = Field(None, description="Latest price")
    rsi: Optional[float] = Field(None, description="RSI(14)")
    market_cap: Optional[int] = Field(None, description="Market cap in JPY")
    beta: Optional[float] = None
    alpha: Optional[float] = None


class SparklineData(BaseModel):
    """Sparkline chart data for miniature trend visualizations."""
    data: list[float] = Field(default_factory=list)
    period_start_index: int = 0


class ThemeSummary(BaseModel):
    """Compact theme representation for list views."""
    id: str
    name: str
    description: str
    change_percent: float = 0.0
    stock_count: int = 0


class ThemeDetail(ThemeSummary):
    """Full theme detail including constituent stocks."""
    period: str = "1mo"
    change_percent_1d: Optional[float] = None
    stocks: list[StockDetail] = Field(default_factory=list)
    sparkline: Optional[SparklineData] = None


class AnalyticsResponse(BaseModel):
    """Response model for analytics summary endpoint."""
    period: str
    total_themes: int
    total_unique_tickers: int
    average_return: Optional[float] = None
    best_theme: Optional[ThemeSummary] = None
    worst_theme: Optional[ThemeSummary] = None
    generated_at: str = Field(
        default_factory=lambda: datetime.now().isoformat()
    )


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str = "healthy"
    api_version: str = "2.0.0"
    uptime_seconds: Optional[float] = None
    timestamp: str = Field(
        default_factory=lambda: datetime.now().isoformat()
    )


class ExportMeta(BaseModel):
    """Metadata included with export responses."""
    format: str = Field(..., description="csv or json")
    period: str
    total_records: int
    exported_at: str = Field(
        default_factory=lambda: datetime.now().isoformat()
    )


class SearchResult(BaseModel):
    """Individual search result item."""
    entity_type: str = Field(..., description="stock or theme")
    id: str
    name: str
    theme_id: Optional[str] = None
    theme_name: Optional[str] = None


class SearchResponse(BaseModel):
    """Aggregated search response."""
    query: str
    total: int
    results: list[SearchResult] = Field(default_factory=list)
