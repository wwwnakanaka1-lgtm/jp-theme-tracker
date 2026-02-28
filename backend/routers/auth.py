"""Authentication router for user login, logout, and registration.

Provides token-based authentication endpoints. Tokens are issued
as opaque bearer strings and validated via in-memory store for
demonstration purposes.
"""

import hashlib
import logging
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory user store (demo only)
_users: dict[str, dict] = {}
_sessions: dict[str, dict] = {}

SESSION_TTL_HOURS = 24


class RegisterRequest(BaseModel):
    """Registration request payload."""
    username: str = Field(..., min_length=3, max_length=32)
    email: str = Field(..., pattern=r"^[\w.+-]+@[\w-]+\.[\w.]+$")
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    """Login request payload."""
    username: str
    password: str


class TokenResponse(BaseModel):
    """Token response returned after successful auth."""
    access_token: str
    token_type: str = "bearer"
    expires_at: str


def _hash_password(password: str) -> str:
    """Hash a password with SHA-256 for demo purposes."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


@router.post("/api/auth/register")
def register_user(body: RegisterRequest) -> dict:
    """Register a new user account.

    Validates uniqueness of username and email,
    then stores the user record.
    """
    if body.username in _users:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )
    for user in _users.values():
        if user["email"] == body.email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

    _users[body.username] = {
        "username": body.username,
        "email": body.email,
        "password_hash": _hash_password(body.password),
        "created_at": datetime.now().isoformat(),
    }
    logger.info(f"User registered: {body.username}")
    return {"status": "registered", "username": body.username}


@router.post("/api/auth/login", response_model=TokenResponse)
def login_user(body: LoginRequest) -> TokenResponse:
    """Authenticate user and issue an access token.

    Validates credentials and creates a session token
    with a configurable TTL.
    """
    user = _users.get(body.username)
    if not user or user["password_hash"] != _hash_password(body.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(hours=SESSION_TTL_HOURS)
    _sessions[token] = {
        "username": body.username,
        "expires_at": expires_at.isoformat(),
    }
    logger.info(f"User logged in: {body.username}")
    return TokenResponse(
        access_token=token,
        expires_at=expires_at.isoformat(),
    )


@router.post("/api/auth/logout")
def logout_user(token: Optional[str] = None) -> dict:
    """Invalidate the given session token.

    Removes the session from the in-memory store so
    subsequent requests with the same token are rejected.
    """
    if token and token in _sessions:
        username = _sessions[token]["username"]
        del _sessions[token]
        logger.info(f"User logged out: {username}")
        return {"status": "logged_out"}
    return {"status": "no_active_session"}
