"""Application configuration using pydantic-settings pattern.

Centralizes all environment-driven configuration with type
validation and default values. Settings are read once and
cached for the lifetime of the process.
"""

from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class AppSettings(BaseSettings):
    """Main application settings sourced from environment variables."""

    app_name: str = "JP Stock Theme Tracker API"
    app_version: str = "2.0.0"
    environment: str = Field(default="development", alias="ENV")
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    allowed_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        alias="ALLOWED_ORIGINS",
    )

    # Authentication
    api_refresh_key: Optional[str] = Field(default=None, alias="API_REFRESH_KEY")
    session_ttl_hours: int = 24

    # Cache
    redis_url: Optional[str] = Field(default=None, alias="REDIS_URL")
    cache_ttl_seconds: int = 300

    # Scheduler
    update_interval_minutes: int = 5
    data_staleness_minutes: int = 60

    # Rate limiting
    rate_limit_max_requests: int = 60
    rate_limit_window_seconds: int = 60

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    @property
    def origins_list(self) -> list[str]:
        """Parse comma-separated origins into a list."""
        return [
            o.strip()
            for o in self.allowed_origins.split(",")
            if o.strip()
        ]

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment.lower() == "development"


@lru_cache(maxsize=1)
def get_settings() -> AppSettings:
    """Return cached application settings instance.

    Uses lru_cache so the settings object is created only
    once and reused for all subsequent calls.
    """
    return AppSettings()
