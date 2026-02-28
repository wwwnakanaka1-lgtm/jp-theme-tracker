#!/usr/bin/env python
"""
バックグラウンドデータ更新ジョブ

5分ごとに実行し、全データを事前計算してJSONファイルに保存
ユーザーリクエスト時はJSONを読むだけで即座に応答可能
"""
# req:REQ-003
import json
import logging
import sys
import threading
from datetime import datetime
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.insert(0, str(Path(__file__).parent.parent))

from data.themes import THEMES, get_ticker_name, get_ticker_description, get_all_tickers
from services.data_fetcher import fetch_batch_parallel, fetch_stock_data, get_market_cap
from services.calculator import (
    calculate_return_from_data,
    calculate_theme_daily_returns_from_data,
    calculate_daily_returns,
)

logger = logging.getLogger(__name__)

# 事前計算済みデータの保存先
PRECOMPUTED_DIR = Path(__file__).parent.parent / "precomputed"
PRECOMPUTED_DIR.mkdir(exist_ok=True)

# サポートする期間
PERIODS = ["1d", "5d", "10d", "1mo", "3mo", "6mo", "1y"]

# 同時実行防止用ロック
_update_lock = threading.Lock()


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


def get_last_trading_date() -> str | None:
    """最後の取引日を取得（日本市場の終値時刻15:00を付与）"""
    try:
        df = fetch_stock_data("^N225", "5d")
        if df is not None and not df.empty:
            last_date = df.index[-1]
            # yfinanceの日足データは時刻がないため、日本市場の終値時刻15:00を付与
            return last_date.strftime("%Y-%m-%d") + " 15:00"
    except Exception:
        pass
    return None


def generate_sparkline(daily_returns_series, period: str) -> dict:
    """スパークラインデータを生成（累積リターン）"""
    import pandas as pd

    if daily_returns_series is None or daily_returns_series.empty:
        return {"data": [], "period_start_index": 0}

    # 累積リターンを計算
    cumulative = (1 + daily_returns_series / 100).cumprod() - 1
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


def update_themes_data():
    """全期間のテーマデータを事前計算"""
    logger.info("=" * 60)
    logger.info("Starting themes data update job...")
    start_time = datetime.now()

    # 1. 全銘柄を一度に取得（重複なし）
    all_tickers = get_all_tickers()
    logger.info(f"Total unique tickers: {len(all_tickers)}")

    # 2. 各期間のデータを並列取得
    logger.info("Fetching data for all periods...")
    all_data = {}
    for period in PERIODS:
        logger.info(f"  Fetching period: {period}")
        all_data[period] = fetch_batch_parallel(all_tickers, period, max_workers=15)
        logger.info(f"    -> Got {len(all_data[period])} tickers")

    # 3. 1年データ（スパークライン用）
    sparkline_data = all_data.get("1y", {})
    logger.info(f"Sparkline data (1y): {len(sparkline_data)} tickers")

    # 4. 各期間のテーマデータを計算・保存
    for period in PERIODS:
        logger.info(f"Processing period: {period}")
        themes_result = []
        period_data = all_data[period]
        day_data = all_data["1d"] if period != "1d" else {}

        for theme_id, theme_info in THEMES.items():
            try:
                tickers = theme_info["tickers"]

                # 該当テーマの銘柄データを抽出
                theme_stock_data = {t: period_data[t] for t in tickers if t in period_data}

                # テーマの騰落率計算
                theme_return, stock_returns = calculate_return_from_data(theme_stock_data)

                # 1日騰落率
                change_percent_1d = None
                if period != "1d" and day_data:
                    theme_stock_data_1d = {t: day_data[t] for t in tickers if t in day_data}
                    theme_return_1d, _ = calculate_return_from_data(theme_stock_data_1d)
                    change_percent_1d = theme_return_1d

                # Top 3 stocks
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

                # スパークライン生成（1年データから）
                theme_sparkline_data = {t: sparkline_data[t] for t in tickers if t in sparkline_data}
                theme_daily_returns = calculate_theme_daily_returns_from_data(theme_sparkline_data)
                sparkline = generate_sparkline(theme_daily_returns, period)

                themes_result.append({
                    "id": theme_id,
                    "name": theme_info["name"],
                    "description": theme_info["description"],
                    "change_percent": theme_return,
                    "change_percent_1d": change_percent_1d,
                    "stock_count": len(tickers),
                    "top_stocks": top_stocks,
                    "sparkline": sparkline,
                })
            except Exception as e:
                logger.warning(f"Error processing theme {theme_id}: {e}")
                themes_result.append({
                    "id": theme_id,
                    "name": theme_info["name"],
                    "description": theme_info.get("description", ""),
                    "change_percent": 0.0,
                    "change_percent_1d": None,
                    "stock_count": len(theme_info["tickers"]),
                    "top_stocks": [],
                    "sparkline": {"data": [], "period_start_index": 0},
                    "error": str(e),
                })

        # 騰落率でソート
        themes_result.sort(key=lambda x: x["change_percent"], reverse=True)

        # JSONファイルに保存
        output_path = PRECOMPUTED_DIR / f"themes_{period}.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump({
                "period": period,
                "themes": themes_result,
                "total": len(themes_result),
                "last_updated": get_last_trading_date(),
                "generated_at": datetime.now().isoformat(),
            }, f, ensure_ascii=False, indent=2)

        logger.info(f"  Saved: {output_path.name}")

    elapsed = (datetime.now() - start_time).total_seconds()
    logger.info(f"Themes data update completed in {elapsed:.1f} seconds")
    logger.info("=" * 60)


