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

# CORS設定（環境に応じて許可オリジンを制限）
import os

# 許可するオリジン（環境変数から取得、カンマ区切り）
# 例: ALLOWED_ORIGINS=https://my-app.vercel.app,https://my-app.onrender.com
_allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in _allowed_origins_env.split(",")
    if origin.strip()
]

# 開発環境のフォールバック（環境変数未設定時）
if not ALLOWED_ORIGINS:
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    logger.warning("ALLOWED_ORIGINS not set. Using development defaults.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,  # 認証情報は不要なためFalse
    allow_methods=["GET", "POST", "OPTIONS"],  # 必要なメソッドのみ許可
    allow_headers=["X-API-Key", "Content-Type"],  # 必要なヘッダーのみ許可
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


def find_available_port(start_port: int = 8000, max_attempts: int = 100) -> int:
    """空いているポートを探す"""
    import socket
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(("0.0.0.0", port))
                return port
        except OSError:
            continue
    raise RuntimeError(f"No available port found in range {start_port}-{start_port + max_attempts}")


def save_port_config(port: int):
    """ポート番号を設定ファイルに保存（フロントエンドが読み取る）"""
    from pathlib import Path
    import json

    config_path = Path(__file__).parent.parent / "port_config.json"
    config_path.write_text(json.dumps({"backend_port": port}, indent=2))
    logger.info(f"Port config saved to: {config_path}")


if __name__ == "__main__":
    import uvicorn

    # 空いているポートを自動検出
    port = find_available_port(8000)
    save_port_config(port)

    # 開発モード判定（環境変数で制御）
    is_dev = os.environ.get("ENV", "development").lower() == "development"

    logger.info(f"Starting server on port {port} (dev={is_dev})")
    print(f"\n{'='*50}")
    print(f"  Backend API: http://localhost:{port}")
    print(f"  API Docs:    http://localhost:{port}/docs")
    print(f"  Mode:        {'Development' if is_dev else 'Production'}")
    print(f"{'='*50}\n")

    # reload は開発モードでのみ有効
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=is_dev)
