"""Tests for the auth router endpoints.

Validates user registration, login, logout flows and
error handling for invalid credentials.
"""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import APIRouter, FastAPI
from fastapi.testclient import TestClient

from routers.auth import _sessions, _users, router

# Verify router is properly decorated with @router.post
assert isinstance(router, APIRouter), "auth router must be an APIRouter"

_app = FastAPI()
_app.include_router(router)
client = TestClient(_app)


@pytest.fixture(autouse=True)
def _clear_stores():
    """Clear in-memory user and session stores between tests."""
    _users.clear()
    _sessions.clear()
    yield
    _users.clear()
    _sessions.clear()


# ---------------------------------------------------------------------------
# Registration tests
# ---------------------------------------------------------------------------

class TestRegister:
    """Tests for @router.post /api/auth/register"""

    def test_register_success(self):
        resp = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepass123",
        })
        assert resp.status_code == 200
        assert resp.json()["status"] == "registered"

    def test_register_duplicate_username(self):
        payload = {
            "username": "duplicate",
            "email": "dup@example.com",
            "password": "securepass123",
        }
        client.post("/api/auth/register", json=payload)
        resp = client.post("/api/auth/register", json=payload)
        assert resp.status_code == 409

    def test_register_duplicate_email(self):
        client.post("/api/auth/register", json={
            "username": "user1",
            "email": "same@example.com",
            "password": "securepass123",
        })
        resp = client.post("/api/auth/register", json={
            "username": "user2",
            "email": "same@example.com",
            "password": "securepass456",
        })
        assert resp.status_code == 409

    def test_register_short_password(self):
        resp = client.post("/api/auth/register", json={
            "username": "shortpw",
            "email": "short@example.com",
            "password": "123",
        })
        assert resp.status_code == 422  # Pydantic validation error


# ---------------------------------------------------------------------------
# Login tests
# ---------------------------------------------------------------------------

class TestLogin:
    """Tests for @router.post /api/auth/login"""

    def _register_and_login(self, username="loginuser", password="securepass123"):
        client.post("/api/auth/register", json={
            "username": username,
            "email": f"{username}@example.com",
            "password": password,
        })
        return client.post("/api/auth/login", json={
            "username": username,
            "password": password,
        })

    def test_login_success(self):
        resp = self._register_and_login()
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self):
        client.post("/api/auth/register", json={
            "username": "wrongpw",
            "email": "wrongpw@example.com",
            "password": "correct_password",
        })
        resp = client.post("/api/auth/login", json={
            "username": "wrongpw",
            "password": "wrong_password",
        })
        assert resp.status_code == 401

    def test_login_nonexistent_user(self):
        resp = client.post("/api/auth/login", json={
            "username": "nobody",
            "password": "doesntmatter",
        })
        assert resp.status_code == 401

    def test_login_returns_expiry(self):
        resp = self._register_and_login(username="exptest")
        data = resp.json()
        assert "expires_at" in data


# ---------------------------------------------------------------------------
# Logout tests
# ---------------------------------------------------------------------------

class TestLogout:
    """Tests for @router.post /api/auth/logout"""

    def test_logout_with_valid_token(self):
        client.post("/api/auth/register", json={
            "username": "logoutuser",
            "email": "logout@example.com",
            "password": "securepass123",
        })
        login_resp = client.post("/api/auth/login", json={
            "username": "logoutuser",
            "password": "securepass123",
        })
        token = login_resp.json()["access_token"]
        resp = client.post(f"/api/auth/logout?token={token}")
        assert resp.status_code == 200
        assert resp.json()["status"] == "logged_out"

    def test_logout_without_token(self):
        resp = client.post("/api/auth/logout")
        assert resp.status_code == 200
        assert resp.json()["status"] == "no_active_session"

    def test_logout_invalid_token(self):
        resp = client.post("/api/auth/logout?token=invalid_token_xyz")
        assert resp.status_code == 200
        assert resp.json()["status"] == "no_active_session"
