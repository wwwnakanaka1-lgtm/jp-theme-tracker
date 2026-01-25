"""騰落率・指標計算モジュール"""

from typing import Optional

import numpy as np
import pandas as pd
from scipy import stats

from services.data_fetcher import fetch_stock_data, fetch_batch


def calculate_return(df: pd.DataFrame) -> float:
    """
    期間騰落率を計算

    Args:
        df: 株価DataFrame（Close列を含む）

    Returns:
        騰落率（%）
    """
    if df is None or df.empty or len(df) < 2:
        return 0.0

    close = df["Close"]
    if close.iloc[0] == 0:
        return 0.0

    return ((close.iloc[-1] - close.iloc[0]) / close.iloc[0]) * 100


def calculate_daily_returns(df: pd.DataFrame) -> pd.Series:
    """
    日次リターンを計算

    Args:
        df: 株価DataFrame（Close列を含む）

    Returns:
        日次リターンのSeries（%）
    """
    if df is None or df.empty:
        return pd.Series(dtype=float)

    return df["Close"].pct_change() * 100


def calculate_beta_alpha(
    stock_returns: pd.Series,
    benchmark_returns: pd.Series,
    min_periods: int = 5
) -> dict:
    """
    ベータ値とアルファ値を計算

    Args:
        stock_returns: 個別株の日次リターン
        benchmark_returns: ベンチマーク（テーマ平均）の日次リターン
        min_periods: 計算に必要な最小データ点数（デフォルト5）

    Returns:
        dict with beta, alpha (データ不足時はNone)
    """
    # 共通のインデックスに絞る
    common_idx = stock_returns.index.intersection(benchmark_returns.index)

    if len(common_idx) < min_periods:
        return {"beta": None, "alpha": None}

    stock = stock_returns.loc[common_idx].dropna()
    benchmark = benchmark_returns.loc[common_idx].dropna()

    # 再度共通インデックスを取得
    common_idx = stock.index.intersection(benchmark.index)

    if len(common_idx) < min_periods:
        return {"beta": None, "alpha": None}

    stock = stock.loc[common_idx]
    benchmark = benchmark.loc[common_idx]

    # ベンチマークに分散がない場合はスキップ
    if benchmark.std() == 0:
        return {"beta": None, "alpha": None}

    try:
        # 線形回帰でベータとアルファを計算
        slope, intercept, r_value, _, _ = stats.linregress(benchmark, stock)

        # NaNチェック
        if np.isnan(slope) or np.isnan(intercept):
            return {"beta": None, "alpha": None}

        return {
            "beta": round(slope, 4),
            "alpha": round(intercept, 4),
            "r_squared": round(r_value ** 2, 4)
        }
    except Exception:
        return {"beta": None, "alpha": None}


def calculate_theme_return(
    tickers: list[str],
    period: str = "1mo"
) -> tuple[float, dict]:
    """
    テーマの騰落率を計算（構成銘柄の平均）

    Args:
        tickers: 銘柄コードリスト
        period: 取得期間

    Returns:
        tuple: (テーマ騰落率, 銘柄ごとの騰落率dict)
    """
    stock_data = fetch_batch(tickers, period)

    if not stock_data:
        return 0.0, {}

    returns = {}
    for ticker, df in stock_data.items():
        returns[ticker] = calculate_return(df)

    if not returns:
        return 0.0, {}

    theme_return = sum(returns.values()) / len(returns)
    return round(theme_return, 2), returns


def calculate_theme_daily_returns(
    tickers: list[str],
    period: str = "1mo"
) -> pd.Series:
    """
    テーマの日次リターンを計算（構成銘柄の平均）

    Args:
        tickers: 銘柄コードリスト
        period: 取得期間

    Returns:
        日次リターンのSeries（%）
    """
    stock_data = fetch_batch(tickers, period)

    if not stock_data:
        return pd.Series(dtype=float)

    all_returns = []
    for df in stock_data.values():
        daily_ret = calculate_daily_returns(df)
        if not daily_ret.empty:
            all_returns.append(daily_ret)

    if not all_returns:
        return pd.Series(dtype=float)

    # 全銘柄の日次リターンをDataFrameに結合し、平均を計算
    combined = pd.concat(all_returns, axis=1)
    return combined.mean(axis=1)


def calculate_rsi(prices: pd.Series, period: int = 14) -> pd.Series:
    """
    RSI（相対力指数）を計算

    Args:
        prices: 価格のSeries（通常はClose）
        period: RSI計算期間（デフォルト14日）

    Returns:
        RSIのSeries
    """
    if prices is None or len(prices) < period + 1:
        return pd.Series(dtype=float)

    # 価格変動を計算
    delta = prices.diff()

    # 上昇・下落を分離
    gain = delta.where(delta > 0, 0)
    loss = (-delta).where(delta < 0, 0)

    # 指数移動平均を計算
    avg_gain = gain.ewm(span=period, adjust=False).mean()
    avg_loss = loss.ewm(span=period, adjust=False).mean()

    # RSを計算
    rs = avg_gain / avg_loss.replace(0, np.inf)

    # RSIを計算
    rsi = 100 - (100 / (1 + rs))

    return rsi


def calculate_ma(prices: pd.Series, period: int) -> pd.Series:
    """
    移動平均を計算

    Args:
        prices: 価格のSeries
        period: 移動平均期間

    Returns:
        移動平均のSeries
    """
    if prices is None or len(prices) < period:
        return pd.Series(dtype=float)

    return prices.rolling(window=period).mean()


