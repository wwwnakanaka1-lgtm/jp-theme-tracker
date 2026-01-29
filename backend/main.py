"""JP Stock Theme Tracker API - FastAPI Backend

爆速化: APSchedulerによるバックグラウンドデータ更新
- サーバー起動時に初回データ更新
- 5分ごとに自動更新
- ユーザーリクエストは事前計算済みJSONから即座に応答
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from routers import themes, stocks
from jobs.update_data import update_all_data, update_if_stale

# ロガー設定
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# スケジューラーをグローバルで定義
scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリ起動時にスケジューラー開始、終了時に停止"""
    logger.info("=" * 60)
    logger.info("Starting JP Stock Theme Tracker API...")
    logger.info("=" * 60)

    # 起動時: データが古い場合のみ更新（新鮮なら即座に起動）
    logger.info("Checking precomputed data freshness...")
    try:
        update_if_stale(max_age_minutes=60)  # 1時間以内なら更新スキップ
    except Exception as e:
        logger.error(f"Initial data check/update failed: {e}")
        logger.warning("Server will start without precomputed data (fallback mode)")

    # 5分ごとに更新
    scheduler.add_job(
        update_all_data,
        'interval',
        minutes=5,
        id='data_updater',
        replace_existing=True,
        max_instances=1,  # 同時実行を防ぐ
    )
    scheduler.start()
    logger.info("Background scheduler started (5min interval)")
    logger.info("=" * 60)

    yield  # アプリ稼働中

    # 終了時: スケジューラー停止
    logger.info("Shutting down background scheduler...")
    scheduler.shutdown()
    logger.info("Background scheduler stopped")


# FastAPIアプリケーション作成（lifespanを追加）
app = FastAPI(
    title="JP Stock Theme Tracker API",
    description="日本株テーマ別騰落率トラッカーAPI（爆速版）",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS設定（Next.jsから呼び出すため）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切なオリジンを指定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターを登録
app.include_router(themes.router, tags=["themes"])
app.include_router(stocks.router, tags=["stocks"])


@app.get("/")
def root():
    """ルートエンドポイント"""
    return {
        "name": "JP Stock Theme Tracker API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    """ヘルスチェック"""
    return {
        "status": "healthy",
        "api_version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
