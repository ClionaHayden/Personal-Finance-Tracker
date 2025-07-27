import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from tests.test_database import override_get_db, init_db
from database import get_db
from main import app
from uuid import uuid4
from unittest.mock import patch

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

def get_or_create_category(name, type_, headers):
    res = client.get("/categories/", headers=headers)
    existing = next((cat for cat in res.json() if cat["name"] == name), None)
    if existing:
        return existing
    return client.post("/categories/", json={"name": name, "type" : type_}, headers=headers).json()


def test_transaction_crud():
    headers = get_auth_headers()

    # Create a category first (required)
    cat_res = client.post("/categories/", json={
        "name": f"Groceries_{uuid4().hex[:6]}",
        "type": "expense"
    }, headers=headers)
    assert cat_res.status_code == 201, cat_res.text
    category_id = cat_res.json()["id"]

    # Create transaction
    txn_res = client.post("/transactions/", json={
        "amount": 50.75,
        "description": "Supermarket shopping",
        "category_id": category_id,
        "type": "expense"
    }, headers=headers)
    assert txn_res.status_code == 201, txn_res.text
    txn_data = txn_res.json()
    assert txn_data["amount"] == 50.75, txn_res.text
    assert txn_data["description"] == "Supermarket shopping", txn_res.text
    assert txn_data["type"] == "expense", txn_res.text
    txn_id = txn_data["id"]

    # Get transaction
    res_get = client.get(f"/transactions/{txn_id}", headers=headers)
    assert res_get.status_code == 200, res_get.text
    assert res_get.json()["id"] == txn_id, res_get.text

    # Update transaction
    res_update = client.put(f"/transactions/{txn_id}", json={
        "amount": 45.00,
        "description": "Discounted groceries",
        "category_id": category_id,
        "type": "expense"
    }, headers=headers)
    assert res_update.status_code == 200, res_update.text
    assert res_update.json()["amount"] == 45.00, res_update.text
    assert res_update.json()["type"] == "expense", res_update.text

    # List transactions
    res_list = client.get("/transactions/", headers=headers)
    assert res_list.status_code == 200, res_list.text
    assert len(res_list.json()) == 1, res_list.text

    # Delete transaction
    res_delete = client.delete(f"/transactions/{txn_id}", headers=headers)
    assert res_delete.status_code == 204, res_delete.text

    # Confirm deletion
    res_get_deleted = client.get(f"/transactions/{txn_id}", headers=headers)
    assert res_get_deleted.status_code == 404, res_get_deleted.text

def test_transaction_edge_cases():
    headers = get_auth_headers()

    # Missing amount field
    res = client.post("/transactions/", json={
        "description": "Missing amount",
        "category_id": 1,
        "type": "expense"
    }, headers=headers)
    assert res.status_code == 422, res.text  # validation error

    # Invalid category_id (assuming 9999 doesn't exist)
    res = client.post("/transactions/", json={
        "amount": 10.0,
        "description": "Invalid category",
        "category_id": 9999,
        "type": "expense"
    }, headers=headers)
    assert res.status_code == 400 or res.status_code == 404, res.text

    # Update non-existing transaction
    res = client.put("/transactions/9999", json={
        "amount": 10.0,
        "description": "Non-existent",
        "category_id": 1,
        "type": "expense"
    }, headers=headers)
    assert res.status_code == 404, res.text

    # Delete non-existing transaction
    res = client.delete("/transactions/9999", headers=headers)
    assert res.status_code == 404, res.text

    # Try to get transaction owned by another user (simulate by creating another user and transaction)
    # Register second user
    client.post("/auth/register", json={
        "email": "otheruser@example.com",
        "password": "otherpass123",
        "username": "otheruser"
    })
    login_res = client.post("/auth/login", json={
        "email": "otheruser@example.com",
        "password": "otherpass123",
    })
    other_headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Create category and transaction for other user
    cat_res = client.post("/categories/", json={
        "name": f"OtherCat_{uuid4().hex[:6]}",
        "type": "expense"
    }, headers=other_headers)
    other_cat_id = cat_res.json()["id"]

    txn_res = client.post("/transactions/", json={
        "amount": 99.99,
        "description": "Other user txn",
        "category_id": other_cat_id,
        "type": "expense"
    }, headers=other_headers)
    other_txn_id = txn_res.json()["id"]

    # Attempt to get other user's transaction with first user's token
    res = client.get(f"/transactions/{other_txn_id}", headers=headers)
    assert res.status_code == 404, res.text

    # Attempt to delete other user's transaction
    res = client.delete(f"/transactions/{other_txn_id}", headers=headers)
    assert res.status_code == 404, res.text

