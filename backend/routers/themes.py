"""テーマ関連APIルーター"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
import pandas as pd

from data.themes import THEMES, get_theme_by_id, get_ticker_name, get_ticker_description
from utils.cache import cache
from services.calculator import (
    calculate_theme_return,
    calculate_theme_daily_returns,
    calculate_return,
    calculate_daily_returns,
    calculate_beta_alpha,
    get_stock_indicators,
)
from services.data_fetcher import fetch_stock_data, get_market_cap

router = APIRouter()


def get_last_trading_date() -> str | None:
    """最後の取引日を取得（日経225から）"""
    try:
        df = fetch_stock_data("^N225", "5d")
        if df is not None and not df.empty:
            last_date = df.index[-1]
            return last_date.strftime("%Y-%m-%d %H:%M")
    except Exception:
        pass
    return None


def get_period_days(period: str) -> int:
    """期間文字列から日数を取得"""
    period_days = {
        "1d": 1,
        "5d": 5,
        "10d": 10,
        "1mo": 21,  # 約1ヶ月の営業日
        "3mo": 63,  # 約3ヶ月の営業日
        "6mo": 126,  # 約6ヶ月の営業日
        "1y": 252,  # 約1年の営業日
        "3y": 756,  # 約3年の営業日
        "5y": 1260,  # 約5年の営業日
    }
    return period_days.get(period, 21)


def get_stock_sparkline(ticker: str, period: str) -> dict:
    """個別銘柄のスパークラインデータを取得（累積リターン）

    常に1年間のデータを返し、選択期間の開始インデックスも返す
    """
    # 常に1年分のデータを取得
    df = fetch_stock_data(ticker, "1y")

    if df is None or df.empty:
        return {"data": [], "period_start_index": 0}

    # 日次リターンを計算
    daily_returns = calculate_daily_returns(df)

    if daily_returns is None or daily_returns.empty:
        return {"data": [], "period_start_index": 0}

    # 累積リターンを計算
    cumulative = (1 + daily_returns / 100).cumprod() - 1
    cumulative = cumulative * 100  # パーセント表示

    # NaNを0に置換してリストに変換
    data = [round(v, 2) if not pd.isna(v) else 0.0 for v in cumulative.values]

    # 選択期間の開始インデックスを計算
    period_days = get_period_days(period)
    total_days = len(data)
    period_start_index = max(0, total_days - period_days)

    return {
        "data": data,
        "period_start_index": period_start_index,
    }


def get_theme_sparkline(tickers: list[str], period: str) -> dict:
    """テーマのスパークラインデータを取得（累積リターン）

    常に1年間のデータを返し、選択期間の開始インデックスも返す
    """
    # 常に1年分のデータを取得
    daily_returns = calculate_theme_daily_returns(tickers, "1y")

    if daily_returns.empty:
        return {"data": [], "period_start_index": 0}

    # 累積リターンを計算
    cumulative = (1 + daily_returns / 100).cumprod() - 1
    cumulative = cumulative * 100  # パーセント表示

    # NaNを0に置換してリストに変換
    data = [round(v, 2) if not pd.isna(v) else 0.0 for v in cumulative.values]

    # 選択期間の開始インデックスを計算
    period_days = get_period_days(period)
    total_days = len(data)
    period_start_index = max(0, total_days - period_days)

    return {
        "data": data,
        "period_start_index": period_start_index,
    }


@router.get("/api/themes")
def get_themes(period: str = Query("1mo", description="期間: 1d, 5d, 1mo, 3mo, 6mo, 1y")):
    """
    全テーマの騰落率ランキングを取得

    Returns:
        騰落率順にソートされたテーマ一覧
    """
    # キャッシュチェック（5分間有効）
    cache_key = f"themes:{period}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    themes_with_returns = []

    for theme_id, theme_data in THEMES.items():
        try:
            theme_return, stock_returns = calculate_theme_return(
                theme_data["tickers"],
                period
            )

            # 1日騰落率も取得（選択期間が1d以外の場合）
            change_percent_1d = None
            if period != "1d":
                theme_return_1d, _ = calculate_theme_return(
                    theme_data["tickers"],
                    "1d"
                )
                change_percent_1d = theme_return_1d

            # Top 3 stocks by change_percent
            top_stocks = []
            sorted_stocks = sorted(
                stock_returns.items(),
                key=lambda x: x[1],
                reverse=True
            )[:3]
            for ticker, change in sorted_stocks:
                top_stocks.append({
                    "code": ticker,
                    "name": get_ticker_name(theme_id, ticker),
                    "change_percent": round(change, 2),
                })

            # スパークラインデータを取得
            sparkline = get_theme_sparkline(theme_data["tickers"], period)

            themes_with_returns.append({
                "id": theme_id,
                "name": theme_data["name"],
                "description": theme_data["description"],
                "change_percent": theme_return,
                "change_percent_1d": change_percent_1d,
                "stock_count": len(theme_data["tickers"]),
                "top_stocks": top_stocks,
                "sparkline": sparkline,
            })
        except Exception as e:
            # エラーが発生してもスキップして続行
            themes_with_returns.append({
                "id": theme_id,
                "name": theme_data["name"],
                "description": theme_data["description"],
                "change_percent": 0.0,
                "change_percent_1d": None,
                "stock_count": len(theme_data["tickers"]),
                "top_stocks": [],
                "sparkline": [],
                "error": str(e),
            })

    # 騰落率で降順ソート
    themes_with_returns.sort(key=lambda x: x["change_percent"], reverse=True)

    result = {
        "period": period,
        "themes": themes_with_returns,
        "total": len(themes_with_returns),
        "last_updated": get_last_trading_date(),
    }

    # キャッシュに保存（5分間）
    cache.set(cache_key, result, ttl_seconds=300)

    return result


@router.get("/api/themes/{theme_id}")
def get_theme_detail(
    theme_id: str,
    period: str = Query("1mo", description="期間: 1d, 5d, 1mo, 3mo, 6mo, 1y")
):
    """
    テーマ詳細を取得（構成銘柄の騰落率含む）

    Args:
        theme_id: テーマID
        period: 取得期間

    Returns:
        テーマ詳細と構成銘柄情報
    """
    # キャッシュチェック（5分間有効）
    cache_key = f"theme_detail:{theme_id}:{period}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    theme = get_theme_by_id(theme_id)

    if not theme:
        raise HTTPException(status_code=404, detail=f"Theme not found: {theme_id}")

    # テーマの騰落率と個別銘柄の騰落率を計算
    theme_return, stock_returns = calculate_theme_return(
        theme["tickers"],
        period
    )

    # テーマの日次リターンを計算
    theme_daily_returns = calculate_theme_daily_returns(
        theme["tickers"],
        period
    )

    # 1日騰落率も計算（選択期間が1d以外の場合）
    stock_returns_1d = {}
    if period != "1d":
        _, stock_returns_1d = calculate_theme_return(theme["tickers"], "1d")

    # 各銘柄の詳細情報を取得
    stocks = []
    for ticker in theme["tickers"]:
        stock_name = get_ticker_name(theme_id, ticker)
        stock_return = stock_returns.get(ticker, 0.0)
        stock_return_1d = stock_returns_1d.get(ticker) if period != "1d" else None

        # 個別株の日次リターン
        df = fetch_stock_data(ticker, period)
        stock_daily_returns = calculate_daily_returns(df) if df is not None else None

        # ベータ・アルファを計算
        beta_alpha = {"beta": None, "alpha": None, "r_squared": None}
        if stock_daily_returns is not None and not stock_daily_returns.empty and not theme_daily_returns.empty:
            beta_alpha = calculate_beta_alpha(stock_daily_returns, theme_daily_returns)

        # 基本指標を取得
        indicators = get_stock_indicators(ticker, period)

        # 時価総額を取得
        market_cap_data = get_market_cap(ticker)

        # スパークラインデータを取得
        sparkline = get_stock_sparkline(ticker, period)

        stocks.append({
            "code": ticker,
            "name": stock_name,
            "description": get_ticker_description(theme_id, ticker),
            "change_percent": round(stock_return, 2),
            "change_percent_1d": round(stock_return_1d, 2) if stock_return_1d is not None else None,
            "beta": beta_alpha.get("beta"),
            "alpha": beta_alpha.get("alpha"),
            "r_squared": beta_alpha.get("r_squared"),
            "price": indicators["latest_price"] if indicators else None,
            "rsi": indicators["rsi"] if indicators else None,
            "market_cap": market_cap_data.get("market_cap"),
            "market_cap_category": market_cap_data.get("market_cap_category"),
            "sparkline": sparkline,
        })

    # 騰落率で降順ソート
    stocks.sort(key=lambda x: x["change_percent"], reverse=True)

    result = {
        "id": theme_id,
        "name": theme["name"],
        "description": theme["description"],
        "period": period,
        "change_percent": theme_return,
        "stocks": stocks,
        "stock_count": len(stocks),
    }

    # キャッシュに保存（5分間）
    cache.set(cache_key, result, ttl_seconds=300)

    return result


@router.get("/api/themes/{theme_id}/history")
def get_theme_history(
    theme_id: str,
    period: str = Query("1mo", description="期間: 1d, 5d, 1mo, 3mo, 6mo, 1y")
):
    """
    テーマの価格推移履歴を取得（チャート用）

    Args:
        theme_id: テーマID
        period: 取得期間

    Returns:
        日次の騰落率推移
    """
    theme = get_theme_by_id(theme_id)

    if not theme:
        raise HTTPException(status_code=404, detail=f"Theme not found: {theme_id}")

    daily_returns = calculate_theme_daily_returns(theme["tickers"], period)

    if daily_returns.empty:
        return {
            "id": theme_id,
            "name": theme["name"],
            "period": period,
            "history": [],
        }

    # 累積リターンを計算
    cumulative = (1 + daily_returns / 100).cumprod() - 1
    cumulative = cumulative * 100  # パーセント表示

    history = []
    for date, value in cumulative.items():
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "cumulative_return": round(value, 2) if not pd.isna(value) else 0.0,
        })

    return {
        "id": theme_id,
        "name": theme["name"],
        "period": period,
        "history": history,
    }


@router.get("/api/heatmap")
def get_heatmap_data(
    period: str = Query("1mo", description="期間: 1d, 5d, 1mo, 3mo, 6mo, 1y")
):
    """
    時価総額別ヒートマップデータを取得

    Args:
        period: 取得期間

    Returns:
        時価総額カテゴリ別の銘柄一覧
    """
    # キャッシュチェック（5分間有効）
    cache_key = f"heatmap:{period}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    from services.data_fetcher import get_market_cap, classify_market_cap

    stocks_by_category = {
        "mega": [],
        "large": [],
        "mid": [],
        "small": [],
        "micro": [],
        "unknown": [],
    }

    for theme_id, theme_data in THEMES.items():
        # テーマの騰落率を計算
        theme_return, stock_returns = calculate_theme_return(
            theme_data["tickers"],
            period
        )

        for ticker in theme_data["tickers"]:
            stock_return = stock_returns.get(ticker, 0.0)
            market_cap_data = get_market_cap(ticker)
            category = market_cap_data.get("market_cap_category", {})
            category_id = category.get("id", "unknown")

            stock_info = {
                "code": ticker,
                "name": get_ticker_name(theme_id, ticker),
                "theme_id": theme_id,
                "theme_name": theme_data["name"],
                "change_percent": round(stock_return, 2),
                "market_cap": market_cap_data.get("market_cap", 0),
                "market_cap_category": category,
            }

            # 重複チェック（同じ銘柄が複数テーマにある場合）
            existing_codes = [s["code"] for s in stocks_by_category[category_id]]
            if ticker not in existing_codes:
                stocks_by_category[category_id].append(stock_info)

    # 各カテゴリを騰落率でソート
    for category_id in stocks_by_category:
        stocks_by_category[category_id].sort(
            key=lambda x: x["change_percent"],
            reverse=True
        )

    result = {
        "period": period,
        "categories": {
            "mega": {
                "id": "mega",
                "label": "超大型",
                "threshold": "10兆円以上",
                "stocks": stocks_by_category["mega"],
                "count": len(stocks_by_category["mega"]),
            },
            "large": {
                "id": "large",
                "label": "大型",
                "threshold": "1兆円〜10兆円",
                "stocks": stocks_by_category["large"],
                "count": len(stocks_by_category["large"]),
            },
            "mid": {
                "id": "mid",
                "label": "中型",
                "threshold": "3000億円〜1兆円",
                "stocks": stocks_by_category["mid"],
                "count": len(stocks_by_category["mid"]),
            },
            "small": {
                "id": "small",
                "label": "小型",
                "threshold": "300億円〜3000億円",
                "stocks": stocks_by_category["small"],
                "count": len(stocks_by_category["small"]),
            },
            "micro": {
                "id": "micro",
                "label": "超小型",
                "threshold": "300億円未満",
                "stocks": stocks_by_category["micro"],
                "count": len(stocks_by_category["micro"]),
            },
        },
        "last_updated": get_last_trading_date(),
    }

    # キャッシュに保存（5分間）
    cache.set(cache_key, result, ttl_seconds=300)

    return result


@router.get("/api/heatmap/sector")
def get_sector_heatmap_data(
    period: str = Query("1mo", description="期間: 1d, 5d, 1mo, 3mo, 6mo, 1y")
):
    """
    セクター（テーマ）別ヒートマップデータを取得

    Args:
        period: 取得期間

    Returns:
        セクター別の銘柄一覧とセクター平均騰落率
    """
    # キャッシュチェック（5分間有効）
    cache_key = f"heatmap_sector:{period}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    sectors = []

    for theme_id, theme_data in THEMES.items():
        # テーマの騰落率を計算
        theme_return, stock_returns = calculate_theme_return(
            theme_data["tickers"],
            period
        )

        # 各銘柄の情報を取得
        stocks = []
        for ticker in theme_data["tickers"]:
            stock_return = stock_returns.get(ticker, 0.0)
            market_cap_data = get_market_cap(ticker)

            stocks.append({
                "code": ticker,
                "name": get_ticker_name(theme_id, ticker),
                "change_percent": round(stock_return, 2),
                "market_cap": market_cap_data.get("market_cap", 0),
                "market_cap_category": market_cap_data.get("market_cap_category"),
            })

        # 騰落率でソート
        stocks.sort(key=lambda x: x["change_percent"], reverse=True)

        sectors.append({
            "id": theme_id,
            "name": theme_data["name"],
            "description": theme_data["description"],
            "average_change": theme_return,
            "stocks": stocks,
            "stock_count": len(stocks),
        })

    # セクター平均騰落率でソート
    sectors.sort(key=lambda x: x["average_change"], reverse=True)

    result = {
        "period": period,
        "sectors": sectors,
        "total_sectors": len(sectors),
        "last_updated": get_last_trading_date(),
    }

    # キャッシュに保存（5分間）
    cache.set(cache_key, result, ttl_seconds=300)

    return result


