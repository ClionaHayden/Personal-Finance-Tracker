import pytest
import time
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from tests.test_database import override_get_db, init_db
from database import get_db
from main import app


# Initialize test DB schema
init_db()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture
def registered_user_tokens():
    email = "user@example.com"
    username = "user"
    password = "password123"

    # Register user (ignore if already exists)
    res = client.post("/auth/register", json={
        "email": email,
        "username": username,
        "password": password
    })
    # It might 400 if user exists, ignore for now in test environment
    if res.status_code not in (200, 400):
        pytest.fail(f"Unexpected status during register: {res.status_code}")

    # Login user
    res = client.post("/auth/login", json={
        "email": email,
        "password": password
    })
    assert res.status_code == 200, res.text

    return res.json()  # contains access_token and refresh_token
    

def test_register_and_login():
    # Test user registration
    res = client.post("/auth/register", json={
        "email": "testuser@example.com",
        "password": "securepassword123",
        "username": "testuser"
    })
    assert res.status_code == 200, res.text 
    data = res.json()
    assert data["email"] == "testuser@example.com", res.text 
    assert "id" in data, res.text 

    # Test duplicate registration returns 400
    res_dup = client.post("/auth/register", json={
        "email": "testuser@example.com",
        "password": "securepassword123",
        "username": "testuser"
    })
    assert res_dup.status_code == 400, res_dup.text 

    # Test login with correct credentials
    res_login = client.post("/auth/login", json={
        "email": "testuser@example.com",
        "password": "securepassword123",
    })
    assert res_login.status_code == 200, res_login.text 
    token_data = res_login.json()
    assert "access_token" in token_data, res_login.text 
    assert token_data["token_type"] == "bearer", res_login.text 

    # Test login with wrong password
    res_wrong_pw = client.post("/auth/login", json={
        "email": "testuser@example.com",
        "password": "wrongpassword",
    })
    assert res_wrong_pw.status_code == 401, res_wrong_pw.text

def test_refresh_token(registered_user_tokens):
    refresh_token = registered_user_tokens["refresh_token"]

    # Use refresh token to get new access token
    response = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_refresh_token_invalid():
    # Use an invalid refresh token
    response = client.post("/auth/refresh", json={"refresh_token": "invalid.token.here"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid refresh token"

def test_get_current_user():
    # Register and log in
    client.post("/auth/register", json={
        "email": "me_test@example.com",
        "password": "securepassword123",
        "username": "metester"
    })
    login_res = client.post("/auth/login", json={
        "email": "me_test@example.com",
        "password": "securepassword123",
    })

    assert login_res.status_code == 200, login_res.text
    token = login_res.json()["access_token"]

    # Call /auth/me with Bearer token
    me_res = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )

    print("GET /auth/me status:", me_res.status_code)
    print("GET /auth/me body:", me_res.json())

    assert me_res.status_code == 200, me_res.text
    user_data = me_res.json()
    assert user_data["email"] == "me_test@example.com", me_res.text
    assert "id" in user_data, me_res.text

def test_refresh_token_rotation(registered_user_tokens, enable_limiter):
    # This test runs with rate limiting enabled

    # Step 1: Use valid refresh token
    refresh_token = registered_user_tokens["refresh_token"]
    response = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    new_refresh_token = data["refresh_token"]

    # Step 2: Try using the old refresh token again
    response_invalid = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert response_invalid.status_code == 401
    assert response_invalid.json()["detail"] == "Invalid refresh token"

    # Step 3: Use the new refresh token again to confirm it works
    response_valid = client.post("/auth/refresh", json={"refresh_token": new_refresh_token})
    assert response_valid.status_code == 200

def test_password_reset_request_and_confirm():
    # Register user first
    email = "resetuser@example.com"
    password = "oldpassword123"
    client.post("/auth/register", json={
        "email": email,
        "password": password,
        "username": "resetuser"
    })

    # Request password reset with registered email
    res = client.post("/auth/password-reset/request", json={"email": email})
    assert res.status_code == 200
    assert "reset_token" in res.json()
    reset_token = res.json()["reset_token"]

    # Request password reset with unregistered email (should still return 200)
    res2 = client.post("/auth/password-reset/request", json={"email": "notfound@example.com"})
    assert res2.status_code == 200

    # Confirm password reset with valid token and new password
    new_password = "newpassword456"
    res3 = client.post("/auth/password-reset/confirm", json={
        "token": reset_token,
        "new_password": new_password
    })
    assert res3.status_code == 200
    assert res3.json()["msg"] == "Password has been reset successfully"

    # Try to login with new password (should succeed)
    login_res = client.post("/auth/login", json={"email": email, "password": new_password})
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Confirm password reset with invalid token (should fail)
    invalid_token = "some.invalid.token"
    res4 = client.post("/auth/password-reset/confirm", json={
        "token": invalid_token,
        "new_password": "anything123"
    })
    assert res4.status_code == 400

def test_send_email_route():
    response = client.get("/auth/test-send-email")
    assert response.status_code == 200
    assert response.json() == {"message": "Test email sent"}

def test_password_reset_flow():
    email = "resetuser@example.com"
    old_password = "OldPass123"
    new_password = "NewPass456"

    # Step 1: Register user
    res = client.post("/auth/register", json={
        "email": email,
        "password": old_password,
        "username": "resetuser"
    })
    assert res.status_code in (200, 400)  # 400 = already exists

    # Step 2: Request password reset
    res = client.post("/auth/password-reset/request", json={"email": email})
    assert res.status_code == 200
    data = res.json()
    assert "reset_token" in data

    reset_token = data["reset_token"]

    # Step 3: Confirm password reset
    res = client.post("/auth/password-reset/confirm", json={
        "token": reset_token,
        "new_password": new_password
    })
    assert res.status_code == 200
    assert res.json()["msg"] == "Password has been reset successfully"

    # Step 4: Login with new password
    login_res = client.post("/auth/login", json={
        "email": email,
        "password": new_password
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()