"""銘柄関連APIルーター"""

from fastapi import APIRouter, HTTPException, Query
import pandas as pd

from data.themes import get_ticker_info, get_all_tickers, THEMES
from utils.cache import cache
from services.calculator import (
    get_stock_indicators,
    get_price_history,
    calculate_daily_returns,
    calculate_theme_daily_returns,
    calculate_beta_alpha,
    calculate_return,
    calculate_ma,
    calculate_rsi,
    calculate_bollinger_bands,
    calculate_ichimoku,
)
from services.data_fetcher import fetch_stock_data, get_stock_info

router = APIRouter()


# 日経225ティッカー
NIKKEI_TICKER = "^N225"


def get_period_days(period: str) -> int:
    """期間文字列から日数を取得"""
    period_days = {
        "1d": 1,
        "5d": 5,
        "10d": 10,
        "1mo": 21,
        "3mo": 63,
        "6mo": 126,
        "1y": 252,
    }
    return period_days.get(period, 21)


@router.get("/api/nikkei225")
def get_nikkei225(
    period: str = Query("1mo", description="期間: 1d, 5d, 1mo, 3mo, 6mo, 1y")
):
    """
    日経225指数の情報を取得

    Args:
        period: 取得期間

    Returns:
        日経225の現在値、騰落率、スパークラインデータ
    """
    # キャッシュチェック（5分間有効）
    cache_key = f"nikkei225:{period}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    # 騰落率計算用に選択期間のデータを取得
    df = fetch_stock_data(NIKKEI_TICKER, period)

    if df is None or df.empty:
        return {
            "name": "日経225",
            "ticker": NIKKEI_TICKER,
            "period": period,
            "price": None,
            "change_percent": 0.0,
            "change_percent_1d": None,
            "sparkline": {"data": [], "period_start_index": 0},
            "error": "データ取得失敗",
        }

    # 現在値
    latest_price = float(df["Close"].iloc[-1])

    # 騰落率を計算
    change_percent = calculate_return(df)

    # 1日騰落率も取得（選択期間が1d以外の場合）
    change_percent_1d = None
    if period != "1d":
        df_1d = fetch_stock_data(NIKKEI_TICKER, "1d")
        if df_1d is not None and not df_1d.empty:
            change_percent_1d = round(calculate_return(df_1d), 2)

    # スパークライン用に常に1年分のデータを取得
    sparkline_df = fetch_stock_data(NIKKEI_TICKER, "1y")
    sparkline_data = []
    period_start_index = 0

    if sparkline_df is not None and not sparkline_df.empty:
        sparkline_returns = calculate_daily_returns(sparkline_df)
        if sparkline_returns is not None and not sparkline_returns.empty:
            cumulative = (1 + sparkline_returns / 100).cumprod() - 1
            cumulative = cumulative * 100
            sparkline_data = [round(v, 2) if not pd.isna(v) else 0.0 for v in cumulative.values]

            # 選択期間の開始インデックスを計算
            period_days = get_period_days(period)
            total_days = len(sparkline_data)
            period_start_index = max(0, total_days - period_days)

    result = {
        "name": "日経225",
        "ticker": NIKKEI_TICKER,
        "period": period,
        "price": round(latest_price, 2),
        "change_percent": round(change_percent, 2),
        "change_percent_1d": change_percent_1d,
        "sparkline": {
            "data": sparkline_data,
            "period_start_index": period_start_index,
        },
    }

    # キャッシュに保存（5分間）
    cache.set(cache_key, result, ttl_seconds=300)

    return result