def update_theme_details_data():
    """全テーマ詳細データを事前計算"""
    logger.info("=" * 60)
    logger.info("Starting theme details data update job...")
    start_time = datetime.now()

    # 1. 全銘柄を一度に取得（重複なし）
    all_tickers = get_all_tickers()
    logger.info(f"Total unique tickers: {len(all_tickers)}")

    # 2. 各期間のデータを並列取得
    logger.info("Fetching data for all periods...")
    all_data = {}
    for period in PERIODS:
        logger.info(f"  Fetching period: {period}")
        all_data[period] = fetch_batch_parallel(all_tickers, period, max_workers=15)

    # 3. 1年データ（スパークライン用）
    sparkline_data = all_data.get("1y", {})

    # 4. 各テーマ×各期間のデータを計算・保存
    for theme_id, theme_info in THEMES.items():
        logger.info(f"Processing theme: {theme_id}")
        tickers = theme_info["tickers"]

        for period in PERIODS:
            period_data = all_data[period]
            day_data = all_data["1d"] if period != "1d" else {}

            # 該当テーマの銘柄データを抽出
            theme_stock_data = {t: period_data[t] for t in tickers if t in period_data}

            # テーマの騰落率計算
            theme_return, stock_returns = calculate_return_from_data(theme_stock_data)

            # 1日騰落率
            theme_return_1d = None
            stock_returns_1d = {}
            if period != "1d" and day_data:
                theme_stock_data_1d = {t: day_data[t] for t in tickers if t in day_data}
                theme_return_1d, stock_returns_1d = calculate_return_from_data(theme_stock_data_1d)

            # テーマの日次リターン（スパークライン・ベータ計算用）
            theme_sparkline_data = {t: sparkline_data[t] for t in tickers if t in sparkline_data}
            theme_daily_returns = calculate_theme_daily_returns_from_data(theme_sparkline_data)
            theme_sparkline = generate_sparkline(theme_daily_returns, period)

            # 各銘柄の詳細情報
            stocks = []
            for ticker in tickers:
                stock_return = stock_returns.get(ticker, 0.0)
                stock_return_1d = stock_returns_1d.get(ticker) if period != "1d" else None

                # 個別株の日次リターン
                stock_df = sparkline_data.get(ticker)
                stock_daily_returns = calculate_daily_returns(stock_df) if stock_df is not None else None

                # ベータ・アルファを計算
                beta_alpha = {"beta": None, "alpha": None, "r_squared": None}
                if stock_daily_returns is not None and not stock_daily_returns.empty and not theme_daily_returns.empty:
                    from services.calculator import calculate_beta_alpha
                    beta_alpha = calculate_beta_alpha(stock_daily_returns, theme_daily_returns)

                # 時価総額を取得
                market_cap_data = get_market_cap(ticker)

                # スパークラインデータ
                stock_sparkline = generate_sparkline(stock_daily_returns, period) if stock_daily_returns is not None else {"data": [], "period_start_index": 0}

                stocks.append({
                    "code": ticker,
                    "name": get_ticker_name(theme_id, ticker),
                    "description": get_ticker_description(theme_id, ticker),
                    "change_percent": round(stock_return, 2),
                    "change_percent_1d": round(stock_return_1d, 2) if stock_return_1d is not None else None,
                    "beta": round(beta_alpha["beta"], 3) if beta_alpha["beta"] is not None else None,
                    "alpha": round(beta_alpha["alpha"], 3) if beta_alpha["alpha"] is not None else None,
                    "r_squared": round(beta_alpha["r_squared"], 3) if beta_alpha["r_squared"] is not None else None,
                    "market_cap": market_cap_data.get("market_cap"),
                    "market_cap_category": market_cap_data.get("market_cap_category"),
                    "sparkline": stock_sparkline,
                })

            # 騰落率でソート
            stocks.sort(key=lambda x: x["change_percent"], reverse=True)

            # テーマ詳細結果
            result = {
                "id": theme_id,
                "name": theme_info["name"],
                "description": theme_info["description"],
                "change_percent": theme_return,
                "change_percent_1d": theme_return_1d,
                "stock_count": len(tickers),
                "sparkline": theme_sparkline,
                "stocks": stocks,
                "period": period,
                "last_updated": get_last_trading_date(),
                "generated_at": datetime.now().isoformat(),
            }

            # JSONファイルに保存
            output_path = PRECOMPUTED_DIR / f"theme_{theme_id}_{period}.json"
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)

        logger.info(f"  Saved theme detail: {theme_id}")

    elapsed = (datetime.now() - start_time).total_seconds()
    logger.info(f"Theme details data update completed in {elapsed:.1f} seconds")
    logger.info("=" * 60)


