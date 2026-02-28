# JP Theme Tracker Next

日本株テーマ別パフォーマンストラッカー

Full-stack application for tracking Japanese stock performance by investment themes. Analyzes 20 themes with 10 stocks each (200 stocks total) with real-time data from Yahoo Finance.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Theme List](#theme-list)
- [Frontend Pages](#frontend-pages)
- [Components](#components)
- [Development Guide](#development-guide)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Performance](#performance)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Changelog](#changelog)

---

## Overview

JP Theme Tracker Next は、日本株を **20の投資テーマ** に分類し、各テーマの騰落率をリアルタイムで追跡・分析するフルスタック Web アプリケーションです。

### 解決する課題

日本株市場には約3,800社の上場企業があり、個別銘柄の分析だけでは市場全体のトレンドを把握することが困難です。本アプリケーションは投資テーマごとにグループ化することで、以下を実現します：

- **テーマトレンドの可視化**: AI、半導体、EV など注目テーマの騰落率を一覧表示
- **期間別比較**: 1日〜5年の複数期間でパフォーマンスを比較
- **個別銘柄の深掘り**: テクニカル指標（RSI、ボリンジャーバンド、一目均衡表）付きチャート
- **ヒートマップ分析**: 時価総額カテゴリ別・セクター別の市場全体俯瞰
- **テーマ比較**: 最大5テーマを同時に比較して投資判断をサポート

### 対象ユーザー

- 日本株に投資する個人投資家
- テーマ型投資ファンドのアナリスト
- 市場トレンドを追跡するフィナンシャルアドバイザー
- 日本市場に関心のある海外投資家

### 主な特徴

- **高速応答**: APScheduler による事前計算（プリコンピュート）で API レスポンス <100ms
- **リアルタイム更新**: 5分ごとにバックグラウンドでデータを自動更新
- **PWA 対応**: オフライン利用可能、ホーム画面にインストール可能
- **レスポンシブ UI**: モバイル・タブレット・デスクトップに対応
- **セキュリティ**: API キー認証、CORS 制限、入力バリデーション、パストラバーサル保護
- **レート制限**: IP ベースのリクエスト制限で API 安定性を確保

---

## Features

### テーマランキング

テーマ一覧ページでは、20の投資テーマを騰落率順にランキング表示します。

- **期間選択**: 1日、5日、10日、1ヶ月、3ヶ月、6ヶ月、1年、3年、5年
- **スパークライン**: 各テーマの価格推移を小型チャートで表示
- **トップ銘柄**: 各テーマの騰落率上位3銘柄をハイライト
- **日経225連動**: 市場全体のベンチマークとして日経225指数を同時表示
- **最終更新時刻**: データの鮮度を確認可能

### ヒートマップ

市場全体を視覚的に把握するためのヒートマップビューを提供します。

#### 時価総額別ヒートマップ

- **Mega Cap** (10兆円以上): トヨタ、ソニー、キーエンス等の超大型株
- **Large Cap** (1兆〜10兆円): 大手企業群
- **Mid Cap** (3000億〜1兆円): 中堅企業群
- **Small Cap** (300億〜3000億円): 小型株
- **Micro Cap** (300億円未満): 超小型株

各銘柄は騰落率に応じて色分けされ、赤（下落）から緑（上昇）のグラデーションで表示されます。

#### セクター別ヒートマップ

20の投資テーマをセクターとして扱い、テーマごとの平均騰落率をヒートマップで表示します。テーマ内の個別銘柄も確認でき、セクターローテーション分析に活用できます。

### 個別銘柄分析

各銘柄の詳細ページでは、以下のテクニカル分析情報を提供します：

#### チャート

- **OHLCV チャート**: TradingView Lightweight Charts によるインタラクティブなローソク足チャート
- **出来高**: チャート下部に出来高バーを表示
- **期間選択**: 1日〜5年の複数期間に対応
- **リアルタイム更新**: 画面遷移なしでデータを更新

#### テクニカル指標

- **移動平均線 (MA)**: 20日、75日、200日移動平均
- **RSI (相対力指数)**: 14日RSI（買われすぎ/売られすぎの判定）
- **ボリンジャーバンド**: 20日移動平均を中心とした標準偏差バンド
- **一目均衡表**: 転換線、基準線、先行スパンA/B、遅行スパン
- **ベータ値**: 日経225に対する感応度
- **アルファ値**: 超過リターン（日経225対比）
- **R二乗値**: 日経225との相関の説明力
- **ボラティリティ**: 年率換算の変動率

### テーマ比較

最大5つのテーマを選択して、複数期間（1日、5日、1ヶ月、3ヶ月、1年）の騰落率を横断的に比較できます。テーマ間のパフォーマンス差を一目で把握できるテーブル表示を提供します。

### 銘柄検索

銘柄名またはコードで全200銘柄を横断検索できます。検索結果からワンクリックで個別銘柄詳細ページに遷移します。

### アナリティクス

本日・月間のテーマランキングと、概要統計（トラッキングテーマ数、銘柄数、分析期間、更新間隔）を表示するダッシュボードビューを提供します。

### お気に入り機能

よく確認する銘柄をお気に入りに登録し、素早くアクセスできます。お気に入りデータはブラウザの localStorage に保存されます。

### 設定

- **自動更新**: ON/OFF の切り替え
- **更新間隔**: 1分、5分、10分、30分から選択
- **デフォルト期間**: テーマランキングの初期表示期間を設定
- **アプリ情報**: バージョン、トラッキングテーマ数、銘柄数の確認

### PWA (Progressive Web App)

- **オフライン対応**: Service Worker によるキャッシュでオフラインでも閲覧可能
- **インストール可能**: ホーム画面に追加してネイティブアプリのように使用可能
- **高速起動**: キャッシュ済みリソースによる高速な初回表示

### データエクスポート

テーマデータを JSON または CSV 形式でエクスポートできます。API エンドポイント (`/api/export`) から直接ダウンロードすることも可能です。

---

## Screenshots

### テーマランキング画面

テーマ一覧ページのスクリーンショット。20テーマが騰落率順にランキング表示され、各テーマにスパークラインとトップ3銘柄が表示されています。

### ヒートマップ画面

時価総額別ヒートマップのスクリーンショット。Mega Cap から Micro Cap まで、騰落率に応じた色分けで全銘柄を表示しています。

### 個別銘柄分析画面

個別銘柄の詳細ページのスクリーンショット。ローソク足チャート、テクニカル指標、移動平均線が表示されています。

### テーマ比較画面

5つのテーマを選択して複数期間の騰落率を比較するテーブル表示のスクリーンショット。

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.0.0 | React フレームワーク (App Router) |
| React | 18.2.0 | UI ライブラリ |
| TypeScript | 5.2.2 | 型安全な JavaScript |
| Tailwind CSS | 3.3.5 | ユーティリティファースト CSS |
| SWR | 2.3.8 | データフェッチング & キャッシング |
| Recharts | 2.10.0 | React チャートライブラリ |
| Lightweight Charts | 5.1.0 | TradingView チャート |
| Lucide React | - | アイコンライブラリ |
| Zustand | - | 軽量状態管理 |
| next-pwa | 5.6.0 | PWA サポート |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | >= 0.109.0 | Python Web フレームワーク |
| Uvicorn | >= 0.27.0 | ASGI サーバー |
| yfinance | >= 0.2.36 | Yahoo Finance データ取得 |
| pandas | >= 2.0.0 | データ操作・分析 |
| numpy | >= 1.24.0 | 数値計算 |
| scipy | >= 1.11.0 | 統計計算（ベータ値等） |
| Pydantic | >= 2.0.0 | データバリデーション |
| APScheduler | >= 3.10.0 | バックグラウンドジョブスケジューリング |

### DevOps / Quality

| Tool | Purpose |
|------|---------|
| ESLint | JavaScript/TypeScript リンター |
| Prettier | コードフォーマッター |
| Ruff | Python リンター（高速） |
| pytest | Python テストフレームワーク |
| Husky | Git フックマネージャー |
| GitHub Actions | CI/CD パイプライン |
| Docker | コンテナ化 |

---

## Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Next.js 14 (App Router) + React 18 + TypeScript        │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│   │  │  Themes  │ │ Heatmap  │ │  Stocks  │ │ Analytics│   │   │
│   │  │  Page    │ │  Page    │ │  Detail  │ │  Page    │   │   │
│   │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │   │
│   │       │             │             │             │         │   │
│   │  ┌────▼─────────────▼─────────────▼─────────────▼────┐   │   │
│   │  │              SWR (Client Cache)                    │   │   │
│   │  └────────────────────┬───────────────────────────────┘   │   │
│   └───────────────────────┼───────────────────────────────────┘   │
│                           │ HTTP (JSON)                           │
└───────────────────────────┼───────────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────────┐
│                     FastAPI Backend Server                         │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  Rate Limiting Middleware (60 req/min per IP)             │   │
│   ├──────────────────────────────────────────────────────────┤   │
│   │  CORS Middleware (Configurable Origins)                   │   │
│   ├──────────────────────────────────────────────────────────┤   │
│   │  ┌────────────────┐  ┌────────────────┐                 │   │
│   │  │ Themes Router  │  │ Stocks Router  │  API Layer      │   │
│   │  │ /api/themes/*  │  │ /api/stocks/*  │                 │   │
│   │  └───────┬────────┘  └───────┬────────┘                 │   │
│   │          │                    │                           │   │
│   │  ┌───────▼────────────────────▼────────┐                 │   │
│   │  │     Precomputed JSON Reader         │  Service Layer  │   │
│   │  │     (Instant Response < 100ms)      │                 │   │
│   │  └───────────────┬─────────────────────┘                 │   │
│   │                  │ Fallback                               │   │
│   │  ┌───────────────▼─────────────────────┐                 │   │
│   │  │   Calculator Service                │                 │   │
│   │  │   (RSI, MA, Beta, Bollinger, etc.)  │                 │   │
│   │  └───────────────┬─────────────────────┘                 │   │
│   │                  │                                        │   │
│   │  ┌───────────────▼─────────────────────┐                 │   │
│   │  │   Data Fetcher Service              │  Data Layer     │   │
│   │  │   (yfinance + JSON Cache)           │                 │   │
│   │  └─────────────────────────────────────┘                 │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  APScheduler (Background Job)                            │   │
│   │  - Every 5 minutes: update_all_data()                    │   │
│   │  - Precompute themes, heatmaps for all 7 periods         │   │
│   │  - Thread-safe with threading.Lock                        │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  File System Storage                                      │   │
│   │  ┌──────────────┐  ┌──────────────┐                     │   │
│   │  │ precomputed/ │  │   cache/     │                     │   │
│   │  │ (JSON files) │  │ (24h TTL)   │                     │   │
│   │  └──────────────┘  └──────────────┘                     │   │
│   └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **初回起動**: サーバー起動時に `update_if_stale()` を実行。データが1時間以内なら更新をスキップ
2. **バックグラウンド更新**: APScheduler が5分ごとに `update_all_data()` を実行
3. **プリコンピュート**: 全7期間 × 全20テーマのデータを JSON ファイルに事前計算
4. **API 応答**: プリコンピュート済み JSON を読み取って即座に応答（< 100ms）
5. **フォールバック**: プリコンピュート済みデータがない場合はリアルタイム計算にフォールバック

### Three-Tier Caching Strategy

| Layer | TTL | Storage | Purpose |
|-------|-----|---------|---------|
| Precomputed JSON | 5 min (scheduler) | File system (`backend/precomputed/`) | API 応答の高速化 |
| Memory Cache | 5 min | In-memory (dict) | 同一リクエストの重複排除 |
| JSON File Cache | 24 hours | File system (`cache/`) | yfinance API コール削減 |

### Precomputed File Types

| Pattern | Count | Description |
|---------|-------|-------------|
| `themes_{period}.json` | 7 | 全テーマランキング（7期間分） |
| `theme_{id}_{period}.json` | 140 | テーマ詳細（20テーマ × 7期間） |
| `heatmap_{period}.json` | 7 | 時価総額別ヒートマップ |
| **Total** | **154** | サーバー起動時に生成 |

---

## Getting Started

### Prerequisites

- **Node.js**: 18.0.0 以上（推奨: 20.x LTS）
- **Python**: 3.10 以上（推奨: 3.11）
- **npm**: 9.0.0 以上
- **pip**: 最新版
- **Git**: バージョン管理

### Quick Start

#### 1. リポジトリをクローン

```bash
git clone https://github.com/your-username/jp-theme-tracker-next.git
cd jp-theme-tracker-next
```

#### 2. バックエンドのセットアップ

```bash
# 仮想環境の作成と有効化
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# 依存パッケージのインストール
pip install -r backend/requirements.txt

# バックエンドサーバーの起動
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### 3. フロントエンドのセットアップ

```bash
# 別のターミナルで実行
cd frontend

# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

#### 4. ブラウザでアクセス

start.bat を使用する場合は、スクリプトが自動的にポートを検出しブラウザを開きます。
手動起動の場合は `http://localhost:3000` にアクセスしてください。

### Using Start Scripts (Windows)

```batch
# 両方のサーバーを起動（動的ポート検出付き）
start-all.bat

# バックエンドのみ起動
start-backend.bat

# フロントエンドのみ起動
start-frontend.bat

# 停止
stop-all.bat
```

start.bat スクリプトは動的ポート検出を使用します：
- バックエンド: 8000番ポートから開始し、使用中の場合は自動インクリメント
- 選択されたポートは `port_config.json` に保存され、フロントエンドが読み取ります
- ブラウザは自動的に正しい URL で開きます

### Using Docker

```bash
# Docker イメージのビルド
docker build -t jp-theme-tracker .

# コンテナの起動
docker run -p 8000:8000 jp-theme-tracker
```

---

## Configuration

### Environment Variables

#### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `API_REFRESH_KEY` | (none) | データ手動リフレッシュ用 API キー |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS 許可オリジン（カンマ区切り） |
| `ENV` | `development` | 実行環境 (`development` / `production`) |

#### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | バックエンド API の URL |

### Port Configuration

動的ポート検出により、ポート番号は自動的に決定されます。

- バックエンド: `port_config.json` の `backend_port` フィールドに保存
- フロントエンド: Next.js デフォルト（通常 3000）

```json
// port_config.json (auto-generated)
{
  "backend_port": 8002
}
```

### .env.example

```env
# Backend Configuration
API_REFRESH_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000
ENV=development

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API Reference

### Base URL

- Development: `http://localhost:<dynamic-port>`
- Production: `https://jp-stock-tracker-api.onrender.com`

### Authentication

一部のエンドポイント（データリフレッシュ）には API キー認証が必要です。

```
Header: X-API-Key: <your-api-key>
```

### Endpoints

#### GET /api/themes

全テーマの騰落率ランキングを取得します。

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `1d` | 期間 (`1d`, `5d`, `10d`, `1mo`, `3mo`, `6mo`, `1y`) |

**Response:**

```json
{
  "themes": [
    {
      "id": "ai",
      "name": "AI・人工知能",
      "description": "AI技術開発・活用企業",
      "change_percent": 2.45,
      "change_percent_1d": 0.82,
      "stock_count": 10,
      "top_stocks": [
        {
          "code": "3778.T",
          "name": "さくらインターネット",
          "change_percent": 5.67
        },
        {
          "code": "9984.T",
          "name": "ソフトバンクグループ",
          "change_percent": 3.21
        },
        {
          "code": "6758.T",
          "name": "ソニーグループ",
          "change_percent": 2.88
        }
      ],
      "sparkline": {
        "data": [100, 101.2, 99.8, 102.5, 103.1],
        "period_start_index": 2
      }
    }
  ],
  "period": "1d",
  "total": 20,
  "last_updated": "2026-03-01T09:30:00"
}
```

#### GET /api/themes/{theme_id}

特定テーマの詳細情報（構成銘柄含む）を取得します。

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `theme_id` | path | テーマID（例: `ai`, `semiconductor`） |
| `period` | query | 期間（デフォルト: `1d`） |

**Response:**

```json
{
  "id": "semiconductor",
  "name": "半導体",
  "description": "半導体製造装置・関連企業",
  "change_percent": 1.85,
  "stock_count": 10,
  "stocks": [
    {
      "code": "8035.T",
      "name": "東京エレクトロン",
      "description": "半導体製造装置で世界第3位。最先端EUV関連装置に強み。",
      "change_percent": 3.45,
      "change_percent_1d": 1.22,
      "beta": 1.35,
      "alpha": 0.02,
      "market_cap": 15000000000000,
      "market_cap_category": {
        "id": "mega",
        "label": "超大型株",
        "color": "purple"
      }
    }
  ]
}
```

#### GET /api/themes/{theme_id}/history

テーマの価格履歴データ（チャート用）を取得します。

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `theme_id` | path | テーマID |
| `period` | query | 期間（デフォルト: `1mo`） |

**Response:**

```json
{
  "theme_id": "ai",
  "period": "1mo",
  "history": [
    {
      "date": "2026-02-01",
      "average_return": 0.0,
      "cumulative_return": 0.0
    },
    {
      "date": "2026-02-02",
      "average_return": 0.45,
      "cumulative_return": 0.45
    }
  ]
}
```

#### GET /api/heatmap

時価総額カテゴリ別のヒートマップデータを取得します。

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `1d` | 期間 |

**Response:**

```json
{
  "period": "1d",
  "categories": {
    "mega": {
      "id": "mega",
      "label": "超大型株（10兆円以上）",
      "threshold": ">=10T",
      "stocks": [
        {
          "code": "6861.T",
          "name": "キーエンス",
          "theme_id": "ai",
          "theme_name": "AI・人工知能",
          "change_percent": 1.23,
          "market_cap": 16000000000000
        }
      ],
      "count": 15
    },
    "large": { "..." : "..." },
    "mid": { "..." : "..." },
    "small": { "..." : "..." },
    "micro": { "..." : "..." }
  },
  "last_updated": "2026-03-01T09:30:00"
}
```

#### GET /api/heatmap/sector

セクター（テーマ）別のヒートマップデータを取得します。

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `1d` | 期間 |

**Response:**

```json
{
  "period": "1d",
  "sectors": [
    {
      "id": "ai",
      "name": "AI・人工知能",
      "description": "AI技術開発・活用企業",
      "average_change": 2.15,
      "stocks": [
        {
          "code": "3778.T",
          "name": "さくらインターネット",
          "change_percent": 5.67,
          "market_cap": 450000000000
        }
      ],
      "stock_count": 10
    }
  ],
  "total_sectors": 20,
  "last_updated": "2026-03-01T09:30:00"
}
```

#### POST /api/refresh

全データの手動リフレッシュをトリガーします。API キー認証が必要です。

**Headers:**

```
X-API-Key: <your-api-key>
```

**Response:**

```json
{
  "status": "success",
  "message": "Data refresh completed",
  "elapsed_seconds": 45.2,
  "timestamp": "2026-03-01T09:30:00"
}
```

#### GET /api/stocks/{code}

個別銘柄の詳細データ（テクニカル指標含む）を取得します。

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | path | 銘柄コード（例: `6758.T` または `6758`） |
| `period` | query | チャート期間（デフォルト: `1mo`） |

**Response:**

```json
{
  "ticker": "6758.T",
  "name": "ソニーグループ",
  "description": "ゲーム・音楽・映画の総合エンタメ企業。AI画像認識技術でリード。",
  "theme": {
    "id": "ai",
    "name": "AI・人工知能"
  },
  "indicators": {
    "latest_price": 15230,
    "period_return": 2.88,
    "beta": 1.12,
    "alpha": 0.015,
    "r_squared": 0.72,
    "rsi": 58.3,
    "volatility": 0.28,
    "ma_5": 15100,
    "ma_25": 14800,
    "ma_75": 14200
  },
  "price_history": [
    {
      "date": "2026-02-01",
      "open": 14800,
      "high": 14950,
      "low": 14750,
      "close": 14900,
      "volume": 5230000
    }
  ],
  "chart_indicators": {
    "ma": {
      "ma20": [14500, 14520, 14550],
      "ma75": [14200, 14210, 14220],
      "ma200": [13800, 13810, 13820]
    },
    "rsi": [45.2, 48.1, 52.3, 58.3],
    "bollinger": {
      "middle": [14550, 14580, 14600],
      "upper": [15100, 15130, 15150],
      "lower": [14000, 14030, 14050]
    },
    "ichimoku": {
      "tenkan": [14700, 14720, 14750],
      "kijun": [14500, 14510, 14520],
      "senkou_a": [14600, 14615, 14635],
      "senkou_b": [14400, 14405, 14410],
      "chikou": [14900, 14920, 14950]
    }
  }
}
```

#### GET /api/stocks/{code}/chart

銘柄のチャートデータのみを取得します。

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | path | 銘柄コード |
| `period` | query | チャート期間 |

**Response:**

```json
{
  "ticker": "6758.T",
  "period": "1mo",
  "data": [
    {
      "date": "2026-02-01",
      "open": 14800,
      "high": 14950,
      "low": 14750,
      "close": 14900,
      "volume": 5230000
    }
  ]
}
```

#### GET /api/stocks

銘柄の検索・一覧を取得します。

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | query | 検索クエリ（銘柄名 or コード） |
| `theme` | query | テーマIDでフィルタ |

**Response:**

```json
{
  "stocks": [
    {
      "code": "6758.T",
      "name": "ソニーグループ",
      "theme_id": "ai",
      "theme_name": "AI・人工知能"
    }
  ],
  "total": 1
}
```

#### POST /api/stocks/{code}/refresh

特定銘柄のデータを手動リフレッシュします。

**Response:**

```json
{
  "status": "success",
  "message": "Stock 6758.T refreshed",
  "elapsed_seconds": 2.1,
  "timestamp": "2026-03-01T09:30:00"
}
```

#### GET /api/nikkei225

日経225指数のデータを取得します。

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `1mo` | 期間 |

**Response:**

```json
{
  "name": "日経225",
  "ticker": "^N225",
  "period": "1mo",
  "price": 39500.25,
  "change_percent": 1.45,
  "change_percent_1d": 0.32,
  "sparkline": {
    "data": [38800, 39100, 38950, 39200, 39500],
    "period_start_index": 0
  }
}
```

#### GET /api/health

ヘルスチェックエンドポイント。

**Response:**

```json
{
  "status": "healthy",
  "version": "2.0.0",
  "precomputed_data": true,
  "last_update": "2026-03-01T09:30:00"
}
```

---

## Theme List

JP Theme Tracker は以下の20の投資テーマをトラッキングしています。各テーマは代表的な10銘柄で構成されています。

### 1. AI・人工知能 (ai)

AI技術の開発・活用を行う企業群。生成AI、機械学習、画像認識など幅広いAI技術をカバー。

**構成銘柄:**

| Code | Name | Description |
|------|------|-------------|
| 4063.T | 信越化学工業 | 半導体シリコンウェハー世界最大手。AIチップ製造に不可欠な高純度シリコンを供給 |
| 6861.T | キーエンス | FA用センサー・測定器最大手。工場自動化でAI技術を積極活用 |
| 6758.T | ソニーグループ | ゲーム・音楽・映画の総合エンタメ企業。AI画像認識技術でリード |
| 4751.T | サイバーエージェント | ネット広告・ゲーム大手。AIによる広告最適化・生成AIサービスを展開 |
| 6701.T | NEC | ITサービス大手。生成AI活用の業務システム開発に注力 |
| 9984.T | ソフトバンクグループ | 投資会社最大手。AI関連スタートアップへ積極投資 |
| 6098.T | リクルートホールディングス | 人材・販促情報サービス大手。AIマッチング技術を活用 |
| 4776.T | サイボウズ | グループウェア大手。kintoneでAI機能を強化中 |
| 3778.T | さくらインターネット | 国産クラウド最大手。GPU基盤でAI開発環境を提供 |
| 2158.T | FRONTEO | リーガルテック・AI解析。特許・訴訟データのAI分析に強み |

### 2. 半導体 (semiconductor)

半導体製造装置・関連企業群。世界的な半導体需要拡大の恩恵を受ける日本企業。

**構成銘柄:** 東京エレクトロン(8035.T)、アドバンテスト(6857.T)、レーザーテック(6920.T)、SCREENホールディングス(7735.T)、ディスコ(6146.T)、ルネサスエレクトロニクス(6723.T)、ローム(6963.T)、アルバック(6728.T)、ソシオネクスト(6526.T)、日本マイクロニクス(6871.T)

### 3. EV・電気自動車 (ev)

電気自動車および関連部品・インフラ企業群。EV 化の世界的潮流に乗る日本企業。

**構成銘柄:** トヨタ自動車(7203.T)、日産自動車(7201.T)、ホンダ(7267.T)、パナソニック(6752.T)、デンソー(6902.T)、日本電産(6594.T)、住友電気工業(5802.T)、豊田自動織機(6201.T)、三菱自動車(7211.T)、マツダ(7261.T)

### 4. 再生可能エネルギー (renewable-energy)

太陽光、風力、水素などの再生可能エネルギー関連企業群。カーボンニュートラルに向けた成長セクター。

**構成銘柄:** レノバ(9519.T)、エネオス(5020.T)、出光興産(5019.T)、東京ガス(9531.T)、関西電力(9503.T)、INPEX(1605.T)、日揮HD(1963.T)、三菱重工業(7011.T)、IHI(7013.T)、川崎重工業(7012.T)

### 5. 5G・通信 (5g-telecom)

5G通信インフラおよび通信サービス企業群。次世代通信の基盤を担う企業。

**構成銘柄:** NTT(9432.T)、KDDI(9433.T)、ソフトバンク(9434.T)、NEC(6701.T)、富士通(6702.T)、村田製作所(6981.T)、TDK(6762.T)、アンリツ(6754.T)、サイバーコム(3852.T)、アルチザネットワークス(6778.T)

### 6. DX・デジタル変革 (dx)

企業のデジタルトランスフォーメーションを支援する IT サービス・ソフトウェア企業群。

**構成銘柄:** 富士通(6702.T)、NTTデータグループ(9613.T)、オービック(4684.T)、SCSK(9719.T)、TIS(3626.T)、ラクス(3923.T)、マネーフォワード(3994.T)、freee(4478.T)、Sansan(4443.T)、サイボウズ(4776.T)

### 7. ヘルスケア・医療 (healthcare)

医薬品、医療機器、バイオテクノロジー企業群。高齢化社会で成長が期待されるセクター。

**構成銘柄:** 武田薬品工業(4502.T)、第一三共(4568.T)、中外製薬(4519.T)、エーザイ(4523.T)、アステラス製薬(4503.T)、テルモ(4543.T)、オリンパス(7733.T)、シスメックス(6869.T)、HOYA(7741.T)、ペプチドリーム(4587.T)

### 8. 金融・銀行 (finance)

メガバンク、証券、保険など金融セクター企業群。金利環境の変化に敏感なセクター。

**構成銘柄:** 三菱UFJフィナンシャル・グループ(8306.T)、三井住友フィナンシャルグループ(8316.T)、みずほフィナンシャルグループ(8411.T)、野村ホールディングス(8604.T)、大和証券グループ本社(8601.T)、東京海上ホールディングス(8766.T)、MS&ADインシュアランスグループ(8725.T)、SOMPOホールディングス(8630.T)、オリックス(8591.T)、SBIホールディングス(8473.T)

### 9. 不動産・REIT (real-estate)

不動産デベロッパー、REIT（不動産投資信託）関連企業群。

**構成銘柄:** 三井不動産(8801.T)、三菱地所(8802.T)、住友不動産(8830.T)、東急不動産HD(3289.T)、野村不動産HD(3231.T)、ヒューリック(3003.T)、東京建物(8804.T)、大京(8840.T)、レオパレス21(8848.T)、オープンハウスグループ(3288.T)

### 10. 小売・EC (retail-ec)

小売業およびeコマース企業群。消費トレンドの変化に対応する企業。

**構成銘柄:** ファーストリテイリング(9983.T)、セブン&アイ(3382.T)、イオン(8267.T)、ZOZO(3092.T)、メルカリ(4385.T)、楽天グループ(4755.T)、MonotaRO(3064.T)、ニトリHD(9843.T)、良品計画(7453.T)、パン・パシフィック・インターナショナルHD(7532.T)

### 11. 食品・飲料 (food-beverage)

食品メーカー、飲料メーカー企業群。ディフェンシブセクターとして安定した需要。

**構成銘柄:** 味の素(2802.T)、日清食品HD(2897.T)、キッコーマン(2801.T)、アサヒグループHD(2502.T)、キリンHD(2503.T)、サントリー食品インターナショナル(2587.T)、明治HD(2269.T)、ヤクルト本社(2267.T)、日本ハム(2282.T)、マルハニチロ(1333.T)

### 12. 化学・素材 (chemicals)

化学メーカー、素材メーカー企業群。半導体材料から日用品まで幅広い産業基盤。

**構成銘柄:** 三菱ケミカルグループ(4188.T)、住友化学(4005.T)、旭化成(3407.T)、東レ(3402.T)、花王(4452.T)、富士フイルムHD(4901.T)、日東電工(6988.T)、信越化学工業(4063.T)、AGC(5201.T)、ダイセル(4202.T)

### 13. 鉄鋼・非鉄 (steel-metals)

鉄鋼メーカー、非鉄金属メーカー企業群。景気循環に敏感なシクリカルセクター。

**構成銘柄:** 日本製鉄(5401.T)、JFEホールディングス(5411.T)、神戸製鋼所(5406.T)、住友金属鉱山(5713.T)、三菱マテリアル(5711.T)、DOWAホールディングス(5714.T)、フジクラ(5803.T)、古河電気工業(5801.T)、大同特殊鋼(5471.T)、UACJ(5741.T)

### 14. 機械・プラント (machinery)

産業機械、プラントエンジニアリング企業群。日本のものづくりの基盤。

**構成銘柄:** ファナック(6954.T)、コマツ(6301.T)、ダイキン工業(6367.T)、SMC(6273.T)、安川電機(6506.T)、クボタ(6326.T)、荏原製作所(6361.T)、DMG森精機(6141.T)、オークマ(6103.T)、THK(6481.T)

### 15. 建設・インフラ (construction)

建設業、インフラ整備企業群。公共投資やインフラ更新需要に対応。

**構成銘柄:** 大成建設(1801.T)、鹿島建設(1812.T)、清水建設(1803.T)、大林組(1802.T)、竹中工務店(1802.T)、NIPPO(1881.T)、前田建設工業(1824.T)、五洋建設(1893.T)、熊谷組(1861.T)、西松建設(1820.T)

### 16. 運輸・物流 (logistics)

陸運、海運、空運、物流企業群。グローバルサプライチェーンの要。

**構成銘柄:** 日本郵船(9101.T)、商船三井(9104.T)、川崎汽船(9107.T)、ANA HD(9202.T)、JAL(9201.T)、JR東日本(9020.T)、JR東海(9022.T)、JR西日本(9021.T)、ヤマトHD(9064.T)、SGホールディングス(9143.T)

### 17. 電力・ガス (utilities)

電力会社、ガス会社などユーティリティ企業群。ディフェンシブセクター。

**構成銘柄:** 東京電力HD(9501.T)、関西電力(9503.T)、中部電力(9502.T)、東北電力(9506.T)、九州電力(9508.T)、北海道電力(9509.T)、東京ガス(9531.T)、大阪ガス(9532.T)、中国電力(9504.T)、北陸電力(9505.T)

### 18. ゲーム・エンタメ (gaming-entertainment)

ゲーム開発・パブリッシャー、エンターテイメント企業群。日本が世界をリードするコンテンツ産業。

**構成銘柄:** 任天堂(7974.T)、ソニーグループ(6758.T)、バンダイナムコHD(7832.T)、スクウェア・エニックスHD(9684.T)、カプコン(9697.T)、コナミグループ(9766.T)、セガサミーHD(6460.T)、ネクソン(3659.T)、コーエーテクモHD(3635.T)、ディー・エヌ・エー(2432.T)

### 19. 観光・インバウンド (tourism-inbound)

観光関連、インバウンド需要を取り込む企業群。訪日外国人増加の恩恵を受けるセクター。

**構成銘柄:** OLC(オリエンタルランド)(4661.T)、エイチ・アイ・エス(9603.T)、星野リゾート・リート(3287.T)、JR東日本(9020.T)、JAL(9201.T)、ANAホールディングス(9202.T)、西武ホールディングス(9024.T)、共立メンテナンス(9616.T)、藤田観光(9722.T)、ロイヤルホテル(9713.T)

### 20. 防衛・宇宙 (defense-space)

防衛関連、宇宙開発企業群。安全保障環境の変化に伴い注目度が高まるセクター。

**構成銘柄:** 三菱重工業(7011.T)、川崎重工業(7012.T)、IHI(7013.T)、三菱電機(6503.T)、NEC(6701.T)、富士通(6702.T)、日本電気硝子(5214.T)、石川製作所(6208.T)、豊和工業(6203.T)、細谷火工(4274.T)

---

## Frontend Pages

### Page Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | テーマ一覧 | テーマ騰落率ランキング（メインページ） |
| `/heatmap` | ヒートマップ | 時価総額カテゴリ別ヒートマップ |
| `/heatmap/sector` | セクターヒートマップ | テーマ別ヒートマップ |
| `/stock/[code]` | 銘柄詳細 | 個別銘柄のチャート・テクニカル指標 |
| `/theme/[id]` | テーマ詳細 | テーマ内銘柄一覧・パフォーマンス |
| `/search` | 銘柄検索 | 銘柄名・コードで横断検索 |
| `/analytics` | アナリティクス | テーマランキング・概要統計 |
| `/compare` | テーマ比較 | 最大5テーマの期間別比較 |
| `/favorites` | お気に入り | ブックマーク銘柄一覧 |
| `/settings` | 設定 | アプリ設定（更新間隔、期間等） |
| `/about` | About | アプリ概要・技術スタック |

### API Route Handlers

| Route | Method | Description |
|-------|--------|-------------|
| `/api/themes` | GET | テーマデータのプロキシ |
| `/api/stocks` | GET | 銘柄検索のプロキシ |
| `/api/health` | GET | フロントエンド＋バックエンドのヘルスチェック |
| `/api/analytics` | GET | 期間別テーマ統計の集計 |
| `/api/export` | GET | テーマデータの JSON/CSV エクスポート |

---

## Components

### UI Components (`components/ui/`)

| Component | Description |
|-----------|-------------|
| `Modal` | モーダルダイアログ（ESC キーで閉じる） |
| `Toast` | 通知メッセージ（自動消去） |
| `Badge` | ステータスバッジ（5バリアント） |
| `Card` | 汎用カードコンポーネント |
| `EmptyState` | データなし状態の表示 |
| `ErrorBoundary` | エラーバウンダリ（クラスコンポーネント） |
| `SearchBar` | 検索入力フィールド |
| `Pagination` | ページネーション |
| `ConfirmDialog` | 確認ダイアログ |
| `LoadingSpinner` | ローディングスピナー（3サイズ） |
| `DataTable` | 汎用データテーブル（ジェネリック型対応） |
| `Tooltip` | ツールチップ |

### Chart Components (`components/charts/`)

| Component | Description |
|-----------|-------------|
| `PerformanceBar` | 騰落率バーチャート（正負対応） |
| `MiniChart` | ミニラインチャート（SVG） |
| `ReturnIndicator` | 騰落率テキスト表示（色分け） |
| `PieChart` | パイチャート（SVG） |

### Layout Components (`components/layout/`)

| Component | Description |
|-----------|-------------|
| `Footer` | フッター（ナビゲーションリンク） |
| `PageHeader` | ページヘッダー（タイトル + 説明 + アクション） |
| `Sidebar` | サイドバーナビゲーション |
| `Container` | レスポンシブコンテナ（4サイズ） |

### Feature Components (root `components/`)

| Component | Description |
|-----------|-------------|
| `Header` | グローバルヘッダー |
| `MarketHeader` | マーケット情報ヘッダー |
| `Nikkei225Card` | 日経225指数カード |
| `PeriodSelector` | 期間選択タブ |
| `Skeleton` | スケルトンローダー |
| `SlideMenu` | スライドメニュー |
| `Sparkline` | スパークラインチャート |
| `StockCard` | 銘柄カード |
| `StockChart` | ローソク足チャート（TradingView） |
| `StockTable` | 銘柄テーブル |
| `ThemeCard` | テーマカード |
| `TradingChart` | トレーディングチャート |

---

## Development Guide

### Project Structure

```
jp-theme-tracker-next/
├── backend/                    # FastAPI Backend
│   ├── main.py                # App entry point + lifespan + scheduler
│   ├── middleware.py          # Rate limiting + security headers
│   ├── pyproject.toml         # Ruff + pytest configuration
│   ├── requirements.txt       # Python dependencies
│   ├── data/
│   │   └── themes.py          # Theme definitions (20 themes x 10 stocks)
│   ├── jobs/
│   │   └── update_data.py     # Background data update jobs
│   ├── routers/
│   │   ├── themes.py          # Theme API endpoints
│   │   └── stocks.py          # Stock API endpoints
│   ├── services/
│   │   ├── calculator.py      # Financial calculations
│   │   └── data_fetcher.py    # yfinance integration + caching
│   ├── utils/
│   │   ├── cache.py           # In-memory cache
│   │   └── security.py        # Input validation + API key auth
│   ├── tests/                 # Backend tests (95 tests)
│   │   ├── test_calculator.py
│   │   ├── test_security.py
│   │   └── test_themes_data.py
│   └── precomputed/           # Generated JSON files (gitignored)
├── frontend/                  # Next.js Frontend
│   ├── app/                   # App Router pages (11 routes)
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Home (theme ranking)
│   │   ├── heatmap/           # Heatmap + sector heatmap
│   │   ├── stock/[code]/      # Stock detail
│   │   ├── theme/[id]/        # Theme detail
│   │   ├── search/            # Stock search
│   │   ├── analytics/         # Analytics dashboard
│   │   ├── compare/           # Theme comparison
│   │   ├── favorites/         # Bookmarked stocks
│   │   ├── settings/          # App settings
│   │   ├── about/             # About page
│   │   └── api/               # API route handlers (5 routes)
│   ├── components/            # React components (32 files)
│   │   ├── ui/                # UI primitives (12)
│   │   ├── charts/            # Chart components (4)
│   │   ├── layout/            # Layout components (4)
│   │   └── *.tsx              # Feature components (12)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities + API client + gamification
│   ├── stores/                # Zustand state management
│   ├── types/                 # TypeScript type definitions
│   └── public/                # Static assets + PWA manifest
├── .github/workflows/         # CI/CD (ci.yml + ai-code-reviewer.yml)
├── Dockerfile                 # Multi-stage Docker build
├── .env.example               # Environment variable template
├── start-all.bat              # Launch both servers (dynamic ports)
├── start-backend.bat          # Launch backend only
├── start-frontend.bat         # Launch frontend only
└── stop-all.bat               # Stop all servers
```

### Coding Conventions

#### Python (Backend)

- **Linter**: Ruff (configured in `backend/pyproject.toml`)
- **Style**: PEP 8 準拠、line length 120
- **Import order**: isort (Ruff integrated)
- **Type hints**: Python 3.10+ style (`str | None` instead of `Optional[str]`)
- **Docstrings**: 日本語 OK（関数の目的を記述）
- **Error handling**: `try/except` with logging
- **Requirement tracking**: `# req:REQ-XXX` コメントでトレーサビリティ確保

#### TypeScript (Frontend)

- **Linter**: ESLint (configured in `frontend/eslint.config.mjs`)
- **Formatter**: Prettier (configured in `frontend/.prettierrc`)
- **Style**: Single quotes, semicolons, trailing commas
- **Components**: Functional components with TypeScript interfaces
- **Data fetching**: SWR for client-side, `fetch` with `next/revalidate` for server-side
- **State management**: Zustand for global state, React state for local state

#### Git

- **Commit prefix**: `Claude:` for Claude Code commits, `Codex:` for Codex commits
- **Branch**: `main` (single branch development)
- **Hooks**: Husky pre-commit hook runs lint-staged

### Adding a New Theme

1. `backend/data/themes.py` の `THEMES` dict に新テーマを追加
2. 必須フィールド: `id`, `name`, `description`, `tickers` (10個), `ticker_names`, `ticker_descriptions`
3. サーバー再起動で自動的にプリコンピュートされます

### Adding a New API Endpoint

1. `backend/routers/themes.py` or `backend/routers/stocks.py` にルートを追加
2. 入力バリデーションは `backend/utils/security.py` の関数を使用
3. プリコンピュートが必要な場合は `backend/jobs/update_data.py` にジョブを追加
4. テストを `backend/tests/` に追加

### Adding a New Frontend Page

1. `frontend/app/{page-name}/page.tsx` を作成
2. App Router の規約に従う（`'use client'` directive for interactive pages）
3. API データは `frontend/lib/api.ts` の関数を使用
4. SlideMenu にナビゲーションリンクを追加

---

## Testing

### Backend Tests

```bash
cd backend

# 全テスト実行
python -m pytest tests/ -v

# 特定のテストファイル
python -m pytest tests/test_calculator.py -v

# カバレッジレポート
python -m pytest tests/ --cov=. --cov-report=term-missing
```

**テストスイート概要:**

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `test_calculator.py` | 29 | Calculator service の全関数 |
| `test_security.py` | 33 | Input validation, sanitization |
| `test_themes_data.py` | 33 | Theme data structure, lookups |
| **Total** | **95** | - |

### Frontend Tests

```bash
cd frontend

# ESLint チェック
npx eslint .

# TypeScript 型チェック
npx tsc --noEmit

# ビルド確認
npm run build
```

### Linting

```bash
# Backend (Ruff)
cd backend && python -m ruff check .

# Frontend (ESLint)
cd frontend && npx eslint .
```

---

## Deployment

### Render (Production)

本アプリケーションは Render でホスティングされています。

**Backend:**
- Service type: Web Service
- Runtime: Python 3.11
- Build command: `pip install -r backend/requirements.txt`
- Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Environment variables: `API_REFRESH_KEY`, `ALLOWED_ORIGINS`, `ENV=production`

**Frontend:**
- `.env.production` の `NEXT_PUBLIC_API_URL` を Render のバックエンド URL に設定
- Vercel またはその他のホスティングサービスにデプロイ

### Docker Deployment

```bash
# ビルド
docker build -t jp-theme-tracker .

# 実行
docker run -p 8000:8000 \
  -e API_REFRESH_KEY=your-key \
  -e ALLOWED_ORIGINS=https://your-frontend.com \
  -e ENV=production \
  jp-theme-tracker
```

### Manual Deployment

1. Python 3.11 環境をセットアップ
2. `pip install -r backend/requirements.txt`
3. `cd frontend && npm ci && npm run build`
4. `uvicorn backend.main:app --host 0.0.0.0 --port 8000`

---

## Troubleshooting

### Common Issues

#### バックエンドが起動しない

```
Error: ModuleNotFoundError: No module named 'fastapi'
```

**解決策:** 仮想環境が有効化されているか確認し、依存パッケージをインストールしてください。

```bash
.venv\Scripts\activate  # Windows
pip install -r backend/requirements.txt
```

#### yfinance のデータ取得エラー

```
Error: Failed to fetch stock data for 6758.T
```

**解決策:** yfinance はYahoo Finance APIに依存しています。以下を確認してください：
- インターネット接続が有効か
- 東京市場の営業時間外はデータが古い場合がある
- レート制限に達していないか（連続アクセスを控える）

#### ポート競合

```
Error: Address already in use
```

**解決策:** start.bat は自動的に空きポートを検出しますが、手動起動の場合は別のポートを指定してください：

```bash
uvicorn main:app --port 8001
```

#### フロントエンドのAPI接続エラー

```
Error: Failed to fetch themes
```

**解決策:**
1. バックエンドが起動しているか確認
2. `frontend/.env.local` の `NEXT_PUBLIC_API_URL` がバックエンドの URL と一致しているか確認
3. CORS 設定を確認（バックエンドの `ALLOWED_ORIGINS` にフロントエンドの URL が含まれているか）

#### プリコンピュートデータが生成されない

**解決策:**
1. `backend/precomputed/` ディレクトリが存在するか確認（自動生成されます）
2. 書き込み権限があるか確認
3. yfinance がデータを正常に取得できているかログを確認

#### PWA がインストールできない

**解決策:**
1. HTTPS でアクセスしているか確認（localhost は例外）
2. `frontend/public/manifest.json` が正しく配信されているか確認
3. Service Worker (`sw.js`) が登録されているかブラウザの DevTools で確認

---

## Performance

### Response Time Targets

| Endpoint | Target | Strategy |
|----------|--------|----------|
| GET /api/themes | < 100ms | Precomputed JSON |
| GET /api/themes/{id} | < 100ms | Precomputed JSON |
| GET /api/heatmap | < 200ms | Precomputed JSON |
| GET /api/stocks/{code} | < 500ms | JSON cache + calculation |
| POST /api/refresh | < 60s | Background processing |

### Optimization Techniques

1. **Precomputed Data**: APScheduler が5分ごとにデータを事前計算し、API はファイル読み取りのみ
2. **Three-Tier Cache**: プリコンピュート + メモリキャッシュ + JSON ファイルキャッシュ
3. **Parallel Fetching**: yfinance からのデータ取得を ThreadPoolExecutor で並列化（10-15 workers）
4. **SWR Client Cache**: フロントエンドで5分間の SWR キャッシュにより不要なリクエストを削減
5. **Stale Check**: サーバー起動時にデータの鮮度を確認し、1時間以内なら更新をスキップ
6. **Thread Lock**: バックグラウンド更新の並行実行を threading.Lock で防止

### Market Cap Classification Thresholds

| Category | Threshold (JPY) | Typical Count |
|----------|-----------------|---------------|
| Mega Cap | >= 10 trillion | 10-15 stocks |
| Large Cap | 1T - 10T | 30-40 stocks |
| Mid Cap | 300B - 1T | 50-60 stocks |
| Small Cap | 30B - 300B | 60-70 stocks |
| Micro Cap | < 30B | 10-20 stocks |

---

## Security

### Authentication

- **API Key**: データリフレッシュエンドポイント（`POST /api/refresh`）は `X-API-Key` ヘッダーによる認証が必要
- **環境変数**: API キーは `API_REFRESH_KEY` 環境変数で設定

### Input Validation

全ての API パラメータは厳格なバリデーションを通過します：

- **期間 (period)**: ホワイトリスト方式（`1d`, `5d`, `10d`, `1mo`, `3mo`, `6mo`, `1y` のみ許可）
- **銘柄コード (code)**: 正規表現パターンマッチ（`^\d{4}(\.T)?$`）
- **テーマID (theme_id)**: 英数字、ハイフン、アンダースコアのみ許可
- **ファイル名サニタイズ**: パストラバーサル攻撃防止のためスラッシュ、ダブルドット等を除去

### CORS (Cross-Origin Resource Sharing)

- **開発環境**: `http://localhost:3000` を許可
- **本番環境**: `ALLOWED_ORIGINS` 環境変数で指定されたオリジンのみ許可
- **メソッド**: `GET`, `POST`, `OPTIONS` のみ
- **ヘッダー**: `X-API-Key`, `Content-Type` のみ

### Rate Limiting

- **IP ベース**: クライアント IP ごとにリクエスト数を追跡
- **制限**: 60リクエスト/分（スライディングウィンドウ方式）
- **超過時**: HTTP 429 (Too Many Requests) + `Retry-After` ヘッダー

### Security Headers

全レスポンスに以下のセキュリティヘッダーを自動付与：

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Path Traversal Protection

- `safe_path_join()` 関数でファイルパスの安全性を検証
- ファイル名に含まれるスラッシュ、ダブルドット、特殊文字を除去
- 解決後のパスがベースディレクトリ内であることを確認

---

## Contributing

### Getting Started

1. リポジトリをフォーク
2. フィーチャーブランチを作成: `git checkout -b feature/your-feature`
3. 変更をコミット: `git commit -m "feat: add your feature"`
4. ブランチをプッシュ: `git push origin feature/your-feature`
5. Pull Request を作成

### Code Review

- AI Code Reviewer が自動的に PR をレビューします（`.github/workflows/ai-code-reviewer.yml`）
- CI パイプラインが lint + test + build を実行します

### Commit Message Format

```
<type>: <description>

Types:
- feat: 新機能
- fix: バグ修正
- chore: メンテナンス
- docs: ドキュメント
- refactor: リファクタリング
- test: テスト
- security: セキュリティ
```

---

## License

MIT License

Copyright (c) 2026 JP Theme Tracker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Changelog

### v2.0.0 (2026-03-01)

- **Architecture**: Precomputed data strategy with APScheduler for instant API responses
- **Features**: Theme comparison, stock search, analytics dashboard, favorites, settings
- **Quality**: ESLint + Prettier + Ruff + 95 backend tests + CI pipeline
- **Security**: Rate limiting middleware, CORS hardening, input validation, path traversal protection
- **DevOps**: Docker support, dynamic port allocation, Husky pre-commit hooks
- **Innovation**: PWA support, gamification system, rate limiting middleware
- **Organization**: Hooks, stores, types directories with proper implementations

### v1.0.0 (2026-01-15)

- Initial release
- 20 themes with 10 stocks each
- Theme ranking, heatmap, stock detail pages
- yfinance data integration
- PWA support (next-pwa)

### v0.1.0 (2026-01-01)

- Project scaffolding
- Basic FastAPI backend with theme API
- Next.js frontend with Tailwind CSS
