"""セキュリティユーティリティ

- 入力バリデーション
- API Key 認証
- パストラバーサル対策
"""
# req:REQ-019

import os
import re
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

# =============================================================================
# 定数定義
# =============================================================================

# 許可される期間値（ホワイトリスト）
VALID_PERIODS = frozenset(["1d", "5d", "10d", "1mo", "3mo", "6mo", "1y", "3y", "5y"])

# 銘柄コードの正規表現パターン（日本株: 4桁数字 + オプションで .T）
STOCK_CODE_PATTERN = re.compile(r"^[0-9]{4}(\.T)?$")

# テーマIDの正規表現パターン（英数字とハイフン、アンダースコアのみ）
THEME_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_-]+$")

# API Key ヘッダー
API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)


# =============================================================================
# バリデーション関数
# =============================================================================

def validate_period(period: str) -> str:
    """期間パラメータのバリデーション

    Args:
        period: 期間文字列

    Returns:
        検証済みの期間文字列

    Raises:
        HTTPException: 無効な期間の場合
    """
    if period not in VALID_PERIODS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid period: {period}. Valid values: {', '.join(sorted(VALID_PERIODS))}"
        )
    return period


def validate_stock_code(code: str) -> str:
    """銘柄コードのバリデーション

    Args:
        code: 銘柄コード（例: 7203 または 7203.T）

    Returns:
        正規化された銘柄コード（.T付き）

    Raises:
        HTTPException: 無効な銘柄コードの場合
    """
    # 前後の空白を除去
    code = code.strip()

    # パターンチェック
    if not STOCK_CODE_PATTERN.match(code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid stock code: {code}. Expected 4-digit number (e.g., 7203 or 7203.T)"
        )

    # .T が付いていなければ追加
    if not code.endswith(".T"):
        code = f"{code}.T"

    return code


def validate_theme_id(theme_id: str) -> str:
    """テーマIDのバリデーション

    Args:
        theme_id: テーマID

    Returns:
        検証済みのテーマID

    Raises:
        HTTPException: 無効なテーマIDの場合
    """
    if not THEME_ID_PATTERN.match(theme_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid theme_id: {theme_id}. Only alphanumeric, hyphen, and underscore allowed."
        )
    return theme_id


# =============================================================================
# パストラバーサル対策
# =============================================================================

def safe_path_join(base_dir: Path, *parts: str) -> Path:
    """安全なパス結合（パストラバーサル対策）

    Args:
        base_dir: ベースディレクトリ
        *parts: 結合するパス部分

    Returns:
        結合されたパス（base_dir配下であることを保証）

    Raises:
        HTTPException: パストラバーサル攻撃を検出した場合
    """
    # パスを結合
    target_path = base_dir.joinpath(*parts).resolve()
    base_resolved = base_dir.resolve()

    # base_dir 配下かチェック
    try:
        target_path.relative_to(base_resolved)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid path: path traversal detected"
        )

    return target_path


def sanitize_filename(filename: str) -> str:
    """ファイル名のサニタイズ

    Args:
        filename: ファイル名

    Returns:
        サニタイズされたファイル名
    """
    # 危険な文字を除去
    # パス区切り文字、NULL文字、制御文字を除去
    dangerous_chars = ['/', '\\', '\x00', '..', '<', '>', ':', '"', '|', '?', '*']

    result = filename
    for char in dangerous_chars:
        result = result.replace(char, '_')

    return result


# =============================================================================
# API Key 認証
# =============================================================================

def get_api_key() -> Optional[str]:
    """環境変数から API Key を取得"""
    return os.environ.get("API_REFRESH_KEY")


async def verify_api_key(api_key: Optional[str] = Security(API_KEY_HEADER)) -> str:
    """API Key の検証（更新系エンドポイント用）

    Args:
        api_key: リクエストヘッダーから取得した API Key

    Returns:
        検証済みの API Key

    Raises:
        HTTPException: API Key が無効または未設定の場合
    """
    expected_key = get_api_key()

    # 環境変数が未設定の場合はエラー
    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="API key not configured on server"
        )

    # API Key が未提供の場合
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required. Set X-API-Key header."
        )

    # API Key が一致しない場合
    if api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key"
        )

    return api_key
