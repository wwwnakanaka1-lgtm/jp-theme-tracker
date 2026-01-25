"""JP Stock Theme Tracker API - FastAPI Backend"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import themes, stocks

# FastAPIアプリケーション作成
app = FastAPI(
    title="JP Stock Theme Tracker API",
    description="日本株テーマ別騰落率トラッカーAPI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
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
