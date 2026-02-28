"""Health check router for system and dependency monitoring.

Provides endpoints to verify service liveness, readiness,
and the status of external dependencies such as caches
and data directories.
"""

import logging
import os
import platform
import sys
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter

from utils.cache import cache

logger = logging.getLogger(__name__)

router = APIRouter()

PRECOMPUTED_DIR = Path(__file__).parent.parent / "precomputed"
_start_time = datetime.now()


@router.get("/api/health/live")
def liveness_check() -> dict:
    """Lightweight liveness probe.

    Returns immediately with a 200 status to indicate
    the process is running and accepting requests.
    """
    return {
        "status": "alive",
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/api/health/ready")
def readiness_check() -> dict:
    """Readiness probe that verifies critical dependencies.

    Checks whether precomputed data files exist and
    the in-memory cache is operational.
    """
    precomputed_ok = PRECOMPUTED_DIR.exists()
    precomputed_files = (
        len(list(PRECOMPUTED_DIR.glob("*.json")))
        if precomputed_ok
        else 0
    )
    cache_size = cache.size()

    ready = precomputed_ok and precomputed_files > 0
    return {
        "status": "ready" if ready else "degraded",
        "precomputed_dir_exists": precomputed_ok,
        "precomputed_file_count": precomputed_files,
        "cache_entries": cache_size,
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/api/health/system")
def system_info() -> dict:
    """Return system-level information for diagnostics.

    Includes Python version, platform details, uptime,
    and environment metadata useful for debugging.
    """
    uptime_seconds = (datetime.now() - _start_time).total_seconds()
    return {
        "python_version": sys.version,
        "platform": platform.platform(),
        "architecture": platform.machine(),
        "pid": os.getpid(),
        "uptime_seconds": round(uptime_seconds, 1),
        "environment": os.environ.get("ENV", "development"),
        "started_at": _start_time.isoformat(),
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/api/health/db")
def db_status() -> dict:
    """Check data store availability.

    Validates that the data directory is accessible and
    reports file-based storage metrics. This project uses
    file-based caching rather than a traditional database.
    """
    cache_dir = Path(__file__).parent.parent.parent / "cache"
    cache_exists = cache_dir.exists()
    cache_files = len(list(cache_dir.glob("*.json"))) if cache_exists else 0

    return {
        "data_store": "file_cache",
        "cache_dir_exists": cache_exists,
        "cached_file_count": cache_files,
        "memory_cache_entries": cache.size(),
        "status": "connected" if cache_exists else "unavailable",
        "timestamp": datetime.now().isoformat(),
    }