def calculate_bollinger_bands(prices: pd.Series, period: int = 20, num_std: float = 2) -> dict:
    """
    ボリンジャーバンドを計算

    Args:
        prices: 価格のSeries（通常はClose）
        period: 移動平均期間（デフォルト20日）
        num_std: 標準偏差の倍数（デフォルト2）

    Returns:
        dict with middle, upper, lower bands
    """
    if prices is None or len(prices) < period:
        return {"middle": [], "upper": [], "lower": []}

    # 中央線（移動平均）
    middle = prices.rolling(window=period).mean()

    # 標準偏差
    std = prices.rolling(window=period).std()

    # 上下バンド
    upper = middle + (std * num_std)
    lower = middle - (std * num_std)

    def to_list(s):
        return [round(v, 2) if not np.isnan(v) else None for v in s.values]

    return {
        "middle": to_list(middle),
        "upper": to_list(upper),
        "lower": to_list(lower),
    }


def calculate_ichimoku(df: pd.DataFrame) -> dict:
    """
    一目均衡表を計算

    Args:
        df: 株価DataFrame（High, Low, Close列を含む）

    Returns:
        dict with tenkan, kijun, senkou_a, senkou_b, chikou
    """
    if df is None or df.empty or len(df) < 52:
        return {
            "tenkan": [],
            "kijun": [],
            "senkou_a": [],
            "senkou_b": [],
            "chikou": [],
        }

    high = df["High"]
    low = df["Low"]
    close = df["Close"]

    # 転換線（9日間の高値と安値の中間値）
    tenkan_high = high.rolling(window=9).max()
    tenkan_low = low.rolling(window=9).min()
    tenkan = (tenkan_high + tenkan_low) / 2

    # 基準線（26日間の高値と安値の中間値）
    kijun_high = high.rolling(window=26).max()
    kijun_low = low.rolling(window=26).min()
    kijun = (kijun_high + kijun_low) / 2

    # 先行スパンA（転換線と基準線の中間値を26日先に表示）
    senkou_a = ((tenkan + kijun) / 2).shift(26)

    # 先行スパンB（52日間の高値と安値の中間値を26日先に表示）
    senkou_b_high = high.rolling(window=52).max()
    senkou_b_low = low.rolling(window=52).min()
    senkou_b = ((senkou_b_high + senkou_b_low) / 2).shift(26)

    # 遅行スパン（終値を26日前に表示）
    chikou = close.shift(-26)

    def to_list(s):
        return [round(v, 2) if pd.notna(v) else None for v in s.values]

    return {
        "tenkan": to_list(tenkan),
        "kijun": to_list(kijun),
        "senkou_a": to_list(senkou_a),
        "senkou_b": to_list(senkou_b),
        "chikou": to_list(chikou),
    }


def calculate_volatility(df: pd.DataFrame, period: int = 20) -> float:
    """
    ボラティリティ（標準偏差）を計算

    Args:
        df: 株価DataFrame
        period: 計算期間

    Returns:
        年率換算ボラティリティ（%）
    """
    if df is None or df.empty or len(df) < period:
        return 0.0

    daily_returns = calculate_daily_returns(df)

    if daily_returns.empty:
        return 0.0

    # 日次ボラティリティを年率換算（252営業日）
    daily_vol = daily_returns.std()
    annual_vol = daily_vol * np.sqrt(252)

    return round(annual_vol, 2)


def get_stock_indicators(ticker: str, period: str = "1mo") -> Optional[dict]:
    """
    銘柄の各種指標を計算

    Args:
        ticker: 銘柄コード
        period: 取得期間

    Returns:
        dict with various indicators
    """
    df = fetch_stock_data(ticker, period)

    if df is None or df.empty:
        return None

    close = df["Close"]

    # 最新のRSI
    rsi = calculate_rsi(close)
    latest_rsi = rsi.iloc[-1] if not rsi.empty else None

    # 移動平均
    ma5 = calculate_ma(close, 5)
    ma20 = calculate_ma(close, 20)

    latest_ma5 = ma5.iloc[-1] if not ma5.empty and len(ma5) >= 5 else None
    latest_ma20 = ma20.iloc[-1] if not ma20.empty and len(ma20) >= 20 else None

    # 騰落率
    period_return = calculate_return(df)

    # ボラティリティ
    volatility = calculate_volatility(df)

    # 最新価格
    latest_price = close.iloc[-1] if not close.empty else None

    # 高値・安値
    high = df["High"].max() if "High" in df.columns else None
    low = df["Low"].min() if "Low" in df.columns else None

    return {
        "ticker": ticker,
        "latest_price": round(latest_price, 2) if latest_price else None,
        "period_return": round(period_return, 2),
        "rsi": round(latest_rsi, 2) if latest_rsi and not np.isnan(latest_rsi) else None,
        "ma5": round(latest_ma5, 2) if latest_ma5 and not np.isnan(latest_ma5) else None,
        "ma20": round(latest_ma20, 2) if latest_ma20 and not np.isnan(latest_ma20) else None,
        "volatility": volatility,
        "high": round(high, 2) if high else None,
        "low": round(low, 2) if low else None,
    }


def get_price_history(ticker: str, period: str = "1mo") -> list[dict]:
    """
    価格履歴を取得（チャート用）

    Args:
        ticker: 銘柄コード
        period: 取得期間

    Returns:
        list of dict with date and price data
    """
    df = fetch_stock_data(ticker, period)

    if df is None or df.empty:
        return []

    history = []
    for date, row in df.iterrows():
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(row["Open"], 2) if not np.isnan(row["Open"]) else None,
            "high": round(row["High"], 2) if not np.isnan(row["High"]) else None,
            "low": round(row["Low"], 2) if not np.isnan(row["Low"]) else None,
            "close": round(row["Close"], 2) if not np.isnan(row["Close"]) else None,
            "volume": int(row["Volume"]) if not np.isnan(row["Volume"]) else None,
        })

    return history
