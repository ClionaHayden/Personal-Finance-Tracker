import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from main import app
from database import get_db
from tests.test_database import override_get_db, init_db
from uuid import uuid4

init_db()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def get_auth_headers():
    client.post("/auth/register", json={
        "email": "catuser@example.com",
        "password": "testpass123",
        "username": "catuser"
    })
    res = client.post("/auth/login", json={
        "email": "catuser@example.com",
        "password": "testpass123",
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_user():
    userTxt = f"User_{uuid4().hex[:6]}"
    res = client.post(
        "/users/",
        json={"username": userTxt, "email": "test@example.com", "password": "testpass123"}
    )
    print(res.json())
    assert res.status_code == 200
    data = res.json()
    assert "id" in data, res.text
    assert data["email"] == "test@example.com", res.text
    assert data["username"] == userTxt, res.text

def test_create_category():
    headers = get_auth_headers()
    res = client.post(
        "/categories/",
        json={"name": f"Utilities_{uuid4().hex[:6]}", "type": "expense"},
        headers=headers
    )
    assert res.status_code == 201, res.text
