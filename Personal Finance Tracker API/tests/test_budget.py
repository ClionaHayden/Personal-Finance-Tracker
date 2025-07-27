import pytest
from fastapi.testclient import TestClient
from main import app
from models import Budget
from tests.test_database import override_get_db,init_db
from database import get_db
from datetime import date
from sqlalchemy.orm import Session

init_db()
app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture
def auth_headers(create_test_user):
    """Assumes helper that registers/logs in and returns Auth header"""
    return create_test_user("test@example.com", "password")

@pytest.fixture
def create_test_user():
    def _create(email, password):
        # Register
        client.post("/auth/register", json={"email": email, "password": password, "username": email.split("@")[0]})

        # Login
        response = client.post("/auth/login", json={
            "email": email,
            "password": password
        })

        print("Login status:", response.status_code)
        print("Login response:", response.json()) 

        assert response.status_code == 200, "Login failed"

        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    return _create

def test_create_budget(auth_headers):
    payload = {
        "category_id": 1,  # Assumes category exists for this test user
        "amount": 500.0,
        "month": str(date.today().replace(day=1)),
    }

    response = client.post("/budgets/", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 500.0
    assert data["category_id"] == 1

def test_get_budgets(auth_headers):
    response = client.get("/budgets/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_update_budget(auth_headers):
    # First create one
    create_resp = client.post("/budgets/", json={
        "category_id": 1,
        "amount": 300.0,
        "month": str(date.today().replace(day=1)),
    }, headers=auth_headers)
    budget_id = create_resp.json()["id"]

    # Now update
    update_resp = client.put(f"/budgets/{budget_id}", json={
        "category_id": 1,
        "amount": 750.0,
        "month": str(date.today().replace(day=1)),
    }, headers=auth_headers)

    assert update_resp.status_code == 200
    assert update_resp.json()["amount"] == 750.0

def test_delete_budget(auth_headers):
    create_resp = client.post("/budgets/", json={
        "category_id": 1,
        "amount": 200.0,
        "month": str(date.today().replace(day=1)),
    }, headers=auth_headers)
    budget_id = create_resp.json()["id"]

    delete_resp = client.delete(f"/budgets/{budget_id}", headers=auth_headers)
    assert delete_resp.status_code == 200

    # Confirm deletion
    get_resp = client.get("/budgets/", headers=auth_headers)
    assert all(b["id"] != budget_id for b in get_resp.json())