def update_heatmap_data():
    """ヒートマップデータを事前計算"""
    logger.info("Starting heatmap data update...")
    start_time = datetime.now()

    # 全銘柄を取得
    all_tickers = get_all_tickers()

    for period in PERIODS:
        # 期間のデータを取得
        all_data = fetch_batch_parallel(all_tickers, period, max_workers=15)

        stocks_by_category = {
            "mega": [],
            "large": [],
            "mid": [],
            "small": [],
            "micro": [],
            "unknown": [],
        }

        for theme_id, theme_data in THEMES.items():
            theme_stock_data = {t: all_data[t] for t in theme_data["tickers"] if t in all_data}
            _, stock_returns = calculate_return_from_data(theme_stock_data)

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

                # 重複チェック
                existing_codes = [s["code"] for s in stocks_by_category[category_id]]
                if ticker not in existing_codes:
                    stocks_by_category[category_id].append(stock_info)

        # 各カテゴリをソート
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
            "generated_at": datetime.now().isoformat(),
        }

        output_path = PRECOMPUTED_DIR / f"heatmap_{period}.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        logger.info(f"  Saved: {output_path.name}")

    elapsed = (datetime.now() - start_time).total_seconds()
    logger.info(f"Heatmap data update completed in {elapsed:.1f} seconds")


def is_data_fresh(max_age_minutes: int = 60) -> bool:
    """事前計算済みデータが新鮮かチェック（デフォルト: 1時間以内）"""
    json_path = PRECOMPUTED_DIR / "themes_1mo.json"
    if not json_path.exists():
        return False

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        generated_at = data.get("generated_at")
        if not generated_at:
            return False

        generated_time = datetime.fromisoformat(generated_at)
        age_minutes = (datetime.now() - generated_time).total_seconds() / 60
        logger.info(f"Data age: {age_minutes:.1f} minutes (max: {max_age_minutes})")
        return age_minutes < max_age_minutes
    except Exception as e:
        logger.warning(f"Failed to check data freshness: {e}")
        return False


def update_all_data(force: bool = False):
    """全データを更新するメイン関数（ロック付き）

    Args:
        force: Trueの場合、データが新鮮でも強制更新

    Raises:
        Exception: 更新処理が既に実行中の場合
    """
    # ロック取得を試みる（ノンブロッキング）
    acquired = _update_lock.acquire(blocking=False)
    if not acquired:
        logger.warning("Update already in progress, skipping")
        raise Exception("更新処理が既に実行中です")

    try:
        update_themes_data()
        update_theme_details_data()
        update_heatmap_data()  # ヒートマップ事前計算を有効化
        logger.info("All data update completed successfully!")
    except Exception as e:
        logger.error(f"Data update failed: {e}")
        raise
    finally:
        _update_lock.release()


def update_if_stale(max_age_minutes: int = 60):
    """データが古い場合のみ更新（サーバー起動時用）

    Args:
        max_age_minutes: この時間以内ならスキップ（デフォルト: 60分）
    """
    if is_data_fresh(max_age_minutes):
        logger.info("Precomputed data is fresh, skipping initial update")
        logger.info("Background scheduler will update data every 5 minutes")
        return

    logger.info("Precomputed data is stale or missing, running full update...")
    update_all_data()