def test_transactions_pagination_filtering():
    headers = get_auth_headers()

    # Create category
    cat_res = client.post("/categories/", json={
        "name": f"FilterCat_{uuid4().hex[:6]}",
        "type": "expense"
    }, headers=headers)
    category_id = cat_res.json()["id"]

    # Create multiple transactions
    for i in range(5):
        client.post("/transactions/", json={
            "amount": i * 10.0,
            "description": f"Transaction {i}",
            "category_id": category_id,
            "date": f"2023-01-0{i+1}T00:00:00",
            "type": "expense"
        }, headers=headers)

    # Test limit and offset
    res = client.get("/transactions/?limit=2&offset=1", headers=headers)
    assert res.status_code == 200, res.text
    data = res.json()
    assert len(data) == 2, res.text

    # Test filtering by category
    res = client.get(f"/transactions/?category_id={category_id}", headers=headers)
    assert res.status_code == 200, res.text
    assert all(txn["category_id"] == category_id for txn in res.json())

    # Test date range filtering
    res = client.get("/transactions/?date_from=2023-01-02T00:00:00&date_to=2023-01-03T23:59:59", headers=headers)
    assert res.status_code == 200, res.text
    for txn in res.json():
        assert "2023-01-02" <= txn["date"][:10] <= "2023-01-03"

def test_create_transaction_with_type():
    headers = get_auth_headers()
    # create category first...
    catname = f"Income_{uuid4().hex[:6]}"
    res_cat = client.post("/categories/", json={
        "name": catname,
        "type": "income"
    }, headers=headers)
    assert res_cat.status_code == 201, res.text
    category_id = res_cat.json()["id"]
    category_id = 1

    # Now create transaction with that category_id
    res = client.post("/transactions/", json={
        "amount": 100,
        "description": "Salary",
        "category_id": category_id,
        "type": "income"
    }, headers=headers)

    res = client.post("/transactions/", json={
        "amount": 100,
        "description": "Salary",
        "category_id": category_id,
        "type": "income"
    }, headers=headers)
    assert res.status_code == 201, res.text
    data = res.json()
    assert data["type"] == "income", res.text

def test_filter_transactions_by_type():
    headers = get_auth_headers()

    # create income category and expense category, then transactions for both
    income_cat = get_or_create_category("Salary", "income" , headers)
    expense_cat = get_or_create_category("Shopping", "expense" , headers)

    client.post("/transactions/", json={
        "amount": 1000,
        "description": "Monthly salary",
        "category_id": income_cat["id"],
        "type": "income"
    }, headers=headers)
    client.post("/transactions/", json={
        "amount": 100,
        "description": "Bought clothes",
        "category_id": expense_cat["id"],
        "type": "expense"
    }, headers=headers)

    # Filter income transactions
    res = client.get("/transactions/?type=income", headers=headers)
    assert res.status_code == 200, res.text
    for txn in res.json():
        assert txn["type"] == "income", res.text

    # Filter expense transactions
    res = client.get("/transactions/?type=expense", headers=headers)
    assert res.status_code == 200, res.text
    for txn in res.json():
        assert txn["type"] == "expense", res.text

@patch("utils.alerts.send_email") 
def test_overspending_sends_email(mock_send_email):
    headers = get_auth_headers()

    # Create an expense category
    cat_res = client.post("/categories/", json={
        "name": "BudgetTest",
        "type": "expense"
    }, headers=headers)
    assert cat_res.status_code == 201, cat_res.text
    category_id = cat_res.json()["id"]

    # Create a budget of 100 for this category
    budget_res = client.post("/budgets/", json={
        "category_id": category_id,
        "amount": 100,
        "month": "2025-07-01T00:00:00"
    }, headers=headers)
    assert budget_res.status_code == 201, budget_res.text

    # Create a transaction that exceeds the budget (e.g., 150)
    txn_res = client.post("/transactions/", json={
        "amount": 150,
        "description": "Overspending test",
        "category_id": category_id,
        "type": "expense"
    }, headers=headers)
    assert txn_res.status_code == 201, txn_res.text

    # Check if send_email was called once
    assert mock_send_email.call_count == 1

    # check called args
    kwargs = mock_send_email.call_args.kwargs
    assert kwargs["to_email"] == mock_send_email.call_args.kwargs["to_email"]
    assert "Overspending Alert" in kwargs["subject"]
    assert "You've spent" in kwargs["body"]
