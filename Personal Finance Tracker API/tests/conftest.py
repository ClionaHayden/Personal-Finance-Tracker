# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from slowapi.extension import Limiter
from main import app
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))  
from database import SessionLocal
from models import Category, Base
from .test_database import engine, init_db
from utils.limiter import limiter, limiter_limit_original, dummy_limit

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def headers(client):
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass"
    }

    # Register user
    reg_res = client.post("/auth/register", json=user_data)
    assert reg_res.status_code in (200, 201), reg_res.text

    # Login user — check if it expects form or JSON!
    login_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass"
    }
    login_res = client.post("/auth/login", json=login_data)
    print("Login response:", login_res.status_code, login_res.json())
    assert login_res.status_code == 200, login_res.text 

    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="session", autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

@pytest.fixture(autouse=True)
def clear_categories():
    yield
    session = SessionLocal()
    try:
        session.query(Category).delete()
        session.commit()
    finally:
        session.close()

@pytest.fixture(autouse=True)
def reset_db():
    init_db()

@pytest.fixture
def enable_limiter(monkeypatch):
    # Swap limiter.limit to real limiter for this test
    monkeypatch.setattr(limiter, "limit", limiter_limit_original)
    yield
    # After test ends, revert to dummy to disable limiter for others
    monkeypatch.setattr(limiter, "limit", dummy_limit)  # import dummy_limit or reassign if needed

