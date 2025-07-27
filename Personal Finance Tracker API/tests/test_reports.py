from fastapi.testclient import TestClient
from main import app
from database import get_db
from tests.test_database import override_get_db, init_db
from datetime import date, timedelta
from uuid import uuid4

init_db()
client = TestClient(app)
app.dependency_overrides[get_db] = override_get_db

def get_auth_headers():
    client.post("/auth/register", json={
        "email": "report@example.com",
        "password": "test1234",
        "username": "reportuser"
    })
    res = client.post("/auth/login", json={
        "email": "report@example.com",
        "password": "test1234"
    })
    return {"Authorization": f"Bearer {res.json()['access_token']}"}

def setup_data(headers):
    def get_or_create_category(name, type_):
        # Check if category already exists
        res = client.get("/categories/", headers=headers)
        existing = next((cat for cat in res.json() if cat["name"] == name and cat["type"] == type_), None)

        if existing:
            return existing

        # Otherwise, create it
        return client.post("/categories/", json={"name": name, "type": type_}, headers=headers).json()

    cat1 = get_or_create_category(f"Food_{uuid4().hex[:6]}", "expense")
    cat2 = get_or_create_category(f"Food_{uuid4().hex[:6]}", "income")

    today = date.today()
    last_month = today - timedelta(days=30)

    transactions = [
        {"amount": 100, "description": "Lunch", "category_id": cat1["id"], "date": str(today), "type": "expense"},
        {"amount": 2000, "description": "Job", "category_id": cat2["id"], "date": str(today), "type": "income"},
        {"amount": 50, "description": "Dinner", "category_id": cat1["id"], "date": str(last_month), "type": "expense"},
    ]

    for txn in transactions:
        client.post("/transactions/", json=txn, headers=headers)

def test_summary_report():
    headers = get_auth_headers()
    setup_data(headers)

    start = date.today().replace(day=1).isoformat() 
    res = client.get("/transactions/reports/summary", headers=headers, params={"start_date": start})
    assert res.status_code == 200, res.text
    data = res.json()
    assert "income" in data and "expense" in data and "net" in data
    assert data["income"] == 2000, res.text
    assert data["expense"] == 100, res.text
    assert data["net"] == 1900, res.text

def test_summary_date_filter():
    headers = get_auth_headers()
    setup_data(headers)
    now = date.today()
    start = now.replace(day=1).isoformat()

    res = client.get("/transactions/reports/summary", headers=headers, params={"start_date": start})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["expense"] == 100, res.text

def test_monthly_summary():
    headers = get_auth_headers()
    setup_data(headers)
    start = date.today().replace(day=1).isoformat() 
    res = client.get("/transactions/reports/monthly", headers=headers, params={"start_date": start})
    assert res.status_code == 200, res.text
    data = res.json()
    assert isinstance(data, dict), res.text
    assert any("income" in v and "expense" in v for v in data.values()), res.text

def test_category_breakdown_with_type_and_pagination():
    headers = get_auth_headers()
    setup_data(headers)
    start = date.today().replace(day=1).isoformat() 
    res = client.get(
    "/transactions/reports/by-category",
    headers=headers,
    params={"type": "expense", "limit": 1, "start_date": start}
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert "labels" in data and "totals" in data and "items" in data, res.text
    assert len(data["labels"]) == 1, res.text
    assert data["totals"][0] == 100, res.text

def test_report_category_limit():
    headers = get_auth_headers()
    setup_data(headers)

    start = date.today().replace(day=1).isoformat()  # Use current month start to match data

    res = client.get(
        "/transactions/reports/by-category",
        headers=headers,
        params={"type": "expense", "limit": 1, "start_date": start}
    )
    assert res.status_code == 200, res.text
    data = res.json()

    # Assert response keys
    assert "labels" in data and "totals" in data and "items" in data, res.text

    # Assert limit applied (only 1 label returned)
    assert len(data["labels"]) == 1, res.text
    # Assert total is as expected (should be >= 100, since you have a 100 and 50 expense)
    # but since limit=1, only the largest or first category appears
    assert data["totals"][0] >= 100, res.text

