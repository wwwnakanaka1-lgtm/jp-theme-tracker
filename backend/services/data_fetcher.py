"""株価データ取得モジュール（yfinance + JSONキャッシュ + メモリキャッシュ + 並列処理）"""

import json
import logging
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
from functools import lru_cache
from pathlib import Path
from typing import Dict, Optional

import pandas as pd
import yfinance as yf

# ロガー設定
logger = logging.getLogger(__name__)

# キャッシュディレクトリ
CACHE_DIR = Path(__file__).parent.parent.parent / "cache"
CACHE_TTL_HOURS = 24

# メモリキャッシュ用の日付キー（1日ごとに更新）
def get_cache_date_key() -> str:
    """当日の日付をキャッシュキーとして返す"""
    return datetime.now().strftime("%Y-%m-%d")


def ensure_cache_dir():
    """キャッシュディレクトリを作成"""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)


def get_cache_path(ticker: str, period: str) -> Path:
    """キャッシュファイルパスを取得"""
    safe_ticker = ticker.replace(".", "_")
    return CACHE_DIR / f"{safe_ticker}_{period}.json"


def is_cache_valid(cache_path: Path) -> bool:
    """キャッシュが有効か確認（24時間TTL）"""
    if not cache_path.exists():
        return False

    mtime = datetime.fromtimestamp(cache_path.stat().st_mtime)
    return datetime.now() - mtime < timedelta(hours=CACHE_TTL_HOURS)


def save_to_cache(cache_path: Path, df: pd.DataFrame):
    """DataFrameをJSONキャッシュに保存"""
    ensure_cache_dir()

    # DataFrameをJSON形式に変換
    cache_data = {
        "timestamp": datetime.now().isoformat(),
        "data": df.reset_index().to_dict(orient="records")
    }

    # 日付をISO形式に変換
    for record in cache_data["data"]:
        if "Date" in record and hasattr(record["Date"], "isoformat"):
            record["Date"] = record["Date"].isoformat()

    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(cache_data, f, ensure_ascii=False, indent=2)


def load_from_cache(cache_path: Path) -> Optional[pd.DataFrame]:
    """JSONキャッシュからDataFrameを読み込み"""
    if not is_cache_valid(cache_path):
        return None

    try:
        with open(cache_path, "r", encoding="utf-8") as f:
            cache_data = json.load(f)

        df = pd.DataFrame(cache_data["data"])

        # Date列をdatetimeに変換してインデックスに設定
        if "Date" in df.columns:
            df["Date"] = pd.to_datetime(df["Date"])
            df.set_index("Date", inplace=True)

        return df
    except Exception:
        return None


# メモリキャッシュ（最大200銘柄×期間）
@lru_cache(maxsize=200)
def _fetch_stock_data_cached(ticker: str, period: str, cache_key: str) -> Optional[tuple]:
    """
    株価データを取得（内部関数、メモリキャッシュ対応）

    Returns:
        tuple形式のデータ（DataFrameはhashableではないため）
    """
    # 1日期間の場合、5日分取得して最新2日を使用（前日比計算のため）
    actual_period = "5d" if period == "1d" else period
    cache_period = period  # キャッシュキーは元のperiodを使用

    cache_path = get_cache_path(ticker, cache_period)

    # JSONキャッシュから読み込み
    cached_df = load_from_cache(cache_path)
    if cached_df is not None:
        # tupleに変換して返す
        return (
            cached_df.index.tolist(),
            cached_df.to_dict(orient="list"),
            list(cached_df.columns)
        )

    # yfinanceからデータ取得
    try:
        stock = yf.Ticker(ticker)
        df = stock.history(period=actual_period)

        if df.empty:
            return None

        # 1日期間の場合、最新2日のみを保持
        if period == "1d" and len(df) >= 2:
            df = df.tail(2)

        # JSONキャッシュに保存
        save_to_cache(cache_path, df)

        # tupleに変換して返す
        return (
            df.index.tolist(),
            df.to_dict(orient="list"),
            list(df.columns)
        )
    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        return None


def fetch_stock_data(ticker: str, period: str = "1mo") -> Optional[pd.DataFrame]:
    """
    株価データを取得（キャッシュ優先）

    Args:
        ticker: 銘柄コード（例: "7203.T"）
        period: 取得期間（1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max）

    Returns:
        DataFrame with columns: Open, High, Low, Close, Volume, Dividends, Stock Splits
    """
    # 日付ベースのキャッシュキーを使用
    cache_key = get_cache_date_key()

    # メモリキャッシュから取得
    result = _fetch_stock_data_cached(ticker, period, cache_key)

    if result is None:
        return None

    # tupleからDataFrameに変換
    index, data, columns = result
    df = pd.DataFrame(data, index=pd.DatetimeIndex(index))
    df.columns = columns

    return df


def fetch_batch(tickers: list[str], period: str = "1mo") -> Dict[str, pd.DataFrame]:
    """
    複数銘柄の株価データをバッチ取得（並列処理版を使用）

    Args:
        tickers: 銘柄コードのリスト
        period: 取得期間

    Returns:
        Dict[ticker, DataFrame]
    """
    # 並列処理版を呼び出す
    return fetch_batch_parallel(tickers, period)


