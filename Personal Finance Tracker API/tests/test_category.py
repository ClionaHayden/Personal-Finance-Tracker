import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from uuid import uuid4
from tests.test_database import override_get_db,init_db
from database import get_db
from main import app

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

def test_create_list_update_delete_category():
    headers = get_auth_headers()

    catname = f"Food_{uuid4().hex[:6]}"
    # Create category
    res = client.post("/categories/", json={
        "name": catname,
        "type": "expense"
    }, headers=headers)
    assert res.status_code == 201, res.text 
    category_id = res.json()["id"]
    assert res.json()["name"] == catname, res.text 

    # Create duplicate category
    res_dup = client.post("/categories/", json={
        "name": catname,
        "type": "expense"
    }, headers=headers)
    assert res_dup.status_code == 400, res.text 

    # List categories
    res_list = client.get("/categories/", headers=headers)
    assert res_list.status_code == 200, res.text 
    assert len(res_list.json()) == 1, res.text 
    assert res_list.json()[0]["name"] == catname, res.text 

    catname = f"Groceries_{uuid4().hex[:6]}"
    # Update category
    res_update = client.put(f"/categories/{category_id}", json={
        "name": catname,
        "type": "expense"
    }, headers=headers)
    assert res_update.status_code == 200, res.text 
    assert res_update.json()["name"] == catname, res.text 

    # Delete category
    res_del = client.delete(f"/categories/{category_id}", headers=headers)
    assert res_del.status_code == 204, res.text 

    # Delete again (not found)
    res_del_again = client.delete(f"/categories/{category_id}", headers=headers)
    assert res_del_again.status_code == 404, res.text 