@router.get("/api/stocks/{code}")
def get_stock_detail(
    code: str,
    period: str = Query("1mo", description="期間: 1d, 5d, 1mo, 3mo, 6mo, 1y")
):
    """
    銘柄詳細を取得

    Args:
        code: 銘柄コード（例: 7203.T または 7203）
        period: 取得期間

    Returns:
        銘柄詳細情報（価格データ、指標含む）
    """
    # .Tが付いていなければ追加
    ticker = code if code.endswith(".T") else f"{code}.T"

    # キャッシュチェック（5分間有効）
    cache_key = f"stock_detail:{ticker}:{period}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    # 株価データを取得（指標計算用）
    df = fetch_stock_data(ticker, period)

    # チャート用データ：3か月以下の場合は常に3か月分を取得
    period_days = get_period_days(period)
    chart_period = "3mo" if period_days <= 63 else period
    chart_df = fetch_stock_data(ticker, chart_period)

    if df is None or df.empty:
        raise HTTPException(status_code=404, detail=f"Stock not found: {ticker}")

    # 基本指標を取得
    indicators = get_stock_indicators(ticker, period)

    if not indicators:
        raise HTTPException(status_code=404, detail=f"Failed to get indicators for: {ticker}")

    # 銘柄の基本情報を取得
    ticker_info = get_ticker_info(ticker)

    # yfinanceから追加情報を取得
    yf_info = get_stock_info(ticker)

    # 価格履歴を取得（チャート用期間で取得）
    price_history = get_price_history(ticker, chart_period)

    # 選択期間の開始インデックスを計算
    total_days = len(price_history)
    selected_period_start_index = max(0, total_days - period_days)

    # チャート用インジケーター計算（chart_dfを使用）
    chart_close = chart_df["Close"] if chart_df is not None and not chart_df.empty else df["Close"]

    # 移動平均（MA20, MA75, MA200）
    ma20 = calculate_ma(chart_close, 20)
    ma75 = calculate_ma(chart_close, 75)
    ma200 = calculate_ma(chart_close, 200)

    def to_list(s):
        if s is None or s.empty:
            return []
        import numpy as np
        return [round(v, 2) if pd.notna(v) and not np.isnan(v) else None for v in s.values]

    # RSI
    rsi_series = calculate_rsi(chart_close)

    # ボリンジャーバンド
    bollinger = calculate_bollinger_bands(chart_close)

    # 一目均衡表（chart_dfを使用）
    ichimoku_df = chart_df if chart_df is not None and not chart_df.empty else df
    ichimoku = calculate_ichimoku(ichimoku_df)

    # 所属テーマがあればベータ・アルファを計算
    beta_alpha = {"beta": None, "alpha": None, "r_squared": None}
    if ticker_info:
        theme_id = ticker_info["theme_id"]
        theme = THEMES.get(theme_id)
        if theme:
            theme_daily_returns = calculate_theme_daily_returns(
                theme["tickers"],
                period
            )
            stock_daily_returns = calculate_daily_returns(df)

            if not theme_daily_returns.empty and not stock_daily_returns.empty:
                beta_alpha = calculate_beta_alpha(
                    stock_daily_returns,
                    theme_daily_returns
                )

    result = {
        "ticker": ticker,
        "name": ticker_info["name"] if ticker_info else (yf_info["name"] if yf_info else ticker),
        "description": ticker_info.get("description") if ticker_info else None,
        "period": period,
        "theme": {
            "id": ticker_info["theme_id"],
            "name": ticker_info["theme_name"],
        } if ticker_info else None,
        "indicators": {
            "latest_price": indicators["latest_price"],
            "period_return": indicators["period_return"],
            "rsi": indicators["rsi"],
            "ma5": indicators["ma5"],
            "ma20": indicators["ma20"],
            "volatility": indicators["volatility"],
            "high": indicators["high"],
            "low": indicators["low"],
            "beta": beta_alpha["beta"],
            "alpha": beta_alpha["alpha"],
            "r_squared": beta_alpha.get("r_squared"),
        },
        "price_history": price_history,
        "selected_period_start_index": selected_period_start_index,
        # チャート用インジケーターデータ
        "chart_indicators": {
            "ma": {
                "ma20": to_list(ma20),
                "ma75": to_list(ma75),
                "ma200": to_list(ma200),
            },
            "rsi": to_list(rsi_series),
            "bollinger": bollinger,
            "ichimoku": ichimoku,
        },
    }

    # キャッシュに保存（5分間）
    cache.set(cache_key, result, ttl_seconds=300)

    return result


@router.get("/api/stocks/{code}/chart")
def get_stock_chart_data(
    code: str,
    period: str = Query("1mo", description="期間: 1d, 5d, 1mo, 3mo, 6mo, 1y")
):
    """
    銘柄のチャートデータを取得

    Args:
        code: 銘柄コード
        period: 取得期間

    Returns:
        チャート用価格データ
    """
    ticker = code if code.endswith(".T") else f"{code}.T"

    price_history = get_price_history(ticker, period)

    if not price_history:
        raise HTTPException(status_code=404, detail=f"Chart data not found: {ticker}")

    return {
        "ticker": ticker,
        "period": period,
        "data": price_history,
    }


@router.get("/api/stocks")
def search_stocks(
    q: str = Query(None, description="検索クエリ（銘柄コードまたは企業名）"),
    theme_id: str = Query(None, description="テーマIDでフィルタ")
):
    """
    銘柄を検索

    Args:
        q: 検索クエリ
        theme_id: テーマIDでフィルタ

    Returns:
        マッチした銘柄リスト
    """
    results = []

    # 特定テーマの銘柄を取得
    if theme_id:
        theme = THEMES.get(theme_id)
        if not theme:
            raise HTTPException(status_code=404, detail=f"Theme not found: {theme_id}")

        for ticker in theme["tickers"]:
            name = theme["ticker_names"].get(ticker, ticker)
            results.append({
                "ticker": ticker,
                "name": name,
                "theme_id": theme_id,
                "theme_name": theme["name"],
            })
    else:
        # 全テーマから検索
        for tid, theme_data in THEMES.items():
            for ticker in theme_data["tickers"]:
                name = theme_data["ticker_names"].get(ticker, ticker)

                # 検索クエリがあればフィルタ
                if q:
                    query_lower = q.lower()
                    if (query_lower not in ticker.lower() and
                        query_lower not in name.lower()):
                        continue

                # 重複チェック
                if not any(r["ticker"] == ticker for r in results):
                    results.append({
                        "ticker": ticker,
                        "name": name,
                        "theme_id": tid,
                        "theme_name": theme_data["name"],
                    })

    return {
        "query": q,
        "theme_id": theme_id,
        "results": results,
        "total": len(results),
    }