def update_single_stock(code: str):
    """個別銘柄のデータを更新

    指定された銘柄コードが含まれる全テーマのデータを再計算して保存する

    Args:
        code: 銘柄コード（例: 7203.T または 7203）
    """
    # .Tが付いていなければ追加
    ticker = code if code.endswith(".T") else f"{code}.T"

    logger.info(f"Starting single stock update for: {ticker}")

    # この銘柄が含まれるテーマを検索
    themes_containing_stock = []
    for theme_id, theme_info in THEMES.items():
        if ticker in theme_info["tickers"]:
            themes_containing_stock.append(theme_id)

    if not themes_containing_stock:
        logger.warning(f"Stock {ticker} not found in any theme")
        raise ValueError(f"銘柄 {ticker} はどのテーマにも含まれていません")

    logger.info(f"Stock {ticker} found in themes: {themes_containing_stock}")

    # 対象テーマの全銘柄を収集
    tickers_to_update = set()
    for theme_id in themes_containing_stock:
        tickers_to_update.update(THEMES[theme_id]["tickers"])

    tickers_list = list(tickers_to_update)
    logger.info(f"Total tickers to update: {len(tickers_list)}")

    # 各期間のデータを取得
    all_data = {}
    for period in PERIODS:
        logger.info(f"  Fetching period: {period}")
        all_data[period] = fetch_batch_parallel(tickers_list, period, max_workers=15)

    # スパークライン用1年データ
    sparkline_data = all_data.get("1y", {})

    # 各テーマ×各期間のデータを再計算して保存
    for theme_id in themes_containing_stock:
        theme_info = THEMES[theme_id]
        tickers = theme_info["tickers"]

        for period in PERIODS:
            period_data = all_data[period]
            day_data = all_data["1d"] if period != "1d" else {}

            # 該当テーマの銘柄データを抽出
            theme_stock_data = {t: period_data[t] for t in tickers if t in period_data}

            # テーマの騰落率計算
            theme_return, stock_returns = calculate_return_from_data(theme_stock_data)

            # 1日騰落率
            theme_return_1d = None
            stock_returns_1d = {}
            if period != "1d" and day_data:
                theme_stock_data_1d = {t: day_data[t] for t in tickers if t in day_data}
                theme_return_1d, stock_returns_1d = calculate_return_from_data(theme_stock_data_1d)

            # テーマの日次リターン（スパークライン・ベータ計算用）
            theme_sparkline_data = {t: sparkline_data[t] for t in tickers if t in sparkline_data}
            theme_daily_returns = calculate_theme_daily_returns_from_data(theme_sparkline_data)
            theme_sparkline = generate_sparkline(theme_daily_returns, period)

            # 各銘柄の詳細情報
            stocks = []
            for t in tickers:
                stock_return = stock_returns.get(t, 0.0)
                stock_return_1d = stock_returns_1d.get(t) if period != "1d" else None

                # 個別株の日次リターン
                stock_df = sparkline_data.get(t)
                stock_daily_returns = calculate_daily_returns(stock_df) if stock_df is not None else None

                # ベータ・アルファを計算
                beta_alpha = {"beta": None, "alpha": None, "r_squared": None}
                if stock_daily_returns is not None and not stock_daily_returns.empty and not theme_daily_returns.empty:
                    from services.calculator import calculate_beta_alpha
                    beta_alpha = calculate_beta_alpha(stock_daily_returns, theme_daily_returns)

                # 時価総額を取得
                market_cap_data = get_market_cap(t)

                # スパークラインデータ
                stock_sparkline = generate_sparkline(stock_daily_returns, period) if stock_daily_returns is not None else {"data": [], "period_start_index": 0}

                stocks.append({
                    "code": t,
                    "name": get_ticker_name(theme_id, t),
                    "description": get_ticker_description(theme_id, t),
                    "change_percent": round(stock_return, 2),
                    "change_percent_1d": round(stock_return_1d, 2) if stock_return_1d is not None else None,
                    "beta": round(beta_alpha["beta"], 3) if beta_alpha["beta"] is not None else None,
                    "alpha": round(beta_alpha["alpha"], 3) if beta_alpha["alpha"] is not None else None,
                    "r_squared": round(beta_alpha["r_squared"], 3) if beta_alpha["r_squared"] is not None else None,
                    "market_cap": market_cap_data.get("market_cap"),
                    "market_cap_category": market_cap_data.get("market_cap_category"),
                    "sparkline": stock_sparkline,
                })

            # 騰落率でソート
            stocks.sort(key=lambda x: x["change_percent"], reverse=True)

            # テーマ詳細結果
            result = {
                "id": theme_id,
                "name": theme_info["name"],
                "description": theme_info["description"],
                "change_percent": theme_return,
                "change_percent_1d": theme_return_1d,
                "stock_count": len(tickers),
                "sparkline": theme_sparkline,
                "stocks": stocks,
                "period": period,
                "last_updated": get_last_trading_date(),
                "generated_at": datetime.now().isoformat(),
            }

            # JSONファイルに保存
            output_path = PRECOMPUTED_DIR / f"theme_{theme_id}_{period}.json"
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)

        logger.info(f"  Updated theme detail: {theme_id}")

    logger.info(f"Single stock update completed for: {ticker}")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    update_all_data()