def fetch_batch_parallel(
    tickers: list[str],
    period: str = "1mo",
    max_workers: int = 10
) -> Dict[str, pd.DataFrame]:
    """
    複数銘柄を並列に取得（10並列）

    Args:
        tickers: 銘柄コードのリスト
        period: 取得期間
        max_workers: 最大並列スレッド数

    Returns:
        Dict[ticker, DataFrame]
    """
    result = {}

    # 重複除去
    unique_tickers = list(set(tickers))

    if not unique_tickers:
        return result

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(fetch_stock_data, ticker, period): ticker
            for ticker in unique_tickers
        }
        for future in as_completed(futures):
            ticker = futures[future]
            try:
                df = future.result(timeout=30)
                if df is not None and not df.empty:
                    result[ticker] = df
            except Exception as e:
                logger.warning(f"Failed to fetch {ticker}: {e}")

    return result


def fetch_batch_yfinance(tickers: list[str], period: str = "1mo") -> Dict[str, pd.DataFrame]:
    """
    yfinanceのバッチ機能を使用（最も高速）

    Args:
        tickers: 銘柄コードのリスト
        period: 取得期間

    Returns:
        Dict[ticker, DataFrame]
    """
    if not tickers:
        return {}

    unique_tickers = list(set(tickers))

    try:
        data = yf.download(
            tickers=unique_tickers,
            period=period,
            group_by='ticker',
            threads=True,
            progress=False
        )

        result = {}
        if len(unique_tickers) == 1:
            # 単一銘柄の場合はMultiIndexにならない
            if not data.empty:
                result[unique_tickers[0]] = data
        else:
            for ticker in unique_tickers:
                try:
                    if ticker in data.columns.get_level_values(0):
                        df = data[ticker].dropna()
                        if not df.empty:
                            result[ticker] = df
                except Exception:
                    pass
        return result
    except Exception as e:
        logger.error(f"Batch download failed: {e}")
        # フォールバック: 並列処理版を使用
        return fetch_batch_parallel(unique_tickers, period)


def clear_cache():
    """キャッシュをクリア"""
    if CACHE_DIR.exists():
        for cache_file in CACHE_DIR.glob("*.json"):
            cache_file.unlink()


def get_stock_info(ticker: str) -> Optional[dict]:
    """
    銘柄の基本情報を取得

    Args:
        ticker: 銘柄コード

    Returns:
        dict with stock info (name, sector, etc.)
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        market_cap = info.get("marketCap", 0)
        return {
            "ticker": ticker,
            "name": info.get("shortName", ticker),
            "sector": info.get("sector", ""),
            "industry": info.get("industry", ""),
            "market_cap": market_cap,
            "market_cap_category": classify_market_cap(market_cap),
            "currency": info.get("currency", "JPY"),
        }
    except Exception:
        return None


def classify_market_cap(market_cap: int) -> dict:
    """
    時価総額を日本株向けに分類

    Args:
        market_cap: 時価総額（円）

    Returns:
        dict with category info
    """
    if market_cap is None or market_cap == 0:
        return {"id": "unknown", "label": "不明", "color": "gray"}

    # 日本株向け閾値（円）
    MEGA_CAP = 10_000_000_000_000  # 10兆円
    LARGE_CAP = 1_000_000_000_000  # 1兆円
    MID_CAP = 300_000_000_000     # 3000億円
    SMALL_CAP = 30_000_000_000    # 300億円

    if market_cap >= MEGA_CAP:
        return {"id": "mega", "label": "超大型", "color": "purple"}
    elif market_cap >= LARGE_CAP:
        return {"id": "large", "label": "大型", "color": "blue"}
    elif market_cap >= MID_CAP:
        return {"id": "mid", "label": "中型", "color": "green"}
    elif market_cap >= SMALL_CAP:
        return {"id": "small", "label": "小型", "color": "yellow"}
    else:
        return {"id": "micro", "label": "超小型", "color": "red"}


def get_market_cap_cache_path(ticker: str) -> Path:
    """時価総額キャッシュファイルパスを取得"""
    safe_ticker = ticker.replace(".", "_")
    return CACHE_DIR / f"{safe_ticker}_marketcap.json"


def get_cached_market_cap(ticker: str) -> Optional[dict]:
    """キャッシュから時価総額を取得"""
    cache_path = get_market_cap_cache_path(ticker)
    if not is_cache_valid(cache_path):
        return None

    try:
        with open(cache_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def save_market_cap_cache(ticker: str, data: dict):
    """時価総額をキャッシュに保存"""
    ensure_cache_dir()
    cache_path = get_market_cap_cache_path(ticker)

    cache_data = {
        "timestamp": datetime.now().isoformat(),
        **data
    }

    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(cache_data, f, ensure_ascii=False, indent=2)


def get_market_cap(ticker: str) -> dict:
    """
    時価総額を取得（キャッシュ優先）

    Args:
        ticker: 銘柄コード

    Returns:
        dict with market_cap and category
    """
    # キャッシュから取得
    cached = get_cached_market_cap(ticker)
    if cached:
        return {
            "market_cap": cached.get("market_cap", 0),
            "market_cap_category": cached.get("market_cap_category", classify_market_cap(0))
        }

    # yfinanceから取得
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        market_cap = info.get("marketCap", 0)
        category = classify_market_cap(market_cap)

        # キャッシュに保存
        save_market_cap_cache(ticker, {
            "market_cap": market_cap,
            "market_cap_category": category
        })

        return {
            "market_cap": market_cap,
            "market_cap_category": category
        }
    except Exception:
        return {
            "market_cap": 0,
            "market_cap_category": classify_market_cap(0)
        }
