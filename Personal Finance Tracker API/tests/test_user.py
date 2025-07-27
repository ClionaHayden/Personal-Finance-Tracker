import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from utils.auth_utils import get_current_user
from database import get_db
from tests.test_database import override_get_db, init_db
from fastapi.testclient import TestClient
from main import app

init_db()
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def get_auth_headers():
    register_res = client.post("/auth/register", json={
        "email": "txnuser@example.com",
        "password": "txnpass123",
        "username": "txnuser"
    })
    assert register_res.status_code in (200, 400), f"Register failed: {register_res.json()}"

    login_res = client.post("/auth/login", json={
        "email": "txnuser@example.com",
        "password": "txnpass123",
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.json()}"

    return {"Authorization": f"Bearer {login_res.json()['access_token']}"}

def test_update_user_profile():
    headers = get_auth_headers()
    res = client.put("/users/me", headers=headers, json={"username": "newuser"})
    assert res.status_code == 200
    assert res.json()["username"] == "newuser"
